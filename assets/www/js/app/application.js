
var disabled = false;
var syncTimer = 0;
var lastSync = "";
var multiDelete = false;
var isNetworkAvailable = true;
var moduleID = new Array();
var mandatoryScroller,
optionalScroller,
downloadScroller,
historyScroller,
moduleDescScroller1,
siteIdScroller,
moreOptScroller;
var retrievedLastsync = false;
var autoDownloadArray = new Array();
var frameWidth = "";
var frameHeight = "";
var memoryFlag = false;
var moduleParameters = [];
var moduleIdSaved = "";
var syncAuto, previousSyncFreqTime;
var downloadRunning,downloadPaused;
var deleteFolderName = "";
var sameUser = false;	
var enableAutoDownload = false;
var enableAutoDelete = false;

//document ready event
$(document).ready(function(){
	localStorage.setItem("isMobileApp", true);
	if(isMobile.iOS()) {
		frameHeight = screen.height;
		frameWidth = screen.width;
	}
	else {
		frameHeight = screen.height/window.devicePixelRatio;
		frameWidth = screen.width/window.devicePixelRatio;
	}

	setTimeout(function() {
		if (localStorage.getItem("siteID") == null || localStorage.getItem("siteID") === "") {
			$.mobile.changePage("#siteconfig");
		} else if (localStorage.getItem("userId") === null || localStorage.getItem("userId") === "") {
			$.mobile.changePage("#login");
		} else {
			previousSiteID	=	localStorage.getItem('siteID');
			previousUser = localStorage.getItem('uName');
			updateCoursesOnSync = false;
			ProcessUserAssignedModulesResponse();
		}
	}, 200);
	isNetworkAvailable = navigator.onLine;

	$("#siteIDConfig").on("submit",function(event){
		event.preventDefault();
		var siteID = $("#txt_SiteID").val();
		if(siteID === "" || isNaN(siteID)) {
			$("#wrongSiteId").simpledialog2();
		}
		else {
			if(isNetworkAvailable){
				checklocalStorage(siteID);
				if(sameUser)
					$.mobile.changePage("#login");
				else
					SetSiteConfiguration(siteID);
			}else{
				$("#connectionRequired").simpledialog2();
				HideDefaultLoadingImage();
			}
		}
		return false;
	});
	$("#userLoginForm").submit(function(e) {
		e.preventDefault();
		printLog("Login button click");
		var isLoginPage = false;
		printLog('login page---');
		var userName = $("#txt_userName").val();
		if (userName.indexOf(' ') >= 0)
			userName = "";
		var password = $("#txt_password").val();
		if ($("#txt_userName").val().trim() == '' || $("#txt_password").val().trim() == '') {
			$("#signinFailurePop").simpledialog2();
			$("#txt_userName").val('');
			$("#txt_password").val('');
		} else {
			ShowDefaultLoadingImage("Signing In");
			checklocalStorage(userName);
			if(localStorage.getItem("settings_autoDownload") == null){
				localStorage.setItem("settings_autoDownload", "0");
				localStorage.setItem("settings_autoDelete", "0");
				localStorage.setItem("settings_wifi", "1");
				localStorage.setItem("settings_notification", "1");
				localStorage.setItem("settings_syncFrequency", "6");
				localStorage.setItem("settings_lastSynced", "Not Synced");
				localStorage.setItem("settings_rowLastSynced", "Not Synced");
				$("#rowLastSyncTime").append("Last Sync: Not Synced");
				setTimeout(function() {
					syncAutomatically(6*60*60*1000);
				}, 6*60*60*1000);
			}
			if(sameUser)
				ProcessUserAssignedModulesResponse();
			else
				authenticate(userName, password);
		}
		return false;
	});

	$("#btn_GetSiteID").on('click', function() {
		$("#noSiteId").simpledialog2();
	});

	$(".tabs-block div").on('click', function() {
		_courseType = $(this).attr('id');
		if (!$(this).hasClass('active')) {
			$(".tabs-block div").removeClass('active');
			$(this).addClass('active');
			if (this.id == 'mandatory') {
				$("#optional_catalysts").hide();
				$("#mandatory_catalysts").show();

				try {
					setTimeout(function() {
						if (typeof mandatoryScroller != 'undefined')
							mandatoryScroller.refresh();
					}, 200);
				} catch(e) {
					printLog("Error: " + e);
				}
			} else {
				$("#mandatory_catalysts").hide();
				$("#optional_catalysts").show();

				try {
					setTimeout(function() {
						if (typeof optionalScroller != 'undefined')
							optionalScroller.refresh();
					}, 200);
				} catch(e) {
					printLog("Error: " + e);
				}
			}
		}
	});

	$(".moreoptions").on('tap', function(e) {
		if (playerPage) {
			playerPage = false;
			exitCoursePlayer();
		}
		if($.mobile.activePage.attr('id') == 'landingpage' || $.mobile.activePage.attr('id') == 'modulesPreview') {
			$("#modules .ui-icon").css('background-image', 'url(images/app/courses.png)');
		}else if($.mobile.activePage.attr('id') == 'downloadsPage') {
			$("#downloads .ui-icon").css('background-image', 'url(images/app/download.png)');
		}else if($.mobile.activePage.attr('id') == 'historyPage') {
			$("#history .ui-icon").css('background-image', 'url(images/app/history.png)');
		}else if($.mobile.activePage.attr('id') == 'howItWorks') {
			$("#how-it-works .ui-icon").css('background-image', 'url(images/app/info.png)');
		}     
		$("#settings .ui-icon").css('background-image', 'url(images/app/more_b.png)');
		retrieveMobileLastSync();
		$.mobile.changePage("#moreopPage");
	});

	$(".syncAppMobile").on('tap', function(e) {
		e.preventDefault();
		clearInterval(syncAuto);
		ShowDefaultLoadingImage("Syncing in Progress");               
		var syncScheduleTime = Number(localStorage.getItem("settings_syncFrequency"));
		var syncScheduleTimeInMS = syncScheduleTime*60*60*1000;
		syncAutomatically(syncScheduleTimeInMS);
		syncData();
		return false;
	});

	$(".settingsPopover").on('tap', function(e) {
		e.preventDefault();

		retrieveMobileLastSync();
		$("#autoDownloadM").val(localStorage.getItem("settings_autoDownload")).slider('refresh');
		$("#autoDeleteM").val(localStorage.getItem("settings_autoDelete")).slider('refresh');
		$("#wifiDownloadM").val(localStorage.getItem("settings_wifi")).slider('refresh');
		$("#moduleNotificationM").val(localStorage.getItem("settings_notification")).slider('refresh');
		previousSyncFreqTime = localStorage.getItem("settings_syncFrequency");

		var settingsDiv = '<div id="settingsWrapper2"><div id="settingsScroller2">';
		settingsDiv += '<div class="MSC_row_1">';
		settingsDiv += '<div class="left"><input name="" type="button" value="Cancel" class="MSC_btn" id="SC_Mbtn_Cancel" data-corners="false"></div>';
		settingsDiv += '<div class="right"><input name="" id="SC_Mbtn_Save" data-corners="false" type="button" value="Save" class="MSC_btn"></div>';
		settingsDiv += ' </div>';
		settingsDiv += '<div id="moreWrapper">';
		settingsDiv += '<div id="moreWrapperScroller">';
		settingsDiv += '<div class="MSC_row_2">';
		settingsDiv +='<div class="MSC_option">';
		settingsDiv +='<div class="row_1">';
		settingsDiv +='<div class="left">Automatic Downloads </div>';
		settingsDiv +=' <div class="right">';
		settingsDiv +=' <form class="slider_option">';
		settingsDiv +='<select name="autoDownloadM" class="autoDownload" id="autoDownloadM" data-role="slider" data-mini="true" data-track-theme="a" data-theme="a">';

		if(localStorage.getItem("settings_autoDownload") == "0") {
			settingsDiv +='<option value="0" selected="selected">Off</option>';
			settingsDiv +='<option value="1">On</option>';
		}
		else {
			settingsDiv +='<option value="0">Off</option>';
			settingsDiv +='<option value="1" selected="selected">On</option>';
		}

		settingsDiv +='</select>';
		settingsDiv +='</form>';
		settingsDiv +=' </div>';
		settingsDiv +='</div>';
		settingsDiv +='<div class="row_2_1">Allows all assigned courses to be downloaded automatically when you log in.</div>';
		settingsDiv +='</div>';
		settingsDiv +=' <div class="MSC_option">';
		settingsDiv +='<div class="row_1">';
		settingsDiv +='<div class="left">Automatic Deleting</div>';
		settingsDiv +=' <div class="right">';
		settingsDiv +='<form class="slider_option">';
		settingsDiv +='<select name="autoDeleteM" class="autoDelete" id="autoDeleteM" data-role="slider" data-mini="true" data-track-theme="a" data-theme="a">';

		if(localStorage.getItem("settings_autoDelete") == "0") {
			settingsDiv +='<option value="0" selected="selected">Off</option>';
			settingsDiv +='<option value="1">On</option>';
		}
		else {
			settingsDiv +='<option value="0">Off</option>';
			settingsDiv +='<option value="1" selected="selected">On</option>';
		}

		settingsDiv +='</select>';
		settingsDiv +='</form>';
		settingsDiv +=' </div>';
		settingsDiv +=' </div>';
		settingsDiv +='<div class="row_2">Automatically deletes completed courses from your device once they have successfully synced.</div>';
		settingsDiv +='</div>';
		settingsDiv +=' <div class="MSC_option">';
		settingsDiv +='<div class="row_1">';
		settingsDiv +='<div class="left">Wi-Fi Downloads Only</div>';
		settingsDiv +='<div class="right">';
		settingsDiv +='<form class="slider_option">';
		settingsDiv +='<select name="wifiDownloadM" class="wifiDownload" id="wifiDownloadM" data-role="slider" data-mini="true" data-track-theme="a" data-theme="a">';
		if(localStorage.getItem("settings_wifi") == "0") {
			settingsDiv +='<option value="0" selected="selected">Off</option>';
			settingsDiv +='<option value="1">On</option>';
		}
		else {
			settingsDiv +='<option value="0">Off</option>';
			settingsDiv +='<option value="1" selected="selected">On</option>';
		}
		settingsDiv +='</select>';
		settingsDiv +='</form>';
		settingsDiv +='  </div>';
		settingsDiv +='</div>';
		settingsDiv +='<div class="row_2">Turning this off allows courses to be downloaded on your carrier network, which may result in data charges.</div>';
		settingsDiv +=' </div>';
		settingsDiv +='<div class="MSC_option">';
		settingsDiv +='<div class="row_1">';
		settingsDiv +='<div class="left">Module Notifications</div>';
		settingsDiv +='<div class="right">';
		settingsDiv +='<form class="slider_option">';
		settingsDiv +='<select name="moduleNotificationM" class="moduleNotification" id="moduleNotificationM" data-role="slider" data-mini="true" data-track-theme="a" data-theme="a">';
		if(localStorage.getItem("settings_notification") == "0") {
			settingsDiv +='<option value="0" selected="selected">Off</option>';
			settingsDiv +='<option value="1">On</option>';
		}
		else {
			settingsDiv +='<option value="0">Off</option>';
			settingsDiv +='<option value="1" selected="selected">On</option>';
		}
		settingsDiv +='</select>';
		settingsDiv +='</form>';
		settingsDiv +='</div>';
		settingsDiv +='</div>';
		settingsDiv +='<div class="row_2">Never complete a course late again! Receive course notifications directly from your device.</div>';
		settingsDiv +='</div>';
		settingsDiv +=' <div class="MSC_option">';
		settingsDiv +='<div class="row_1">';
		settingsDiv +='<div class="left">Sync Frequency</div>';
		settingsDiv +=' <div class="right">';
		settingsDiv +=' <div data-role="fieldcontain" id="syncFreqDiv">';
		settingsDiv +=' <select name="syncFreqM" id="syncFreqM" data-mini="true" data-inline="true" data-corners="false" data-native-menu="true">';

		switch(localStorage.getItem("settings_syncFrequency")){
		case "1":
			settingsDiv +='<option value="1" selected="selected">Every 1 Hour</option>';
			settingsDiv +=' <option value="2">Every 2 Hours</option>';
			settingsDiv +=' <option value="4">Every 4 Hours</option>';
			settingsDiv +=' <option value="6">Every 6 Hours</option>';
			settingsDiv +=' <option value="8">Every 8 Hours</option>';
			settingsDiv +=' <option value="12">Every 12 Hours</option>';
			break;

		case "2":
			settingsDiv +='<option value="1">Every 1 Hour</option>';
			settingsDiv +=' <option value="2" selected="selected">Every 2 Hours</option>';
			settingsDiv +=' <option value="4">Every 4 Hours</option>';
			settingsDiv +=' <option value="6">Every 6 Hours</option>';
			settingsDiv +=' <option value="8">Every 8 Hours</option>';
			settingsDiv +=' <option value="12">Every 12 Hours</option>';
			break;
		case "4":
			settingsDiv +='<option value="1">Every 1 Hour</option>';
			settingsDiv +=' <option value="2">Every 2 Hours</option>';
			settingsDiv +=' <option value="4" selected="selected">Every 4 Hours</option>';
			settingsDiv +=' <option value="6">Every 6 Hours</option>';
			settingsDiv +=' <option value="8">Every 8 Hours</option>';
			settingsDiv +=' <option value="12">Every 12 Hours</option>';
			break;
		case "6":
			settingsDiv +='<option value="1">Every 1 Hour</option>';
			settingsDiv +=' <option value="2">Every 2 Hours</option>';
			settingsDiv +=' <option value="4">Every 4 Hours</option>';
			settingsDiv +=' <option value="6" selected="selected">Every 6 Hours</option>';
			settingsDiv +=' <option value="8">Every 8 Hours</option>';
			settingsDiv +=' <option value="12">Every 12 Hours</option>';
			break;
		case "8":
			settingsDiv +='<option value="1">Every 1 Hour</option>';
			settingsDiv +=' <option value="2">Every 2 Hours</option>';
			settingsDiv +=' <option value="4">Every 4 Hours</option>';
			settingsDiv +=' <option value="6">Every 6 Hours</option>';
			settingsDiv +=' <option value="8" selected="selected">Every 8 Hours</option>';
			settingsDiv +=' <option value="12">Every 12 Hours</option>';
			break;

		case "12":
			settingsDiv +='<option value="1">Every 1 Hour</option>';
			settingsDiv +=' <option value="2">Every 2 Hours</option>';
			settingsDiv +=' <option value="4">Every 4 Hours</option>';
			settingsDiv +=' <option value="6">Every 6 Hours</option>';
			settingsDiv +=' <option value="8">Every 8 Hours</option>';
			settingsDiv +=' <option value="12" selected="selected">Every 12 Hours</option>';
			break;

		default:
			settingsDiv +='<option value="1">Every 1 Hour</option>';
		settingsDiv +=' <option value="2">Every 2 Hours</option>';
		settingsDiv +=' <option value="4">Every 4 Hours</option>';
		settingsDiv +=' <option value="6" selected="selected">Every 6 Hours</option>';
		settingsDiv +=' <option value="8">Every 8 Hours</option>';
		settingsDiv +=' <option value="12">Every 12 Hours</option>';
		break;


		}
		settingsDiv +='</select>';
		settingsDiv +='</div>';
		settingsDiv +=' </div>';
		settingsDiv +='</div>';
		settingsDiv +='<div class="row_2" >Set how often completion information is sent back to the server.</div>';
		settingsDiv +='<div id="parentLastSync" style="float:left;margin: 20px 0px 10px 0px;">';
		settingsDiv +='<label class="row_2" id="lastSyncLabel" >Last Synced:';
		settingsDiv +='<div class="row_2" id="lastMobileSync" ></label> </div>';
		settingsDiv +='</div>';
		settingsDiv +='</div>';
		settingsDiv +='</div>';
		settingsDiv +='</div>';
		settingsDiv +='</div>';
		settingsDiv += '</div></div>';

		$('<div>').simpledialog2({
			mode: 'blank',
			blankContent : settingsDiv,
		});

		moreOptScroller = new iScroll('moreWrapper',{bounce:false});           

		setTimeout(function() {
			if (typeof moreOptScroller != 'undefined')
				moreOptScroller.refresh();
		}, 250);
	});

	function buildSettingsPopOver() {
		$('#myDiv').show();
		setTimeout(function() {
			if (typeof moreOptScroller != 'undefined')
				moreOptScroller.refresh();
		}, 250);
	}

	$(document).click(function(e) {
		if(e.delegateTarget.activeElement.id != 'settings')
			closeSettingsContainer();
	});
	$("#settingsSection").click(function(e) {
		if(e.toElement.id == 'SC_btn_Cancel' || e.toElement.id == 'SC_btn_Save')
			return true;
		else {
			e.stopPropagation(); 
			return false;
		}
	});

	$(".settings").on('tap', function(e) {
		retrieveLastSync();
		$("#autoDownload").val(localStorage.getItem("settings_autoDownload")).slider('refresh');
		$("#autoDelete").val(localStorage.getItem("settings_autoDelete")).slider('refresh');
		$("#wifiDownload").val(localStorage.getItem("settings_wifi")).slider('refresh');
		$("#moduleNotification").val(localStorage.getItem("settings_notification")).slider('refresh');

		previousSyncFreqTime = localStorage.getItem("settings_syncFrequency");
		printLog($.mobile.activePage.attr('id'));

		if (eval($("#settings").data('isclicked')) == false) {
			if($.mobile.activePage.attr('id') == 'landingpage') {
				$("#modules .ui-icon").css('background-image', 'url(images/app/courses.png)');
			}else if($.mobile.activePage.attr('id') == 'downloadsPage') {
				$("#downloads .ui-icon").css('background-image', 'url(images/app/download.png)');
			}else if($.mobile.activePage.attr('id') == 'historyPage') {
				$("#history .ui-icon").css('background-image', 'url(images/app/history.png)');
			}else if($.mobile.activePage.attr('id') == 'howItWorks') {
				$("#how-it-works .ui-icon").css('background-image', 'url(images/app/info.png)');
			}     

			$("#settings .ui-icon").css('background-image', 'url(images/app/options_b.png)');
			$(this).removeClass('background-Changer');
			$("#settings").data({
				'isclicked': true
			});
			$(".settingsContainer").css({
				"margin-right": "0px"
			});
			SetSettingContainerHeight();
			setTimeout(function() {
				if (typeof settingsScroller != 'undefined')
					settingsScroller.refresh();
			}, 250);
		} else {
			closeSettingsContainer();
		}
		return false;
	});

	$(document).delegate('#SC_btn_Cancel','tap', function(e) {
		if ($.mobile.activePage.attr('id') == 'moreopPage')
			closeSimpleDialog();
		else
			closeSettingsContainer();
		$('#syncFreq').blur();
		$('.settings').removeClass('ui-btn-active');
		return false;
	});
	$(document).delegate("#SC_btn_Save",'tap', function(e) {

		localStorage.setItem("settings_autoDownload", getValue('autoDownload'));
		localStorage.setItem("settings_autoDelete", getValue('autoDelete'));
		localStorage.setItem("settings_wifi", getValue('wifiDownload'));
		localStorage.setItem("settings_notification", getValue('moduleNotification'));
		localStorage.setItem("settings_syncFrequency", getValue('syncFreq'));

		if ($.mobile.activePage.attr('id') == 'moreopPage')
			closeSimpleDialog();
		else
			closeSettingsContainer();

		if(localStorage.getItem("settings_autoDownload") == "1") {
			if(localStorage.getItem("settings_wifi") == "0") {
				$("#autoDwnldConfirm").simpledialog2();
				return;
			}
			else
				enableAutoDownload = true;
		}
		else
			enableAutoDownload = false;

		if(localStorage.getItem("settings_autoDelete") == "1") {
			$("#autoDeleteConfirm").simpledialog2();
			return;
		}
		else
			enableAutoDelete = false;

		if(previousSyncFreqTime !== localStorage.getItem("settings_syncFrequency")) {
			clearInterval(syncAuto);
			var syncScheduleTime = Number(localStorage.getItem("settings_syncFrequency"));
			var syncScheduleTimeInMS = syncScheduleTime*60*60*1000;
			setTimeout(function() {
				syncAutomatically(syncScheduleTimeInMS);
			}, syncScheduleTimeInMS);
		}		
		return false;
	});

	$(document).delegate("#autoDwnldConfirmNo",'tap', function(e) {
		localStorage.setItem("settings_autoDownload", "0");
		enableAutoDownload = false;
		if($.mobile.activePage.attr('id') == 'moreopPage')
			$("#autoDownloadM").val(localStorage.getItem("settings_autoDownload")).slider('refresh');
		else
			$("#autoDownload").val(localStorage.getItem("settings_autoDownload")).slider('refresh');
	});

	$(document).delegate("#autoDwnldConfirmYes",'tap', function(e) {
		$('#autoDwnldConfirm').simpledialog2('close');
		if($.mobile.activePage.attr('id') == 'moreopPage')
			closeSimpleDialog();
		enableAutoDownload = true;
	});

	$(document).delegate("#autoDeleteConfirmNo",'tap', function(e) {
		localStorage.setItem("settings_autoDelete", "0");
		enableAutoDelete = false;
		if($.mobile.activePage.attr('id') == 'moreopPage')
			$("#autoDeleteM").val(localStorage.getItem("settings_autoDelete")).slider('refresh');
		else
			$("#autoDelete").val(localStorage.getItem("settings_autoDelete")).slider('refresh');
	});

	$(document).delegate("#autoDeleteConfirmYes",'tap', function(e) {
		$('#autoDeleteConfirm').simpledialog2('close');
		if($.mobile.activePage.attr('id') == 'moreopPage')
			closeSimpleDialog();
		enableAutoDelete = true;
	});  

	$(document).delegate('#SC_Mbtn_Cancel','tap', function(e) {
		closeSimpleDialog();
		$('#syncFreq').blur();
		$('.settings').removeClass('ui-btn-active');
		return false;
	});
	$(document).delegate("#SC_Mbtn_Save",'tap', function(e) {

		localStorage.setItem("settings_autoDownload", getValue('autoDownloadM'));
		localStorage.setItem("settings_autoDelete", getValue('autoDeleteM'));
		localStorage.setItem("settings_wifi", getValue('wifiDownloadM'));
		localStorage.setItem("settings_notification", getValue('moduleNotificationM'));
		localStorage.setItem("settings_syncFrequency", getValue('syncFreqM'));

		closeSimpleDialog();

		if(localStorage.getItem("settings_autoDownload") == "1") {
			if(localStorage.getItem("settings_wifi") == "0") {
				$("#autoDwnldConfirm").simpledialog2();
				return;
			}
			else 
				enableAutoDownload = true;
		}
		else 
			enableAutoDownload = false;
		if(localStorage.getItem("settings_autoDelete") == "1") {
			$("#autoDeleteConfirm").simpledialog2();
			return;
		}
		else
			enableAutoDelete = false;

		if(previousSyncFreqTime !== localStorage.getItem("settings_syncFrequency")) {
			clearInterval(syncAuto);
			var syncScheduleTime = Number(localStorage.getItem("settings_syncFrequency"));
			var syncScheduleTimeInMS = syncScheduleTime*60*60*1000;
			setTimeout(function() {
				syncAutomatically(syncScheduleTimeInMS);
			}, syncScheduleTimeInMS);
		}
		return false;
	});

	$(document).delegate(".refreshPage",'tap', function(e) {
		e.preventDefault();
		ShowDefaultLoadingImage("Syncing in Progress");

		if ($(this).hasClass('ui-btn-active'))
			$(this).removeClass('ui-btn-active');
		$(".settingsContainer").css({
			"margin-right": "-420px"
		});

		clearInterval(syncAuto);
		var syncScheduleTime = Number(localStorage.getItem("settings_syncFrequency"));
		var syncScheduleTimeInMS = syncScheduleTime*60*60*1000;
		syncAutomatically(syncScheduleTimeInMS);
		syncData();
		return false;
	});

	$(".signBtn-icon").on('tap', function(e) {
		e.preventDefault();
		closeSimpleDialog();
		moduleDownloadInProgress = true;
		$("#signOutConfirm").simpledialog2();
		return false;
	});

	$("#signOutConfirmNo").on('tap', function() {
		moduleDownloadInProgress = false;
	});
	$(document).delegate('#signOutConfirmYes','tap', function() {
		$('#signOutConfirm').simpledialog2('close');
		$("#settings").data({
			'isclicked': false
		});
		$(".settingsContainer").css({
			"margin-right": "-420px"
		});
		$(this).removeClass('ui-btn-active');
		if (multipleDownloadArray.length != 0) {
			$.each(multipleDownloadArray, function(key, value) {
				var index = getIndexFromURL(value);
				cancelDownload(value, index);
				return false;
			});
		}
		closeSimpleDialog();
		$("#txt_userName").val("");
		$("#txt_password").val("");
		$.mobile.changePage("#login");

	});

	$(document).delegate('.collapsibleHistory','tap',function(e) {
		if($(this).find("a")[1].text === "Not Available") {
			e.preventDefault();
		}
	});

	$('#dvcollapsibleHistory').on('expand', function() {
		setTimeout(function() {
			if (typeof historyScroller != 'undefined')
				historyScroller.refresh();
		}, 200);
	}).on('collapse', function() {
		setTimeout(function() {
			if (typeof historyScroller != 'undefined')
				historyScroller.refresh();
		}, 200);
	});

	$(document).delegate('.downloadCatalystItem','tap',function(e){
		e.preventDefault();

		var index = $(this).data('index');
		var moduleId = $(this).data('moduleid');
		var systemID = $(this).data('systemid');
		localStorage.setItem('currentIndex',index);
		var source = getSourceFromIndex(index);
		networkCheckBeforeStart(index,source, moduleId, systemID, true);
		return false;
	});

	$(document).delegate('.btn-download-cancel','tap',function(e){
		e.preventDefault();
		var index = $(this).data('index');
		var sourse = getSourceFromIndex(index);
		cancelDownload(sourse,index);
		return false;
	});

	$(document).delegate('.btn-download-pause','tap',function(e){
		e.preventDefault();
		var index = $(this).data('index');
		var sourse = getSourceFromIndex(index);
		pauseDownload(sourse,index);
		return false;
	});

	$(document).delegate('.btn-download-resume','tap',function(e){
		e.preventDefault();
		var index = $(this).data('index');
		var sourse = getSourceFromIndex(index);
		resumeDownload(sourse,index);
		return false;
	});

	$(document).delegate('.btn-downloadModulePreview', 'tap', function(e) {
		ShowDefaultLoadingImage("Please wait...");
		e.preventDefault();
		var index = $(this).data('index');
		localStorage.setItem('currentIndex', index);
		var moduleId = $(this).data('moduleid');
		var systemID = $(this).data('systemid');
		var source = getSourceFromIndex(index);
		networkCheckBeforeStart(index,source, moduleId, systemID, true);
		return false;
	});

	$(document).delegate('#btn_forgot', 'tap', function(e) {
		e.preventDefault();
		var emailAddress = $(".forgotusername").val();
		if (emailAddress == '') {
			$("#forgotPwFailurePop").simpledialog2();
			$(".forgotusername").val('');
		} else {
			var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			if (regex.test(emailAddress)) {
				ShowDefaultLoadingImage("Please wait...");
				forgotPassword(emailAddress);
			} else {
				$("#forgotPwFailurePop").simpledialog2();
				$(".forgotusername").val('');
			}
		}
		return false;
	});
	$(document).delegate("#moduleList",'swiperight',function(e){
		e.preventDefault();
		var moduleid = $(this).attr('data-moduleid'),
		curriculumId = $(this).attr('data-curriculumid'),
		srcCertReqId = $(this).attr('data-srccertreqid');
		printLog("moduleid : "+moduleid+" curriculumId "+curriculumId+" srcCertReqId "+srcCertReqId);
		var jsonAssignedModules = JSON.parse(localStorage.getItem("jsonUserAssignedModules"));
		var reqidModules = $.grep(jsonAssignedModules, function(v) {
			return v.srcCertReqId === srcCertReqId;
		});
		var swipeCurrentIndex = "";
		$.each(reqidModules,function(index,value){
			if(value.moduleId===moduleid){
				swipeCurrentIndex = index;
			}
		});
		if(swipeCurrentIndex==0){
			swipeCurrentIndex = reqidModules.length-1;
		}else{
			swipeCurrentIndex = swipeCurrentIndex-1;
		}
		var previousValue = reqidModules[swipeCurrentIndex];
		generateCoursePreview(previousValue.curriculumId,previousValue.moduleId);
		return false;
	});
	$(document).delegate("#moduleList",'swipeleft',function(e){
		e.preventDefault();
		var moduleid = $(this).attr('data-moduleid'),
		curriculumId = $(this).attr('data-curriculumid'),
		srcCertReqId = $(this).attr('data-srccertreqid');
		printLog("moduleid : "+moduleid+" curriculumId "+curriculumId+" srcCertReqId "+srcCertReqId);
		var jsonAssignedModules = JSON.parse(localStorage.getItem("jsonUserAssignedModules"));
		var reqidModules = $.grep(jsonAssignedModules, function(v) {
			return v.srcCertReqId === srcCertReqId;
		});
		var swipeCurrentIndex = "";
		$.each(reqidModules,function(index,value){
			if(value.moduleId===moduleid){
				swipeCurrentIndex = index;
			}
		});
		if(swipeCurrentIndex==reqidModules.length-1){
			swipeCurrentIndex = 0;
		}else{
			swipeCurrentIndex = swipeCurrentIndex+1;
		}
		var previousValue = reqidModules[swipeCurrentIndex];
		generateCoursePreview(previousValue.curriculumId,previousValue.moduleId);
		return false;
	});

	$(document).delegate('.deleteModuleBtn','tap', function(e) {
		e.stopPropagation();
		e.preventDefault();
		var confirmIndex = $(this).data('index');
		var confirmSource = $(this).data('source');
		if($(window).width() >= 600 || $(window).height() >= 600) {
			if($(window).width() >= 800 || $(window).height() >= 800) {
				$(".confirmDelete").hide();
				$(".deleteModuleBtn").css('background', '#0078AE');
				$(".confirmDeleteDropdown" + confirmIndex).show();
				$("#deleteConfirm" + confirmIndex).simpledialog2();
				$("#delete" + confirmIndex).css('background', '#9AC6DA');
			}
			else {
				$('<div id="deleteDialog"><div >').simpledialog2({
					mode: 'blank',
					headerClose: false,
					blankContent: "<a data-role='button' onclick='deleteDownload(&#39;" + confirmSource + "&#39;,&#39;" + confirmIndex + "&#39;)'  data-inline='true' data-mini='true' data-theme='c'data-corners='false' href='#' class='popupActiveButton deleteBtn'>Delete</a><br/>" + 
					"<a rel='close' data-role='button' href='#' onclick='closeDialog();'  data-inline='true' data-mini='true' data-theme='c'data-corners='false' href='#' class='popupActiveButton cancleBtn'>Cancel</a>"
				});
				$('.ui-simpledialog-container').wrap('<div id="downloadDelete"></div>');
			}
		}
		else {
			$('<div id="deleteDialog"><div >').simpledialog2({
				mode: 'blank',
				headerClose: false,
				blankContent: "<a data-role='button' onclick='deleteDownload(&#39;" + confirmSource + "&#39;,&#39;" + confirmIndex + "&#39;)'  data-inline='true' data-mini='true' data-theme='c'data-corners='false' href='#' class='popupActiveButton deleteBtn'>Delete</a><br/>" + 
				"<a rel='close' data-role='button' href='#' onclick='closeDialog();'  data-inline='true' data-mini='true' data-theme='c'data-corners='false' href='#' class='popupActiveButton cancleBtn'>Cancel</a>"
			});
			$('.ui-simpledialog-container').wrap('<div id="downloadDelete"></div>');
		}
		return false;
	});
});

