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
module StreamStats.Controllers {
    'use strict';
    interface INavbarControllerScope extends ng.IScope {
        vm: NavbarController;
    }
    interface INavbarController {
    }

    class NavbarController extends WiM.Services.HTTPServiceBase implements INavbarController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private modalService: Services.IModalService;
        private environment: string;
        private AppVersion: string;
        private cloud: boolean;
        private http: any;
        private studyAreaService: Services.IStudyAreaService;
        private showBatchButton;
        
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.ModalService', 'StreamStats.Services.StudyAreaService'];
        constructor($scope: INavbarControllerScope, $http: ng.IHttpService, modal: Services.IModalService, studyArea: Services.IStudyAreaService) {
            super($http, configuration.baseurls.StreamStats);
            $scope.vm = this;
            this.http = $http;
            
            this.modalService = modal;
            this.studyAreaService = studyArea;
            this.environment = configuration.environment;
            this.AppVersion = configuration.version;
            this.cloud = configuration.cloud;
            this.showBatchButton = configuration.showBPButton;

            this.checkURLParams();
            if (configuration.showWarningModal) {
                this.openWarningMessage();
            }
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public checkURLParams() {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const BP = urlParams.get('BP')
            const gage = urlParams.get('gage')
            if (BP) {
                if (BP == 'submitBatch') { // open submit batch processor page
                    this.modalService.openModal(Services.SSModalType.e_batchprocessor, { "tabName": "submitBatch"});
                }
                if (BP == 'batchStatus') { // open status batch processor page
                    const email = urlParams.get('email')
                    if (email) {
                        this.modalService.openModal(Services.SSModalType.e_batchprocessor, { "tabName": "batchStatus", "urlParams": email});
                    } else {
                        this.modalService.openModal(Services.SSModalType.e_batchprocessor, { "tabName": "batchStatus"});
                    }
                }
                if (BP == 'streamGrid') { // open streamgrids batch processor page
                    this.modalService.openModal(Services.SSModalType.e_batchprocessor, { "tabName": "streamGrid"});
                }
                if (BP == 'manageQueue') { // open queue batch processor page
                    this.modalService.openModal(Services.SSModalType.e_batchprocessor, { "tabName": "manageQueue"});
                }
            } else if (gage) {
                // Open gage page
                const tab = urlParams.get('tab')
                if (tab && tab == 'plots') {
                    // Open plots tab of gage page
                    this.modalService.openModal(Services.SSModalType.e_gagepage, { "siteid": gage, "tabName": "GageAnalysisPlots" });
                } else {
                    // Open info tab of gage page
                    this.modalService.openModal(Services.SSModalType.e_gagepage, { "siteid": gage, "tabName": "GageInformation" });
                }
            }
        }
        public openBatchProcessor(): void {
            this.modalService.openModal(Services.SSModalType.e_batchprocessor);
        }
        
        public openReport(): void {
            this.modalService.openModal(Services.SSModalType.e_report);
        }

        public openAbout(): void {
            this.modalService.openModal(Services.SSModalType.e_about);
        }

        public openHelp(): void {
            this.modalService.openModal(Services.SSModalType.e_help);
        }

        public openWarningMessage(): void {
            this.modalService.openModal(Services.SSModalType.e_warningmessage);
        }

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public readCookie(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }

        public createCookie(name, value, days) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toUTCString();
            }
            else var expires = "";
            document.cookie = name + "=" + value + expires + "; path=/";
        }

    }//end class
    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.NavbarController', NavbarController)

}//end module
