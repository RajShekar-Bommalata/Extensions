/*
 * Copyright 2017 SideeX committers
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
var currentPlayingCommandIndex = -1;

var currentTestCaseId = "";
var isPause = false;
var pauseValue = null;
var isPlayingSuite = false;
var isPlayingAll = false;
var selectTabId = null;
var isSelecting = false;

var commandType = "";
var pageCount = 0;
var pageTime = "";
var ajaxCount = 0;
var ajaxTime = "";
var domCount = 0;
var domTime = "";
var implicitCount = 0;
var implicitTime = "";

var caseFailed = false;
var extCommand = new ExtCommand();
var selenium = new Selenium();
var defaultTimeout = -1;
var defaultSpeedInterval = 0;
var testCase = '';
var currentExecutingCommand = "";

var locatorFailed = false;
var currentPlayinglocatorIndex = -1;
var previousBreakpointIndex = -1;
var currentPlayingScriptIndex = -1;
var alreadyOneOfTheCommandExecuted = false;

var executionStartTime = 0;
var locatorExecutionStartTime = 0;

var executionLog = "";

// TODO: move to another file
window.onload = function() {
   
    /* var stopButton = document.getElementById("stop");
    var pauseButton = document.getElementById("pause");
    var resumeButton = document.getElementById("resume");
    var playSuiteButton = document.getElementById("playSuite");
    var showElementButton = document.getElementById("showElementButton")
    var selectElementButton = document.getElementById("selectElementButton");
    var suitePlus = document.getElementById("suite-plus");
    var suiteOpen = document.getElementById("suite-open");
    var logContainer=document.getElementById("logcontainer");

    playSuiteButton.addEventListener("click", function() {
        emptyNode(document.getElementById("logcontainer"));
        document.getElementById("result-runs").textContent = "0";
        document.getElementById("result-failures").textContent = "0";
        recorder.detach();
        initAllSuite();
        playSuite(0);
    }); */
    /**
     * eureQa team commented code 
     */
    /* playSuitesButton.addEventListener("click", function() {
        emptyNode(document.getElementById("logcontainer"));
        document.getElementById("result-runs").textContent = "0";
        document.getElementById("result-failures").textContent = "0";
        recorder.detach();
        initAllSuite();
        playSuites(0);
    }); */
};

function checkDefaultTimeout(){
    if(this.defaultTimeout != -1)
        return this.defaultTimeout;
    else
        return 30000;
}

function doPreparation() {
    if (!isPlaying) {
        currentPlayingCommandIndex--;
        return Promise.reject("shutdown");
    }
    return extCommand.sendMessage("waitPreparation", "", "")
        .then(function() {
            return true;
        })
}


function doPrePageWait() {
    if (!isPlaying) {
        currentPlayingCommandIndex--;
        return Promise.reject("shutdown");
    }
    return extCommand.sendMessage("prePageWait", "", "")
       .then(function(response) {
           if (response && response.new_page) {
               return doPrePageWait();
           } else {
               return true;
           }
       })
}

function doPageWait() {
    if (!isPlaying) {
        currentPlayingCommandIndex--;
        return Promise.reject("shutdown");
    }
    return extCommand.sendMessage("pageWait", "", "")
        .then(function(response) {
            if (pageTime && (Date.now() - pageTime) > checkDefaultTimeout()) {
                sideex_log.error("Page Wait timed out after " + (checkDefaultTimeout()) + "ms");
                pageCount = 0;
                pageTime = "";
                return true;
            } else if (response && response.page_done) {
                pageCount = 0;
                pageTime = "";
                return true;
            } else {
                pageCount++;
                if (pageCount == 1) {
                    pageTime = Date.now();
                    sideex_log.info("Wait for the new page to be fully loaded");
                }
                return doPageWait();
            }
        })
}

