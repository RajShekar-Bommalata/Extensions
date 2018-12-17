$( function() {
	/* Displaying version on the component heading */
	$("#version_container>#version").text(browser.runtime.getManifest().version);

	/* Displaying Beta ribbon based on beta keyword in Extension name */
	if(((browser.runtime.getManifest().name).toLowerCase()).indexOf("beta") > -1){
		$("#beta_ribbon").show();
	}
});

function resetComponentData(){
	if (isRecording) {
		recorder.detach();
		return browser.tabs.query({windowId: extCommand.getContentWindowId(), url: "<all_urls>"})
		.then(function(tabs) {
			for(let tab of tabs) {
				browser.tabs.sendMessage(tab.id, {detachRecorder: true});
			}
		});
	}
	if (isPlaying) {
		stop(true);
		
		browser.tabs.sendMessage(
            senderData.tab.id,
            {
				responseType: "QaSCRIBE_Instruction_Status",
				responseObject: [{
					instructionInfo: scriptDetails.instructionList[conditionalCommandIndex],
					instructionStatus: 1171,
					executionStartDateTime: Date.now()
				}] 
			},
        );
		
		browser.tabs.sendMessage(
            senderData.tab.id,
            {
                responseType:"QaSCRIBE_Execution_Status",
                executionStartTime: executionStartTime,
                executionEndTime: Date.now(), 
                executionStatus: 1175,
                errorMessage: "The browser tab/window within which the AUT is loaded and used for the current execution is unreachable or closed."
            },
        );
	}
	senderData = {};
	scriptDetails = {};
	testscriptData = [];
	isRecording = false;
	isSelecting = false; 
	isPause = false
}

var isExecuteOnSpecificTab = false;
var base64EncryptedCredentials = {};

browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.sender){

		if(request.sender == "qascribeActions"){
			senderData = sender;

			contentWindowIdListener({
				selfWindowId: sender.tab.id,
				commWindowId: sender.tab.windowId
			});
			
			if(request.action == "startExecution"){
				console.log("Data:::", request.data);
				var requestData = request.data;
				scriptDetails = requestData.scriptData;
				isExecuteOnSpecificTab = false;
				base64EncryptedCredentials = requestData.credentials;

				if(requestData.isTestScriptMode){
					return browser.tabs.update(parseInt(requestData.selectedTabToExecute), {
						active: true
					}).then(function(){
						isExecuteOnSpecificTab = true;
						recorder.detach();
						play(true);
						return Promise.resolve();
					}).catch(function(){
						return browser.tabs.create({
							url: browser.runtime.getURL("/panel/bootstrap.html")
						}).then(function (window) {
							recorder.detach();
							play(true);
							return Promise.resolve();
						});
					});
				}else{
					if(requestData.currentSelectedScriptIndex == 0){
						return browser.tabs.create({
							url: browser.runtime.getURL("/panel/bootstrap.html")
						}).then(function (window) {
							recorder.detach();
							playSuite(requestData.currentSelectedScriptIndex, requestData.totalScriptsLength);
							return Promise.resolve();
						});	
					}else{
						playSuite(requestData.currentSelectedScriptIndex, requestData.totalScriptsLength);
						return Promise.resolve();
					}
				}
			}else if(request.action == "stopExecution"){
				stop();
				return Promise.resolve();
			}else if(request.action == "pauseContinueExecution"){
				if (isPlaying && !isPause) {
					pause();
				}
				else {
					resume();
				}
				return Promise.resolve();
			}else if(request.action == "startStopRecording"){
				isRecording = !isRecording;
				if (isRecording) {
					testscriptData = request.scriptData;
					recorder.attach();
					return browser.tabs.query({windowId: extCommand.getContentWindowId(), url: "<all_urls>"})
					.then(function(tabs) {
						for(let tab of tabs) {
							if(tab.id != senderData.tab.id){
								browser.tabs.sendMessage(tab.id, {attachRecorder: true});
							}
						}
						return Promise.resolve();
					});
				}
				else {
					testscriptData = [];
					recorder.detach();
					return browser.tabs.query({windowId: extCommand.getContentWindowId(), url: "<all_urls>"})
					.then(function(tabs) {
						for(let tab of tabs) {
							if(tab.id != senderData.tab.id){
								browser.tabs.sendMessage(tab.id, {detachRecorder: true});
							}
						}
						return Promise.resolve();
					});
				}
			}else if(request.action == "GET_TAB_DETAILS"){
				return browser.tabs.query({windowId: extCommand.getContentWindowId(), url: "<all_urls>"})
				.then(function(tabs) {
					return Promise.resolve({type: ((request.actionType == 'execute') ? "EXECUTE_TAB_DETAILS" : "SELECT_FIND_TAB_DETAILS"), data: {
						tabsList: _.reject(tabs, function(item){ return item.id == sender.tab.id}),
						actionType: request.actionType
					}});
				});
			}else if(request.action == "selectCancelElement"){
				return browser.tabs.update(parseInt(request.data.tabId), {
					active: !isSelecting
				}).then(function(){
					if (isSelecting) {
						isSelecting = false; 
						browser.tabs.sendMessage(parseInt(request.data.tabId), {selectMode: true, selecting: false});
						return Promise.resolve();
					}
			
					isSelecting = true;
					if (isRecording){
						stop();
					}
					browser.tabs.sendMessage(parseInt(request.data.tabId), {selectMode: true, selecting: true}); 
					return Promise.resolve();
				});
			}else if(request.action == "findElement"){
				try{
					return browser.tabs.update(parseInt(request.data.tabId), {
						active: true
					}).then(function(){
						return browser.webNavigation.getAllFrames({tabId: parseInt(request.data.tabId)})
							.then(function(framesInfo){
								var frameIds = [];
								for (let i = 0; i < framesInfo.length; i++) {
									frameIds.push(framesInfo[i].frameId)
								}
								frameIds.sort();
								var infos = {
									"index": 0,
									"tabId": parseInt(request.data.tabId),
									"frameIds": frameIds,
									"targetValue": request.data.target
								};
								sendShowElementMessage(infos);
								return Promise.resolve();
							});
					});
				} catch (e) {
					console.error(e);
				}
			}
		}
	}
});

