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
        selectedScenario: Services.IScenario;
        setProcedureType(pType: ProcedureType): void;
        toggleSideBar(): void;
        setDelineateFlag(): void;
    }
    
    class SidebarController implements ISidebarController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public sideBarCollapsed: boolean;
        public selectedProcedure: ProcedureType;

        public regionList: Array<Services.IRegion>;
        //public parameterList: Array<Services.IParameter>;
        //public scenarioList: Array<Services.IScenario>;
        public selectedScenario: Services.IScenario;
        private searchService: WiM.Services.ISearchAPIService;
        private regionService: Services.IRegionService;
        private nssService: Services.InssService;
        private studyAreaService: Services.IStudyAreaService;
        

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService'];
        constructor($scope: ISidebarControllerScope, service: WiM.Services.ISearchAPIService, region: Services.IRegionService, studyArea: Services.IStudyAreaService, scenario: Services.InssService) {
            $scope.vm = this;
            this.searchService = service;
            this.sideBarCollapsed = false;
            this.selectedProcedure = ProcedureType.INIT;
            this.regionService = region;
            this.regionList = region.regionList; 
            //this.parameterList = region.parameterList;    
            this.nssService = scenario;
            //this.scenarioList = scenario.scenarioList;
            this.studyAreaService = studyArea;

            //subscribe to Events
            $scope.$watchCollection(() => this.nssService.selectedScenarioParameterList,(newval, oldval) => {
                //console.log('scenario param list changed.  loaded ', newval.length, ' parameters from scenario');

                this.studyAreaService.studyAreaParameterList = [];
                this.regionService.parameterList.map(function (val) {

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
        public getLocations(term: string):ng.IPromise<Array<WiM.Services.ISearchAPIOutput>> {
            return this.searchService.getLocations(term);
        }
        public setProcedureType(pType: ProcedureType) {           
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

            //get available scenarios
            this.nssService.loadScenariosByRegion(this.regionService.selectedRegion.RegionID);
        }
        public setDelineateFlag(): void {
            this.studyAreaService.doDelineateFlag = !this.studyAreaService.doDelineateFlag;
        }
        public setScenario(scenario: Services.IScenario) {
            if (this.nssService.selectedScenario == scenario) return;
            this.nssService.selectedScenario = scenario;

            console.log(scenario.ModelType, ' clicked');

            //clear studyareaParameterList
            this.studyAreaService.studyAreaParameterList = [];

            //get list of params for selected scenario
            this.nssService.loadParametersByScenario(this.nssService.selectedScenario.ModelType, this.regionService.selectedRegion.RegionID)
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

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private canUpdateProcedure(pType: ProcedureType): boolean {
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
                        //if (!this.fileLoaded) this.sm(new MSG.NotificationArgs("Import a valid lab document", MSG.NotificationType.WARNING));

                        return false
                    case ProcedureType.BUILD:
                        return false;

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
 