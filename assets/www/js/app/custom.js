var statesArray = new Array();
var pauseArray = new Array();
var multipleDownloadArray = new Array();
var	courseAvailable = new Array();
var	coursesToBeSynced = new Array();
var downloadUrlCount = 0;
currentIndex = "";
isCompleted = false;
isCurrentCourseUpdated = false;
var currentDownloder = "";
var appstate = "idle";
var globalVar = "";
var requestFailure = false;
var moduleDownloadInProgress = false;
var autoRunningDownloads = 0;
var allowedAutoDownloads = 3;
var moduleShown = false;
var numberOfAutoDownloadsProcessed = 0;
var playerPage = false;
var autoDelArray = [];
var isAutoDownloading = false;

function startDownload(source, index) {

	printLog("setting appstate idle @startDownload");
	appstate = "idle";
	var urlExists = false;
	$.grep(multipleDownloadArray, function(value) {
		if (value == source) {
			urlExists = true;
		}
	});

	if (!urlExists) {
		multipleDownloadArray.push(source);
		if (isAutoDownloading) {
			autoRunningDownloads++;
			printLog("startAutoDownload autoRunningDownloads SIZE= " + autoRunningDownloads);
		}
	}
	downloadUrlCount = multipleDownloadArray.length;
	printLog("multipleDownloadArray.length @START" + multipleDownloadArray.length);

	$('#status' + index).html("Download in Progress");
	var isPreviewPage = false;
	try {
		isPreviewPage = ($.mobile.activePage.attr('id') == 'modulesPreview');
		if (isPreviewPage) {
			$('.statusPreview' + index).html("Download in Progress");
		}
	} catch(e) {}
	var started = startingSingleDownloadControls(index);
	if (started) {
		startingMultipleDownloadControls();
		try {
			setTimeout(function() {
				mandatoryScroller.refresh();
			}, 200);
			setTimeout(function() {
				optionalScroller.refresh();
			}, 200);
		} catch(e) {}
		window.plugins.Download.start(source, function() {
			$('#status' + index).html('SUCCESS');
		}, function(info) {

			if (isAutoDownloading) {
				autoRunningDownloads = autoRunningDownloads - 1;
				printLog("ONEXCEPTION startAutoDownload autoRunningDownloads SIZE= " + autoRunningDownloads);
				autoDownloadArray = jQuery.grep(autoDownloadArray, function(url) {
					return url != info.url;
				});
				startAutoDownload();
			}
			printLog("OnError : " + JSON.stringify(info));
			var errorCode = parseInt(info.error_code);
			if (jQuery.inArray(errorCode, customExceptions) != -1) {
				$("#status" + index).css('display', 'none');
				$("#pause" + index).css('display', 'none');
				$("#resume" + index).css('display', 'none');
				$("#cancel" + index).css('display', 'none');
				$("#progress" + index).css('display', 'none');
				$("#download" + index).css('display', 'inline-block');
				$("#offline" + index).css('display', 'none');
				$("#online" + index).css('display', 'inline-block');
				if (downloadUrlCount > 1)
					exceptionMultipleDownloadControls(info);
				else
					exceptionSingleDownloadControls(info);
				$("#moduleNotAvailable").simpledialog2();
			}
		}, function(info) {
			index = getIndexFromURL(info.url);
			isCompleted = "inprogress";
			if (downloadUrlCount > 1) {
				progressMultipleDownloadControls(info);
			} else {
				progressSingleDownloadControls(info);
			}
			if (info.status == 'unzip') {
				try {
					if (parseInt(info.progress) < 10) {
						if (downloadUrlCount > 1) {
							$("#downloadStatusAll").css('display', 'inline-block').html("unzipping please wait...");
							$(".btn-download-all-pause").css('display', 'none');
							$(".btn-download-all-resume").css('display', 'none');
							$(".btn-download-all-cancel").css('display', 'inline-block');
						} else {
							$('#status' + index).html("unzipping please wait...");
							$("#offline" + index).css('display', 'none');
							$("#cancel" + index).css('display', 'none');
							$("#pause" + index).css('display', 'none');
						}
					}
				} catch(e) {}
			}

			if (info.status == 'finished') {

				$("#progress" + index).progressbar({
					value: 0
				});
				$("#offline" + index).css('display', 'none');
				$("#cancel" + index).css('display', 'none');
				$("#pause" + index).css('display', 'none');
				$('#status' + index).html("unzipping please wait...");

			} else if (info.status == 'unzip completed') {

				$("offline" + index).css('display', 'none');
				$("#progress" + index).progressbar({
					value: 0
				});
				if (downloadUrlCount > 1) {
					unzipMultipleDownloadControls(info);
				} else {
					unzipSingleDownloadControls(info);
				}

				var downloadArray = getLocalDownloadArray();

				if ($.inArray(index, downloadArray) < 0) {
					downloadArray.push(index);
					localStorage.setItem("localDownloadArray", JSON.stringify(downloadArray));
					var s = {};
					s[index] = source;
					courseAvailable.push(s);
					localStorage.setItem("courseAvailable",JSON.stringify(courseAvailable));

					var coursesToBeSynced = [];
 					var allModules = JSON.parse(localStorage.jsonUserAssignedModules);
					$.each(downloadArray,function(index,value) {
						$.each(allModules, function(i,v) {
							if($.isArray(v.courseLookup)) {
								if(v.courseLookup[0].moduleId == parseInt(value,10).toString()) {
									coursesToBeSynced.push(v.courseLookup[0].systemId);
								}
							}
							else {
								if(v.courseLookup.moduleId == parseInt(value,10).toString()) {
									coursesToBeSynced.push(v.courseLookup.systemId);
								}
							}
						});
					});
					localStorage.setItem("coursesToBeSynced",JSON.stringify(coursesToBeSynced));
				}
				try {
					var statusIDX = getIndexFromURL(info.url);
					var language = localStorage.getItem("'" + statusIDX + "'othLangDownload");
					var langIndex = statusIDX;
					if (typeof(language) != 'undefined' && language != '' && language != null) {
						langIndex = statusIDX + deLimiter + language;
					}
					statesArray = jQuery.grep(statesArray, function(a) {

						return a.toString().split('|')[0] != langIndex;
					});
					var value = (langIndex + "|100|finished").toString();

					statesArray.push(value);
					insertValues();
				} catch(e) {}
				$('#status' + index).html("");
				$("#progress" + index).progressbar({
					value: 100
				});

				if (isAutoDownloading) {
					autoRunningDownloads = autoRunningDownloads - 1;
					printLog("ONUNZIPCOMPLETED startAutoDownload autoRunningDownloads SIZE= " + autoRunningDownloads);
					autoDownloadArray = jQuery.grep(autoDownloadArray, function(url) {
						return url != info.url;
					});
					startAutoDownload();
				}
			}

			var isPreviewPage = false;
			try {
				isPreviewPage = ($.mobile.activePage.attr('id') == 'modulesPreview');
				if (isPreviewPage) {
					downloadPreviewProgress(info);
				}
			} catch(e) {}

			if (typeof(language) != 'undefined' && language != '' && language != null) {
				setControlsAfterLanguageDownload(index);
			}
		});
	}
}

