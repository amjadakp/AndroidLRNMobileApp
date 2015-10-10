(function() {
	window.appRootDirName = "";
	document.addEventListener("online", onOnline, false);

	function onDeviceReady() {
		document.addEventListener("offline", onOffline, false);
		window.requestFileSystem = window.requestFileSystem
				|| window.webkitRequestFileSystem;
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
		cordova.exec(
				 function(freeSpace) {
				 localStorage.setItem("deviceMemory", freeSpace);
				 },
				 function() {
				 }, 
				 "File", "getFreeDiskSpace", []
				 );
	}

	function fail() {
		printLog("failed to get filesystem");
	}

	function gotFS(fileSystem) {
		fileSystem.root.getDirectory(window.appRootDirName, {
			create : true,
			exclusive : false
		}, dirReady, fail);
	}

	function dirReady(entry) {
		window.appRootDir = entry;
	}
})();
