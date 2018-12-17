var selectedElementPath = "";
var css_attributes = [
    'id'
    , 'class'
    , 'name'
    , 'type'
    , 'alt'
    , 'title'
    , 'value'
];

function generateShadowDomCssSelector(_selectedElement) {
    return [
        [selectorFunction(_selectedElement, false, true, true), "Shadow DOM", "no-Id"],
        [selectorFunction(_selectedElement, false, false, true), "Shadow DOM", "no-Id-Class"],
        [selectorFunction(_selectedElement, false, false, false), "Shadow DOM", "nth-type"],
        [selectorFunction(_selectedElement, true, false, true), "Shadow DOM", "no-Class"],
        [selectorFunction(_selectedElement, true, true, true), "Shadow DOM", "all"]
    ];
}

function selectorFunction(_selectedElement, _isId, _isClass, _isAttr){
    selectedElementPath = "";
    while (_selectedElement.tagName !== "HTML") {
        if (_selectedElement.parentElement !== null) {
            selectedElementPath = getCSSSubPath(_selectedElement, _isId, _isClass, _isAttr) + " " + selectedElementPath;
            _selectedElement = _selectedElement.parentElement;
        } else {
            selectedElementPath = "#SHADOWDOM# " + getCSSSubPath(_selectedElement, _isId, _isClass, _isAttr) + " " + selectedElementPath;
            _selectedElement = _selectedElement.getRootNode().host;
        }
    }
    return selectedElementPath;
}

function getCSSSubPath(e, _isId, _isClass, _isAttr) {
    var _parentElement = ((e.parentElement !== null) ? e.parentElement : e.getRootNode());
    for (var i = 0; i < css_attributes.length; i++) {
        var attr = css_attributes[i];
        var value = e.getAttribute(attr);
        if (value && value.trim() != "") {
            if (attr == 'id' && _isId) {
                return '#' + value;
            }
            if (attr == 'class' && _isClass) {
                
                if (_parentElement.querySelectorAll(':scope > '+e.nodeName.toLowerCase() + '.' + value.trim().replace(/\s+/g, ".").replace("..", ".")).length > 1) {
                    return e.nodeName.toLowerCase() + '.' + value.trim().replace(/\s+/g, ".").replace("..", ".") + ':nth-of-type(' + getNodeNbr(e) + ')';
                } else {
                    return e.nodeName.toLowerCase() + '.' + value.trim().replace(/\s+/g, ".").replace("..", ".");
                }

            }
            if(attr !== 'id' && attr !== 'class' && _isAttr){

                if (_parentElement.querySelectorAll(':scope > '+e.nodeName.toLowerCase() + '[' + attr + '="' + value + '"]').length > 1) {
                    return e.nodeName.toLowerCase() + '[' + attr + '="' + value + '"]' + ':nth-of-type(' + getNodeNbr(e) + ')';
                } else {
                    return e.nodeName.toLowerCase() + '[' + attr + '="' + value + '"]';
                }

            }
        }
    }
    if (getNodeNbr(e)) {
        return e.nodeName.toLowerCase() + ':nth-of-type(' + getNodeNbr(e) + ')';
    }
    else {
        return e.nodeName.toLowerCase();
    }
};

function getNodeNbr(current) {
    var childNodes = ((current.parentElement !== null) ? current.parentElement.childNodes : current.getRootNode().childNodes);
    var total = 0;
    var index = -1;
    for (var i = 0; i < childNodes.length; i++) {
        var child = childNodes[i];
        if (child.nodeName == current.nodeName) {
            if (child == current) {
                index = total;
            }
            total++;
        }
    }

    var _parentElement = ((current.parentElement !== null) ? current.parentElement : current.getRootNode());
    if (_parentElement.querySelectorAll(':scope > '+current.tagName.toLowerCase()).length > 1) {
        return (index + 1).toString();
    } else {
        return index;
    }
};

browser.runtime.onMessage.addListener(function(message, sender, response){
	if(message.shadowDomAttrList){
		css_attributes = message.shadowDomAttrList;
    }
});

/* browser.storage.sync.get("settings").then(function(data){
    css_attributes = data.settings.shadowDomSettings.attrList;
}); */