function cancelDownload(source, index) {
	printLog("setting appstate idle @cancelDownload");
	appstate = "idle";
	window.plugins.Download.cancel(encodeURI(source.trim()), function() {
		$('#status' + index).html('SUCCESS');
		try {
			var language = localStorage.getItem("'" + index + "'othLangDownload");
			var langIndex = index;
			if (typeof(language) != 'undefined' && language != '') {
				langIndex = index + "@" + language;
			}

			statesArray = jQuery.grep(statesArray, function(a) {
				return a.toString().split('|')[0] != langIndex;
			});
		} catch(e) {}
	}, function(info) {
		printLog("--- Cancel Download ---");
		printLog(JSON.stringify(info));
		var isPreviewPage = false;
		try {
			isPreviewPage = ($.mobile.activePage.attr('id') == 'modulesPreview');

			if (isPreviewPage) {
				$('.statusPreview' + index).html('FAILURE');
				$("#progressPreview" + index).css('display', 'none');
				$(".cancelPreview" + index).css('display', 'none');
				$(".pausePreview" + index).css('display', 'none');
			} else {
				localStorage.setItem('othLangDownloadSrc', "");
				localStorage.setItem('othLangDownloadIdx', "");
				localStorage.setItem("'" + index + "'othLangDownload", "");
			}
		} catch(e) {}

	}, function(info) {
		$('#status' + index).html(window.plugins.Download.status[info.status]);
	});
	if (downloadUrlCount > 1) {
		$("#downloadStatusAll").html('');
		$("#downloadProgressAll").progressbar({
			value: 0
		});
		$(".btn-download-all-cancel").css('display', 'none');
		$(".btn-download-all-pause").css('display', 'none');
		$(".btn-download-all-resume").css('display', 'none');
		$("#downloadAllSection").hide();
		if(($(window).width() == 1024 && $(window).height() == 527) || ($(window).width() == 1024 && $(window).height() == 768) || ($(window).width() == 768 && $(window).height() == 1024)) {
			$("#mandatory_catalysts").css("top", "75px");
			$("#optional_catalysts").css("top", "75px");
		}
		else {
			$("#mandatory_catalysts").css("top", "52px");
			$("#optional_catalysts").css("top", "52px");
		}

		try {
			setTimeout(function() {
				mandatoryScroller.refresh();
			}, 200);
			setTimeout(function() {
				optionalScroller.refresh();
			}, 200);
		} catch(e) {}
		jQuery.each(multipleDownloadArray, function(key, value) {
			var localIdx = getIndexFromURL(value);
			localStorage.setItem("'" + localIdx + "'", 0);
			$("#progress" + localIdx).css('display', 'none');
			$("#download" + localIdx).css('display', 'inline-block');
			$("#offline" + localIdx).css('display', 'none');
			$("#online" + localIdx).css('display', 'inline-block');
			$("#cancel" + localIdx).css('display', 'none');
			$("#pause" + localIdx).css('display', 'none');
			$("#resume" + localIdx).css('display', 'none');
		});

	} else {
		$("#download" + index).css('display', 'inline-block');
		$("#offline" + index).css('display', 'none');
		$("#online" + index).css('display', 'inline-block');
		$("#cancel" + index).css('display', 'none');
		$("#pause" + index).css('display', 'none');
		$("#resume" + index).css('display', 'none');
		$("#progress" + index).css('display', 'none');
		$('#status' + index).css('display', 'none');
		localStorage.setItem("'" + index + "'", 0);
	}
	appstate = "idle";
	multipleDownloadArray = [];
	downloadUrlCount = 0;
	printLog("multipleDownloadArray.length @CANCEL: " + multipleDownloadArray.length);
	currentIndex = "";
	isCompleted = false;
	currentDownloder = "";
	pauseArray = new Array();

	var isPreviewPage = false;
	try {
		isPreviewPage = ($.mobile.activePage.attr('id') == 'modulesPreview');

		if (isPreviewPage) {
			$(".downloadPreview" + index).css('display', 'inline-block');
			$(".cancelPreview" + index).css('display', 'none');
			$(".pausePreview" + index).css('display', 'none');
			$(".resumePreview" + index).css('display', 'none');
			$("#progressPreview" + index).css('display', 'none');
			$('.statusPreview' + index).css('display', 'none');
			$(".downloadThisModule").css('display', 'inline-block');
			$(".languageToDownload" + index).show();
			$("#downloadButtonsModulePreview" + index).css('display', 'inline-block');
			$("#onlineincat" + index).show();
			$("#offlineincat" + index).hide();
			$("#SelectLanguageGetStarted1").val("en");
		} else {
			localStorage.setItem('othLangDownloadSrc', "");
			localStorage.setItem('othLangDownloadIdx', "");
			localStorage.setItem("'" + index + "'othLangDownload", "");
		}
	} catch(e) {}
};

