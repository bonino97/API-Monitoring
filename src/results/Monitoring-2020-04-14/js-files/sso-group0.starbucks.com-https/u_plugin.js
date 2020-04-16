//*********************************************************************************
//*                                                                               *
//*                      UPlugin class                                            *
//*                                                                               *
//*********************************************************************************

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Default constructor
//
//  Parameters
//    no parameters
//
//  Return value
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
function UPlugin()
{
}

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Returns installed version of specified plugin
//
//  Parameters
//    a_mimeType            - [String] mime-type of the content plugin should handle
//    a_pluginName          - [String] name of the plugin to check
//
//  Return value [String]
//    in format "xxxx.xxxx.xxxx.xxxx" w/o leading zeroes
//    if plugin is not installed "0.0.0.0" is returned  
//
///////////////////////////////////////////////////////////////////////////////////
UPlugin.prototype.getVersion = function(a_mimeType, a_pluginName)
{
    addToLogEnter('UPlugin.getVersion("' + a_mimeType + '", "' + a_pluginName + '") - enter');

    var res = "0.0.0.0";
    
    navigator.plugins.refresh(false);
	
    if(null == navigator.mimeTypes[a_mimeType]) { // do we have the provided mime-type registered ?
        addToLog("UPlugin.getVersion() - MimeType (" + a_mimeType + ") is not registered ");

    } else if(null == navigator.mimeTypes[a_mimeType].enabledPlugin) { // plugin should be enabled for this mime-type
        addToLog("UPlugin.getVersion() - MimeType (" + a_mimeType + ") does not have an enabled plugin ");

    } else if(0 != navigator.mimeTypes[a_mimeType].enabledPlugin.name.indexOf(a_pluginName) ) { // enabled plugin for this mime-type must be ours
        addToLog("UPlugin.getVersion() - MimeType (" + a_mimeType + ") has another enabled plugin (" + navigator.mimeTypes[a_mimeType].enabledPlugin.name + ")" );

    } else {
      // check for the version
      // our controls should have version inside description field
      version = navigator.mimeTypes[a_mimeType].enabledPlugin.description.toLowerCase();
      if( 0 <= version.indexOf("ver. ") ) {
          version = version.substring(version.indexOf("ver. ") + 5);
      }

      // plugin for Mac currently does not have a version number inside it's description field CR 92235.
      // put bogus minimal version "0.0.0.1" if we can not detect the version
      if( 0 > version.indexOf(".") ) {
          version = "0.0.0.1";
      }

      res = version;
    }

    addToLogExit('UPlugin.getVersion() - exit, result = "' + res + '"');

    return res;
}

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Checks whether we have specified plugin installed or needs to be updated
//
//  Parameters
//    a_mimeType            - [String] mime-type of the content plugin should handle
//    a_pluginName          - [String] name of the plugin to check
//    a_pluginLatestVersion - [String] latest available version of the plugin
//
//  Return value [int]
//    0 - the latest or greater version is installed (everything is OK)
//    -1 - plugin is not installed (installation is required)
//    -2 - old version is installed (update is available)
//
///////////////////////////////////////////////////////////////////////////////////
UPlugin.prototype.check = function(a_mimeType, a_pluginName, a_pluginLatestVersion)
{
    addToLogEnter('UPlugin.check("' + a_mimeType + '", "' + a_pluginName + '", "' + a_pluginLatestVersion + '") - enter');

    var res = -1;

    var version = this.getVersion(a_mimeType, a_pluginName);

    if("0.0.0.0" != version) {
      res = (0 < this.compareVersion(version, a_pluginLatestVersion)) ? -2 : 0;
    }

    addToLogExit("UPlugin.check() - exit, result = " + res);

    return res;
}


///////////////////////////////////////////////////////////////////////////////////
//
// Description
//   Performs version comparison 
//   it is a three-state substraction (result = a_nVersion - a_eVersion)
// 
// Parameters
//   a_eVersion - [String] dot delimetered value of existing version
//   a_nVersion - [String] dot delimetered value of latest available version
//
// Return value [int]
//  -1 - a_eVersion > a_nVersion (we have a newer version)
//   0 - a_eVersion ==  a_nVersion
//   1 - a_eVersion < a_nVersion (we have an older version)
//
///////////////////////////////////////////////////////////////////////////////////
UPlugin.prototype.compareVersion = function(a_eVersion, a_nVersion)
{
    addToLogEnter('UPlugin.compareVersion("' + a_eVersion + '", "' + a_nVersion + '") - enter');

    var res = 0;
    var verE = a_eVersion + ".";
    var verN = a_nVersion + ".";

    do {
        var numE = 1 * (verE.substring(0, verE.indexOf(".")));
        var numN = 1 * (verN.substring(0, verN.indexOf(".")));

        verE = verE.substring(verE.indexOf(".") + 1);
        verN = verN.substring(verN.indexOf(".") + 1);

        if (numE < numN) {
            res = 1;
            break;

        } else if (numE > numN) {
            res = -1;
            break;
        }
	    
    } while( (0 <= verE.indexOf(".")) || (0 <= verN.indexOf(".")) )

    addToLogExit("UPlugin.compareVersion() - exit, result = " + res);
    return res;
}


