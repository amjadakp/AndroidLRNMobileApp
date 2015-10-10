var downloadSettings = {
autoDownload : "0",
autoDelete : "0",
wifi : "1",
notification : "1",
syncFrequency : 6,
lastSynced : ""
}

var testNotification = true;
var lastNotification = "moduleAlert";
var syncTimeout = parseInt(600000);
var runInVM = false;
var dummyServices = isMobile();
var localHostName = "js/webservices/responseXMLs/";
//-- set response file path
var playOtherFile = false;
var scormFilePath = "course1/imsmanifest.xml";
var backEnabledPageArr = new Array();
var maxNumberOfAutoDownloads = 1;
var deLimiter = "999999999";
var infoLogsInConsole = true;
var noInfologs = false;
backEnabledPageArr = ['modulesPreview', 'coursePlayer', 'moreopSettingsPage'];
var allTables = ['MYLRNCOURSESV1', 'MYSETTINGS', 'MYSYNC', 'SITECONFIGS', 'COMPLETION_STATUS', 'MODULERESPONSES', 'LOGS', 'HISTORY_STATUS', 'MYCREDENTIAL', 'MYHISTORY'];
var DB_NAME = "CatalystDB";
var DB_VERSION = "1.0";
var DB_TITLE = "LRN Catalyst Database";
var DB_BYTES = 1024 * 1024 * 5;
var NOMODULESFOUND = "<p span class='txtcenter'>You have no courses currently assigned to you. You can review and access previously completed courses from the History icon.</span> ";
function isMobile() {
    return 0;
}
debug();
