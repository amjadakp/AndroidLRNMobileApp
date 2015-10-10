/**
 * controls single download file 
 *
 * @method startingSingleDownloadControls
 * @param {String} index index
 * @return {Boolean} Returns true on success
 */
function startingSingleDownloadControls(index) {
	$("#offline" + index).css('display', 'none');
	$("#online" + index).css('display', 'none');
	$("#download" + index).css('display', 'none');
	$("#cancel" + index).css('display', 'inline-block');
	$("#pause" + index).css('display', 'inline-block');
	$("#resume" + index).css('display', 'none');
	$("#progress" + index).css('display', 'inline-block');
	$('#status' + index).css('display', 'inline-block');
	$("#progress" + index).progressbar({
		value: 0
	});
	if(($(window).width() == 1024 && $(window).height() == 527) || ($(window).width() == 1024 && $(window).height() == 768) || ($(window).width() == 768 && $(window).height() == 1024)) {
		$("#mandatory_catalysts").css("top", "75px");
		$("#optional_catalysts").css("top", "75px");
	}
	else {
		$("#mandatory_catalysts").css("top", "52px");
		$("#optional_catalysts").css("top", "52px");
	}
	return true;
}
/**
 * controls resume while single download file is in progress 
 *
 * @method resumingSingleDownloadControls
 * @param {String} index index
 */
function resumingSingleDownloadControls(index) {
	$('#status' + index).html("Resuming...");
	$("#download" + index).css('display', 'none');
	$("#offline" + index).css('display', 'none');
	$("#online" + index).css('display', 'none');
	$("#resume" + index).css('display', 'none');
	$("#cancel" + index).css('display', 'inline-block');
	$("#pause" + index).css('display', 'inline-block');
	$("#progress" + index).css('display', 'inline-block');
	$('#status' + index).css('display', 'inline-block');


	try {
		$("#progress" + index).progressbar({
			value: parseInt(localStorage.getItem("'" + index + "'"))
		});
	} catch(e) {
		$("#progress" + index).progressbar({
			value: 0
		});
	}
}
/**
 * controls exception while single download file is in progress 
 *
 * @method exceptionSingleDownloadControls
 * @param {integer} info info
 */