///////////////////////////////////////////////////////////////////////////////////
//
// Description
//   Triggers installation of specified plugin XPI package
// 
// Parameters
//    a_id               - [String] id of installation, caller can put here any value.
//    a_packageURL       - [String] URL to download the package from (could be both relative or absolute)
//    a_callBackFunction - [function(a_id, a_url, a_statusCode)] - function to receive notification 
//                         about installation process
//    a_userFriendlyName - [String] user friendly package name, will be displayed by browser inside 
//                         installation confirmation box 
//
// Return value [boolean]
//    try - success
//
///////////////////////////////////////////////////////////////////////////////////
UPlugin.prototype.install = function(a_id, a_packageURL, a_callbackFunc, a_userFriendlyName)
{
//    addToLogEnter('UPlugin.prototype.install("'+ a_packageURL + '", "' + a_callbackFunc + '") - enter');
    addToLogEnter('UPlugin.prototype.install("'+ a_packageURL + '") - enter');
    var res = false;

        function UPlugin_installCallback(a_id, a_callbackFunc)
        {  
            this.m_id = a_id;
            this.m_callbackFunc = a_callbackFunc;
        }

        UPlugin_installCallback.prototype.callback = function(a_url, a_status)
        {
            this.m_callbackFunc(this.m_id, a_url, a_status);
        }

        UPlugin_installCallback.getCallbackFunc = function(a_obj, a_methodName)
        {
            return function(a_url, a_status) { a_obj[a_methodName](a_url, a_status); }
        }

    _obj = new UPlugin_installCallback(a_id, a_callbackFunc);

    var xpi = new Object();
    xpi[a_userFriendlyName] = a_packageURL;

    try {
       res = InstallTrigger.install(xpi, UPlugin_installCallback.getCallbackFunc(_obj, "callback"));
    } catch (e) {
	//FF 4 workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=638292
	if(-1 != navigator.userAgent.indexOf("Firefox/4.0") && -1 == location.href.indexOf("&installtrigger_workaround=1")) {
		location.href = location.href+"&installtrigger_workaround=1";    
	}   
	res = false;
    }

    addToLogExit('UPlugin.prototype.install() - exit, result = ' + res);
    return res;
}


///////////////////////////////////////////////////////////////////////////////////
//
// Description
//   Returns human readable explanation of the code returned by check() method
// 
// Parameters
//    a_code             - [int] code returned by check() function
//
// Return value [String]
//    Returns human readable explanation of the code
//
///////////////////////////////////////////////////////////////////////////////////
UPlugin.prototype.checkCodeToStr = function(a_code)
{
    if(-1 == a_code) {
        return "(code = -1) - plugin is not installed or disabled (installation is required)";

    } else if(0 == a_code) {
        return "(code = 0) - the version equal or greater than asked is installed (everything seems to be OK)";

    } else if(1 == a_code) {
        return "(code = 1) - the version older than asked is installed (update might be required)";
    }    
}


//*********************************************************************************
//*
//*                  UPluginInstaller class
//*
//*********************************************************************************
//*
//* Description:
//*   Checks the current version of the specified plugin
//*   and performs installation of it with UI if necessary
//*
//*   Communicates with the caller through the callback function.
//*   Callback function can be assigned to "eventHandler" member of the instance
//*
//*     function callbackEvent(a_control_id, a_eventName, a_param)
//*       where,
//*         a_control_id  - [String] identificator of the object instance (paramtere to constructor)
//*         a_event_name  - [String] name of the event, available events:
//*                                  installation_done
//*                                  installation_cancelled
//*                                  installation_failed
//*         a_version     - [String] contains the version of installed plugin
//*                                  if no plugin installed - contains "0.0.0.0"   
//*         a_param       - [String] some parameter for event
//*
//* 
//* Notes:
//*   Requires an HTML conatainer. 
//*
//* Example:
//* 
//*   var plugin = new UPluginInstaller("testPlugin", document.getElementById("pluginDIV"));
//*   plugin.eventHandler = onControlEvent;
//*   var params = new Array()
//*   params['mime_type'] = "application/x-f5-host-plugin";
//*   params['plugin_name'] = "F5 Networks Firepass Host";
//*   params['available_version'] = "6000.0.0.0";
//*   params['package_url'] = "https://172.30.8.197/public/download/urhostplg.xpi";
//*   plugin.install(params);
//*
//*********************************************************************************

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Default constructor
//
//  Parameters
//    a_name       - [String] identificator of the instance of the object, 
//                   will be sent to callback function as a paramter
//    a_container  - [Object] HTML container
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////
//
//  EVENTS
//    text_out_start
//    fired when object is about to show UI inside provided container
//      a_event_name  - "text_out_start"
//      a_param - contains UI form ID, for example, "OnDoJavaInstall"
//
///////////////////////////////////////////////////////////////////////////////////

