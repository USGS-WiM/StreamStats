//------------------------------------------------------------------------------
//----- SidebarController ------------------------------------------------------
//------------------------------------------------------------------------------
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2014 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//   purpose:  
//discussion:   Controllers are typically built to reflect a View. 
//              and should only contailn business logic needed for a single view. For example, if a View 
//              contains a ListBox of objects, a Selected object, and a Save button, the Controller 
//              will have an ObservableCollection ObectList, 
//              Model SelectedObject, and SaveCommand.
//Comments
//04.14.2015 jkn - Created
//Imports"
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use strinct';
        var SidebarController = /** @class */ (function () {
            function SidebarController($scope, toaster, $analytics, region, studyArea, StatisticsGroup, modal, leafletData, exploration, EventManager) {
                var _this = this;
                this.EventManager = EventManager;
                this.dateRange = { dates: { startDate: new Date(), endDate: new Date() }, minDate: new Date(1900, 1, 1), maxDate: new Date() };
                $scope.vm = this;
                this.init();
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
                //watch for map based region changes here
                $scope.$watch(function () { return _this.regionService.selectedRegion; }, function (newval, oldval) {
                    //console.log('region change', oldval, newval);
                    if (newval == null)
                        _this.setProcedureType(1);
                    else
                        _this.setProcedureType(2);
                });
                //watch for completion of regression region query
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
                    _this.scenarioHasExtenstions = (_this.studyAreaService.selectedStudyAreaExtensions.length > 0);
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
                    } //next i
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            SidebarController.prototype.setProcedureType = function (pType) {
                //console.log('in setProcedureType', this.selectedProcedure, pType, this.canUpdateProcedure(pType));     
                if (this.selectedProcedure == pType || !this.canUpdateProcedure(pType)) {
                    //capture issues and send notifications here
                    //if (this.selectedProcedure == 3 && (pType == 4 )) this.toaster.pop("warning", "Warning", "Make sure you calculate selected basin characteristics before continuing", 5000);
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
                //console.log('zooming to region: ', region);
            };
            SidebarController.prototype.setRegion = function (region) {
                //ga event
                this.angulartics.eventTrack('initialOperation', { category: 'SideBar', label: 'Region Selection Button' });
                //console.log('setting region: ', region);
                if (this.regionService.selectedRegion == undefined || this.regionService.selectedRegion.RegionID !== region.RegionID)
                    this.regionService.selectedRegion = region;
                this.setProcedureType(2);
                //get available parameters
                this.regionService.loadParametersByRegion();
            };
            SidebarController.prototype.openStatePage = function (e, region) {
                e.stopPropagation();
                e.preventDefault();
                //console.log('Opening state page for: ', region);
                this.modalService.openModal(StreamStats.Services.SSModalType.e_about, { "tabName": "regionInfo", "regionID": region });
                //var regionParsed = region.replace(' ', '_').toLowerCase();
                //window.open('https://water.usgs.gov/osw/streamstats/' + regionParsed + '.html', '_blank');
            };
            SidebarController.prototype.resetWorkSpace = function () {
                //this.regionService.clearRegion();
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
                //console.log('in startDelineate', this.studyAreaService.canUpdate, this.studyAreaService.doDelineateFlag);
                this.leafletData.getMap("mainMap").then(function (map) {
                    //console.log('mapzoom', map.getZoom());
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
                //console.log('set stat group: ', statisticsGroup, checkStatisticsGroup);
                //if toggled remove selected parameter set
                if (checkStatisticsGroup != -1) {
                    //remove this statisticsGroup from the list
                    this.nssService.selectedStatisticsGroupList.splice(checkStatisticsGroup, 1);
                    //if no selected scenarios, clear studyareaparameter list
                    if (this.nssService.selectedStatisticsGroupList.length == 0) {
                        this.studyAreaService.studyAreaParameterList = [];
                        this.regionService.parameterList.forEach(function (parameter) {
                            parameter.checked = false;
                            parameter.toggleable = true;
                        });
                    }
                }
                //add it to the list and get its required parameters
                else {
                    this.nssService.selectedStatisticsGroupList.push(statisticsGroup);
                    if (this.studyAreaService.selectedStudyArea.CoordinatedReach != null && statisticsGroup.code.toUpperCase() == "PFS") {
                        this.addParameterToStudyAreaList("DRNAREA");
                        this.nssService.showFlowsTable = true;
                        return;
                    } //end if
                    //get list of params for selected StatisticsGroup
                    this.nssService.loadParametersByStatisticsGroup(this.regionService.selectedRegion.RegionID, statisticsGroup.id, this.studyAreaService.selectedStudyArea.RegressionRegions.map(function (elem) {
                        return elem.code;
                    }).join(","), this.studyAreaService.selectedStudyArea.RegressionRegions);
                }
            };
            SidebarController.prototype.multipleParameterSelector = function () {
                var _this = this;
                this.regionService.parameterList.forEach(function (parameter) {
                    //console.log('length of configuration.alwaysSelectedParameters: ', configuration.alwaysSelectedParameters.length);
                    var paramCheck = _this.checkArrayForObj(_this.studyAreaService.studyAreaParameterList, parameter);
                    if (_this.multipleParameterSelectorAdd) {
                        //if its not there add it
                        if (paramCheck == -1)
                            _this.studyAreaService.studyAreaParameterList.push(parameter);
                        parameter.checked = true;
                    }
                    else {
                        //remove it only if toggleable
                        if (paramCheck > -1 && parameter.toggleable) {
                            _this.studyAreaService.studyAreaParameterList.splice(paramCheck, 1);
                            //this.toaster.pop('warning', parameter.code + " is required by one of the selected scenarios", "It cannot be unselected");
                            parameter.checked = false;
                        }
                    }
                });
                //flip toggle
                this.multipleParameterSelectorAdd = !this.multipleParameterSelectorAdd;
            };
            SidebarController.prototype.updateStudyAreaParameterList = function (parameter) {
                //console.log('in updatestudyarea parameter', parameter);
                //dont mess with certain parameters
                if (parameter.toggleable == false) {
                    this.toaster.pop('warning', parameter.code + " is required by one of the selected scenarios", "It cannot be unselected");
                    parameter.checked = true;
                    return;
                }
                var index = this.studyAreaService.studyAreaParameterList.indexOf(parameter);
                if (!parameter.checked && index > -1) {
                    //remove it
                    this.studyAreaService.studyAreaParameterList.splice(index, 1);
                }
                else if (parameter.checked && index == -1) {
                    //add it
                    this.studyAreaService.studyAreaParameterList.push(parameter);
                }
                this.checkParameters();
            };
            SidebarController.prototype.checkParameters = function () {
                // change select all parameters toggle to match if all params are checked or not
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
                //ga event
                this.angulartics.eventTrack('CalculateParameters', {
                    category: 'SideBar', label: this.regionService.selectedRegion.Name + '; ' + this.studyAreaService.studyAreaParameterList.map(function (elem) { return elem.code; }).join(",")
                });
                //console.log('in Calculate Parameters');
                this.studyAreaService.loadParameters();
                //open modal for extensions
                if (this.scenarioHasExtenstions) {
                    this.modalService.openModal(StreamStats.Services.SSModalType.e_extensionsupport);
                }
            };
            SidebarController.prototype.submitBasinEdits = function () {
                this.angulartics.eventTrack('basinEditor', { category: 'Map', label: 'sumbitEdits' });
                this.studyAreaService.showEditToolbar = false;
                //check if basin has been edited, if so we need to re-query regression regions
                if (this.studyAreaService.selectedStudyArea.Disclaimers['isEdited']) {
                    //clear out any scenarios and other stuff
                    this.nssService.clearNSSdata();
                    this.studyAreaService.loadEditedStudyBoundary();
                }
            };
            SidebarController.prototype.selectScenarios = function () {
                //if not, just continue
                this.setProcedureType(3);
            };
            SidebarController.prototype.refreshWindow = function () {
                window.location.reload();
            };
            SidebarController.prototype.generateReport = function () {
                var _this = this;
                //console.log('in estimateFlows');
                this.toaster.pop('wait', "Opening Report", "Please wait...", 5000);
                //ga event
                this.angulartics.eventTrack('CalculateFlows', {
                    category: 'SideBar', label: this.regionService.selectedRegion.Name + '; ' + this.nssService.selectedStatisticsGroupList.map(function (elem) { return elem.name; }).join(",")
                });
                if (this.nssService.selectedStatisticsGroupList.length > 0 && this.nssService.showFlowsTable) {
                    var strippedoutStatisticGroups = [];
                    if (this.studyAreaService.selectedStudyArea.CoordinatedReach != null) {
                        //first remove from nssservice
                        for (var i = 0; i < this.nssService.selectedStatisticsGroupList.length; i++) {
                            var sg = this.nssService.selectedStatisticsGroupList[i];
                            if (sg.code.toUpperCase() === "PFS") {
                                sg.citations = [{ Author: "Indiana DNR,", Title: "Coordinated Discharges of Selected Streams in Indiana.", CitationURL: "http://www.in.gov/dnr/water/4898.htm" }];
                                sg.regressionRegions = [];
                                var result = this.studyAreaService.selectedStudyArea.CoordinatedReach.Execute(this.studyAreaService.studyAreaParameterList.filter(function (p) { return p.code === "DRNAREA"; }));
                                sg.regressionRegions.push(result);
                                strippedoutStatisticGroups.push(sg);
                                this.nssService.selectedStatisticsGroupList.splice(i, 1);
                                break;
                            } //end if
                        } //next
                    } //end if
                    this.nssService.estimateFlows(this.studyAreaService.studyAreaParameterList, "value", this.regionService.selectedRegion.RegionID);
                    if (this.regionService.selectedRegion.Applications.indexOf("RegulationFlows") != -1) {
                        setTimeout(function () {
                            _this.nssService.estimateFlows(_this.studyAreaService.studyAreaParameterList, "unRegulatedValue", _this.regionService.selectedRegion.RegionID, true);
                        }, 500);
                    }
                    //add it back in.
                    if (sg != null)
                        this.nssService.selectedStatisticsGroupList.push(sg);
                }
                else {
                    this.toaster.clear();
                    this.modalService.openModal(StreamStats.Services.SSModalType.e_report);
                    this.nssService.reportGenerated = true;
                }
                //pass mainMap basemap to studyAreaService
                this.leafletData.getMap("mainMap").then(function (map) {
                    _this.leafletData.getLayers("mainMap").then(function (maplayers) {
                        for (var key in maplayers.baselayers) {
                            if (map.hasLayer(maplayers.baselayers[key])) {
                                _this.studyAreaService.baseMap = {};
                                _this.studyAreaService.baseMap[key] = configuration.basemaps[key];
                            } //end if
                        } //next
                    }); //end getLayers                                
                }); //end getMap 
            };
            SidebarController.prototype.checkRegulation = function () {
                //console.log('checking for regulation');
                this.studyAreaService.upstreamRegulation();
            };
            SidebarController.prototype.queryRegressionRegions = function () {
                //return if this state is not enabled
                if (!this.regionService.selectedRegion.ScenariosAvailable) {
                    this.studyAreaService.regressionRegionQueryComplete = true;
                    this.setProcedureType(ProcedureType.SELECT);
                    return;
                }
                this.nssService.queriedRegions = true;
                //send watershed to map service query that returns list of regression regions that overlap the watershed
                if (this.regionService.selectedRegion.Applications.indexOf("CoordinatedReach") != -1) {
                    this.studyAreaService.queryCoordinatedReach();
                }
                //only do this if we havent done it already and basin hasn't been edited
                //if (!this.studyAreaService.selectedStudyArea.RegressionRegions && !this.studyAreaService.selectedStudyArea.Disclaimers['isEdited']) {  //COMMENTED OUT 9/14/2017 BECAUSE EDIT NOT WORKING
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
                //var paramIndex = this.studyAreaService.requestParameterList.indexOf(parameter.code);
                //if (parameter.value >= 0 && paramIndex != -1) {
                //    this.studyAreaService.requestParameterList.splice(paramIndex, 1);
                //}
            };
            SidebarController.prototype.onSelectedStatisticsGroupChanged = function () {
                var _this = this;
                //toggle show flows checkbox
                this.nssService.selectedStatisticsGroupList.length > 0 ? this.nssService.showFlowsTable = true : this.nssService.showFlowsTable = false;
                //loop over whole statisticsgroups
                this.nssService.selectedStatisticsGroupList.forEach(function (statisticsGroup) {
                    if (statisticsGroup.regressionRegions) {
                        //get their parameters
                        statisticsGroup.regressionRegions.forEach(function (regressionRegion) {
                            //loop over list of state/region parameters to see if there is a match
                            regressionRegion.parameters.forEach(function (param) {
                                var found = false;
                                for (var i = 0; i < _this.regionService.parameterList.length; i++) {
                                    var parameter = _this.regionService.parameterList[i];
                                    if (parameter.code.toLowerCase() == param.code.toLowerCase()) {
                                        _this.addParameterToStudyAreaList(parameter.code);
                                        found = true;
                                        break;
                                    } //end if
                                } //next i
                                if (!found) {
                                    //console.log('PARAM NOT FOUND', param.Code)
                                    _this.toaster.pop('warning', "Missing Parameter: " + param.Code, "The selected scenario requires a parameter not available in this State/Region.  The value for this parameter will need to be entered manually.", 0);
                                    //add to region parameterList
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
                                    //push the param that was not in the original regionService paramaterList
                                    _this.regionService.parameterList.push(newParam);
                                    //select it
                                    _this.addParameterToStudyAreaList(param.code);
                                }
                            }); // next param
                        }); // next regressionRegion
                    } //end if
                }); //next statisticgroup
            };
            SidebarController.prototype.OpenWateruse = function () {
                this.modalService.openModal(StreamStats.Services.SSModalType.e_wateruse);
            };
            SidebarController.prototype.OpenStormRunoff = function () {
                this.modalService.openModal(StreamStats.Services.SSModalType.e_stormrunnoff);
            };
            SidebarController.prototype.downloadGeoJSON = function () {
                var GeoJSON = angular.toJson(this.studyAreaService.selectedStudyArea.FeatureCollection);
                var filename = 'data.geojson';
                var blob = new Blob([GeoJSON], { type: 'text/csv;charset=utf-8;' });
                if (navigator.msSaveBlob) { // IE 10+
                    navigator.msSaveBlob(blob, filename);
                }
                else {
                    var link = document.createElement("a");
                    var url = URL.createObjectURL(blob);
                    if (link.download !== undefined) { // feature detection
                        // Browsers that support HTML5 download attribute
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
                    //this will output a zip file
                    var disclaimer = "USGS Data Disclaimer: Unless otherwise stated, all data, metadata and related materials are considered to satisfy the quality standards relative to the purpose for which the data were collected. Although these data and associated metadata have been reviewed for accuracy and completeness and approved for release by the U.S. Geological Survey (USGS), no warranty expressed or implied is made regarding the display or utility of the data for other purposes, nor on all computer systems, nor shall the act of distribution constitute any such warranty." + '\n' +
                        "USGS Software Disclaimer: This software has been approved for release by the U.S. Geological Survey (USGS). Although the software has been subjected to rigorous review, the USGS reserves the right to update the software as needed pursuant to further analysis and review. No warranty, expressed or implied, is made by the USGS or the U.S. Government as to the functionality of the software and related material nor shall the fact of release constitute any such warranty. Furthermore, the software is released on condition that neither the USGS nor the U.S. Government shall be held liable for any damages resulting from its authorized or unauthorized use." + '\n' +
                        "USGS Product Names Disclaimer: Any use of trade, firm, or product names is for descriptive purposes only and does not imply endorsement by the U.S. Government." + '\n\n';
                    shpwrite.download(fc, flowTable, disclaimer + 'Application Version: ' + configuration.version);
                }
                catch (e) {
                    console.log(e);
                }
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            SidebarController.prototype.init = function () {
                var _this = this;
                //init event handler
                this._onSelectedStatisticsGroupChangedHandler = new WiM.Event.EventHandler(function () {
                    _this.onSelectedStatisticsGroupChanged();
                });
            };
            //special function for searching arrays but ignoring angular hashkey
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
                        } //endif
                    } //next i
                }
                catch (e) {
                    return false;
                }
            };
            SidebarController.prototype.canUpdateProcedure = function (pType) {
                //console.log('in canUpdateProcedure');
                //Project flow:
                var msg;
                try {
                    switch (pType) {
                        case ProcedureType.INIT:
                            return true;
                        case ProcedureType.IDENTIFY:
                            return this.regionService.selectedRegion != null;
                        case ProcedureType.SELECT:
                            //proceed if there is a regression region
                            return this.studyAreaService.regressionRegionQueryComplete;
                        case ProcedureType.BUILD:
                            return this.studyAreaService.regressionRegionQueryComplete && this.parametersLoaded;
                        default:
                            return false;
                    } //end switch          
                }
                catch (e) {
                    //this.sm(new MSG.NotificationArgs(e.message, MSG.NotificationType.INFORMATION, 1.5));
                    return false;
                }
            };
            SidebarController.prototype.sm = function (msg) {
                try {
                    //toastr.options = {
                    //    positionClass: "toast-bottom-right"
                    //};
                    //this.NotificationList.unshift(new LogEntry(msg.msg, msg.type));
                    //setTimeout(() => {
                    //    toastr[msg.type](msg.msg);
                    //    if (msg.ShowWaitCursor != undefined)
                    //        this.IsLoading(msg.ShowWaitCursor)
                    //}, 0)
                }
                catch (e) {
                }
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            SidebarController.$inject = ['$scope', 'toaster', '$analytics', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'StreamStats.Services.ModalService', 'leafletData', 'StreamStats.Services.ExplorationService', 'WiM.Event.EventManager'];
            return SidebarController;
        }()); //end class
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
})(StreamStats || (StreamStats = {})); //end module
//# sourceMappingURL=SidebarController.js.map