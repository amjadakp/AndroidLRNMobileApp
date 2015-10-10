var moduleToShow = 0;
var modulePreviewArray = new Array();
var modulePreviewArray_optional = new Array();
var historyPreviewModule = new Array();
var tempArray = new Array();
var completedModule = new Array();
var modulesContainer = new Array();
var _courseType;
var newModuleData = [];
var dueAlert = false;
var moduleAlert = false;
var updateCoursesOnSync = false;
var dynamicModuleData = [];
var dynamicModuleDataObj = {};
var moduleImageKV = {};
//var hostName = "http://dow-lcec.qa4.lrn.com/lrnsecureservice/";
var hostName = "http://10.103.30.91:8080/lrnsecureservice/";
var hostNameForDownload = "http://10.103.30.91:8080/";
var _curriculumId = '';
var fromHistory = false;
var userAssignedModulesArray = new Array();
var moduleParameters = [], moduleParams = [];
var availableHistoryCourses = [];

function CallWebservice(options, functionName) {
	$.ajaxSetup({
		async: options.async
	});
	try {
		if (options.url.indexOf(hostName) == -1)
			options.url = hostName + options.url;
		printLog("url to hit====================" + options.url);

		$.ajax({
			url: options.url,
			type: options.type,
			dataType: options.dataType,
			contentType: options.contentType,
			data: options.data,
			success: function(response) {
				printLog("Get request success with live services: " + functionName);
				if (typeof(options.callback) != 'undefined' && options.callback != null)
					eval(options.callback)(response);
				printLog("Response: "+response);
			},
			error: function(xhr, textStatus, errorThrown) {
				$("#serviceErrorText").html("");
				$("#serviceErrorText").html(xhr.statusText);
				$("#serviceErrorAlert").simpledialog2();
				HideDefaultLoadingImage();
				printLog("Get request failed with live services: " + functionName);
				printLog(xhr + textStatus + errorThrown);
			}
		});
	} catch(e) {
		HideDefaultLoadingImage();
		printLog("==== CallWebservice function inside CATCH ====");
	}
}

//webservice request and response handling

//Request to fetch Site Details
function getSiteInfo(siteID) {
	if (localStorage.getItem("siteID") === null || localStorage.getItem("siteID") !== siteID) {
		var options = {};
		options.url = "site.srv?wsdl";
		options.type = "POST";
		options.dataType = "xml";
		options.contentType = "text/plain";    
		options.callback = "ProcessGetSiteInfoResponse";
		options.async = true;
		var params = [];
		params.push(siteID);
		options.data = buildXMLrequest('getInfo', params);
		CallWebservice(options, "getInfo(siteID)");
	} else {
		$.mobile.changePage("#login");
	}
}
function ProcessGetSiteInfoResponse(xml) {
	printLog("GetSiteinforesponse");
	var jsonSiteInfoResponse = $.xml2json(xml);
	var _success;
	var _error;
	if(jsonSiteInfoResponse !== null){
		$("#txt_SiteID").val("");
		if(jsonSiteInfoResponse.Body.getInfoResponse.return.lrnResponse.success){
			if(jsonSiteInfoResponse.Body.getInfoResponse.return.siteId == "undefined" ||
					jsonSiteInfoResponse.Body.getInfoResponse.return.siteId == undefined) {
				HideDefaultLoadingImage();
				$("#wrongSiteId").simpledialog2();
			} else {
				localStorage.setItem("siteID",jsonSiteInfoResponse.Body.getInfoResponse.return.siteId);
				localStorage.setItem('largeLogo', jsonSiteInfoResponse.Body.getInfoResponse.return.largeLogoUrl);
				localStorage.setItem('smallLogo', jsonSiteInfoResponse.Body.getInfoResponse.return.smallLogoUrl);
				localStorage.setItem('siteCompanyName', jsonSiteInfoResponse.Body.getInfoResponse.return.name);
				HideDefaultLoadingImage();
				$.mobile.changePage("#login");
			}
		}
	}
}

//Request to fetch Login Details
function authenticate(userName, pwd) {
	var options = {};
	options.url = "user.srv";
	options.type = "POST";
	options.dataType = "xml";
	options.contentType = "text/plain";
	options.callback = "ProcessAuthenticateResponse";
	options.async = true;
	var params = [];
	var companyName = localStorage.getItem("siteCompanyName");
	params = [userName, pwd, companyName];
	localStorage.setItem('uName', userName);
	localStorage.setItem('uPwd', pwd);
	options.data = buildXMLrequest('authenticate', params);
	printLog(options.data);
	CallWebservice(options, "authenticate(userName, pwd)");
}

function ProcessAuthenticateResponse(xml) {
	var jsonAuthenticateResponse = $.xml2json(xml);
	localStorage.setItem('userId', "");
	localStorage.setItem('fName', "");
	localStorage.setItem('lName', "");
	if(jsonAuthenticateResponse.Body.authenticateResponse.return.authenticated === "true"){
		localStorage.setItem('userId', jsonAuthenticateResponse.Body.authenticateResponse.return.userId);
		localStorage.setItem('fName', jsonAuthenticateResponse.Body.authenticateResponse.return.firstname);
		localStorage.setItem('lName', jsonAuthenticateResponse.Body.authenticateResponse.return.lastname);
		$(".ui-loader p").html("Updating Courses...");
		updateCoursesOnSync = false;
		loadCoursesFromService();
	}else {
		HideDefaultLoadingImage();
		$("#txt_userName").val('');
		$("#txt_password").val('');
		var errorCode = jsonAuthenticateResponse.Body.authenticateResponse.return.errorCode;
		var errorMsg = jsonAuthenticateResponse.Body.authenticateResponse.return.errorMessage;
		$("#invalidSigninError").simpledialog2();
	}
}

//Request to reset password
function forgotPassword(emailId) {
	var options = {};
	options.url = "user.srv?wsdl";
	options.type = "POST";
	options.dataType = "xml";
	options.contentType = "text/plain";
	options.callback = "ProcessForgotPasswordResponse";
	options.async = true;
	var params = [];
	var companyName = localStorage.getItem("siteCompanyName");
	params = [emailId, "", companyName];
	options.data = buildXMLrequest('forgotPasswordEmailWithDefaultConsoleURL', params);
	printLog(options.data);
	CallWebservice(options, "forgotPasswordEmailWithDefaultConsoleURL()");
}

