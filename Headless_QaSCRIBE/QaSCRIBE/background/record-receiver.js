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

// TODO: seperate UI

class BackgroundRecorder {
    constructor() {
        this.currentRecordingTabId = {};
        this.currentRecordingWindowId = {};
        this.currentRecordingFrameLocation = {};
        this.openedTabNames = {};
        this.openedTabIds = {};
        this.openedTabCount = {};

        this.openedWindowIds = {};
        this.contentWindowId = -1;
        this.selfWindowId = -1;
        this.attached = false;
        this.testCase = {id: 123};
        this.rebind();
    }

    // TODO: rename method
    tabsOnActivatedHandler(activeInfo) {
        let testCase = this.testCase;
        if (!testCase) {
            return;
        }
        let testCaseId = testCase.id;
        if (!this.openedTabIds[testCaseId]) {
            return;
        }

        var self = this;
        // Because event listener is so fast that selectWindow command is added
        // before other commands like clicking a link to browse in new tab.
        // Delay a little time to add command in order.
        setTimeout(function() {
            if (self.currentRecordingTabId[testCaseId] === activeInfo.tabId && self.currentRecordingWindowId[testCaseId] === activeInfo.windowId)
                return;
            // If no command has been recorded, ignore selectWindow command
            // until the user has select a starting page to record the commands
            if (testscriptData.length === 0)
                return;
            // Ignore all unknown tabs, the activated tab may not derived from
            // other opened tabs, or it may managed by other SideeX panels
            if (self.openedTabIds[testCaseId][activeInfo.tabId] == undefined)
                return;
            // Tab information has existed, add selectWindow command
            self.currentRecordingTabId[testCaseId] = activeInfo.tabId;
            self.currentRecordingWindowId[testCaseId] = activeInfo.windowId;
            self.currentRecordingFrameLocation[testCaseId] = "root";
            addCommand("selectWindow", [
                {value: self.openedTabIds[testCaseId][activeInfo.tabId], type: "system"}
            ], "", false, false);
        }, 150);
    }

    windowsOnFocusChangedHandler(windowId) {
        let testCase = this.testCase;
        if (!testCase) {
            return;
        }
        let testCaseId = testCase.id;
        if (!this.openedTabIds[testCaseId]) {
            return;
        }

        if (windowId === browser.windows.WINDOW_ID_NONE) {
            // In some Linux window managers, WINDOW_ID_NONE will be listened before switching
            // See MDN reference :
            // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/windows/onFocusChanged
            return;
        }

        // If the activated window is the same as the last, just do nothing
        // selectWindow command will be handled by tabs.onActivated listener
        // if there also has a event of switching a activated tab
        if (this.currentRecordingWindowId[testCaseId] === windowId)
            return;

        let self = this;

        browser.tabs.query({
            windowId: windowId,
            active: true
        }).then(function(tabs) {
            if(tabs.length === 0 || self.isPrivilegedPage(tabs[0].url)) {
                return;
            }

            // The activated tab is not the same as the last
            if (tabs[0].id !== self.currentRecordingTabId[testCaseId]) {
                // If no command has been recorded, ignore selectWindow command
                // until the user has select a starting page to record commands
                if (testscriptData.length === 0)
                    return;

                // Ignore all unknown tabs, the activated tab may not derived from
                // other opened tabs, or it may managed by other SideeX panels
                if (self.openedTabIds[testCaseId][tabs[0].id] == undefined)
                    return;

                // Tab information has existed, add selectWindow command
                self.currentRecordingWindowId[testCaseId] = windowId;
                self.currentRecordingTabId[testCaseId] = tabs[0].id;
                self.currentRecordingFrameLocation[testCaseId] = "root";
                addCommand("selectWindow", [
                    {value: self.openedTabIds[testCaseId][tabs[0].id], type: "system"}
                ], "", false, false);
            }
        });
    }

    tabsOnRemovedHandler(tabId, removeInfo) {
        let testCase = this.testCase;
        if (!testCase) {
            return;
        }
        let testCaseId = testCase.id;
        if (!this.openedTabIds[testCaseId]) {
            return;
        }

        if (this.openedTabIds[testCaseId][tabId] != undefined) {
            if (this.currentRecordingTabId[testCaseId] !== tabId) {
                addCommand("selectWindow", [
                    {value: this.openedTabIds[testCaseId][tabId], type: "system"}
                ], "", false, false);
                addCommand("close", [
                    {value: this.openedTabIds[testCaseId][tabId], type: "system"}
                ], "", false, false);
                addCommand("selectWindow", [
                    {value: this.openedTabIds[testCaseId][this.currentRecordingTabId[testCaseId]], type: "system"}
                ], "", false, false);
            } else {
                addCommand("close", [
                    {value: this.openedTabIds[testCaseId][tabId], type: "system"}
                ], "", false, false);
            }
            delete this.openedTabNames[testCaseId][this.openedTabIds[testCaseId][tabId]];
            delete this.openedTabIds[testCaseId][tabId];
            this.currentRecordingFrameLocation[testCaseId] = "root";
        }
    }