function doAjaxWait() {
    if (!isPlaying) {
        currentPlayingCommandIndex--;
        return Promise.reject("shutdown");
    }
    return extCommand.sendMessage("ajaxWait", "", "")
        .then(function(response) {
            if (ajaxTime && (Date.now() - ajaxTime) > checkDefaultTimeout()) {
                sideex_log.error("Ajax Wait timed out after " + (checkDefaultTimeout()) + "ms");
                ajaxCount = 0;
                ajaxTime = "";
                return true;
            } else if (response && response.ajax_done) {
                ajaxCount = 0;
                ajaxTime = "";
                return true;
            } else {
                ajaxCount++;
                if (ajaxCount == 1) {
                    ajaxTime = Date.now();
                    sideex_log.info("Wait for all ajax requests to be done");
                }
                return doAjaxWait();
            }
        })
}

function doDomWait() {
    if (!isPlaying) {
        currentPlayingCommandIndex--;
        return Promise.reject("shutdown");
    }
    return extCommand.sendMessage("domWait", "", "")
        .then(function(response) {
            if (domTime && (Date.now() - domTime) > checkDefaultTimeout()) {
                sideex_log.error("DOM Wait timed out after " + checkDefaultTimeout() + "ms");
                domCount = 0;
                domTime = "";
                return true;
            } else if (response && (Date.now() - response.dom_time) < 400) {
                domCount++;
                if (domCount == 1) {
                    domTime = Date.now();
                    sideex_log.info("Wait for the DOM tree modification");
                }
                return doDomWait();
            } else {
                domCount = 0;
                domTime = "";
                return true;
            }
        })
}

function delay(t) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, t)
    });
}

/* function checkEncryptedData(_data){
    if(String(_data).match(/^#QA#/)){
        return atob(_data.replace('#QA#',''));
    }else{
        return _data;
    }
} */

