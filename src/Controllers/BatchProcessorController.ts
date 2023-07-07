﻿//------------------------------------------------------------------------------
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
        Close(): void
    }

    interface IBatchProcessorController extends IModal {
    }

    interface IParameter {
        code: string,
        description: string,
        checked: boolean,
        toggleable: boolean
    }

    class Parameter implements IParameter {
        public code: string;
        public description: string;
        public checked: boolean;
        public toggleable: boolean;
    }

    interface IBatchStatusMessage {
        id: number,
        message: string,
        description: string
    }

    class BatchStatusMessage implements IBatchStatusMessage {
        public id: number;
        public message: string;
        public description: string;
    }

    interface IBatchStatus {
        batchID: string,
        deleteCode: string
        emailAddress: string,
        order: number,
        queueList: string;
        status: number,
        statusMessage: string,
        statusDescription: string,
        timeSubmitted: Date,
        timeStarted: Date,
        timeCompleted: Date,
        resultsURL: URL,
        region: string,
        pointsRequested: number,
        pointsSuccessful: number,
    }

    class BatchStatus implements IBatchStatus {
        public batchID: string;
        public deleteCode: string;
        public emailAddress: string;
        public order: number;
        public queueList: string;
        public status: number;
        public statusMessage: string;
        public statusDescription: string;
        public timeSubmitted: Date;
        public timeStarted: Date;
        public timeCompleted: Date;
        public resultsURL: URL;
        public region: string;
        public pointsRequested: number;
        public pointsSuccessful: number;
    }

    class SubmitBatchData {
        public email: string;
        public idField: string;
        public attachment: any;
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
        public toaster: any;
        public internalHost: boolean;

        // Regions
        public regionList: Object;
        public selectedRegion: string;

        // Flow Stats
        public flowStatsList: Array<any>;
        public flowStatsAllChecked: boolean;
        public selectedFlowStatsList: Array<Object>;
        public flowStatisticsAllChecked: boolean;
        public flowStatIDs: Array<string>;

        // Parameters/basin characteristics
        public availableParamList: Array<Parameter>;
        public selectedParamList: Array<string>
        public parametersAllChecked: boolean;
        public showBasinCharacteristics: boolean;

        // POST methods
        public submittingBatch: boolean;
        public submitBatchSuccessAlert: boolean;
        public submitBatchFailedAlert: boolean;
        public submitBatchData: SubmitBatchData;
        public submitBatchOver250: boolean;
        public submitBatchOver250Message: string;
        public reorderingQueue: boolean;

        // spinners
        public regionListSpinner: boolean;
        public flowStatsListSpinner: boolean;
        public parametersListSpinner: boolean;

        // batch status
        public batchStatusEmail: string;
        public batchStatusMessageList: Array<BatchStatusMessage>;
        public batchStatusList: Array<BatchStatus>;
        public retrievingBatchStatus: boolean;
        public manageQueueList: Array<BatchStatus>;
        public retrievingManageQueue: boolean;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.ModalService', 'StreamStats.Services.nssService', '$modalInstance', 'toaster'];
        constructor($scope: IBatchProcessorControllerScope, $http: ng.IHttpService, modalService: Services.IModalService, nssService: Services.InssService, modal: ng.ui.bootstrap.IModalServiceInstance, toaster) {
            super($http, configuration.baseurls.StreamStats);
            $scope.vm = this;
            this.modalInstance = modal;
            this.modalService = modalService;
            this.selectedBatchProcessorTabName = "submitBatch";
            this.nssService = nssService;
            this.toaster = toaster;
            if (window.location.hostname == 'staging-apps.usgs.gov' || window.location.hostname == 'apps-int.usgs.gov' || window.location.hostname == "127.0.0.1:8080" || window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1" || window.location.hostname == "") {
                this.internalHost = true;
            } else {
                this.internalHost = false;
            }
            this.selectedFlowStatsList = [];
            this.selectedParamList = [];
            this.flowStatsAllChecked = true;
            this.parametersAllChecked = true;
            this.showBasinCharacteristics = false;
            this.submittingBatch = false; 
            this.submitBatchSuccessAlert = false;
            this.submitBatchFailedAlert = false;
            this.submitBatchData = new SubmitBatchData();
            this.reorderingQueue = false;
            this.regionListSpinner = true;
            this.flowStatsListSpinner = false;
            this.parametersListSpinner = false;
            this.batchStatusMessageList = [];
            this.batchStatusList = [];
            this.retrievingManageQueue = false;
            this.flowStatIDs = [];
            this.submitBatchOver250 = false
            this.init();
        }

        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-

        public Close(): void {
            this.submitBatchSuccessAlert = false;
            this.modalInstance.dismiss('cancel')
        }

        // used for switching between tabs in batch processor modal
        public selectBatchProcessorTab(tabname: string): void {
            this.selectedBatchProcessorTabName = tabname;
        }

        // Get list of State/Regions from batchprocessor/regions
        public getRegions(): void {

            var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['Regions'];
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {
                    this.regionList = response.data;
                    this.regionListSpinner = false;
                });

        }

        // send selected region code and retrieve flows stats list
        public getFlowStatsAndParams(rcode: string): void {

            // clear out success message when starting new batch submission
            this.submitBatchSuccessAlert = false;

            // activate spinners during state/region changes
            if (this.flowStatsListSpinner == false || this.parametersListSpinner == false) {
                this.flowStatsListSpinner = true;
                this.parametersListSpinner = true;
            }
            // clear flowStatsList during state/region changes
            if (this.flowStatsList && this.flowStatsList.length > 0) {
                this.flowStatsList.length = 0;
            }
            // clear availableParamList during state/region changes
            if (this.availableParamList && this.availableParamList.length > 0) {
                this.availableParamList.length = 0;
            }
            
            // Load Basin Characteristics and Flow Statistics
            this.loadParametersByRegionBP(rcode).then(
                response => {
                    this.availableParamList = response;
                    let availableParamCodes = this.availableParamList.map(p => p.code.toUpperCase());

                    this.nssService.getFlowStatsList(rcode).then(
                        // set flowStatsList to values of promised response
                        response => {
                            this.flowStatsList = response;
                            // turn off Flow Statistics spinner
                            this.flowStatsListSpinner = false;
        
                            // Add additional parameters that were not returned by loadParametersByRegionBP
                            this.flowStatsList.forEach(flowStat => {
                                flowStat.regressionRegions.forEach((regressionRegion) => {
                                    regressionRegion.parameters.forEach((parameter) => {
                                        if (availableParamCodes.indexOf(parameter.code) == -1) {
                                            this.availableParamList.push(parameter);
                                            availableParamCodes.push(parameter.code);
                                        } 
                                    });
                                });
                            });
                            
                            // turn off Basin Characteristics spinner
                            this.parametersListSpinner = false;
                        }
                    )
                }
            );

            




        }

        public setRegionStats(statisticsGroup: Array<any>, allFlowStatsSelectedToggle: boolean = null): void {

            // allFlowStatsSelectedToggle is true if the "Select All Flow Statistics" button was clicked
            // allFlowStatsSelectedToggle is false if the "Unselect All Flow Statistics" button was clicked
            // allFlowStatsSelectedToggle is null if no button was clicked

            var checkStatisticsGroup = this.checkArrayForObj(this.selectedFlowStatsList, statisticsGroup);

            // If no "Select/Unselect All Flow Statistics" button was clicked...
            if (allFlowStatsSelectedToggle == null) {

                //if toggled remove selected flow stats set
                if (checkStatisticsGroup != -1) {
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

                //add it to the list and get its required parameters
                else {
                    this.selectedFlowStatsList.push(statisticsGroup);

                    // edit checked/toggleable for availableParamList
                    this.setParamCheck(statisticsGroup['regressionRegions']);

                    // make sure DNRAREA is in selectedParamList
                    // this.addParameterToSelectedParamList("DRNAREA"); // uncomment if want to forcibly add DRNAREA to selectedParamList
                    
                }

                this.onSelectedStatisticsGroupChanged();

            } else if (allFlowStatsSelectedToggle == true) { // "Select All Flow Statistics" button was clicked
                if (checkStatisticsGroup == -1) {
                    this.selectedFlowStatsList.push(statisticsGroup);

                    // edit checked/toggleable for availableParamList
                    this.setParamCheck(statisticsGroup['regressionRegions']);
                } 

                this.onSelectedStatisticsGroupChanged();

            } else if (allFlowStatsSelectedToggle == false) { // "Unselect All Flow Statistics" button was clicked
                if (checkStatisticsGroup != -1) {
                    this.selectedFlowStatsList.splice(checkStatisticsGroup, 1);

                    
                }
                this.onSelectedStatisticsGroupChanged(false);
            }
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

                        if (p['code'].toUpperCase() === paramCode.toUpperCase()) {
                            p['checked'] = true;
                            p['toggleable'] = false;
                            break;
                        }
                    }
                });
            });
        }


        public onSelectedStatisticsGroupChanged(allFlowStatsSelectedToggle: boolean = null): void {

            // Rebuild the selected parameters from scratch
            if (allFlowStatsSelectedToggle == false) {
                this.availableParamList.forEach(param => {
                    param.checked = false;
                    param.toggleable = true;
                })
            }

            this.selectedParamList = [];

            //loop over whole statisticsgroups
            this.selectedFlowStatsList.forEach((statisticsGroup) => {

                // set checked to true
                statisticsGroup['checked'] = true;

                if (statisticsGroup['regressionRegions']) {

                    //get their parameters
                    statisticsGroup['regressionRegions'].forEach((regressionRegion) => {

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
                                var newParam: Parameter = {
                                    code: param.code,
                                    description: param.description,
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
                this.showBasinCharacteristics = true;
            } else {
                this.showBasinCharacteristics = false;
            }
        }

        // update selectedParamList
        public updateSelectedParamList(parameter: Parameter): void {
            
            //dont mess with certain parameters
            if (parameter.toggleable == false) {
                parameter.checked = true;
                return;
            }

            var paramCode = parameter.code
            var index = this.selectedParamList.indexOf(paramCode);

            if (!parameter.checked && index > -1) {
                //remove it
                this.selectedParamList.splice(index, 1);
            }
            else if (parameter.checked && index == -1) {
                //add it
                this.selectedParamList.push(paramCode);
            }

            this.checkParameters();

        }

        public checkParameters(): void {
            // change select all parameters toggle to match if all params are checked or not
            let allChecked = true;
            for (let param of this.availableParamList) {
                if (!param['checked']) {
                    allChecked = false;
                }
            }
            if (allChecked) {
                this.parametersAllChecked = false;
            } else {
                this.parametersAllChecked = true;
            }
        }

        public toggleFlowStatisticsAllChecked(): void {
            if (this.flowStatsAllChecked) {
                this.flowStatsAllChecked = false;
                this.flowStatsList.forEach((flowStat) => {
                    flowStat['checked'] = true;
                    this.setRegionStats(flowStat, true)
                });
            } else {                
                this.flowStatsAllChecked = true;
                this.flowStatsList.forEach((flowStat) => {
                    flowStat['checked'] = false;
                    this.setRegionStats(flowStat, false)
                });
            }
        }

        // controls button to select/unselect all parameters
        public toggleParametersAllChecked(): void {

            this.availableParamList.forEach((parameter) => {
                
                var paramCheck = this.selectedParamList.indexOf(parameter.code);

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

        // create list of batch statuses for an email address
        public getBatchStatusList(email: string): void {

            this.getBatchStatusByEmail(email).then(
                response => {
                    this.batchStatusList = response;
                    this.retrievingBatchStatus = false;
                }
            );
        }

        // create list of batch statuses
        public getManageQueueList(): void {

            this.getBatchStatusByEmail().then(
                response => {
                    this.manageQueueList = response;
                    this.retrievingManageQueue = false;
                }
            );
        }

        // soft delete a batch
        public trashBatch(batchID: number, deleteCode: string, batchStatusEmail: string) {
            let text = "Are you sure you want to delete Batch ID " + batchID + "?"
            if (confirm(text) == true) {
                this.deleteBatch(batchID, deleteCode, batchStatusEmail);                
            }
        }
        
        // submit batch job
        public submitBatch(submit250:boolean=false): void {

            this.toaster.pop("wait", "Submitting Batch", "Please wait...", 0);

            // autopopulate batch status tab upon batch submission
            if (this.batchStatusEmail == undefined || this.batchStatusEmail == null) {

                this.batchStatusEmail = this.submitBatchData.email.toString()
            }
            // create flowStatIDs list
            this.addStatIDtoList();
            
            // create formdata object and apend
            var formdata = new FormData();
            
            formdata.append('region', this.selectedRegion.toString());
            formdata.append('basinCharacteristics', this.selectedParamList.toString());
            formdata.append('flowStatistics', this.flowStatIDs.toString());
            formdata.append('email', this.submitBatchData.email.toString());
            formdata.append('IDField', this.submitBatchData.idField.toString());
            formdata.append('geometryFile', this.submitBatchData.attachment, this.submitBatchData.attachment.name);
            
            // create headers
            var headers = {
                "Content-Type": undefined
            };

            // set submittingBatch to true, which disables submit button to prevent multiple submissions
            this.submittingBatch = true;
            
            // handles submitting more than 250 points
            if (submit250 == true) {

                // appends moreThan250Points to formdata
                formdata.append('moreThan250Points', submit250.toString());

        
                // submits batch to API
                this.postBatchFormData(formdata, headers).then(
                    response => {
                        var r = response;
                        if (r.status == 200) {
                            this.submitBatchSuccessAlert = true;
                            this.toaster.clear();
                            this.toaster.pop('success', "The batch was submitted successfully. You will be notified by email when results are available.", "", 5000);
                            
                            // give blank form for next submission
                            this.clearBatchForm();

                            // check if email entered on batch status tab and reset list of batches
                            this.getBatchStatusList(this.batchStatusEmail)
                            
                        }

                        // handle if status is not 200, let user know error
                        else {
                            var detail = r.data.detail
                            this.toaster.clear();
                            this.toaster.pop('error', "The submission failed for the following reason:", detail, 15000);

                        }
                    }).finally(() => {
                    
                    this.submittingBatch = false;
                    this.submitBatchOver250 = false;
                    this.submitBatchSuccessAlert = true
                });
            }

            else { 
                this.toaster.pop("wait", "Submitting Batch", "Please wait...", 0);
                // submits batch to API
                this.postBatchFormData(formdata, headers).then(
                    response => {
                        // assign response to variable
                        var r = response;

                        // first, handle if status is 500 and detail contains more "250", which means use tried to submit more than 250 points
                        if (r.status == 500 && r.data.detail.indexOf("250") > -1) {
                            this.submitBatchOver250Message = "Batch contains more than 250 points. Only the first 250 points will be processed. Please select the 'Submit Batch Over 250 Points' button if you would like only the first 250 points to be processed."
                            this.submitBatchOver250 = true;
                            this.toaster.clear();
                            this.toaster.pop("warning", this.submitBatchOver250Message, "", 5000);
                        }
                        
                        // handle if status is 200, which means the batch was submitted successfully
                        else if (r.status == 200) {
                            this.submitBatchSuccessAlert = true;
                            this.toaster.clear();
                            this.toaster.pop('success', "The batch was submitted successfully. You will be notified by email when results are available.", "", 5000);

                            // give blank form for next submission
                            this.clearBatchForm();

                            // check if email entered on batch status tab and reset list of batches
                            this.getBatchStatusList(this.batchStatusEmail)
                        }
                        
                        // handle if status is not 200 or to do with 250 points and let submitter know error
                        else {
                            let detail = r.data.detail
                            this.toaster.clear();
                            this.toaster.pop('error', "The submission failed for the following reason:" + detail, "", 15000);
                        }

                    }).finally(() => {
                        this.submittingBatch = false;
                    });
            }
        }

        // reorder the queue on the Manage Queue tab
        public reorderQueue(): void {
            this.reorderingQueue = true;
            

            let reorderBatchesPOSTBody = {"batchOrder": []}
            this.manageQueueList.forEach(batch => {
                if (batch.order != null) {
                    reorderBatchesPOSTBody["batchOrder"].push({
                        "batchID": batch.batchID,
                        "order": batch.order
                    })
                }
            });

            this.reorderBatches(reorderBatchesPOSTBody).then(
                response => {
                    let r = response;
                    if (r.status == 200) {
                        this.getManageQueueList(); 
                        this.retrievingManageQueue = true;
                        this.toaster.clear();
                        this.toaster.pop('success', "Queue was successfully reordered", "", 5000);
                        return response;
                    } else {
                        this.toaster.clear();
                        this.toaster.pop('error', "Queue failed to reorder: ", r.data.detail, 15000);
                    }
                }).finally(() => {
                    this.reorderingQueue = false;
                });

        }

        // pause a batch
        public submitPauseBatch(batchID: number): void {
            // console.log("Pausing batch " + batchID);
            this.pauseBatch(batchID);
        }

        // unpause a batch
        public submitUnpauseBatch(batchID: number): void {
            // console.log("Unpausing batch " + batchID);
            this.unpauseBatch(batchID);
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

                        // create array to return
                        var paramRaw = [];

                        response.data.parameters.forEach((parameter) => {
                            try {
                                let param: Parameter = {
                                    code: parameter.code,
                                    description: parameter.description,
                                    checked: false,
                                    toggleable: true
                                }
                                paramRaw.push(param);
                            } catch (e) {
                                alert(e)                           
                            }
                        });
                    }
                    return paramRaw;
                }, (error) => {
                }).finally(() => { 
                });
        }        

        // handle ng.Ipromise for POST request to BatchProcessorServices
        // return either response or error, as logic for either is handled in the calling function
        public postBatchFormData(formdata: FormData, headers: any): ng.IPromise<any> {
                
                var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['SSBatchProcessorSubmitBatch']
    
                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', formdata, headers);
    
                return this.Execute(request).then(
                    (response: any) => {
                        return response;
                    }, (error) => {
                        return error;
                    }).finally(() => {});
        }

        // get array of batch status messages
        public retrieveBatchStatusMessages(): ng.IPromise<any> {

            var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['SSBatchProcessorStatusMessages'];
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

        
            return this.Execute(request).then(
                (response: any) => {

                    var batchStatusMessages = [];

                    response.data.forEach((item) => {

                        try {
                            let status: BatchStatusMessage = {
                                id: item.ID,
                                message: item.Message,
                                description: item.Description
                            }

                            batchStatusMessages.push(status);
                        }

                        catch (e) {
                            alert(e)
                        }
                    });
                    
                    return batchStatusMessages;
                }, (error) => {
                }).finally(() => {
                });
        }

        // get batchs status for email
        public getBatchStatusByEmail(email: string = null): ng.IPromise<any> {

            if (email) {
                var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['SSBatchProcessorBatchStatus'].format(email);
            } else {
                var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['SSBatchProcessorGetBatch'];
            }
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            return this.Execute(request).then(
                (response: any) => {

                    var batchStatusMessages = [];

                    response.data.forEach((batch) => {

                        try {
                            let status: BatchStatus = {
                                batchID: batch.ID,
                                deleteCode: batch.DeleteCode,
                                emailAddress: batch.EmailAddress,
                                order: batch.Order,
                                queueList: batch.QueueList == null ? "" : batch.QueueList.join(", "),
                                status: this.batchStatusMessageList.filter((item) => { return item.id == batch.StatusID })[0].id,
                                statusMessage: this.batchStatusMessageList.filter((item) => { return item.id == batch.StatusID })[0].message,
                                statusDescription: this.batchStatusMessageList.filter((item) => { return item.id == batch.StatusID })[0].description,
                                timeSubmitted: batch.TimeSubmitted,
                                timeStarted: batch.TimeStarted,
                                timeCompleted: batch.TimeCompleted,
                                resultsURL: batch.ResultsURL,
                                region: batch.Region,
                                pointsRequested: batch.NumberPoints,
                                pointsSuccessful: batch.NumberPointsSuccessful
                            }

                            batchStatusMessages.push(status);
                        }

                        catch (e) {
                            alert(e)
                        }
                    });

                    return batchStatusMessages;
                }, (error) => {
                }).finally(() => {
                });
        }

        // soft delete a batch
        public deleteBatch(batchID: number, deleteCode: string, batchStatusEmail: string): ng.IPromise<any> {

            var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['SSBatchProcessorDeleteBatch'].format(deleteCode);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.DELETE);

            return this.Execute(request).then(
                (response: any) => {
                    let text = "Batch ID " + batchID + " was deleted.";
                    alert(text);
                    // Refresh the list of batches
                    this.getBatchStatusList(batchStatusEmail); 
                    this.retrievingBatchStatus = true;
                    this.getManageQueueList(); 
                    this.retrievingManageQueue = true;
                }, (error) => {
                    let text = "Error deleting batch ID " + batchID + ". Please try again later or click the Help menu button to submit a Support Request.";
                    alert(text);
                }).finally(() => {
                    
                });
        }

        public reorderBatches(batchOrder): ng.IPromise<any> {
            var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['SSBatchProcessorReorderBatch']
    
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, "json", angular.toJson(batchOrder));

            return this.Execute(request).then(
                (response: any) => {
                    return response;
                }, (error) => {
                    return error;
                }).finally(() => {});
        }

        public pauseBatch(batchID: number): ng.IPromise<any> {
            var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['SSBatchProcessorBatchPause'].format(batchID);
    
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST);

            return this.Execute(request).then(
                (response: any) => {
                    this.getManageQueueList(); 
                    this.retrievingManageQueue = true;
                    this.toaster.pop('success', "Batch ID " + batchID + " was paused.", "", 5000);
                    return response;
                }, (error) => {
                    this.toaster.pop('error', "Batch ID " + batchID + " could not be paused.", error, 15000);
                    return error;
                }).finally(() => {
                });
        }

        public unpauseBatch(batchID: number): ng.IPromise<any> {
            var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['SSBatchProcessorBatchUnpause'].format(batchID);
    
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST);

            return this.Execute(request).then(
                (response: any) => {
                    this.getManageQueueList(); 
                    this.retrievingManageQueue = true;
                    this.toaster.pop('success', "Batch ID " + batchID + " was unpaused.", "", 5000);
                    return response;
                }, (error) => {
                    this.toaster.pop('error', "Batch ID " + batchID + " could not be unpaused.", error, 15000);
                    return error;
                }).finally(() => {
                });
        }

        // Helper Methods
        // -+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            this.getRegions();
            this.retrieveBatchStatusMessages().then(
                response => {
                    this.batchStatusMessageList = response;
                }
            );
        }

        private checkArrayForObj(arr, obj): number {
            for (var i = 0; i < arr.length; i++) {
                if (angular.equals(arr[i], obj)) {
                    return i;
                }
            };
            return -1;
        }

        public validateZipFile($files): void {
            // validate that the file is a .zip
            if ($files[0].type != "application/x-zip-compressed" && $files[0].type != "application/zip") {

                this.toaster.pop('warning', "Please upload a .zip file.", "", 5000);
                this.submitBatchData.attachment = null;
            }
            return;
        }

        // add parameter to selectedParamList
        private addParameterToSelectedParamList(paramCode): boolean {
            try {
                for (var i = 0; i < this.availableParamList.length; i++) {
                    let p = this.availableParamList[i];

                    if (p['code'].toUpperCase() === paramCode.toUpperCase() && this.checkArrayForObj(this.selectedParamList, p['code']) == -1) {
                        this.selectedParamList.push(p['code']);
                        p['checked'] = true;
                        p['toggleable'] = false;
                        break;
                    }//endif
                }//next i
            } catch (e) {
                return false;
            }
        }

        // add statisticGroupID to list for batch submission
        private addStatIDtoList(): void {

            this.selectedFlowStatsList.forEach((item) => {
                this.flowStatIDs.push(item['statisticGroupID']);
            });
        }

        // clear fields after submision
        private clearBatchForm(): void {
            // delete objects with values originating from ng-model in html
            delete this.selectedRegion
            delete this.submitBatchData.email
            delete this.submitBatchData.idField
            delete this.submitBatchData.attachment

            // reset objects to default values that orginate in controller
            this.selectedParamList.length = 0
            this.flowStatIDs.length = 0
            this.flowStatsList.length = 0;
            this.availableParamList.length = 0;
            this.selectedFlowStatsList.length = 0;
            this.checkStats()
        }
    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.BatchProcessorController', BatchProcessorController);
}//end module 