    webNavigationOnCreatedNavigationTargetHandler(details) {
        let testCase = this.testCase;
        if (!testCase)
            return;
        let testCaseId = testCase.id;
        if (this.openedTabIds[testCaseId][details.sourceTabId] != undefined) {
            this.openedTabNames[testCaseId]["win_ser_" + this.openedTabCount[testCaseId]] = details.tabId;
            this.openedTabIds[testCaseId][details.tabId] = "win_ser_" + this.openedTabCount[testCaseId];
            if (details.windowId != undefined) {
            this.setOpenedWindow(details.windowId);
            } else {
                // Google Chrome does not support windowId.
                // Retrieve windowId from tab information.
                let self = this;
                browser.tabs.get(details.tabId)
                .then(function(tabInfo) {
                    self.setOpenedWindow(tabInfo.windowId);
                });
            }
            this.openedTabCount[testCaseId]++;
        }
    };

    addCommandMessageHandler(message, sender, sendRequest) {
        if (!message.command || sender.tab.id == senderData.tab.id) //|| this.openedWindowIds[sender.tab.windowId] == undefined
            return;

        /* if (!getSelectedSuite() || !getSelectedCase()) {
            let id = "case" + sideex_testCase.count;
            sideex_testCase.count++;
            addTestCase("Untitled Test Script "+sideex_testCase.count+"", id);
        } */

        let testCaseId = this.testCase.id;

        if (!this.openedTabIds[testCaseId]) {
            this.openedTabIds[testCaseId] = {};
            this.openedTabNames[testCaseId] = {};
            this.currentRecordingFrameLocation[testCaseId] = "root";
            this.currentRecordingTabId[testCaseId] = sender.tab.id;
            this.currentRecordingWindowId[testCaseId] = sender.tab.windowId;
            this.openedTabCount[testCaseId] = 1;
        }

        if (Object.keys(this.openedTabIds[testCaseId]).length === 0) {
            this.currentRecordingTabId[testCaseId] = sender.tab.id;
            this.currentRecordingWindowId[testCaseId] = sender.tab.windowId;
            this.openedTabNames[testCaseId]["win_ser_local"] = sender.tab.id;
            this.openedTabIds[testCaseId][sender.tab.id] = "win_ser_local";
        }

        if (testscriptData.length === 0) {
            /**
             * eureQa team modified code 
             * 
             * This records absolute/relative url based on settings configuration
             */
            addCommand("open", [
                {
                    encrypted: false,
                    id: 1,
                    label: ((isRecordAbsoluteURL)? new URL(sender.tab.url).href : new URL(sender.tab.url).pathname),
                    selected: true,
                    value: ((isRecordAbsoluteURL)? new URL(sender.tab.url).href : new URL(sender.tab.url).pathname), 
                    type: "system"
                }
            ], "", false, false);

            /**
             * eureQa team added code
             * 
             * Auto record assert title
             */
            if(isAutoAssertTitle){   
                    //{value: sender.tab.title, type: "system"}

                if(sender.tab.url.includes(sender.tab.title)){
                    addCommand("assertTitle", [
                        {
                            encrypted: false,
                            id: 1,
                            label: "",
                            selected: true,
                            value: "", 
                            type: "system"
                        }
                    ], "", false, false);
                }else{
                    addCommand("assertTitle", [
                        {
                            encrypted: false,
                            id: 1,
                            label: sender.tab.title,
                            selected: true,
                            value: sender.tab.title,
                            type: "system"
                        }
                    ], "", false, false);
                }
            }
        }

        /**
         * eureQa team commented code
         * 
         * This code stops component from recording from all tabs 
         */
        /* if (this.openedTabIds[testCaseId][sender.tab.id] == undefined)
            return; */

        if (message.frameLocation !== this.currentRecordingFrameLocation[testCaseId]) {
            let newFrameLevels = message.frameLocation.split(':');
            let oldFrameLevels = this.currentRecordingFrameLocation[testCaseId].split(':');
            while (oldFrameLevels.length > newFrameLevels.length) {
                addCommand("selectFrame", [
                    {value: "relative=parent", type: "system"}
                ], "", false, false);
                oldFrameLevels.pop();
            }
            while (oldFrameLevels.length != 0 && oldFrameLevels[oldFrameLevels.length - 1] != newFrameLevels[oldFrameLevels.length - 1]) {
                addCommand("selectFrame", [
                    {value: "relative=parent", type: "system"}
                ], "", false, false);
                oldFrameLevels.pop();
            }
            while (oldFrameLevels.length < newFrameLevels.length) {
                addCommand("selectFrame", [
                    {value: "index=" + newFrameLevels[oldFrameLevels.length], type: "system"}
                ], "", false, false);
                oldFrameLevels.push(newFrameLevels[oldFrameLevels.length]);
            }
            this.currentRecordingFrameLocation[testCaseId] = message.frameLocation;
        }

        //Record: doubleClickAt
        /**
         * eureQa team modified code 
         */
        if (message.command == "doubleClick") {
            var instList = testscriptData;
            //var select = getSelectedRecord();
            var length = testscriptData.length;
            var equaln = instList[length-1].command == instList[length-2].command;
            var equalt = instList[length-1].target == instList[length-2].target;
            var equalv = instList[length-1].value == instList[length-2].value;
            if (instList[length-1].instCommand == "click" && equaln && equalt && equalv) {
                //deleteCommand(command[length - 1].id);
                //deleteCommand(command[length - 2].id);
                testscriptData = testscriptData.slice(0, length-3);
                console.log("Delete - Delete ", testscriptData);
            }
        } else if(message.command.includes("Value") && typeof message.value === 'undefined') {
            sideex_log.error("Error: This element does not have property 'value'. Please change to use storeText command.");
            return;
        } else if(message.command.includes("Text") && message.value === '') {
            sideex_log.error("Error: This element does not have property 'Text'. Please change to use storeValue command.");
            return;
        } else if (message.command.includes("store")) {
            if(!message.command.includes("Title")){
                message.value = prompt("Enter the name of the variable");
            }else{
                message.target = [[prompt("Enter the name of the variable")]];
            }
            if (message.insertBeforeLastCommand) {
                addCommand(message.command, message.target, message.value, false, true);
            } else {

                /**
                 * eureQa team comented code 
                 */
                //notification(message.command, message.target, message.value);
                addCommand(message.command, message.target, message.value, false, false);
            }
            return;
        }

        //handle choose ok/cancel confirm
        if (message.insertBeforeLastCommand) {
            addCommand(message.command, message.target, message.value, false, true);
        } else {
            
            /**
             * eureQa team comented code 
             */
            //notification(message.command, message.target, message.value);
            addCommand(message.command, message.target, message.value, false, false);
        }
        return;
    }