function executionLoop() {
    locatorExecutionStartTime = Date.now();
    if(scriptDetails.instructionList[currentPlayingCommandIndex + 1]){
        if(locatorFailed 
            && scriptDetails.instructionList[currentPlayingCommandIndex].multipleLocatorCount 
            && (currentPlayingLocatorIndex + 1) < scriptDetails.instructionList[currentPlayingCommandIndex].locators.length){
            currentPlayingLocatorIndex++;
        }else{
            currentPlayingCommandIndex++;
            currentPlayingLocatorIndex = 0;
            locatorFailed = false;
        }
    }else{
        /* if(locatorFailed 
            && scriptDetails.instructionList[currentPlayingCommandIndex].locators
            && scriptDetails.instructionList[currentPlayingCommandIndex].locators !== undefined 
            && (currentPlayingLocatorIndex + 1) < scriptDetails.instructionList[currentPlayingCommandIndex].locators.length){
            currentPlayingLocatorIndex++;
        }else{ */
            if((currentPlayingCommandIndex + 1) == scriptDetails.instructionList.length) {
                if (!caseFailed) {
                    sideex_log.info("Test Script passed");
                    browser.tabs.sendMessage(
                        senderData.tab.id,
                        { 
                            responseType:"QaSCRIBE_Execution_Status",
                            totalExecutionLog: executionLog,
                            executionStartTime: executionStartTime,
                            executionEndTime: Date.now(), 
                            executionStatus: 1174,
                            errorMessage: "" 
                        },
                    );
                } else {
                    sideex_log.info("Test Script failed");
                    //caseFailed = false;
                    browser.tabs.sendMessage(
                        senderData.tab.id,
                        {
                            responseType:"QaSCRIBE_Execution_Status",
                            totalExecutionLog: executionLog,
                            executionStartTime: executionStartTime,
                            executionEndTime: Date.now(), 
                            executionStatus: 1176,
                            errorMessage: "" 
                        },
                    );
                }
                return true;
            }
        /* } */
    }

    if (scriptDetails.instructionList[currentPlayingCommandIndex].__breakpoint != undefined
        && scriptDetails.instructionList[currentPlayingCommandIndex].__breakpoint == true
        && currentPlayingCommandIndex !== previousBreakpointIndex) {
        previousBreakpointIndex = currentPlayingCommandIndex;
        //setColor(currentPlayingCommandIndex + 1, "breakpoint");
        currentPlayingCommandIndex--;
        //sideex_log.info("Breakpoint: Stop.");
        pause();
        return Promise.reject("shutdown");
    }

    if (!isPlaying) {
        return Promise.reject("shutdown");
    }

    if (isPause) {
        return Promise.reject("shutdown");
    }

    testCase.debugContext.debugIndex = currentPlayingCommandIndex;

    let commandName = scriptDetails.instructionList[currentPlayingCommandIndex].command;
    let commandTarget = scriptDetails.instructionList[currentPlayingCommandIndex].target;
    if(scriptDetails.instructionList[currentPlayingCommandIndex].multipleLocatorCount){
        commandTarget = scriptDetails.instructionList[currentPlayingCommandIndex].locators[currentPlayingLocatorIndex].value;
    }
    let commandValue = scriptDetails.instructionList[currentPlayingCommandIndex].value;

    /**
     * eureQa team added condition 
     */
    if(scriptDetails.instructionList[currentPlayingCommandIndex].isSaasCommand == "0"){

        commandTarget = preprocessParameter(commandTarget);
        commandValue = preprocessParameter(commandValue);
            
        if (commandName == "") {
            return Promise.reject("No command name");
        }


        /**
         * eureQa team modified code
         */
        return delay(((this.defaultSpeedInterval !== 0) ? this.defaultSpeedInterval : 0)).then(function () {
            
            /**
             * eureQa team added code
             * 
             * This is to modify log message according to command 
             */
            currentExecutingCommand = commandName;
            let upperCase = commandName.charAt(0).toUpperCase() + commandName.slice(1);
            if(currentPlayingScriptIndex == 0 && !alreadyOneOfTheCommandExecuted && !isExecuteOnSpecificTab && commandName !== "open" && commandName !== "openWindow"){
                alreadyOneOfTheCommandExecuted = true;
                //sideex_log.info("Executing: | open | " + scriptDetails.baseURL + " | |");
                return (extCommand["doOpen"](scriptDetails.baseURL, ""))
                    .then(function() {
                        currentPlayingCommandIndex--;
                    }).then(executionLoop);
            }else if (isExtCommand(commandName)) {
                /**
                 * eureQa team added code 
                 */
                if(commandName.indexOf("open") != -1){
                    alreadyOneOfTheCommandExecuted = true;
                    commandTarget = absolutify(preprocessParameter(scriptDetails.instructionList[currentPlayingCommandIndex].target), scriptDetails.baseURL);    
                }

                setColor(currentPlayingCommandIndex + 1, 1171, false);
                sideex_log.info("Executing: | " + commandName + " | " + commandTarget + " | " + commandValue + " |");
                return (extCommand["do" + upperCase](commandTarget, commandValue))
                    .then(function() {
                        setColor(currentPlayingCommandIndex + 1, 1174, false);
                    }).then(executionLoop); 
            }else {
                return doPreparation()
                .then(doPrePageWait)
                .then(doPageWait)
                .then(doAjaxWait)
                .then(doDomWait)
                .then(doCommand)
                .then(executionLoop)
            }
        });
    }else{
        /**
         * eureQa team added code 
         */
        setColor(currentPlayingCommandIndex + 1, 1173, false);
        sideex_log.info("Unsupported Command: | " + commandName + " | " + scriptDetails.instructionList[currentPlayingCommandIndex].target + " | " + commandValue + " |");
        return executionLoop()
    }
}

