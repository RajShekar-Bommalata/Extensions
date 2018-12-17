/** 
 * eureQa team added code
 * 
 * This process the stored variables before passing it to commands-api.js
 */
function preprocessParameter(value) {
    var match = String(value).match(/^javascript\{((.|\r?\n)+)\}$/);
    if (match && match[1]) {
      //TODO Samit: need an alternative!
      return eval(match[1]).toString();
    }
    return this.replaceVariables(value);
};
  
/*
* Search through str and replace all variable references ${varName} with their
* value in storedVars.
*/
function replaceVariables(str) {
    var stringResult = str;

    // Find all of the matching variable references
    var match = String(stringResult).match(/\$\{\w+\}/g);
    if (!match) {
        return String(stringResult);
    }

    // For each match, lookup the variable value, and replace if found
    for (var i = 0; match && i < match.length; i++) {
        var variable = match[i]; // The replacement variable, with ${}
        var name = variable.substring(2, variable.length - 1); // The replacement variable without ${}
        var replacement = storedVars[name];
        if (replacement && typeof(replacement) === 'string' && replacement.indexOf('$') != -1) {
        replacement = replacement.replace(/\$/g, '$$$$'); //double up on $'s because of the special meaning these have in 'replace'
        }
        if (replacement != undefined) {
        stringResult = stringResult.replace(variable, replacement);
        }
    }
    return stringResult;
};

function handleFormatCommand(message, sender, response) {
    if (message.storeStr !== undefined) {
        storedVars[message.storeVar] = message.storeStr;
        return Promise.resolve();
    } else if (message.echoStr !== undefined){
        sideex_log.info("echo: " + message.echoStr);
        return Promise.resolve();
    }
}

browser.runtime.onMessage.addListener(handleFormatCommand);
