Type.createNamespace('Player');
Player.ScormVersion = function () {};
Player.ScormVersion.prototype = {
		v00: 0,
		v12: 1,
		v13: 2
}
Player.ScormVersion.createEnum('Player.ScormVersion', false);
Player.PersistentStateStorage = function (organizationIdentifier) {
	this.$0 = new LocalStorage.Storage();
	if (!this.$0.isSupported()) {
		this.$2 = false;
		alert('Error! Local Storage is not supported on this browser!');
		return;
	}
	if (!isNullOrUndefined(organizationIdentifier)) {
		this.$1 = organizationIdentifier;
	} else {
		this.$1 = 'unknown';
	}
	var $0 = {};
	if (!this.$0.hasKey('symphonyscorm')) {
		$0['organizations'] = {};
		$0['globalobjectives'] = {};
	} else {
		$0 = this.$0.getObjectItem('symphonyscorm');
	}
	var $1 = $0['organizations'];
	var $2;
	if (!Object.keyExists($1, this.$1)) {
		$2 = {};
		$1[this.$1] = $2;
	} else {
		$2 = $1[this.$1];
	} if (!Object.keyExists($2, 'resumeallidentifier')) {
		$2['resumeallidentifier'] = null;
	}
	if (!Object.keyExists($2, 'suspendedglobalobjectives')) {
		$2['suspendedglobalobjectives'] = null;
	}
	if (!Object.keyExists($2, 'statuses')) {
		$2['statuses'] = {};
	}
	if (!Object.keyExists($2, 'cmi')) {
		$2['cmi'] = {};
	}
	if (!Object.keyExists($2, 'adldata')) {
		$2['adldata'] = {};
	}
	this.$3($0);
	this.$2 = true;
}
Player.PersistentStateStorage.prototype = {
		$0: null,
		$1: null,
		$2: false,
		$3: function ($p0) {
			try {
				this.$0.setObjectItem('symphonyscorm', $p0);
				this.$2 = true;
			} catch ($0) {
				alert('Error! Can\'t save data to Local Storage. Problem can be related to storage size limit.');
				this.$2 = false;
			}
		},
		isSupported: function () {
			return this.$2;
		},
		getAllStatus: function () {
			var $0 = this.$0.getObjectItem('symphonyscorm');
			var $1 = $0['organizations'];
			var $2 = $1[this.$1];
			return $2['statuses'];
		},
		getResumeAllIdentifier: function () {
			var $0 = this.$0.getObjectItem('symphonyscorm');
			var $1 = $0['organizations'];
			var $2 = $1[this.$1];
			return $2['resumeallidentifier'];
		},
		getSuspendedGlobalObjectives: function () {
			var $0 = this.$0.getObjectItem('symphonyscorm');
			var $1 = $0['organizations'];
			var $2 = $1[this.$1];
			return $2['suspendedglobalobjectives'];
		},
		getADLData: function () {
			var $0 = this.$0.getObjectItem('symphonyscorm');
			var $1 = $0['organizations'];
			var $2 = $1[this.$1];
			return $2['adldata'];
		},
		saveState: function (adlData, stasuses, globalObjectives, resumeAllIdentifier, suspendedGlobalObjectives) {
			var $0 = this.$0.getObjectItem('symphonyscorm');
			var $1 = $0['organizations'];
			var $2 = $1[this.$1];
			if (!isNullOrUndefined(globalObjectives)) {
				$0['globalobjectives'] = globalObjectives;
			}
			$2['resumeallidentifier'] = resumeAllIdentifier;
			$2['suspendedglobalobjectives'] = suspendedGlobalObjectives;
			$2['adldata'] = adlData;
			$2['statuses'] = stasuses;
			this.$3($0);
		},
		saveItemCMI: function (itemIdentifier, dataTree) {
			var $0 = this.$0.getObjectItem('symphonyscorm');
			var $1 = $0['organizations'];
			var $2 = $1[this.$1];
			($2['cmi'])[itemIdentifier] = dataTree;
			this.$3($0);
		},
		getItemCMI: function (itemIdentifier) {
			var $0 = this.$0.getObjectItem('symphonyscorm');
			var $1 = $0['organizations'];
			var $2 = $1[this.$1];
			var $3 = ($2['cmi'])[itemIdentifier];
			return ($3 == null) ? {} : $3;
		},
		getAllObjectivesGlobaltoSystem: function () {
			var $0 = this.$0.getObjectItem('symphonyscorm');
			return $0['globalobjectives'];
		}
}
Player.ContentPlayer = function (manifestPath, imsmanifest, isStorage, isScormAuto, isDebug) {
	this.$2 = 0;
	this.$18 = [];
	if (isNullOrUndefined(imsmanifest)) {
		return;
	}
	this.$0 = imsmanifest;
	this.$A = manifestPath;
	this.$1 = isDebug;
	this.$2 = 0;
	var $0 = this.$0.getElementsByTagName('manifest');
	if (isNullOrUndefined($0) || $0.length !== 1) {
		return;
	}
	var $1 = $0[0];
	$0 = this.$0.getElementsByTagName('schemaversion');
	if (!isNullOrUndefined($0) && $0.length === 1) {
		if (API_BASE.BaseUtils.getText($0[0]) === '1.2') {
			this.$2 = 1;
		} else if (API_BASE.BaseUtils.getText($0[0]).toLowerCase().indexOf('1.3') >= 0 || API_BASE.BaseUtils.getText($0[0]).toLowerCase().indexOf('2004') >= 0) {
			this.$2 = 2;
		}
	} else {
		if (($1.attributes.getNamedItem('xmlns') != null && API_BASE.BaseUtils.getText($1.attributes.getNamedItem('xmlns')) === 'http://www.imsproject.org/xsd/imscp_rootv1p1p2') || ($1.attributes.getNamedItem('version') != null && API_BASE.BaseUtils.getText($1.attributes.getNamedItem('version')) === '1.1')) {
			this.$2 = 1;
		}
	} if (this.$2 === 0) {
		return;
	}
	$0 = this.$0.getElementsByTagName('organizations');
	if (isNullOrUndefined($0) || $0.length !== 1) {
		return;
	}
	var $2 = $0[0];
	if (!$2.hasChildNodes()) {
		return;
	}
	var $3 = null;
	if ($2.attributes.getNamedItem('default') != null) {
		$3 = API_BASE.BaseUtils.getText($2.attributes.getNamedItem('default'));
	}
	this.$4 = Delegate.create(this, this.$27);
	if (isStorage) {
		if ($3 == null) {
			var $4 = API_BASE.BaseUtils.getChildSiblingsByName($2, 'organization');
			if ($4 == null || $4.length <= 0) {
				return;
			}
			var $enum1 = $4.getEnumerator();
			while ($enum1.moveNext()) {
				var $5 = $enum1.get_current();
				$3 = API_BASE.BaseUtils.getXMLNodeAttribut($5, 'identifier');
				break;
			}
		}
		this.$17 = new Player.PersistentStateStorage($3);
		if (!this.$17.isSupported()) {
			this.$17 = null;
		}
	}

	/*if (this.$2 === 1) {
		this.$9 = new SCORM_1_2.ActivityTree($3, ((this.$17 != null) ? this.$17.getAllStatus() : null), isScormAuto);
	} else {
		this.$9 = new SCORM_1_3.ActivityTree($3, (this.$17 != null) ? this.$17.getResumeAllIdentifier() : null, ((this.$17 != null) ? this.$17.getAllStatus() : null), ((this.$17 != null) ? (this.$17.getResumeAllIdentifier() != null) ? this.$17.getSuspendedGlobalObjectives() : this.$17.getAllObjectivesGlobaltoSystem() : null));
		if (this.$17 != null) {
			(this.$9).setADLCPData(this.$17.getADLData());
		}
	}*/
	if (this.$2 === 1) {
		$('head').append('\x3Cscript type="text/javascript" src="js/scormLib/API.js">\x3C/script>');
		this.$9 = new SCORM_1_2.ActivityTree($3, ((this.$17 != null) ? this.$17.getAllStatus() : null), isScormAuto);
		window.API.version = '1.2';
	} else {
		$('head').append('\x3Cscript type="text/javascript" src="js/scormLib/API_1484_11.js">\x3C/script>');
		this.$9 = new SCORM_1_3.ActivityTree($3, (this.$17 != null) ? this.$17.getResumeAllIdentifier() : null, ((this.$17 != null) ? this.$17.getAllStatus() : null), ((this.$17 != null) ? (this.$17.getResumeAllIdentifier() != null) ? this.$17.getSuspendedGlobalObjectives() : this.$17.getAllObjectivesGlobaltoSystem() : null));
		window.API.version = '2004';
		if (this.$17 != null) {
			(this.$9).setADLCPData(this.$17.getADLData());
		}
	}
	this.$9.add_eventSCO(Delegate.create(this, this.$22));
	this.$9.initByManifest(this.$A, this.$0);
	this.$1A();
	this.$1B();
	this.$1E();
	this.$1F();
	this.$9.requestNavigation('start');
}
Player.ContentPlayer.prototype = {
		$0: null,
		$1: false,
		$3: null,
		$4: null,
		$5: null,
		$6: null,
		$7: null,
		$8: null,
		$9: null,
		$A: null,
		$B: null,
		$C: null,
		$D: null,
		$E: null,
		$F: false,
		$10: null,
		$11: null,
		$12: null,
		$13: null,
		$14: null,
		$15: null,
		$16: null,
		$17: null,
		$19: 0,
		$1A: function () {
			this.$3 = document.getElementById('contentIFrame');
			if (isNullOrUndefined(this.$3)) {
				this.$3 = document.createElement('IFrame');
				this.$3.id = 'contentIFrame';
				this.$3.style.display = 'none';
				this.$3.style.height = frameHeight+"px";
				this.$3.style.width = frameWidth+"px";
				this.$3.frameBorder = '0';
				var $0 = document.getElementById('placeholder_contentIFrame');
				if (!isNullOrUndefined($0)) {
					$0.appendChild(this.$3);
				} else {
					document.body.appendChild(this.$3);
				}
			}
		},
		$1B: function () {
			// this.$7 = document.getElementById('navigationContainer');
			// this.$8 = Delegate.create(this, this.$1D);
			// if (isNullOrUndefined(this.$7)) {
			// this.$7 = document.createElement('div');
			// this.$7.id = 'navigationContainer';
			// this.$7.style.display = 'none';
			// this.$10 = this.$1C('btnPrevious', PlayerConfiguration.BtnPreviousLabel);
			// this.$11 = this.$1C('btnContinue', PlayerConfiguration.BtnContinueLabel);
			// this.$12 = this.$1C('btnExit', PlayerConfiguration.BtnExitLabel);
			// this.$13 = this.$1C('btnExitAll', PlayerConfiguration.BtnExitAllLabel);
			// this.$14 = this.$1C('btnAbandon', PlayerConfiguration.BtnAbandonLabel);
			// this.$15 = this.$1C('btnAbandonAll', PlayerConfiguration.BtnAbandonAllLabel);
			// this.$16 = this.$1C('btnSuspendAll', PlayerConfiguration.BtnSuspendAllLabel);
			// var $0 = document.getElementById('placeholder_navigationContainer');
			// if (!isNullOrUndefined($0)) {
			// $0.appendChild(this.$7);
			// } else {
			// document.body.appendChild(this.$7);
			// }
			// }
		},
		$1C: function ($p0, $p1) {
			var $0 = document.createElement('input');
			$0.setAttribute('id', $p0);
			$0.setAttribute('type', 'button');
			$0.setAttribute('value', $p1);
			$0.style.display = 'none';
			$0.attachEvent('onclick', this.$8);
			this.$7.appendChild($0);
			return $0;
		},
		$1D: function () {
			var $0 = window.event.srcElement;
			if (isNullOrUndefined($0)) {
				return;
			}
			if (this.$F) {
				return;
			}
			if ($0.id === 'btnPrevious') {
				this.$9.requestNavigation('previous');
			} else if ($0.id === 'btnContinue') {
				this.$9.requestNavigation('continue');
			} else if ($0.id === 'btnExit') {
				this.$9.requestNavigation('exit');
				this.$12.disabled = true;
				this.$14.disabled = true;
			} else if ($0.id === 'btnExitAll') {
				this.$9.requestNavigation('exitAll');
			} else if ($0.id === 'btnAbandon') {
				this.$9.requestNavigation('abandon');
				this.$12.disabled = true;
				this.$14.disabled = true;
			} else if ($0.id === 'btnAbandonAll') {
				this.$9.requestNavigation('abandonAll');
			} else if ($0.id === 'btnSuspendAll') {
				this.$9.requestNavigation('suspendAll');
			}
		},
		$1E: function () {
			// this.$5 = document.getElementById('treeContainer');
			// if (isNullOrUndefined(this.$5)) {
			// this.$5 = document.createElement('div');
			// this.$5.id = 'treeContainer';
			// this.$5.style.display = 'none';
			// var $0 = document.getElementById('placeholder_treeContainer');
			// if (isNullOrUndefined($0)) {
			// document.body.appendChild(this.$5);
			// if (this.$9.isSingleItem()) {
			// this.$5.style.display = 'none';
			// }
			// } else {
			// $0.appendChild(this.$5);
			// if (this.$9.isSingleItem()) {
			// $0.style.display = 'none';
			// }
			// }
			// var $1 = new ControlsCollection.TreeView(this.$5, PlayerConfiguration.TreeMinusIcon, PlayerConfiguration.TreePlusIcon);
			// this.$9.scan(this.$9.getOrganization(), Delegate.create(this, function ($p1_0) {
			// var $1_0;
			// if ($p1_0 !== this.$9.getOrganization()) {
			// var $1_1 = ($p1_0.isVisible()) ? '#' : null;
			// if (this.$2 === 1) {
			// $1_1 = (isNullOrUndefined($p1_0.getUrl()) || $p1_0.getUrl().trim().length <= 0) ? null : $1_1;
			// } else if (this.$2 === 2) {
			// var $1_2 = $p1_0;
			// if (!$1_2.getParentSequencing().choice) {
			// $1_1 = null;
			// } else if (isNullOrUndefined($1_2.getScormType()) && !$1_2.getSequencing().flow) {
			// $1_1 = null;
			// }
			// }
			// if ($p1_0.isLeaf()) {
			// $1_0 = ($p1_0.getParent().getData()).addNode($p1_0.getTitle(), $1_1, PlayerConfiguration.TreeLeafIcon);
			// } else {
			// $1_0 = ($p1_0.getParent().getData()).addNode($p1_0.getTitle(), $1_1);
			// } if ($1_1 != null) {
			// this.$18.add($1_0);
			// }
			// } else {
			// $1_0 = $1;
			// }
			// $p1_0.setData($1_0);
			// $1_0.set_userData($p1_0);
			// return true;
			// }), null);
			// $1.add_nodeClick(Delegate.create(this, this.$21));
			// }
		},
		$1F: function () {
			if (!this.$1) {
				return;
			}
			this.$6 = document.getElementById('debuggerContainer');
			if (isNullOrUndefined(this.$6)) {
				// this.$6 = document.createElement('div');
				// this.$6.id = 'debuggerContainer';
				// this.$6.style.display = 'none';
				// var $0 = document.getElementById('placeholder_Debugger');
				// if (!isNullOrUndefined($0)) {
				// $0.style.display = 'block';
				// $0.appendChild(this.$6);
				// } else {
				// document.body.appendChild(this.$6);
				// }
				API_BASE.LOG.add_logEvent(Delegate.create(this, this.$20));
			}
		},
		$20: function ($p0) {
			var $0 = document.createElement('div');
			$0.style.width = '100%';
			var $1 = new Date();
			var $2 = document.createElement('span');
			$2.style.color = '#800000';
			$2.innerHTML = $1.getHours() + ':' + $1.getMinutes() + ':' + $1.getSeconds();
			var $3 = document.createElement('span');
			$3.innerHTML = '&nbsp;' + $p0.message;
			if (!isNullOrUndefined($p0.errorCode) && $p0.errorCode !== '0') {
				$3.style.color = '#FF0000';
				$0.style.backgroundColor = '#FFFF00';
				var $4 = document.createElement('div');
				$4.innerHTML = '<b>Error Code:</b> ' + $p0.errorCode + ((isNullOrUndefined($p0.errorDescription) || $p0.errorDescription.length === 0) ? '' : '<br/><b>Error Info:</b> ' + $p0.errorDescription);
				$3.appendChild($4);
			}
			$0.appendChild($2);
			$0.appendChild($3);
			this.$6.appendChild($0);
			this.$6.parentNode.scrollTop = this.$6.parentNode.scrollHeight;
		},
		$21: function ($p0, $p1) {
			if (this.$F) {
				return;
			}
			if (isNullOrUndefined($p1.get_node()) || isNullOrUndefined($p1.get_node().getAnchor().getAttribute('href')) || $p1.get_node().getAnchor().getAttribute('href') === '') {
				return;
			}
			var $0 = $p1.get_node().get_userData();
			if (isNullOrUndefined($0) || $0.getIdentifier() == null || $0.getIdentifier().length <= 0) {
				return;
			}
			if ($p1.get_node().getUrl() == null) {
				return;
			}
			this.$9.requestNavigation('{target=' + $0.getIdentifier() + '}choice');
		},
		getSCORMVersion: function () {
			return this.$2;
		},
		getActivityTree_V12: function () {
			if (this.$2 === 1) {
				return this.$9;
			} else {
				return null;
			}
		},
		getActivityTree_V13: function () {
			if (this.$2 === 2) {
				return this.$9;
			} else {
				return null;
			}
		},
		$22: function ($p0, $p1) {
			if ($p1.get_eventType() === 5 || $p1.get_eventType() === 3 || $p1.get_eventType() === 4) {
				if (this.$1 && this.$C != null) {
					API_BASE.LOG.displayMessage('Unloading ' + this.$C.getScormType() + ': ' + this.$C.getIdentifier(), '0', null);
				}
				if ($p1.get_eventType() === 5) {
					this.$C = null;
					this.$B = null;
					this.$D = null;
					this.hidePlayer(!this.$1);
					if (this.$1) {
						API_BASE.LOG.displayMessage('End Session!', '0', null);
					}
				} else {
					if (this.$B != null && this.$C.getScormType() === 'sco' && !this.$B.isInitAttempted()) {
						return;
					}
				} if ($p1.get_eventType() !== 4) {
					this.$F = true;
					this.$3.attachEvent('onload', this.$4);
				} else {
					if (isNullOrUndefined(this.$C)) {
						API_BASE.LOG.displayMessage('No SCO to deliver!', '0', null);
						this.$23();
					}
					this.$12.disabled = true;
					this.$14.disabled = true;
				}
				this.$3.src = 'blank.html';
			} else if ($p1.get_eventType() === 1) {
				if (this.$B != null) {
					if (!this.$B.isFinishAttempted()) {
						this.$23();
					}
					if (this.$17 != null) {
						this.$17.saveItemCMI(this.$C.getIdentifier(), this.$C.getDataTree());
					}
				}
			} else if ($p1.get_eventType() === 0) {
				if (this.$17 != null) {
					if (this.$2 === 1) {
						this.$17.saveState(null, (this.$9).getStoredStatuses(), null, null, null);
					} else if (this.$2 === 2) {
						var $0 = this.$9;
						this.$17.saveState($0.getADLCPData(), $0.getStoredStatuses(), ($0.savedSuspendedActivity != null) ? null : ($0.isObjectivesglobaltoSystem()) ? $0.getClonedGlobalObjectives() : null, ($0.savedSuspendedActivity != null) ? $0.savedSuspendedActivity.getIdentifier() : null, ($0.savedSuspendedActivity != null) ? $0.getClonedGlobalObjectives() : null);
					}
				}
			} else if ($p1.get_eventType() === 2) {
				this.$28($p1.get_treeNode());
			}
		},
		$23: function () {
			var $0 = !isNullOrUndefined(this.$C);
			if (this.$9.isSingleItem()) {
				return;
			}
			API_BASE.LOG.displayMessage('Updating navigation ... ', '0', null);
			if (this.$2 === 2) {
				if ($0) {
					var $1 = this.$C.getHideLMSUI();
					console.log($1);
					var $2 = this.getActivityTree_V13();
					var $3 = this.$C;
					if (!isNullOrUndefined(this.$10) && !$1.contains('previous')) {
						this.$10.disabled = !$3.getParentSequencing().flow || $3.getParentSequencing().forwardOnly || !$2.isValidNavigationRequest('previous', false);
					}
					if (!isNullOrUndefined(this.$11) && !$1.contains('continue')) {
						this.$11.disabled = !$3.getParentSequencing().flow || !$2.isValidNavigationRequest('continue', false);
					}
				}
				this.$19 = 0;
				window.setTimeout(Delegate.create(this, this.$24), 1);
			} else if (this.$2 === 1) {
				var $4 = this.getActivityTree_V12();
				if ($0) {
					this.$10.disabled = !$4.isValidNavigationRequest('previous');
					this.$11.disabled = !$4.isValidNavigationRequest('continue');
				}
				if ($4.hasPrerequisites()) {
					this.$19 = 0;
					window.setTimeout(Delegate.create(this, this.$25), 1);
				}
			}
		},
		$24: function () {
			if (this.$19 < this.$18.length) {
				var $0 = this.getActivityTree_V13();
				var $1 = this.$18[this.$19];
				var $2 = $1.get_userData();
				var $3 = this.$C;
				if ($3 !== $2 && $0.isValidNavigationRequest('choice.{target=' + $2.getIdentifier() + '}', false)) {
					$1.getAnchor().href = '#';
				} else {
					$1.getAnchor().removeAttribute('href');
				}
				this.$19++;
				window.setTimeout(Delegate.create(this, this.$24), 1);
			}
		},
		$25: function () {
			if (this.$19 < this.$18.length) {
				var $0 = this.getActivityTree_V12();
				var $1 = this.$18[this.$19];
				var $2 = $1.get_userData();
				var $3 = this.$C;
				if ($3 !== $2 && $0.isValidNavigationRequest('{target=' + $2.getIdentifier() + '}choice')) {
					$1.getAnchor().href = '#';
				} else {
					$1.getAnchor().removeAttribute('href');
				}
				this.$19++;
				window.setTimeout(Delegate.create(this, this.$25), 1);
			}
		},
		$26: function () {
			if (this.$1) {
				API_BASE.LOG.displayMessage('Loading ' + this.$C.getScormType() + ': ' + this.$C.getIdentifier(), '0', null);
			}
			this.$23();
			this.$3.src = this.$C.getUrl();
		},
		$27: function () {
			this.$3.detachEvent('onload', this.$4);
			this.$F = false;
			if (!isNullOrUndefined(this.$C) && !this.$B.isFinishAttempted()) {
				this.$26();
			}
		},
		$28: function ($p0) {
			if ($p0 != null) {
				var $0 = this.$D;
				if (this.$17 != null) {
					$p0.setDataTree(this.$17.getItemCMI($p0.getIdentifier()));
				}
				if (this.$2 === 1) {
					this.$B = new SCORM_1_2.API_LIB($p0);
				} else if (this.$2 === 2) {
					this.$B = new SCORM_1_3.API_1484_11_LIB($p0);
				}
				this.$C = $p0;
				this.$D = this.$C.getData();
				this.$9.setActiveAPI(this.$B);
				if ($0 != null && this.$E != null) {
					$0.getIcon().src = this.$E;
				}
				if (!isNullOrUndefined(PlayerConfiguration.TreeActiveIcon) && PlayerConfiguration.TreeActiveIcon.length > 0 && !isNullOrUndefined(this.$D.getIcon())) {
					this.$E = this.$D.getIcon().src;
					this.$D.getIcon().src = PlayerConfiguration.TreeActiveIcon;
				}
				var $1 = $p0.getHideLMSUI();
				console.log(this.$10);
				console.log(this.$9.isSingleItem());
				console.log($1);
				if (!isNullOrUndefined(this.$10)) {
					this.$10.style.display = (this.$9.isSingleItem() || $1.contains('previous')) ? 'none' : 'inline';
					this.$10.disabled = false;
				}
				if (!isNullOrUndefined(this.$11)) {
					this.$11.style.display = (this.$9.isSingleItem() || $1.contains('continue')) ? 'none' : 'inline';
					this.$11.disabled = false;
				}
				if (!isNullOrUndefined(this.$12)) {
					this.$12.style.display = ($1.contains('exit')) ? 'none' : 'inline';
					this.$12.disabled = false;
				}
				if (!isNullOrUndefined(this.$13)) {
					this.$13.style.display = ($1.contains('exitall')) ? 'none' : 'inline';
					this.$13.disabled = false;
				}
				if (!isNullOrUndefined(this.$14)) {
					this.$14.style.display = ($1.contains('abandon')) ? 'none' : 'inline';
					this.$14.disabled = false;
				}
				if (!isNullOrUndefined(this.$15)) {
					this.$15.style.display = ($1.contains('abandonall')) ? 'none' : 'inline';
					this.$15.disabled = false;
				}
				if (!isNullOrUndefined(this.$16)) {
					this.$16.style.display = ($1.contains('suspendall')) ? 'none' : 'inline';
					this.$16.disabled = false;
				}
				if (!this.$F) {
					this.$26();
				}
			}
		},
		showPlayer: function () {
			if (this.$2 !== 0) {
				this.$3.style.display = 'block';
//				this.$5.style.display = 'block';
				//           this.$7.style.display = 'block';
				if (!isNullOrUndefined(this.$6)) {
					this.$6.style.display = (this.$1) ? 'block' : 'none';
				}
			}
		},
		hidePlayer: function (includeDebugger) {
			if (this.$2 !== 0) {
				this.$3.style.display = 'none';
//				this.$5.style.display = 'none';
				//           this.$7.style.display = 'none';
				if (includeDebugger && !isNullOrUndefined(this.$6)) {
					this.$6.style.display = 'none';
				}
			}
		}
}
PlayerConfiguration = function () {}
Run = function () {}
Run.ManifestByURL = function (url, anticache) {
	if (isNullOrUndefined(url) || url.trim().length <= 0) {
		return;
	}
	url = url.trim().replace(new RegExp('\\\\', 'g'), '/');
	Run.$2 = url.substr(0, url.lastIndexOf('/') + 1);
	if (anticache) {
		url += '?anticache=' + Math.random();
	}
	Run.$0 = new XMLHttpRequest();
	Run.$0.onreadystatechange = Delegate.create(null, Run.$3);

	Run.$0.open('GET', url, true);
	console.log("Logging get response in player.js");
	try
	{

		Run.$0.send(null);
		console.log("Logging ststu of xmlhttp request---");
		console.log(Run.$0.status);
	}

	catch(e)
	{
		//console.log("Exception happened");
		requestFailure=true;
	}


}
Run.ManifestByString = function (manifest) {
	Run.$1 = XMLDocumentParser.parse(manifest);
	if (isNullOrUndefined(Run.$1) || isNullOrUndefined(API_BASE.BaseUtils.getChildNodeByName(Run.$1, 'manifest'))) {
		API_BASE.LOG.displayMessage('[PLR.1] Loading course process', 'PLR.1.1', 'Incorrect imsmanifest.xml');
		return;
	}
	Run.$4();
}
Run.$3 = function () {
	if (Run.$0.readyState === 4) {
		Run.$0.onreadystatechange = Delegate.Null;
		if (!isNullOrUndefined(Run.$0.responseXML)) {
			Run.$1 = Run.$0.responseXML;
			Run.$4();
		} else if (!isNullOrUndefined(Run.$0.responseText)) {
			Run.ManifestByString(Run.$0.responseText);
		}
		Run.$0 = null;
	}
}
Run.$4 = function () {
	var $0 = new Player.ContentPlayer(Run.$2, Run.$1, PlayerConfiguration.StorageSupport, false, PlayerConfiguration.Debug);
	$0.showPlayer();
}
Player.PersistentStateStorage.createClass('Player.PersistentStateStorage');
Player.ContentPlayer.createClass('Player.ContentPlayer');
PlayerConfiguration.createClass('PlayerConfiguration');
Run.createClass('Run');
PlayerConfiguration.Debug = false;
PlayerConfiguration.StorageSupport = false;
//PlayerConfiguration.TreeMinusIcon = null;
//PlayerConfiguration.TreePlusIcon = null;
//PlayerConfiguration.TreeLeafIcon = null;
//PlayerConfiguration.TreeActiveIcon = null;
//PlayerConfiguration.BtnPreviousLabel = 'Previous';
//PlayerConfiguration.BtnContinueLabel = 'Continue';
//PlayerConfiguration.BtnExitLabel = 'Exit';
//PlayerConfiguration.BtnExitAllLabel = 'Exit All';
//PlayerConfiguration.BtnAbandonLabel = 'Abandon';
//PlayerConfiguration.BtnAbandonAllLabel = 'Abandon All';
//PlayerConfiguration.BtnSuspendAllLabel = 'Suspend All';
Run.$0 = null;
Run.$1 = null;
Run.$2 = null;
//---- Do not remove this footer ----
//This script was generated using Script# v0.5.5.0 (http://projects.nikhilk.net/ScriptSharp)
//-----------------------------------