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
        public regionList: Object;
        public flowStatsList: Object;
        public selectedRegion: str;

        public flowStatsAllChecked: boolean;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.ModalService', 'StreamStats.Services.nssService', '$modalInstance'];
        constructor($scope: IBatchProcessorControllerScope, $http: ng.IHttpService, modalService: Services.IModalService, nssService: Services.InssService, modal:ng.ui.bootstrap.IModalServiceInstance) {
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
            this.selectedBatchProcessorTabName = tabname;
            // console.log('selected tab: '+tabname);
        }

        // get list of regions/stats from nssservices/regions
        // Used getFreshDeskArticles from HelpController as template
        public getRegions(): void {
            // call an ng.IPromise first
            this.nssService.getRegionList().then(
                // set regionList to values of promised response
                response => { this.regionList = response; }

            );
        }
        
        

        // send selected region code and retrieve flows stats list
        public getFlowStats(rcode:string): void {

            // console.log(rcode)
            this.nssService.getFlowStatsList(rcode).then(
                // set flowStatsList to values of promised response
                response => { this.flowStatsList = response}
            );
        }

        // uncheck/check all flow statistics
        public toggleflowStatsAllChecked(): void {
            this.flowStatsAllChecked = !this.flowStatsAllChecked
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