function pauseDownload(source, index) {
	var urlExists = false;
	$.grep(pauseArray, function(value) {
		if (value == index) {
			urlExists = true;
		}
	});

	if (!urlExists)
		pauseArray.push(index);
	printLog("pauseArray.length @pauseArray" + pauseArray.length);

	try {
		var language = localStorage.getItem("'" + index + "'othLangDownload");
		var langIndex = index;
		if (typeof(language) != 'undefined' && language != '') {
			langIndex = index + "@" + language;

		}
		statesArray = jQuery.grep(statesArray, function(a) {

			return a.toString().split('|')[0] != langIndex;
		});
		var pausedProgressVal = 0;
		try {
			pausedProgressVal = $("#progress" + index).progressbar().attr('aria-valuenow');
		} catch(e) {
			try {
				pausedProgressVal = $("#progressPreview" + index).progressbar().attr('aria-valuenow');
			} catch(e) {}
		}
		localStorage.setItem("'" + index + "'", pausedProgressVal);
	} catch(e) {}
	window.plugins.Download.pause(source, function() {
		$('#status' + index).html('SUCCESS');
	}, function() {
		if (downloadUrlCount > 1) {
			$(".btn-download-all-cancel").css('display', 'inline-block');
		} else {
			$('#status' + index).html('  Download Paused  ');
			$("#cancel" + index).css('display', 'inline-block');
		}
		var isPreviewPage = false;
		try {
			isPreviewPage = ($.mobile.activePage.attr('id') == 'modulesPreview');

			if (isPreviewPage) {
				$('.statusPreview' + index).html('  Download Paused  ');
				$(".cancelPreview" + index).css('display', 'none');
				$(".pausePreview" + index).css('display', 'none');
			}
		} catch(e) {}
	}, function(info) {});

	if (downloadUrlCount > 1) {
		$("#downloadStatusAll").html("  Download Paused  ");
		$(".btn-download-all").css('display', 'none');
		$(".btn-download-all-pause").css('display', 'none');
		$(".btn-download-all-cancel").css('display', 'inline-block');
		$(".btn-download-all-resume").css('display', 'inline-block');
	} else {
		$('#status' + index).html("  Download Paused  ");
		$("#download" + index).css('display', 'none');
		$("#cancel" + index).css('display', 'inline-block');
		$("#pause" + index).css('display', 'none');
		$("#resume" + index).css('display', 'inline-block');
	}

	var isPreviewPage = false;
	try {
		isPreviewPage = ($.mobile.activePage.attr('id') == 'modulesPreview');

		if (isPreviewPage) {

			try {
				jQuery.each(multipleDownloadArray, function(key, value) {
					var localIdx = getIndexFromURL(value);
					$('.statusPreview' + localIdx).html("  Download Paused  ");
					$(".download" + localIdx).css('display', 'none');
					$(".cancelPreview" + localIdx).css('display', 'inline-block');
					$(".pausePreview" + localIdx).css('display', 'none');
					$(".resumePreview" + localIdx).css('display', 'inline-block');
					$("#progressPreview" + localIdx).css('display', 'inline-block');
					$('.statusPreview' + localIdx).css('display', 'inline-block');
					if (multipleDownloadArray.length > 1) {
						$(".cancelPreview" + localIdx).css('display', 'none');
						$(".pausePreview" + localIdx).css('display', 'none');
						$(".resumePreview" + localIdx).css('display', 'none');
						$('.statusPreview' + localIdx).css('display', 'none');
					}
				});
			} catch(e) {
				printLog("EXCEPTION AUTO Resume " + e);
			}
		}
	} catch(e) {}
	printLog("multipleDownloadArray.length @PAUSE" + multipleDownloadArray.length);
	printLog("setting appstate pause @pauseDownload");
	appstate = "pause";
};

