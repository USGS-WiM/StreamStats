//------------------------------------------------------------------------------
//----- About ---------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2016 WiM - USGS

//    authors:  Martyn J. Smith USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:


//Comments
//03.07.2016 mjs - Created

//Import

module StreamStats.Controllers {
    'use string';
    interface IAboutControllerScope extends ng.IScope {
        vm: IAboutController;
    }

    interface IModal {
        Close():void
    }
    
    interface IAboutController extends IModal {
    }

    class AboutController extends WiM.Services.HTTPServiceBase implements IAboutController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public sce: any;
        private regionService: Services.IRegionService;
        private StudyArea: StreamStats.Models.IStudyArea;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        private modalService: Services.IModalService;
        public selectedAboutTabName: string;
        public displayMessage: string;
        public isValid: boolean;
        public regionSupportArticle: any;
        public aboutArticle: string;
        public regionArticle: Object;
        public activeNewsArticles: Object;
        public pastNewsArticles: Object;
        public AppVersion: string;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', '$sce', 'StreamStats.Services.ModalService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', '$modalInstance'];
        constructor($scope: IAboutControllerScope, $http: ng.IHttpService, $sce: any, modalService: Services.IModalService, region: Services.IRegionService, studyAreaService: StreamStats.Services.IStudyAreaService, modal:ng.ui.bootstrap.IModalServiceInstance) {
            super($http, configuration.baseurls.StreamStats);
            $scope.vm = this;
            this.sce = $sce;
            this.modalInstance = modal;
            this.modalService = modalService;
            this.StudyArea = studyAreaService.selectedStudyArea;
            this.regionService = region;
            this.selectedAboutTabName = "about";
            this.regionArticle = '<h3>No State or Region Selected</h3>';
            this.init();  
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-

        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }

        public selectAboutTab(tabname: string): void {
            if (this.selectedAboutTabName == tabname) return;
            this.selectedAboutTabName = tabname;
            //console.log('selected tab: '+tabname);
        }

        public getActiveNews() {

            //console.log("Trying to open active news articles folder");

            var headers = {
                "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
            };

            var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.ActiveNewsFolder;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);

            this.Execute(request).then(
                (response: any) => {
                    //console.log('Successfully retrieved active news articles folder');

                    if (response.data.folder.articles.length) {
                        this.activeNewsArticles = response.data.folder.articles;                        
                    }

                }, (error) => {
                    //sm when error
                }).finally(() => {

                });

        }

        public getPastNews() {

            //console.log("Trying to open past news articles folder");

            var headers = {
                "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
            };

            var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.PastNewsFolder;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);

            this.Execute(request).then(
                (response: any) => {
                    //console.log('Successfully retrieved past news articles folder');

                    this.pastNewsArticles = response.data.folder.articles;

                }, (error) => {
                    //sm when error
                }).finally(() => {

                });

        }

        public getAboutArticle() {

            //console.log("Trying to open about article");

            var headers = {
                "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
            };

            var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.AboutArticle;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);

            this.Execute(request).then(
                (response: any) => {
                    //console.log('Successfully retrieved about article');

                    this.aboutArticle = response.data.article.description;

                }, (error) => {
                    //sm when error
                }).finally(() => {

                });

        }

        public getRegionHelpArticle() {

            var regionID;

            if (this.modalService.modalOptions) {
                if (this.modalService.modalOptions.tabName) this.selectAboutTab(this.modalService.modalOptions.tabName);

                regionID = this.modalService.modalOptions.regionID;
            }

            if (this.regionService.selectedRegion) regionID = this.regionService.selectedRegion.Name;

            if (!regionID) return;
            //console.log("Trying to open help article for: ", regionID);

            var headers = {
                "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
            };

            var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.RegionInfoFolder;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);

            //clear article
            this.regionArticle = '<i class="fa fa-spinner fa-3x fa-spin loadingSpinner"></i>';

            this.Execute(request).then(
                (response: any) => {

                    response.data.folder.articles.forEach((article) => {
                        if (article.title == regionID) {
                            //console.log("Help article found for : ", regionID);
                            this.regionArticle = article.description;
                            return;
                        }
                    });

                }, (error) => {
                    //sm when error
                }).finally(() => {

                });
        }

        public convertUnsafe(x: string) {
            return this.sce.trustAsHtml(x);
        };
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {   
            //console.log("in about controller");
            this.AppVersion = configuration.version;
            this.getAboutArticle();
            this.getRegionHelpArticle();
            this.getActiveNews();
            this.getPastNews();
        }

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
      
    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.AboutController', AboutController);
}//end module 