function doCommand() {
    let commandName = scriptDetails.instructionList[currentPlayingCommandIndex].command;
    let commandTarget = scriptDetails.instructionList[currentPlayingCommandIndex].target;
    if(scriptDetails.instructionList[currentPlayingCommandIndex].locators != undefined){
        commandTarget = scriptDetails.instructionList[currentPlayingCommandIndex].locators[currentPlayingLocatorIndex].value;
    }
    let commandValue = scriptDetails.instructionList[currentPlayingCommandIndex].value;

    commandTarget = preprocessParameter(commandTarget);
    commandValue = preprocessParameter(commandValue);

    if (implicitCount == 0 && currentPlayinglocatorIndex <= 0) {
        setColor(currentPlayingCommandIndex + 1, 1171, false);
        sideex_log.info("Executing: | " + commandName + " | " + commandTarget + " | " + commandValue + " |");
    }

    if (!isPlaying) {
        currentPlayingCommandIndex--;
        return Promise.reject("shutdown");
    }

    let p = new Promise(function(resolve, reject) {
        let count = 0;
        let interval = setInterval(function() {
            if (!isPlaying) {
                currentPlayingCommandIndex--;
                reject("shutdown");
                clearInterval(interval);
            }
            if (count > checkDefaultTimeout()) {
                sideex_log.error("Timed out after " + checkDefaultTimeout() + "ms");
                reject("Window not Found");
                clearInterval(interval);
            }
            if (!extCommand.getPageStatus()) {
                if (count == 0) {
                    sideex_log.info("Wait for the new page to be fully loaded");
                }
                count++;
            } else {
                resolve();
                clearInterval(interval);
            }
        }, 500);
    });
    return p.then(function() {
            let upperCase = commandName.charAt(0).toUpperCase() + commandName.slice(1);
            if(isSelblocksCommand(commandName)){
                return result = {result: "success", conditionCommand: selenium["do" + upperCase](commandTarget,commandValue)}
            }else if(isEureqaCommand(commandName)){
                return (selenium["do" + upperCase](commandName, commandTarget, commandValue))
                .then(function(data) {
                    return data;
                }) 
            } 
            return extCommand.sendMessage(commandName, commandTarget, commandValue, isWindowMethodCommand(commandName));
        })
        .then(function(result) {

            if (result.result != "success") {
                /**
                 * eureQa team added code
                 */
                if (commandName.match(/^waitFor/) && result.result.match(/not/)) {
                    if (implicitTime && (Date.now() - implicitTime > checkDefaultTimeout())) {
                        sideex_log.error("Implicit Wait timed out after " + checkDefaultTimeout() + "ms");
                        implicitCount = 0;
                        implicitTime = "";
                    } else {
                        implicitCount++;
                        if (implicitCount == 1) {
                            sideex_log.info("Wait until the element is found");
                            implicitTime = Date.now();
                        }
                        return doCommand();
                    }
                }

                implicitCount = 0;
                implicitTime = "";
                
                /**
                 * eureQa team modified code 
                 */
                if(scriptDetails.instructionList[currentPlayingCommandIndex].multipleLocatorCount){
                    if((currentPlayingLocatorIndex + 1) == scriptDetails.instructionList[currentPlayingCommandIndex].locators.length){
                        if (!(!commandName.includes("assert") && result.result.includes("did not match") || !commandName.includes("assert") && result.result.includes("not found"))) {
                            caseFailed = true;
                            setColor(currentPlayingCommandIndex + 1, 1176, false, result.result);
                            currentPlayingCommandIndex = scriptDetails.instructionList.length-1;
                        }else{
                            setColor(currentPlayingCommandIndex + 1, 1176, false, result.result);
                        }
                    }else{
                        setColor(currentPlayingCommandIndex + 1, 1177, false, result.result);
                    }
                }
                
                

                locatorFailed = true;
                //setColor(currentPlayingCommandIndex + 1, 1176, false);
                sideex_log.error(result.result);
            } else {
                if(result.conditionCommand != undefined){
                    setColor(currentPlayingCommandIndex + 1, 1174, result.conditionCommand);
                    if(result.conditionCommand == "stop"){
                        stop();
                    }else{
                        currentPlayingCommandIndex = ((result.conditionCommand > 0) ? (result.conditionCommand - 1) : currentPlayingCommandIndex); 
                    }
                }else{
                    setColor(currentPlayingCommandIndex + 1, 1174, false);
                }
                locatorFailed = false;
            }
        })
}


/**
 * Send the show element message to content script.
 * @param {Object} infos - a necessary infomation object.
 *  - key index {Int}
 *  - key tabId {Int}
 *  - key frameIds {Array}
 *  - key targetValue {String}
 */
function sendShowElementMessage(infos) {
    browser.tabs.sendMessage(infos.tabId, {
        showElement: true,
        targetValue: infos.targetValue
    }, {
        frameId: infos.frameIds[infos.index]
    }).then(function(response) {
        if (response){
            if (!response.result) {
                prepareSendNextFrame(infos);
            } else {
                let text = infos.index == 0 ? "top" : index.toString() + "(id)";
            }
        }
    }).catch(function(error) {
        if(error.message == "Could not establish connection. Receiving end does not exist.") {
            prepareSendNextFrame(infos);
        }
    });
}

