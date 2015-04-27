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
///<reference path="../../bower_components/wim_angular/src/Services/SearchAPIService.ts" />

module StreamStats.Controllers {
    'use strinct';
    interface ISidebarControllerScope extends ng.IScope {
        vm: SidebarController;
    }
    interface ISidebarController {
        sideBarCollapsed: boolean;
        selectedProcedure: ProcedureType;
        SelectedRegion: Models.IRegion;

        setProcedureType(pType: ProcedureType): void;
        toggleSideBar(): void;
    }
    
    class SidebarController implements ISidebarController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public sideBarCollapsed: boolean;
        public selectedProcedure: ProcedureType;

        public RegionList:Array<Models.IRegion>
        public SelectedRegion: Models.IRegion;

        public selectedLocation: string;
        public locations: Array<string>;

        private searchService: WiM.Services.ISearchAPIService;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope','WiM.Services.SearchAPIService'];
        constructor($scope: ISidebarControllerScope, service:WiM.Services.ISearchAPIService) {
            $scope.vm = this;
            this.searchService = service;

            this.sideBarCollapsed = false;
            this.selectedProcedure = ProcedureType.INIT;

            this.RegionList = [new Models.Region('1', "Iowa"), new Models.Region('2', 'New York'), new Models.Region('2', 'New York2'), new Models.Region('2', 'New York3'), new Models.Region('2', 'Ill')];
            this.SelectedRegion = this.RegionList[0];

            this.selectedLocation = undefined;
     

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
    
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private canUpdateProceedure(pType: ProcedureType): boolean {
            //Project flow:
            var msg: string;
            try {               
                //switch (pType) {
                //    case ProcedureType.IMPORT:
                //        return !this.fileLoaded || !this.fileValid;
                //    case ProcedureType.VALIDATE:
                //        if (!this.fileLoaded || !this.fileValid) this.sm(new MSG.NotificationArgs("Import a valid lab document", MSG.NotificationType.WARNING));

                //        return this.fileLoaded && this.fileValid;
                //    case ProcedureType.SUBMIT:
                //        var isOK = this.fileIsOK();
                //        if (!this.fileLoaded || !this.fileValid) this.sm(new MSG.NotificationArgs("Import a valid lab document", MSG.NotificationType.WARNING));
                //        if (!isOK) this.sm(new MSG.NotificationArgs("Samples contains invalid entries. Please fix before submitting", MSG.NotificationType.WARNING));

                //        return isOK && this.fileLoaded && this.fileValid;

                //    case ProcedureType.LOG:
                //        if (!this.fileLoaded) this.sm(new MSG.NotificationArgs("Import a valid lab document", MSG.NotificationType.WARNING));

                //        return this.fileLoaded;
                //    default:
                //        return false;
                //}//end switch  
                return true;          
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
 