function resumeDownload(source, index) {
	printLog("setting appstate idle @resumeDownload");
	appstate = "idle";
	printLog("multipleDownloadArray.length @Resume" + multipleDownloadArray.length);
	pauseArray = jQuery.grep(pauseArray, function(a) {
		return a.toString().split('|')[0] != index;
	});

	var isPreviewPage = false;
	try {
		isPreviewPage = ($.mobile.activePage.attr('id') == 'modulesPreview');
		if (isPreviewPage) {
			$('.statusPreview' + index).html("Resuming...");
			$(".resumePreview" + index).css('display', 'none');
			$(".pausePreview" + index).css('display', 'inline-block');
		}
	} catch(e) {}

	if (downloadUrlCount > 1) {
		resumingMultipleDownlaodControls(index);
	} else {
		resumingSingleDownloadControls(index);
	}
	try {
		setTimeout(function() {
			mandatoryScroller.refresh();
		}, 200);
		setTimeout(function() {
			optionalScroller.refresh();
		}, 200);
	} catch(e) {}
	window.plugins.Download.resume(source, function() {
		$('#status' + index).html('SUCCESS');
	}, function(info) {

		if (isAutoDownloading) {
			autoRunningDownloads = autoRunningDownloads - 1;
			printLog("ONEXCEPTION startAutoDownload autoRunningDownloads SIZE= " + autoRunningDownloads);

			autoDownloadArray = jQuery.grep(autoDownloadArray, function(url) {
				return url != info.url;
			});
			startAutoDownload();
		}
		printLog("OnError : " + JSON.stringify(info));
		var errorCode = parseInt(info.error_code);
		if (jQuery.inArray(errorCode, customExceptions) != -1) {
			//index = getIndexFromURL(info.url);
			exceptionSingleDownloadControls(info);
			exceptionMultipleDownloadControls(info);
			$("#moduleNotAvailable").simpledialog2();
		}
		try {
			setTimeout(function() {
				mandatoryScroller.refresh();
			}, 200);
			setTimeout(function() {
				optionalScroller.refresh();
			}, 200);
		} catch(e) {}
	}, function(info) {
		index = getIndexFromURL(info.url);
		isCompleted = "inprogress";
		if (downloadUrlCount > 1) {
			progressMultipleDownloadControls(info);
		} else {
			progressSingleDownloadControls(info);
		}

		if (info.status == 'unzip') {
			try {
				if (parseInt(info.progress) < 10) {
					if (downloadUrlCount > 1) {
						$("#downloadStatusAll").css('display', 'inline-block').html("unzipping please wait...");
						$(".btn-download-all-pause").css('display', 'none');
						$(".btn-download-all-resume").css('display', 'none');
						$(".btn-download-all-cancel").css('display', 'inline-block');
					} else {
						$('#status' + index).html("unzipping please wait...");
						$("#offline" + index).css('display', 'none');
						$("#cancel" + index).css('display', 'none');
						$("#pause" + index).css('display', 'none');
					}
				}
			} catch(e) {}
		}
		if (info.status == 'finished') {

			$("#progress" + index).progressbar({
				value: 0
			});
			$("#offline" + index).css('display', 'none');
			$("#online" + index).css('display', 'none');
			$("#cancel" + index).css('display', 'none');
			$("#pause" + index).css('display', 'none');
			$('#status' + index).html("unzipping please wait...");

		} else if (info.status == 'unzip completed') {
			if (downloadUrlCount > 1) {
				unzipMultipleDownloadControls(info);
			} else {
				unzipSingleDownloadControls(info);
			}

			var downloadArray = getLocalDownloadArray();

			if ($.inArray(index, downloadArray) < 0) {
				downloadArray.push(index);
				localStorage.setItem("localDownloadArray", JSON.stringify(downloadArray));

				var s = {};
				s[index] = source;
				courseAvailable.push(s);
				localStorage.setItem("courseAvailable",JSON.stringify(courseAvailable));

				var coursesToBeSynced = [];

				var allModules = JSON.parse(localStorage.jsonUserAssignedModules);
				$.each(downloadArray,function(index,value) {
					$.each(allModules, function(i,v) {
						if($.isArray(v.courseLookup)) {
							if(v.courseLookup[0].moduleId == parseInt(value,10).toString()) {
								coursesToBeSynced.push(v.courseLookup[0].systemId);
							}
						}
						else {
							if(v.courseLookup.moduleId == parseInt(value,10).toString()) {
								coursesToBeSynced.push(v.courseLookup.systemId);
							}
						}
					});
				});

				localStorage.setItem("coursesToBeSynced",JSON.stringify(coursesToBeSynced));
			}

			try {
				var language = localStorage.getItem("'" + index + "'othLangDownload");
				var langIndex = index;
				if (typeof(language) != 'undefined' && language != '' && language != null) {
					langIndex = index + deLimiter + language;
				}
				statesArray = jQuery.grep(statesArray, function(a) {

					return a.toString().split('|')[0] != langIndex;
				});
				printLog("culprit1" + value);
				var value = (langIndex + "|100|finished").toString();
				statesArray.push(value);
				printLog('Resume catalyst module----');

				insertValues();
			} catch(e) {}
			$('#status' + index).html("");
			$("#progress" + index).progressbar({
				value: 100
			});

			if (isAutoDownloading) {
				autoRunningDownloads = autoRunningDownloads - 1;
				autoDownloadArray = jQuery.grep(autoDownloadArray, function(url) {
					return url != info.url;
				});
				printLog("ONUNZIPCOMPLETED startAutoDownload autoRunningDownloads SIZE= " + autoRunningDownloads);
				startAutoDownload();
			}
		}

		downloadPreviewProgress(info);
		if (typeof(language) != 'undefined' && language != '' && language != null) {
			setControlsAfterLanguageDownload(index);
		}

	});
};

