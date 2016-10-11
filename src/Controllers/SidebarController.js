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
        var SidebarController = (function () {
            function SidebarController($scope, toaster, $analytics, service, region, studyArea, StatisticsGroup, modal, leafletData, exploration, EventManager) {
                var _this = this;
                this.EventManager = EventManager;
                $scope.vm = this;
                this.init();
                this.toaster = toaster;
                this.angulartics = $analytics;
                this.searchService = service;
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
                //watch for completion of load parameters
                $scope.$watch(function () { return _this.studyAreaService.parametersLoaded; }, function (newval, oldval) {
                    if (newval == oldval)
                        return;
                    //console.log('parameters loaded', oldval, newval);
                    if (newval == null)
                        _this.setProcedureType(3);
                    else
                        _this.setProcedureType(4);
                });
                //$scope.$watch(() => this.studyAreaService.studyAreaParameterList,(newval, oldval) => {
                //    console.log('watch for modify basin chars ', newval, oldval);
                //});
            }
            SidebarController.prototype.getLocations = function (term) {
                return this.searchService.getLocations(term);
            };
            SidebarController.prototype.setProcedureType = function (pType) {
                //console.log('in setProcedureType', this.selectedProcedure, pType, !this.canUpdateProcedure(pType));     
                if (this.selectedProcedure == pType || !this.canUpdateProcedure(pType)) {
                    //capture issues and send notifications here
                    if (this.selectedProcedure == 3 && (pType == 4))
                        this.toaster.pop("warning", "Warning", "Make sure you calculate selected basin characteristics before continuing", 5000);
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
                console.log('Opening state page for: ', region);
                this.modalService.openModal(StreamStats.Services.SSModalType.e_about, { "tabName": "regionInfo", "regionID": region });
                //var regionParsed = region.replace(' ', '_').toLowerCase();
                //window.open('http://water.usgs.gov/osw/streamstats/' + regionParsed + '.html', '_blank');
            };
            SidebarController.prototype.resetWorkSpace = function () {
                //this.regionService.clearRegion();
                this.studyAreaService.clearStudyArea();
                this.studyAreaService.showDelineateButton = true;
                this.nssService.clearNSSdata();
            };
            SidebarController.prototype.startSearch = function (e) {
                e.stopPropagation();
                e.preventDefault();
                $("#sapi-searchTextBox").trigger($.Event("keyup", { "keyCode": 13 }));
            };
            SidebarController.prototype.startDelineate = function () {
                var _this = this;
                //console.log('in startDelineate');
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
                //console.log('set stat group: ', checkStatisticsGroup);
                //if toggled remove selected parameter set
                if (checkStatisticsGroup != -1) {
                    //remove this statisticsGroup from the list
                    this.nssService.selectedStatisticsGroupList.splice(checkStatisticsGroup, 1);
                }
                else {
                    this.nssService.selectedStatisticsGroupList.push(statisticsGroup);
                    //get list of params for selected StatisticsGroup
                    this.nssService.loadParametersByStatisticsGroup(this.regionService.selectedRegion.RegionID, statisticsGroup.ID, this.studyAreaService.selectedStudyArea.RegressionRegions.map(function (elem) {
                        return elem.code;
                    }).join(","), this.studyAreaService.selectedStudyArea.RegressionRegions);
                }
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
                if (index > -1) {
                    //remove it
                    this.studyAreaService.studyAreaParameterList.splice(index, 1);
                }
                else {
                    //add it
                    this.studyAreaService.studyAreaParameterList.push(parameter);
                }
            };
            SidebarController.prototype.calculateParameters = function () {
                //ga event
                this.angulartics.eventTrack('CalculateParameters', {
                    category: 'SideBar', label: this.regionService.selectedRegion.Name + '; ' + this.studyAreaService.studyAreaParameterList.map(function (elem) { return elem.code; }).join(",") });
                //console.log('in Calculate Parameters');
                this.studyAreaService.loadParameters();
            };
            SidebarController.prototype.submitBasinEdits = function () {
                this.studyAreaService.showEditToolbar = false;
                //check if basin has been edited, if so we need to re-query regression regions
                if (this.studyAreaService.Disclaimers['isEdited']) {
                    //clear out any scenarios and other stuff
                    this.nssService.clearNSSdata();
                    this.studyAreaService.loadEditedStudyBoundary();
                }
            };
            SidebarController.prototype.selectScenarios = function () {
                //if not, just continue
                this.setProcedureType(3);
            };
            SidebarController.prototype.generateReport = function () {
                //console.log('in estimateFlows');
                //ga event
                this.angulartics.eventTrack('CalculateFlows', {
                    category: 'SideBar', label: this.regionService.selectedRegion.Name + '; ' + this.nssService.selectedStatisticsGroupList.map(function (elem) { return elem.Name; }).join(",") });
                if (this.nssService.selectedStatisticsGroupList.length > 0 && this.nssService.showFlowsTable) {
                    this.nssService.estimateFlows(this.studyAreaService.studyAreaParameterList, "value", this.regionService.selectedRegion.RegionID, this.studyAreaService.selectedStudyArea.RegressionRegions.map(function (elem) { return elem.code; }).join(","));
                    if (this.studyAreaService.Disclaimers["isRegulated"])
                        this.nssService.estimateFlows(this.studyAreaService.studyAreaParameterList, "unRegulatedValue", this.regionService.selectedRegion.RegionID, this.studyAreaService.selectedStudyArea.RegressionRegions.map(function (elem) { return elem.code; }).join(","), true);
                }
                this.modalService.openModal(StreamStats.Services.SSModalType.e_report);
                this.studyAreaService.reportGenerated = true;
            };
            SidebarController.prototype.checkRegulation = function () {
                console.log('checking for regulation');
                this.studyAreaService.upstreamRegulation();
            };
            SidebarController.prototype.queryRegressionRegions = function () {
                //return if this state is not enabled
                if (!this.regionService.selectedRegion.ScenariosAvailable) {
                    this.studyAreaService.regressionRegionQueryComplete = true;
                    return;
                }
                this.nssService.queriedRegions = true;
                //send watershed to map service query that returns list of regression regions that overlap the watershed
                this.studyAreaService.queryRegressionRegions();
            };
            SidebarController.prototype.queryStatisticsGroupTypes = function () {
                this.nssService.loadStatisticsGroupTypes(this.regionService.selectedRegion.RegionID, this.studyAreaService.selectedStudyArea.RegressionRegions.map(function (elem) {
                    return elem.code;
                }).join(","));
            };
            SidebarController.prototype.onSelectedStatisticsGroupChanged = function () {
                //console.log('StatisticsGroup param list changed.  loaded ', this.nssService.selectedStatisticsGroupList);
                var _this = this;
                //toggle show flows checkbox
                this.nssService.selectedStatisticsGroupList.length > 0 ? this.nssService.showFlowsTable = true : this.nssService.showFlowsTable = false;
                this.regionService.parameterList.forEach(function (parameter) {
                    //loop over whole statisticsgroups
                    _this.nssService.selectedStatisticsGroupList.forEach(function (statisticsGroup) {
                        if (statisticsGroup.RegressionRegions) {
                            //get their parameters
                            statisticsGroup.RegressionRegions.forEach(function (regressionRegion) {
                                regressionRegion.Parameters.forEach(function (param) {
                                    if (parameter.code.toLowerCase() == param.Code.toLowerCase()) {
                                        //configuration.alwaysSelectedParameters.forEach((alwaysSelectedParam) => {
                                        //    if (alwaysSelectedParam.name == parameter.code) return;
                                        //});
                                        //turn it on
                                        if (_this.checkArrayForObj(_this.studyAreaService.studyAreaParameterList, parameter) == -1)
                                            _this.studyAreaService.studyAreaParameterList.push(parameter);
                                        parameter['checked'] = true;
                                        parameter['toggleable'] = false;
                                    }
                                });
                            });
                        }
                    });
                });
            };
            SidebarController.prototype.OpenWateruse = function () {
                this.modalService.openModal(StreamStats.Services.SSModalType.e_wateruse);
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
                            return this.studyAreaService.parametersLoaded;
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
                }
                catch (e) {
                }
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            SidebarController.$inject = ['$scope', 'toaster', '$analytics', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'StreamStats.Services.ModalService', 'leafletData', 'StreamStats.Services.ExplorationService', 'WiM.Event.EventManager'];
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