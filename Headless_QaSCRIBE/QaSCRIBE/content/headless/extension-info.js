/**
 * eureQa team added code 
 * 
 * This code will add the currently running qascribe extension details to page DOM
 */
$('<script>var _HeadlessQascribe_Info = _HeadlessQascribe_Info || {};\
    _HeadlessQascribe_Info.version = "'+browser.runtime.getManifest().version+'";\
    </script>').appendTo(document.body);
    