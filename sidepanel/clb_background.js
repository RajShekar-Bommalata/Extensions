chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action == 'buildLocator') {
            chrome.runtime.sendMessage({
                action: 'buildLocatorTable',
                data : request.data,
            }, function (response) {
                //console.log(response);
            })
            sendResponse({
                response: "All Locators received by background"
            });
        } else
            console.log("message not valid");

    })