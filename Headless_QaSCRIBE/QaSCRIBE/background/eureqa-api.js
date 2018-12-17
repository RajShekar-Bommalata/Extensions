/* 
 ********************* EureQa SaaS commands *********************
 */
	var commandResponse = makeAjaxCall({
		command: _command,
		target: _target,
		value: _value
	});
	/*parse the ajax response into JSON*/
	commandResponse = JSON.parse(commandResponse);
	//check command status from ajax response
	if (commandResponse.data.resultText == "Pass") {
		/*store result in a variable  - storedVars - background script*/
		storedVars[_value] = commandResponse.data.result;

		/*/store result in a variable  - storedVars - content script*/
		return browser.runtime.sendMessage({"storeStr": commandResponse.data.result,"storeVar": _value}).then(function () {
			return Promise.resolve();
		});		
	} else {
		/*send error text*/
		resolve({result: commandResponse.data.errorText}); 
	}



