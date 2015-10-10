var db = null;
var downloadArray = new Array();
var deleteArray = new Array();
var deleted = false;
var autoDownloadSettings = 0;
function onBodyLoad() {
    initDb();
    createTables();
}

function querySuccess(tx, results) {
    downloadArray = [];
    var autoDelete = getValue('autoDelete');
    console.log("AUTO DELETE----" + autoDelete == 1)

        if (typeof results == 'undefined' || results == null || results.rows.length == 0) {
        var _UpdateUserInterface = new UpdateUserInterface($.mobile.activePage.attr('id'), '');
        _UpdateUserInterface.update();
    }

    for (var i = 0; i < results.rows.length; i++) {

        var downloadId = results.rows.item(i).LRN_id;
        var downloadProgress = results.rows.item(i).LRN_progress;
        var downloadStatus = results.rows.item(i).LRN_status;
        if (results.rows.item(i).LRN_progress == '100') {
            downloadArray.push(downloadId);
            if (downloadStatus == "finished") {
                $('#download' + downloadId).css('display', 'none');
                $("#downloaded" + downloadId).css('display', 'inline-block');
                $('#online' + downloadId).css('display', 'none');
                $('#offline' + downloadId).css('display', 'inline-block');
            }
        } else {
            if (downloadStatus == "paused") {
                $("#download" + downloadId).hide();
                $("#resume" + downloadId).show();
                $("#cancel" + downloadId).show();
            }
        }

        if (autoDelete == 1 && globalSync == true) {

            for (var j = 0; j < sourceArray.length; j++) {

                if (downloadId == sourceArray[j].split("|")[1]) {

                    deleteDownload(sourceArray[j].split("|")[0], downloadId);
                }
            }
        }
    }
}

function errorCBINSERT(e) {}
function queryDb() {
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM MYLRNCOURSESV1', [], querySuccess, errorCB);
    });
}
function errorCB(tx, error) {
    console.log("====Some Unexpected Error in DB=====");
    console.log(error.message);

}
function initDb() {
    console.log("Initializing DB");

    db = window.openDatabase(DB_NAME, DB_VERSION, DB_TITLE, DB_BYTES);
    return db;
}
function createTables() {
    createTable();
    createSettingsTable();
    createSyncTable();
    createUserCredentialTable();
    //createHistoryTable();
    createSiteConfigTable();
    createCompletionStatusTable();
    clearCompletionStatusTable();
    setDefaultSettings();
    createModuleResponseTable();
    createLogsTable();
    createHistoryStatus();
}
function setDefaultSettings() {
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM MYSETTINGS', [], function(tx, results) {
            console.log(results);
            if (typeof results == 'undefined' || results == null || results.rows.length == 0) {
                console.log("default settings..");
                db.transaction(function(tx) {
                    tx.executeSql('INSERT INTO MYSETTINGS (LRN_download, LRN_delete,LRN_wifi,LRN_module) VALUES (0,0,1,1)');
                });
            }
        });
    });
}
function createTable() {
    setTimeout(function() {
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS MYLRNCOURSESV1(LRN_id unique, LRN_progress,LRN_status)');
        });
    }, 600);
}
function createSyncTable() {
    setTimeout(function() {
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS MYSYNC(LRN_id,LRN_syncoption, LRN_lastsync)');
        });
    }, 600);
}
function insertValues() {

    for (var i = 0; i < statesArray.length; i++) {
        var index = statesArray[i].toString().split('|')[0];
        var progress = statesArray[i].toString().split('|')[1];
        var status = statesArray[i].toString().split('|')[2];

        db.transaction(function(tx) {
            tx.executeSql("INSERT INTO MYLRNCOURSESV1 (LRN_id, LRN_progress,LRN_status) VALUES (?, ?, ?)", [index, progress, status], function(tx, result) {
                queryDb();

            }, errorCBINSERT);

        });

    }
}
function createSettingsTable() {
    console.log('create settings table');
    setTimeout(function() {
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS MYSETTINGS(LRN_download, LRN_delete,LRN_wifi,LRN_module)');
        });
    }, 0);
}
function querySettingsDb() {
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM MYSETTINGS', [], querySuccessSettings, errorCB);
    });
}
function querySuccessSettings(tx, results) {
    for (var i = 0; i < results.rows.length; i++) {

        $("#autoDownload").val(results.rows.item(i).LRN_download).slider('refresh');
        $("#autoDelete").val(results.rows.item(i).LRN_delete).slider('refresh');
        $("#wifiDownload").val(results.rows.item(i).LRN_wifi).slider('refresh');
        $("#moduleNotification").val(results.rows.item(i).LRN_module).slider('refresh');

    }
}

