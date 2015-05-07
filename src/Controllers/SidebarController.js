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
            function SidebarController($scope, service, session, region) {
                $scope.vm = this;
                this.searchService = service;
                this.sideBarCollapsed = false;
                this.selectedProcedure = 1 /* INIT */;
                this.sessionService = session;
                this.regionList = region.regionList;
                this.SelectedRegion = session.selectedRegion;
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            SidebarController.prototype.GetLocations = function (term) {
                return this.searchService.getLocations(term);
            };
            SidebarController.prototype.setProcedureType = function (pType) {
                if (this.selectedProcedure == pType || !this.canUpdateProceedure(pType))
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
                this.sessionService.selectedAreaOfInterest = item;
            };
            SidebarController.prototype.setRegion = function (region) {
                if (this.sessionService.selectedRegion == undefined || this.sessionService.selectedRegion.RegionID !== region.RegionID)
                    this.sessionService.selectedRegion = region;
                this.setProcedureType(2 /* IDENTIFY */);
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            SidebarController.prototype.canUpdateProceedure = function (pType) {
                //Project flow:
                var msg;
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
            };
            SidebarController.prototype.sm = function (msg) {
                try {
                }
                catch (e) {
                }
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            SidebarController.$inject = ['$scope', 'WiM.Services.SearchAPIService', 'StreamStats.Services.SessionService', 'StreamStats.Services.RegionService'];
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