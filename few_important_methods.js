/*Replace Multiple Space with Null*/
locale.replace(/\s/g, '');

/*Javascript with XPath*/

function getElementByXpath(path) {
   var ele = document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
return ele;
}

var ele = "//input[@id='twotabsearchtextbox']";
ele=getElementByXpath(ele);
console.log(ele);
if (ele) {
       ele.value="English Willow";
}

/*CSS Computed Style: To get css property ( color rgb value)of element using JS : */

function getElementByXpath(path) {
    var ele = document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    return ele;
}
var ele = "//rock-attribute-list[contains(@context-data,'de-DE')]//div[@name='productfeatures']//span[2]";
ele = getElementByXpath(ele);
if (ele) {
    //Get Color (rgb value) Of element 
    var color = window.getComputedStyle(ele).color;
    color;
}


/*  Check file exists or not */


function doesFileExist(url) {
    var xhr = new XMLHttpRequest();
    try {
        xhr.open('HEAD', url, false);
        xhr.send();
    }
    catch(err) {
        console.log("File Open Error");
    }    
    console.log(xhr.status);
    if (xhr.status != "404") {
        return true;
    } else {
        return false;
    }
}