function insertSettingsData() {
    var autoDownload = getValue('autoDownload');
    var autoDelete = getValue('autoDelete');
    var wifiDownload = getValue('wifiDownload');
    var moduleNotification = getValue('moduleNotification');
    var strQ = "DELETE FROM MYSETTINGS";
    localStorage.setItem('LRN_delete', autoDelete);
    localStorage.setItem('LRN_wifi', wifiDownload);
    localStorage.setItem('LRN_autodownload', autoDownload);
    db.transaction(function(tx) {
        tx.executeSql(strQ);
    });
    db.transaction(function(tx) {
        tx.executeSql('INSERT INTO MYSETTINGS (LRN_download, LRN_delete,LRN_wifi,LRN_module) VALUES (' + autoDownload + ',' + autoDelete + ',' + wifiDownload + ',' + moduleNotification + ')');
    });
}
function getValue(controlIDStr) {
    var controlVal = $("#" + controlIDStr).val();
    return controlVal;
}
function insertSyncData() {
    var id = '1';
    var strQ = "SELECT *  FROM MYSYNC";
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM MYSYNC', [], querySuccessSync, errorCB);
    });
}
function querySuccessSync(tx, results) {
    var length = results.rows.length;
    var id = length.toString();
    var syncOption = $("#syncFreq").val();
    localStorage.setItem('syncOption', syncOption);
    syncOption = "'" + syncOption + "'";
    var lastSync = new Date();
    var date = lastSync.getDate();
    var month = lastSync.getMonth();
    var year = lastSync.getFullYear();
    var hours = lastSync.getHours();

    lastSync = (month + 1) + "/" + date + "/" + year + " " + hours + ':' + lastSync.getMinutes();

    lastSync = "'" + lastSync + "'";
    console.log("length of sync table" + length);
    if (length != '0') {
        var qStr;
        if (refresh_global == 1) {
            qStr = "UPDATE MYSYNC SET  LRN_lastsync=" + lastSync + " WHERE LRN_id='0'";

        } else {
            console.log(syncOption + "In else");
            qStr = "UPDATE MYSYNC SET LRN_syncoption=" + syncOption + " WHERE LRN_id='0'";
        }
        console.log(qStr);
        db.transaction(function(tx) {
            tx.executeSql(qStr, [], insertSuccess, errorCBINSERT);
        });
    } else {

        syncOption = '6';
        syncOption = "'" + syncOption + "'";
        length = "'" + length + "'";
        var qStr = 'INSERT INTO MYSYNC (LRN_id, LRN_syncoption, LRN_lastsync) VALUES (' + length + ',' + syncOption + ',' + lastSync + ')';
        console.log(qStr);
        db.transaction(function(tx) {
            tx.executeSql(qStr);
        });
    }
    retrieveLastSync();
}
function insertSuccess(tx) {

    console.log('Inserted Successfully');
}
function retrieveLastSync() {
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM MYSYNC', [], SuccessSync, errorCB);
    });
}
function SuccessSync(tx, results) {
    var length = results.rows.length;
    if (results.rows.length != 0) {
        for (var i = 0; i < length; i++) {
            $("#syncFreq").val(results.rows.item(i).LRN_syncoption).selectmenu('refresh');
            $("#lastSync").empty();
            $("#lastSync").append(results.rows.item(i).LRN_lastsync.split(' ')[0]);

        }
    } else {
        insertSyncData();
    }
}
function createSiteConfigTable() {
    setTimeout(function() {
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS SITECONFIGS(LRN_SiteID,LRN_MethodName,LRN_XMLDataResponse)');
        });
    }, 0);
}
function insertSiteConfigData(siteID, methodName, xmlData) {
    db.transaction(function(tx) {
        tx.executeSql("INSERT INTO SITECONFIGS(LRN_SiteID,LRN_MethodName,LRN_XMLDataResponse) VALUES (?, ?, ?)", [siteID, methodName, xmlData], function(tx, result) {});
    });
}
function clearSiteConfigData() {
    var strQ = "DELETE  FROM SITECONFIGS";
    db.transaction(function(tx) {
        tx.executeSql(strQ);
    });
//    localStorage.setItem('getUserAssignedModulesResponse', "");
    localStorage.setItem("siteID", null);
    localStorage.setItem("siteName", null);
}
function createUserCredentialTable() {
    setTimeout(function() {
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS MYCREDENTIAL(LRN_Username,LRN_password,LRN_language)');
        });
    }, 0);
}
function insertUserCredential(userName, password, language) {
    var strQ = "DELETE  FROM MYCREDENTIAL";
    db.transaction(function(tx) {
        tx.executeSql(strQ);
    });
    db.transaction(function(tx) {
        tx.executeSql('INSERT INTO MYCREDENTIAL (LRN_Username,LRN_password,LRN_language) VALUES ("' + userName + '","' + password + '","' + language + '")');
    });
}
function deleteCourse(index) {
    console.log("Dleted file" + index);
    var morethanOneArr = [];
    $.each(downloadArray, function(key, val) {
        if (val.indexOf(index) == 0) {
            morethanOneArr.push(val);
        }
    });
    console.log("morethanOneArr" + morethanOneArr);
    downloadArray = jQuery.grep(downloadArray, function(val) {
        return val.indexOf(index) != 0;
    });
    $.each(morethanOneArr, function(key, val) {
        var indexTobepassed = "'" + val + "'";
        var strQ = "DELETE FROM MYLRNCOURSESV1 WHERE LRN_id=" + indexTobepassed;
        db.transaction(function(tx) {
            tx.executeSql(strQ, [], function deleteSuccess() {
                var urlExists = false;
                $.grep(deleteArray, function(value) {
                    if (value == index) {
                        urlExists = true;
                    }
                });

                if (!urlExists) {
                    deleteArray.push(index);
                }
                loadDownloadedModules();
                var _UpdateUserInterface = new UpdateUserInterface($.mobile.activePage.attr('id'), '');
                _UpdateUserInterface.update();

            }, errorCBDELETE);
        });
    });
    return deleted;
}

