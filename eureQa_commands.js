function jsonCompare(inputData) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: "http://192.168.0.46:8898/eureQaRestApi/api/CommandsApi/GetCommand",
      //url: "https://www.eureqatest.dev/eureQaRestApi/api/CommandsApi/GetCommand",
      type: "POST",
      headers: "a3N5YW1hbGE6dHJpcG9kMTIz",
      cache: true,
      data: JSON.stringify(inputData),
      contentType: "application/json",
      dataType: 'json'
    }).done(function (data) {
      console.log(data);
      
    }).fail(function (xhr) {
      console.log('error', xhr);
    });
  });
}

//var obj1= JSON.stringify({'status':'Success'});

var _command = "jsonAssertPathExists";
//var _target ='{"a":{},"b":{},"c":{"c1":{}}}';
var _target = '{"Depth_level":"1","a":{"Depth_level":"2"},"b":{"Depth_level":"2"},"c":{"c1":{"Depth_level":"3","c11":{"Depth_level": "4"}}}}' + '||' + '$.c.c1';
var _value = "response";

var inputData = {
  "command": _command,
  "target": _target,
  "value": _value
};
var response = jsonCompare(inputData);