function UPluginInstaller(a_name, a_container)
{
    this.m_name = a_name || "unknown";
    this.m_container = a_container;

    this.is_chrome = ( navigator.userAgent.toLowerCase().indexOf('chrome') > -1 );
    this.is_linux = ( navigator.userAgent.indexOf("Linux") != -1);
    this.is_macintosh = ( navigator.userAgent.indexOf("Macintosh") != -1);
    this.mimeType = "";
    this.pluginName = "";
    this.description = "";	
    this.packageURL = "";
    this.packageManualURL = "";
    this.latestVersion = "0.0.0.0";
    this.minimalVersion = "0.0.0.0";
    this.eventHandler = null;
    this.m_install_type = -1;
    this.m_currentVersion = "0.0.0.0";
    this.m_plugin = new UPlugin();
}

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Performs installation of the specified plugin
//
//  Parameters
//    a_params               - [Array] Array of input parameters
//      required values:
//          mime_type          - [String]
//          plugin_name        - [String]
//          package_url        - [String]
//      optional values:
//          package_manual_url - [String]
//          available_version  - [String] // by default it is "0.0.0.0"
//          minimal_version    - [String] // by default it will be equal to available_version
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.install = function(a_params)
{
    addToLogEnter('UPluginInstaller.prototype.install() - enter');

    if(null == a_params['mime_type']) {
        throw(new Error('UPluginInstaller.prototype.install() - "mime_type" parameter is not specified'));
    }
    if(null == a_params['plugin_name']) {
        throw(new Error('UPluginInstaller.prototype.install() - "plugin_name" parameter is not specified'));
    }
    if(null == a_params['package_url']) {
        throw(new Error('UPluginInstaller.prototype.install() - "package_url" parameter is not specified'));
    }
    if(null == this.m_container) {
        throw(new Error('UPluginInstaller.prototype.install - "this.m_container" is not initialized'));
    }
    if(null == this.eventHandler) {
        throw(new Error('UPluginInstaller.prototype.install() - "this.eventHandler" is not initialized'));
    }

    this.m_container.installer = this;
    this.mimeType = a_params['mime_type'];
    this.pluginName = a_params['plugin_name'];
    this.description = a_params['plugin_name'];
    this.packageURL = a_params['package_url'];
    this.packageManualURL = a_params['package_manual_url'];

    // check for optional parameters
    if(null != a_params['available_version']) {
        this.latestVersion = a_params['available_version']
        this.minimalVersion = a_params['available_version']
    }

    this.minimalVersion = this.latestVersion;
    if(null != a_params['minimal_version']) {
        this.minimalVersion = a_params['minimal_version'];
    }

    
    // check the installed plugin version
    if(0 != this.checkVersion()) {
        var _onInstall = "javascript:UPluginInstaller.prototype.EventHandler('" + this.m_container.id + "', 'install')";
        window.setTimeout(_onInstall, 1);

    } else {
        this.OnInstallationDone();
    }

    addToLogExit('UPluginInstaller.prototype.install() - exit');

}


///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Performs installation of the specified plugin using Java Installer
//
//  Parameters
//    a_params                 - [Array] Array of input parameters
//      required values:
//          mime_type          - [String]
//          plugin_name        - [String]
//          package_url        - [String]
//          package_manual_url - [String]
//          package_signature  - [String]
//      optional values:
//          available_version  - [String] // by default it is "0.0.0.0"
//          minimal_version    - [String] // by default it will be equal to available_version
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.installUsingJava = function(a_params)
{
    addToLogEnter('UPluginInstaller.prototype.UPluginInstaller.prototype.installUsingJava() - enter');

    // check for required parameters
    if(null == a_params['mime_type']) {
        throw(new Error('UPluginInstaller.prototype.UPluginInstaller.prototype.installUsingJava() - "mime_type" parameter is not specified'));
    }
    if(null == a_params['plugin_name']) {
        throw(new Error('UPluginInstaller.prototype.UPluginInstaller.prototype.installUsingJava() - "plugin_name" parameter is not specified'));
    }
    if(null == a_params['package_url']) {
        throw(new Error('UPluginInstaller.prototype.UPluginInstaller.prototype.installUsingJava() - "package_url" parameter is not specified'));
    }
    if(null == a_params['package_manual_url']) {
        throw(new Error('UPluginInstaller.prototype.UPluginInstaller.prototype.installUsingJava() - "package_manual_url" parameter is not specified'));
    }
    if(null == a_params['package_signature']) {
        throw(new Error('UPluginInstaller.prototype.UPluginInstaller.prototype.installUsingJava() - "package_signature" parameter is not specified'));
    }

    if(null == this.m_container) {
        throw(new Error('UPluginInstaller.prototype.UPluginInstaller.prototype.installUsingJava() - "this.m_container" is not initialized'));
    }
    if(null == this.eventHandler) {
        throw(new Error('UPluginInstaller.prototype.UPluginInstaller.prototype.installUsingJava() - "this.eventHandler" is not initialized'));
    }

    this.m_container.installer = this;
    this.mimeType = a_params['mime_type'];
    this.pluginName = a_params['plugin_name'];
    this.description = a_params['plugin_name'];
    this.packageURL = a_params['package_url'];
    this.packageSignature = a_params['package_signature'];
    this.packageManualURL = a_params['package_manual_url'];

    // check for optional parameters
    if(null != a_params['available_version']) {
        this.latestVersion = a_params['available_version']
        this.minimalVersion = a_params['available_version']
    }

    this.minimalVersion = this.latestVersion;
    if(null != a_params['minimal_version']) {
        this.minimalVersion = a_params['minimal_version'];
    }

    // check the installed plugin version
    if(0 != this.checkVersion()) {
        var _onInstall = "javascript:UPluginInstaller.prototype.EventHandler('" + this.m_container.id + "', 'java_install')";
        window.setTimeout(_onInstall, 1);

    } else {
        this.OnInstallationDone();
    }

    addToLogExit('UPluginInstaller.prototype.install() - exit');

}