function prepareSendNextFrame(infos) {
    if (infos.index !== infos.frameIds.length) {
        infos.index++;
        sendShowElementMessage(infos);
    }
}

/**
 * eureQa team added code
 */
function buildTestCaseData(){
    var localTestcase = {
        "log": {
          "category": "TestCase",
          "DEBUG": {
            "level": 1,
            "name": "DEBUG"
          },
          "INFO": {
            "level": 2,
            "name": "INFO"
          },
          "WARN": {
            "level": 3,
            "name": "WARN"
          },
          "ERROR": {
            "level": 4,
            "name": "ERROR"
          },
          "threshold": "INFO"
        },
        "tempTitle": "Untitled",
        "formatLocalMap": {},
        "commands": [],
        "baseURL": "http://www.sayeureqa.com/",
        "debugContext": {
          "failed": false,
          "started": true,
          "debugIndex": 2,
          "runTimeStamp": 1513077335816
        },
        "observers": [
          {},
          {}
        ],
        "modified": true
      };

    $.each(scriptDetails.instructionList, function(index, item){
        localTestcase.commands.push({
            "command": item.command,
            "target": item.target,
            "value": item.value
          });
    });

    return localTestcase;
}

/**
 * eureQa team modified code
 */
function play(_initState, _finalizeState) {
    executionStartTime = Date.now();

    browser.tabs.sendMessage(
        senderData.tab.id,
        {
            responseType:"QaSCRIBE_Execution_Status",
            executionStartTime: executionStartTime, 
            executionStatus: 1171
        },
    );

    testCase = buildTestCaseData(_initState);

    selenium["doReset"]();

    if(!_initState && caseFailed && scriptDetails.scriptOrderinScenario != 1){
        locatorExecutionStartTime = executionStartTime;
        var messageObject = {
            responseType: "QaSCRIBE_Instruction_Status",
            responseObject: [] 
        };
        for(i = 0; i < scriptDetails.instructionList.length; i++){
            messageObject.responseObject.push({
                instructionInfo: scriptDetails.instructionList[i],
                instructionStatus: 1173,
                executionStartDateTime: Date.now(),
                executionEndDateTime: Date.now()
            });
        }

        browser.tabs.sendMessage(senderData.tab.id, messageObject);

        browser.tabs.sendMessage(
            senderData.tab.id,
            {
                responseType:"QaSCRIBE_Execution_Status",
                executionStartTime: executionStartTime,
                executionEndTime: executionStartTime, 
                executionStatus: 1173
            },
        );
    }else{
        caseFailed = false;
        initializePlayingProgress(_initState)
        .then(executionLoop)
        .then(function(){
            finalizePlayingProgress(_finalizeState);
        })
        .catch(catchPlayingError);
    }
}

function stop(isExecutionTabUpdated) {

    if (isPause){
        isPause = false;
    }
    isPlaying = false;
    //switchPS();
    if(isExecutionTabUpdated){
        //don't output log
    }else{
        sideex_log.info("Stop executing");
    }
    /* initAllSuite();
    document.getElementById("result-runs").textContent = "0";
    document.getElementById("result-failures").textContent = "0"; */
    finalizePlayingProgress();
}

function playAfterConnectionFailed() {
    if (isPlaying) {
        initializeAfterConnectionFailed()
            .then(executionLoop)
            .then(finalizePlayingProgress)
            .catch(catchPlayingError);
    }
}

function initializeAfterConnectionFailed() {

    isRecording = false;
    isPlaying = true;

    commandType = "preparation";
    pageCount = ajaxCount = domCount = implicitCount = 0;
    pageTime = ajaxTime = domTime = implicitTime = "";

    caseFailed = false;

    return Promise.resolve(true);
}

function pause() {
    if (isPlaying) {
        sideex_log.info("Pausing");
        isPause = true;
        isPlaying = false;
        // No need to detach
        // prevent from missing status info
        //extCommand.detach();
    }
}

function resume() {
    if (isPause) {
        sideex_log.info("Resuming");
        isPlaying = true;
        isPause = false;
        extCommand.attach();
        executionLoop()
            .then(finalizePlayingProgress)
            .catch(catchPlayingError);
    }
}

