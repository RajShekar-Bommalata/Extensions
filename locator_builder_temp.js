var element = $0;
var temp_element = element.cloneNode().outerHTML;
var locatorsCount = 0;
var locatorsList = {};
var selector = "";
var elementType = temp_element.substring(1, temp_element.indexOf(" "));
var element_has_class = temp_element.includes("class=");
var element_has_id = temp_element.includes("id=");
var element_has_name = temp_element.includes("name=");
var element_has_href = temp_element.includes("href=");
var element_has_for = temp_element.includes("for=");
var element_has_alt = temp_element.includes("alt=");
var element_has_src = temp_element.includes("src=");
var element_has_style = temp_element.includes("style=");


if (element_has_class) {
    buildLocator("class");
}
if (element_has_id && element_has_id != "") {
    buildLocator("id");
}
if (element_has_name) {
    buildLocator("name");
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

function buildLocator(locatorType) {
    if (locatorType == "class" || locatorType == "id" || locatorType == "name") {
        selector = locatorType + '=' + element.getAttribute(locatorType);
        console.log(selector);
        locatorsList.locatorType = {
            type: locatorType,
            locator: selector,
            occurance: 1,
            suggestion: "true green"
        }
    }

    selector = '//' + elementType + '[@' + locatorType + '="' + element.getAttribute(locatorType) + '"]';
    console.log(selector);
    locatorsList.locatorType = {
        	type: locatorType,
            locator: selector,
            occurance: 1,
            suggestion: "true green"
    }
}

console.log(locatorsList);