function exceptionSingleDownloadControls(info) {
	index = getIndexFromURL(info.url);
	$("#status" + index).css('display', 'none');
	$("#pause" + index).css('display', 'none');
	$("#resume" + index).css('display', 'none');
	$("#cancel" + index).css('display', 'none');
	$("#progress" + index).css('display', 'none');
	$("#download" + index).css('display', 'inline-block');
	$("#offline" + index).css('display', 'none');
	$("#online" + index).css('display', 'inline-block');
	var isPreviewPage = false;
	try {
		isPreviewPage = ($.mobile.activePage.attr('id') == 'modulesPreview');
		if (isPreviewPage) {
			printLog("PREVIEW SINGLE EXCEPTION");
			$('.statusPreview' + index).html("");
			$("#cancelPreview" + index).css('display', 'none');
			$("#pausePreview" + index).css('display', 'none');
			$("#resumePreview" + index).css('display', 'none');
			$("#progressPreview" + index).css('display', 'none');
			$('#statusPreview' + index).css('display', 'none');
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
	multipleDownloadArray = jQuery.grep(multipleDownloadArray, function(url) {
		return url != info.url;
	});
	downloadUrlCount = multipleDownloadArray.length;
	printLog("multipleDownloadArray.length @SINGLE EXCEPTION: " + multipleDownloadArray.length);

}
/**
 * controls progress of download file while single download file is in progress 
 *
 * @method progressSingleDownloadControls
 * @param {integer} info info
 */
function progressSingleDownloadControls(info) {
	index = getIndexFromURL(info.url);
	var previousProgress;
	var totalSize = localStorage.getItem("courseSize-"+index);
	try {
		previousProgress = parseInt(localStorage.getItem("'" + index + "'"));
	} catch(e) {
		previousProgress = 0;
	}
	if (parseInt(info.progress) - previousProgress < 5) {
		$('#status' + index).css('display', 'inline-block');
		$("#cancel" + index).css('display', 'inline-block');
		$("#pause" + index).css('display', 'inline-block');
		$("#resume" + index).css('display', 'none');
	}
	printLog("download speed======================"+JSON.stringify(info) + " " + info.progress + " " + parseInt(info.progress));
	$('#status' + index).html("Download in Progress<br>"+ Math.round((((parseInt(info.progress))/100)*totalSize)) +"MB of " + totalSize +"MB ("+ info.download_speed + ")");
	$("#progress" + index).progressbar({
		value: parseInt(info.progress)
	});

}
/**
 * controls unzipping the downloaded file where only one download is in place
 * @method unzipSingleDownloadControls
 * @param {integer} info info
 */
function unzipSingleDownloadControls(info) {
	index = getIndexFromURL(info.url);
	printLog("Unzip single downloaded.....");
	$("#offline" + index).css('display', 'inline-block');
	printLog("showing downloaded button======>");
	$("#downloadedLabel" + index).css('display', 'inline-block');
	$("#online" + index).css('display', 'none');
	$("#cancel" + index).css('display', 'none');
	$("#pause" + index).css('display', 'none');
	$('#status' + index).css('display', 'none');
	$("#progress" + index).css('display', 'none');
	multipleDownloadArray = jQuery.grep(multipleDownloadArray, function(url) {
		return url != info.url;
	});
	downloadUrlCount = multipleDownloadArray.length;
	if (downloadUrlCount < 1)
		isCompleted = true;
}
/**
 * controls when multiple download files are in place
 * @method startingMultipleDownloadControls
 */
function startingMultipleDownloadControls() {
	if (downloadUrlCount > 1) {
		$("#downloadAllSection").show();
		$(".btn-download-all").hide();
		$(".btn-download-all-pause").show().css('display', 'inline-block');
		$(".btn-download-all-cancel").show().css('display', 'inline-block');
		$("#downloadStatusAll").show();
		$("#downloadProgressAll").show();
		try {
			if (parseInt(info.global_process_progress) < 1) {
				$("#downloadProgressAll").progressbar({
					value: 0
				});
				$("#downloadStatusAll").html("Download in Progress");
			}
		} catch(e) {
			$("#downloadProgressAll").progressbar({
				value: 0
			});
			$("#downloadStatusAll").html("Download in Progress");
		}

		$("#mandatory_catalysts").css("top", "145px");
		$("#optional_catalysts").css("top", "145px");
		try {
			jQuery.each(multipleDownloadArray, function(key, value) {
				var localIdx = getIndexFromURL(value);
				$("#cancel" + localIdx).css('display', 'none');
				$("#pause" + localIdx).css('display', 'none');
				$("#resume" + localIdx).css('display', 'none');
				$('#status' + localIdx).hide();
			});
		} catch(e) {
			printLog("EXCEPTION AUTO Resume " + e);
		}
	} else {
		if(($(window).width() == 1024 && $(window).height() == 527) || ($(window).width() == 1024 && $(window).height() == 768) || ($(window).width() == 768 && $(window).height() == 1024)) {
			$("#mandatory_catalysts").css("top", "75px");
			$("#optional_catalysts").css("top", "75px");
		}
		else {
			$("#mandatory_catalysts").css("top", "52px");
			$("#optional_catalysts").css("top", "52px");
		}
	}
}
/**
 * controls multiple downloads when user wants to resume dwonloads
 * @method resumingMultipleDownlaodControls
 * @param {string} index index
 */
function resumingMultipleDownlaodControls(index) {
	$("#downloadStatusAll").html("Resuming...");
	$("#downloadAllSection").show();
	$(".btn-download-all").hide();
	$(".btn-download-all-pause").show().css('display', 'inline-block');
	$(".btn-download-all-resume").show().css('display', 'none');
	$(".btn-download-all-cancel").show().css('display', 'inline-block');
	$("#downloadStatusAll").show();
	$("#downloadProgressAll").show();
	$('#status' + index).hide();
	$("#offline" + index).css('display', 'none');
	$("#online" + index).css('display', 'none');
	$("#progress" + index).css('display', 'inline-block');
	$("#cancel" + index).css('display', 'none');
	$("#pause" + index).css('display', 'none');
	$("#resume" + index).css('display', 'none');
	try {
		$("#progress" + index).progressbar({
			value: parseInt(localStorage.getItem("'" + index + "'"))
		});
	} catch(e) {
		$("#progress" + index).progressbar({
			value: 0
		});
	}
	$("#mandatory_catalysts").css("top", "145px");
	$("#optional_catalysts").css("top", "145px");
}
/**
 * controls multiple downloads when user wants to resume dwonloads
 * @method resumingMultipleDownlaodControls
 * @param {object} info info
 */
function exceptionMultipleDownloadControls(info) {

	currentIndex = getIndexFromURL(info.url);

	var isPreviewPage = false;
	try {
		isPreviewPage = ($.mobile.activePage.attr('id') == 'modulesPreview');
		if (isPreviewPage) {
			printLog("PREVIEW SINGLE EXCEPTION");
			$('.statusPreview' + currentIndex).html("");
			$("#cancelPreview" + currentIndex).css('display', 'none');
			$("#pausePreview" + currentIndex).css('display', 'none');
			$("#resumePreview" + currentIndex).css('display', 'none');
			$("#progressPreview" + currentIndex).css('display', 'none');
			$('#statusPreview' + currentIndex).css('display', 'none');
			$(".downloadThisModule").css('display', 'inline-block');
			$(".languageToDownload" + currentIndex).show();
			$("#downloadButtonsModulePreview" + currentIndex).css('display', 'inline-block');
			$("#onlineincat" + currentIndex).show();
			$("#offlineincat" + currentIndex).hide();
			$("#SelectLanguageGetStarted1").val("en");
		} else {
			localStorage.setItem('othLangDownloadSrc', "");
			localStorage.setItem('othLangDownloadIdx', "");
			localStorage.setItem("'" + currentIndex + "'othLangDownload", "");
		}
	} catch(e) {}

	$("#status" + currentIndex).css('display', 'none');
	$("#pause" + currentIndex).css('display', 'none');
	$("#resume" + currentIndex).css('display', 'none');
	$("#cancel" + currentIndex).css('display', 'none');
	$("#progress" + currentIndex).css('display', 'none');
	$("#download" + currentIndex).css('display', 'inline-block');
	$("#online" + currentIndex).css('display', 'inline-block');
	$("#offline" + currentIndex).css('display', 'none');
	currentIndex = "";
	multipleDownloadArray = jQuery.grep(multipleDownloadArray, function(url) {
		return url != info.url;
	});
	downloadUrlCount = multipleDownloadArray.length;
	printLog("multipleDownloadArray.length @MULTI EXCEPTION: " + multipleDownloadArray.length);
	if (multipleDownloadArray.length == 1) {
		index = getIndexFromURL(multipleDownloadArray[0]);
		$("#downloadProgressAll").progressbar({
			value: 0
		});
		$("#downloadStatusAll").html("");
		$("#downloadAllSection").hide();
		$("#status" + index).css('display', 'inline-block');
		printLog("AppState:" + appstate);
		if (appstate == "pause") {
			$("#resume" + index).css('display', 'inline-block');
			$("#pause" + index).css('display', 'none');
			$("#status" + index).html('  Download Paused  ');
		} else {
			$("#resume" + index).css('display', 'none');
			$("#pause" + index).css('display', 'inline-block');
		}
		$("#cancel" + index).css('display', 'inline-block');
		$("#progress" + index).css('display', 'inline-block');
		$("#download" + index).css('display', 'none');
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
	}

}

function progressMultipleDownloadControls(info) {
	currentIndex = getIndexFromURL(info.url); 
	currentDownloder = info.url;
	$("#downloadProgressAll").progressbar({
		value: parseInt(info.global_process_progress)
	});
	$("#downloadStatusAll").html("Download in Progress<br> ("+ info.global_process_speed + ")");
	printLog("download speed======================"+JSON.stringify(info) + " " + info.global_process_progress + " " + parseInt(info.global_process_progress));

	var previousProgress;
	try {
		previousProgress = parseInt(localStorage.getItem("'" + currentIndex + "'"));
	} catch(e) {
		previousProgress = 0;
	}
	if (parseInt(info.progress) - previousProgress < 5) {
		$(".btn-download-all-pause").css('display', 'inline-block');
		$(".btn-download-all-cancel").css('display', 'inline-block');
		$(".btn-download-all-resume").css('display', 'none');
		currentIndex = getIndexFromURL(info.url);
		$("#cancel" + currentIndex).css('display', 'none');
		$("#pause" + currentIndex).css('display', 'none');
		$('#status' + currentIndex).css('display', 'none');
		$("#offline" + currentIndex).css('display', 'none');
		$("#online" + currentIndex).css('display', 'none');
		$("#downloaded" + currentIndex).css('display', 'none');
		$("#progress" + currentIndex).css('display', 'inline-block');
	}
	$("#progress" + currentIndex).progressbar({
		value: parseInt(info.progress)
	});
}

function unzipMultipleDownloadControls(info) {
	currentIndex = getIndexFromURL(info.url);
	$("#cancel" + currentIndex).css('display', 'none');
	$("#pause" + currentIndex).css('display', 'none');
	$("#progress" + currentIndex).css('display', 'none');
	$("#offline" + currentIndex).css('display', 'inline-block');
	$("#downloadedLabel" + currentIndex).css('display', 'inline-block');
	$("#online" + currentIndex).css('display', 'none');
	currentIndex = "";
	currentDownloder = "";
	multipleDownloadArray = jQuery.grep(multipleDownloadArray, function(url) {
		return url != info.url;
	});
	downloadUrlCount = multipleDownloadArray.length;
	if (multipleDownloadArray.length < 2) {

		$(".btn-download-all").css('display', 'none');
		$(".btn-download-all-pause").css('display', 'none');
		$(".btn-download-all-cancel").css('display', 'none');
		$("#downloadProgressAll").progressbar({
			value: 0
		}).hide();
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

	}
	if (multipleDownloadArray.length == 0) {
		isCompleted = true;
	}
}

function iScrollHelper() {
	setTimeout(function() {
		if (typeof moduleDescScroller1 == 'undefined' || moduleDescScroller1 == null) {
			if ($('#moduleDescWrapper1') != null) {
				printLog("verified scroller and wrapper creating new instance!!!!");
				moduleDescScroller1 = new iScroll('moduleDescWrapper1', {
					bounce: false
				});
			}

		}

	}, 10);
}

function setModulePreviewControlOnNewDownload(index) {
	var notFound = true;
	if (multipleDownloadArray.length > 1) {

		printLog("Preview Multiple:application.js");
		jQuery.each(multipleDownloadArray, function(key, value) {
			var localIdx = getIndexFromURL(value);
			if (index == localIdx) {
				$("#downloadButtonsModulePreview" + localIdx).hide();
				$("#downloadedincat" + localIdx).css('display', 'none');
				$("#onlineincat" + localIdx).css('display', 'none');
				$(".languageToDownload" + localIdx).css('display', 'none');
				$("#statusPreview" + localIdx).css('display', 'none');
				$("#progressPreview" + localIdx).css('display', 'inline-block');
				$("#pausePreview" + localIdx).css('display', 'none');
				$("#cancelPreview" + localIdx).css('display', 'none');
				$("#resumePreview" + localIdx).css('display', 'none');
				try {
					$("#progressPreview" + localIdx).progressbar({
						value: parseInt(localStorage.getItem("'" + index + "'"))
					});
				} catch(e) {
					$("#progressPreview" + localIdx).progressbar({
						value: 0
					});
				}
			}
		});
	} else {
		printLog("Preview Single:application.js");
		try {
			$("#resumePreview" + index).css('display', 'none');
			jQuery.each(multipleDownloadArray, function(key, value) {

				var localIdx = getIndexFromURL(value);

				$("#downloadButtonsModulePreview" + localIdx).hide();
				if (appstate == "pause" && index == localIdx) {
					$("#pausePreview" + localIdx).css('display', 'none');
					printLog("Preview paused: application.js");
					$(".languageToDownload" + localIdx).hide();
					$('.statusPreview' + localIdx).html("Download Paused");
					notFound = false;
					$("#onlineincat" + localIdx).css('display', 'none');

					$(".languageToDownload" + localIdx).css('display', 'none');
					$("#statusPreview" + localIdx).css('display', 'inline-block');
					$("#progressPreview" + localIdx).css('display', 'inline-block');
					$("#resumePreview" + localIdx).css('display', 'inline-block');
					$("#cancelPreview" + localIdx).css('display', 'inline-block');
					try {
						$("#progressPreview" + localIdx).progressbar({
							value: parseInt(localStorage.getItem("'" + index + "'"))
						});
					} catch(e) {
						$("#progressPreview" + localIdx).progressbar({
							value: 0
						});
					}
				} else {
					printLog("Preview when running:application.js");
					notFound = false;
					$("#onlineincat" + localIdx).css('display', 'none');

					$(".languageToDownload" + localIdx).css('display', 'none');
					$("#statusPreview" + localIdx).css('display', 'inline-block');
					$("#progressPreview" + localIdx).css('display', 'inline-block');
					$("#resumePreview" + localIdx).css('display', 'none');
					$("#cancelPreview" + localIdx).css('display', 'inline-block');
					$("#pausePreview" + localIdx).css('display', 'inline-block');
					try {
						$("#progressPreview" + localIdx).progressbar({
							value: parseInt(localStorage.getItem("'" + index + "'"))
						});
					} catch(e) {
						$("#progressPreview" + localIdx).progressbar({
							value: 0
						});
					}
				}
			});
		} catch(e) {}
		if (notFound) {
			printLog("Preview Single Notfound:application.js");
			printLog("Preview Single Notfound index:application.js " + index);
			$("#statusPreview" + index).css('display', 'none');
			$("#progressPreview" + index).css('display', 'none');
			$("#pausePreview" + index).css('display', 'none');
			$("#cancelPreview" + index).css('display', 'none');
			$("#downloaded" + index).css('display', 'none');

		}
	}
}
function downloadPreviewProgress(info) {
	var isPreviewPage = false;

	try {
		isPreviewPage = ($.mobile.activePage.attr('id') == 'modulesPreview');
		if (isPreviewPage) {
			var previewCurrentIndex;
			previewCurrentIndex = getIndexFromURL(info.url);
			var totalSize = localStorage.getItem("courseSize-"+previewCurrentIndex);
			moduleToShow = previewCurrentIndex;
			if (previewCurrentIndex == moduleToShow) {
				$("#progressPreview" + previewCurrentIndex).progressbar({
					value: parseInt(info.progress)
				});
				$('.statusPreview' + previewCurrentIndex).html("Download in Progress<br>"+ Math.round((((parseInt(info.progress))/100)*totalSize)) +"MB of " + totalSize +"MB ("+ info.download_speed + ")");

				var previousProgress;
				try {
					previousProgress = parseInt(localStorage.getItem("'" + previewCurrentIndex + "'"));
				} catch(e) {
					previousProgress = 0;
				}

				if (!moduleShown && (parseInt(info.progress) - previousProgress < 5)) {
					$("#onlineincat" + previewCurrentIndex).css('display', 'none');
					$(".languageToDownload" + previewCurrentIndex).css('display', 'none');
					try {
						jQuery.each(multipleDownloadArray, function(key, value) {
							var localIdx = getIndexFromURL(value);
							$(".cancelPreview" + localIdx).css('display', 'inline-block');
							$(".pausePreview" + localIdx).css('display', 'inline-block');
							$("#progressPreview" + localIdx).css('display', 'inline-block');
							$('.statusPreview' + localIdx).css('display', 'inline-block');
							if (multipleDownloadArray.length > 1) {
								$("#cancelPreview" + localIdx).css('display', 'none');
								$("#pausePreview" + localIdx).css('display', 'none');
								$("#resumePreview" + localIdx).css('display', 'none');
								$('#statusPreview' + localIdx).css('display', 'none');
							}
						});
					} catch(e) {
						printLog("EXCEPTION AUTO Resume " + e);
					}
				}

				if (info.status == 'unzip') {
					try {
						$('.statusPreview' + previewCurrentIndex).html("unzipping please wait...");
						$(".cancelPreview" + previewCurrentIndex).css('display', 'none');
						$(".pausePreview" + previewCurrentIndex).css('display', 'none');
						$('.resumePreview' + previewCurrentIndex).css('display', 'none');
						$("#progressPreview" + previewCurrentIndex).css('display', 'inline-block');
					} catch(e) {}
				}
				if (info.status == 'finished') {
					$("#progressPreview" + previewCurrentIndex).progressbar({
						value: 0
					});
					$(".offline" + previewCurrentIndex).css('display', 'none');
					$(".cancelPreview" + previewCurrentIndex).css('display', 'none');
					$(".pausePreview" + previewCurrentIndex).css('display', 'none');
				}
				if (info.status == 'unzip completed') {
					printLog("====unzip completed====");
					$("#online" + previewCurrentIndex).css('display', 'none');
					$("#availOffline" + previewCurrentIndex).css('display', 'inline-block');
					printLog("The preview current index is======" + previewCurrentIndex);
					$("#downloadedLabel" + previewCurrentIndex).css('display', 'inline-block');
					$(".cancelPreview" + previewCurrentIndex).css('display', 'none');
					$(".pausePreview" + previewCurrentIndex).css('display', 'none');
					$('.statusPreview' + previewCurrentIndex).css('display', 'none');
					$("#progressPreview" + previewCurrentIndex).css('display', 'none');
					multipleDownloadArray = jQuery.grep(multipleDownloadArray, function(url) {
						return url != info.url;
					});
					downloadUrlCount = multipleDownloadArray.length;
					printLog("multipleDownloadArray.length @PREVIEW UNZIP COMPLETED: " + multipleDownloadArray.length);
					try {
						var language = localStorage.getItem("'" + previewCurrentIndex + "'othLangDownload");
						var langIndex = previewCurrentIndex;
						if (typeof(language) != 'undefined' && language != '' && language != null) {
							langIndex = previewCurrentIndex + deLimiter + language;
						}
						statesArray = jQuery.grep(statesArray, function(a) {

							return a.toString().split('|')[0] != langIndex;
						});
						var value = (langIndex + "|100|finished").toString();

						statesArray.push(value);
						insertValues();
					} catch(e) {}
					$('#statusPreview' + previewCurrentIndex).html("");
					$("#progressPreview" + previewCurrentIndex).progressbar({
						value: 100
					});
					if (typeof(language) != 'undefined' && language != '' && language != null) {
						setControlsAfterLanguageDownload(previewCurrentIndex);
					}
				}
			}
		}
	} catch(e) {}
}

function setControlsAfterLanguageDownload(index) {
	$("#status" + index).css('display', 'none');
	$("#pause" + index).css('display', 'none');
	$("#resume" + index).css('display', 'none');
	$("#cancel" + index).css('display', 'none');
	$("#progress" + index).css('display', 'none');
	$("#download" + index).css('display', 'inline-block');
	$("#offline" + index).css('display', 'none');
	$("#online" + index).css('display', 'inline-block');
	var isPreviewPage = false;
	try {
		isPreviewPage = ($.mobile.activePage.attr('id') == 'modulesPreview');
		if (isPreviewPage) {
			$('.statusPreview' + index).html("");
			$("#cancelPreview" + index).css('display', 'none');
			$("#pausePreview" + index).css('display', 'none');
			$("#resumePreview" + index).css('display', 'none');
			$("#progressPreview" + index).css('display', 'none');
			$('#statusPreview' + index).css('display', 'none');
			$(".downloadThisModule").css('display', 'inline-block');
			$(".languageToDownload" + index).show();
			$("#downloadButtonsModulePreview" + index).css('display', 'inline-block');
			$("#onlineincat" + index).show();
			$("#offlineincat" + index).hide();

		}
	} catch(e) {}
}