/* function initAllSuite() {
    cleanCommandToolBar();
    var suites = document.getElementById("testCase-grid").getElementsByClassName("message");
    var length = suites.length;
    for (var k = 0; k < suites.length; ++k) {
        var cases = suites[k].getElementsByTagName("p");
        for (var u = 0; u < cases.length; ++u) {
            $("#" + cases[u].id).removeClass('fail success');
        }
    }
} */

function playSuite(_currentPlayingScriptIndex, _totalScripts) {
    currentPlayingScriptIndex = _currentPlayingScriptIndex;
    play(_currentPlayingScriptIndex == 0, _currentPlayingScriptIndex<_totalScripts);
}

/* function nextCase(i) {
    if (isPlaying || isPause) setTimeout(function() {
        nextCase(i);
    }, 500);
    else if(isPlayingSuite) playSuite(i + 1);
}

function playSuites(i) {
    isPlayingAll = true;
    var suites = document.getElementById("testCase-grid").getElementsByClassName("message");
    var length = suites.length;
    if (i < length) {
        if (suites[i].id.includes("suite")) {
            setSelectedSuite(suites[i].id);
            playSuite(0);
        }
        nextSuite(i);
    } else {
        isPlayingAll = false;
        switchPS();
    }
}

function nextSuite(i) {
    if (isPlayingSuite) setTimeout(function() {
        nextSuite(i);
    }, 2000);
    else if(isPlayingAll) playSuites(i + 1);
} */

function initializePlayingProgress(_state) {
    isRecording = false;
    isPlaying = true;

    var startPointItem = scriptDetails.instructionList.find(function(e) { return e.__startpoint === true; });
    if(startPointItem !== undefined){
        currentPlayingCommandIndex = parseInt(startPointItem.id);
    }else{
        currentPlayingCommandIndex = -1;   
    }
    currentPlayingLocatorIndex = -1;
    previousBreakpointIndex = -1;

    executionLog = "";
    // xian wait
    pageCount = ajaxCount = domCount = implicitCount = 0;
    pageTime = ajaxTime = domTime = implicitTime = "";

    locatorFailed = false;

    if(_state){
        caseFailed = false;
        currentPlayingScriptIndex = 0;
        alreadyOneOfTheCommandExecuted = false;
        return extCommand.init();
    }else{
        return Promise.resolve();
    }
}

function finalizePlayingProgress(_state) {
    if(!_state || _state == undefined){    
        if (!isPause) {
            extCommand.clear();
        }
        //setTimeout(function() {
            isPlaying = false;
        //}, 500);
    }
}

function catchPlayingError(reason) {
    if (isReceivingEndError(reason)) {
        commandType = "preparation";
        setTimeout(function() {
            currentPlayingCommandIndex--;
            playAfterConnectionFailed();
        }, 100);
    } else if (reason == "shutdown") {
        return;
    } else {
        extCommand.clear();

        if (currentPlayingCommandIndex >= 0) {
            setColor(currentPlayingCommandIndex + 1, 1176, false);
        }
        sideex_log.error(reason);
        
        sideex_log.info("Test Script failed");
        browser.tabs.sendMessage(
            senderData.tab.id,
            {
                responseType:"QaSCRIBE_Execution_Status",
                executionStartTime: executionStartTime,
                executionEndTime: Date.now(), 
                executionStatus: 1179,
                errorMessage: (reason.message ? reason.message : reason)
            },
        );
        /* Clear the flag, reset to recording phase */
        /* A small delay for preventing recording events triggered in playing phase*/

        setTimeout(function() {
            isPlaying = false;
            //isRecording = true;
        }, 500);
    }
}

function isReceivingEndError(reason) {
    if (reason == "TypeError: response is undefined" ||
        reason == "Error: Could not establish connection. Receiving end does not exist." ||
        // Below message is for Google Chrome
        reason.message == "Could not establish connection. Receiving end does not exist." ||
        // Google Chrome misspells "response"
        reason.message == "The message port closed before a reponse was received." ||
        reason.message == "The message port closed before a response was received." )
        return true;
    return false;
}