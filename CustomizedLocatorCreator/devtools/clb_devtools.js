chrome.devtools.panels.elements.onSelectionChanged.addListener(function () {
    chrome.devtools.inspectedWindow.eval("setSelectedElement($0)", {
        useContentScriptContext: true
    });
})