//------------------------------------------------------------------------------
// internal functions
//------------------------------------------------------------------------------

UPluginInstaller.prototype.checkVersion = function()
{
    this.m_currentVersion = this.m_plugin.getVersion(this.mimeType, this.pluginName);
    return this.m_plugin.check(this.mimeType, this.pluginName, this.latestVersion);
}


///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    callback function for "this.m_plugin.install" method call
//
//  Parameters
//    a_id      - [String] installation operation id (provided as a parameter to this.m_plugin.install" method call)
//    a_url     - [String] url of the package being installed (provided as a parameter to this.m_plugin.install" method call)
//    a_code    - [int] installation result code
//
//  Return value
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.CallbackFuncForPluginObj = function(a_id, a_url, a_code)
{
    addToLogEnter('UPluginInstaller.prototype.CallbackFuncForPluginObj("' + a_id + '", "' + a_url + '", "' + a_code + '") - enter');

    if("0" == a_code) {
        var _onDone = "javascript:UPluginInstaller.prototype.EventHandler('" + this.m_container.id + "', 'done')";
        window.setTimeout(_onDone, 1);

//    Some browsers, Mozilla 1.7.13 for example fires -210 code even if call to InstallTrigger.install has failed
//    so we can not use this code to assume user cancelled this installation
//
//    } else if("-210" == a_code) {
//        var _onSkip = "javascript:UPluginInstaller.prototype.EventHandler('" + this.m_container.id + "', 'skip')";
//        window.setTimeout(_onSkip, 1);

    } else {
        var _onFailed = "javascript:UPluginInstaller.prototype.EventHandler('" + this.m_container.id + "', 'failed')";
        window.setTimeout(_onFailed, 1);
    }

    addToLogExit("UPluginInstaller.prototype.CallbackFuncForPluginObj() - exit");
}


