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
        private regionService: Services.IRegionService;
        private StudyArea: StreamStats.Models.IStudyArea;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        private modalService: Services.IModalService;
        public selectedAboutTabName: string;
        public displayMessage: string;
        public isValid: boolean;
        public regionSupportArticle: any;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.ModalService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', '$modalInstance'];
        constructor($scope: IAboutControllerScope, $http: ng.IHttpService, modalService: Services.IModalService, region: Services.IRegionService, studyAreaService: StreamStats.Services.IStudyAreaService, modal:ng.ui.bootstrap.IModalServiceInstance) {
            super($http, 'http://ssdev.cr.usgs.gov');
            $scope.vm = this;
            this.modalInstance = modal;
            this.modalService = modalService;
            this.StudyArea = studyAreaService.selectedStudyArea;
            this.regionService = region;
            this.selectedAboutTabName = "about";
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

        public getRegionHelpArticle() {

            $('#supportContent').html('<h3>No State or Region Selected</h3>');
            var regionID;

            if (this.modalService.modalOptions) {
                if (this.modalService.modalOptions.tabName) this.selectAboutTab(this.modalService.modalOptions.tabName);

                regionID = this.modalService.modalOptions.regionID;
            }

            if (this.regionService.selectedRegion) regionID = this.regionService.selectedRegion.Name;

            if (!regionID) return;
            console.log("Trying to open help page for: ", regionID);

            var headers = {
                "Authorization": "Basic " + btoa('yxAClTZwexFeIxpRR6g' + ":" + 'X'),
            };

            var url = 'https://streamstats.freshdesk.com/solution/categories/9000028363/folders/9000163015.json';
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);

            this.Execute(request).then(
                (response: any) => {
                    console.log('Successfully retrieved support desk request: ', response);

                    response.data.folder.articles.forEach((article) => {
                        if (article.title == regionID) {
                            console.log("Help article found for : ", regionID);
                            $('#supportContent').html('<h3>StreamStats for ' + regionID + '</h3>' + article.description);
                            return;

                        }
                        else {
                            console.log("No help article found");
                            $('#supportContent').html('<h3>No help article found for ' + regionID + '</h3>');
                        }

                    });

                }, (error) => {
                    //sm when error
                }).finally(() => {

                });

        }
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {   
            //console.log("in about controller");
            this.getRegionHelpArticle();
        }
      
    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.AboutController', AboutController);
}//end module 