//Application pageshow events
$("#login").on("pagebeforeshow", function() {
	if (localStorage.getItem("smallLogo") != null || localStorage.getItem("smallLogo") != "") {
		$(".imgPartnerLogo").attr("src", (localStorage.getItem("smallLogo"))).load(function(){
			this.width;
		});
	}
});

$(document).delegate('#landingpage', 'pageinit', function() {
	printLog("pageinit");
	document.addEventListener("pause", onPause, false);
	document.addEventListener("resume", onResume, false);
	var done = buildSettingsDiv();
	if (done) {
		if (!retrievedLastsync)
			retrieveLastSync();
	}
	$("#optional_catalysts").hide();
});

$(document).delegate('#landingpage', 'pageshow', function() {
	if (localStorage.getItem("smallLogo") != null || localStorage.getItem("smallLogo") != "") {
		$(".imgPartnerLogo").attr("src", (localStorage.getItem("smallLogo"))).load(function(){
			this.width;
		});
	}
	setUsername();
	updateCoursesOnSync = false;
	ProcessUserAssignedModulesResponse();
	try {
		setTimeout(function() {
			if (typeof mandatoryScroller != 'undefined')
				mandatoryScroller.refresh();
		}, 200);
		setTimeout(function() {
			if (typeof optionalScroller != 'undefined')
				optionalScroller.refresh();
		}, 200);
	} catch(e) {}
	if (playerPage) {
		playerPage = false;
		exitCoursePlayer();
	}
	$("#modules .ui-icon").css('background-image', 'url(images/app/courses_b.png)');
	$("#downloads .ui-icon").css('background-image', 'url(images/app/download.png)');
	$("#history .ui-icon").css('background-image', 'url(images/app/history.png)');
	$("#how-it-works .ui-icon").css('background-image', 'url(images/app/info.png)');
});