function ProcessForgotPasswordResponse(xml) {
	var jsonAuthenticateResponse = $.xml2json(xml);
	HideDefaultLoadingImage();
	$('.reset_pwd').hide();
	$('.thanks_container').show();
}

//Request to fetch modules 
function loadCoursesFromService(){
	var options = {};
	options.url = "module.srv";
	options.type = "POST";
	options.dataType = "xml";
	options.contentType = "text/plain";
	options.callback = "ProcessUserAssignedModulesResponse";
	options.async = false;
	var params = [];
	params = [localStorage.getItem('siteID'), localStorage.getItem('userId'), localStorage.getItem('siteCompanyName')];
	printLog("params to send : "+params[0]+params[1]+params[2]);
	options.data = buildXMLrequest('getUserAssignedModules', params);
	CallWebservice(options, "returnIfExists(siteID)");
}

function ProcessUserAssignedModulesResponse(xml) { 
	var jsonUserAssignedModuleResponse;
	userAssignedModulesArray = new Array();
	if(xml == undefined) {
		var parsedModulesJSON = JSON.parse(localStorage.getItem("jsonUserAssignedModules"));
		if(parsedModulesJSON==0) {
			alert("No Modules Found");
		} else {
			var parsedModulesJSON = JSON.parse(localStorage.getItem("jsonUserAssignedModules"));
			$.each(parsedModulesJSON, function(index, x) { 
				userAssignedModulesArray.push(x.moduleId);
			});
			generateAssignedModules(parsedModulesJSON);
		}
	} else {
		jsonUserAssignedModuleResponse = $.xml2json(xml);
		localStorage.setItem("jsonUserAssignedModules",JSON.stringify(jsonUserAssignedModuleResponse.Body.getUserAssignedModulesResponse.return.modules));
		var parsedModulesJSON = JSON.parse(localStorage.getItem("jsonUserAssignedModules"));
		$.each(parsedModulesJSON, function(index, x) { 
			userAssignedModulesArray.push(x.moduleId);
		});
		if(!updateCoursesOnSync)
			generateAssignedModules(jsonUserAssignedModuleResponse.Body.getUserAssignedModulesResponse.return.modules);
	}
}