    isPrivilegedPage (url) {
        if (url.substr(0, 13) == 'moz-extension' ||
            url.substr(0, 16) == 'chrome-extension') {
            return true;
        }
        return false;
    }

    rebind() {
        this.tabsOnActivatedHandler = this.tabsOnActivatedHandler.bind(this);
        this.windowsOnFocusChangedHandler = this.windowsOnFocusChangedHandler.bind(this);
        this.tabsOnRemovedHandler = this.tabsOnRemovedHandler.bind(this);
        this.webNavigationOnCreatedNavigationTargetHandler = this.webNavigationOnCreatedNavigationTargetHandler.bind(this);
        this.addCommandMessageHandler = this.addCommandMessageHandler.bind(this);
    }

    attach() {
        if (this.attached) {
            return;
        }
        this.attached = true;
        browser.tabs.onActivated.addListener(this.tabsOnActivatedHandler);
        browser.windows.onFocusChanged.addListener(this.windowsOnFocusChangedHandler);
        browser.tabs.onRemoved.addListener(this.tabsOnRemovedHandler);
        browser.webNavigation.onCreatedNavigationTarget.addListener(this.webNavigationOnCreatedNavigationTargetHandler);
        browser.runtime.onMessage.addListener(this.addCommandMessageHandler);
    }

    detach() {
        if (!this.attached) {
            return;
        }
        this.attached = false;
        browser.tabs.onActivated.removeListener(this.tabsOnActivatedHandler);
        browser.windows.onFocusChanged.removeListener(this.windowsOnFocusChangedHandler);
        browser.tabs.onRemoved.removeListener(this.tabsOnRemovedHandler);
        browser.webNavigation.onCreatedNavigationTarget.removeListener(this.webNavigationOnCreatedNavigationTargetHandler);
        browser.runtime.onMessage.removeListener(this.addCommandMessageHandler);
    }

    setOpenedWindow(windowId) {
        this.openedWindowIds[windowId] = true;
    }

    setSelfWindowId(windowId) {
        this.selfWindowId = windowId;
    }

    getSelfWindowId() {
        return this.selfWindowId;
    }
}