function errorCBDELETE() {}
function createHistoryTable() {
    var strQ = "DROP  TABLE MYHISTORY";
    db.transaction(function(tx) {
        tx.executeSql(strQ);
    });
    setTimeout(function() {
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS MYHISTORY(HIS_index,HIS_title,HIS_catlogId,HIS_timeSpent,HIS_completedDate,HIS_synced,HIS_description,HIS_curriculamId,HIS_systemId)');
        });
    }, 0);
    queryDb();
}
function insertHistoryTable(index, title, catlogId, desc, curriculamId, systemId) {

    db.transaction(function(tx) {
        tx.executeSql('INSERT INTO MYHISTORY (HIS_index,HIS_title,HIS_catlogId,HIS_timeSpent,HIS_completedDate,HIS_synced,HIS_description,HIS_curriculamId,HIS_systemId) VALUES ("' + index + '","' + title + '","' + catlogId + '","00:31:33","03/27/2013","ture","' + desc + '","' + curriculamId + '","' + systemId + '")');
    });
}
function queryHistoryDb() {
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM MYHISTORY', [], querySuccessHistory, errorCB);
    });
}
function deleteHistoryDb() {
    var strQ = "DELETE  FROM MYHISTORY";
    db.transaction(function(tx) {
        tx.executeSql(strQ);
    });
}
function querySuccessHistory(tx, results) {
    var html = '';

    for (var i = 0; i < results.rows.length; i++) {
        var moduleId = results.rows.item(i).HIS_index;
        var curriculumId = results.rows.item(i).HIS_curriculamId;
        var systemID = results.rows.item(i).HIS_systemId;
        html += '<div id="dvcollapsibleHistory" class="collapsibleHistory" data-collapsed="true" data-role="collapsible" data-content-theme="c" data-iconpos="right">';
        html += '<h3 class="module-row-details"><span id="title" class="title">' + results.rows.item(i).HIS_title + '</span>';
        html += '<span id="categoryId" >' + results.rows.item(i).HIS_catlogId + '</span>';
        html += '<span id="timespent" >' + results.rows.item(i).HIS_timeSpent + '</span>';
        html += '<span id="completed" >' + results.rows.item(i).HIS_completedDate + '</span>';
        html += '<span id="sync" ><div class="check-icon">&nbsp;</div></span>';
        html += ' <span id="moduleOption"><a id="historyPreviewModule" onclick="setDownloadParams(&#39;' + source + '&#39;,&#39;' + index + '&#39;); getPreviewData(&#39;' + curriculumId + '&#39;,&#39;' + moduleId + '&#39;,&#39;' + systemID + '&#39;);" class="view-module-btn">View Module Again</a></span>';
        html += '</h3>';
        html += '<div class="historyImageHolder"><img src="images/app/no-preview.jpg" ></div>';
        html += '<div class="historyDescHolder"><p>' + results.rows.item(i).HIS_description + '</p></div>';
        html += '</div>';
    }
    $(".noModule").hide();
    $("#historyData").html(html);
    $('#historyData').trigger("create");
    setTimeout(function() {
        if (typeof historyScroller != 'undefined') {
            historyScroller.refresh();
        }
    }, 200);
}