function deleteDownload(source, index) {
	closePopup(index);
	if($.mobile.sdCurrentDialog)
		$.mobile.sdCurrentDialog.close();

	ShowDefaultLoadingImage("Deleting Course from Memory");
	printLog("deleteDownload >>>source" + source);
	printLog("deleteDownload >>>index" + index);

	deleteFolderName = source;
	deleteFile();

	deleteCoursefromLocalStorage(index);

	loadDownloadedModules();
	setTimeout(function() {
		if (typeof downloadScroller != 'undefined')
			downloadScroller.refresh();
	}, 200);

	if (!multiDelete)
		$("#deleteSuccessPop").simpledialog2();

}

function deleteCoursefromLocalStorage(index){
	var lDArray = JSON.parse(localStorage.getItem("localDownloadArray"));

	printLog("inside DCLS method: " + lDArray);
	var newLDArray = $.grep(lDArray, function(v){ return v != index; });
	localStorage.setItem("localDownloadArray",JSON.stringify(newLDArray));
	printLog("inside DCLS method: " + newLDArray);
	var allModules = JSON.parse(localStorage.jsonUserAssignedModules);
	$.each(allModules, function(i,v) {
		if($.isArray(v.courseLookup)) {
			if(v.courseLookup[0].moduleId == parseInt(index,10).toString()) {
				localStorage.removeItem("SCROM-" + v.courseLookup[0].course);
			}
		}
		else {
			if(v.courseLookup.moduleId == parseInt(index,10).toString()) {
				localStorage.removeItem("SCROM-" + v.courseLookup[0].course);
			}
		}
	});	
}

