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


class ExtCommand {

    constructor(contentWindowId) {
        this.playingTabNames = {};
        this.playingTabTitles = [];
        this.playingTabIds = {};
        this.playingTabStatus = {};
        this.playingFrameLocations = {};
        this.playingTabCount = 1;
        this.currentPlayingTabId = -1;
        this.contentWindowId = contentWindowId ? contentWindowId : -1;
        this.currentPlayingFrameLocation = "root";
        // TODO: flexible wait
        this.waitInterval = 500;
        this.waitTimes = 60;

        this.attached = false;

        // Use ES6 arrow function to bind correct this
        this.tabsOnUpdatedHandler = (tabId, changeInfo, tabInfo) => {
            if (changeInfo.status) {
                if (changeInfo.status == "loading") {
                    this.setLoading(tabId);
                } else {
                    if(senderData.tab != undefined && senderData.tab.id == tabId){
                        resetComponentData();
                    }
                    this.setComplete(tabId);
                }
            }
        };

        this.frameLocationMessageHandler = (message, sender) => {
            if (message.frameLocation) {
                this.setFrame(sender.tab.id, message.frameLocation, sender.frameId);
            }
        };

        this.newTabHandler = (details) => {
            if (this.hasTab(details.sourceTabId)) {
                this.setNewTab(details.tabId);
            }
        };

        /** 
         * eureQa team added code
         *
         * This funtion removes the tab id whenever a tab is closed
         */
        this.removedTabHandler = (tabId) => {
            try {
                $.each(this.playingTabIds, function (key, value) {
                    if (parseInt(key) == tabId) {
                        delete this.playingTabIds[key];
                        delete this.playingTabNames[value];
                    }
                });
            } catch (e) { }
        };
    }


    init() {
        this.attach();
        this.playingTabNames = {};
        this.playingTabIds = {};
        this.playingTabStatus = {};
        this.playingFrameLocations = {};
        this.playingTabCount = 1;
        this.currentPlayingWindowId = this.contentWindowId;
        let self = this;
        this.currentPlayingFrameLocation = "root";
        return this.queryActiveTab(this.currentPlayingWindowId)
            .then(this.setFirstTab.bind(this));
    }

    clear() {
        this.detach();
        this.playingTabNames = {};
        this.playingTabIds = {};
        this.playingTabStatus = {};
        this.playingFrameLocations = {};
        this.playingTabCount = 1;
        this.currentPlayingWindowId = undefined;
    }

    attach() {
        if (this.attached) {
            return;
        }
        this.attached = true;
        browser.tabs.onUpdated.addListener(this.tabsOnUpdatedHandler);
        browser.runtime.onMessage.addListener(this.frameLocationMessageHandler);
        browser.webNavigation.onCreatedNavigationTarget.addListener(this.newTabHandler);
        /** 
         * eureQa team added code
         */
        browser.tabs.onRemoved.addListener(this.removedTabHandler);
    }

    detach() {
        if (!this.attached) {
            return;
        }
        this.attached = false;
        browser.tabs.onUpdated.removeListener(this.tabsOnUpdatedHandler);
        browser.runtime.onMessage.removeListener(this.frameLocationMessageHandler);
        browser.webNavigation.onCreatedNavigationTarget.removeListener(this.newTabHandler);
        /** 
         * eureQa team added code
         */
        browser.tabs.onRemoved.addListener(this.removedTabHandler);
    }

    setContentWindowId(contentWindowId) {
        this.contentWindowId = contentWindowId;
    }

    getContentWindowId() {
        return this.contentWindowId;
    }

    getCurrentPlayingTabId() {
        return this.currentPlayingTabId;
    }

    getCurrentPlayingFrameLocation() {
        return this.currentPlayingFrameLocation;
    }