function setCompanyLogoImage(siteID) {
    db.transaction(function(tx) {
        tx.executeSql('SELECT LRN_MethodName, LRN_XMLDataResponse FROM SITECONFIGS Where LRN_SiteID = ? ', [siteID], function(tx, results) {
            if (results != null && results.rows.length > 0) {
                var xmlData = "";
                var hostName = "";
                var imgPath = "";
                for (var i = 0; i < results.rows.length; i++) {
                    if (results.rows.item(i).LRN_MethodName == "getInfoResponse") {
                        xmlData = results.rows.item(i).LRN_XMLDataResponse;
                        hostName = $(xmlData).find("ns1\\:getInfoResponse").find("ns1\\:out").find("host").text();
                    }
                    if (results.rows.item(i).LRN_MethodName == "getSiteBrandingResponse") {
                        xmlData = results.rows.item(i).LRN_XMLDataResponse;
                        imgPath = $(xmlData).find("ns1\\:getSiteBrandingResponse").find("ns1\\:out").find("dataObject").find("logo").text();
                    }

                }
                //console.log("navigator.onLine : " + navigator.onLine);
                if (navigator.onLine != null && navigator.onLine == true) {
                    localStorage.setItem("companyLogo", "https://" + hostName + ".lrn.com" + imgPath + "");
                } else {
                    localStorage.setItem("companyLogo", localHostName + localStorage.getItem('siteID') + "/images/LOGO_S.gif");
                }
            }
        }, errorCB);
    });

}
function updateModuleData(siteID, XMLdoc) {

    var qStr = "UPDATE SITECONFIGS SET LRN_XMLDataResponse = " + XMLdoc + " WHERE LRN_SiteID=" + siteID + " AND LRN_MethodName = getUserAssignedModules ";

    db.transaction(function(tx) {
        tx.executeSql(qStr, function(tx, results) {
            console.log(results);
        }, errorCB);
    });
}

function errorCBS() {
    console.log('error');
}

function createCompletionStatusTable() {
    setTimeout(function() {
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS COMPLETION_STATUS(LRN_SITEID,LRN_USERID,LRN_MODULEID, LRN_STATUS)');
        });
    }, 0);
}

function insertCompletionStatusData(siteID, userID, moduleID, status) {
    db.transaction(function(tx) {
        tx.executeSql("INSERT INTO COMPLETION_STATUS(LRN_SITEID,LRN_USERID,LRN_MODULEID, LRN_STATUS) VALUES (?, ?, ?, ?)", [siteID, userID, moduleID, status], function(tx, result) {
            //console.log(result);
            getCompletionStatusofModule(moduleID, 'landingPage');
        });
    });
}

