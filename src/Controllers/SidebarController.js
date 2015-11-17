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
            function SidebarController($scope, toaster, service, region, studyArea, StatisticsGroup, report) {
                var _this = this;
                $scope.vm = this;
                this.toaster = toaster;
                this.searchService = service;
                this.sideBarCollapsed = false;
                this.selectedProcedure = 1 /* INIT */;
                this.regionService = region;
                this.regionList = region.regionList;
                this.masterRegionList = region.masterRegionList;
                //this.parameterList = region.parameterList;    
                this.nssService = StatisticsGroup;
                //this.statisticsGroupList = StatisticsGroup.statisticsGroupList;
                this.studyAreaService = studyArea;
                this.reportService = report;
                //subscribe to Events
                //watches for changes to selected StatisticsGroup param list and updates studyareaParamList with them
                $scope.$watchCollection(function () { return _this.nssService.selectedStatisticsGroupParameterList; }, function (newval, oldval) {
                    console.log('StatisticsGroup param list changed.  loaded ', newval.length, ' parameters from StatisticsGroup');
                    _this.studyAreaService.studyAreaParameterList = [];
                    _this.regionService.parameterList.map(function (val) {
                        angular.forEach(StatisticsGroup.selectedStatisticsGroupParameterList, function (value, index) {
                            if (val.code.toLowerCase() == value['Code'].toLowerCase()) {
                                //console.log('match found', val.code);
                                studyArea.studyAreaParameterList.push(val);
                            }
                        });
                    });
                });
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            SidebarController.prototype.getLocations = function (term) {
                return this.searchService.getLocations(term);
            };
            SidebarController.prototype.setProcedureType = function (pType) {
                console.log('in setProcedureType', this.selectedProcedure, pType, !this.canUpdateProcedure(pType));
                if (this.selectedProcedure == pType || !this.canUpdateProcedure(pType))
                    return;
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
                var region = JSON.parse(inRegion);
                console.log('here1', region);
            };
            SidebarController.prototype.setRegion = function (region) {
                console.log('here1', region);
                if (this.regionService.selectedRegion == undefined || this.regionService.selectedRegion.RegionID !== region.RegionID)
                    this.regionService.selectedRegion = region;
                this.setProcedureType(2 /* IDENTIFY */);
                //get available parameters
                this.regionService.loadParametersByRegion();
            };
            SidebarController.prototype.startDelineate = function () {
                this.toaster.pop('success', "Delineate", "Click on a blue stream cell to start delineation");
                //clear out parameter list, flow report, etc
                this.studyAreaService.selectedStudyArea = null;
                this.studyAreaService.studyAreaParameterList = [];
                this.studyAreaService.parametersLoading = false;
                this.studyAreaService.parametersLoaded = false;
                this.nssService.statisticsGroupList = [];
                this.nssService.selectedStatisticsGroup = null;
                this.nssService.selectedStatisticsGroupParameterList = [];
                this.nssService.selectedStatisticsGroupScenario = [];
                this.nssService.selectedStatisticsGroupScenarioResults = [];
                this.studyAreaService.doDelineateFlag = !this.studyAreaService.doDelineateFlag;
            };
            SidebarController.prototype.setStatisticsGroup = function (statisticsGroup) {
                //if toggled remove selected parameter set
                if (this.nssService.selectedStatisticsGroup == statisticsGroup) {
                    this.nssService.selectedStatisticsGroup = null;
                    this.studyAreaService.studyAreaParameterList = [];
                    return;
                }
                this.nssService.selectedStatisticsGroup = statisticsGroup;
                console.log(statisticsGroup.Name, ' clicked');
                //clear studyareaParameterList
                this.studyAreaService.studyAreaParameterList = [];
                //get list of params for selected StatisticsGroup
                this.nssService.loadParametersByStatisticsGroup(this.regionService.selectedRegion.RegionID, this.nssService.selectedStatisticsGroup.ID, this.studyAreaService.selectedStudyArea.RegressionRegions[0]);
                //select subset of parameters from list
                this.nssService.selectedStatisticsGroupParameterList;
            };
            SidebarController.prototype.updateStudyAreaParameterList = function (parameter) {
                //console.log('studyareaparamList length: ', this.studyAreaService.studyAreaParameterList.length);
                var index = this.studyAreaService.studyAreaParameterList.indexOf(parameter);
                if (index > -1) {
                    //remove it
                    this.studyAreaService.studyAreaParameterList.splice(index, 1);
                }
                else {
                    //add it
                    this.studyAreaService.studyAreaParameterList.push(parameter);
                }
                //console.log('studyareaparamList length: ', this.studyAreaService.studyAreaParameterList.length);
            };
            SidebarController.prototype.calculateParameters = function () {
                console.log('in Calculate Parameters');
                this.studyAreaService.loadParameters();
            };
            SidebarController.prototype.checkEdits = function () {
                if (this.studyAreaService.editedAreas) {
                    this.queryRegressionRegions();
                }
                else {
                    this.queryRegressionRegions();
                }
            };
            SidebarController.prototype.queryRegressionRegions = function () {
                console.log('in Query Regression Regions');
                this.setProcedureType(3 /* SELECT */);
                //send watershed to map service query that returns list of regression regions that overlap the watershed
                //DO MAP SERVICE REQUEST HERE
                //region placeholder
                this.studyAreaService.selectedStudyArea.RegressionRegions = ['290'];
                this.queryStatisticGroups();
            };
            SidebarController.prototype.queryStatisticGroups = function () {
                console.log('in Query Statistics Groups');
                //hardcoded to first entry for now
                this.nssService.loadStatisticsGroupTypes(this.regionService.selectedRegion.RegionID, this.studyAreaService.selectedStudyArea.RegressionRegions[0]);
            };
            SidebarController.prototype.estimateFlows = function (studyAreaParameterList) {
                console.log('in estimateFlows');
                //hardcoded to first entry for now
                if (this.nssService.selectedStatisticsGroup) {
                    this.nssService.estimateFlows(studyAreaParameterList, this.regionService.selectedRegion.RegionID, this.nssService.selectedStatisticsGroup.ID, this.studyAreaService.selectedStudyArea.RegressionRegions[0]);
                }
                this.reportService.openReport();
            };
            SidebarController.prototype.checkRegulation = function () {
                console.log('berp', this.studyAreaService.studyAreaParameterList.length, this.studyAreaService.parametersLoaded);
                if (this.studyAreaService.studyAreaParameterList.length < 1 || !this.studyAreaService.parametersLoaded) {
                    alert('Select some parameters and make sure they are calcuated');
                    return;
                }
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
                            return this.regionService.selectedRegion != null;
                        case 4 /* REFINE */:
                            return this.studyAreaService.parametersLoaded;
                        case 5 /* BUILD */:
                            //return this.nssService.selectedStatisticsGroupParameterList.length > 0;
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
            SidebarController.$inject = ['$scope', 'toaster', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'StreamStats.Services.ReportService'];
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