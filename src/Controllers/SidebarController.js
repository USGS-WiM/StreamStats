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
            function SidebarController($scope, service, region, studyArea, scenario) {
                var _this = this;
                $scope.vm = this;
                this.searchService = service;
                this.sideBarCollapsed = false;
                this.selectedProcedure = 1 /* INIT */;
                this.regionService = region;
                this.regionList = region.regionList;
                //this.parameterList = region.parameterList;    
                this.nssService = scenario;
                //this.scenarioList = scenario.scenarioList;
                this.studyAreaService = studyArea;
                //subscribe to Events
                $scope.$watchCollection(function () { return _this.nssService.selectedScenarioParameterList; }, function (newval, oldval) {
                    //console.log('scenario param list changed.  loaded ', newval.length, ' parameters from scenario');
                    _this.studyAreaService.studyAreaParameterList = [];
                    _this.regionService.parameterList.map(function (val) {
                        angular.forEach(scenario.selectedScenarioParameterList, function (value, index) {
                            if (val.code.toLowerCase() == value.code.toLowerCase()) {
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
            SidebarController.prototype.setRegion = function (region) {
                if (this.regionService.selectedRegion == undefined || this.regionService.selectedRegion.RegionID !== region.RegionID)
                    this.regionService.selectedRegion = region;
                this.setProcedureType(2 /* IDENTIFY */);
                //get available parameters
                this.regionService.loadParametersByRegion();
                //get available scenarios
                this.nssService.loadScenariosByRegion(this.regionService.selectedRegion.RegionID);
            };
            SidebarController.prototype.setDelineateFlag = function () {
                this.studyAreaService.doDelineateFlag = !this.studyAreaService.doDelineateFlag;
            };
            SidebarController.prototype.setScenario = function (scenario) {
                if (this.nssService.selectedScenario == scenario)
                    return;
                this.nssService.selectedScenario = scenario;
                console.log(scenario.ModelType, ' clicked');
                //clear studyareaParameterList
                this.studyAreaService.studyAreaParameterList = [];
                //get list of params for selected scenario
                this.nssService.loadParametersByScenario(this.nssService.selectedScenario.ModelType, this.regionService.selectedRegion.RegionID);
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
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            SidebarController.prototype.canUpdateProcedure = function (pType) {
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
                            //if (!this.fileLoaded) this.sm(new MSG.NotificationArgs("Import a valid lab document", MSG.NotificationType.WARNING));
                            return false;
                        case 5 /* BUILD */:
                            return false;
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
            SidebarController.$inject = ['$scope', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService'];
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