function clearCompletionStatusTable() {
    var strQ = "DELETE  FROM COMPLETION_STATUS";
    db.transaction(function(tx) {
        tx.executeSql(strQ);
    });
}

function setCounter() {
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM MYSYNC', [], function SuccessSync(tx, results) {
            var currentTime = new Date();
            var date = currentTime.getDate();
            var month = currentTime.getMonth();
            var year = currentTime.getFullYear();
            var hours = currentTime.getHours();

            currentTime = (month + 1) + "/" + date + "/" + year + " " + hours + ':' + currentTime.getMinutes();
            syncOption = localStorage.getItem('syncOption');

            lastSync = currentTime;
            if (results.rows.length > 0) {
                lastSync = results.rows.item(0).LRN_lastsync;
                syncOption = results.rows.item(0).LRN_syncoption;
            }
            console.log("setting counter-----");
            counter = 60 * syncOption;
            var diff = new Date(currentTime) - new Date(lastSync);
            console.log('currentTime-----' + currentTime);
            console.log('lastSync-----' + lastSync);
            var diffSeconds = diff / 1000;
            var diffhours = Math.floor(diffSeconds / 3600);
            var diffMinutes = Math.floor(diffSeconds % 3600) / 60;

            if (diffhours != 0)
                syncTimer = diffhours * 60 + diffMinutes;
            else
                syncTimer = diffMinutes;
            console.log('Synctimer---------' + syncTimer);

            syncTimer = (syncTimer < 0) ? (0) : (syncTimer);

        }, errorCB);
    });

}
function deleteAll(tableName) {
    console.log("Deleting table===" + tableName);
    db.transaction(function(tx) {
        tx.executeSql('DELETE  FROM ' + tableName, [], function deleted() {
            console.log('-----deleted-----');
        }, errorCB);
    });
}
function deleteAllTables() {
    $.each(allTables, function(index, element) {
        db.transaction(function(tx) {
            tx.executeSql('DELETE  FROM ' + element, [], function deleted() {
                console.log('-----deleted-----');
            }, errorCB);
        });
    });
}

function createModuleResponseTable() {
    setTimeout(function() {
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS MODULERESPONSES(LRN_SITEID, LRN_USERID, LRN_CURRICULUMID, LRN_MODULEID, LRN_SYSTEMID, LRN_RESPONSE)');
            //tx.executeSql('DROP TABLE MODULERESPONSES');
            });
    }, 0);

}