///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    initiates plugin installation process
//
//  Parameters
//    no parameters
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.OnDoInstall = function()
{
    addToLogEnter("UPluginInstaller.prototype.OnDoInstall() - enter");
    var res = -1;

    this.m_install_type = 0; //regular installation using InstallTrigger

    if( this.is_chrome ) {
        this.showChromeInstallScreen();
        var _onDone = "javascript:UPluginInstaller.prototype.EventHandler('" + this.m_container.id + "', 'done')";
        window.setTimeout(_onDone, 1);
    } else {
        try {
          res = (this.m_plugin.install('1', this.packageURL, UPluginInstaller.getCallbackFuncForPluginObj(this, "CallbackFuncForPluginObj"), this.description)) ? 0 : 1;
        } catch(e) {}
    
        if(1 == res) {
            this.showAllowPluginScreen();
    
        } else if(-1 == res) {
            if("" != this.packageManualURL) {
            //do not show the manual installation option if package for manual installation wss not provided
            	this.showAutoInstallFailedScreen();
            } else {
            	this.showAllowPluginScreen();
            }
        }
    }


    addToLogExit("UPluginInstaller.prototype.OnDoInstall() - exit");
}

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    initiates plugin installation process using Java Installer
//
//  Parameters
//    no parameters
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.OnDoJavaInstall = function()
{
    addToLogEnter("UPluginInstaller.prototype.OnDoJavaInstall() - enter");

    this.m_install_type = 1; //installation using JavaLauncher
    var _tokens = this.packageURL.split("/");
    var _filename = _tokens[_tokens.length - 1];

    var applet_code = "" +
      "<applet "+
        "code='Launcher.class' "+
        "codebase='/public/download/java_launcher/' "+
        "archive='Launcher.jar' "+
        "width='200' "+
        "height='6' "+
        "mayscript "+
      "> "+

        "<PARAM NAME='CABBASE' VALUE='Launcher.cab'> "+

        "<PARAM NAME='name' VALUE='" + this.m_container.id + "'> "+
        "<PARAM NAME='source' VALUE='" + this.packageURL + "'> "+
        "<PARAM NAME='signature' VALUE='" + this.packageSignature + "'> "+
        "<PARAM NAME='filename' VALUE='" + _filename + "'> "+
        "<PARAM NAME='params' VALUE=''> "+

        "<PARAM NAME='callback' VALUE='UPluginInstaller.prototype.JavaInstallerEventHandler'> "+
        "<PARAM NAME='color' VALUE='000000FF'> "+
        "<PARAM NAME='background' VALUE='00FFFFFF'> "+
        "<PARAM NAME='wait' VALUE='1'> "+

      "</applet> ";

    var str = this.patchLinks(UPluginInstaller_JavaInstallAppletScreenGet());
    str = str.replace(/\[APPLET_CODE\]/g, applet_code);

    this.invokeCallback("text_out_start", this.m_currentVersion, "OnDoJavaInstall");

    this.m_container.innerHTML = str;


    addToLogExit("UPluginInstaller.prototype.OnDoJavaInstall() - exit");
}

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//
//  Parameters
//    no parameters
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.OnInstallationStarted = function()
{
    addToLogEnter("UPluginInstaller.prototype.OnInstallationStarted() - enter");

    if(1 == this.m_install_type) {
        this.showJavaInstallStartedScreen();
    }


    addToLogExit("UPluginInstaller.prototype.OnInstallationStarted() - exit");
}


///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Should be called when installation process successfuly finished.
//    It rechecks the installed plugin version and fires an appropriate event
//
//  Parameters
//    no parameters
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.OnInstallationDone = function()
{
    addToLogEnter("UPluginInstaller.prototype.OnInstallationDone() - enter");

    // did we really install/upgrade the plugin
    // FireFox 2.0.0.11 for Windows will report success of installation even if plugin for Linux was provided, and it was not actually installed
    this.checkVersion();

    this.m_container.innerHTML = "";

    if(0 >= this.m_plugin.compareVersion(this.m_currentVersion, this.minimalVersion)) {
        this.invokeCallback("installation_success", this.m_currentVersion, "");

    } else {
        if(0 == this.m_install_type) {
            this.OnInstallationFailed();

        } else { //for Java installation - we already tried the package - nothing we can do here
            this.invokeCallback("installation_failed", this.m_currentVersion, "");
        }
    }

    addToLogExit("UPluginInstaller.prototype.OnInstallationDone() - exit");
}


///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Should be called when installation process failed
//    Fires "installation_failed" event and shows AutoInstallFailed UI screen 
//
//  Parameters
//    no parameters
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.OnInstallationFailed = function()
{
    addToLogEnter("UPluginInstaller.prototype.OnInstallationFailed() - enter");

    if(0 == this.m_install_type) {
        if( this.is_chrome ) {
            this.showChromeInstallFailScreen();
        } else {
            if("" != this.packageManualURL) {
            //do not show the manual installation option if package for manual installation wss not provided
            	this.showAutoInstallFailedScreen();
            } else {
            	this.showAllowPluginScreen();
            }
        }
    } else { //this is Java based installation
    
        // check for version again, it is possible that event form applet did not go througth 
        // and user clicked on continue link after installation is done
        this.checkVersion();
        if(0 >= this.m_plugin.compareVersion(this.m_currentVersion, this.minimalVersion)) {
            this.invokeCallback("installation_success", this.m_currentVersion, "");
        } else {
            this.showJavaInstallFailedScreen();
        }
    }

    addToLogExit("UPluginInstaller.prototype.OnInstallationFailed() - exit");
}

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Should be called when installation is cancelled by user
//    Fires an "installation_cancelled" event
//
//  Parameters
//    no parameters
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.OnSkipInstall = function()
{
    addToLogEnter("UPluginInstaller.prototype.OnSkipInstall() - enter");

    this.checkVersion();
    this.m_container.innerHTML = "";

    if(0 >= this.m_plugin.compareVersion(this.m_currentVersion, this.minimalVersion)) {
        this.invokeCallback("installation_success", this.m_currentVersion, "");

    } else {
        this.invokeCallback("installation_cancelled", this.m_currentVersion, "");
    }

    addToLogExit("UPluginInstaller.prototype.OnSkipInstall() - exit");
}

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Invokes callback function provided by caller
//
//  Parameters
//    a_event   - [String] event name to send
//    a_version - [String] version of the installed plugin
//    a_param   - [String] parameter for the event
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.invokeCallback = function(a_event, a_version, a_param)
{
    addToLogEnter("UPluginInstaller.prototype.invokeCallback() - enter");

    if(null != this.eventHandler) {
        this.eventHandler(this.m_name, a_event, a_version, a_param);
    }

    addToLogExit("UPluginInstaller.prototype.invokeCallback() - exit");
}

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Displays JavaInstallStarted UI screen inside provided HTML container
//
//  Parameters
//    no parameters
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.patchLinks = function(a_str)
{
    addToLogEnter('UPluginInstaller.prototype.this.patchLinks() - enter');

    var str = "";
    var _OnInstallDone   = "javascript:UPluginInstaller.prototype.EventHandler('" + this.m_container.id + "','done')";
    var _OnInstallFailed = "javascript:UPluginInstaller.prototype.EventHandler('" + this.m_container.id + "','failed')";
    var _OnDoInstall     = "javascript:UPluginInstaller.prototype.EventHandler('" + this.m_container.id + "','install')";
    var _OnSkipInstall   = "javascript:UPluginInstaller.prototype.EventHandler('" + this.m_container.id + "','skip')";
  
    //do some replacements and binding ...
    a_str = a_str.replace(/\[PLUGIN_MANUAL_URL\]/g, this.packageManualURL);
    a_str = a_str.replace(/\[DONE_EVENT\]/g, _OnInstallDone);
    if (this.is_chrome) {
        if(this.is_linux){
             a_str = a_str.replace(/\[INSTALL_EVENT\]/g, this.packageURL);
        }else{
             a_str = a_str.replace(/\[INSTALL_EVENT\]/g, this.packageManualURL);
        }
    } else {
        a_str = a_str.replace(/\[INSTALL_EVENT\]/g, _OnDoInstall);
    }
    a_str = a_str.replace(/\[SKIP_EVENT\]/g, _OnSkipInstall);
    a_str = a_str.replace(/\[FAIL_EVENT\]/g, _OnInstallFailed);

    addToLogExit('UPluginInstaller.prototype.patchLinks() - exit');
    return a_str;
}