//Function used to display fetched modules
function generateAssignedModules(jsonCourseModules) {
	$("#mandatory_categoryList").html("");
	$("#optional_categoryList").html("");
	var downloadArray = getLocalDownloadArray();
	$.each(jsonCourseModules,function(jsonCourseModulesIndex,jsonCourseModulesValue) {
		var moduleId = "", catalogId = "";
		var thumbNail = "images/app/no-preview.jpg";
		var language = "", langValue = "", systemID = "", course = "", title = "", dueDisplay = "", isFluidX = false;

		if($.isArray(jsonCourseModulesValue.courseLookup)) {
			$.each(jsonCourseModulesValue.courseLookup,function(lookupindex,lookupvalue) {
				if(lookupindex === 0) {
					moduleParameters[lookupvalue.moduleId] = [];
					language = lookupvalue.srcLangDTO.enName;
					langValue = lookupvalue.language;
					systemID = lookupvalue.systemId;
					course = lookupvalue.course;
					title = lookupvalue.title;
					catalogId = lookupvalue.baseCatalogId;
					isFluidX = lookupvalue.courseTypeDTO.isFluidX;
				}
				moduleParameters[lookupvalue.moduleId][lookupindex] = {};
				moduleParameters[lookupvalue.moduleId][lookupindex] = lookupvalue;
			});
		} else {
			language = jsonCourseModulesValue.courseLookup.srcLangDTO.enName;
			langValue = jsonCourseModulesValue.courseLookup.language;
			systemID = jsonCourseModulesValue.courseLookup.systemId;
			course = jsonCourseModulesValue.courseLookup.course;
			title = jsonCourseModulesValue.courseLookup.title;
			catalogId = jsonCourseModulesValue.courseLookup.baseCatalogId;
			isFluidX = jsonCourseModulesValue.courseLookup.courseTypeDTO.isFluidX;
		}

		var dueDate = jsonCourseModulesValue.dueDate;
		var source = "";
		var moduleId = jsonCourseModulesValue.moduleId;
		var mcourceIndex = moduleId+langValue;
		var curriculumId = jsonCourseModulesValue.curriculumId;
		
		if(dueDate == undefined || dueDate == null || dueDate =='null' || dueDate =='undefined'){
			newdueDate = "Date Not Found";
			dueDisplay = "inline";
		}else{
			newdueDate = formatDate(dueDate, "mmmm d, yyyy");
			dueDisplay = "inline";
		}
		downloadRunning = false, downloadPaused = false;
		$.grep(multipleDownloadArray, function(value) {
			if (value.split("/")[value.split("/").length-1].split("-")[0] == catalogId) {
				downloadRunning = true;
			}
		});
		$.grep(pauseArray, function(value) {
			if (value == mcourceIndex) {
				downloadPaused = true;
			}
		});

		var catalystInnerBody = '<li id="moduleStatus' + moduleId + '">';
		catalystInnerBody += '<div class="cat-box" data-cat-name="Catalyst1">';
		catalystInnerBody += '<p class="mpImageWidth"><img src="' + thumbNail + '" onclick="getPreviewData(&#39;' + curriculumId + '&#39;,&#39;' + moduleId + '&#39;,&#39;' + systemID + '&#39;)"></p>';
		catalystInnerBody += '<div class="orange-band"> <div class="video-title"> <div class="video-title-txt"> ' + title + '</div><span style="font-size:11px;display:'+dueDisplay+'">Due ' + newdueDate + '</div>';
		catalystInnerBody += '<div class="download-btn">';
		catalystInnerBody += '<div  style="display:none;width:100%;height:10px;border-radius:10px;padding:0 !important" id="progress' + mcourceIndex + '"></div> ';
		catalystInnerBody += '<div class="btns-container">';
		catalystInnerBody += '<div class="btns-left">';

		if ($.inArray(mcourceIndex, downloadArray) > -1) {
			catalystInnerBody += '<div class="btn-download-offline downloadAvailablity downloadOnlineColor"  data-source="' + source + '"  id="availOffline' + mcourceIndex + '" ><span class="moduleLanguage">'+language+'</span><span class="DownloadOfflineClose-btn"></span>Available Offline</div>';
			catalystInnerBody += '<div class="btn-dwnld-list btn-download downloadedBtnLabel" data-index="' + mcourceIndex + '" data-source="' + source + '"  id="downloadedLabel' + mcourceIndex + '" data-moduleId="' + moduleId + '" data-systemId="' + systemID + '" style="display:inline-block;">Downloaded</div>';
		} else {
			catalystInnerBody += '<div class="btn-download-offline downloadAvailablity downloadOnlineColor" style="display:none;" data-source="' + source + '"  id="offline' + mcourceIndex + '" ><span class="moduleLanguage">'+language+'</span><span class="DownloadOfflineClose-btn"></span>Available Offline</div>';
			catalystInnerBody += '<div class="btn-dwnld-list btn-download downloadedBtnLabel" data-index="' + mcourceIndex + '" data-source="' + source + '"  id="downloadedLabel' + mcourceIndex + '" data-moduleId="' + moduleId + '" data-systemId="' + systemID + '" style="display:none;">Downloaded</div>';
			catalystInnerBody += '<div class="btn-download-offline downloadAvailablity downloadOnlineColor"  data-source="' + source + '"  id="online' + mcourceIndex + '" ><span class="moduleLanguage">'+language+'</span><span class="DownloadOfflineClose-btn"></span>Available Online</div>';
			if(isFluidX == "true")
				catalystInnerBody += '<div class="btn-download downloadCatalystItem" data-index="' + mcourceIndex + '" data-source="' + source + '"  id="download' + mcourceIndex + '" data-moduleId="' + moduleId + '" data-systemId="' + systemID + '" style="display:inline-block;">Download</div>';
		}

		catalystInnerBody += '<div class="btn-download-cancel" data-index="' + mcourceIndex + '" data-source="' + source + '"  id="cancel' + mcourceIndex + '" style="display:none">Cancel</div>';
		catalystInnerBody += '<div class="btn-download-pause" data-index="' + mcourceIndex + '" data-source="' + source + '"  id="pause' + mcourceIndex + '" style="display:none">Pause</div>';
		catalystInnerBody += '<div class="btn-download-resume" data-index="' + mcourceIndex + '" data-source="' + source + '"  id="resume' + mcourceIndex + '" style="display:none">Resume</div>';
		catalystInnerBody += '</div>';
		catalystInnerBody += '<div class="status-right">';
		catalystInnerBody += '<div style="display:none;" id="status' + mcourceIndex + '"></div>';
		catalystInnerBody += '</div>';
		catalystInnerBody += '</div>';
		catalystInnerBody += '</div></div>';
		catalystInnerBody += '</div>';
		catalystInnerBody += '</div>';
		catalystInnerBody += '<div class="status-icon"><img id="imgStatus-' + moduleId + '" src="images/app/new.png" /></div>';
		catalystInnerBody += '</div>';
		catalystInnerBody += '</li>';
		dynamicModuleDataObj = {};
		dynamicModuleDataObj.mIndex = mcourceIndex;
		dynamicModuleDataObj.mSource = source;
		dynamicModuleData.push(dynamicModuleDataObj);
		if (jsonCourseModulesValue.srcCertReqId == '1') {
			if(title !== "")
				$("#mandatory_categoryList").append(catalystInnerBody);
		}else{
			if(title !== "")
				$("#optional_categoryList").append(catalystInnerBody);
		}
		if(downloadRunning) {
			if (multipleDownloadArray.length > 1) {
				$("#downloadAllSection").show();
				$(".btn-download-all").hide();
				$(".btn-download-all-pause").show().css('display', 'inline-block');
				$(".btn-download-all-cancel").show().css('display', 'inline-block');
				$("#downloadStatusAll").show();
				$("#downloadProgressAll").show();
				try {
					$("#downloadProgressAll").progressbar({
						value: parseInt(localStorage.getItem("'" + mcourceIndex + "'"))
					});
				} catch(e) {
					$("#downloadProgressAll").progressbar({
						value: 0
					});
				}

				$("#mandatory_catalysts").css("top", "145px");
				$("#optional_catalysts").css("top", "145px");
				try {
					jQuery.each(multipleDownloadArray, function(key, value) {
						$("#cancel" + mcourceIndex).css('display', 'none');
						$("#pause" + mcourceIndex).css('display', 'none');
						$("#resume" + mcourceIndex).css('display', 'none');
						$('#status' + mcourceIndex).hide();
						$("#offline" + mcourceIndex).css('display', 'none');
						$("#online" + mcourceIndex).css('display', 'none');
						$("#download" + mcourceIndex).css('display', 'none');
						$("#progress" + mcourceIndex).css('display', 'inline-block');
						try {
							$("#progress" + mcourceIndex).progressbar({
								value: parseInt(localStorage.getItem("'" + mcourceIndex + "'"))
							});
						} catch(e) {
							$("#progress" + mcourceIndex).progressbar({
								value: 0
							});
						}
					});
				} catch(e) {
					printLog("EXCEPTION AUTO Resume " + e);
				}
				if(downloadPaused) {
					$(".btn-download-all-pause").css('display', 'none');
					$(".btn-download-all-cancel").css('display', 'inline-block');
					$(".btn-download-all-resume").css('display', 'inline-block');
					$("#downloadStatusAll").html(" Downloads Paused ");
				}
			} else {
				$("#mandatory_catalysts").css("top", "52px");
				$("#optional_catalysts").css("top", "52px");

				$("#offline" + mcourceIndex).css('display', 'none');
				$("#online" + mcourceIndex).css('display', 'none');
				$("#download" + mcourceIndex).css('display', 'none');
				$("#cancel" + mcourceIndex).css('display', 'inline-block');
				$("#pause" + mcourceIndex).css('display', 'inline-block');
				$("#resume" + mcourceIndex).css('display', 'none');
				$("#progress" + mcourceIndex).css('display', 'inline-block');
				$('#status' + mcourceIndex).css('display', 'inline-block');
				try {
					$("#progress" + mcourceIndex).progressbar({
						value: parseInt(localStorage.getItem("'" + mcourceIndex + "'"))
					});
				} catch(e) {
					$("#progress" + mcourceIndex).progressbar({
						value: 0
					});
				}
				if(downloadPaused) {
					$("#pause" + mcourceIndex).css('display', 'none');
					$("#cancel" + mcourceIndex).css('display', 'inline-block');
					$("#resume" + mcourceIndex).css('display', 'inline-block');
					$("#status" + mcourceIndex).html(" Download Paused ");
				}
			}
		}
	});

	if($("#mandatory_categoryList").is(':empty') && $("#optional_categoryList").is(':empty')){
		$("#mandatory_categoryList").append('<p id="noAssignedModules_req">You have no courses currently assigned to you. You can review and access previously completed courses from the History icon</p>');
		$("#optional_categoryList").append('<p id="noAssignedModules_opt">You have no courses currently assigned to you. You can review and access previously completed courses from the History icon</p>');
	}

	else if($("#mandatory_categoryList").is(':empty')){
		$("#mandatory_categoryList").append('<p id="noAssignedModules_req">You have no courses currently assigned to you. You can review and access previously completed courses from the History icon</p>');
	}
	else if($("#optional_categoryList").is(':empty')){
		$("#optional_categoryList").append('<p id="noAssignedModules_opt">You have no courses currently assigned to you. You can review and access previously completed courses from the History icon</p>');
	}

	HideDefaultLoadingImage();
	$.mobile.changePage("#landingpage");
}

