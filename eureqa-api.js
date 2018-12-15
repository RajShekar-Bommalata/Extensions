/* 
 ********************* EureQa SaaS commands ********************* 
 ********************* 16-NOV-2018 ********************* 
 */

Selenium.prototype.makeAjaxCall = function (inputData) {
	return new Promise(function (resolve, reject) {
		$.ajax({
			//url: "https://www.eureqatest.dev/eureQaRestApi/api/CommandsApi/GetCommand",
			url: "http://192.168.0.46:8898/eureQaRestApi/api/CommandsApi/GetCommand",
			type: "POST",
			headers: base64EncryptedCredentials,
			cache: true,
			data: JSON.stringify(inputData),
			contentType: "application/json",
			dataType: 'json'
		}).done(function (data) {
			/* if(data.data.resultText == "Pass"){
				resolve({result: "success"});
			}else{
				resolve({result: data.data.errorText});
			} */
			resolve({
				result: data
			});

		}).fail(function (xhr) {
			console.log('error', xhr);
			reject({
				result: "fail"
			});
		});
	});
};

Selenium.prototype.doJsonCompare = function (_command, _target, _value) {
	var commandResponse = this.makeAjaxCall({
		command: _command,
		target: _target,
		value: _value
	});
	//parse the ajax response into JSON
	commandResponse = JSON.parse(commandResponse);
	//check command status from ajax response
	if (commandResponse.data.resultText == "Pass") {
		//store result in a variable  - storedVars - background script
		storedVars[_value] = commandResponse.data.result;

		//store result in a variable  - storedVars - content script
		return browser.runtime.sendMessage({"storeStr": commandResponse.data.result,"storeVar": _value}).then(function () {
			return Promise.resolve();
		});		
	} else {
		//send error text
		resolve({result: commandResponse.data.errorText}); 
	}
};



