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
//02.02.2023 arl - Adapted 

//Import

module StreamStats.Controllers {
    'use string';
    interface IBatchProcessorControllerScope extends ng.IScope {
        vm: IBatchProcessorController;
    }

    interface IModal {
        Close():void
    }
    
    interface IBatchProcessorController extends IModal {
    }

    class BatchProcessorController extends WiM.Services.HTTPServiceBase implements IBatchProcessorController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public http: any;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        private modalService: Services.IModalService;
        private nssService: Services.InssService;
        public selectedBatchProcessorTabName: string;
        public displayMessage: string;
        public isValid: boolean;
        public AppVersion: string;  
        public submitBatchInfo: string;
        public regions: any;
        // public regions: any;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.ModalService', 'StreamStats.Services.nssService', '$modalInstance'];
        constructor($scope: IBatchProcessorControllerScope, $http: ng.IHttpService, nssService: Services.InssService, modalService: Services.IModalService, modal:ng.ui.bootstrap.IModalServiceInstance) {
            super($http, configuration.baseurls.StreamStats);
            $scope.vm = this;
            this.modalInstance = modal;
            this.modalService = modalService;
            this.selectedBatchProcessorTabName = "submitBatch";
            this.nssService = nssService;
            this.init();  
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-

        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }
       
        // used for switching between tabs
        public selectBatchProcessorTab(tabname: string): void {
            // if (this.selectedBatchProcessorTabName == tabname) return;
            this.selectedBatchProcessorTabName = tabname;
            // console.log('selected tab: '+tabname);
        }

        // get region list form nssservices/regions
        // public getRegionList(): void {
        //     this.$http.get("https://streamstats.usgs.gov/nssservices/regions")
        //         .then((data) => this.regionList = data);
            // console.log(this.regionList);
        // }

        public getRegions(): any {
            this.nssService.getRegionList();
        }

        // Helper Methods
        // -+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {   
            //console.log("in about controller");
            this.AppVersion = configuration.version;
            this.getRegions();
            }
        

    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.BatchProcessorController', BatchProcessorController);
}//end module 