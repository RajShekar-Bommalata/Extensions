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

var master = {};

var senderData = {};
var scriptDetails = {};
var isAutoAssertTitle = true;
var isRecordAbsoluteURL = true;
var locatorsRecordOrder = ['ui'
    , 'id'
    , 'link'
    , 'name'
    , 'css'
    , 'dom:name'
    , 'xpath:link'
    , 'xpath:img'
    , 'xpath:attributes'
    , 'xpath:idRelative'
    , 'xpath:href'
    , 'dom:index'
    , 'xpath:position'
];
var visibilityCheck = false;

/**
 * eureQa team added code
 * 
 * This is to get/store window id
 */
var panelWIndowId = 0;

browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.type) {
        if(request.type == "UPDATE_OPTIONS"){
            console.log("OPTIONS::: ", request);
            defaultTimeout = request.data.defaultTimeout;
            defaultSpeedInterval = request.data.defaultInterval;
            isAutoAssertTitle = request.data.isAutoAssertTitle;
            isRecordAbsoluteURL = request.data.isRecordAbsoluteURL;
            locatorsRecordOrder = request.data.locatorsRecordOrder;
            visibilityCheck = request.data.visibilityCheck;

            return browser.tabs.query({currentWindow: true, url: "<all_urls>"})
                .then(function(tabs) {
                    for(let tab of tabs) {
                        browser.tabs.sendMessage(tab.id, {
                            defaultTimeout: ((defaultTimeout != -1) ? defaultTimeout : 30000),
                            locatorsRecordOrder: locatorsRecordOrder,
                            visibilityCheck: visibilityCheck
                        });
                    }
                return Promise.resolve();
            });
        }else if(request.type == "UPDATE_COMMANDS_LIST"){

        }else if(request.type == "UPDATE_EXECUTION_SPEED"){
            defaultSpeedInterval = request.data.defaultInterval;
        }
    }
});

browser.windows.onRemoved.addListener(function(windowId) {
    let keys = Object.keys(master);
    for (let key of keys) {
        if (master[key] === windowId) {
            delete master[key];
            if (keys.length === 1) {
                browser.contextMenus.removeAll();
            }
        }
    }
});

var port;
browser.contextMenus.onClicked.addListener(function(info, tab) {
    port.postMessage({ cmd: info.menuItemId });
});

var typesOfCommands = ["assert", "verify", "waitFor", "store"];
browser.runtime.onConnect.addListener(function(m) {
    port = m;
    port.onMessage.addListener(function portListener(msg) {
        if(msg.contextMenu){
            browser.contextMenus.removeAll();
            var contextMenuData = msg.contextMenu;

            contextMenuData.forEach(function(item) {
                if(item.command == "open"){
                    browser.contextMenus.create({
                        id: item.command,
                        title: item.command+" | "+item.target,
                        documentUrlPatterns: ["<all_urls>"],
                        contexts: ["all"]
                    });
                }else{
                    typesOfCommands.forEach(function(type) {
                        browser.contextMenus.create({
                            id: type+item.command,
                            title: type+item.command+" | "+item.target+(item.value!=undefined?' | '+item.value:''),
                            documentUrlPatterns: ["<all_urls>"],
                            contexts: ["all"]
                        });
                    });
                }
            });
        }else if(msg.removeContextMenu){
            browser.contextMenus.removeAll();
        }
        port.onMessage.removeListener(portListener);
    });
});
