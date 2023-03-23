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
        public selectedFlowStatsList: Array<any>;
        public availableParamList: Array<any>;
        public flowStatChecked: boolean;
        public selectedParamList: Array<any>
        public parametersAllChecked: boolean;
        public regionParamList: Array<any>;

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
            // this.flowStatsAllChecked = true;
            // this.flowStatChecked = true;
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
            // this.flowStatsAllChecked = true;
            // this.flowStatChecked = false;
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

        public setRegionStats(statisticsGroup: any) {

            var checkStatisticsGroup = this.checkArrayForObj(this.selectedFlowStatsList, statisticsGroup);

            //if toggled remove selected parameter set
            if (checkStatisticsGroup != -1) {
                var preventRemoval = false;

                // if Flow Duration Curve Transfer Method (FDCTM) is selected, prevent Flow-Duration Statistics from being de-selected
                if (this.selectedFlowStatsList.filter((selectedStatisticsGroup) => selectedStatisticsGroup.statisticGroupName == "Flow-Duration Curve Transfer Method").length > 0 && statisticsGroup.statisticGroupName == "Flow-Duration Statistics") {
                    preventRemoval = true;
                }

                if (!preventRemoval) {
                    //remove this statisticsGroup from the list
                    this.selectedFlowStatsList.splice(checkStatisticsGroup, 1);

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
                if (typeof statisticsGroup.statisticGroupID != 'number' && statisticsGroup.statisticGroupID.indexOf('fdctm')) {
                    // see if the Flow-Duration Statistics group has been selected already and select it if not
                    var statisticsGroupFDS = this.selectedFlowStatsList.filter((statisticsGroup) => statisticsGroup.statisticGroupName == "Flow-Duration Statistics")[0];
                    var checkStatisticsGroupFDS = this.checkArrayForObj(this.selectedFlowStatsList, statisticsGroupFDS);
                    if (checkStatisticsGroupFDS == -1) {
                        this.selectedFlowStatsList.push(statisticsGroupFDS);
                    }
                }

                // edit checked/toggleable for availableParamList
                this.setParamCheck(statisticsGroup.regressionRegions);

                // make sure DNRAREA is in selectedParamList
                this.addParameterToSelectedParamList("DRNAREA");
                
                
            }
            // update this.selectedParamList with parameters from selected flowStats
            this.onSelectedStatisticsGroupChanged();
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
                                        console.log('PARAM FOUND', param.Code)
                                        this.addParameterToSelectedParamList(param.code);
                                        found = true;
                                        break;
                                    }//end if
                                }//next iparam

                                if (!found) {
                                    console.log('PARAM NOT FOUND', param.Code)
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
                console.log("onSelectedStatisticsGroupChanged_selectedParamList", this.selectedParamList);
            }

        // public updateRegionStatsList(statistic: any) {

        //     var statisticGroupID = statistic.statisticGroupID;

        //     var index = this.selectedFlowStatsList.indexOf(statisticGroupID);

        //     if (!statistic.checked && index > -1) {
        //         //remove it
        //         statistic.checked = false;
        //         this.selectedFlowStatsList.splice(index, 1);
        //         // console.log("splice", this.selectedFlowStatsList)
        //     }
        //     else if (statistic.checked && index == -1) {
        //         //add it
        //         statistic.checked = true;
        //         this.selectedFlowStatsList.push(statisticGroupID);
        //         // console.log("push", this.selectedFlowStatsList)
        //     }
        //     // calling this makes select all the default when any are unchecked
        //     this.checkStats();
        //     // this.addRemoveDRNAREA();
        //     // console.log("updateRegionStatsList", this.requiredParamList)

        // }

        // public checkStats() {
        //     // change select all stats toggle to match if all stats are checked or not
        //     let allChecked = true;
        //     for (let stat of this.selectedFlowStatsList) {
        //         if (!stat.checked) {
        //             allChecked = false;
        //         }
        //     }
        //     if (allChecked) {
        //         this.flowStatsAllChecked = false;
        //         this.flowStatChecked = false;
        //     } else {
        //         this.flowStatsAllChecked = true;
        //         this.flowStatChecked = true;
        //     }
        // }


        // public addRemoveDRNAREA() {
        //     if (this.selectedFlowStatsList.length < 0) {
                
        //         this.requiredParamList.push("DRNAREA");
        //         console.log("addRemovepush", this.requiredParamList)
        //     } else {
        //         // var index = this.requiredParamList.indexOf("DRNAREA");
        //         // this.requiredParamList.splice(index, 1);
        //         // console.log("addRemovesplice", this.requiredParamList)
        //         this.requiredParamList = [];
        //     }
            
        // }

        // load parameters for regions once selected
        // public getRegionParameters(rcode: string): void {

        //     this.getParametersByRegionBP(rcode).then(
        //         // set flowStatsList to values of promised response
        //         response => { this.regionParamList = response; },
                
        //     );
        // }

        // create array of required parameters based on selected flow statistics
        // codes may appear mutliple times
        // public setRequiredParameters(statistic: any) {

        //     var regressionRegions = statistic.regressionRegions;
            
        //     // bore down to each parameter and add code to this.requiredParamList
        //     regressionRegions.forEach((regRegion) => {
                
        //         regRegion.parameters.forEach((parameter) => {

        //             var code = parameter.code;

        //             var index = this.requiredParamList.indexOf(code);

        //             if (!statistic.checked && index > -1) {
        //                 //remove it
        //                 this.requiredParamList.splice(index, 1);
        //                 // console.log("setRequiredSplice", this.requiredParamList)
        //             }
        //             else if (statistic.checked) {
        //                 //add it
        //                 this.requiredParamList.push(code);
        //                 // console.log("setRequiredPush", this.requiredParamList)
        //             }
        //         })
                
        //     })

            // if (this.requiredParamList.indexOf("DRNAREA") == -1) {
            //     this.requiredParamList.push("DRNAREA");
            // }
            // this.requiredParamList = this.requiredParamList.filter((item, i, ar) => ar.indexOf(item) === i); // in ECM6 this is a Set

            // console.log("setRequiredParameters", this.requiredParamList);
        //     this.setParamToggleable();
        // }

        // set parameters to checked and not toggleable if in requiredParamList
        // private setParamToggleable(): void { 
        //     this.regionParamList.forEach((parameter) => {
        //         var index = this.requiredParamList.indexOf(parameter.code);
        //         if (index > -1) {
        //             parameter.checked = true;
        //             parameter.toggleable = false;
        //         }
        //         else {
        //             parameter.checked = false;
        //             parameter.toggleable = true;
        //         }
        //     })
        // }

        // update selectedParamList
        public updateSelectedParamList(parameter: any) {

            // console.log('in updatestudyarea parameter', parameter);

            //dont mess with certain parameters
            if (parameter.toggleable == false) {
                console.log("Can't unselect")
                // this.toaster.pop('warning', parameter.code + " is required by one of the selected scenarios", "It cannot be unselected");
                parameter.checked = true;
                return;
            }

            var paramCode = parameter.code
            var index = this.selectedParamList.indexOf(paramCode);

            if (!parameter.checked && index > -1) {
                //remove it
                this.selectedParamList.splice(index, 1);
                console.log("updateParamsSplice", this.selectedParamList)
            }
            else if(parameter.checked && index == -1) {
                //add it
                this.selectedParamList.push(paramCode);
                console.log("updateParamsPush", this.selectedParamList)
            }
            console.log("updateSelectedParamList", this.selectedParamList)
            this.checkParameters();

        }

        public checkParameters() {
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
            
        // Service methods
        // get basin characteristics list for region and nation
        public loadParametersByRegionBP(rcode: string): ng.IPromise<any> {

            if (!rcode) return;
            var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSAvailableParams'].format(rcode);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            // console.log(request)
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

        // controls button to select/unselect all parameters
        public toggleParametersAllChecked(): void {

            this.availableParamList.forEach((parameter) => {

                //console.log('length of configuration.alwaysSelectedParameters: ', configuration.alwaysSelectedParameters.length);

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

        // uncheck/check all flow statistics
        // public toggleflowStatsAllChecked(): void {

        //     this.flowStatsList.forEach((parameter) => {

        //         var statisticGroupID = parameter.statisticGroupID

        //         var paramCheck = this.checkArrayForObj(this.selectedFlowStatsList, statisticGroupID);

        //         if (this.flowStatsAllChecked) {

        //             //if its not there add it
        //             if (paramCheck == -1) this.selectedFlowStatsList.push(statisticGroupID);
        //             parameter.checked = true;
        //             this.flowStatChecked = true; //checking of cbBasinChar
        //             // console.log("togglePush", this.regionStatsList)
                    
        //         }
        //         else {

        //             //remove it only if checked
        //             if (paramCheck > -1) {
        //                 this.selectedFlowStatsList.splice(paramCheck, 1);
        //                 //this.toaster.pop('warning', parameter.code + " is required by one of the selected scenarios", "It cannot be unselected");
        //                 parameter.checked = false;
        //                 this.flowStatChecked = false; //unchecking of cbBasinChar
        //                 // this.setRequiredParameters(parameter);
        //                 // console.log("toggleSplice", this.regionStatsList)
        //             }

        //             // this.requiredParamList = [];
        //             // console.log("toggleSplice", this.requiredParamList)
        //         }
        //     })
        //         ;

        //     // toggle switch
        //     this.flowStatsAllChecked = !this.flowStatsAllChecked;
        // }

        

    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.BatchProcessorController', BatchProcessorController);
}//end module 