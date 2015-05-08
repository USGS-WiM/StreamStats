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
    }
    
    class SidebarController implements ISidebarController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public sideBarCollapsed: boolean;
        public selectedProcedure: ProcedureType;

        public sessionService: StreamStats.Services.ISessionService;
        public regionList: Array<Models.IRegion>;
        private searchService: WiM.Services.ISearchAPIService;
        

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', 'WiM.Services.SearchAPIService', 'StreamStats.Services.SessionService','StreamStats.Services.RegionService'];
        constructor($scope: ISidebarControllerScope, service:WiM.Services.ISearchAPIService, session:Services.ISessionService, region:Services.IRegionService) {
            $scope.vm = this;
            this.searchService = service;
            this.sideBarCollapsed = false;
            this.selectedProcedure = ProcedureType.INIT;

            this.sessionService = session;
            this.regionList = region.regionList;
    
        }
        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public GetLocations(term: string) {
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
            this.sessionService.selectedAreaOfInterest = item;
        }
        public setRegion(region: Models.IRegion) {
            if (this.sessionService.selectedRegion == undefined || this.sessionService.selectedRegion.RegionID !== region.RegionID)
                this.sessionService.selectedRegion = region;
            this.setProcedureType(ProcedureType.IDENTIFY);
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

                        return this.sessionService.selectedRegion != null;
                    case ProcedureType.SELECT:

                        return this.sessionService.selectedRegion != null;

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
 