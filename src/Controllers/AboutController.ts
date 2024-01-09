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
        public selectedRegion; 

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
            this.selectedRegion = null;
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
                    this.selectedRegion = value
                }
            });
        }

        public openSubmitSupport(e){
            this.Close();
            e.stopPropagation(); e.preventDefault();
            this.modalService.openModal(Services.SSModalType.e_help, { "tabName": "submitTicket"});
        }

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