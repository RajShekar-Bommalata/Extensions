var element = $0;
var temp_element = element.outerHTML;
var elementType = temp_element.substring(1, temp_element.indexOf(" "));
var element_has_class = temp_element.includes("class=");
var element_has_id = temp_element.includes("id=");
var element_has_name = temp_element.includes("name=");
var element_has_href = temp_element.includes("href=");
var element_has_for = temp_element.includes("for=");
var element_has_alt = temp_element.includes("alt=");


if (element_has_class) {
    console.log('class="' + element.getAttribute("class") + '"');
    console.log('//' + elementType + '[@class="' + element.getAttribute("class") + '"]');
}
if (element_has_id) {
    console.log('id=' + element.getAttribute("id"));
    console.log('//' + elementType + '[@id="' + element.getAttribute("id") + '"]');
}
if (element_has_name) {
    //console.log("name=" + element.getAttribute("name"));
    console.log('//' + elementType + '[@name="' + element.getAttribute("name") + '"]');
}
if (element_has_href) {
    //console.log("href=" + element.getAttribute("href"));
    console.log('//' + elementType + '[@href="' + element.getAttribute("href") + '"]');
}
if (element_has_for) {
    //console.log("for=" + element.getAttribute("for"));
    console.log('//' + elementType + '[@for="' + element.getAttribute("for") + '"]');
}
if (element_has_alt) {
    //console.log("alt=" + element.getAttribute("alt"));
    console.log('//' + elementType + '[@alt="' + element.getAttribute("alt") + '"]');
}
