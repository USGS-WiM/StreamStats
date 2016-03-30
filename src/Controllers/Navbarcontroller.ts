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
        private cookies: any;
        private newArticleCount: number;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.ModalService', 'StreamStats.Services.StudyAreaService'];
        constructor($scope: INavbarControllerScope, $http: ng.IHttpService, modal: Services.IModalService, studyArea: Services.IStudyAreaService) {
            super($http, configuration.baseurls.StreamStatsServices);
            $scope.vm = this;
            this.modalService = modal;
            this.checkActiveNews();
            this.newArticleCount = 0;
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public checkActiveNews() {
            console.log("Checking for active news articles");

            var headers = {
                "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
            };

            var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.ActiveNewsFolder;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);

            this.Execute(request).then(
                (response: any) => {
                    console.log('Successfully retrieved active news articles page');

                    if (response.data.folder.articles.length > 0) {
                        response.data.folder.articles.forEach((article) => {
                            //check if a cookie exists for this article;
                            if (this.readCookie(article.id) == null) {
                                console.log('New news article found: ', article);
                                this.newArticleCount += 1;
                                this.createCookie(article.id, true, 30);
                            }
                        });

                        if (this.newArticleCount > 0) this.modalService.openModal(Services.SSModalType.e_about, { "tabName": "news", "regionID": '' })
                    }

                }, (error) => {
                    //sm when error
                }).finally(() => {

                });
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
  