$(document).delegate('#downloadsPage','pageshow', function(event) {
	ShowDefaultLoadingImage("Loading...");
	setUsername();
	printLog("local Storage download array: "+ getLocalDownloadArray());
	loadDownloadedModules();

	setTimeout(function() {
		if (typeof downloadScroller != 'undefined')
			downloadScroller.refresh();
	}, 200);
	if(playerPage) {
		playerPage = false;
		exitCoursePlayer();
	}
	$("#modules .ui-icon").css('background-image', 'url(images/app/courses.png)');
	$("#downloads .ui-icon").css('background-image', 'url(images/app/download_b.png)');
	$("#history .ui-icon").css('background-image', 'url(images/app/history.png)');
	$("#how-it-works .ui-icon").css('background-image', 'url(images/app/info.png)');
});

$("#historyPage").on("pagebeforeshow", function() {
	setTimeout(function(){
		ShowDefaultLoadingImage("Loading History...");
	},100);
});

$(document).delegate('#historyPage', 'pageshow', function() {

	ShowDefaultLoadingImage("Loading History...");
	$(".noModule").hide();
	getHistoryStatus();
	setTimeout(function() {
		if (typeof historyScroller != 'undefined')
			historyScroller.refresh();
	}, 200);
	$(".collapsibleHistory").addClass("ui-collapsible-collapsed");
	$(".collapsibleHistory").trigger('collapse');
	if (playerPage) {
		playerPage = false;
		exitCoursePlayer();
	}
	$("#modules .ui-icon").css('background-image', 'url(images/app/courses.png)');
	$("#downloads .ui-icon").css('background-image', 'url(images/app/download.png)');
	$("#history .ui-icon").css('background-image', 'url(images/app/history_b.png)');
	$("#how-it-works .ui-icon").css('background-image', 'url(images/app/info.png)');
});

