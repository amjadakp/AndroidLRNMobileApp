// revolunet 2012
// Cordova Javascript plugin implementation
var FileDownload = function() {};

//Start download file
FileDownload.prototype.start = function(url,success, fail, progress, outPath) {
    var key = 'f' + this.callbackIdx++;
    window.plugins.Download.callbackMap[key] = {
    success: function(result) {
        success(result);
        delete window.plugins.Download.callbackMap[key];
    },
    fail: function(result) {
        fail(result);
        delete window.plugins.Download.callbackMap[key];
    },
    progress: progress
    };
    var callback = 'window.plugins.Download.callbackMap.' + key;    
	var params = [callback + '.success',  callback + '.fail',  callback + '.progress',  url, outPath, outPath, progress];
    return Cordova.exec(success, fail, "FileDownloadPlugin", "start", params);
};

//Cancel download file
FileDownload.prototype.cancel = function(url,success, fail, progress, outPath) {
	var params = [url, outPath, progress];
    return Cordova.exec(success, fail, "FileDownloadPlugin", "cancel", params);
};

//Pause download file
FileDownload.prototype.pause = function(url,success, fail, progress, outPath) {
	var params = [url, outPath, progress];
    return Cordova.exec(success, fail, "FileDownloadPlugin", "pause", params);
};

//Resume download file
FileDownload.prototype.resume = function(url,success, fail, progress, outPath) {
	var params = [url, outPath, progress];
    return Cordova.exec(success, fail, "FileDownloadPlugin", "resume", params);
};

//Delete downloaded file
FileDownload.prototype.delete = function(url,success, fail, progress, outPath) {
    var key = 'f' + this.callbackIdx++;
    window.plugins.Download.callbackMap[key] = {
    success: function(result) {
        success(result);
        delete window.plugins.Download.callbackMap[key];
    },
    fail: function(result) {
        fail(result);
        delete window.plugins.Download.callbackMap[key];
    },
    progress: progress
    };
    var callback = 'window.plugins.Download.callbackMap.' + key;
	var params = [callback + '.success',  callback + '.fail',  callback + '.progress',  url, outPath, outPath, progress];
    return Cordova.exec(success, fail, "FileDownloadPlugin", "delete", params);
};


FileDownload.prototype.callbackMap = {};
FileDownload.prototype.callbackIdx = 0;
FileDownload.prototype.status = ['idle', 'download', 'unzip', 'finished', 'canceled', 'error' ,'paused'];
cordova.addConstructor(function()  {
                       if(!window.plugins) window.plugins = {};
                       window.plugins.Download = new FileDownload();
                       });
// end plugin implementation