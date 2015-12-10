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
module StreamStats.Controllers {
    'use strinct';
    interface ISidebarControllerScope extends ng.IScope {
        vm: SidebarController;
    }
    interface ILeafletData {
        getMap(): ng.IPromise<any>;
    }
    interface ISidebarController {
        sideBarCollapsed: boolean;
        selectedProcedure: ProcedureType;
        selectedStatisticsGroup: Services.IStatisticsGroup;
        setProcedureType(pType: ProcedureType): void;
        toggleSideBar(): void;
    }
    
    class SidebarController implements ISidebarController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public sideBarCollapsed: boolean;
        public selectedProcedure: ProcedureType;
        public toaster: any;
        public selectedStatisticsGroup: Services.IStatisticsGroup;
        private searchService: WiM.Services.ISearchAPIService;
        private regionService: Services.IRegionService;
        private nssService: Services.InssService;
        private studyAreaService: Services.IStudyAreaService;       
        private reportService: Services.IreportService;    
        private leafletData: ILeafletData;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', 'toaster', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'StreamStats.Services.ReportService', 'leafletData'];
        constructor($scope: ISidebarControllerScope, toaster, service: WiM.Services.ISearchAPIService, region: Services.IRegionService, studyArea: Services.IStudyAreaService, StatisticsGroup: Services.InssService, report: Services.IreportService, leafletData: ILeafletData) {
            $scope.vm = this;
            this.toaster = toaster;
            this.searchService = service;
            this.sideBarCollapsed = false;
            this.selectedProcedure = ProcedureType.INIT;
            this.regionService = region;
            this.nssService = StatisticsGroup;
            this.studyAreaService = studyArea;
            this.reportService = report;
            this.leafletData = leafletData;

            //watches for changes to selected StatisticsGroup param list and updates studyareaParamList with them
            $scope.$watchCollection(() => this.nssService.selectedStatisticsGroupParameterList,(newval, oldval) => {
                console.log('StatisticsGroup param list changed.  loaded ', newval.length, ' parameters from StatisticsGroup');

                //this.studyAreaService.studyAreaParameterList = [];
                this.regionService.parameterList.map((val) => {

                    this.nssService.selectedStatisticsGroupParameterList.forEach((value,index) => {
                        if (val.code.toLowerCase() == value['Code'].toLowerCase()) {
                            //make sure new object isn't already in the list
                            if (this.checkParamList(studyArea.studyAreaParameterList, val) == -1) studyArea.studyAreaParameterList.push(val);   
                            val['checked'] = true;           
                        }
                    });
                });
            });

            //watch for map based region changes here
            $scope.$watch(() => this.regionService.selectedRegion,(newval, oldval) => {
                console.log('region change', oldval, newval);
                if (newval == null) this.setProcedureType(1);
                else this.setProcedureType(2);
            });
      
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public getLocations(term: string):ng.IPromise<Array<WiM.Services.ISearchAPIOutput>> {
            return this.searchService.getLocations(term);
        }
        public setProcedureType(pType: ProcedureType) {    
            console.log('in setProcedureType', this.selectedProcedure, pType, !this.canUpdateProcedure(pType));     

            if (this.selectedProcedure == pType || !this.canUpdateProcedure(pType)) {
                //capture issues and send notifications here
                if (this.selectedProcedure == 3 && (pType == 4 || pType == 5)) this.toaster.pop("warning", "Warning", "Make sure you calculate selected basin characteristics before continuing", 5000);
                if (this.selectedProcedure == 2 && (pType == 3 || pType == 4 || pType == 5)) this.toaster.pop("warning", "Warning", "Make sure you click continue", 5000);
                return;
            }
            this.selectedProcedure = pType;
        }
        public toggleSideBar(): void {
            if (this.sideBarCollapsed) this.sideBarCollapsed = false;
            else this.sideBarCollapsed = true;          
        }
        public onAOISelect(item: WiM.Services.ISearchAPIOutput) {
            this.searchService.onSelectedAreaOfInterestChanged.raise(this, new WiM.Services.SearchAPIEventArgs(item));
        }
        public zoomRegion(inRegion: string) {
            var region = angular.fromJson(inRegion);
            console.log('zooming to region: ', region);
            
        }
        public setRegion(region: Services.IRegion) {
            console.log('setting region: ', region);
            if (this.regionService.selectedRegion == undefined || this.regionService.selectedRegion.RegionID !== region.RegionID)
                this.regionService.selectedRegion = region;
            this.setProcedureType(ProcedureType.IDENTIFY);

            //get available parameters
            this.regionService.loadParametersByRegion();
        }

        public resetWorkSpace() {
            this.regionService.clearRegion();
            this.studyAreaService.clearStudyArea();
            this.nssService.clearNSSdata();
        }

        public startDelineate() {

            this.leafletData.getMap().then((map: any) => {
                console.log('mapzoom', map.getZoom());
                if (map.getZoom() < 15) {
                    this.toaster.pop('error', "Delineate", "You must be at or above zoom level 15 to delineate.");
                    return;
                }
                else {
                    this.toaster.pop('success', "Delineate", "Click on a blue stream cell to start delineation");
                    this.studyAreaService.doDelineateFlag = !this.studyAreaService.doDelineateFlag;
                }
            });
        }

        public setStatisticsGroup(statisticsGroup: Services.IStatisticsGroup) {

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
        }


        public checkParamList(arr, obj) {
            for (var i = 0; i < arr.length; i++) {
                if (angular.equals(arr[i], obj)) {
                    return i;
                }
            };
            return -1;
        }

        public multipleParameterSelector(selection: string) {

            this.regionService.parameterList.forEach((value, index) => {
                if (value.code == "DRNAREA") return;

                if (selection == "all") {
                    value['checked'] = true;
                }
                if (selection == "none") {
                    value['checked'] = false;
                }
            });
        }

        public updateStudyAreaParameterList(parameter: any) {

            //don't mess with DRNAREA
            if (parameter.code == "DRNAREA") {

                this.toaster.pop("info", "Information", "DRNAREA cannot be unselected")

                //keep it checked in regionservice parameterlist
                this.regionService.parameterList.forEach((value, index) => {
                    if (value.code == parameter.code) {
                        value['checked'] = true;
                    }
                });
                return;
            }

            var index = this.studyAreaService.studyAreaParameterList.indexOf(parameter);
            if (index > -1) {
                //remove it
                this.studyAreaService.studyAreaParameterList.splice(index,1);
            }
            else {
                //add it
                //console.log(angular.toJson(parameter));
                this.studyAreaService.studyAreaParameterList.push(parameter);
            }
        }

        public calculateParameters() {

            console.log('in Calculate Parameters');
            this.studyAreaService.loadParameters();
        }

        public queryRegressionRegions() {

            console.log('in Query Regression Regions');

            this.nssService.queriedRegions = true;

            //send watershed to map service query that returns list of regression regions that overlap the watershed
            //DO MAP SERVICE REQUEST HERE
            
            //region placeholder
            this.studyAreaService.selectedStudyArea.RegressionRegions = ['290'];

            this.queryStatisticGroups();

            this.setProcedureType(3);
        }

        public queryStatisticGroups() {

            console.log('in Query Statistics Groups');

            //hardcoded to first entry for now
            this.nssService.loadStatisticsGroupTypes(this.regionService.selectedRegion.RegionID,this.studyAreaService.selectedStudyArea.RegressionRegions[0]);
        }

        public generateReport() {

            console.log('in estimateFlows');

            if (this.nssService.selectedStatisticsGroup && this.nssService.showFlowsTable) {

                this.nssService.estimateFlows(this.studyAreaService.studyAreaParameterList, this.regionService.selectedRegion.RegionID, this.nssService.selectedStatisticsGroup.ID, this.studyAreaService.selectedStudyArea.RegressionRegions[0]);
            }

            this.reportService.openReport();

        }

        public checkRegulation() {

            /* comment this out apparently don't need params calculated
            if (this.studyAreaService.studyAreaParameterList.length < 1 || !this.studyAreaService.parametersLoaded) {
                alert('Select some parameters and make sure they are calcuated');
                return;
            }

           */


            this.studyAreaService.upstreamRegulation();

        }



        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private canUpdateProcedure(pType: ProcedureType): boolean {
            //console.log('in canUpdateProcedure');
            //Project flow:
            var msg: string;
            try {               
                switch (pType) {
                    case ProcedureType.INIT:
                        return true;
                    case ProcedureType.IDENTIFY:
                        return this.regionService.selectedRegion != null;
                    case ProcedureType.SELECT:
                        //proceed if there is a regression re
                        return this.nssService.queriedRegions;
                    case ProcedureType.REFINE:
                        return this.studyAreaService.parametersLoaded;
                    case ProcedureType.BUILD:
                        return this.studyAreaService.parametersLoaded;
                    default:
                        return false;
                }//end switch          
            }
            catch (e) {
                //this.sm(new MSG.NotificationArgs(e.message, MSG.NotificationType.INFORMATION, 1.5));
                return false;
            }
        }
        private sm(msg: string) {
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
        }

  
    }//end class

    enum ProcedureType {
        INIT = 1,
        IDENTIFY = 2,
        SELECT = 3,
        REFINE = 4,
        BUILD = 5
    }

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.SidebarController', SidebarController)
    
}//end module
 