$(document).delegate('#howItWorks', 'pageshow', function() {
	if (playerPage) {
		playerPage = false;
		exitCoursePlayer();
	}
	$("#modules .ui-icon").css('background-image', 'url(images/app/courses.png)');
	$("#downloads .ui-icon").css('background-image', 'url(images/app/download.png)');
	$("#history .ui-icon").css('background-image', 'url(images/app/history.png)');
	$("#how-it-works .ui-icon").css('background-image', 'url(images/app/info_b.png)');
});

$(document).delegate('#moreopSettingsPage', 'pageshow', function() {
	if (typeof moreOptScroller != 'undefined')
		moreOptScroller.refresh();

	if(localStorage.getItem("settings_lastSynced") != "") {
		lastSync = localStorage.getItem("settings_lastSynced");
		rowLastSync = localStorage.getItem("settings_rowLastSynced");
	} else {
		lastSync = "Not Synced";
		rowLastSync = "Not Synced";
	}
	$("#lastMobileSync").append(lastSync);
	$("#rowLastSyncTime").append("Last Sync: " + rowLastSync);
});

$(document).delegate('#forgot','pageshow',function(e){
	$('.thanks_container').hide();
	$('.reset_pwd').show();
	$(".forgotusername").val("");
});

$("#coursePlayer").on("pageinit", function() {
	printLog("Initializing scorm lib for course player---");
	$('head').append('\x3Cscript type="text/javascript" src="js/scormLib/sscompat.js">\x3C/script>');
	$('head').append('\x3Cscript type="text/javascript" src="js/scormLib/sscorlib.js">\x3C/script>');
	$('head').append('\x3Cscript type="text/javascript" src="js/scormLib/ssfx.Core.js">\x3C/script>');
	$('head').append('\x3Cscript type="text/javascript" src="js/scormLib/API_BASE.js">\x3C/script>');
	$('head').append('\x3Cscript type="text/javascript" src="js/scormLib/API_LOG.js">\x3C/script>');
	$('head').append('\x3Cscript type="text/javascript" src="js/scormLib/Controls.js">\x3C/script>');
	$('head').append('\x3Cscript type="text/javascript" src="js/scormLib/LocalStorage.js">\x3C/script>');
	$('head').append('\x3Cscript type="text/javascript" src="js/scormLib/Player.js">\x3C/script>');

});

