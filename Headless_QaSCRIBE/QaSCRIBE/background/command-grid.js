function setColor(index, state, conditionalCommandIndex, errorText) {
    if (typeof(index) !== "string") {

        var messageObject = {
            responseType: "QaSCRIBE_Instruction_Status",
            responseObject: [] 
        };

        console.log(index, scriptDetails.instructionList[index-1].command, state, Date.now(), conditionalCommandIndex);

        if(index == 1 && state == 1171){
            messageObject.responseObject.push({
                instructionInfo: scriptDetails.instructionList[index-1],
                instructionStatus: state,
                executionStartDateTime: Date.now()
            });
        }else if(state !== 1171){
            messageObject.responseObject.push({
                instructionInfo: scriptDetails.instructionList[index-1],
                instructionStatus: state,
                locatorInfo: {
                    locatorSequence: currentPlayingLocatorIndex + 1,
                    locatorFailedStatus: locatorFailed,
                    locatorExecutionStartDateTime: locatorExecutionStartTime,
                    locatorExecutionEndDateTime: Date.now()
                },
                executionEndDateTime: Date.now(),
                errorText: errorText
            });
            
            if(conditionalCommandIndex > index){
                for(i = index; i < conditionalCommandIndex; i++){
                    messageObject.responseObject.push({
                        instructionInfo: scriptDetails.instructionList[i],
                        instructionStatus: 1173,
                        executionStartDateTime: Date.now(),
                        executionEndDateTime: Date.now()
                    });
                }

                messageObject.responseObject.push({
                    instructionInfo: scriptDetails.instructionList[conditionalCommandIndex],
                    instructionStatus: 1171,
                    executionStartDateTime: Date.now()
                });
            }else if(caseFailed){
                for(i = index; i < scriptDetails.instructionList.length; i++){
                    messageObject.responseObject.push({
                        instructionInfo: scriptDetails.instructionList[i],
                        instructionStatus: 1173,
                        executionStartDateTime: Date.now(),
                        executionEndDateTime: Date.now()
                    });
                }
            }else if(scriptDetails.instructionList.length !== index && state != 1177){
                messageObject.responseObject.push({
                    instructionInfo: scriptDetails.instructionList[index],
                    instructionStatus: 1171,
                    executionStartDateTime: Date.now()
                });
            }
        }

        /* if(state == 1174){
            var instruction = scriptDetails.instructionList[index-1];
            if(instruction.command.indexOf('store')!=-1){
                messageObject["storeVariable"] = storedVars[instruction.value];
            }
        } */

        if(messageObject.responseObject.length>0){
            browser.tabs.sendMessage(senderData.tab.id, messageObject);
        }
    }
}

var testscriptData = [];

function addCommand(command_name, command_target_array, command_value, target_update, insertBeforeLastCommand) {
    console.log("Target", command_target_array);
    testscriptData.push({
        commandInstructionId: testscriptData.length+1,
        command: command_name,
        target: command_target_array[0].value,
        locatorsList: command_target_array,
        commentedInstructionIndicator: false,
        ddAttributeForTarget: '',
        targetUserDefinedVariableName: '',
        targetUserDefinedVariableType: '',
        targetUserDefinedVariableNameIcon: '',
        targetEncryptedIndicator: false,
        targetSystemDefinedVariableName: '',
        systemTargetVariableIcon: '',
        targetEncryptionImage: '',
        ddAttributeForTargetIcon: '',
        value: command_value,
        ddAttributeForValue: '',
        valueUserDefinedVariableName: '',
        valueUserDefinedVariableType: '',
        userValueVariableIcon: '',
        valueEncryptedIndicator: false,
        valueSystemDefinedVariableName: '',
        systemValueVariableIcon: '',
        valueEncryptionImage: '',
        ddAttributeForValueIcon: '',
        userNotes: '',
        bindTo: '',
        fileBindingIcon: '',
        type: 'instruction',
        lID: makeid(),
        uID: generateUUID()
    });
    /* browser.tabs.query({url: "https://localhost/HTML/eureqa-qascribe/eureqa/recordScript.htm"}).then(function(tabs) {
        console.log(tabs);
        $.each(tabs, function(index, item){
            if(item.url.match(/recordScript.htm/g)){
                senderData = {tab: item}; */
                var instructionData = testscriptData[testscriptData.length-1];
                instructionData["responseType"] = (target_update ? "QaSCRIBE_Instruction_Update" : "QaSCRIBE_Instruction_Record");
                instructionData["insertBeforeLastCommand"] = insertBeforeLastCommand;
                browser.tabs.sendMessage(
                    senderData.tab.id,
                    instructionData
                );
           /*  }
        });  
    }); */
}

/**
 * This function is used to generate unique alphanumeric id with length 5.
 * @returns {string}
 */
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}

/**
 * This helps in generating unique UUID number for the parameter passed to this method.
 * <br/>Usage: <b><span style="color:#2969ae">eureqa.uuid();</span></b>
 * @returns {string}
 */
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxxxxxxxxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};