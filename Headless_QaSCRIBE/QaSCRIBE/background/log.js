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
class Log {

    constructor() {}

    log(str) {
        this._write(str, "log-info");
    }

    info(str) {
        this._write("[info] " + str, 'info', "log-info");
    }

    error(str) {
        let errorMessage = modifyErrorLogMessage(str);
        this._write("[error] " + errorMessage, 'error', "log-error");
    };

    /**
     * eureQa team modified code
     */
    _write(str, logType, className) {
        console.log(str);
        browser.tabs.sendMessage(senderData.tab.id, {
            responseType:"QaSCRIBE_Instruction_Log", 
            instructionInfo: scriptDetails.instructionList[currentPlayingCommandIndex],
            instructionLogText: str,
            instructionLogType: logType
        });
    }
}

// TODO: new by another object(s)
var sideex_log = new Log();