$(document).delegate('.SelectLanguageGetStarted','change', function(e) {
	$.each(moduleParameters[moduleIdSaved],function(i,v){		
		if(v.language === e.currentTarget.value) {
			$(".mpDescription p").html(v.description);
			indexValue = v.moduleId + v.language, coursePath = v.coursePath, course = v.course;
			$(".modulesGetStarted").attr("onclick", "playCatalyst(coursePath, indexValue, course)");
			$("#description .moduleTitle_bottom").html(v.title);
			$("#description .moduleDueDate").html("Due " + newdueDate + "&nbsp;&nbsp; | &nbsp;&nbsp;"+ v.catalogId);
			$(".moduleTitle_top").html(v.title);
			$(".moduleDueDate_top").html("Due " + newdueDate + "&nbsp;&nbsp; | &nbsp;&nbsp;"+ v.catalogId);
		}
	});  
});

function syncAutomatically(i) {
	syncAuto = setInterval(function(){syncData()},i);
}

function onOffline() {
	isNetworkAvailable = false;
	if (multipleDownloadArray.length != 0) {
		$.each(multipleDownloadArray, function(key, value) {
			var index = getIndexFromURL(value);
			cancelDownload(value, index);
			return false;
		});
	}
}
function onOnline() {
	isNetworkAvailable = true;
	closeSimpleDialog();
}

function checklocalStorage(currentUser){
	var previousUser = localStorage.getItem('uName');
	var previousSiteID = localStorage.getItem('siteID');
	var largeLogo =	localStorage.getItem('largeLogo');
	var smallLogo =	localStorage.getItem('smallLogo');
	var siteCompanyName = localStorage.getItem('siteCompanyName');
	var userId = localStorage.getItem('userId');

	printLog("local Values check: " + currentUser + " : " + previousUser);
	if($.mobile.activePage.attr('id') == "login") {
		if(currentUser.toLowerCase() == previousUser.toLowerCase() && userId != null) {
			sameUser = true;
		}
		else {
			localStorage.clear();
			localStorage.setItem('siteID',previousSiteID);
			localStorage.setItem('largeLogo', largeLogo);
			localStorage.setItem('smallLogo', smallLogo);
			localStorage.setItem('siteCompanyName', siteCompanyName);
			sameUser = false;
		}
	}

	if($.mobile.activePage.attr('id') == "siteconfig") {
		if(currentUser != previousSiteID) {
			localStorage.clear();
			sameUser = false;
		}
		else {
			sameUser = true;
		}
	}
}
function SetSiteConfiguration(siteID) {
	ShowDefaultLoadingImage("Configuring Application");
	getSiteInfo(siteID);
}

function onPause() {
	if ($.mobile.activePage.attr('id') == 'coursePlayer') {
		API.LMSCommit();
	}
	printLog("Application is paused");
	if(enableAutoDownload) {
		setTimeout(function() {
			startAutoDownload();
		}, 1000);
	}
}

function onResume() {
	printLog('Application is resumed----');
}

function onBackKeyDown() {
	printLog("back key handler-------");
	if ($.mobile.activePage.attr('id') == 'coursePlayer') {
		exitCoursePlayer();
	}
	var returnValue = $.grep(backEnabledPageArr, function(pages) {
		return pages == $.mobile.activePage.attr('id');
	});

	if (returnValue.length != 0) {
		if (!moduleDownloadInProgress) {
			$.mobile.changePage(($.mobile.urlHistory.getPrev().url));
			$(".settingsContainer").css({
				"margin-right": "-420px"
			});
		}
	} else
		return false;
}

function exitCoursePlayer()
{
	API.LMSCommit();
	if (DevicePlatform == "Android") 
		window.plugins.OrientationLock.unlock(function() {}, function() {});
	else if (DevicePlatform == "iOS"){
		window.plugins.screenOrientation.set("auto");
	}
	var isAdded = addCurrentCourseScromToLocalStorage();
}

function addCurrentCourseScromToLocalStorage() {
	var isAdded = false;
	var currentCourse = localStorage.getItem("currentCourse");
	printLog("SCORM OBJECT : "+ JSON.stringify(localStorage.getItem('symphonyscorm')));
	if(currentCourse != null) {
		printLog("Before SCORM OBJECT FOR CURRENT OBJECT: " + localStorage.getItem("SCROM-" + currentCourse));
		localStorage.setItem("SCROM-" + currentCourse, localStorage.getItem('symphonyscorm'));	
		printLog("After SCORM OBJECT FOR CURRENT OBJECT: " + localStorage.getItem("SCROM-" + currentCourse));
		var jSONobject = JSON.parse(localStorage.getItem("SCROM-" + currentCourse));		
		var key ="cmi.core.lesson_status";		
		var courseStatus = jSONobject.organizations.LRN.cmi.TEST[key].value;
		printLog("Course Status >>>>>>>>>"+courseStatus);

		var storedCourseStatus = JSON.parse(localStorage.getItem("courseStatuses"));
		var tempStoringArray = storedCourseStatus;

		$.each(storedCourseStatus, function(i,v) {
			if(v.course == currentCourse) {
				tempStoringArray[i].status = courseStatus;
				return;
			}
		});
		printLog(":::::"+tempStoringArray);
		localStorage.setItem("courseStatuses", JSON.stringify(tempStoringArray));
		printLog(":::::"+JSON.parse(localStorage.getItem("courseStatuses")));

		isAdded = true;
	}
	return isAdded;
}

function buildSettingsDiv() {
	var done = false;
	if ($.mobile.activePage.attr('id') != 'moreopPage') {
		var settingsDiv = '<div id="settingsWrapper1"><div id="settingsScroller1">';
		settingsDiv += '<div class="SC_row_1">';
		settingsDiv += '<div class="left"><input name="" type="button" value="Cancel" class="SC_btn" id="SC_btn_Cancel" data-corners="false"></div>';
		settingsDiv += '<div class="right"><input name="" id="SC_btn_Save" data-corners="false" type="button" value="Save" class="SC_btn"></div>';
		settingsDiv += ' </div>';
		settingsDiv += '<div class="SC_row_2">';
		settingsDiv +='<div class="SC_option">';
		settingsDiv +='<div class="row_1">';
		settingsDiv +='<div class="left">Automatic Downloads </div>';
		settingsDiv +=' <div class="right">';
		settingsDiv +=' <form class="slider_option">';
		settingsDiv +='<select name="autoDownload" class="autoDownload" id="autoDownload" data-role="slider" data-mini="true" data-track-theme="a" data-theme="a">';
		settingsDiv +='<option value="0">Off</option>';
		settingsDiv +='<option value="1">On</option>';
		settingsDiv +='</select>';
		settingsDiv +='</form>';
		settingsDiv +=' </div>';
		settingsDiv +='</div>';
		settingsDiv +='<div class="row_2_1">Allows all assigned courses to be downloaded automatically when you log in.</div>';
		settingsDiv +='</div>';
		settingsDiv +=' <div class="SC_option">';
		settingsDiv +='<div class="row_1">';
		settingsDiv +='<div class="left">Automatic Deleting</div>';
		settingsDiv +=' <div class="right">';
		settingsDiv +='<form class="slider_option">';
		settingsDiv +='<select name="autoDelete" class="autoDelete" id="autoDelete" data-role="slider" data-mini="true" data-track-theme="a" data-theme="a">';
		settingsDiv +='<option value="0">Off</option>';
		settingsDiv +='<option value="1">On</option>';
		settingsDiv +='</select>';
		settingsDiv +='</form>';
		settingsDiv +=' </div>';
		settingsDiv +=' </div>';
		settingsDiv +='<div class="row_2">Automatically deletes completed courses from your device once they have successfully synced.</div>';
		settingsDiv +='</div>';
		settingsDiv +=' <div class="SC_option">';
		settingsDiv +='<div class="row_1">';
		settingsDiv +='<div class="left">Wi-Fi Downloads Only</div>';
		settingsDiv +='<div class="right">';
		settingsDiv +='<form class="slider_option">';
		settingsDiv +='<select name="wifiDownload" class="wifiDownload" id="wifiDownload" data-role="slider" data-mini="true" data-track-theme="a" data-theme="a">';
		settingsDiv +='<option value="0">Off</option>';
		settingsDiv +='<option value="1" selected>On</option>';
		settingsDiv +='</select>';
		settingsDiv +='</form>';
		settingsDiv +='  </div>';
		settingsDiv +='</div>';
		settingsDiv +='<div class="row_2">Turning this off allows courses to be downloaded on your carrier network, which may result in data charges.</div>';
		settingsDiv +=' </div>';
		settingsDiv +='<div class="SC_option">';
		settingsDiv +='<div class="row_1">';
		settingsDiv +='<div class="left">Module Notifications</div>';
		settingsDiv +='<div class="right">';
		settingsDiv +='<form class="slider_option">';
		settingsDiv +='<select name="moduleNotification" class="moduleNotification" id="moduleNotification" data-role="slider" data-mini="true" data-track-theme="a" data-theme="a">';
		settingsDiv +='<option value="0">Off</option>';
		settingsDiv +='<option value="1" selected>On</option>';
		settingsDiv +='</select>';
		settingsDiv +='</form>';
		settingsDiv +='</div>';
		settingsDiv +='</div>';
		settingsDiv +='<div class="row_2">Never complete a course late again! Receive course notifications directly from your device.</div>';
		settingsDiv +='</div>';
		settingsDiv +=' <div class="SC_option">';
		settingsDiv +='<div class="row_1">';
		settingsDiv +='<div class="left">Sync Frequency</div>';
		settingsDiv +=' <div class="right">';
		settingsDiv +=' <div data-role="fieldcontain">';
		settingsDiv +=' <select name="syncFreq" id="syncFreq" data-mini="true" data-inline="true" data-corners="false" data-native-menu="true">';
		settingsDiv +='<option value="1">Every 1 Hour</option>';
		settingsDiv +=' <option value="2">Every 2 Hours</option>';
		settingsDiv +=' <option value="4">Every 4 Hours</option>';
		settingsDiv +=' <option value="6" selected="selected">Every 6 Hours</option>';
		settingsDiv +=' <option value="8">Every 8 Hours</option>';
		settingsDiv +=' <option value="12">Every 12 Hours</option>';
		settingsDiv +='</select>';
		settingsDiv +='</div>';
		settingsDiv +=' </div>';
		settingsDiv +='</div>';
		settingsDiv +='<div class="row_2" >Set how often completion information is sent back to the server.</div>';
		settingsDiv +='<div id="parentLastSync" style="float:left;margin: 20px 0px 10px 0px;">';
		settingsDiv +='<label class="row_2" id="lastSyncLabel" >Last Synced: ';
		settingsDiv +='<div class="row_2" id="lastSync" ></label> </div>';
		settingsDiv +='</div>';
		settingsDiv +='</div>';
		settingsDiv +='</div>';
		settingsDiv += '</div></div>';

		if (settingsDiv != '') {
			$("#settingsSection").html();
			$("#settingsSection").html(settingsDiv);
			$('.settingsContainer').trigger("create");
			var selectField = document.getElementById('syncFreq');
			selectField.addEventListener('tap'
					, function(e) {
						e.stopPropagation();
					}, false);
			done = true;
		}
	} else
		buildSettingsPopOver();
	return done;
}

