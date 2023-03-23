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
        public selectedFlowStatsList: Array<any>;
        public availableParamList: Array<any>;
        public flowStatChecked: boolean;
        public selectedParamList: Array<any>
        public parametersAllChecked: boolean;
        public regionParamList: Array<any>;
        public showBasinCharacterstics: boolean;

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
            this.selectedFlowStatsList = [];
            this.selectedParamList = [];
            this.availableParamList = [];
            this.regionParamList = [];
            this.flowStatChecked = false;
            this.parametersAllChecked = true;
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
        }
        
        // send selected region code and retrieve flows stats list
        public getFlowStatsAndParams(rcode:string): void {
            
            this.nssService.getFlowStatsList(rcode).then(
                // set flowStatsList to values of promised response
                response => { this.flowStatsList = response; }

            )

            this.loadParametersByRegionBP(rcode).then(
                response => { this.availableParamList = response; }
            );
            
        }

        public setRegionStats(statisticsGroup: Array<any>): void {

            var checkStatisticsGroup = this.checkArrayForObj(this.selectedFlowStatsList, statisticsGroup);

            //if toggled remove selected parameter set
            if (checkStatisticsGroup != -1) {
                var preventRemoval = false;

                // if Flow Duration Curve Transfer Method (FDCTM) is selected, prevent Flow-Duration Statistics from being de-selected
                if (this.selectedFlowStatsList.filter((selectedStatisticsGroup) => selectedStatisticsGroup.statisticGroupName == "Flow-Duration Curve Transfer Method").length > 0 && statisticsGroup['statisticGroupName'] == "Flow-Duration Statistics") {
                    preventRemoval = true;
                }

                if (!preventRemoval) {
                    //remove this statisticsGroup from the list
                    this.selectedFlowStatsList.splice(checkStatisticsGroup, 1);

                    // set statisticsGroup.checked to false
                    statisticsGroup['checked'] = false;
                    // if no selected scenarios, clear studyareaparameter list
                    if (this.selectedFlowStatsList.length == 0) {
                        this.selectedParamList = [];

                        this.availableParamList.forEach((parameter) => {
                            parameter.checked = false;
                            parameter.toggleable = true;
                        });
                    }
                }
                
            }

            //add it to the list and get its required parameters
            else {
                this.selectedFlowStatsList.push(statisticsGroup);

                // if Flow Duration Curve Transfer Method (FDCTM) was selected, also select Flow-Duration Statistics
                if (typeof statisticsGroup['statisticGroupID'] != 'number' && statisticsGroup['statisticGroupID'].indexOf('fdctm')) {
                    // see if the Flow-Duration Statistics group has been selected already and select it if not
                    var statisticsGroupFDS = this.selectedFlowStatsList.filter((statisticsGroup) => statisticsGroup.statisticGroupName == "Flow-Duration Statistics")[0];
                    var checkStatisticsGroupFDS = this.checkArrayForObj(this.selectedFlowStatsList, statisticsGroupFDS);
                    if (checkStatisticsGroupFDS == -1) {
                        this.selectedFlowStatsList.push(statisticsGroupFDS);
                    }
                }

                // edit checked/toggleable for availableParamList
                this.setParamCheck(statisticsGroup['regressionRegions']);

                // make sure DNRAREA is in selectedParamList
                this.addParameterToSelectedParamList("DRNAREA");
                
                
            }
            // update this.selectedParamList with parameters from selected flowStats
            this.onSelectedStatisticsGroupChanged();

            // handle impacts of flowStat.checked
            this.checkStats();
        }

        // set params in availableParamList to checked
        private setParamCheck(regressionRegions: Array<any>): void {

            regressionRegions.forEach((regressionRegion) => {

                regressionRegion.parameters.forEach((parameter) => {
                    var paramCode = parameter.code;
                    for (var i = 0; i < this.availableParamList.length; i++) {
                        let p = this.availableParamList[i];

                        if (p.code.toUpperCase() === paramCode.toUpperCase()) {
                            p['checked'] = true;
                            p['toggleable'] = false;
                            break;
                        }
                    }
                });
            }); 
        }

        
        public onSelectedStatisticsGroupChanged(): void {
            
            //loop over whole statisticsgroups
            this.selectedFlowStatsList.forEach((statisticsGroup) => {

                if (statisticsGroup.regressionRegions) {

                    //get their parameters
                    statisticsGroup.regressionRegions.forEach((regressionRegion) => {

                        //loop over list of state/region parameters to see if there is a match
                        regressionRegion.parameters.forEach((param) => {

                            var found = false;
                            for (var i = 0; i < this.availableParamList.length; i++) {
                                var parameter = this.availableParamList[i];
                                if (parameter.code.toLowerCase() == param.code.toLowerCase()) {
                                    this.addParameterToSelectedParamList(param.code);
                                    found = true;
                                    break;
                                }//end if
                            }//next iparam

                            if (!found) {
                                // this.toaster.pop('warning', "Missing Parameter: " + param.code, "The selected scenario requires a parameter not available in this State/Region.  The value for this parameter will need to be entered manually.", 0);

                                //add to region parameterList
                                var newParam = {
                                    name: param.name,
                                    description: param.description,
                                    code: param.code,
                                    unit: param.unitType.unit,
                                    value: null,
                                    regulatedValue: null,
                                    unRegulatedValue: null,
                                    loaded: null,
                                    checked: false,
                                    toggleable: true
                                }

                                //push the param that was not in the original regionService paramaterList
                                this.availableParamList.push(newParam);

                                //select it
                                this.addParameterToSelectedParamList(param.code);
                                }
                            });// next param
                        });// next regressionRegion
                    }//end if
                });//next statisticgroup
            }

        public checkStats(): void {

            if (this.selectedFlowStatsList.length > 0) {
                this.flowStatChecked = true;
                this.showBasinCharacterstics = true;
            } else {
                this.flowStatChecked = false;
                this.showBasinCharacterstics = false;
            }
        }

        // update selectedParamList
        public updateSelectedParamList(parameter: Array<any>): void {

            //dont mess with certain parameters
            if (parameter['toggleable'] == false) {
                parameter['checked'] = true;
                return;
            }

            var paramCode = parameter['code']
            var index = this.selectedParamList.indexOf(paramCode);

            if (!parameter['checked'] && index > -1) {
                //remove it
                this.selectedParamList.splice(index, 1);
            }
            else if(parameter['checked'] && index == -1) {
                //add it
                this.selectedParamList.push(paramCode);
            }

            // check if all parameters are selected
            this.checkParameters();

        }

        // check if all parameters are selected
        public checkParameters(): void {
            // change select all parameters toggle to match if all params are checked or not
            let allChecked = true;
            for (let param of this.availableParamList) {
                if (!param.checked) {
                    allChecked = false;
                }
            }
            if (allChecked) {
                this.parametersAllChecked = false;
            } else {
                this.parametersAllChecked = true;
            }
        }


        // controls button to select/unselect all parameters
        public toggleParametersAllChecked(): void {

            this.availableParamList.forEach((parameter) => {

                var paramCheck = this.checkArrayForObj(this.selectedParamList, parameter.code);

                if (this.parametersAllChecked) {

                    //if its not there add it
                    if (paramCheck == -1) this.selectedParamList.push(parameter.code);
                    parameter.checked = true;
                }
                else {

                    //remove it only if toggleable
                    if (paramCheck > -1 && parameter.toggleable) {
                        this.selectedParamList.splice(paramCheck, 1);
                        //this.toaster.pop('warning', parameter.code + " is required by one of the selected scenarios", "It cannot be unselected");
                        parameter.checked = false;
                    }
                }


            });

            // toggle switch
            this.parametersAllChecked = !this.parametersAllChecked;
        }
            
        // Service methods
        // get basin characteristics list for region and nation
        public loadParametersByRegionBP(rcode: string): ng.IPromise<any> {

            if (!rcode) return;
            var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSAvailableParams'].format(rcode);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            return this.Execute(request).then(
                (response: any) => {

                    if (response.data.parameters && response.data.parameters.length > 0) {
                        // this.streamStatsAvailable = true;

                        // create array to return
                        var paramRaw = [];

                        response.data.parameters.forEach((parameter) => {
                            
                            
                            try {
                                var param = {
                                    code: parameter.code,
                                    description: parameter.description,
                                    checked: false,
                                    toggleable: true
                                }
                                paramRaw.push(param);
                            }

                            catch (e) {
                                alert(e)

                        }    
                        });

                    }

                    else {
                        // this.streamStatsAvailable = false;
                        // this.toaster.pop('error', "No parameters available for this region", "Please select another region");
                    }
                    return paramRaw;
                }, (error) => {
                    // console.log('Bad response from the regression service');
                    // this.streamStatsAvailable = false;
                    // this.toaster.pop('warning', "StreamStats not available here at this time", "", 5000);

                }).finally(() => {
                });
        }

        // Helper Methods
        // -+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            this.AppVersion = configuration.version;
            this.getRegions();
        }
        
        private checkArrayForObj(arr, obj): number {
            for (var i = 0; i < arr.length; i++) {
                if (angular.equals(arr[i], obj)) {
                    return i;
                }
            };
            return -1;
        }

        // add parameter to selectedParamList
        private addParameterToSelectedParamList(paramCode): boolean {
            try {
                for (var i = 0; i < this.availableParamList.length; i++) {
                    let p = this.availableParamList[i];

                    if (p.code.toUpperCase() === paramCode.toUpperCase() && this.checkArrayForObj(this.selectedParamList, p.code) == -1) {
                        this.selectedParamList.push(p.code);
                        p['checked'] = true;
                        p['toggleable'] = false;
                        break;
                    }//endif
                }//next i

            } catch (e) {
                return false;
            }


        }

    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.BatchProcessorController', BatchProcessorController);
}//end module 