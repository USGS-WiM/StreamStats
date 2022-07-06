var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use strinct';
        var SidebarController = (function () {
            function SidebarController($scope, toaster, $analytics, $compile, region, studyArea, StatisticsGroup, modal, leafletData, exploration, EventManager) {
                var _this = this;
                this.$scope = $scope;
                this.$compile = $compile;
                this.EventManager = EventManager;
                this.SSServicesVersion = '1.2.22';
                this.dateRange = { dates: { startDate: new Date(), endDate: new Date() }, minDate: new Date(1900, 1, 1), maxDate: new Date() };
                $scope.vm = this;
                this.init();
                this.setCulvertPopups();
                this.toaster = toaster;
                this.angulartics = $analytics;
                this.sideBarCollapsed = false;
                this.selectedProcedure = ProcedureType.INIT;
                this.regionService = region;
                this.nssService = StatisticsGroup;
                this.studyAreaService = studyArea;
                this.modalService = modal;
                this.leafletData = leafletData;
                this.multipleParameterSelectorAdd = true;
                this.explorationService = exploration;
                StatisticsGroup.onSelectedStatisticsGroupChanged.subscribe(this._onSelectedStatisticsGroupChangedHandler);
                $scope.$watch(function () { return _this.regionService.selectedRegion; }, function (newval, oldval) {
                    if (newval == null)
                        _this.setProcedureType(1);
                    else
                        _this.setProcedureType(2);
                });
                $scope.$watch(function () { return _this.studyAreaService.regressionRegionQueryComplete; }, function (newval, oldval) {
                    if (newval == oldval)
                        return;
                    if (newval == null)
                        _this.setProcedureType(2);
                    else if (!_this.regionService.selectedRegion.ScenariosAvailable)
                        _this.setProcedureType(2);
                    else
                        _this.setProcedureType(3);
                });
                $scope.$watchCollection(function () { return _this.studyAreaService.selectedStudyAreaExtensions; }, function (newval, oldval) {
                    if (newval == oldval)
                        return;
                    _this.scenarioHasExtensions = (_this.studyAreaService.selectedStudyAreaExtensions.length > 0);
                });
                $scope.$watchCollection(function () { return _this.studyAreaService.extensionsConfigured; }, function (newval, oldval) {
                    if (newval == oldval)
                        return;
                    if (!newval) {
                        _this.extensionsConfigured = newval;
                        return;
                    }
                    var hasAllParams = true;
                    _this.studyAreaService.selectedStudyAreaExtensions.forEach(function (ext) {
                        ext.parameters.forEach(function (p) {
                            if (!p.hasOwnProperty('value') || p.value == undefined)
                                hasAllParams = false;
                        });
                    });
                    if (hasAllParams)
                        _this.extensionsConfigured = true;
                });
                EventManager.SubscribeToEvent(StreamStats.Services.onSelectedStudyParametersLoaded, new WiM.Event.EventHandler(function (sender, e) {
                    _this.parametersLoaded = e.parameterLoaded;
                    if (!_this.parametersLoaded)
                        _this.setProcedureType(3);
                    else
                        _this.setProcedureType(4);
                }));
            }
            Object.defineProperty(SidebarController.prototype, "ParameterValuesMissing", {
                get: function () {
                    if (!this.studyAreaService.studyAreaParameterList || this.studyAreaService.studyAreaParameterList.length < 1)
                        return true;
                    for (var i = 0; i < this.studyAreaService.studyAreaParameterList.length; i++) {
                        var p = this.studyAreaService.studyAreaParameterList[i];
                        if (!p.value || p.value < 0)
                            return true;
                    }
                    return false;
                },
                enumerable: false,
                configurable: true
            });
            SidebarController.prototype.setProcedureType = function (pType) {
                if (this.selectedProcedure == pType || !this.canUpdateProcedure(pType)) {
                    if (this.selectedProcedure == 2 && (pType == 3 || pType == 4))
                        this.toaster.pop("warning", "Warning", "Make sure you have delineated a basin and clicked continue", 5000);
                    return;
                }
                this.selectedProcedure = pType;
            };
            SidebarController.prototype.toggleSideBar = function () {
                if (this.sideBarCollapsed)
                    this.sideBarCollapsed = false;
                else
                    this.sideBarCollapsed = true;
            };
            SidebarController.prototype.onAOISelect = function (item) {
                this.EventManager.RaiseEvent(WiM.Services.onSelectedAreaOfInterestChanged, this, new WiM.Services.SearchAPIEventArgs(item));
            };
            SidebarController.prototype.zoomRegion = function (inRegion) {
                var region = angular.fromJson(inRegion);
            };
            SidebarController.prototype.setRegion = function (region) {
                this.angulartics.eventTrack('initialOperation', { category: 'SideBar', label: 'Region Selection Button' });
                if (this.regionService.selectedRegion == undefined || this.regionService.selectedRegion.RegionID !== region.RegionID)
                    this.regionService.selectedRegion = region;
                this.setProcedureType(2);
                this.regionService.loadParametersByRegion();
            };
            SidebarController.prototype.openStatePage = function (e, region) {
                e.stopPropagation();
                e.preventDefault();
                this.modalService.openModal(StreamStats.Services.SSModalType.e_about, { "tabName": "regionInfo", "regionID": region });
            };
            SidebarController.prototype.resetWorkSpace = function () {
                this.regionService.clearSelectedParameters();
                this.studyAreaService.clearStudyArea();
                this.studyAreaService.zoomLevel15 = true;
                this.nssService.clearNSSdata();
                this.multipleParameterSelectorAdd = false;
            };
            SidebarController.prototype.startSearch = function (e) {
                e.stopPropagation();
                e.preventDefault();
                $("#searchBox").trigger($.Event("keyup", { "keyCode": 13 }));
            };
            SidebarController.prototype.startDelineate = function () {
                var _this = this;
                this.leafletData.getMap("mainMap").then(function (map) {
                    if (map.getZoom() < 15) {
                        _this.toaster.pop('error', "Delineate", "You must be at or above zoom level 15 to delineate.");
                        return;
                    }
                    else {
                        _this.toaster.pop('success', "Delineate", "Click on a blue stream cell to start delineation");
                        _this.studyAreaService.doDelineateFlag = !_this.studyAreaService.doDelineateFlag;
                    }
                });
            };
            SidebarController.prototype.setStatisticsGroup = function (statisticsGroup) {
                var checkStatisticsGroup = this.checkArrayForObj(this.nssService.selectedStatisticsGroupList, statisticsGroup);
                if (checkStatisticsGroup != -1) {
                    if (typeof statisticsGroup.id != 'number' && statisticsGroup.id.indexOf('fdctm')) {
                        var qppqExtension = this.studyAreaService.selectedStudyAreaExtensions.filter(function (e) { return e.code == 'QPPQ'; })[0];
                        var extensionIndex = this.studyAreaService.selectedStudyAreaExtensions.indexOf(qppqExtension);
                        this.studyAreaService.selectedStudyAreaExtensions.splice(extensionIndex, 1);
                        this.EventManager.RaiseEvent(StreamStats.Services.onScenarioExtensionChanged, this, new StreamStats.Services.NSSEventArgs(this.studyAreaService.selectedStudyAreaExtensions));
                    }
                    this.nssService.selectedStatisticsGroupList.splice(checkStatisticsGroup, 1);
                    if (this.nssService.selectedStatisticsGroupList.length == 0) {
                        this.studyAreaService.studyAreaParameterList = [];
                        this.regionService.parameterList.forEach(function (parameter) {
                            parameter.checked = false;
                            parameter.toggleable = true;
                        });
                    }
                }
                else {
                    this.nssService.selectedStatisticsGroupList.push(statisticsGroup);
                    if (this.studyAreaService.selectedStudyArea.CoordinatedReach != null && statisticsGroup.code.toUpperCase() == "PFS") {
                        this.addParameterToStudyAreaList("DRNAREA");
                        this.nssService.showFlowsTable = true;
                        return;
                    }
                    this.nssService.loadParametersByStatisticsGroup(this.regionService.selectedRegion.RegionID, statisticsGroup.id, this.studyAreaService.selectedStudyArea.RegressionRegions.map(function (elem) {
                        return elem.code;
                    }).join(","), this.studyAreaService.selectedStudyArea.RegressionRegions);
                }
            };
            SidebarController.prototype.multipleParameterSelector = function () {
                var _this = this;
                this.regionService.parameterList.forEach(function (parameter) {
                    var paramCheck = _this.checkArrayForObj(_this.studyAreaService.studyAreaParameterList, parameter);
                    if (_this.multipleParameterSelectorAdd) {
                        if (paramCheck == -1)
                            _this.studyAreaService.studyAreaParameterList.push(parameter);
                        parameter.checked = true;
                    }
                    else {
                        if (paramCheck > -1 && parameter.toggleable) {
                            _this.studyAreaService.studyAreaParameterList.splice(paramCheck, 1);
                            parameter.checked = false;
                        }
                    }
                });
                this.multipleParameterSelectorAdd = !this.multipleParameterSelectorAdd;
            };
            SidebarController.prototype.updateStudyAreaParameterList = function (parameter) {
                if (parameter.toggleable == false) {
                    this.toaster.pop('warning', parameter.code + " is required by one of the selected scenarios", "It cannot be unselected");
                    parameter.checked = true;
                    return;
                }
                var index = this.studyAreaService.studyAreaParameterList.indexOf(parameter);
                if (!parameter.checked && index > -1) {
                    this.studyAreaService.studyAreaParameterList.splice(index, 1);
                }
                else if (parameter.checked && index == -1) {
                    this.studyAreaService.studyAreaParameterList.push(parameter);
                }
                this.checkParameters();
            };
            SidebarController.prototype.checkParameters = function () {
                var allChecked = true;
                for (var _i = 0, _a = this.regionService.parameterList; _i < _a.length; _i++) {
                    var param = _a[_i];
                    if (!param.checked) {
                        allChecked = false;
                    }
                }
                if (allChecked) {
                    this.multipleParameterSelectorAdd = false;
                }
                else {
                    this.multipleParameterSelectorAdd = true;
                }
            };
            SidebarController.prototype.calculateParameters = function () {
                this.angulartics.eventTrack('CalculateParameters', {
                    category: 'SideBar', label: this.regionService.selectedRegion.Name + '; ' + this.studyAreaService.studyAreaParameterList.map(function (elem) { return elem.code; }).join(",")
                });
                this.studyAreaService.loadParameters();
                if (this.scenarioHasExtensions && this.nssService.selectedStatisticsGroupList.length == 1) {
                    this.nssService.showBasinCharacteristicsTable = false;
                }
            };
            SidebarController.prototype.configureExtensions = function () {
                this.modalService.openModal(StreamStats.Services.SSModalType.e_extensionsupport);
            };
            SidebarController.prototype.submitBasinEdits = function () {
                this.angulartics.eventTrack('basinEditor', { category: 'Map', label: 'sumbitEdits' });
                this.studyAreaService.showEditToolbar = false;
                this.toaster.pop('wait', "Submitting edited basin", "Please wait...", 0);
                if (this.studyAreaService.selectedStudyArea.Disclaimers['isEdited']) {
                    this.nssService.clearNSSdata();
                    this.studyAreaService.loadEditedStudyBoundary();
                }
            };
            SidebarController.prototype.selectScenarios = function () {
                this.setProcedureType(3);
            };
            SidebarController.prototype.refreshWindow = function () {
                window.location.reload();
            };
            SidebarController.prototype.generateReport = function () {
                var _this = this;
                this.toaster.pop('wait', "Opening Report", "Please wait...", 5000);
                this.angulartics.eventTrack('CalculateFlows', {
                    category: 'SideBar', label: this.regionService.selectedRegion.Name + '; ' + this.nssService.selectedStatisticsGroupList.map(function (elem) { return elem.name; }).join(",")
                });
                if (this.nssService.showHydraulicModelTable) {
                    this.toaster.clear();
                    this.modalService.openModal(StreamStats.Services.SSModalType.e_report);
                    this.nssService.reportGenerated = true;
                }
                else if (this.nssService.selectedStatisticsGroupList.length > 0 && this.nssService.showFlowsTable) {
                    var strippedoutStatisticGroups = [];
                    if (this.studyAreaService.selectedStudyArea.CoordinatedReach != null) {
                        for (var i = 0; i < this.nssService.selectedStatisticsGroupList.length; i++) {
                            var sg = this.nssService.selectedStatisticsGroupList[i];
                            if (sg.code.toUpperCase() === "PFS") {
                                sg.citations = [{ author: "Indiana DNR,", title: "Coordinated Discharges of Selected Streams in Indiana.", citationURL: "http://www.in.gov/dnr/water/4898.htm" }];
                                sg.regressionRegions = [];
                                var result = this.studyAreaService.selectedStudyArea.CoordinatedReach.Execute(this.studyAreaService.studyAreaParameterList.filter(function (p) { return p.code === "DRNAREA"; }));
                                sg.regressionRegions.push(result);
                                strippedoutStatisticGroups.push(sg);
                                this.nssService.selectedStatisticsGroupList.splice(i, 1);
                                break;
                            }
                        }
                    }
                    this.nssService.estimateFlows(this.studyAreaService.studyAreaParameterList, "value", this.regionService.selectedRegion.RegionID);
                    if (this.regionService.selectedRegion.Applications.indexOf("RegulationFlows") != -1) {
                        setTimeout(function () {
                            _this.nssService.estimateFlows(_this.studyAreaService.studyAreaParameterList, "unRegulatedValue", _this.regionService.selectedRegion.RegionID, true);
                        }, 500);
                    }
                    if (sg != null && sg.code.toUpperCase() === "PFS") {
                        this.nssService.selectedStatisticsGroupList.push(sg);
                        if (this.nssService.selectedStatisticsGroupList.length == 1) {
                            this.toaster.clear();
                            this.modalService.openModal(StreamStats.Services.SSModalType.e_report);
                            this.nssService.reportGenerated = true;
                        }
                    }
                }
                else {
                    this.toaster.clear();
                    this.modalService.openModal(StreamStats.Services.SSModalType.e_report);
                    this.nssService.reportGenerated = true;
                }
                this.leafletData.getMap("mainMap").then(function (map) {
                    _this.leafletData.getLayers("mainMap").then(function (maplayers) {
                        for (var key in maplayers.baselayers) {
                            if (map.hasLayer(maplayers.baselayers[key])) {
                                _this.studyAreaService.baseMap = {};
                                _this.studyAreaService.baseMap[key] = configuration.basemaps[key];
                            }
                        }
                    });
                });
            };
            SidebarController.prototype.checkRegulation = function () {
                this.studyAreaService.upstreamRegulation();
            };
            SidebarController.prototype.getAccuracy = function (param, value) {
                if (value !== null && value !== '' && value !== 'None') {
                    if (param.Accuracy === "1") {
                        return Math.round(parseFloat(value));
                    }
                    else if (param.Accuracy === "0.1") {
                        return parseFloat(value).toFixed(1);
                    }
                    else if (param.Accuracy === "0.01") {
                        return parseFloat(value).toFixed(2);
                    }
                    else if (param.Accuracy === "0.001") {
                        return parseFloat(value).toFixed(3);
                    }
                    else {
                        return value;
                    }
                }
                else {
                    return value;
                }
            };
            SidebarController.prototype.skipDelineateAndShowCulvertResults = function (lat, lng, properties, regionIndex) {
                var studyArea = new StreamStats.Models.StudyArea(this.regionService.selectedRegion.RegionID, new WiM.Models.Point(lat, lng, '4326'));
                this.studyAreaService.AddStudyArea(studyArea);
                this.studyAreaService.loadCulvertBoundary(properties.SurveyID, regionIndex);
                this.studyAreaService.getCulvertAttachments(properties.SurveyID, regionIndex);
                var paramList = [];
                var citations = [];
                var statCitations = [];
                var self = this;
                $.ajax({
                    url: configuration.culvertDataDictURL,
                    type: 'get',
                    dataType: 'json',
                    success: function (data) {
                        var culvertJSON = data;
                        var citedCodeList = [];
                        var citationList = [];
                        var citationStatList = [];
                        var diameter = { "TenYR": "", "TwentyFiveYR": "", "SCS": "" };
                        culvertJSON.forEach(function (param) {
                            for (var k in properties) {
                                if (k !== "OBJECTID") {
                                    if (param.Code === k) {
                                        var code;
                                        if (param["Field type"] === "Double" && properties[k] !== null && typeof properties[k] === "string") {
                                            properties[k] = parseFloat(properties[k]);
                                        }
                                        else if (param["Field type"] === "short integer" && properties[k] !== null && typeof properties[k] === "string") {
                                            properties[k] = parseInt(properties[k]);
                                        }
                                        if (param.Code.includes("DIAM")) {
                                            var roundedValue = self.getAccuracy(param, properties[k]);
                                            if (param.Code.includes('10YR')) {
                                                diameter["TenYR"] = roundedValue;
                                            }
                                            else if (param.Code.includes('25YR')) {
                                                diameter["TwentyFiveYR"] = roundedValue;
                                            }
                                            else if (param.Code.substring(param.Code.length - 3) === 'SCS') {
                                                diameter["SCS"] = roundedValue;
                                            }
                                        }
                                        if (param.Matchcode !== "None" && param.Matchcode !== "BankfullStats" && param.Matchcode !== "PeakflowStats" && param.Matchcode !== "SiteInfo" && param.Matchcode !== "BasinChar" && param.Matchcode !== "StreamHabitat" && param.Matchcode !== "RoadCrossing") {
                                            code = param.Matchcode;
                                            var index = -1;
                                            for (var i = 0; i < paramList.length; i++) {
                                                if (paramList[i].code === code) {
                                                    index = i;
                                                    break;
                                                }
                                            }
                                            if (index !== -1) {
                                                var roundedValue = self.getAccuracy(param, properties[k]);
                                                if (param.Code.includes('10YR')) {
                                                    paramList[index].value[0].value_10yr = roundedValue;
                                                }
                                                else if (param.Code.includes('25YR')) {
                                                    paramList[index].value[0].value_25yr = roundedValue;
                                                }
                                                else if (param.Code.substring(param.Code.length - 3) === 'SCS') {
                                                    paramList[index].value[0].value_scs = properties[k];
                                                }
                                                var limitObj = { "10YR": "", "25YR": "", "SCS": "" };
                                                var limit = void 0;
                                                if (param["SCS Standard"] !== "NA" && param["SCS Standard"] !== "TBD" && param["SCS Standard"] !== "") {
                                                    limit = param['SCS Standard'];
                                                    if (param.Code.includes('10YR')) {
                                                        if (limit.includes("parameter.value")) {
                                                            limit = limit.replaceAll("parameter.value", "parameter.value[0].value_10yr");
                                                            limit = limit.replaceAll("parameter.diameter", "parameter.diameter.TenYR");
                                                            limitObj["10YR"] = limit;
                                                        }
                                                        if (!limit.includes("diameter")) {
                                                            paramList[index].limit["TenYR"] = limitObj["10YR"] + " ? '' : 'wim-warning'";
                                                        }
                                                        else {
                                                            paramList[index].limit["TenYR"] = limitObj["10YR"];
                                                        }
                                                    }
                                                    else if (param.Code.includes('25YR')) {
                                                        if (limit.includes("parameter.value")) {
                                                            limit = limit.replaceAll("parameter.value", "parameter.value[0].value_25yr");
                                                            limit = limit.replaceAll("parameter.diameter", "parameter.diameter.TwentyFiveYR");
                                                            limitObj["25YR"] = limit;
                                                        }
                                                        if (!limit.includes("diameter")) {
                                                            paramList[index].limit["TwentyFiveYR"] = limitObj["25YR"] + " ? '' : 'wim-warning'";
                                                        }
                                                        else {
                                                            paramList[index].limit["TwentyFiveYR"] = limitObj["25YR"];
                                                        }
                                                    }
                                                    else if (param.Code.substring(param.Code.length - 3) === 'SCS') {
                                                        if (limit.includes("parameter.value")) {
                                                            limit = limit.replaceAll("parameter.value", "parameter.value[0].value_scs");
                                                            limit = limit.replaceAll("parameter.diameter", "parameter.diameter.SCS");
                                                            limitObj["SCS"] = limit;
                                                        }
                                                        if (!limit.includes("diameter")) {
                                                            paramList[index].limit["SCS"] = limitObj["SCS"] + " ? '' : 'wim-warning'";
                                                        }
                                                        else {
                                                            paramList[index].limit["SCS"] = limitObj["SCS"];
                                                        }
                                                    }
                                                }
                                                else {
                                                    paramList[index].limit = { "TenYR": "", "TwentyFiveYR": "", "SCS": "" };
                                                }
                                            }
                                            else {
                                                paramList.push({ code: code, value: [{}], name: param.Name, description: param.Description, unit: param.Units, limit: { "TenYR": "", "TwentyFiveYR": "", "SCS": "" }, diameter: diameter });
                                                var newIndex;
                                                for (var i = 0; i < paramList.length; i++) {
                                                    if (paramList[i].code === code) {
                                                        newIndex = i;
                                                        break;
                                                    }
                                                }
                                                var roundedValue = self.getAccuracy(param, properties[k]);
                                                if (param.Code.includes('10YR')) {
                                                    paramList[newIndex].value[0].value_10yr = roundedValue;
                                                }
                                                else if (param.Code.includes('25YR')) {
                                                    paramList[newIndex].value[0].value_25yr = roundedValue;
                                                }
                                                else if (param.Code.substring(param.Code.length - 3) === 'SCS') {
                                                    paramList[newIndex].value[0].value_scs = properties[k];
                                                }
                                            }
                                        }
                                        else {
                                            code = param.Matchcode + param.Code;
                                            var roundedValue = self.getAccuracy(param, properties[k]);
                                            paramList.push({ code: code, value: roundedValue, name: param.Name, description: param.Description, unit: param.Units, limit: { "TenYR": "", "TwentyFiveYR": "", "SCS": "" }, diameter: diameter });
                                            var newIndex;
                                            for (var i = 0; i < paramList.length; i++) {
                                                if (paramList[i].code === code) {
                                                    newIndex = i;
                                                    break;
                                                }
                                            }
                                        }
                                        if (param.Citation !== '') {
                                            if ((code.substring(0, 2) === 'BC' || code.substring(0, 2) === 'PC' || code.substring(0, 2) === 'AC') && (citedCodeList.indexOf(code) === -1 || citationList.indexOf(param.Citation) === -1)) {
                                                citations.push({ code: code, citation: param.Citation, citationURL: param.CitationURL });
                                                citedCodeList.push(code);
                                                citationList.push(param.Citation);
                                            }
                                            else if ((code.substring(0, 13) === 'BankfullStats' || code.substring(0, 13) === 'PeakflowStats') && (citationStatList.indexOf(param.Citation) === -1)) {
                                                statCitations.push({ code: code, citation: param.Citation, citationURL: param.CitationURL });
                                                citationStatList.push(param.Citation);
                                            }
                                            else if (citationList.indexOf(param.Citation) === -1) {
                                                citations.push({ code: code, citation: param.Citation, citationURL: param.CitationURL });
                                                citedCodeList.push(code);
                                                citationList.push(param.Citation);
                                            }
                                        }
                                    }
                                }
                            }
                        });
                        self.studyAreaService.studyAreaParameterList = paramList;
                        self.studyAreaService.culvertCitations = citations;
                        self.studyAreaService.culvertStatCitations = statCitations;
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
                this.selectedProcedure = 4;
                this.setProcedureType(4);
                this.nssService.showHydraulicModelTable = true;
                this.nssService.showBasinCharacteristicsTable = false;
            };
            SidebarController.prototype.setCulvertPopups = function () {
                var self = this;
                configuration.regions.forEach(function (region, i) {
                    if (region.Applications.indexOf('Culverts') != -1) {
                        var regionIndex = i;
                        region.Layers.Culverts.layerOptions.onEachFeature = function (feature, layer) {
                            var popupContent = '<div><h5>Stream Crossings</h5> ';
                            var queryProperties = {
                                "SurveyID": "Survey ID",
                                "HQSCORE": "Habitat Quality Score",
                                "RCPSCORE": "Restoration Connectivity Potential Score",
                                "MEPCF": "Maximum Extent Practicable (MEP) Cost Factor",
                                "HWYHDF": "Hydraulic Design Flood",
                            };
                            Object.keys(queryProperties).map(function (k) {
                                if (queryProperties[k] === "Hydraulic Design Flood") {
                                    popupContent += '<strong>' + queryProperties[k] + ': </strong>' + feature.properties[k] + ' Year</br></br>';
                                }
                                else {
                                    popupContent += '<strong>' + queryProperties[k] + ': </strong>' + feature.properties[k] + '</br></br>';
                                }
                            });
                            var latlng = layer.getLatLng();
                            var lat = latlng.lat;
                            var lon = latlng.lng;
                            var properties = JSON.stringify(feature.properties);
                            console.log(feature.properties);
                            popupContent += "<button type='button' id='displayCulvertReport' ng-click='vm.skipDelineateAndShowCulvertResults(" + lat + "," + lon + "," + properties + "," + i + ")' class='btn-black fullwidth'>&nbsp;&nbsp;Build Report</button></div>";
                            var compiledHtml = self.$compile(popupContent)(self.$scope);
                            layer.bindPopup(compiledHtml[0]);
                        };
                    }
                });
            };
            SidebarController.prototype.queryRegressionRegions = function () {
                if (!this.regionService.selectedRegion.ScenariosAvailable) {
                    this.studyAreaService.regressionRegionQueryComplete = true;
                    this.setProcedureType(ProcedureType.SELECT);
                    return;
                }
                this.nssService.queriedRegions = true;
                if (this.regionService.selectedRegion.Applications.indexOf("CoordinatedReach") != -1) {
                    this.studyAreaService.queryCoordinatedReach();
                }
                if (!this.studyAreaService.selectedStudyArea.RegressionRegions) {
                    this.studyAreaService.queryRegressionRegions();
                }
                else
                    this.setProcedureType(3);
            };
            SidebarController.prototype.queryStatisticsGroupTypes = function () {
                this.nssService.loadStatisticsGroupTypes(this.regionService.selectedRegion.RegionID, this.studyAreaService.selectedStudyArea.RegressionRegions.map(function (elem) {
                    return elem.code;
                }).join(","));
            };
            SidebarController.prototype.updateParameterValue = function (parameter) {
            };
            SidebarController.prototype.onSelectedStatisticsGroupChanged = function () {
                var _this = this;
                this.nssService.selectedStatisticsGroupList.length > 0 ? this.nssService.showFlowsTable = true : this.nssService.showFlowsTable = false;
                this.nssService.selectedStatisticsGroupList.forEach(function (statisticsGroup) {
                    if (statisticsGroup.regressionRegions) {
                        statisticsGroup.regressionRegions.forEach(function (regressionRegion) {
                            regressionRegion.parameters.forEach(function (param) {
                                var found = false;
                                for (var i = 0; i < _this.regionService.parameterList.length; i++) {
                                    var parameter = _this.regionService.parameterList[i];
                                    if (parameter.code.toLowerCase() == param.code.toLowerCase()) {
                                        _this.addParameterToStudyAreaList(parameter.code);
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    _this.toaster.pop('warning', "Missing Parameter: " + param.code, "The selected scenario requires a parameter not available in this State/Region.  The value for this parameter will need to be entered manually.", 0);
                                    var newParam = {
                                        name: param.name,
                                        description: param.description,
                                        code: param.code,
                                        unit: param.unitType.unit,
                                        value: null,
                                        regulatedValue: null,
                                        unRegulatedValue: null,
                                        loaded: null,
                                        checked: false,
                                        toggleable: true
                                    };
                                    _this.regionService.parameterList.push(newParam);
                                    _this.addParameterToStudyAreaList(param.code);
                                }
                            });
                        });
                    }
                });
            };
            SidebarController.prototype.OpenWateruse = function () {
                this.modalService.openModal(StreamStats.Services.SSModalType.e_wateruse);
            };
            SidebarController.prototype.OpenStormRunoff = function () {
                this.modalService.openModal(StreamStats.Services.SSModalType.e_stormrunnoff);
            };
            SidebarController.prototype.OpenNearestGages = function () {
                this.modalService.openModal(StreamStats.Services.SSModalType.e_nearestgages);
            };
            SidebarController.prototype.downloadGeoJSON = function () {
                var GeoJSON = angular.toJson(this.studyAreaService.selectedStudyArea.FeatureCollection);
                var filename = 'data.geojson';
                var blob = new Blob([GeoJSON], { type: 'text/csv;charset=utf-8;' });
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, filename);
                }
                else {
                    var link = document.createElement("a");
                    var url = URL.createObjectURL(blob);
                    if (link.download !== undefined) {
                        link.setAttribute("href", url);
                        link.setAttribute("download", filename);
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                    else {
                        window.open(url);
                    }
                }
            };
            SidebarController.prototype.downloadKML = function () {
                var geojson = JSON.parse(angular.toJson(this.studyAreaService.selectedStudyArea.FeatureCollection));
                var kml = tokml(geojson);
                var blob = new Blob([kml], { type: 'text/csv;charset=utf-8;' });
                var filename = 'data.kml';
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, filename);
                }
                else {
                    var link = document.createElement("a");
                    var url = URL.createObjectURL(blob);
                    if (link.download !== undefined) {
                        link.setAttribute("href", url);
                        link.setAttribute("download", filename);
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                    else {
                        window.open(url);
                    }
                }
            };
            SidebarController.prototype.downloadShapeFile = function () {
                try {
                    var flowTable = null;
                    if (this.nssService.showFlowsTable)
                        flowTable = this.nssService.getflattenNSSTable(this.studyAreaService.selectedStudyArea.WorkspaceID);
                    var fc = this.studyAreaService.getflattenStudyArea();
                    var disclaimer = "USGS Data Disclaimer: Unless otherwise stated, all data, metadata and related materials are considered to satisfy the quality standards relative to the purpose for which the data were collected. Although these data and associated metadata have been reviewed for accuracy and completeness and approved for release by the U.S. Geological Survey (USGS), no warranty expressed or implied is made regarding the display or utility of the data for other purposes, nor on all computer systems, nor shall the act of distribution constitute any such warranty." + '\n' +
                        "USGS Software Disclaimer: This software has been approved for release by the U.S. Geological Survey (USGS). Although the software has been subjected to rigorous review, the USGS reserves the right to update the software as needed pursuant to further analysis and review. No warranty, expressed or implied, is made by the USGS or the U.S. Government as to the functionality of the software and related material nor shall the fact of release constitute any such warranty. Furthermore, the software is released on condition that neither the USGS nor the U.S. Government shall be held liable for any damages resulting from its authorized or unauthorized use." + '\n' +
                        "USGS Product Names Disclaimer: Any use of trade, firm, or product names is for descriptive purposes only and does not imply endorsement by the U.S. Government." + '\n\n';
                    var versionText = 'Application Version: ' + configuration.version;
                    if (this.SSServicesVersion)
                        versionText += '\nStreamStats Services Version: ' + this.SSServicesVersion;
                    shpwrite.download(fc, flowTable, disclaimer + versionText);
                }
                catch (e) {
                    console.log(e);
                }
            };
            SidebarController.prototype.init = function () {
                var _this = this;
                this._onSelectedStatisticsGroupChangedHandler = new WiM.Event.EventHandler(function () {
                    _this.onSelectedStatisticsGroupChanged();
                });
            };
            SidebarController.prototype.checkArrayForObj = function (arr, obj) {
                for (var i = 0; i < arr.length; i++) {
                    if (angular.equals(arr[i], obj)) {
                        return i;
                    }
                }
                ;
                return -1;
            };
            SidebarController.prototype.addParameterToStudyAreaList = function (paramCode) {
                try {
                    for (var i = 0; i < this.regionService.parameterList.length; i++) {
                        var p = this.regionService.parameterList[i];
                        if (p.code.toUpperCase() === paramCode.toUpperCase() && this.checkArrayForObj(this.studyAreaService.studyAreaParameterList, p) == -1) {
                            this.studyAreaService.studyAreaParameterList.push(p);
                            p['checked'] = true;
                            p['toggleable'] = false;
                            break;
                        }
                    }
                }
                catch (e) {
                    return false;
                }
            };
            SidebarController.prototype.canUpdateProcedure = function (pType) {
                var msg;
                try {
                    switch (pType) {
                        case ProcedureType.INIT:
                            return true;
                        case ProcedureType.IDENTIFY:
                            return this.regionService.selectedRegion != null;
                        case ProcedureType.SELECT:
                            return this.studyAreaService.regressionRegionQueryComplete;
                        case ProcedureType.BUILD:
                            return this.studyAreaService.regressionRegionQueryComplete && this.parametersLoaded;
                        default:
                            return false;
                    }
                }
                catch (e) {
                    return false;
                }
            };
            SidebarController.prototype.sm = function (msg) {
                try {
                }
                catch (e) {
                }
            };
            SidebarController.$inject = ['$scope', 'toaster', '$analytics', '$compile', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'StreamStats.Services.ModalService', 'leafletData', 'StreamStats.Services.ExplorationService', 'WiM.Event.EventManager'];
            return SidebarController;
        }());
        var ProcedureType;
        (function (ProcedureType) {
            ProcedureType[ProcedureType["INIT"] = 1] = "INIT";
            ProcedureType[ProcedureType["IDENTIFY"] = 2] = "IDENTIFY";
            ProcedureType[ProcedureType["SELECT"] = 3] = "SELECT";
            ProcedureType[ProcedureType["BUILD"] = 4] = "BUILD";
        })(ProcedureType || (ProcedureType = {}));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.SidebarController', SidebarController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