///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Displays JavaInstallStarted UI screen inside provided HTML container
//
//  Parameters
//    no parameters
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.showJavaInstallStartedScreen = function()
{
    addToLogEnter('UPluginInstaller.prototype.showJavaInstallStartedScreen() - enter');

    var userAgent=navigator.userAgent;
    addToLog("userAgent="+userAgent);

    //obtain the UI from a separate include file
    if(userAgent.indexOf("Safari") != -1 || (0 != this.m_currentVersion.indexOf("0.0.0.") && (userAgent.indexOf("Macintosh") != 
-1) 
&& (userAgent.indexOf("Firefox") != -1))){
      var str = this.patchLinks(UPluginInstaller_JavaInstallStartedScreenGetRestartBrowser());
    }else{
      var str = this.patchLinks(UPluginInstaller_JavaInstallStartedScreenGet());
    }

    this.invokeCallback("text_out_start", this.m_currentVersion, "showJavaInstallStartedScreen");

    this.m_container.innerHTML = str;

    addToLogExit('UPluginInstaller.prototype.showJavaInstallStartedScreen() - exit');
}

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Displays Installation UI screen for chrome browser on windows and Linux
//    platforms inside provided HTML container
//
//  Parameters
//    no parameters
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.showChromeInstallScreen = function()
{
    addToLogEnter('UPluginInstaller.prototype.showChromeInstallScreen() - enter');

    this.invokeCallback("text_out_start", this.m_currentVersion, "showChromeInstallScreen");
    if( this.is_macintosh ) {
        var str = this.patchLinks(UPluginInstaller_Chrome_Macintosh());
    } else {
        var str = this.patchLinks(UPluginInstaller_Chrome());
    }
    this.m_container.innerHTML = str;

    addToLogExit('UPluginInstaller.prototype.showChromeInstallScreen() - exit');
}

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Displays Installation Failure UI screen for chrome browser on windows and Linux
//    platforms inside provided HTML container
//
//  Parameters
//    no parameters
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.showChromeInstallFailScreen = function()
{
    addToLogEnter('UPluginInstaller.prototype.showChromeInstallFailScreen() - enter');

    this.invokeCallback("text_out_start", this.m_currentVersion, "showChromeInstallFailScreen");
    if( this.is_macintosh ) {
        var str = this.patchLinks(UPluginInstaller_ChromeFail_Macintosh());
    } else {
        var str = this.patchLinks(UPluginInstaller_ChromeFail());
    }
    this.m_container.innerHTML = str;

    addToLogExit('UPluginInstaller.prototype.showChromeInstallFailScreen() - exit');
}