function SetSettingContainerHeight() {
	if (window.innerHeight != null && window.innerHeight > 0) {
		var h = $(window).height() - 150;
		$("#settingsWrapper1").css({
			"height": h + 'px'
		});
	}
}

function closeSimpleDialog() {
	try {
		$(document).trigger('simpledialog', {
			'method': 'close'
		});
	} catch(e) {}
}

function getPreviewData(curriculumID, moduleID, systemId) {
	printLog("Active page---" + $.mobile.activePage.attr('id'));
	if($.mobile.activePage.attr('id') == 'moreopPage')
		return;
	if ($.mobile.activePage.attr('id') == 'historyPage')
		fromHistory = true;
	else if ($.mobile.activePage.attr('id') != 'modulesPreview')
		fromHistory = false;

	ShowDefaultLoadingImage("Loading Modules...");

	if (moduleID != undefined) {
		localStorage.setItem('curriculumID', curriculumID);
		localStorage.setItem('systemID', systemId);
		var options = {};
		generateCoursePreview(curriculumID, moduleID, systemId);
	} else {
		alert("No Module Preview Found");
	}
}

function generateCoursePreview(curriculumID,moduleID,systemId){
	moduleIdSaved = moduleID;
	var jsonAssignedModules = JSON.parse(localStorage.getItem("jsonUserAssignedModules"));
	var courseFound = true;
	if(curriculumID === "undefined")
	{
		$.each(jsonAssignedModules, function(index, moduleId){ 
			if(jsonAssignedModules[index].moduleId === moduleID){
				curriculumID = jsonAssignedModules[index].curriculumId;
				courseFound = true;
				return false;
			} else {
				courseFound = false;
			}
		});
	}

	if(!courseFound){
		HideDefaultLoadingImage();
		return;
	}
	var modulePreview = $.grep(jsonAssignedModules, function(v) {
		return v.curriculumId === curriculumID && v.moduleId === moduleID;
	});
	var thumbNail = "images/app/no-preview.jpg";
	var desc = "", language = "", langValue = "", systemID = "", course = "", title = "", dueDisplay = "", catalogId = "", mediaType = "", coursePath = "", source = "";
	var mediaFlag = false, media = "", isFluidX = false;
	if($.isArray(modulePreview[0].courseLookup)) {
		$.each(modulePreview[0].courseLookup,function(lookupindex,lookupvalue){		
			if(lookupindex === 0) {
				language = lookupvalue.srcLangDTO.enName;
				systemID = lookupvalue.systemId;
				course = lookupvalue.course;
				title = lookupvalue.title;
				catalogId = lookupvalue.catalogId;
				mediaType = lookupvalue.mediaType;
				coursePath = lookupvalue.coursePath;
				desc = lookupvalue.description;
				langValue = lookupvalue.language;
				isFluidX = lookupvalue.courseTypeDTO.isFluidX;
				if(lookupvalue.media != undefined){
					mediaFlag = true;
					media = lookupvalue.media;
				}
			}
		});
	} else {
		language = modulePreview[0].courseLookup.srcLangDTO.enName;
		systemID = modulePreview[0].courseLookup.systemId;
		course = modulePreview[0].courseLookup.course;
		title = modulePreview[0].courseLookup.title;
		catalogId = modulePreview[0].courseLookup.catalogId;
		mediaType = modulePreview[0].courseLookup.mediaType;
		coursePath = modulePreview[0].courseLookup.coursePath;
		desc = modulePreview[0].courseLookup.description;
		langValue = modulePreview[0].courseLookup.language;
		isFluidX = modulePreview[0].courseLookup.courseTypeDTO.isFluidX;
	}

	$.mobile.changePage("#modulesPreview");
	var mcourceIndex = moduleID+langValue;   
	var dueDate = modulePreview[0].dueDate;

	if(dueDate == undefined || dueDate == null || dueDate =='null' || dueDate =='undefined'){
		newdueDate = "Date Not Found";
		dueDisplay = "none";
	}else{
		newdueDate = formatDate(dueDate, "mmmm d, yyyy");
		dueDisplay = "inline";
	}

	downloadRunning = false,downloadPaused = false;
	$.each(multipleDownloadArray, function(i, value) {
		if (value.split("/")[value.split("/").length-1].split(".")[0] == catalogId) {
			downloadRunning = true;
			return;
		}
	});
	$.each(pauseArray, function(i, value) {
		if (value == mcourceIndex) {
			downloadPaused = true;
			return;
		}
	});

	var downloadArray = getLocalDownloadArray();

	var catalystInnerBody = '';
	catalystInnerBody = '<li class="cdalign">';
	catalystInnerBody += '<span class="moduleTitle_top">' + title + '</span><div><span class="moduleDueDate_top">Due ' + newdueDate + '&nbsp;&nbsp; | &nbsp;&nbsp;' + catalogId + '</span></div>';
	catalystInnerBody += '<div class="cat-box" data-cat-name="Catalyst1">';
	catalystInnerBody += '<p class="mpImageWidth"><img src="' + thumbNail + '"></p>';
	catalystInnerBody += '<div class="orange-band"> <div class="video-title"> <div style="display:none;"> ' + title + '</div>';
	if(modulePreview[0].srcCertReqId == '1') {
		catalystInnerBody += '<span style="display:none;"">Due ' + newdueDate + '</span> ';
	}
	catalystInnerBody += '</div><div class="download-btn">';
	catalystInnerBody += '<div  style="display:none;width:100%;height:10px;border-radius:10px;padding:0 !important" id="progressPreview' + mcourceIndex + '" class="progress-module-preview progressPreview' + mcourceIndex + '"></div> ';
	catalystInnerBody += '<div class="btns-container">';
	catalystInnerBody += '<div class="btns-left">';
	if($.inArray(mcourceIndex, downloadArray) > -1) {
		catalystInnerBody += '<div class="btn-download downloadedBtnLabel downloadedBtnLabelPreview" data-index="' + mcourceIndex + '" data-source="' + source + '"  id="downloadedLabel' + mcourceIndex + '" data-moduleId="' + moduleID + '" data-systemId="' + systemID + '" style="display:inline-block;">Downloaded</div>';
	} else {
		catalystInnerBody += '<div class="btn-download-offline downloadAvailablity downloadOfflineColor availableOfflineModulepreview"  id="offlineincat' + mcourceIndex + '"  style="display:none;"><span class="DownloadOfflineClose-btn"></span>Downloaded</div>';
		catalystInnerBody += '<div class="btn-download-offline downloadAvailablity downloadOnlineColor availableOnlineModulepreview" id="onlineincat' + mcourceIndex + '" ><span class="DownloadOfflineClose-btn"></span>Available Online</div>';
		if(isFluidX == "true")
			catalystInnerBody += '<div class="btn-download btn-downloadModulePreview download' + mcourceIndex + '" data-index="' + mcourceIndex + '" data-source="' + source + '"  id="downloadButtonsModulePreview' + mcourceIndex + '" data-moduleId="' + moduleID + '" data-systemId="' + systemId + '" style="display:inline-block;"><div class="downloadTxt">Download</div></div>';
	}
	catalystInnerBody += '<div class="btn-cancel-preview btn-download-cancel cancelPreview' + mcourceIndex + '" data-index="' + mcourceIndex + '" data-source="' + source + '"  id="cancelPreview' + mcourceIndex + '" style="display:none">Cancel</div>';
	catalystInnerBody += '<div class="btn-pause-preview btn-download-pause pausePreview' + mcourceIndex + '" data-index="' + mcourceIndex + '" data-source="' + source + '"  id="pausePreview' + mcourceIndex + '" style="display:none">Pause</div>';
	catalystInnerBody += '<div class="btn-resume-preview btn-download-resume resumePreview' + mcourceIndex + '" data-index="' + mcourceIndex + '" data-source="' + source + '"  id="resumePreview' + mcourceIndex + '" style="display:none">Resume</div>';
	catalystInnerBody += '</div>';
	catalystInnerBody += '<div class="status-right-preview">';
	catalystInnerBody += '<div style="display:inline-block;" id="statusPreview' + mcourceIndex + '" class="status-module-preview statusPreview' + mcourceIndex + '"></div>';
	catalystInnerBody += '</div>';
	catalystInnerBody += '</div>';
	catalystInnerBody += '</div></div>';
	catalystInnerBody += '</div>';
	catalystInnerBody += '</div>';
	catalystInnerBody += '<div class="status-icon"><img class="imgStatus" id="imgStatus-preview-' + mcourceIndex + '" src="images/app/new.png" /></div>';
	catalystInnerBody += '</div>';
	catalystInnerBody += '</li>';
	catalystInnerBody += '<li class="mpContentWidth"><div id="description">';
	catalystInnerBody += '<span class="moduleTitle_bottom">' + title + '</span><div>';
	catalystInnerBody += '<span class="moduleDueDate">Due ' + newdueDate + '&nbsp;&nbsp; | &nbsp;&nbsp;' + catalogId +'</span></div></br>';
	catalystInnerBody += '<div id="moduleDescWrapper1"><div id="modulesPreview-scroller"><div class="product-img mpDescription">' + desc + '</div></div></div></br></br>';

	if(mediaFlag) {
		catalystInnerBody += '<span class="videoAudio" id="videoAudioId">';
		if(media == "video")
			catalystInnerBody += '<label><input type="radio" name="media" value="video" checked>Video</label><label><input type="radio" name="media" value="audio">Audio</label></span></br>';
		else if(media == "audio")
			catalystInnerBody += '<label><input type="radio" name="media" value="video">Video</label><label><input type="radio" name="media" value="audio" checked>Audio</label></span></br>';
	} 
	catalystInnerBody += '<span  class="selLanGetStarted" style="display:block"><select class="SelectLanguageGetStarted" id="languageSelectId"><optgroup name="loc_selLanguage" label="Select Language">';

	if($.isArray(modulePreview[0].courseLookup)) {
		for(var i=0; i<moduleParameters[moduleID].length; i++)
		{
			if(i)
				catalystInnerBody += '<option data-moduleId='+ moduleID+' value="'+ moduleParameters[moduleID][i].language +'" name="loc_english">'+ moduleParameters[moduleID][i].srcLangDTO.enName +'</option>';
			else
				catalystInnerBody += '<option data-moduleId='+ moduleID+' value="'+ moduleParameters[moduleID][i].language +'" name="loc_english" selected="selected">'+ moduleParameters[moduleID][i].srcLangDTO.enName +'</option>';
		}
	} else {
		catalystInnerBody += '<option value="'+ langValue +'" name="loc_english" selected="selected">'+ language +'</option>';
	}

	catalystInnerBody += '</select><div class="modulesGetStarted" onclick="playCatalyst(&#39;' + coursePath + '&#39;,&#39;' + mcourceIndex + '&#39;,&#39;' + course + '&#39;)">Get Started</div></span>';
	catalystInnerBody += '</div></li>';
	$("#moduleList").attr('data-curriculumID',curriculumID);
	$("#moduleList").attr('data-moduleId',moduleID);
	$("#moduleList").attr('data-srcCertReqId',modulePreview[0].srcCertReqId);
	$("#moduleList").attr('data-systemID',systemID);
	$("#moduleList").attr('data-course',course);
	$("#moduleList").html(catalystInnerBody);
	if($(window).height() < 599 && DevicePlatform == "iOS")
		$(".modulePreviewheight").attr('data-position',"fixed");

	if(downloadRunning) {
		$("#downloadButtonsModulePreview" + mcourceIndex).css('display', 'none');
		$("#onlineincat" + mcourceIndex).css('display', 'none');
		$("#statusPreview" + mcourceIndex).css('display', 'inline-block');
		$("#progressPreview" + mcourceIndex).css('display', 'inline-block');
		$("#pausePreview" + mcourceIndex).css('display', 'inline-block');
		$("#cancelPreview" + mcourceIndex).css('display', 'inline-block');
		$("#resumePreview" + mcourceIndex).css('display', 'none');
		try {
			$("#progressPreview" + mcourceIndex).progressbar({
				value: parseInt(localStorage.getItem("'" + mcourceIndex + "'"))
			});
		} catch(e) {
			$("#progressPreview" + mcourceIndex).progressbar({
				value: 0
			});
		}
		if(downloadPaused) {
			$("#pausePreview" + mcourceIndex).css('display', 'none');
			$("#cancelPreview" + mcourceIndex).css('display', 'inline-block');
			$("#resumePreview" + mcourceIndex).css('display', 'inline-block');
			$("#statusPreview" + mcourceIndex).html(" Download Paused ");
		}
	}

	HideDefaultLoadingImage();
	moduleDescScroller1 = new iScroll('moduleDescWrapper1', {bounce: false});
}