function playCatalyst(source, index, course) {
	ShowDefaultLoadingImage("Please wait...");
	printLog("source in playCatalyst111:"+ source);
	printLog("index in playCatalyst111:"+ index);
	printLog("course in playCatalyst111: "+course);
	playerPage = true;
	$("#modules .ui-icon").css('background-image', 'url(images/app/courses.png)');
	$("#downloads .ui-icon").css('background-image', 'url(images/app/download.png)');

	setTimeout(function() {
		var downloadInProgress = false;
		var offline = false;
		$.each(multipleDownloadArray, function(index, element) {
			if (element == source) {
				downloadInProgress = true;
				return;
			}
		});

		if (!downloadInProgress) {
			var downloadArray = getLocalDownloadArray();
			if ($.inArray(index, downloadArray) < 0) {
				HideDefaultLoadingImage();
				$("#moduleNotDownloaded").simpledialog2();
				return;
			}

			//Putting currently played course details at localStorage
			localStorage.setItem("currentCourse", course);
			localStorage.setItem("currentSource", source);
			localStorage.setItem("currentIndex", index);

			var autoDelTempArray = {
					"course": course,
					"source": source,
					"index": index,
					"status": ""
			};

			var isInAutoDelArray = true;

			for(var i=0; i<autoDelArray.length; i++) {
				$.each(downloadArray, function(index, value){
					if(JSON.parse(autoDelArray)[i].index == value) {
						isInAutoDelArray = false;
						return;
					}
				});
			}

			if(isInAutoDelArray){
				autoDelArray.push(autoDelTempArray);
			}
			localStorage.setItem("courseStatuses", JSON.stringify(autoDelArray));

			//Fetch course status if connected to internet..
			printLog("isCurrentCourseUpdated... " + isCurrentCourseUpdated);
			printLog("isNetworkAvailable... " + checkConnection());
			var isNetwork = checkConnection();

			if(isNetwork != 'No network connection') {
				getScromObjectData(course);
				if(!isCurrentCourseUpdated) {
					printLog("course not updated in and symphonyscorm object not modified...");
					updateScromObject();
				}
			}

			printLog("source in playCatalyst:"+ source);
			printLog("index in playCatalyst:"+ index);
			printLog("courseAvailable : "+courseAvailable);

			fileName = source.split("/")[2];
			printLog("File Name....  " + fileName);

			var catalystFullPath;
			if (playOtherFile)
				offline = playOtherFile;

			var downloadArray = getLocalDownloadArray();
			printLog("downloadArray has  " + downloadArray);
			$.each(downloadArray, function(arrayIndex, element) {
				if (element == index)
					offline = true;
			});
			if (offline) {
				window.requestFileSystem = window.requestFileSystem
				|| window.webkitRequestFileSystem;
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
				printLog("full path :"+ window.appRootDir);
				if (!playOtherFile) {
					if (DevicePlatform == "Android") {
						catalystFullPath = window.appRootDir.fullPath + "/" + fileName + "/imsmanifest.xml";
						printLog("catalyst full path :"+ catalystFullPath);
					} else if (DevicePlatform == "iOS") {
						var catalystFullPath = "file://" + window.appRootDir.fullPath.trim() + "/" + fileName.trim() + "/imsmanifest.xml";
						catalystFullPath = encodeURI(catalystFullPath);
					}
				} else {
					if (DevicePlatform == "Android") {
						catalystFullPath = window.appRootDir.fullPath + "/" + "course1" + "/imsmanifest.xml";
					} else if (DevicePlatform == "iOS") {
						catalystFullPath = "file://" + window.appRootDir.fullPath.trim() + "/" + "course1" + "/imsmanifest.xml";
						catalystFullPath = encodeURI(catalystFullPath);
					} else {
						catalystFullPath = scormFilePath;
					}
				}
				printLog("catalystFullPath" + catalystFullPath);
				$.get(catalystFullPath).done(function(result) {
					$.mobile.changePage("#coursePlayer");
					if (DevicePlatform == "Android") {
						window.plugins.OrientationLock.lock("portrait", function() {}, function() {});
					} else if (DevicePlatform == "iOS") {
						printLog("orientation=============="+window.orientation);
						setTimeout(function() {
							window.plugins.screenOrientation.set("portrait");
						}, 200);
					}

					PlayerConfiguration.Debug = true;
					PlayerConfiguration.StorageSupport = true;
					HideDefaultLoadingImage();
					Run.ManifestByURL(catalystFullPath, true);
					printLog("requestFailure : " + requestFailure);

				}).fail(function() {
					printLog("Failure----");
					HideDefaultLoadingImage();
					$("#courseNotAvailable").simpledialog2();
				});
			} else {
				printLog("Play it online");
				if (isNetworkAvailable) {
					var catalystFullPath = "https://qacustomize11-console.lrn.com/";
					window.open(encodeURI(catalystFullPath), "_blank", "location=yes");
				} else
					$("#connectionRequired").simpledialog2();
			}
		} else {
			HideDefaultLoadingImage();
			moduleDownloadInProgress = true;
			$("#moduleDownloadInProgress").simpledialog2();
		}
	}, 200);
}

//Get index from URL
function getIndexFromURL(url) {
	var resData = "";
	$.grep(dynamicModuleData, function(value) {
		if (value.mSource == url) {
			resdata = value.mIndex;
		}
	});
	return resdata;
};

function getSourceFromIndex(index){
	var resData = "";
	$.grep(dynamicModuleData, function(value) {
		if (value.mIndex == index) {
			resdata = value.mSource;
		}
	});
	return resdata;
}

