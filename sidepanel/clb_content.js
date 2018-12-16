

var selector = "";
var elementType = "";
var element = "";
var locatorsList = {};

function build_Locators(el) {
    element = el;
    locatorsList.locator = [];
    var temp_element = element.cloneNode().outerHTML;
    elementType = temp_element.substring(1, temp_element.indexOf(" "));
    var element_has_class = temp_element.includes("class=");
    var element_has_id = temp_element.includes("id=");
    var element_has_name = temp_element.includes("name=");
    var element_has_href = temp_element.includes("href=");
    var element_has_for = temp_element.includes("for=");
    var element_has_alt = temp_element.includes("alt=");
    var element_has_src = temp_element.includes("src=");
    var element_has_style = temp_element.includes("style=");
    var element_has_title = temp_element.includes("title=");

    if (element_has_class) {
        buildLocator("class");
    }
    if (element_has_id && element_has_id != "") {
        buildLocator("id");
    }
    if (element_has_name) {
        buildLocator("name");
    }
    if (element_has_title) {
        buildLocator("title");
    }
    if (element_has_href) {
        buildLocator("href");
    }
    if (element_has_for) {
        buildLocator("for");
    }
    if (element_has_alt) {
        buildLocator("alt");
    }
    if (element_has_src) {
        buildLocator("src");
    }
    if (element_has_style) {
        buildLocator("style");
    }
    console.log(locatorsList);

    chrome.runtime.sendMessage({
        action: 'buildLocators',
        data : locatorsList,
    }, function (response) {
        //console.log(response);
    })
}

function buildLocator(locatorType) {
    if (locatorType == "class" || locatorType == "id" || locatorType == "name") {
        selector = locatorType + '=' + element.getAttribute(locatorType);
        //console.log(selector);
        locatorsList.locator.push({
            type: locatorType,
            locator: selector,
            occurance: 1,
            suggestion: "true green"
        })
    }

    selector = '//' + elementType + '[@' + locatorType + "='" + element.getAttribute(locatorType) + "']";
    //console.log(selector);
    locatorsList.locator.push({
        type: "xpath",
        locator: selector,
        occurance: locator_Occurance(selector),
        suggestion: "true green"
    })
}

function locator_Occurance(selector) {
    var result = document.evaluate("count(" + selector + ")", document, null, XPathResult.NUMBER_TYPE, null);
    return result.numberValue;
}