///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Displays AutoInstallFailed UI screen inside provided HTML container
//
//  Parameters
//    no parameters
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.showAutoInstallFailedScreen = function()
{
    addToLogEnter('UPluginInstaller.prototype.showAutoInstallFailedScreen() - enter');

    //obtain the UI from a separate include file
    this.invokeCallback("text_out_start", this.m_currentVersion, "showAutoInstallFailedScreen");
    if( this.is_linux ){
      var str = this.patchLinks(UPluginInstaller_AutoInstallFailedScreenLinuxGet());
    } else {
      var str = this.patchLinks(UPluginInstaller_AutoInstallFailedScreenGet());
    }
    this.m_container.innerHTML = str;

    addToLogExit('UPluginInstaller.prototype.showAutoInstallFailedScreen() - exit');
}

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Displays JavaInstallFailed UI screen inside provided HTML container
//
//  Parameters
//    no parameters
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.showJavaInstallFailedScreen = function()
{
    addToLogEnter('UPluginInstaller.prototype.showJavaInstallFailedScreen() - enter');

    //obtain the UI from a separate include file
    this.invokeCallback("text_out_start", this.m_currentVersion, "showJavaInstallFailedScreen");

    var str = this.patchLinks(UPluginInstaller_JavaInstallFailedScreenGet());
    this.m_container.innerHTML = str;

    addToLogExit('UPluginInstaller.prototype.showJavaInstallFailedScreen() - exit');
}

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Displays AllowPlugin UI screen inside provided HTML container
//
//  Parameters
//    no parameters
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.showAllowPluginScreen = function()
{
    addToLogEnter('UPluginInstaller.prototype.showAllowPluginScreen() - enter');

    //obtain the UI from a separate include file
    this.invokeCallback("text_out_start", this.m_currentVersion, "showAllowPluginScreen");


    if( this.is_linux ){
       var str = this.patchLinks(UPluginInstaller_AllowPluginLinuxGet());
    } else {
       var str = this.patchLinks(UPluginInstaller_AllowPluginGet());
    }

    this.m_container.innerHTML = str;

    addToLogExit('UPluginInstaller.prototype.showAllowPluginScreen() - exit');
}

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Event handler for UI
//
//  Parameters
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.EventHandler = function(a_id, a_function)
{
    addToLogEnter('UPluginInstaller.prototype.EventHandler("'+ a_id + '", "' +  a_function+ '") - enter');
    
    var _error = "";
    var installer;

    try {

        //obtain installer object
        installer = document.getElementById(a_id).installer;

        //call specified function
        if("skip" == a_function) {
            installer.OnSkipInstall();

        } else if("java_install" == a_function) {
            installer.OnDoJavaInstall();

        } else if("install" == a_function) {
            installer.OnDoInstall();

        } else if("done" == a_function) {
            installer.OnInstallationDone();

        } else if("failed" == a_function) {
            installer.OnInstallationFailed();

        } else {
            alert("Unknown event='"+a_function+"'");
        }

    } catch(e) {
        _error = 'EXCEPTION - UPluginInstaller.prototype.EventHandler() '+ e.description;
        addToLog(_error);
    }

    //if error occured - call callback function with the error code
    if(0 != _error.length) {

        try {
            installer.OnInstallationFailed();

        } catch(e) {
            //we really should not be here!!!
            addToLog('EXCEPTION - UPluginInstaller.prototype.EventHandler() '+ e.description+'\n'+'   prev error:'+_error);
            alert('EXCEPTION - UPluginInstaller.prototype.EventHandler() '+ e.description+'\n'+'   prev error:'+_error);
        }
    }

    addToLogExit('UPluginInstaller.prototype.EventHandler() - exit');
}

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Event handler for JavaLauncher applet
//
//  Parameters
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginInstaller.prototype.JavaInstallerEventHandler = function(a_id, a_result, a_param)
{
    addToLogEnter('UPluginInstaller.prototype.JavaInstallerEventHandler("'+ a_id + '", "' +  a_result + '", "' + a_param + '") - enter');
    
    var _error = "";
    var installer;

    try {

        //obtain installer object
        installer = document.getElementById(a_id).installer;

        //call specified function
        if("0" == a_result) {
            installer.OnInstallationStarted();

        } else if("error" == a_result) {
            installer.OnInstallationFailed();

        } else {
            installer.OnInstallationFailed();
        }

    } catch(e) {
        _error = 'EXCEPTION - UPluginInstaller.prototype.JavaInstallerEventHandler() '+ e.description;
        addToLog(_error);
    }

    //if error occured - call callback function with the error code
    if(0 != _error.length) {

        try {
            installer.OnInstallationFailed();

        } catch(e) {
            //we really should not be here!!!
            addToLog('EXCEPTION - UPluginInstaller.prototype.EventHandler() '+ e.description+'\n'+'   prev error:'+_error);
            alert('EXCEPTION - UPluginInstaller.prototype.EventHandler() '+ e.description+'\n'+'   prev error:'+_error);
        }
    }

    addToLogExit('UPluginInstaller.prototype.JavaInstallerEventHandler() - exit');
}

//------------------------------------------------------------------------------
// "static" functions
//------------------------------------------------------------------------------