function GetModuleResponse(siteID, userID, curriculumID, moduleID, systemId) {
    var options = {};
    clearModuleResponse();
    if (dummyServices == 1) {
        $.get(localHostName + siteID + "/getModulePreviewResponse" + curriculumID + systemId + ".xml", function(response) {
            if (typeof response != 'undefined' && response != null) {
                var result = new XMLSerializer().serializeToString(response);
                insertModuleResponse(siteID, userID, curriculumID, moduleID, systemId, result);
            }
        });
    } else {
        try {
            db.transaction(function(tx) {
                tx.executeSql('SELECT LRN_RESPONSE FROM MODULERESPONSES Where LRN_SITEID = ? AND LRN_USERID = ? AND LRN_CURRICULUMID = ? AND LRN_MODULEID = ? AND LRN_SYSTEMID = ? ', [siteID, userID, curriculumID, moduleID, systemId], function(tx, results) {
                    //alert(results.rows.length);
                    if (results.rows.length == 0) {
                        console.log("======Getting Module Preview response=======");
                        options.url = "module.srv";
                        // set webservice url
                        options.type = "POST";
                        // GET or POST
                        options.dataType = "xml";
                        // return type of data coming from server
                        options.contentType = "text/xml";
                        // request type of data send to server
                        options.callback = function(response) {
                            if (typeof response != 'undefined' && response != null) {
                                var result = new XMLSerializer().serializeToString(response);
                                insertModuleResponse(siteID, userID, curriculumID, moduleID, systemId, result);
                            } else
                                console.log("======Error inserting module preview response=====");

                        };
                        // callback function which will process the response
                        var params = [];
                        //Long siteId, String userId,Long curriculumId, String systemId, String company

                        //params = [siteID, userID, curriculumID, systemId, '', '', "0001-01-01T00:00:00"];
                        params = [userID, curriculumID, systemId, localStorage.getItem('siteCompanyName')];
                        console.log("params to send :" +params[0]+params[1]+params[2]+params[3]);
                        options.data = buildXMLrequest('getModulePreview', params);
                        // data required to call service i.e parameters
                        CallWebservice(options, "GetModuleResponse(siteID, userID, curriculumID, moduleID, systemId)");
                    }
                });
            });
        } catch(e) {
            DoLogging("exception", "Module Preview", e.stack);
            return false;
        }
    }
}
function clearModuleResponse() {
    db.transaction(function(tx) {
        tx.executeSql('DELETE FROM MODULERESPONSES');
    });
}
function insertModuleResponse(siteID, userID, curriculumID, moduleID, systemId, responseData) {
    console.log("==========Inserting module preview response into DB=========");
    db.transaction(function(tx) {
        tx.executeSql('SELECT LRN_RESPONSE FROM MODULERESPONSES Where LRN_SITEID = ? AND LRN_USERID = ? AND LRN_CURRICULUMID = ? AND LRN_MODULEID = ? AND LRN_SYSTEMID = ? ', [siteID, userID, curriculumID, moduleID, systemId], function(tx, results) {
            if (results.rows.length == 0) {
                tx.executeSql("INSERT INTO MODULERESPONSES(LRN_SITEID, LRN_USERID, LRN_CURRICULUMID, LRN_MODULEID, LRN_SYSTEMID, LRN_RESPONSE) VALUES (?, ?, ?, ?, ?, ?)", [siteID, userID, curriculumID, moduleID, systemId, responseData], function(tx, result) {}, function(err) {
                    console.log(err);
                });
            }
        });
    });
}

