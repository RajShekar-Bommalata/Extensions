
var html ="";
var locators_count=0;
var locator_table = document.getElementById("locatorTable");

chrome.devtools.panels.elements.createSidebarPane("Customized Locators",
    function (sidebar) {
        sidebar.setPage("clb_devtools.html");
        sidebar.setHeight("8ex");
    });

chrome.devtools.panels.elements.onSelectionChanged.addListener(function () {
    chrome.devtools.inspectedWindow.eval("build_Locators($0)", {
        useContentScriptContext: true
    });
})

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action == 'buildLocators') {
            //console.log(request.data); 
            build_Locators_table(request.data.locator);
            sendResponse({
                response: "All Locators received by sidepane"
            });
        } else
            console.log("message not valid");

    })
function build_Locators_table(data) {
    
    document.getElementById("locatorTable").innerHTML = "";
    for(locators_count=0;locators_count<data.length;locators_count++){
        html+='<tr>'
        html+='<td>'+data[locators_count].type+'</td>'
        html+='<td>'+data[locators_count].locator+'</td>'
        html+='<td>'+data[locators_count].occurance+'</td>'
        if(data[locators_count].occurance==1){
            html+='<td><img src="correct.png" class="icons"><img src="clipboard.png" class="icons"></td>'
        }
        else{
            html+='<td><img src="wrong.png" class="icons"><img src="clipboard.png" class="icons"></td>'
        }
        //html+='<td><img src="clipboard.png" class="icons"></td>'
        html+='</tr>'
    document.getElementById("locatorTable").innerHTML = html;
    } 
}