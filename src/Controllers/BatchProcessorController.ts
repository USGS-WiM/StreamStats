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
        public flowStatChecked: boolean;
        public requiredParamList: Array<any>

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
            this.requiredParamList = [];
            this.flowStatsAllChecked = true;
            this.flowStatChecked = true;
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
            this.flowStatChecked = false;
        }
        
        // send selected region code and retrieve flows stats list
        public getFlowStats(rcode:string): void {
            
            this.nssService.getFlowStatsList(rcode).then(
                // set flowStatsList to values of promised response
                response => { this.flowStatsList = response; }

            )

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
                    this.flowStatChecked = true; //checking of cbBasinChar
                }
                else {

                    //remove it only if checked
                    if (paramCheck > -1) {
                        this.regionStatsList.splice(paramCheck, 1);
                        //this.toaster.pop('warning', parameter.code + " is required by one of the selected scenarios", "It cannot be unselected");
                        parameter.checked = false;
                        this.flowStatChecked = false; //unchecking of cbBasinChar
                    }
                }


            });

            // toggle switch
            this.flowStatsAllChecked = !this.flowStatsAllChecked;
        }

        public updateRegionStatsList(statistic: any) {

            var statisticGroupID = statistic.statisticGroupID;

            var index = this.regionStatsList.indexOf(statisticGroupID);

            if (!statistic.checked && index > -1) {
                //remove it
                statistic.checked = false;
                this.regionStatsList.splice(index, 1);
            }
            else if (statistic.checked && index == -1) {
                //add it
                statistic.checked = true;
                this.regionStatsList.push(statisticGroupID);
            }
            // calling this makes select all the default when any are unchecked
            this.checkStats();

        }

        public checkStats() {
            // change select all stats toggle to match if all stats are checked or not
            let allChecked = true;
            for (let stat of this.regionStatsList) {
                if (!stat.checked) {
                    allChecked = false;
                }
            }
            if (allChecked) {
                this.flowStatsAllChecked = false;
                this.flowStatChecked = false;
            } else {
                this.flowStatsAllChecked = true;
                this.flowStatChecked = true;
            }
        }


        // load parameters for regions once selected
        public getRegionParameters(rcode: string): void {

            this.getParametersByRegionBP(rcode).then(
                // set flowStatsList to values of promised response
                response => { this.parameterListBP = response; },
                
            );
        }

        // get count of how many times parameter shows up in selected flowStats
        // build array of multiples for each required param
        public buildRequiredParameters(statistic: any) {

            var regressionRegions = statistic.regressionRegions;

            // console.log(regressionRegions)

            regressionRegions.forEach((regRegion) => {
                
                regRegion.parameters.forEach((parameter) => {

                    var code = parameter.code;

                    var index = this.requiredParamList.indexOf(code);

                    if (!statistic.checked && index > -1) {
                        //remove it
                        this.requiredParamList.splice(index, 1);
                    }
                    else if (statistic.checked) {
                        //add it
                        this.requiredParamList.push(code);
                    }
                })
            })

            console.log(this.requiredParamList);
        }

        // Service methods
        // get basin characteristics list for region and nation
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