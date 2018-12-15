chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action == 'buildLocator') {
            console.log("element is received in background");
            sendResponse({
                response: "element is sent to locatorBuilder.js"
            });
        } else
            console.log("message not valid");

    })