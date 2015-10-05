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
    interface ISidebarController {
        sideBarCollapsed: boolean;
        selectedProcedure: ProcedureType;
        selectedStatisticsGroup: Services.IStatisticsGroup;
        setProcedureType(pType: ProcedureType): void;
        toggleSideBar(): void;
        //setDelineateFlag(): void;
    }
    
    class SidebarController implements ISidebarController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public sideBarCollapsed: boolean;
        public selectedProcedure: ProcedureType;

        public regionList: Array<Services.IRegion>;
        //public parameterList: Array<Services.IParameter>;
        //public statisticsGroupList: Array<Services.IStatisticsGroup>;
        public selectedStatisticsGroup: Services.IStatisticsGroup;
        private searchService: WiM.Services.ISearchAPIService;
        private regionService: Services.IRegionService;
        private nssService: Services.InssService;
        private studyAreaService: Services.IStudyAreaService;        

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService'];
        constructor($scope: ISidebarControllerScope, service: WiM.Services.ISearchAPIService, region: Services.IRegionService, studyArea: Services.IStudyAreaService, StatisticsGroup: Services.InssService) {
            $scope.vm = this;
            this.searchService = service;
            this.sideBarCollapsed = false;
            this.selectedProcedure = ProcedureType.INIT;
            this.regionService = region;
            this.regionList = region.regionList; 
            //this.parameterList = region.parameterList;    
            this.nssService = StatisticsGroup;
            //this.statisticsGroupList = StatisticsGroup.statisticsGroupList;
            this.studyAreaService = studyArea;

            //subscribe to Events

            //watches for changes to selected StatisticsGroup param list and updates studyareaParamList with them
            $scope.$watchCollection(() => this.nssService.selectedStatisticsGroupParameterList,(newval, oldval) => {
                console.log('StatisticsGroup param list changed.  loaded ', newval.length, ' parameters from StatisticsGroup');

                this.studyAreaService.studyAreaParameterList = [];
                this.regionService.parameterList.map(function (val) {

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
        public getLocations(term: string):ng.IPromise<Array<WiM.Services.ISearchAPIOutput>> {
            return this.searchService.getLocations(term);
        }
        public setProcedureType(pType: ProcedureType) {    
            console.log('in setProcedureType', this.selectedProcedure, pType, !this.canUpdateProcedure(pType));     
            if (this.selectedProcedure == pType || !this.canUpdateProcedure(pType)) return;
            this.selectedProcedure = pType;
        }
        public toggleSideBar(): void {
            if (this.sideBarCollapsed) this.sideBarCollapsed = false;
            else this.sideBarCollapsed = true;          
        }
        public onAOISelect(item: WiM.Services.ISearchAPIOutput) {
            this.searchService.onSelectedAreaOfInterestChanged.raise(this, new WiM.Services.SearchAPIEventArgs(item));
        }
        public setRegion(region: Services.IRegion) {
            if (this.regionService.selectedRegion == undefined || this.regionService.selectedRegion.RegionID !== region.RegionID)
                this.regionService.selectedRegion = region;
            this.setProcedureType(ProcedureType.IDENTIFY);

            //get available parameters
            this.regionService.loadParametersByRegion();

        }
        public startDelineate() {
            //clear out parameter list, flow report, etc
            this.studyAreaService.studyAreaParameterList = [];
            this.studyAreaService.parametersLoading = false;
            this.studyAreaService.parametersLoaded = false;
            this.nssService.statisticsGroupList = [];
            this.nssService.selectedStatisticsGroup = null;
            this.nssService.selectedStatisticsGroupParameterList = [];
            this.nssService.selectedStatisticsGroupScenario = [];
            this.nssService.selectedStatisticsGroupScenarioResults = [];

            this.studyAreaService.doDelineateFlag = !this.studyAreaService.doDelineateFlag;
        }

        public setStatisticsGroup(statisticsGroup: Services.IStatisticsGroup) {

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
            this.nssService.loadParametersByStatisticsGroup(this.regionService.selectedRegion.RegionID, this.nssService.selectedStatisticsGroup.ID, this.studyAreaService.selectedStudyArea.RegressionRegions[0])

            //select subset of parameters from list
            this.nssService.selectedStatisticsGroupParameterList
        }

        public updateStudyAreaParameterList(parameter: any) {
            //console.log('studyareaparamList length: ', this.studyAreaService.studyAreaParameterList.length);
            var index = this.studyAreaService.studyAreaParameterList.indexOf(parameter);
            if (index > -1) {
                //remove it
                this.studyAreaService.studyAreaParameterList.splice(index,1);
            }
            else {
                //add it
                this.studyAreaService.studyAreaParameterList.push(parameter);
            }
            //console.log('studyareaparamList length: ', this.studyAreaService.studyAreaParameterList.length);
        }

        public calculateParameters() {

            this.studyAreaService.loadParameters();

            //this.setProcedureType(ProcedureType.REFINE);
        }

        public queryRegressionRegions() {

            console.log('in Query Regression Regions');

            this.setProcedureType(ProcedureType.SELECT);

            //send watershed to map service query that returns list of regression regions that overlap the watershed
            //DO MAP SERVICE REQUEST HERE
            
            //region placeholder
            this.studyAreaService.selectedStudyArea.RegressionRegions = ['290'];

            this.queryStatisticGroups();

        }

        public queryStatisticGroups() {

            console.log('in Query Statistics Groups');

            //hardcoded to first entry for now
            this.nssService.loadStatisticsGroupTypes(this.regionService.selectedRegion.RegionID,this.studyAreaService.selectedStudyArea.RegressionRegions[0]);
        }

        public estimateFlows(studyAreaParameterList: any) {

            console.log('in estimateFlows');

            //hardcoded to first entry for now
            this.nssService.estimateFlows(studyAreaParameterList, this.regionService.selectedRegion.RegionID, this.nssService.selectedStatisticsGroup.ID, this.studyAreaService.selectedStudyArea.RegressionRegions[0]);

        }

        public checkRegulation() {

            console.log('berp', this.studyAreaService.studyAreaParameterList.length, this.studyAreaService.parametersLoaded);
            if (this.studyAreaService.studyAreaParameterList.length < 1 || !this.studyAreaService.parametersLoaded) {
                alert('Select some parameters and make sure they are calcuated');
                return;
            }


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
                        return this.regionService.selectedRegion != null;
                    case ProcedureType.REFINE:
                        return this.studyAreaService.studyAreaParameterList.length > 0;
                    case ProcedureType.BUILD:
                        return this.nssService.selectedStatisticsGroupParameterList.length > 0;
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
 