    getFrameId(tabId) {
        if (tabId >= 0) {
            return this.playingFrameLocations[tabId][this.currentPlayingFrameLocation];
        } else {
            return this.playingFrameLocations[this.currentPlayingTabId][this.currentPlayingFrameLocation];
        }
    }

    getCurrentPlayingFrameId() {
        return this.getFrameId(this.currentPlayingTabId);
    }

    getPageStatus() {
        return this.playingTabStatus[this.getCurrentPlayingTabId()];
    }

    queryActiveTab(windowId) {
        return browser.tabs.query({ windowId: windowId, active: true, url: ["http://*/*", "https://*/*"] })
            .then(function (tabs) {
                return tabs[0];
            });
    }

    sendMessage(command, target, value, top) {
        if (/^webdriver/.test(command)) {
            return Promise.resolve({ result: "success" });
        }
        let tabId = this.getCurrentPlayingTabId();
        let frameId = this.getCurrentPlayingFrameId();
        return browser.tabs.sendMessage(tabId, {
            commands: command,
            target: target,
            value: value
        }, { frameId: top ? 0 : frameId });
    }

    setLoading(tabId) {
        // Does clearing the object will cause some problem(e.g. missing the frameId)?
        // Ans: Yes, but I don't know why
        this.initTabInfo(tabId);
        // this.initTabInfo(tabId, true); (failed)
        this.playingTabStatus[tabId] = false;
    }

    setComplete(tabId) {
        this.initTabInfo(tabId);
        this.playingTabStatus[tabId] = true;
    }

    initTabInfo(tabId, forced) {
        if (!this.playingFrameLocations[tabId] | forced) {
            this.playingFrameLocations[tabId] = {};
            this.playingFrameLocations[tabId]["root"] = 0;
        }
    }

    setFrame(tabId, frameLocation, frameId) {
        this.playingFrameLocations[tabId][frameLocation] = frameId;
    }

    hasTab(tabId) {
        return this.playingTabIds[tabId];
    }

    /**
       * eureQa team modified code
       */
    setNewTab(tabId, windowNameIfAny) {
        let self = this;
        var _setInterval;
        var windowDetails = "";

        if (windowNameIfAny) {
            this.playingTabNames[windowNameIfAny] = tabId;
            this.playingTabIds[tabId] = windowNameIfAny;
            windowDetails = windowNameIfAny;
        } else {
            this.playingTabNames["win_ser_" + this.playingTabCount] = tabId;
            this.playingTabIds[tabId] = "win_ser_" + this.playingTabCount;
            windowDetails = "win_ser_" + this.playingTabCount;
        }
        this.playingTabTitles.push({ tabId: tabId, title: "", winser: windowDetails });


        _setInterval = setInterval(function () {
            browser.tabs.get(tabId).then(function (__tabs) {
                if (__tabs.status == 'complete' && __tabs.url != 'about:blank') {
                    for (var j in self.playingTabTitles) {
                        if (self.playingTabTitles[j].tabId == tabId) {
                            self.playingTabTitles[j].title = __tabs.title;
                        }
                    }
                    clearTimeout(_setInterval);
                }
            });
        }, 2);

        this.playingTabCount++;
    }

    doOpen(url) {
        return browser.tabs.update(this.currentPlayingTabId, {
            url: url
        });
    }

    /** 
     * eureQa team modified code
     */
    doPause(milliseconds) {
        return new Promise(function (resolve) {
            setTimeout(resolve, milliseconds);
        });
    }

    doSelectFrame(frameLocation) {
        let result = frameLocation.match(/(index|relative) *= *([\d]+|parent)/i);
        if (result && result[2]) {
            let position = result[2];
            if (position == "parent") {
                this.currentPlayingFrameLocation = this.currentPlayingFrameLocation.slice(0, this.currentPlayingFrameLocation.lastIndexOf(":"));
            } else {
                this.currentPlayingFrameLocation += ":" + position;
            }
            return this.wait("playingFrameLocations", this.currentPlayingTabId, this.currentPlayingFrameLocation);
        } else {
            return Promise.reject("Invalid argument");
        }
    }