UPluginInstaller.getCallbackFuncForPluginObj = function(a_obj, a_methodName)
{
    return function(a_id, a_event, a_params) { a_obj[a_methodName](a_id, a_event, a_params); }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//*********************************************************************************
//*                                                                               
//*                  UPluginHost class                                       
//* 
//*********************************************************************************
//*
//* Description:
//*   Used for Windows platform only and allows to host ActiveX controls for non-IE browsers 
//*   using "F5 Networks Firepass Host Plugin"
//*
//*   has two main public methods
//*     - updateItself() - will try to updated itself to the latest version available on the server (with UI)
//*     - hostControl(...) - will host specified control
//*
//*   Communicates with the caller through the callback function.
//*   Callback function can be assigned to "eventHandler" member of the instance 
//*
//*     function callbackEvent(a_control_id, a_eventName, a_param)
//*       where,
//*         a_control_id  - [String] identificator of the object instance (paramtere to constructor)
//*         a_event_name  - [String] name of the event, available events:
//*                                  installation_done
//*                                  installation_cancelled
//*                                  installation_failed
//*         a_version     - [String] contains the version of installed plugin
//*                                  if no plugin installed - contains "0.0.0.0"   
//*         a_param       - [String] some parameter for event
//* 
//* Notes:
//*   Requires an HTML conatainer. 
//*
//* Example:
//* 
//*   var plugin = new UPluginHost("testPlugin", document.getElementById("pluginDIV"));
//*   plugin.eventHandler = onControlEvent;
//*   plugin.updateItself();
//*   
//*
//*********************************************************************************

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    Default constructor
//
//  Parameters
//    a_name       - [String] identificator of the instance of the object, 
//                   will be sent to callback function as a paramter
//    a_container  - [Object] HTML container
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
function UPluginHost(a_name, a_container)
{
    this.m_name = a_name;
    this.m_container = a_container;
    this.is_chrome = ( navigator.userAgent.toLowerCase().indexOf('chrome') > -1 );
    this.is_linux = ( navigator.userAgent.indexOf("Linux") != -1);

    this.mimeType = "application/x-f5-host-plugin";
    this.pluginName = "F5 Networks Firepass Host Plugin";
    this.description = "F5 Networks Firepass Host Plugin";	

    if (this.is_chrome) {
        this.packageURL = "/public/download/urhostplg.crx";
        this.packageManualURL = "/public/download/urhostplg.crx";
    } else {
        this.packageURL = "/public/download/urhostplg.xpi";
        this.packageManualURL = "/public/download/urhostplg.zip";
    }
    this.latestVersion = "7005.0.0.0";
}


UPluginHost.prototype = new UPluginInstaller();


///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    updates itself to the latest available version on the server
//
//  Parameters
//    no parameters
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginHost.prototype.updateItself = function()
{
    addToLogEnter('UPluginHost.prototype.updateItself() - enter');

    if(null == this.eventHandler) {
        throw(new Error('UPluginHost.prototype.updateItself() - "eventHandler" is not initialized'));
    }
  
    var params = new Array()
    params['mime_type'] = this.mimeType;
    params['plugin_name'] = this.pluginName;
    params['available_version'] = this.latestVersion;
    params['package_url'] = this.packageURL;
    params['package_manual_url'] = this.packageManualURL;
    this.install(params);

    addToLogExit('UPluginHost.prototype.updateItself() - exit');
}

///////////////////////////////////////////////////////////////////////////////////
//
//  Description
//    hosts specified ActiveX control inside itself.
//
//  Parameters
//    a_control   - [Array] array of properties used for <OBJECT> tag, like 'width', 'height', 'CLSID', etc
//                   will be sent to callback function as a paramter
//    a_params    - [Array] array of parameters to pass to ActiveX contorl itself
//
//  Return value 
//    no return value
//
///////////////////////////////////////////////////////////////////////////////////
UPluginHost.prototype.hostControl = function(a_control, a_params)
{
    //generate parameters
    var params = "";
    for (var item in a_params) {
        params += item + '="' + Base64encode(a_params[item]) + '" ';
    }

    // set dimension
    var _width = ("" != a_control['width']) ? a_control['width'] : 640;
    var _height = ("" != a_control['height']) ? a_control['height'] : 480;

    // generate code inserting the control
    var code = ''+
      ' <EMBED  type="' + this.mimeType + '"'+
      ' width=' + _width +
      ' height=' + _height +
      ' ur_plugin_encoding="BASE64"'+
      ' ID="'+Base64encode(this.m_name)+'"'+
      ' ur_CLSID_HOST="' + Base64encode(a_control['clsid']) + '"' +
      ' ur_CODEBASE_HOST="' + Base64encode(getExternalBaseURL() + a_control['codebase'] + '#version=' + a_control['version']) + '"' +
      ' ur_OnError="' + Base64encode(this.m_name + "PluginError" ) + '"' +
      ' ' + params +
      ' >';

      this.m_container.innerHTML = code;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
