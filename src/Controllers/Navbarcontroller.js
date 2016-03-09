//------------------------------------------------------------------------------
//----- NavbarController ------------------------------------------------------
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
        'use strict';
        var NavbarController = (function () {
            function NavbarController($scope, modal, studyArea) {
                $scope.vm = this;
                this.modalService = modal;
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            NavbarController.prototype.openReport = function () {
                this.modalService.openModal(StreamStats.Services.SSModalType.e_report);
            };
            NavbarController.prototype.openAbout = function () {
                this.modalService.openModal(StreamStats.Services.SSModalType.e_about);
            };
            NavbarController.prototype.openHelp = function () {
                this.modalService.openModal(StreamStats.Services.SSModalType.e_help);
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            NavbarController.$inject = ['$scope', 'StreamStats.Services.ModalService', 'StreamStats.Services.StudyAreaService'];
            return NavbarController;
        })(); //end class
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.NavbarController', NavbarController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module
//# sourceMappingURL=Navbarcontroller.js.map