    /** 
     * eureQa team modified code
     */
    doSelectWindow(serialNumber) {
        self = this;
        return delay(((serialNumber == "win_ser_local")? 2000 : 10000)).then(function () {
            if(serialNumber.startsWith("index=")){
                try{
                    serialNumber = "win_ser_"+(parseInt(serialNumber.replace("index=",""))+1);
                }catch(e){
                    serialNumber = "win_ser_local";
                }
            }
            if(serialNumber.startsWith("name=")){
                try{
                    serialNumber = serialNumber.replace("name=","");
                }catch(e){
                    serialNumber = "win_ser_local";
                }
            }else if(!serialNumber.startsWith("win_ser_")){
                try{
                    for(var i in self.playingTabTitles){
                        if(serialNumber == self.playingTabTitles[i].title){
                            serialNumber = self.playingTabTitles[i].winser;
                        }
                    }
    
                    if(!serialNumber.startsWith("win_ser_")){
                        serialNumber = self.playingTabTitles[self.playingTabTitles.length-1].winser;
                    }
                }catch(e){
                    serialNumber = "win_ser_local";
                }
            }
    
            return self.wait("playingTabNames", serialNumber)
                .then(function() {
                    self.currentPlayingTabId = self.playingTabNames[serialNumber];
                    return browser.tabs.update(self.currentPlayingTabId, {active: true});
                });
        });
    }

    doClose() {
        let removingTabId = this.currentPlayingTabId;
        this.currentPlayingTabId = -1;
        delete this.playingFrameLocations[removingTabId];
        return browser.tabs.remove(removingTabId);
    }

    wait(...properties) {
        if (!properties.length)
            return Promise.reject("No arguments");
        let self = this;
        let ref = this;
        let inspecting = properties[properties.length - 1];
        for (let i = 0; i < properties.length - 1; i++) {
            if (!ref[properties[i]] | !(ref[properties[i]] instanceof Array | ref[properties[i]] instanceof Object))
                return Promise.reject("Invalid Argument");
            ref = ref[properties[i]];
        }
        return new Promise(function (resolve, reject) {
            let counter = 0;
            let interval = setInterval(function () {
                if (ref[inspecting] === undefined || ref[inspecting] === false) {
                    counter++;
                    if (counter > self.waitTimes) {
                        reject("Timeout");
                        clearInterval(interval);
                    }
                } else {
                    resolve();
                    clearInterval(interval);
                }
            }, self.waitInterval);
        });
    }

    updateOrCreateTab() {
        let self = this;
        return browser.tabs.query({
            windowId: self.currentPlayingWindowId,
            active: true
        }).then(function (tabs) {
            if (tabs.length === 0) {
                return browser.windows.create({
                    url: browser.runtime.getURL("/bootstrap.html")
                }).then(function (window) {
                    self.setFirstTab(window.tabs[0]);
                    self.contentWindowId = window.id;
                    recorder.setOpenedWindow(window.id);
                    browser.runtime.getBackgroundPage()
                        .then(function (backgroundWindow) {
                            backgroundWindow.master[window.id] = recorder.getSelfWindowId();
                        });
                });
            } else {
                let tabInfo = null;
                return browser.tabs.update(tabs[0].id, {
                    url: browser.runtime.getURL("/bootstrap.html")
                }).then(function (tab) {
                    tabInfo = tab;
                    return self.wait("playingTabStatus", tab.id);
                }).then(function () {
                    // Firefox did not update url information when tab is updated
                    // We assign url manually and go to set first tab
                    tabInfo.url = browser.runtime.getURL("/bootstrap.html");
                    self.setFirstTab(tabInfo);
                });
            }
        });
    }

