var isRecording = false;
var isPause = false;
//var isSelectElement = false;
window.addEventListener("message", function(response) {
    // We only accept messages from ourselves
    if (response.source != window)
        return;
  
    if(response.data.type && (response.data.type == "FROM_PAGE")) {

        if(response.data.action == "updatePreferences"){
            browser.runtime.sendMessage({type: "UPDATE_OPTIONS", data: response.data.options});
        }else if(response.data.action == "updateExecutionSpeed"){
            browser.runtime.sendMessage({type: "UPDATE_EXECUTION_SPEED", data: response.data.speed});
        }else if(response.data.action == "updateCommandsList"){
            browser.runtime.sendMessage({type: "UPDATE_COMMANDS_LIST", data: response.data.data});
        }else if(response.data.action == "startExecution"){
            console.log(response.data);
            browser.runtime.sendMessage({sender: "qascribeActions", action: "startExecution", data: response.data}).then(function(){
                $("#startLocalExecution").hide();
                $("#stopLocalExecution").css({display: "inline-block"});
                $("#pauseContinueExecution").addClass("active_btn").children("i").attr("data-tooltip-content","<span>Pause</span>").removeClass("pause_disabled_icon").addClass("pause_enabled_icon");
                isPause = false;
            });
        }else if(response.data.action == "stopExecution"){
            browser.runtime.sendMessage({sender: "qascribeActions", action: "stopExecution"}).then(function(){
                $("#startLocalExecution").css({display: "inline-block"});
                $("#stopLocalExecution").hide();
                $("#pauseContinueExecution").removeClass("active_btn").children("i").attr("data-tooltip-content","<span>Pause</span>").removeClass("pause_enabled_icon continue_enabled_icon").addClass("pause_disabled_icon");
            });
        }else if(response.data.action == "pauseContinueExecution"){
            browser.runtime.sendMessage({sender: "qascribeActions", action: "pauseContinueExecution"}).then(function(){
                if(isPause){
                    isPause =  false;
                    $("#pauseContinueExecution").addClass("active_btn").children("i").attr("data-tooltip-content","<span>Pause</span>").removeClass("continue_enabled_icon").addClass("pause_enabled_icon");
                }else{
                    isPause =  true;
                    $("#pauseContinueExecution").addClass("active_btn").children("i").attr("data-tooltip-content","<span>Continue</span>").removeClass("pause_enabled_icon").addClass("continue_enabled_icon");
                }
            });
        }else if(response.data.action == "startStopRecording"){
            browser.runtime.sendMessage({sender: "qascribeActions", action: "startStopRecording", scriptData: response.data.scriptData}).then(function(){
                if(isRecording){
                    isRecording =  false;
                    $("#startStopRecording").removeClass("active_btn").attr("title","Start Recording").children("i").removeClass("record_stop_icon").addClass("record_start_enabled_icon");
                }else{
                    isRecording =  true;
                    $("#startStopRecording").addClass("active_btn").attr("title","Stop Recording").children("i").removeClass("record_start_enabled_icon").addClass("record_stop_icon");;
                }
            });
        }if(response.data.action == "GET_TAB_DETAILS"){
            browser.runtime.sendMessage({sender: "qascribeActions", action: "GET_TAB_DETAILS", actionType: response.data.actionType}).then(function(_data){
                window.postMessage({
                    type: "FROM_CONTENT_PAGE",
                    data: _data
                }, "*");
            });
        }else if(response.data.action == "selectCancelElement" || response.data.action == "findElement"){
            if(response.data.action == "selectCancelElement"){
                browser.runtime.sendMessage({sender: "qascribeActions", action: "selectCancelElement", data: response.data}).then(function(_data){
                    if(!response.data.isSelectCancelElement){
                        //isSelectElement = false;
                        $("#selectCancelElement").removeClass('deselect_element_icon').addClass('select_element_icon').attr('data-tooltip-content','<span>Select Element</span>');
                    }else{
                        //isSelectElement = true;
                        $("#selectCancelElement").removeClass('select_element_icon').addClass('deselect_element_icon').attr('data-tooltip-content','<span>Cancel Select</span>');
                    }
                });
            }else if(response.data.action == "findElement"){
                browser.runtime.sendMessage({sender: "qascribeActions", action: "findElement", data: response.data});
            }
        }
    }
}, false);

browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
    window.postMessage({
        type: "FROM_CONTENT_PAGE",
        data: request
    }, "*");
});
