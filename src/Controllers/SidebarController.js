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
            function SidebarController($scope, toaster, service, region, studyArea, StatisticsGroup, report, leafletData) {
                var _this = this;
                $scope.vm = this;
                this.toaster = toaster;
                this.searchService = service;
                this.sideBarCollapsed = false;
                this.selectedProcedure = 1 /* INIT */;
                this.regionService = region;
                this.nssService = StatisticsGroup;
                this.studyAreaService = studyArea;
                this.reportService = report;
                this.leafletData = leafletData;
                this.multipleParameterSelectorAdd = true;
                //watches for changes to selected StatisticsGroup param list and updates studyareaParamList with them
                $scope.$watchCollection(function () { return _this.nssService.selectedStatisticsGroupParameterList; }, function (newval, oldval) {
                    console.log('StatisticsGroup param list changed.  loaded ', newval.length, ' parameters from StatisticsGroup');
                    //this.studyAreaService.studyAreaParameterList = [];
                    _this.regionService.parameterList.forEach(function (val, idx) {
                        _this.nssService.selectedStatisticsGroupParameterList.forEach(function (value, index) {
                            if (val.code.toLowerCase() == value['Code'].toLowerCase()) {
                                if (val.code == "DRNAREA")
                                    return;
                                //make sure new object isn't already in the list
                                if (_this.checkParamList(_this.studyAreaService.studyAreaParameterList, val) == -1)
                                    studyArea.studyAreaParameterList.push(val);
                                val['checked'] = true;
                            }
                        });
                    });
                });
                //watch for map based region changes here
                $scope.$watch(function () { return _this.regionService.selectedRegion; }, function (newval, oldval) {
                    console.log('region change', oldval, newval);
                    if (newval == null)
                        _this.setProcedureType(1);
                    else
                        _this.setProcedureType(2);
                });
                angular.element(document).ready(function () {
                    //this.searchService.loadScript('../bower_components/usgs-search-api/search_api.min.js', 'text/javascript', 'utf-8');
                    //var myScript = document.createElement('script');
                    //myScript.src = '../bower_components/usgs-search-api/search_api.min.js';
                    //myScript.onload = () => {
                    //    console.log('search api loaded.');
                    //    this.searchService.setSearchAPI();
                    //};
                    //document.body.appendChild(myScript);
                });
            }
            SidebarController.prototype.getLocations = function (term) {
                return this.searchService.getLocations(term);
            };
            SidebarController.prototype.setProcedureType = function (pType) {
                console.log('in setProcedureType', this.selectedProcedure, pType, !this.canUpdateProcedure(pType));
                if (this.selectedProcedure == pType || !this.canUpdateProcedure(pType)) {
                    //capture issues and send notifications here
                    if (this.selectedProcedure == 3 && (pType == 4 || pType == 5))
                        this.toaster.pop("warning", "Warning", "Make sure you calculate selected basin characteristics before continuing", 5000);
                    if (this.selectedProcedure == 2 && (pType == 3 || pType == 4 || pType == 5))
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
                this.searchService.onSelectedAreaOfInterestChanged.raise(this, new WiM.Services.SearchAPIEventArgs(item));
            };
            SidebarController.prototype.zoomRegion = function (inRegion) {
                var region = angular.fromJson(inRegion);
                console.log('zooming to region: ', region);
            };
            SidebarController.prototype.setRegion = function (region) {
                console.log('setting region: ', region);
                if (this.regionService.selectedRegion == undefined || this.regionService.selectedRegion.RegionID !== region.RegionID)
                    this.regionService.selectedRegion = region;
                this.setProcedureType(2 /* IDENTIFY */);
                //get available parameters
                this.regionService.loadParametersByRegion();
            };
            SidebarController.prototype.resetWorkSpace = function () {
                //this.regionService.clearRegion();
                this.studyAreaService.clearStudyArea();
                this.nssService.clearNSSdata();
            };
            SidebarController.prototype.startDelineate = function () {
                var _this = this;
                this.leafletData.getMap().then(function (map) {
                    console.log('mapzoom', map.getZoom());
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
                //if toggled remove selected parameter set
                if (this.nssService.selectedStatisticsGroup == statisticsGroup) {
                    this.nssService.selectedStatisticsGroup = null;
                    //this.studyAreaService.studyAreaParameterList = [];
                    return;
                }
                this.nssService.selectedStatisticsGroup = statisticsGroup;
                console.log(statisticsGroup.Name, ' clicked');
                //clear studyareaParameterList
                //this.studyAreaService.studyAreaParameterList = [];
                //get list of params for selected StatisticsGroup
                this.nssService.loadParametersByStatisticsGroup(this.regionService.selectedRegion.RegionID, this.nssService.selectedStatisticsGroup.ID, this.studyAreaService.selectedStudyArea.RegressionRegions[0]);
                //select subset of parameters from list
                this.nssService.selectedStatisticsGroupParameterList;
            };
            //special function for searching arrays but ignoring angular hashkey
            SidebarController.prototype.checkParamList = function (arr, obj) {
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
                this.regionService.parameterList.forEach(function (value, index) {
                    if (value.code == "DRNAREA")
                        return;
                    var paramCheck = _this.checkParamList(_this.studyAreaService.studyAreaParameterList, value);
                    if (_this.multipleParameterSelectorAdd) {
                        //if its not there add it
                        if (paramCheck == -1)
                            _this.studyAreaService.studyAreaParameterList.push(value);
                        value['checked'] = true;
                    }
                    else {
                        //remove it
                        if (paramCheck > -1)
                            _this.studyAreaService.studyAreaParameterList.splice(paramCheck, 1);
                        value['checked'] = false;
                    }
                });
                //flip toggle
                this.multipleParameterSelectorAdd = !this.multipleParameterSelectorAdd;
            };
            SidebarController.prototype.updateStudyAreaParameterList = function (parameter) {
                console.log('in updatestudyarea parameter', parameter);
                //don't mess with DRNAREA
                if (parameter.code == "DRNAREA") {
                    this.toaster.pop("info", "Information", "DRNAREA cannot be unselected");
                    //keep it checked in regionservice parameterlist
                    this.regionService.parameterList.forEach(function (value, index) {
                        if (value.code == parameter.code) {
                            value['checked'] = true;
                        }
                    });
                    return;
                }
                var index = this.studyAreaService.studyAreaParameterList.indexOf(parameter);
                if (index > -1) {
                    //remove it
                    this.studyAreaService.studyAreaParameterList.splice(index, 1);
                }
                else {
                    //add it
                    //console.log(angular.toJson(parameter));
                    this.studyAreaService.studyAreaParameterList.push(parameter);
                }
            };
            SidebarController.prototype.calculateParameters = function () {
                console.log('in Calculate Parameters');
                this.studyAreaService.loadParameters();
            };
            SidebarController.prototype.checkForBasinEdits = function () {
                //check if basin has been edited, if so we need to re-query regression regions
                if (this.studyAreaService.WatershedEditDecisionList.append.length > 0 || this.studyAreaService.WatershedEditDecisionList.remove.length > 0)
                    this.studyAreaService.loadEditedStudyBoundary();
                //if not, just continue
                this.setProcedureType(3);
            };
            SidebarController.prototype.generateReport = function () {
                console.log('in estimateFlows');
                if (this.nssService.selectedStatisticsGroup && this.nssService.showFlowsTable) {
                    this.nssService.estimateFlows(this.studyAreaService.studyAreaParameterList, this.regionService.selectedRegion.RegionID, this.nssService.selectedStatisticsGroup.ID, this.studyAreaService.selectedStudyArea.RegressionRegions[0]);
                }
                this.reportService.openReport();
            };
            SidebarController.prototype.checkRegulation = function () {
                this.studyAreaService.upstreamRegulation();
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            SidebarController.prototype.canUpdateProcedure = function (pType) {
                //console.log('in canUpdateProcedure');
                //Project flow:
                var msg;
                try {
                    switch (pType) {
                        case 1 /* INIT */:
                            return true;
                        case 2 /* IDENTIFY */:
                            return this.regionService.selectedRegion != null;
                        case 3 /* SELECT */:
                            //proceed if there is a regression re
                            return this.nssService.queriedRegions;
                        case 4 /* REFINE */:
                            return this.studyAreaService.parametersLoaded;
                        case 5 /* BUILD */:
                            return this.studyAreaService.parametersLoaded;
                        default:
                            return false;
                    }
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
            SidebarController.$inject = ['$scope', 'toaster', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'StreamStats.Services.ReportService', 'leafletData'];
            return SidebarController;
        })(); //end class
        var ProcedureType;
        (function (ProcedureType) {
            ProcedureType[ProcedureType["INIT"] = 1] = "INIT";
            ProcedureType[ProcedureType["IDENTIFY"] = 2] = "IDENTIFY";
            ProcedureType[ProcedureType["SELECT"] = 3] = "SELECT";
            ProcedureType[ProcedureType["REFINE"] = 4] = "REFINE";
            ProcedureType[ProcedureType["BUILD"] = 5] = "BUILD";
        })(ProcedureType || (ProcedureType = {}));
        angular.module('StreamStats.Controllers').controller('StreamStats.Controllers.SidebarController', SidebarController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module
//# sourceMappingURL=SidebarController.js.map