//Request to fetch History Details
function getHistoryStatus() {
	historyPreviewModule = [];
	var isNetwork = checkConnection();

	if(isNetwork == 'No network connection') {
			ProcessHistoryResponse();
	}
	else {
		var options = {};
		try {
			options.url = "module.srv";
			options.type = "POST";
			options.dataType = "xml";
			options.contentType = "text/plain";
			options.callback = "ProcessHistoryResponse";
			options.async = true;
			var params = [];
			params = [localStorage.getItem('userId'), localStorage.getItem('siteCompanyName'), localStorage.getItem('siteID')];
			options.data = buildXMLrequest('getModulesTaken', params);
			CallWebservice(options, "getModulesTaken()");
		} catch(e) {
			return false;
		}
	}	
}

function ProcessHistoryResponse(xml) {
	printLog(JSON.stringify($.xml2json(xml)));
	try{
		ShowDefaultLoadingImage("Loading History...");
		var jsonHistoryResponse;
		if(xml == undefined){
			jsonHistoryResponse = JSON.parse(localStorage.getItem("jsonHistoryResponse"));
		}else{
			jsonHistoryResponse = $.xml2json(xml);
			localStorage.setItem("jsonHistoryResponse",JSON.stringify(jsonHistoryResponse));
		}
		var html = '';
		var downloadArray = getLocalDownloadArray();
		var newDA = [];
		$.each(downloadArray, function(i,v) {
			v = parseInt(v,10).toString();
			newDA.push(v);
		});
		var modulesTaken = jsonHistoryResponse.Body.getModulesTakenResponse.return.completionCertificates;
		var parsedModulesJSON = JSON.parse(localStorage.getItem("jsonUserAssignedModules"));
		$.each(parsedModulesJSON, function(index, x) { 
			userAssignedModulesArray.push(x.moduleId);
		});

		if(!$.isArray(modulesTaken)) {
			var catalogId = modulesTaken.catalogId;
			var completion = modulesTaken.completionDate;
			var description = modulesTaken.courseDescription;
			var title = modulesTaken.courseShortName;
			var moduleId = modulesTaken.moduleId;
			var systemId = modulesTaken.systemId;
			var timeSpent = modulesTaken.timeSpent;
			var synced = modulesTaken.created;
			var syncedDate = formatDate(modulesTaken.modified, "mm/dd/yyyy");
			var completionDate = formatDate(modulesTaken.completionDate, "mm/dd/yyyy");
			var dueDate = "";
			var mcourceIndex = "";
			var source = "";
			var media = false;
			var Hours = Math.floor(timeSpent / 60);
			if (Hours < 10) {
				Hours = "0" + Hours;
			}
			var Minutes = timeSpent % 60;
			if (Minutes < 10) {
				Minutes = "0" + Minutes;
			}
			var Seconds = 00;
			if (Seconds < 10) {
				Seconds = "0" + Seconds;
			}
			var Time = Hours + ":" + Minutes + ":" + Seconds;
			if (jQuery.inArray(systemId + "|" + moduleId + "|" + description + "|" + title + "|" + catalogId, moduleId) == -1) {
				printLog("inserting====" + systemId + "=====" + moduleId);
				moduleID.push(systemId + "|" + moduleId + "|" + description + "|" + title + "|" + catalogId + "|" + dueDate + "|" + media + "|" + mcourceIndex + "|" + source);
			}

			var buttonTitle = "", curriculumId = "undefined";
			var exists = $.inArray(moduleId, userAssignedModulesArray);
			if(exists > 0)
				buttonTitle = "View Course Again";
			else
				buttonTitle = "Not Available";

			html += '<div id="dvcollapsibleHistory' + catalogId + '" class="collapsibleHistory" data-collapsed="true" data-role="collapsible" data-content-theme="c" data-iconpos="right">';
			html += '<h3 class="module-row-details"><span id="title">' + title + '</span>';
			printLog("=======" + moduleId + "======" + systemId+ "======" + $(window).width());
			if ($(window).width() > 400) {
				html += '<span id="categoryId" >' + catalogId + '</span>';
				html += '<span id="timespent" >' + Time + '</span>';
				html += '<span id="completed" >' + completionDate + '</span>';
				html += '<span id="sync" >' + syncedDate + '</span>';
				html += ' <span id="moduleOption"><a class="historyPreviewModule" id="historyPreviewModule">' + buttonTitle + '</a></span>';
				html += '</h3>';
				html += '<div class="historyImageHolder"><img src="images/app/no-preview.jpg" onclick="getPreviewData(&#39;' + curriculumId + '&#39;,&#39;' + moduleId + '&#39;,&#39;' + systemId + '&#39;);"></div>';
				html += '<div class="historyDescHolder"><p>' + description + '</p></div>';
				html += '</div>';
			} else if ($(window).width() <= 400) {
				html += '<span id="categoryId" >Course ID: ' + catalogId + '</span>';
				html += '<span id="completed" >Completed: ' + completionDate + '</span>';
				html += '<span id="moduleOption">';
				html += '<a class="historyPreviewModule" id="historyPreviewModule" >' + buttonTitle + '</a></span>';
				html += '</h3>';
				html += '<span id="timespent" >Time Spent: ' + Time + '</span>';
				html += '<span id="sync" >Synced: ' + syncedDate + '</span>';
				html += '<div class="historyImageHolder"><img src="images/app/no-preview.jpg" onclick="getPreviewData(&#39;' + curriculumId + '&#39;,&#39;' + moduleId + '&#39;,&#39;' + systemId + '&#39;);"></div>';
				html += '<div class="historyDescHolder"><p>' + description + '</p></div>';
				html += '</div>';
				html += '</div>';
				html += '</div>';
				html += '</div>';
			}

			$(".noModule").hide();
			$("#historyData").html(html);
			$('#historyData').trigger("create");

			if(exists > 0) {
				$(".historyPreviewModule").removeClass("view-NoModule-btn");
				$(".historyPreviewModule").addClass("view-module-btn");
			} else {
				$(".historyPreviewModule").addClass("view-NoModule-btn");
				$(".historyPreviewModule").removeClass("view-module-btn");
			}
			if(enableAutoDelete) {
				if($.inArray(v.moduleId, newDA) > -1) {
					availableHistoryCourses.push(v.moduleId); 
				}
			}
		}
		else {
			$.each(modulesTaken, function(historyResponseIndex,historyResponseValue){
				var catalogId = historyResponseValue.catalogId;
				var completion = historyResponseValue.completionDate;
				var description = historyResponseValue.courseDescription;
				var title = historyResponseValue.courseShortName;
				var moduleId = historyResponseValue.moduleId;
				var systemId = historyResponseValue.systemId;
				var timeSpent = historyResponseValue.timeSpent;
				var synced = historyResponseValue.created;
				var syncedDate = formatDate(historyResponseValue.modified, "mm/dd/yyyy");
				var completionDate = formatDate(historyResponseValue.completionDate, "mm/dd/yyyy");
				var dueDate = "";
				var mcourceIndex = "";
				var source = "";
				var media = false;
				var Hours = Math.floor(timeSpent / 60);
				if (Hours < 10) {
					Hours = "0" + Hours;
				}
				var Minutes = timeSpent % 60;
				if (Minutes < 10) {
					Minutes = "0" + Minutes;
				}
				var Seconds = 00;
				if (Seconds < 10) {
					Seconds = "0" + Seconds;
				}
				var Time = Hours + ":" + Minutes + ":" + Seconds;
				if (jQuery.inArray(systemId + "|" + moduleId + "|" + description + "|" + title + "|" + catalogId, moduleId) == -1) {
					printLog("inserting====" + systemId + "=====" + moduleId);
					moduleID.push(systemId + "|" + moduleId + "|" + description + "|" + title + "|" + catalogId + "|" + dueDate + "|" + media + "|" + mcourceIndex + "|" + source);
				}

				var buttonTitle = "", curriculumId = "undefined";
				var exists = $.inArray(moduleId, userAssignedModulesArray);
				if(exists > 0)
					buttonTitle = "View Course Again";
				else
					buttonTitle = "Not Available";

				html += '<div id="dvcollapsibleHistory' + catalogId + '" class="collapsibleHistory" data-collapsed="true" data-role="collapsible" data-content-theme="c" data-iconpos="right">';
				html += '<h3 class="module-row-details"><span id="title">' + title + '</span>';
				printLog("=======" + moduleId + "======" + systemId+ "======" + $(window).width());
				if ($(window).width() > 400) {
					html += '<span id="categoryId" >' + catalogId + '</span>';
					html += '<span id="timespent" >' + Time + '</span>';
					html += '<span id="completed" >' + completionDate + '</span>';
					html += '<span id="sync" >' + syncedDate + '</span>';
					html += ' <span id="moduleOption"><a class="historyPreviewModule" id="historyPreviewModule" onclick="getPreviewData(&#39;' + curriculumId + '&#39;,&#39;' + moduleId + '&#39;,&#39;' + systemId + '&#39;);">' + buttonTitle + '</a></span>';
					html += '</h3>';
					html += '<div class="historyImageHolder"><img src="images/app/no-preview.jpg" ></div>';
					html += '<div class="historyDescHolder"><p>' + description + '</p></div>';
					html += '</div>';
				} else if ($(window).width() <= 400) {
					html += '<span id="categoryId" >Course ID: ' + catalogId + '</span>';
					html += '<span id="completed" >Completed: ' + completionDate + '</span>';
					html += '<span id="moduleOption">';
					html += '<a class="historyPreviewModule" id="historyPreviewModule" onclick="getPreviewData(&#39;' + curriculumId + '&#39;,&#39;' + moduleId + '&#39;,&#39;' + systemId + '&#39;);">' + buttonTitle + '</a></span>';
					html += '</h3>';
					html += '<span id="timespent" >Time Spent: ' + Time + '</span>';
					html += '<span id="sync" >Synced: ' + syncedDate + '</span>';
					html += '<div class="historyImageHolder"><img src="images/app/no-preview.jpg" ></div>';
					html += '<div class="historyDescHolder"><p>' + description + '</p></div>';
					html += '</div>';
					html += '</div>';
					html += '</div>';
					html += '</div>';
				}

				$(".noModule").hide();
				$("#historyData").html(html);
				$('#historyData').trigger("create");

				if(exists > 0) {
					$(".historyPreviewModule").removeClass("view-NoModule-btn");
					$(".historyPreviewModule").addClass("view-module-btn");
				} else {
					$(".historyPreviewModule").addClass("view-NoModule-btn");
					$(".historyPreviewModule").removeClass("view-module-btn");
				}
				if(enableAutoDelete) {
					if($.inArray(v.moduleId, newDA) > -1) {
						availableHistoryCourses.push(v.moduleId); 
					}
				}
			});
		}
		modulesContainer = moduleID.slice();

		setTimeout(function() {
			if (typeof historyScroller != 'undefined') {
				historyScroller.refresh();
			}
		}, 200);
		HideDefaultLoadingImage();
		if(availableHistoryCourses.length)
			startAutoDelete();
	} catch(e) {
		$(".noModule").show();
		printLog("Exception in getting history : "+e);
		HideDefaultLoadingImage();
	}
}

