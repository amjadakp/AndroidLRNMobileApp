(function() {
	window.appRootDirName = "Lrn/box";
	document.addEventListener("online", onOnline, false);
	document.addEventListener("deviceready", onDeviceReady, false);

	function onDeviceReady() {
		navigator.splashscreen.hide();
		document.addEventListener("offline", onOffline, false);
		document.addEventListener("backbutton", onBackKeyDown, false);
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

	function fail(evt) {
		alert("failed to get filesystem");
	}

	function gotFS(fileSystem) {
		fileSystem.root.getDirectory(window.appRootDirName, {
			create : true,
			exclusive : false
		}, dirReady);
	}
	
	function dirReady(entry) {
		window.appRootDir = entry;
	}
})();