//Pause All Downloads
function pauseAllDownload() {
	$.each(multipleDownloadArray, function(key, value) {
		var index = getIndexFromURL(value);
		appstate = "pause";
		var urlExists = false;
		$.grep(pauseArray, function(value) {
			if (value == index) {
				urlExists = true;
			}
		});
		if (!urlExists)
			pauseArray.push(index);
		printLog("pauseArray.length @PAUSEALL" + pauseArray.length);
	});
	pauseDownload(currentDownloder, currentIndex);
}

//Cancel All Downloads
function cancelAllDownloads() {
	cancelDownload(currentDownloder, currentIndex);
}
//Resume All Downloads
function resumeAllDownload() {
	$.each(multipleDownloadArray, function(key, value) {
		var index = getIndexFromURL(value);
		resumeDownload(value, index);
	});
}
//Check Wifi Connection
function checkConnection() {
	try {
		if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
			var networkState = navigator.connection.type;
			var states = {};
			states[Connection.UNKNOWN] = 'Unknown';
			states[Connection.ETHERNET] = 'Ethernet';
			states[Connection.WIFI] = 'WiFi';
			states[Connection.CELL_2G] = '2G';
			states[Connection.CELL_3G] = '3G';
			states[Connection.CELL_4G] = '4G';
			states[Connection.CELL] = 'generic';
			states[Connection.NONE] = 'No network connection';
			return states[networkState];
		} else {
			return 'Unknown';
		}

	} catch(e) {
		return 'No network connection';
	}
}

function startAutoDownload() {
	printLog("START DOWNLOAD PROCESS FOR AUTODOWNLOADS");

	var dwn_index = "", autoDownloadArray = [], j = 0;
	var totalModulesArray = JSON.parse(localStorage.jsonUserAssignedModules);
	$.each(totalModulesArray, function(i,v) {
		if($.isArray(v.courseLookup)) {
			if(v.courseLookup[0].courseTypeDTO.isFluidX == "true") {
				autoDownloadArray[j] = v;
				j++;
			}
		}
		else {
			if(v.courseLookup.courseTypeDTO.isFluidX == "true") {
				autoDownloadArray[j] = v;
				j++;
			}
		}
	});
	var downloadedArray = getLocalDownloadArray();
	var newDA = [];
	$.each(downloadedArray, function(i,v) {
		v = parseInt(v,10).toString();
		newDA.push(v);
	});
	var newautoDownloadArray = $.grep(autoDownloadArray, function(v) {
		return $.inArray(v.moduleId, newDA) == -1; 
	});
	numberOfAutoDownloadsProcessed = 0;
	isAutoDownloading = true;
	$.each(newautoDownloadArray, function(key, value) {
		if (autoRunningDownloads >= allowedAutoDownloads) {
			return false;
		} else {
			var index = "", moduleId = "", systemID = "";
			if($.isArray(value.courseLookup)) {
				index = value.courseLookup[0].moduleId + value.courseLookup[0].language;
				moduleId = value.courseLookup[0].moduleId; 
				systemID = value.courseLookup[0].course;
			}
			else {
				index = value.courseLookup.moduleId + value.courseLookup.language;
				moduleId = value.courseLookup.moduleId; 
				systemID = value.courseLookup.course;
			}
			localStorage.setItem('currentIndex',index);
			var source = getSourceFromIndex(index);
			networkCheckBeforeStart(index,source, moduleId, systemID, false);
			numberOfAutoDownloadsProcessed++;
			printLog("NUMBER OF AUTODOWNLOADS PROCESSED: " + numberOfAutoDownloadsProcessed);
		}
	});
}

function startAutoDelete() {
	var storedCourseStatus = localStorage.getItem("courseStatuses");
	var storedCourseStatusArray = JSON.parse(localStorage.getItem("courseStatuses"));

	$.each(availableHistoryCourses, function(i, v) {
		$.each(storedCourseStatusArray, function(ind, val) {
			if(v == parseInt(val.index, 10).toString()) {
				var currentSource = val.source;
				var currentCourse = val.course;
				multiDelete = true;
				deleteDownload(currentSource,currentCourse);
			}
		});
	});
	multiDelete = false;
}

