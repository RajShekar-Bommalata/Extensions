chrome.runtime.sendMessage({
    action: 'buildLocator',
}, function (response) {
    console.log(response);
})

function setSelectedElement(el) {
    var element = el;
    var temp_element = element.cloneNode().outerHTML;
    var locatorsList = {};
    locatorsList.xpath=[];
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
    var element_has_title = temp_element.includes("title=");

    if (element_has_class) {
        selector = 'class=' + element.getAttribute("class");
        console.log(selector);
        locatorsList.class = {
            type: "class", locator: selector, occurance: 1, suggestion: "true green"
        }
        selector = '//' + elementType + "[@class='" + element.getAttribute("class") + "']";
        console.log(selector);
        locatorsList.xpath.push({
            type: "xpath",
            locator: selector,
            occurance: 0,
            suggestion: "true green"
        })
    }
    if (element_has_id && element_has_id != "") {
        selector = 'id=' + element.getAttribute("id");
        console.log(selector);
        locatorsList.id = {
            type: "id",
            locator: selector,
            occurance: 0,
            suggestion: "true yellow"
        }
        selector = '//' + elementType + "[@id='" + element.getAttribute("id") + "']";
        locatorsList.xpath.push( {
            type: "xpath",
            locator: selector,
            occurance: 0,
            suggestion: "true yellow"
        })
        console.log(selector);
    }
    if (element_has_name) {
        selector = 'name=' + element.getAttribute("name");
        console.log(selector);
        locatorsList.name = {
            type: "name",
            locator: selector,
            occurance: 1,
            suggestion: "true green"
        }
        //console.log("name=" + element.getAttribute("name"));
        selector = '//' + elementType + "[@name='" + element.getAttribute('name') + "']";
        console.log(selector);
        locatorsList.xpath.push({
            type: "xpath",
            locator: selector,
            occurance: 0,
            suggestion: "true green"
        })
    }
    if (element_has_title) {
        selector='//' + elementType + "[@title='" + element.getAttribute("title") + "']";
    }
    if (element_has_href) {
        selector='//' + elementType + "[@href='" + element.getAttribute("href") + "']";
    }
    if (element_has_for) {
        selector='//' + elementType + "[@for='" + element.getAttribute("for") + "']";
    }
    if (element_has_alt) {
        selector='//' + elementType + "[@alt='" + element.getAttribute("alt") + "']";
    }
    if (element_has_src) {
        selector='//' + elementType + "[@src='" + element.getAttribute("src") + "']";
    }
    if (element_has_style) {
        selector='//' + elementType + "[@style='" + element.getAttribute("style") + "']";
    }
    console.log(locatorsList);
}
