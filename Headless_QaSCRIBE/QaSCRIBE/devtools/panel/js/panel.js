chrome.devtools.panels.elements.onSelectionChanged
    .addListener(function(){
        generateSelector(false);
    });

function generateSelector(_isSelectEvent){
    chrome.devtools.inspectedWindow.eval('generateShadowDomCssSelector($0)', {
        useContentScriptContext: !0
    }, function(result){
        if(_isSelectEvent){
            respond(result);
        }
        var htmlString = "";
        if(result != undefined){
            result.forEach(function(item, index){
                htmlString += '<div class="selectorGroup">\
                                <label>'+ item[2]+' :</label><img src="img/copyToClipboard.png" class="copyToClipboard" data-clipboard-text="'+ item[0] +'" data-tooltip-content="<span>Copied</span>">\
                                <span class="cssSelectorPath">'+ item[0] +'</span>\
                            </div>';
            });
            $("#selectorsContainer").html(htmlString);
        }else{
            $("#selectorsContainer").html('<div>Invalid element.</div>');
        }
    });
}

$(document).ready(function(){
    generateSelector(false);

    $('body')
    .on('click', '.copyToClipboard:not(.tooltipstered)', function(){
        $(this)
            .tooltipster({
                trigger: 'click',
                side: ['top', 'bottom'],
                timer: 300
            })
            .tooltipster('open');
    });

    new Clipboard('.copyToClipboard');
});