//Request to Compress course on server side
function getCompressedCourse(moduleId,systemId, async) {
	var options = {};
	options.url = "export.srv";
	options.type = "POST";
	options.dataType = "xml";
	options.contentType = "text/plain";
	options.callback = "ProcessCompressCourseResponse";
	options.async = async;
	var params = [];
	var siteID = localStorage.getItem('siteID');
	var userID = localStorage.getItem('userId');
	var SAMLToken = localStorage.getItem('SAMLToken');
	params = [siteID, systemId, "SCORM"]; 
	localStorage.setItem('uID', systemId + moduleId);
	options.data = buildXMLrequest('compressCourse', params);
	moduleParams = [moduleId, systemId, async];
	CallWebservice(options, "compressCourse");
}

function ProcessCompressCourseResponse(xml) {
	var jsonCompressCourseResponse = $.xml2json(xml);
	var isCompressed = jsonCompressCourseResponse.Body.compressCourseResponse.return.success;
	if(isCompressed) 
		getModuleContentUrl(moduleParams[0], moduleParams[1], moduleParams[2]);
	else
		alert("Error while compressing course");
}

//Request to fetch download link of compressed course
function getModuleContentUrl(moduleId,systemId, async) {
	var options = {};
	options.url = "export.srv";
	options.type = "POST";
	options.dataType = "xml";
	options.contentType = "text/plain";
	options.callback = "ProcessGetModuleContentUrlResponse";
	options.async = async;
	var params = [];
	var siteID = localStorage.getItem('siteID');
	var userID = localStorage.getItem('userId');
	var SAMLToken = localStorage.getItem('SAMLToken');
	printLog("siteId: " + siteID +" systemId :"+ systemId);
	params = [siteID, systemId, "SCORM"]; 
	localStorage.setItem('uID', systemId + moduleId);
	options.data = buildXMLrequest('exportCourse', params);
	CallWebservice(options, "exportCourse");
}