function GetModulePreviewDescription(siteID, userID, curriculumID, moduleID, systemId) {
    console.log("GetModulePreviewDescription - curriculumID: "+ curriculumID +" moduleID :"+moduleID +"systemId :"+systemId);
    var notFound = true;
    iScrollHelper();
    $.mobile.loading("hide");
    $("#moduleList").empty();
    $("#downloadButtons").empty();
    for (i = 0; i < modulesContainer.length; i++) {
        var NoPrevCurrSysId = "";
        NoPrevCurrSysId = modulesContainer[i].split("|")[0] + "|" + modulesContainer[i].split("|")[1];
        if (NoPrevCurrSysId == curriculumID + "|" + systemId) {

            var thumbNail = "images/app/no-preview.jpg";
            if (thumbNail == "")
                thumbNail = "images/app/no-preview.jpg";
            var modulePId = modulesContainer[i].split("|")[2];
            var desc = modulesContainer[i].split("|")[3];
            if (desc == "")
                desc = "No contents are available for this module";

            var pageTitle = modulesContainer[i].split("|")[4];
            var catalogId = modulesContainer[i].split("|")[5];
            if (_courseType == "mandatory") {

                var dueDate1 = modulesContainer[i].split("|")[6];
                if (dueDate1 != '' && dueDate1.toString() != 'null')
                    dueDate = formatDate(dueDate1).format("mmm d, yyyy");

            } else if (_courseType == "optional") {
                var dueDate = "";
            }

            var mediaType = modulesContainer[i].split("|")[7];
            var mcourceIndex = modulesContainer[i].split("|")[8];
            var source = modulesContainer[i].split("|")[9];
            var coursePath = modulesContainer[i].split("|")[9];
            var catalystInnerBody = '';
            catalystInnerBody = '<li class="cdalign">';
            catalystInnerBody += '<span class="moduleTitle_top">' + pageTitle + '</span><div><span class="moduleDueDate_top">Due ' + dueDate + ' | ' + catalogId + '</span></div>';
            catalystInnerBody += '<div class="cat-box" data-cat-name="Catalyst1">';
            catalystInnerBody += '<p class="mpImageWidth"><img src="' + thumbNail + '"></p>';
            catalystInnerBody += '<div class="orange-band"> <div class="video-title"> <div style="display:none;"> ' + pageTitle + '</div>';
            if (_courseType == "mandatory") {
                catalystInnerBody += '<span style="display:none;"">Due' + dueDate + '</span> ';
            }
            catalystInnerBody += '</div><div class="download-btn">';
            catalystInnerBody += '<div  style="display:none;width:100%;height:10px;border-radius:10px;padding:0 !important" id="progressPreview' + mcourceIndex + '" class="progress-module-preview progressPreview' + mcourceIndex + '"></div> ';
            catalystInnerBody += '<div class="btns-container">';
            catalystInnerBody += '<div class="btns-left">';
            if ($.inArray(mcourceIndex, downloadArray) > -1) {
                catalystInnerBody += '<div class="btn-download-offline downloadAvailablity downloadOfflineColor availableOfflineModulepreview"  id="offlineincat' + mcourceIndex + '"  style="display:inline-block;"><span class="DownloadOfflineClose-btn"></span>Downloaded</div>';
                catalystInnerBody += '<div class="btn-download-offline downloadAvailablity downloadOnlineColor availableOnlineModulepreview" id="onlineincat' + mcourceIndex + '" ><span class="DownloadOfflineClose-btn"></span>Available Online</div>';
                catalystInnerBody += '<div class="btn-download btn-downloadModulePreview download' + mcourceIndex + '" data-index="' + mcourceIndex + '" data-source="' + source + '"  id="downloadButtonsModulePreview' + mcourceIndex + '" style="display:none;"><div class="downloadImg"></div><div class="downloadTxt">Download</div> <div class="downloadStatus">(88 MB)</div></div>';
            } else {
                catalystInnerBody += '<div class="btn-download-offline downloadAvailablity downloadOfflineColor availableOfflineModulepreview"  id="offlineincat' + mcourceIndex + '"  style="display:none;"><span class="DownloadOfflineClose-btn"></span>Downloaded</div>';
                catalystInnerBody += '<div class="btn-download-offline downloadAvailablity downloadOnlineColor availableOnlineModulepreview" id="onlineincat' + mcourceIndex + '" ><span class="DownloadOfflineClose-btn"></span>Available Online</div>';
                catalystInnerBody += '<div class="btn-download btn-downloadModulePreview download' + mcourceIndex + '" data-index="' + mcourceIndex + '" data-source="' + source + '"  id="downloadButtonsModulePreview' + mcourceIndex + '" style="display:inline-block;"><div class="downloadImg"></div><div class="downloadTxt">Download</div> <div class="downloadStatus">(88 MB)</div></div>';
            }
            catalystInnerBody += '<div class="btn-download-cancel cancelPreview' + mcourceIndex + '" data-source="' + source + '"  id="cancelPreview' + mcourceIndex + '" onclick="cancelDownload(&#39;' + source + '&#39;,&#39;' + mcourceIndex + '&#39;)" style="display:none">Cancel</div>';
            catalystInnerBody += '<div class="btn-download-pause pausePreview' + mcourceIndex + '" data-source="' + source + '"  id="pausePreview' + mcourceIndex + '" onclick="pauseDownload(&#39;' + source + '&#39;,&#39;' + mcourceIndex + '&#39;)" style="display:none">Pause</div>';
            catalystInnerBody += '<div class="btn-download-resume resumePreview' + mcourceIndex + '" data-source="' + source + '"  id="resumePreview' + mcourceIndex + '" onclick="resumeDownload(&#39;' + source + '&#39;,&#39;' + mcourceIndex + '&#39;)" style="display:none">Resume</div>';
            catalystInnerBody += '</div>';
            catalystInnerBody += '<div class="status-right">';
            catalystInnerBody += '<div style="display:inline-block;" id="statusPreview' + mcourceIndex + '" class="status-module-preview statusPreview' + mcourceIndex + '"></div>';
            catalystInnerBody += '</div>';
            catalystInnerBody += '</div>';
            catalystInnerBody += '</div></div>';
            catalystInnerBody += '</div>';
            catalystInnerBody += '</div>';
            catalystInnerBody += '<div class="languageToDownload languageToDownload' + mcourceIndex + '"><select id="SelectLanguageGetStarted1" class="SelectLanguageToDownload"><optgroup name="loc_selLanguage" label="Select Language to Download"><option value="en" name="loc_english" selected="selected">English</option><option value="sp" name="loc_spanish">Spanish</option></select></div>';
            catalystInnerBody += '<div class="status-icon"><img class="imgStatus" id="imgStatus-preview-' + modulePId + '" src="images/app/new.png" /></div>';
            catalystInnerBody += '</div>';
            catalystInnerBody += '</li>';
            catalystInnerBody += '<li class="mpContentWidth"><div id="description">';
            catalystInnerBody += '<span class="moduleTitle_bottom">' + pageTitle + '</span><div>';
            if (_courseType == "mandatory") {
                catalystInnerBody += '<span class="moduleDueDate">Due' + dueDate + '</span>';
            }
            catalystInnerBody += '<span class="moduleDueDate"> | ' + catalogId + '</span></div></br>';
            catalystInnerBody += '<div id="moduleDescWrapper1"><div id="modulesPreview-scroller"><div class="product-img mpDescription">' + desc + '</div></div></div></br></br>';
            if (mediaType) {
                catalystInnerBody += '<span class="videoAudio" id="videoAudioId"><label><input type="radio" name="media" value="video" checked>Video</label><label><input type="radio" name="media" value="audio" class="mediaRadio">Audio</label><label><input type="radio" name="media" value="Accessible" class="mediaRadio">Accessible</label></span></br></br>';
            } else {
                catalystInnerBody += '<span class="videoAudio"><b>"Audio/Video option is not available for this module in stead you can directly view the module through scrom player"</b></span>';
            }
            catalystInnerBody += '<span  class="selLanGetStarted" style="display:none"><select class="SelectLanguageGetStarted"><optgroup name="loc_selLanguage" label="Select Language"><option value="en" name="loc_english" selected="selected">English</option><option value="sp" name="loc_spanish">Spanish</option></select><div class="modulesGetStarted" onclick="playCatalyst(&#39;' + coursePath + '&#39;,&#39;' + mcourceIndex + '&#39;)">Get Started</div></span>';
            catalystInnerBody += '</div></li>';

            $("#moduleList").append(catalystInnerBody);

            var _UpdateUserInterface = new UpdateUserInterface($.mobile.activePage.attr('id'), mcourceIndex);
            _UpdateUserInterface.update();
            setModulePreviewControlOnNewDownload(mcourceIndex);
            SwipePreviewLeftRight();
            setTimeout(function() {}, 0);

        }
    }

}
function createLogsTable() {
    db.transaction(function(tx) {
        tx.executeSql('DROP TABLE IF EXISTS LOGS');
    });
    setTimeout(function() {
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS LOGS(LOG_TYPE, LOG_FUNCTION, LOG_TRACE, LOG_TIME)');
        });
    }, 0);
}
function createHistoryStatus() {
    db.transaction(function(tx) {
        tx.executeSql('DROP TABLE IF EXISTS HISTORY_STATUS');
    });
    setTimeout(function() {
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS HISTORY_STATUS(LRN_SITEID,LRN_USERID,LRN_MODULEID,LRN_SYSTEMID,LRN_CURRICULAMID,LRN_CATLOGID,LRN_TIMESPENT,LRN_COMPLETIONDATE,LRN_TITLE,LRN_DESCRIPTION,LRN_SYNCEDDATE)');
        });
    }, 0);
}
function insertHistoryStatus(siteID, userID, moduleID, systemId, curriculumId, catalogId, timeSpent, completion, title, description, syncedDate) {
    db.transaction(function(tx) {
        tx.executeSql("INSERT INTO HISTORY_STATUS(LRN_SITEID,LRN_USERID,LRN_MODULEID,LRN_SYSTEMID,LRN_CURRICULAMID,LRN_CATLOGID,LRN_TIMESPENT,LRN_COMPLETIONDATE,LRN_TITLE,LRN_DESCRIPTION,LRN_SYNCEDDATE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [siteID, userID, moduleID, systemId, curriculumId, catalogId, timeSpent, completion, title, description, syncedDate], function(tx, result) {
            console.log("insertion" + result);
        });
    });
}