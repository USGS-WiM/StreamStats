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
        public http: any;
        private regionService: Services.IRegionService;
        private StudyArea: StreamStats.Models.IStudyArea;
        private StudyAreaService: Services.IStudyAreaService;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        private modalService: Services.IModalService;
        public selectedAboutTabName: string;
        public regionArticle: Object;
        public AppVersion: string;
        public regionURL: string;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', '$sce' , 'StreamStats.Services.ModalService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', '$modalInstance'];
        constructor($scope: IAboutControllerScope, $http: ng.IHttpService, $sce: any, modalService: Services.IModalService, region: Services.IRegionService, studyAreaService: StreamStats.Services.IStudyAreaService, modal:ng.ui.bootstrap.IModalServiceInstance) {
            super($http, configuration.baseurls.StreamStats);
            $scope.vm = this;
            this.sce = $sce;
            this.modalInstance = modal;
            this.modalService = modalService;
            this.StudyArea = studyAreaService.selectedStudyArea;
            this.StudyAreaService = studyAreaService;
            this.regionService = region;
            this.selectedAboutTabName = "about";
            this.regionArticle = '<h3>No State or Region Selected</h3>';
            this.regionURL = "https://www.usgs.gov/streamstats/state-and-region-based-info"
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
            var regionID;

            if (this.modalService.modalOptions) {
                if (this.modalService.modalOptions.tabName) this.selectAboutTab(this.modalService.modalOptions.tabName);
                regionID = this.modalService.modalOptions.regionID;
            }

            if (this.regionService.selectedRegion) regionID = this.regionService.selectedRegion.Name;

            if (!regionID) return;
            //console.log("Trying to open help article for: ", regionID);
            
            //check if this state/region is enabled in appConfig.js
            configuration.regions.forEach((value) => {
                //find this state/region
                if (value.Name === regionID) {
                    if (!value.regionEnabled) {
                        this.regionArticle = '<div class="wim-alert">StreamStats has not been developed for <strong>' + value.Name + '</strong>.  Please contact the <a href="mailto:support@streamstats.freshdesk.com">streamstats team</a> if you would like StreamStats enabled for this State/Region.</div>';
                    }
                    //otherwise get region help url
                    else {
                        if (value.URL == null) { // Doesnt have state webpage
                            this.regionArticle = '<div class="wim-alert">There is currently no state/region page for <strong>' + value.Name + '</strong>.  Please contact the <a href="mailto:support@streamstats.freshdesk.com">streamstats team</a> with any questions.</div>';
                        } else { // Has state webpage
                            this.regionArticle = null;
                            this.regionURL = value.URL
                        }
                    }
                }
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
            this.getRegionHelpArticle();
        }
      
    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.AboutController', AboutController);
}//end module 