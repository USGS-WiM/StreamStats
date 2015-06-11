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
        private searchService: WiM.Services.ISearchAPIService;
        private regionService: Services.IRegionService;
        private studyAreaService: Services.IStudyAreaService;
        

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService'];
        constructor($scope: ISidebarControllerScope, service: WiM.Services.ISearchAPIService, region: Services.IRegionService, studyArea: Services.IStudyAreaService) {
            $scope.vm = this;
            this.searchService = service;
            this.sideBarCollapsed = false;
            this.selectedProcedure = ProcedureType.INIT;
            this.regionService = region;
            this.regionList = region.regionList;    
            this.studyAreaService = studyArea;
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public getLocations(term: string):ng.IPromise<Array<WiM.Services.ISearchAPIOutput>> {
            return this.searchService.getLocations(term);
        }
        public setProcedureType(pType: ProcedureType) {           
            if (this.selectedProcedure == pType || !this.canUpdateProceedure(pType)) return;
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
        }
        public setDelineateFlag(): void {
            this.studyAreaService.doDelineateFlag = !this.studyAreaService.doDelineateFlag;
        }
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private canUpdateProceedure(pType: ProcedureType): boolean {
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
 