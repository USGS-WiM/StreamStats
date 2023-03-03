//------------------------------------------------------------------------------
//----- BatchProcessorController ---------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2023 USGS WIM

//    authors:  Andrew R Laws USGS Web Informatics and Mapping
//              Martyn J. Smith USGS Wisconsin Internet Mapping
//
//
//   purpose:
//
//discussion:


//Comments
//03.07.2016 mjs - Created
//02.02.2023 arl - Adapted from AboutController

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
        public flowStatsList: Array<any>;
        public selectedRegion: string;
        public flowStatsAllChecked: boolean;
        public regionStatsList: Array<any>;
        public parameterListBP: Array<any>;

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
            this.regionStatsList = [];
            this.flowStatsAllChecked = true;
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
        }

        // get list of regions/stats from nssservices/regions
        // Used getFreshDeskArticles from HelpController as template
        public getRegions(): void {
            // call an ng.IPromise first
            this.nssService.getRegionList().then(
                // set regionList to values of promised response
                response => { this.regionList = response; }

            );
            this.flowStatsAllChecked = true;
        }
        
        // send selected region code and retrieve flows stats list
        public getFlowStats(rcode:string): void {
            
            this.nssService.getFlowStatsList(rcode).then(
                // set flowStatsList to values of promised response
                response => { this.flowStatsList = response; }

            );
        }

        // uncheck/check all flow statistics
        public toggleflowStatsAllChecked(): void {

            this.flowStatsList.forEach((parameter) => {

                var statisticGroupID = parameter.statisticGroupID

                var paramCheck = this.checkArrayForObj(this.regionStatsList, statisticGroupID);

                if (this.flowStatsAllChecked) {

                    //if its not there add it
                    if (paramCheck == -1) this.regionStatsList.push(statisticGroupID);
                    parameter.checked = true;
                }
                else {

                    //remove it only if toggleable
                    if (paramCheck > -1) {
                        this.regionStatsList.splice(paramCheck, 1);
                        //this.toaster.pop('warning', parameter.code + " is required by one of the selected scenarios", "It cannot be unselected");
                        parameter.checked = false;
                    }
                }


            });

            // toggle switch
            this.flowStatsAllChecked = !this.flowStatsAllChecked;
        }

        public updateRegionStatsList(parameter: any) {

            //dont mess with certain parameters
            // if (parameter.toggleable == false) {
            //     this.toaster.pop('warning', parameter.code + " is required by one of the selected scenarios", "It cannot be unselected");
            //     parameter.checked = true;
            //     return;
            // }
            var statisticGroupID = parameter.statisticGroupID;

            var index = this.regionStatsList.indexOf(statisticGroupID);

            if (!parameter.checked && index > -1) {
                //remove it
                parameter.checked = false;
                this.regionStatsList.splice(index, 1);
            }
            else if (parameter.checked && index == -1) {
                //add it
                parameter.checked = true;
                this.regionStatsList.push(statisticGroupID);
            }
            // calling this makes select all the default when any are unchecked
            this.checkParameters();
        }

        public checkParameters() {
            // change select all parameters toggle to match if all params are checked or not
            let allChecked = true;
            for (let param of this.regionStatsList) {
                if (!param.checked) {
                    allChecked = false;
                }
            }
            if (allChecked) {
                this.flowStatsAllChecked = false;
            } else {
                this.flowStatsAllChecked = true;
            }
        }

        // load parameters for regions once selected
        public loadParametersByRegionBP(rcode: string): void {

            this.getParametersByRegionBP(rcode).then(
                // set flowStatsList to values of promised response
                response => { this.parameterListBP = response; },
                
            );
        }

        // Service methods
        // get flowstats list for region and nation
        public getParametersByRegionBP(rcode: string): ng.IPromise<any> {

            if (!rcode) return;
            var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSAvailableParams'].format(rcode);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            // console.log(request)
            return this.Execute(request).then(
                (response: any) => {
                    // create array to return
                    var paramRaw = [];

                    response.data.parameters.forEach((parameter) => {
                        parameter.checked = false;
                        parameter.toggleable = true;

                        paramRaw.push(parameter);
                    });
                    // console.log("paramRaw", paramRaw);

                    return paramRaw;
                }, (error) => {
                    
                }).finally(() => {
                });
        }
        // Helper Methods
        // -+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            this.AppVersion = configuration.version;
            this.getRegions();
        }
        
        private checkArrayForObj(arr, obj) {
            for (var i = 0; i < arr.length; i++) {
                if (angular.equals(arr[i], obj)) {
                    return i;
                }
            };
            return -1;
        }

    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.BatchProcessorController', BatchProcessorController);
}//end module 