function updateScromObject(){
	printLog("Inside updateScromObject");
	var currentCourse = localStorage.getItem("currentCourse");
	printLog("updateScromObject currentCourse: " + currentCourse);
	var cCJson = JSON.parse(localStorage.getItem("currentCourseJson"));
	printLog("updateScromObject cCJson: " + JSON.stringify(cCJson));
	var cCLScromObject = JSON.parse(localStorage.getItem("SCROM-" + currentCourse));
	var cCDBSCROMObject = JSON.parse(dummySymphonyScromObject);
	printLog("before cCLScromObject: " + JSON.stringify(cCLScromObject));
	printLog("before cCDBSCROMObject: " + JSON.stringify(cCDBSCROMObject));
	printLog("before symphonyscorm: " + JSON.stringify(localStorage.getItem("symphonyscorm")));
	var coreLesson = '';
	var lessonLocation = 'test';
	var lessonsDoneTime = 0;
	var sessionTime = 0;
	var quizScore = 0;
	var isCourseUpdatedInDb = false;
	isCurrentCourseUpdated = false;
	if(cCJson.lrnResponse.success) {
		if(!(cCJson.mobileAiccCourseStateDTO == undefined || 
				cCJson.mobileAiccCourseStateDTO == null || 
				cCJson.mobileAiccCourseStateDTO == "" ||
				cCJson.mobileAiccCourseStateDTO == 'undefined' || 
				cCJson.mobileAiccCourseStateDTO == 'null')) {
			printLog("inside cCJson.mobileAiccCourseStateDTO>> ");
			coreLesson = cCJson.mobileAiccCourseStateDTO.coreLesson;
			lessonLocation = cCJson.mobileAiccCourseStateDTO.lessonLocation;
			printLog("===== " + coreLesson + lessonLocation);
			isCourseUpdatedInDb = true;
		}
		if(!(cCJson.mobileCourseEventDTOList == undefined || 
				cCJson.mobileCourseEventDTOList == null || 
				cCJson.mobileCourseEventDTOList == "" ||
				cCJson.mobileCourseEventDTOList.length == undefined)){
			$.each(cCJson.mobileCourseEventDTOList,function(mCEDListIndex,mCEDListValue) {
				if(mCEDListValue.action == 'lessonsdonetime'){
					lessonsDoneTime = mCEDListValue.value;
				} else if (mCEDListValue.action == 'sessions'){
					sessionTime = mCEDListValue.value;
				} else if (mCEDListValue.action == 'quizscore'){
					quizScore = mCEDListValue.value;
				}
				printLog("===== " + lessonsDoneTime + sessionTime + quizScore);
			});
			isCourseUpdatedInDb = true;
		}
	}
	printLog("coreLesson " + coreLesson + " lessonLocation " + lessonLocation);
	printLog("lessonsDoneTime " + lessonsDoneTime + " sessionTime " + sessionTime);
	printLog("quizScore " + quizScore);
	printLog("after isCourseUpdatedInDb>> " + isCourseUpdatedInDb);
	if(cCLScromObject == null) {
		printLog("inside 1...");
		if(isCourseUpdatedInDb) {
			printLog("inside 2...");
			$.each(cCDBSCROMObject.organizations.LRN.cmi.TEST,function(index,value) {
				if(index == 'cmi.core.lesson_location') {
					value.value = lessonLocation;
				} else if (index == 'cmi.core.total_time') {
					value.value = getTime(lessonsDoneTime);
				} else if (index == 'cmi.core.session_time'){
					value.value = getTime(sessionTime); 
				} else if (index == 'cmi.suspend_data'){
					value.value = coreLesson;
				} else if (index == 'cmi.student_data.mastery_score'){
					value.value = quizScore;
				} else if (index == 'cmi.core.student_id'){
					value.value = localStorage.getItem('userId');
				}				
			});
			localStorage.setItem("symphonyscorm", JSON.stringify(cCDBSCROMObject));
			isCurrentCourseUpdated = true;
		}
	} else {
		printLog("inside 3...");
		if(isCourseUpdatedInDb) {
			var suspendData = "";
			$.each(cCLScromObject.organizations.LRN.cmi.TEST,function(index,value){
				if (index == 'cmi.suspend_data'){
					suspendData = value.value;
				}            
			});
			printLog("inside 4..." + suspendData);
			if(coreLesson.length > suspendData.length ) {
				printLog("inside 5...");
				$.each(cCLScromObject.organizations.LRN.cmi.TEST,function(index,value){
					if(index == 'cmi.core.lesson_location'){
						value.value = lessonLocation;
					} else if (index == 'cmi.core.total_time'){
						value.value = getTime(lessonsDoneTime);
					} else if (index == 'cmi.core.session_time'){
						value.value = getTime(sessionTime); 
					} else if (index == 'cmi.suspend_data'){
						value.value = coreLesson;
					} else if (index == 'cmi.student_data.mastery_score'){
						value.value = quizScore;
					}             
				});
			}
			isCurrentCourseUpdated = true;
		} 
		localStorage.setItem("symphonyscorm", JSON.stringify(cCLScromObject));
	}
	printLog("after cCLScromObject: " + JSON.stringify(cCLScromObject));
	printLog("after cCDBSCROMObject: " + JSON.stringify(cCDBSCROMObject));
	printLog("after symphonyscorm: " + JSON.stringify(localStorage.getItem("symphonyscorm")));
	return isCurrentCourseUpdated;
}