function loadDownloadedModules() {
	$("#downloadsList").html("");
	var allModules = JSON.parse(localStorage.getItem("jsonUserAssignedModules"));
	var downloadArray = getLocalDownloadArray();

	if(downloadArray.length)
		$.each(downloadArray,function(i,v){
			var i2=parseInt(v,10).toString();
			printLog(v + " : " + i2);
			var moduleDownloaded = $.grep(allModules, function(v) {
				return v.moduleId === i2;
			});
			var moduleId = moduleDownloaded[0].moduleId;
			var curriculumId = moduleDownloaded[0].curriculumId;
			var language = "", langValue = "", systemID = "", course = "", title = "", dueDisplay = "", catalogId = "", mediaType = "", coursePath = "", source = "";

			if($.isArray(moduleDownloaded[0].courseLookup)) {
				$.each(moduleDownloaded[0].courseLookup,function(lookupindex,lookupvalue) {
					if(lookupindex === 0) {
						moduleParameters[lookupvalue.moduleId] = [];
						language = lookupvalue.srcLangDTO.enName;
						systemID = lookupvalue.systemId;
						course = lookupvalue.course;
						title = lookupvalue.title;
						catalogId = lookupvalue.catalogId;
						mediaType = lookupvalue.mediaType;
						coursePath = lookupvalue.coursePath;
						langValue = lookupvalue.language;
					}
					moduleParameters[lookupvalue.moduleId][lookupindex] = {};
					moduleParameters[lookupvalue.moduleId][lookupindex] = lookupvalue;
				});
			} else {
				language = moduleDownloaded[0].courseLookup.srcLangDTO.enName;
				langValue = moduleDownloaded[0].courseLookup.language;
				systemID = moduleDownloaded[0].courseLookup.systemId;
				course = moduleDownloaded[0].courseLookup.course;
				title = moduleDownloaded[0].courseLookup.title;
				catalogId = moduleDownloaded[0].courseLookup.catalogId;
				mediaType = moduleDownloaded[0].courseLookup.mediaType;
				coursePath = moduleDownloaded[0].courseLookup.coursePath;
			}

			var mcourceIndex = moduleId + langValue;
			var thumbNail = "images/app/no-preview.jpg";
			var source = "";
			var dueDate = moduleDownloaded[0].dueDate;

			if(dueDate == undefined || dueDate == null || dueDate =='null' || dueDate =='undefined') {
				newdueDate = "Date Not Found";
				dueDisplay = "none";
			}else{
				newdueDate = formatDate(dueDate, "mmmm d, yyyy");
				dueDisplay = "inline";
			}

			var catalystInnerBody = '';
			catalystInnerBody = '<li class="dwn'+mcourceIndex+'">';
			catalystInnerBody += '<div class="cat-box" data-cat-name="Catalyst1">';
			catalystInnerBody += '<p class="mpImageWidth"><img id="static" src="' + thumbNail + '" onclick="getPreviewData(&#39;' + curriculumId + '&#39;,&#39;' + moduleId + '&#39;,&#39;' + systemID + '&#39;)"></img></p>';
			catalystInnerBody += '<div class="orange-band"> <div class="video-title"> <div class="video-title-txt"> ' + title + '</div><span style="font-size:11px;display:'+dueDisplay+'">Due '+ newdueDate + '</span></div>';
			catalystInnerBody += '<div class="download-btn">';
			catalystInnerBody += '<div class="btns-container">';
			catalystInnerBody += '<div class="btns-left">';
			if ($(window).height() > 600) {

				catalystInnerBody += '<div class="btn-download-offline downloadAvailablity downloadOnlineColor"  data-source="' + source + '"  id="online' + mcourceIndex + '"><span class="DownloadOfflineClose-btn"></span>Available Offline</div>';
				catalystInnerBody += '<div class="delete-button-container"><div class="btn-download deleteModuleBtn" data-index="' + mcourceIndex + '" data-source="' + catalogId + '"  id="delete' + mcourceIndex + '" >Delete Module</div>';
				catalystInnerBody += '<section class="confirmDelete confirmDeleteDropdown' + mcourceIndex + '" style="display:none;">';
				catalystInnerBody += '<a class="del_btn" onclick="deleteDownload(&#39;' + catalogId + '&#39;,&#39;' + mcourceIndex + '&#39;)" data-role="button">Delete</a>';
				catalystInnerBody += '<a class="can_btn" onclick="closePopup(&#39;' + mcourceIndex + '&#39;);" data-role="button">Cancel</a>';
				catalystInnerBody += '</section></div>';
			} else {

				catalystInnerBody += '<div class="btn-download-offline downloadAvailablity downloadOnlineColor"  data-source="' + source + '"  id="online' + mcourceIndex + '"><span class="DownloadOfflineClose-btn"></span>Available Offline</div>';
				catalystInnerBody += '<div class="delete-button-container"><div class="btn-download deleteModuleBtn" data-index="' + mcourceIndex + '" data-source="' + catalogId + '"  id="delete' + mcourceIndex + '" >Delete Module</div>';
				catalystInnerBody += '</div>';
			}

			catalystInnerBody += '</div>';
			catalystInnerBody += '<div class="status-right">';
			catalystInnerBody += '<div style="display:none;" id="status' + mcourceIndex + '"></div>';
			catalystInnerBody += '</div>';
			catalystInnerBody += '</div>';
			catalystInnerBody += '</div>';
			catalystInnerBody += '</div>';
			catalystInnerBody += '</div>';
			catalystInnerBody += '</li>';

			$("#downloadsList").append(catalystInnerBody);                
		});
	if($("#downloadsList").is(':empty')){
		$("#downloadsList").append('<p id="noDownloads" class="txtcenter">There are no downloaded modules</p>');
	}
	$('#downloadsList').trigger("create");
	HideDefaultLoadingImage();
}