function ProcessGetModuleContentUrlResponse(xml) {
	var jsonModuleContentUrl = $.xml2json(xml);
	var moduleContentUrl = jsonModuleContentUrl.Body.exportCourseResponse.return.courseUrl;
	var moduleContentSize = jsonModuleContentUrl.Body.exportCourseResponse.return.courseSize;
	var index = "";
	printLog("url is : " + moduleContentUrl);
	printLog("xml is : " + xml);
	printLog("jsonModuleContentUrl is : " + JSON.stringify(jsonModuleContentUrl));
	if(moduleContentUrl === undefined || moduleContentUrl === "" || moduleContentUrl === null) {
		HideDefaultLoadingImage();
		alert("Download Url is Not Available for this course");
	}else{
		moduleContentUrl = hostNameForDownload+moduleContentUrl;
		printLog("moduleContentUrl : "+moduleContentUrl);
		index = localStorage.getItem('currentIndex');
		localStorage.setItem("courseSize-"+index, moduleContentSize);
		$.grep(dynamicModuleData, function(value) {
			if (value.mIndex == index)
				value.mSource = moduleContentUrl;
		});

		memoryCheckBeforeStart(index);
		if(memoryFlag) 
			startDownloadProcess(index, moduleContentUrl);
	}
}

//Function used to build the xml request for the webservices
function buildXMLrequest(service, params) {
	generateWsseToken();
	var cDate = getFormattedCurrentDate();
	var addedMin = addMinutes(1);
	var requestXml = '<soapenv:Envelope xmlns:ser="http://service.lrn.com/" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">' + '<soapenv:Header>' + '<wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' + '<wsu:Timestamp >' + '<wsu:Created>' + cDate + '</wsu:Created>' + '<wsu:Expires>' + addedMin + '</wsu:Expires>' + '</wsu:Timestamp>' + '<wsse:UsernameToken >' + '<wsse:Username>188</wsse:Username>' + '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">test</wsse:Password>' + '<wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">' + returnNonce + '</wsse:Nonce>' + '</wsse:UsernameToken>' + '</wsse:Security>' + '</soapenv:Header>' + '<soapenv:Body>';
	requestXml += '<ser:' + service + " " + 'xmlns="http://service.lrn.com/">';
	var numberOfparams = params.length;
	for (var i = 0; i < params.length; i++) {
		requestXml += '<arg' + i + " " + 'xmlns="">' + params[i] + '</arg' + i + '>';
	}
	requestXml += '</ser:' + service + '>' + '</soapenv:Body>' + '</soapenv:Envelope>';
	var $xml = requestXml;
	return requestXml;
}

function getFormattedCurrentDate() {
	var d = new Date();
	var formatted = d.getUTCFullYear()+"-"+(Number(padZero(d.getUTCMonth()))+1)+"-"+padZero(d.getUTCDate())+"T"+padZero(d.getUTCHours())+":"+padZero(d.getUTCMinutes())+":"+padZero(d.getUTCSeconds())+"Z";
	return formatted;
}

function addMinutes(minutes) {
	var cDate = new Date();
	var d = new Date(cDate.getTime() + minutes * 60000);
	var formatted = d.getUTCFullYear()+"-"+(Number(padZero(d.getUTCMonth()))+1)+"-"+padZero(d.getUTCDate())+"T"+padZero(d.getUTCHours())+":"+padZero(d.getUTCMinutes())+":"+padZero(d.getUTCSeconds())+"Z";	
	return formatted;
}

function padZero(value){
	var paddedValue = "";
	if(value<10)
		paddedValue = "0"+value;
	else
		paddedValue = value;
	return paddedValue;
}

//Request to fetch course completion details before playing course 
function getScromObjectData(systemId) {
	var options = {};
	options.url = "courseLaunch.srv";
	options.type = "POST";
	options.dataType = "xml";
	options.contentType = "text/plain";
	options.callback = "ProcessGetScromObjectData";
	options.async = false;
	var params = [];
	params = [localStorage.getItem('userId'), localStorage.getItem('siteCompanyName'), localStorage.getItem('siteID'), systemId]; 
	options.data = buildXMLrequest('getParamConsole', params);
	printLog('options.data ....getScromObjectData.. ' + options.data);
	CallWebservice(options, "getParamConsole");
}

