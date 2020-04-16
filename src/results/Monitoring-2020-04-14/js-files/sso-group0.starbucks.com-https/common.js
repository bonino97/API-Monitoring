//////////////////////////////////////////
// LOGGING FUNCTIONS
//////////////////////////////////////////

var g_logindent = 0;

//============================================================
// Adds an log entry to 'consoleDIV' element if any.
// Format:
//   <time><message><br>
//============================================================
function addToLog(a_str)
{
  var console = document.getElementById('consoleDIV');
  if(null != console) {
    var date = new Date();
    var str = "<br>" + date.getTime();
    
    for(i=0; i < g_logindent + 1; i++) {
        str += "____";
    }
  
    console.innerHTML += str + a_str;
  }
}

//============================================================
// Increases the current log entries indentation 
// Adds an log entry to 'consoleDIV' element if any.
//============================================================
function addToLogEnter(a_str)
{
    addToLog(a_str);
    g_logindent++;
}

//============================================================
// Decreases the current log entries indentation 
// Adds an log entry to 'consoleDIV' element if any.
//============================================================
function addToLogExit(a_str)
{
    g_logindent--;
    addToLog(a_str);
}


//////////////////////////////////////////
// String helper functions
//////////////////////////////////////////

//============================================================
// Returns a hex representation of a given string
// Example:
//    "abc" => "616263"
//============================================================
function stringToHex(a_str)
{
    var res = "";
    for (i=0; i<a_str.length; i++) {
        res += a_str.charCodeAt(i).toString(16);
    }
    return res;
}

//============================================================
// Performs Base64 encoding of the input string
//
// Input
//    input - String, string to encode
// Return
//   String, Base64 encoded input string
// Example:
//    "abc" => "YWJj"
//============================================================
function Base64encode (input) 
{
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    var  _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
        _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
        _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
    }

    return output;
}

//============================================================
// Performs Base64 decoding of the input string
//
// Input
//    input - String, string to decode
// Return
//   String, Base64 decoded input string
//============================================================
function Base64decode (input)
{
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    var  _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
    while (i < input.length) {
        enc1 = _keyStr.indexOf(input.charAt(i++));
	enc2 = _keyStr.indexOf(input.charAt(i++));
	enc3 = _keyStr.indexOf(input.charAt(i++));
	enc4 = _keyStr.indexOf(input.charAt(i++));
 
	chr1 = (enc1 << 2) | (enc2 >> 4);
	chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
	chr3 = ((enc3 & 3) << 6) | enc4;
 
	output = output + String.fromCharCode(chr1);
 
	if (enc3 != 64) {
		output = output + String.fromCharCode(chr2);
	}
	if (enc4 != 64) {
		output = output + String.fromCharCode(chr3);
	}
 
    }
 
    return output;
}
	

//============================================================
// Removes leading spaces from a given string
// Example:
//    "    abc" => "abc"
//============================================================
function ltrim(a_str)
{
    return a_str.replace(/^\s+/,"");
}



//////////////////////////////////////////
// Misc functions
//////////////////////////////////////////
function getExternalBaseURL()
{
    var tokens = window.location.href.split("/"); 
    var result = tokens[0] + "//" + tokens[2];
    return result;
}

function getExternalBaseHost()
{
    var host = window.location.host;
    if(host.indexOf(']') != -1) { // ipv6
        host = host.substr(0, host.indexOf(']')+1);
    } else if(host.indexOf(':') != -1) {
        host = host.substr(0, host.indexOf(':'));
    }
    return host;
}
    
function getExternalBasePort()
{
    var port = window.location.port;
    if(!port) {
        if(window.location.protocol == "https:")
            port = 443;
        else
            port = 80;
    }
    return port;
}

var ar4cmatch={
        LastMRH_Session:'([0-9a-f]{5,12})',
        apm_swg_LastMRH_Session:'([0-9a-f]{5,12})',
        apm_swg_category:'([a-zA-Z0-9/_() -]{1,64})',
        MRHSession:'([0-9a-f]{32})'
};

function get_cookie(a_cookie_name)
{
    var r4c='(.*?)';
    if(a_cookie_name in ar4cmatch){
        r4c=ar4cmatch[a_cookie_name];
    }
    var results = document.cookie.match('(^|;)\x20?' + a_cookie_name + '='+r4c+'(;|$)');

    if(results){
        return (unescape (results[2]));
    } else {
        return null;
    }
}

function bind(obj, fn)
{
    return function() { return fn.apply(obj, arguments); }
}

function arrayContains(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == value) return true;
    }
    return false;
}

function isArray(arr)
{
    return !!arr && arr.constructor == Array;
}

function forEach(array, callback, thisArg) {
    if (!isArray(array)) throw new Error('forEach called on something that is not Array');
    for (var i = 0, len = array.length; i < len; ++i) {
        callback.call(thisArg, array[i], i, array);
    }
}

function parseJSON(text)
{
    if (typeof JSON == "object" && typeof JSON.parse == "function") {
        return JSON.parse(text);
    }

    //Fallback for IE7, taken from json2.js library
    if (/^[\],:{}\s]*$/.test(
            text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        return eval('(' + text + ')');
    }

    throw new SyntaxError('Invalid JSON.');
}

//
// Accepts XMLHttpRequest and returns XML object when possible or 'null'.
// It also handles file:// protocol nuances in IE.
//
function getXmlDoc(xhr)
{
    var xmlDoc = null;
    var isLocal = (xhr.status == 0);

    if ((xhr.readyState == 4) && (xhr.status == 200 || isLocal) && (xhr.responseXML)) {
        if (xhr.responseXML.document) {
            xmlDoc = xhr.responseXML;
        }
        else {
            if (!isLocal) {   // IE
                return xhr.responseXML;
            }
            else {
                // Local failure--always happens
                var axDoc = new ActiveXObject("Microsoft.XMLDOM");
                axDoc.async = false;
                axDoc.loadXML(xhr.responseText);
                if (axDoc.documentElement)
                    xmlDoc = axDoc;
            }
        }
    }
    return xmlDoc;
}