    setFirstTab(tab) {
        if (!tab || (tab.url && this.isAddOnPage(tab.url))) {
            return this.updateOrCreateTab();
        } else {
            this.currentPlayingTabId = tab.id;
            this.playingTabNames["win_ser_local"] = this.currentPlayingTabId;
            this.playingTabIds[this.currentPlayingTabId] = "win_ser_local";
            this.playingFrameLocations[this.currentPlayingTabId] = {};
            this.playingFrameLocations[this.currentPlayingTabId]["root"] = 0;
            // we assume that there has an "open" command
            // select Frame directly will cause failed
            this.playingTabStatus[this.currentPlayingTabId] = true;
        }
    }

    isAddOnPage(url) {
        if (url.startsWith("https://addons.mozilla.org") ||
            url.startsWith("https://chrome.google.com/webstore")) {
            return true;
        }
        return false;
    }

    /** 
     * eureQa team added code
     * 
     * These function is to support open window command
     */
    doOpenWindow(_url, _windowName) {
        let self = this;
        return browser.windows.create({
            url: _url
        }).then(function (window) {
            return self.setNewTab(window.tabs[0].id, _windowName);
        })
    }

    doOpenWindowAndWait(_url, _windowName) {
        return this.doOpenWindow(_url, _windowName)
    }

    /**
     * eureQa team commented code
     */
    /* doWindowFocus(){
        return browser.tabs.get(this.currentPlayingTabId,function(tabInfo){
           return browser.windows.update(tabInfo.windowId, {focused: true});
        });
    } */

    /** 
     * eureQa team added code
     * 
     * These functions are to support popup related commands
     */
    doWaitForPopUp(_command, _target, _value) {
        return this.doSelectWindow(_target);
    }

    doSelectPopUp(_command, _target, _value) {
        return this.doSelectWindow(_target);
    }

    doSelectPopUpAndWait(_command, _target, _value) {
        return this.doSelectWindow(_target);
    }

    doDeselectPopUp(_command, _target, _value) {
        return this.doSelectWindow('win_ser_local');
    }

    doDeselectPopUpAndWait(_command, _target, _value) {
        return this.doSelectWindow('win_ser_local');
    }
}

/** 
 * eureQa team modified code
 * 
 *  This function is to support window related commads
 */
function isExtCommand(command) {
    switch (command) {
        case "pause":
        case "open":
        //case "windowFocus":
        case "openWindow":
        case "openWindowAndWait":
        /**
         *  eureQa team commented code
         */
        //case "selectFrame":
        case "selectWindow":
        case "close":
        case "waitForPopUp":
        case "selectPopUp":
        case "selectPopUpAndWait":
        case "deselectPopUp":
        case "deselectPopUpAndWait":
            return true;
        default:
            return false;
    }
}

function isWindowMethodCommand(command) {
    switch (command) {
        case "assertAlert":
        case "assertPrompt":
        case "answerOnNextPrompt":
        case "chooseCancelOnNextPrompt":
        case "assertConfirmation":
        case "chooseOkOnNextConfirmation":
        case "chooseCancelOnNextConfirmation":
            return true;
        default:
            return false;
    }
}

/** 
 * eureQa team added code
 * 
 *  This function is to diffrenciate eureqa commads from normal commads
 */
function isEureqaCommand(command) {
    switch (command) {
        case 'jsonCompare':
            return true;
        default:
            return false;
    }
}

/** 
 * eureQa team added code
 * 
 *  This function is to diffrenciate selblocks commads from normal commads
 */
function isSelblocksCommand(command) {
    switch (command) {
        case 'reset':
        case 'if':
        case 'else':
        case 'elseIf':
        case 'endIf':
        case 'for':
        case 'endFor':
        case 'foreach':
        case 'endForeach':
        case 'while':
        case 'endWhile':
        case 'break':
        case 'continue':
        case 'goto':
        case 'gotoIf':
        case 'label':
        case 'skipNext':
        case 'exitTest':
            return true;
        default:
            return false;
    }
}