function ProcessGetScromObjectData(xml) {
	var jsonGetScromObjectResponse;
	printLog("Scrom Object Response XML opening " + JSON.stringify($.xml2json(xml)));
	if(xml != undefined){
		jsonGetScromObjectResponse = $.xml2json(xml);
		printLog("Scrom Object Response " + JSON.stringify(jsonGetScromObjectResponse));
		localStorage.setItem("currentCourseJson",JSON.stringify(jsonGetScromObjectResponse.Body.getParamConsoleResponse.return));
		printLog("currentCourseJson> " + localStorage.getItem("currentCourseJson"));
	}
	updateScromObject();
}

//Function called when manually syncing the courses
function syncData() {
	ShowDefaultLoadingImage("Syncing in Progress");
	updateCoursesOnSync = true;
	loadCoursesFromService();
	printLog("inside syncData .....");
	coursesToBeSynced = JSON.parse(localStorage.getItem("coursesToBeSynced"));
	printLog("coursestobesynced===========================" + coursesToBeSynced);

	try {
		if(coursesToBeSynced != null) {
			if(coursesToBeSynced.length) {
				printLog("coursesToBeSynced ..... "+ coursesToBeSynced +"coursesToBeSynced length..... " + coursesToBeSynced.length);
				$.each(coursesToBeSynced,function(cTBSIndex,cTBSValue){
					getScromObjectDataForSync(cTBSValue);
				});
			}
			else {
				HideDefaultLoadingImage();
				$("#syncSuccess2").simpledialog2();
			}
		}
		else {
			HideDefaultLoadingImage();
			$("#syncSuccess2").simpledialog2();
		}
	}
	catch(e) {
		HideDefaultLoadingImage();
		$("#syncFailed").simpledialog2();
	}
}

//Request to fetch course completion details when trying to sync 
function getScromObjectDataForSync(systemId) {
	var options = {};
	options.url = "courseLaunch.srv";
	options.type = "POST";
	options.dataType = "xml";
	options.contentType = "text/plain";
	options.callback = "ProcessGetScromObjectDataForSync";
	options.async = true;
	var params = [];
	params = [localStorage.getItem('userId'), localStorage.getItem('siteCompanyName'), localStorage.getItem('siteID'), systemId]; 
	options.data = buildXMLrequest('getParamConsole', params);
	printLog('options.data ....getScromObjectData.. ' + options.data);
	printLog('options.data ....systemId.. ' + systemId);
	CallWebservice(options, "getParamConsole Manual Sync");
}

function ProcessGetScromObjectDataForSync(xml) {
	printLog("Scrom Object Response XML " + JSON.stringify($.xml2json(xml)));
	if(xml != undefined){
		var jasonObject = $.xml2json(xml);
		var jsonReturn = jasonObject.Body.getParamConsoleResponse.return;
		printLog("jsonReturn>> " + JSON.stringify(jsonReturn));
		var aEventId = -1;
		var ldtEventId = -1;
		var stEventId = -1;
		var qsEventId = -1;
		if(jsonReturn.lrnResponse.success) {
			if(!(jsonReturn.mobileAiccCourseStateDTO == undefined || 
					jsonReturn.mobileAiccCourseStateDTO == null || 
					jsonReturn.mobileAiccCourseStateDTO == "" || 
					jsonReturn.mobileAiccCourseStateDTO == 'undefined' || 
					jsonReturn.mobileAiccCourseStateDTO == 'null')) {
				printLog("inside jsonReturn.mobileAiccCourseStateDTO>> ");
				aEventId = jsonReturn.mobileAiccCourseStateDTO.aiccEventsId;
				printLog("aEventId " + aEventId);
			}
			if(!(jsonReturn.mobileCourseEventDTOList == undefined || 
					jsonReturn.mobileCourseEventDTOList == null || 
					jsonReturn.mobileCourseEventDTOList == "")) {
				$.each(jsonReturn.mobileCourseEventDTOList,function(mCEDListIndex,mCEDListValue){
					if(mCEDListValue.action == 'lessonsdonetime'){
						ldtEventId = mCEDListValue.courseEventId;
					} else if (mCEDListValue.action == 'sessions'){
						stEventId = mCEDListValue.courseEventId;
					} else if (mCEDListValue.action == 'quizscore'){
						qsEventId = mCEDListValue.courseEventId;
					}  
				});
				printLog("IDS " + ldtEventId + " " + stEventId + " " + qsEventId);
			}

			var params = { "aEventId": aEventId, "ldtEventId": ldtEventId, "stEventId": stEventId, 
					"qsEventId": qsEventId, "course": jsonReturn.course};
			printLog("aEventId " + aEventId);
			printLog("ldtEventId " + ldtEventId);
			printLog("stEventId " + stEventId);
			printLog("qsEventId " + qsEventId);
			printLog("course " + jsonReturn.course);
			syncCourseData(params);
		}
	}
}

//Request to send course completion details 
function syncCourseData(params) {
	var options = {};
	options.url = "courseUpdate.srv";
	options.type = "POST";
	options.dataType = "xml";
	options.contentType = "text/plain";
	options.callback = "ProcessSyncData";
	options.async = true;
	options.data = buildSaveScromXMLrequest('putParamConsole', params);
	printLog('options.data ....syncData.. ' + options.data);
	if(options.data != null) {
		CallWebservice(options, "putParamConsole");
	}
}