function closeSettingsContainer() {

	if($.mobile.activePage.attr('id') == 'landingpage') {
		$("#modules .ui-icon").css('background-image', 'url(images/app/courses_b.png)');
	}else if($.mobile.activePage.attr('id') == 'downloadsPage') {
		$("#downloads .ui-icon").css('background-image', 'url(images/app/download_b.png)');
	}else if($.mobile.activePage.attr('id') == 'historyPage') {
		$("#history .ui-icon").css('background-image', 'url(images/app/history_b.png)');
	}else if($.mobile.activePage.attr('id') == 'howItWorks') {
		$("#how-it-works .ui-icon").css('background-image', 'url(images/app/info_b.png)');
	}

	$("#settings").data({
		'isclicked': false
	});
	$(".settingsContainer").css({
		"margin-right": "-420px"
	});
	$('.settings').removeClass('ui-btn-active');

	$('.settings').addClass('background-Changer');
	$("#settings .ui-icon").css('background-image', 'url(images/app/options.png)');
}

function retrieveLastSync() {
	$("#syncFreq").val(localStorage.getItem("settings_syncFrequency")).selectmenu('refresh');
	$("#lastSync").empty();
	var lastSync = localStorage.getItem("settings_lastSynced");
	$("#lastSync").append(lastSync);
}

function retrieveMobileLastSync() {
	$("#syncFreqM").val(localStorage.getItem("settings_syncFrequency")).selectmenu('refresh');
	$("#lastMobileSync").empty();
	$("#rowLastSyncTime").empty();

	var lastSync = localStorage.getItem("settings_lastSynced");
	var rowLastSync = localStorage.getItem("settings_rowLastSynced");

	$("#lastMobileSync").append(lastSync);
	$("#rowLastSyncTime").append("Last Sync: " + rowLastSync);
}

function getValue(control) {
	var controlVal = $("#" + control).val();
	return controlVal;
}

function networkCheckBeforeStart(index, source, moduleId, systemID, async) {

	ShowDefaultLoadingImage("Please wait, Initiating Download");
	var connectionType = checkConnection();
	if (isNetworkAvailable) {
		if(connectionType != "WiFi" && localStorage.getItem("settings_wifi") == "1"){
			HideDefaultLoadingImage();
			$("#optionsChange").simpledialog2();
		}
		else {
			if(source == "")
				getCompressedCourse(moduleId, systemID, async);
			else {
				memoryCheckBeforeStart(index);
				if(memoryFlag)
					startDownloadProcess(index, source);
			}
		}
	} else {
		HideDefaultLoadingImage();
		$("#connectionRequiredToDownload").simpledialog2();
	}
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
function startDownloadProcess(index, source) {
	HideDefaultLoadingImage();
	if (appstate == "pause") {
		$("#download" + index).css('display', 'none');
		$("#progress" + index).css('display', 'inline-block');
		$(".btn-download-all-resume").css('display', 'none');
		var urlExists = false;
		$.grep(multipleDownloadArray, function(value) {
			if (value == source) {
				urlExists = true;
				printLog("url ALREADY after PAUSE before startDownloadProcess");
			}
		});

		if (!urlExists) {
			printLog("Adding url after PAUSE");
			multipleDownloadArray.push(source);
			printLog(JSON.stringify(multipleDownloadArray));
			multipleDownloadArray = multipleDownloadArray.reverse();
			printLog("Adding url after REVERSE");
			printLog(JSON.stringify(multipleDownloadArray));
		}

		downloadUrlCount = multipleDownloadArray.length;
		if (DevicePlatform == "Android") {
			resumeAllDownload();
		} else if (DevicePlatform == "iOS") {
			startDownload(source, index);
		}
	} else {
		printLog("Adding url after PAUSE where appstate is: " + appstate);
		startDownload(source, index);
	}
	var isPreviewPage = false;
	try {
		isPreviewPage = ($.mobile.activePage.attr('id') == 'modulesPreview');
		if (isPreviewPage) {
			setModulePreviewControlOnNewDownload(index);
		}
	} catch(e) {}
}

function memoryCheckBeforeStart(index) {
	HideDefaultLoadingImage();
	ShowDefaultLoadingImage("Checking Free Space on Device");
	window.requestFileSystem = window.requestFileSystem
	|| window.webkitRequestFileSystem;
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
	cordova.exec(
			function(freeSpace) {
				memoryCheck(index, freeSpace);
			},
			function() {
				memoryFlag = false;
				HideDefaultLoadingImage();
				alert('Failed to read Memory on Device');
			}, 
			"File", "getFreeDiskSpace", []
	);  	
}

function memoryCheck(index, freeSpace){
	var totalSize = localStorage.getItem("courseSize-"+index);
	var fSpace= freeSpace/1024;
	if(fSpace<totalSize){
		memoryFlag = false;
		HideDefaultLoadingImage();
		$("#deviceStorage").simpledialog2();
	}
	else {
		HideDefaultLoadingImage();
		memoryFlag = true;
	}
}

function closePopup(index) {
	$(".confirmDeleteDropdown" + index).hide();
	$("#delete" + index).css("background", "#0078ae");
};
function closeDialog() {
	$('.popupActiveButton').removeAttr("style");
};

function deleteFile(){
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, deleteGotFile, fail);    	
}

function deleteGotFile(fileSystem){
	window.FS = fileSystem;
	var printDirPath12 = function(entry){
		printLog("Dir path - >>>>>>" + entry.fullPath);
		entry.removeRecursively(deleteSuccess, deleteFail); 	     
	}
	getDeleteDirectoryPath("Lrn/box/"+deleteFolderName, printDirPath12);          	   
}

function fail(error) {
	printLog(error.code);
}

function getDeleteDirectoryPath(path, success){
	var dirs = path.split("/").reverse();
	var root = window.FS.root;

	var createDir = function(dir){
		printLog("create dir " + dir);
		root.getDirectory(dir, null, successCB, failCB);
	};

	var successCB = function(entry){
		printLog("dir Path " + entry.fullPath);
		root = entry;
		if(dirs.length > 0){
			createDir(dirs.pop());
		}else{
			printLog("all dir created");
			success(entry);
		}
	};

	var failCB = function(){
		printLog("failed to create dir " + dir);
	};

	createDir(dirs.pop());
}


function deleteSuccess(parent) {
	printLog("Remove Recursively Succeeded");
}
function deleteFail(error) {
	alert("Failed to remove directory or it's contents: " + error.code);
}

function getLocalDownloadArray() {
	var localDownloadArray = localStorage.getItem("localDownloadArray");	
	var tempDownloadArray;

	if(localDownloadArray == null)
		tempDownloadArray = [];
	else
		tempDownloadArray = JSON.parse(localDownloadArray);

	return tempDownloadArray;
}

function formatDate(dateValue, format) {
	var dateValue = new Date(dateValue);
	var year = dateValue.getFullYear();
	var month = dateValue.getMonth();
	var date = dateValue.getDate();
	var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	
	var dateFormatted = "";
	if(format == "mm/dd/yyyy")
		dateFormatted  = month + "/" + date + "/" + year;
	else if(format == "mmmm d, yyyy")
		dateFormatted  = monthNames[month] + " " + date + ", " + year;

	return dateFormatted;
}

function printLog(message) {
//	console.log(message);
}