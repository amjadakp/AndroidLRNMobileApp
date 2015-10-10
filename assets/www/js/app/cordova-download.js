/*
JSON Keys               Values

"status"				'download', 'finished', 'paused', 'error', 'unzip'
"process_speed"       	integers "kbps | " currentbytesdownloaded "/" totalbytes," Extracting zip files ","download completed","error messages"
"process_progress"    	integer values or empty string
"url"                 	http url
"file_name"             empty string or name of the file if exist (note : it doesnt contains the path)
"file_path"             empty string or local path of the file if exist (note : it doesnt contains the filename)

"error_code" Values:				  
SDcard not present               301;
network unavailable              302;
SDcard not mounted               303;
Storage unavailable              304;
Http request failed              305;
file not found in server         306;
illegalstate exception           307;
reading/write exception          308;
timeout exception                309;  (current time out value provided 3mins)
file path missing                310;
file not found in zip file       311;
read/write file from zip         312;
cannot create directory from zip 313;
download incomplete              314; 
Generic exception				 316
*/



var FileDownload = function() {};


if (!window.plugins) 
	window.plugins = {};
   
window.plugins.Download = new FileDownload();


FileDownload.prototype.status = ['idle', 'download', 'finished', 
								'paused', 'canceled', 'error', 'unzip'];

/* Get current status of download
 * returns the following values to 'progress' callback 
 * 'download' - if it has not yet started
 * 'paused' - if the download has been paused
 * 'finished' - if the download has been completed
 */

FileDownload.prototype.getStatus = function(url, success, fail, progress) {
	var params = {"url" : url};
    return Cordova.exec(progress, fail, "Download", "getStatus", [params]);
};

//Start download
FileDownload.prototype.start = function(url, success, fail, progress, outPath) {
	var params = {"url" : url, "outPath" : outPath};
    return Cordova.exec(progress, fail, "Download", "start", [params]);
};

//Pause download
FileDownload.prototype.pause = function(url, success, fail, progress, outPath) {
	var params = {"url" : url, "outPath" : outPath};
    return Cordova.exec(progress, fail, "Download", "pause", [params]);
};

//Resume download
FileDownload.prototype.resume = function(url, success, fail, progress, outPath) {
	var params = {"url" : url, "outPath" : outPath};
    return Cordova.exec(progress, fail, "Download", "resume", [params]);
};

//Cancel download
FileDownload.prototype.cancel = function(url, success, fail, progress, outPath) {
	var params = {"url" : url};
    return Cordova.exec(progress, fail, "Download", "cancel", [params]);
};

//Delete downloaded file
FileDownload.prototype.delete = function(url, success, fail, progress, outPath) {
	var params = {"url" : url};
    return Cordova.exec(progress, fail, "Download", "delete", [params]);
};