//Function used to build the xml request for the courseUpdate service 
function buildSaveScromXMLrequest(service, params) {
	printLog('inside buildSaveScromXMLrequest... ' + params["course"]);
	var course = params["course"];
	var userId = localStorage.getItem('userId');
	var siteId = localStorage.getItem('siteID');
	var company = localStorage.getItem('siteCompanyName') ;
	var scromObject = JSON.parse(localStorage.getItem("SCROM-" + course));
	printLog('before scromObject... ' + JSON.stringify(scromObject));
	if(course == localStorage.getItem("currentCourse")){
		scromObject = JSON.parse(localStorage.getItem('symphonyscorm'));
	}
	printLog('after scromObject... ' + JSON.stringify(scromObject));	
	if(scromObject != null) {
		var coreLesson = '';
		var lessonLocation = 'test';
		var lessonsDoneTime = 0;
		var sessionTime = 0;
		var quizScore = 0;
		var lessonStatus = '';
		try {
			$.each(scromObject.organizations.LRN.cmi.TEST,function(index,value) {
				if(index == 'cmi.core.lesson_location') {
					if(value.value != null) {
						lessonLocation = value.value;
					}
				} else if (index == 'cmi.core.total_time') {
					lessonsDoneTime = getTimeInMiliSeconds(value.value);
				} else if (index == 'cmi.core.session_time') {
					if(value.value != null) {
						sessionTime = getTimeInMiliSeconds(value.value);
					}
				} else if (index == 'cmi.suspend_data') {
					coreLesson = value.value;
				} else if (index == 'cmi.student_data.mastery_score') {
					quizScore = value.value;
				} else if (index == 'cmi.core.lesson_status') {
					if(value.value != null) {
						lessonStatus = value.value;
					}
				}
			});
			printLog('coreLesson: ' + coreLesson + " lessonLocation: " + lessonLocation);
			printLog('lessonsDoneTime: ' + lessonsDoneTime + " sessionTime: " + sessionTime);
			printLog('quizScore: ' + quizScore + " lessonStatus: " + lessonStatus);

			generateWsseToken();
			var cDate = getFormattedCurrentDate();
			var addedMin = addMinutes(1);
			printLog('Date after one minute  parse...... ' + cDate);
			var requestXml = '<soapenv:Envelope xmlns:ser="http://service.lrn.com/" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">' + '<soapenv:Header>' + '<wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' + '<wsu:Timestamp >' + '<wsu:Created>' + cDate + '</wsu:Created>' + '<wsu:Expires>' + addedMin + '</wsu:Expires>' + '</wsu:Timestamp>' + '<wsse:UsernameToken >' + '<wsse:Username>188</wsse:Username>' + '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">test</wsse:Password>' + '<wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">' + returnNonce + '</wsse:Nonce>' + '</wsse:UsernameToken>' + '</wsse:Security>' + '</soapenv:Header>' + '<soapenv:Body>';
			requestXml += '<ser:' + service + '>';
			requestXml += '<arg0>';
			requestXml += '<aiccCourseStateDTO><aiccEventsId>' + params["aEventId"] + '</aiccEventsId>';
			requestXml += '<coreLesson>' + coreLesson + '</coreLesson>';
			requestXml += '<lessonLocation>' + lessonLocation + '</lessonLocation></aiccCourseStateDTO>';
			requestXml += '<company>' + company + '</company>';
			requestXml += '<course>' + course + '</course>';
			requestXml += '<courseEventsDTO><action>lessonsdonetime</action>';
			requestXml += '<courseEventId>' + params["ldtEventId"] + '</courseEventId>';
			requestXml += '<value>' + lessonsDoneTime +'</value></courseEventsDTO>'; 
			requestXml += '<courseEventsDTO><action>sessions</action>';
			requestXml += '<courseEventId>' + params["stEventId"] + '</courseEventId>';
			requestXml += '<value>' + sessionTime +'</value></courseEventsDTO>'; 
			requestXml += '<courseEventsDTO><action>quizscore</action>';
			requestXml += '<courseEventId>' + params["qsEventId"] + '</courseEventId>';
			requestXml += '<value>' + quizScore +'</value></courseEventsDTO>';
			requestXml += '<lessonStatus>' + lessonStatus + '</lessonStatus>';
			requestXml += '<mediaLastModifiedDate></mediaLastModifiedDate>';
			requestXml += '<userId>' + userId + '</userId>';
			requestXml += '</arg0>';
			requestXml += '<arg1>' + siteId + '</arg1>';
			requestXml += '</ser:' + service + '>' + '</soapenv:Body>' + '</soapenv:Envelope>';
			var $xml = requestXml;
			return requestXml;
		}
		catch(e) {
			printLog("Error in CMI TEst: " + e);
			HideDefaultLoadingImage();
			$("#syncSuccessPop").simpledialog2();
		}
	}
	return null;
}

function ProcessSyncData(xml) {
	if(xml != undefined){
		var jasonObject = $.xml2json(xml);		
		printLog("ProcessSyncData jasonObject>> " + JSON.stringify(jasonObject));
		var jsonReturn = jasonObject.Body.putParamConsoleResponse.return;
		if(jsonReturn.lrnResponse.success) {
			HideDefaultLoadingImage();
			$("#syncSuccessPop").simpledialog2();
			var presentTime = new Date();
			localStorage.setItem("settings_rowLastSynced", presentTime.toString().substr(4, 3)+" "+ presentTime.getDate()+", "+presentTime.getFullYear()+" "+presentTime.toString().substr(16, 8));
			localStorage.setItem("settings_lastSynced", presentTime.toString().substr(4, 3)+" "+ presentTime.getDate()+", "+presentTime.getFullYear());

			printLog("sync Success--------------------------------------------");
			$("#rowLastSyncTime").empty();
			$("#rowLastSyncTime").append("Last Sync: " + localStorage.getItem("settings_rowLastSynced"));
		}
	}
}

function getTimeInMiliSeconds(time) {
	printLog("time in getTimeInMiliSeconds " + time);
	var convertedTime = 0;
	if(time.split('.')[1] != null) {
		var timeWMSeconds = time.split('.')[0];
		convertedTime=(Number(timeWMSeconds.split(':')[0])*60*60 + Number(timeWMSeconds.split(':')[1])*60
				+ Number(timeWMSeconds.split(':')[2]))*1000;
		convertedTime = convertedTime + Number(time.split('.')[1]);
	} else {
		convertedTime=(Number(time.split(':')[0])*60*60 + Number(time.split(':')[1])*60 
				+ Number(time.split(':')[2]))*1000;
	}
	printLog("convertedTime in getTimeInMiliSeconds " + convertedTime);
	return convertedTime;
}

function getTime(time) {
	printLog("time in getTime " + time);
	var convertedTime = "";
	var hrs = Math.floor(4514001 / (60 * 60 * 1000));
	time = time - hrs * 60 * 60 * 1000;
	var mins = Math.floor(time / (60 * 1000));
	time = time - mins * 60 * 1000;
	var seconds = Math.floor(time / 1000);
	var miliSeconds = time - seconds * 1000;
	convertedTime = hrs + ":" + mins + ":" + seconds + "." + miliSeconds ;
	printLog("convertedTime in getTime " + convertedTime);
	return convertedTime;
}