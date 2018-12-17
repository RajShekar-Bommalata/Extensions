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

var selenium = new Selenium(BrowserBot.createForWindow(window));
var locatorBuilders = new LocatorBuilders(window);

var singleArgCommands = ["getSpeed"
    , "getTimeStamp"
    , "getCookie"
    , "getHtmlSource"
    , "getMouseSpeed"
    , "getAllFields"
    , "getAllButtons"
    , "getBodyText"
    , "getTitle"
    , "getLocation"
    , "getAllWindowIds"
    , "getAllWindowNames"
    , "getAllWindowTitles"
    , "getAttributeFromAllWindows"
];

function doCommands(request, sender, sendResponse, type) {
    if (request.commands) {
        //console.log("indoCommands: " + request.commands);
        if (request.commands == "waitPreparation") {
            selenium["doWaitPreparation"]("", "");
            sendResponse({});
        } else if (request.commands == "prePageWait") {
            selenium["doPrePageWait"]("", "");
            sendResponse({ new_page: window.sideex_new_page });
        } else if (request.commands == "pageWait") {
            selenium["doPageWait"]("", "");
            sendResponse({ page_done: window.sideex_page_done });
        } else if (request.commands == "ajaxWait") {
            selenium["doAjaxWait"]("", "");
            sendResponse({ ajax_done: window.sideex_ajax_done });
        } else if (request.commands == "domWait") {
            selenium["doDomWait"]("", "");
            sendResponse({ dom_time: window.sideex_new_page });
        } else {
            var _exeCommand = '';
            eureqaCommandBuilder.forEach(function(element) {
                if(element.command == request.commands){
                    _exeCommand = element;
                }
            }, this);

            if(_exeCommand == ""){
                var upperCase = request.commands.charAt(0).toUpperCase() + request.commands.slice(1);
                _exeCommand = {
                    method : "do"+upperCase,
                    command : request.commands
                }
            }

            /* if(request.value.includes('#QA#')){
                request.value = atob(request.value.replace('#QA#',''));
            } */
            
            if(_exeCommand != ""){
                try {
                    function validateData(){
                        if(_exeCommand.command.match(/Color/) && !_exeCommand.command.match(/store[\s\S]*?Color/)){
                            request.value = request.value.toUpperCase();
                        }
                        if(_exeCommand.command.match(/^assert/) || _exeCommand.command.match(/^verify/) || _exeCommand.command.match(/^waitFor/)){
                            if(_exeCommand.command.match(/Present/) == null
                                && _exeCommand.command.match(/Visible/) == null
                                && _exeCommand.command.match(/Checked/) == null
                                && _exeCommand.command.match(/Editable/) == null){
                                if(_exeCommand.command.match(/Not/)==null){
                                    switch(typeof returnValue) {
                                        case 'string':
                                            if(_exeCommand.command.match(/Alert/)==null 
                                                && _exeCommand.command.match(/Confirmation/)==null
                                                && _exeCommand.command.match(/Prompt/)==null){
                                                if(singleArgCommands.indexOf(_exeCommand.method) > -1){
                                                    if(!PatternMatcher.matches(request.target, returnValue)){
                                                        throw new Error("Actual value '" + returnValue + "' did not match '" + request.target + "'");
                                                    }
                                                }else{
                                                    if(!PatternMatcher.matches(request.value, returnValue)){
                                                        throw new Error("Actual value '" + returnValue + "' did not match '" + request.value + "'");
                                                    }
                                                }
                                            }else if((_exeCommand.command.match(/Alert/)!=null 
                                                || _exeCommand.command.match(/Confirmation/)!=null
                                                || _exeCommand.command.match(/Prompt/)!=null)
                                                && !PatternMatcher.matches(request.target, returnValue)){
                                                sendPopupError("Actual value '" + returnValue + "' did not match '" + request.target + "'");
                                            }
                                            break;
                                        case 'number':
                                            if(singleArgCommands.indexOf(_exeCommand.method) > -1){
                                                if(isFinite(returnValue) && returnValue.toString().indexOf('.') == -1 && returnValue !== parseInt(request.target)){
                                                    throw new Error("Actual value '" + returnValue + "' did not match '" + request.target + "'");
                                                }else if(isFinite(returnValue) && returnValue.toString().indexOf('.') != -1 && returnValue !== parseFloat(request.target)){
                                                    throw new Error("Actual value '" + returnValue + "' did not match '" + request.target + "'");
                                                }
                                            }else{
                                                if(isFinite(returnValue) && returnValue.toString().indexOf('.') == -1 && returnValue !== parseInt(request.value)){
                                                    throw new Error("Actual value '" + returnValue + "' did not match '" + request.value + "'");
                                                }else if(isFinite(returnValue) && returnValue.toString().indexOf('.') != -1 && returnValue !== parseFloat(request.value)){
                                                    throw new Error("Actual value '" + returnValue + "' did not match '" + request.value + "'");
                                                }
                                            }
                                            break;
                                        case 'boolean':
                                            if(singleArgCommands.indexOf(_exeCommand.method) > -1){
                                                if(returnValue !== (request.target == 'true')){
                                                    throw new Error("Actual value '" + returnValue + "' did not match '" + request.target + "'");
                                                }
                                            }else{
                                                if(returnValue !== (request.value == 'true')){
                                                    throw new Error("Actual value '" + returnValue + "' did not match '" + request.value + "'");
                                                }
                                            }
                                            break;
                                        case 'object':
                                            if(singleArgCommands.indexOf(_exeCommand.method) > -1){
                                                if(returnValue.length == request.target.split(',').length){
                                                    if(returnValue.toString() !== request.target){
                                                        throw new Error("Actual value '" + returnValue + "' did not match '" + request.target + "'");    
                                                    }
                                                }else{
                                                    throw new Error("Actual value '" + returnValue + "' did not match '" + request.target + "'");
                                                }
                                            }else{
                                                if(returnValue.length == request.value.split(',').length){
                                                    if(returnValue.toString() !== request.value){
                                                        throw new Error("Actual value '" + returnValue + "' did not match '" + request.value + "'");    
                                                    }
                                                }else{
                                                    throw new Error("Actual value '" + returnValue + "' did not match '" + request.value + "'");
                                                }
                                            }
                                            break;
                                    }
                                }else{
                                    switch(typeof returnValue) {
                                        case 'string':
                                            if(_exeCommand.command.match(/Alert/)==null 
                                                && _exeCommand.command.match(/Confirmation/)==null
                                                && _exeCommand.command.match(/Prompt/)==null){
                                                    if(singleArgCommands.indexOf(_exeCommand.method) > -1){
                                                        if(PatternMatcher.matches(request.target, returnValue)){
                                                            throw new Error("Actual value '" + returnValue + "' did not match '" + request.target + "'");
                                                        }
                                                    }else{
                                                        if(PatternMatcher.matches(request.value, returnValue)){
                                                            throw new Error("Actual value '" + returnValue + "' did not match '" + request.value + "'");
                                                        }
                                                    }
                                            }else if((_exeCommand.command.match(/Alert/)!=null 
                                                || _exeCommand.command.match(/Confirmation/)!=null
                                                || _exeCommand.command.match(/Prompt/)!=null)
                                                && PatternMatcher.matches(request.target, returnValue)){
                                                sendPopupError("Actual value '" + returnValue + "' did not match '" + request.target + "'");
                                            }
                                            break;
                                        case 'number':
                                            if(singleArgCommands.indexOf(_exeCommand.method) > -1){
                                                if(isFinite(returnValue) && returnValue.toString().indexOf('.') == -1 && returnValue == parseInt(request.target)){
                                                    throw new Error("Actual value '" + returnValue + "' did not match '" + request.target + "'");
                                                }else if(isFinite(returnValue) && returnValue.toString().indexOf('.') != -1 && returnValue == parseFloat(request.target)){
                                                    throw new Error("Actual value '" + returnValue + "' did not match '" + request.target + "'");
                                                }
                                            }else{
                                                if(isFinite(returnValue) && returnValue.toString().indexOf('.') == -1 && returnValue == parseInt(request.value)){
                                                    throw new Error("Actual value '" + returnValue + "' did not match '" + request.value + "'");
                                                }else if(isFinite(returnValue) && returnValue.toString().indexOf('.') != -1 && returnValue == parseFloat(request.value)){
                                                    throw new Error("Actual value '" + returnValue + "' did not match '" + request.value + "'");
                                                }
                                            }
                                            break;
                                        case 'boolean':
                                            if(singleArgCommands.indexOf(_exeCommand.method) > -1){
                                                if(returnValue == (request.target == 'true')){
                                                    throw new Error("Actual value '" + returnValue + "' did not match '" + request.target + "'");
                                                }
                                            }else{
                                                if(returnValue == (request.value == 'true')){
                                                    throw new Error("Actual value '" + returnValue + "' did not match '" + request.value + "'");
                                                }
                                            }
                                            break;
                                        case 'object':
                                            if(singleArgCommands.indexOf(_exeCommand.method) > -1){
                                                if(returnValue.length == request.target.split(',').length){
                                                    if(returnValue.toString() == request.target){
                                                        throw new Error("Actual value '" + returnValue + "' did not match '" + request.target + "'");    
                                                    }
                                                }
                                            }else{
                                                if(returnValue.length == request.value.split(',').length){
                                                    if(returnValue.toString() == request.value){
                                                        throw new Error("Actual value '" + returnValue + "' did not match '" + request.value + "'");    
                                                    }
                                                }
                                            }
                                            break;
                                    }
                                }
                            }    
                            else if(_exeCommand.command.match(/Visible/)!=null){
                                if(_exeCommand.command.match(/Not/)==null && !returnValue){
                                    throw new Error("Element did not match '" + request.target + "' Not Visible'");
                                }else if(_exeCommand.command.match(/Not/)!=null && returnValue){
                                    throw new Error("Element did not match '" + request.target + "' Visible'");
                                }
                            }
                            else if(_exeCommand.command.match(/Checked/)!=null){
                                if(_exeCommand.command.match(/Not/)==null && !returnValue){
                                    throw new Error("Element did not match '" + request.target + "' Not Checked'");
                                }else if(_exeCommand.command.match(/Not/)!=null && returnValue){
                                    throw new Error("Element did not match '" + request.target + "' Checked'");
                                }
                            }
                            else if(_exeCommand.command.match(/Editable/)!=null){
                                if(_exeCommand.command.match(/Not/)==null && !returnValue){
                                    throw new Error("Element did not match '" + request.target + "' Not Editable'");
                                }else if(_exeCommand.command.match(/Not/)!=null && returnValue){
                                    throw new Error("Element did not match '" + request.target + "' Editable'");
                                }
                            }
                            else if(_exeCommand.command.match(/Present/)!=null){
                                if(_exeCommand.command.match(/Text/)!=null){
                                    if(_exeCommand.command.match(/Not/)==null && !returnValue){
                                        throw new Error("Text did not match '" + request.target + "' Not Present'");
                                    }else if(_exeCommand.command.match(/Not/)!=null && returnValue){
                                        throw new Error("Text did not match '" + request.target + "' Present'");
                                    }
                                }else if(_exeCommand.command.match(/Element/)!=null){
                                    if(_exeCommand.command.match(/Not/)==null && !returnValue){
                                        throw new Error("Element did not match '" + request.target + "' Not Present'");
                                    }else if(_exeCommand.command.match(/Not/)!=null && returnValue){
                                        throw new Error("Element did not match '" + request.target + "' Present'");
                                    }
                                }else if(_exeCommand.command.match(/Alert/)!=null || _exeCommand.command.match(/Confirmation/)!=null || _exeCommand.command.match(/Prompt/)!=null){
                                    if(_exeCommand.command.match(/Not/)==null && !returnValue){
                                        sendPopupError("Alert/Confirmation/Prompt did not match Not Present");
                                    }else if(_exeCommand.command.match(/Not/)!=null && returnValue){
                                        sendPopupError("Alert/Confirmation/Prompt did not match present");
                                    }
                                }
                            }
                        }else if(_exeCommand.command.match(/^store/)){
                            if(request.value != ""){
                                returnValue = selenium["doStore"](returnValue,request.value);
                            }else{
                                returnValue = selenium["doStore"](returnValue,request.target);
                            }
                        }
                        returnMessageValidation();
                    }

                    function returnMessageValidation(){
                        if (returnValue instanceof Promise) {
                            // The command is a asynchronous function
                            returnValue.then(function(value) {
                                // Asynchronous command completed successfully
                                document.body.removeAttribute("SideeXPlayingFlag");
                                sendResponse({result: "success"});
                                if(_exeCommand.command.match(/AndWait/)){
                                    request = {commands:"waitForPageToLoad",target:30000,value:''};
                                    doCommands(request, sender, sendResponse, type);
                                }
                            }).catch(function(reason) {
                                // Asynchronous command failed
                                document.body.removeAttribute("SideeXPlayingFlag");
                                sendResponse({result: reason});
                            });
                        } else {
                            // Synchronous command completed successfully
                            document.body.removeAttribute("SideeXPlayingFlag");
                            sendResponse({result: "success"});
                            if(_exeCommand.command.match(/AndWait/)){
                                request = {commands:"waitForPageToLoad",target:30000,value:''};
                                doCommands(request, sender, sendResponse, type);
                            }
                        }
                    }

                    function sendPopupError(_message){
                        document.body.removeAttribute("SideeXPlayingFlag");
                        sendResponse({result: _message});
                    }

                    document.body.setAttribute("SideeXPlayingFlag", true);

                    let returnValue;

                    if(_exeCommand.method !== 'doStore' 
                        && _exeCommand.command.match(/Alert/)==null
                        && _exeCommand.command.match(/Confirmation/)==null
                        && _exeCommand.command.match(/Prompt/)==null){
                        returnValue = selenium[_exeCommand.method](request.target, request.value);
                        validateData();    
                    }else if(_exeCommand.method !== 'doStore'
                        && (_exeCommand.command.match(/Alert/)!=null 
                        || _exeCommand.command.match(/Confirmation/)!=null
                        || _exeCommand.command.match(/Prompt/)!=null)){
                        (selenium[_exeCommand.method](request.target, request.value)).then(function(response){
                            returnValue = response;
                            if((_exeCommand.command.match(/^storeAlert$/)!==null 
                                || _exeCommand.command.match(/^storeConfirmation$/)!==null
                                || _exeCommand.command.match(/^storePrompt$/)!==null) 
                                && !returnValue){
                                sendPopupError("Alert/Confirmation/Prompt did not match present");
                            }else{
                                validateData(); 
                            }
                        });
                    }else{
                        returnValue = selenium['doStore'](request.target,request.value);
                        returnMessageValidation();
                    }
                    
                } catch(e) {
                    // Synchronous command failed
                    document.body.removeAttribute("SideeXPlayingFlag");
                    sendResponse({result: e.message});
                }
            }else{
                sendResponse({ result: "Unknown command: " + request.commands });
            }
        }
        return true;
    }
    if (request.selectMode) {
        if (request.selecting) {
            targetSelecter = new TargetSelecter(function (element, win) {
                if (element && win) {
                    //var locatorBuilders = new LocatorBuilders(win);
                    var target = locatorBuilders.buildAll(element);
                    locatorBuilders.detach();
                    if (target != null && target instanceof Array) {
                        if (target) {
                            //self.editor.treeView.updateCurrentCommand('targetCandidates', target);
                            browser.runtime.sendMessage({
                                selectTarget: true,
                                target: target
                            })
                        } else {
                            //alert("LOCATOR_DETECTION_FAILED");
                        }
                    }

                }
                targetSelecter = null;
            }, function () {
                browser.runtime.sendMessage({
                    cancelSelectTarget: true
                })
            });

        } else {
            if (targetSelecter) {
                targetSelecter.cleanup();
                targetSelecter = null;
                return;
            }
        }
    }
    // TODO: code refactoring
    if (request.attachRecorder) {
        recorder.attach();
        return;
    } else if (request.detachRecorder) {
        recorder.detach();
        return;
    }
}

browser.runtime.onMessage.addListener(doCommands);