/* Reset Component if the Execution/Edit Test script page reloaded while recording/execution is in progress */
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab){
	if(senderData.tab && senderData.tab.id == tabId){
		if(changeInfo.status && changeInfo.status == "loading" && (isRecording || isPlaying)){
			resetComponentData();
		}
	}
});

/* Reset Component if the AUT is closed while execution is in progress */
browser.tabs.onRemoved.addListener(function (tabId, changeInfo, tab){
	if(isPlaying && extCommand.getCurrentPlayingTabId() == tabId){
		resetComponentData();
	}
});

/* Modify error messages to display in component log */
function modifyErrorLogMessage(str){
	try{
		function valiadteStr(_string){
			return _string.indexOf("did not match") != -1;
		}

		var errorLogMessage = "";
		if(currentExecutingCommand.match(/Present/) != null){
			if(currentExecutingCommand.match(/Text/)!=null){
				if(currentExecutingCommand.match(/Not/) == null){
					if(valiadteStr(str)){
						errorLogMessage = "Text is not present";
					}else{
						errorLogMessage = "Text did not found";
					} 
				}else{
					if(valiadteStr(str)){
						errorLogMessage = "Text is present";
					}else{
						errorLogMessage = "Text did not found";
					} 
				}
			}else if(currentExecutingCommand.match(/Element/)!=null){
				if(currentExecutingCommand.match(/Not/) == null){
					if(valiadteStr(str)){
						errorLogMessage = "Element is not present";
					}else{
						errorLogMessage = str;
					} 
				}else{
					if(valiadteStr(str)){
						errorLogMessage = "Element is present";
					}else{
						errorLogMessage = str;
					} 
				}
			}else{
				if(currentExecutingCommand.match(/Alert/)!=null){
					if(currentExecutingCommand.match(/Not/) == null){
						if(valiadteStr(str)){
							errorLogMessage = "No Alerts found";
						}else{
							errorLogMessage = str;
						} 
					}else{
						if(valiadteStr(str)){
							errorLogMessage = "Alert is present";
						}else{
							errorLogMessage = str;
						} 
					}
				}else if(_exeCommand.command.match(/Confirmation/)!=null){
					if(currentExecutingCommand.match(/Not/) == null){
						if(valiadteStr(str)){
							errorLogMessage = "No Confirmations found";
						}else{
							errorLogMessage = str;
						} 
					}else{
						if(valiadteStr(str)){
							errorLogMessage = "Confirmation is present";
						}else{
							errorLogMessage = str;
						} 
					}
				}else if(_exeCommand.command.match(/Prompt/)!=null){
					if(currentExecutingCommand.match(/Not/) == null){
						if(valiadteStr(str)){
							errorLogMessage = "No Prompts found";
						}else{
							errorLogMessage = str;
						} 
					}else{
						if(valiadteStr(str)){
							errorLogMessage = "Prompt is present";
						}else{
							errorLogMessage = str;
						} 
					}
				}
			} 
		}else if(currentExecutingCommand.match(/Visible/) != null){
			if(currentExecutingCommand.match(/Not/) == null){
				if(valiadteStr(str)){
					errorLogMessage = "Element is not visible";
				}else{
					errorLogMessage = str;
				} 
			}else{
				if(valiadteStr(str)){
					errorLogMessage = "Element is visible";
				}else{
					errorLogMessage = str;
				} 
			}
		}else if(currentExecutingCommand.match(/Checked/) != null){
			if(currentExecutingCommand.match(/Not/) == null){
				if(valiadteStr(str)){
					errorLogMessage = "Element is not checked";
				}else{
					errorLogMessage = str;
				} 
			}else{
				if(valiadteStr(str)){
					errorLogMessage = "Element is checked";
				}else{
					errorLogMessage = str;
				} 
			}
		}else if(currentExecutingCommand.match(/Editable/) != null){
			if(currentExecutingCommand.match(/Not/) == null){
				if(valiadteStr(str)){
					errorLogMessage = "Element is not editable";
				}else{
					errorLogMessage = str;
				} 
			}else{
				if(valiadteStr(str)){
					errorLogMessage = "Element is editable";
				}else{
					errorLogMessage = str;
				} 
			}
		}else{
			errorLogMessage = str; 
		}
		return errorLogMessage;
	}catch(e){
		return str;
	}
}


/*Service to get eureQa Commands*/

function makeAjaxPostCall(inputData) {
	return new Promise(function (resolve, reject) {
	  $.ajax({
		url: "http://192.168.0.46:8898/eureQaRestApi/api/CommandsApi/GetCommand",
		//url: "https://www.eureqatest.dev/eureQaRestApi/api/CommandsApi/GetCommand",
		type: "POST",
		headers: "a3N5YW1hbGE6dHJpcG9kMTIz",
		cache: true,
		data: JSON.stringify(inputData),
		contentType: "application/json",
		dataType: 'json'
	  }).done(function (data) {
		console.log(data);
		
	  }).fail(function (xhr) {
		console.log('error', xhr);
	  });
	});
  }