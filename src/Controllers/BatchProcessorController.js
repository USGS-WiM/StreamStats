var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use string';
        var Parameter = (function () {
            function Parameter() {
            }
            return Parameter;
        }());
        var BatchStatusMessage = (function () {
            function BatchStatusMessage() {
            }
            return BatchStatusMessage;
        }());
        var BatchStatus = (function () {
            function BatchStatus() {
            }
            return BatchStatus;
        }());
        var SubmitBatchData = (function () {
            function SubmitBatchData() {
            }
            return SubmitBatchData;
        }());
        var BatchProcessorController = (function (_super) {
            __extends(BatchProcessorController, _super);
            function BatchProcessorController($scope, $http, modalService, nssService, modal, toaster) {
                var _this = _super.call(this, $http, configuration.baseurls.StreamStats) || this;
                $scope.vm = _this;
                _this.modalInstance = modal;
                _this.modalService = modalService;
                _this.selectedBatchProcessorTabName = "submitBatch";
                _this.nssService = nssService;
                _this.toaster = toaster;
                if (window.location.host === 'staging-apps.usgs.gov' || location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "") {
                    _this.internalHost = true;
                }
                else {
                    _this.internalHost = false;
                }
                _this.selectedFlowStatsList = [];
                _this.selectedParamList = [];
                _this.flowStatsAllChecked = true;
                _this.parametersAllChecked = true;
                _this.showBasinCharacteristics = false;
                _this.submittingBatch = false;
                _this.submitBatchSuccessAlert = false;
                _this.submitBatchFailedAlert = false;
                _this.submitBatchData = new SubmitBatchData();
                _this.reorderingQueue = false;
                _this.regionListSpinner = true;
                _this.flowStatsListSpinner = false;
                _this.parametersListSpinner = false;
                _this.batchStatusMessageList = [];
                _this.batchStatusList = [];
                _this.retrievingManageQueue = false;
                _this.flowStatIDs = [];
                _this.submitBatchOver250 = false;
                _this.init();
                return _this;
            }
            BatchProcessorController.prototype.Close = function () {
                this.submitBatchSuccessAlert = false;
                this.modalInstance.dismiss('cancel');
            };
            BatchProcessorController.prototype.selectBatchProcessorTab = function (tabname) {
                this.selectedBatchProcessorTabName = tabname;
            };
            BatchProcessorController.prototype.getRegions = function () {
                var _this = this;
                var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['Regions'];
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    _this.regionList = response.data;
                    _this.regionListSpinner = false;
                });
            };
            BatchProcessorController.prototype.getFlowStatsAndParams = function (rcode) {
                var _this = this;
                this.submitBatchSuccessAlert = false;
                if (this.flowStatsListSpinner == false || this.parametersListSpinner == false) {
                    this.flowStatsListSpinner = true;
                    this.parametersListSpinner = true;
                }
                if (this.flowStatsList && this.flowStatsList.length > 0) {
                    this.flowStatsList.length = 0;
                }
                if (this.availableParamList && this.availableParamList.length > 0) {
                    this.availableParamList.length = 0;
                }
                this.loadParametersByRegionBP(rcode).then(function (response) {
                    _this.availableParamList = response;
                    var availableParamCodes = _this.availableParamList.map(function (p) { return p.code.toUpperCase(); });
                    _this.nssService.getFlowStatsList(rcode).then(function (response) {
                        _this.flowStatsList = response;
                        _this.flowStatsListSpinner = false;
                        _this.flowStatsList.forEach(function (flowStat) {
                            flowStat.regressionRegions.forEach(function (regressionRegion) {
                                regressionRegion.parameters.forEach(function (parameter) {
                                    if (availableParamCodes.indexOf(parameter.code) == -1) {
                                        _this.availableParamList.push(parameter);
                                        availableParamCodes.push(parameter.code);
                                    }
                                });
                            });
                        });
                        _this.parametersListSpinner = false;
                    });
                });
            };
            BatchProcessorController.prototype.setRegionStats = function (statisticsGroup, allFlowStatsSelectedToggle) {
                if (allFlowStatsSelectedToggle === void 0) { allFlowStatsSelectedToggle = null; }
                var checkStatisticsGroup = this.checkArrayForObj(this.selectedFlowStatsList, statisticsGroup);
                if (allFlowStatsSelectedToggle == null) {
                    if (checkStatisticsGroup != -1) {
                        this.selectedFlowStatsList.splice(checkStatisticsGroup, 1);
                        if (this.selectedFlowStatsList.length == 0) {
                            this.selectedParamList = [];
                            this.availableParamList.forEach(function (parameter) {
                                parameter.checked = false;
                                parameter.toggleable = true;
                            });
                        }
                    }
                    else {
                        this.selectedFlowStatsList.push(statisticsGroup);
                        this.setParamCheck(statisticsGroup['regressionRegions']);
                    }
                    this.onSelectedStatisticsGroupChanged();
                }
                else if (allFlowStatsSelectedToggle == true) {
                    if (checkStatisticsGroup == -1) {
                        this.selectedFlowStatsList.push(statisticsGroup);
                        this.setParamCheck(statisticsGroup['regressionRegions']);
                    }
                    this.onSelectedStatisticsGroupChanged();
                }
                else if (allFlowStatsSelectedToggle == false) {
                    if (checkStatisticsGroup != -1) {
                        this.selectedFlowStatsList.splice(checkStatisticsGroup, 1);
                    }
                    this.onSelectedStatisticsGroupChanged(false);
                }
                this.checkStats();
            };
            BatchProcessorController.prototype.setParamCheck = function (regressionRegions) {
                var _this = this;
                regressionRegions.forEach(function (regressionRegion) {
                    regressionRegion.parameters.forEach(function (parameter) {
                        var paramCode = parameter.code;
                        for (var i = 0; i < _this.availableParamList.length; i++) {
                            var p = _this.availableParamList[i];
                            if (p['code'].toUpperCase() === paramCode.toUpperCase()) {
                                p['checked'] = true;
                                p['toggleable'] = false;
                                break;
                            }
                        }
                    });
                });
            };
            BatchProcessorController.prototype.onSelectedStatisticsGroupChanged = function (allFlowStatsSelectedToggle) {
                var _this = this;
                if (allFlowStatsSelectedToggle === void 0) { allFlowStatsSelectedToggle = null; }
                if (allFlowStatsSelectedToggle == false) {
                    this.availableParamList.forEach(function (param) {
                        param.checked = false;
                        param.toggleable = true;
                    });
                }
                this.selectedParamList = [];
                this.selectedFlowStatsList.forEach(function (statisticsGroup) {
                    statisticsGroup['checked'] = true;
                    if (statisticsGroup['regressionRegions']) {
                        statisticsGroup['regressionRegions'].forEach(function (regressionRegion) {
                            regressionRegion.parameters.forEach(function (param) {
                                var found = false;
                                for (var i = 0; i < _this.availableParamList.length; i++) {
                                    var parameter = _this.availableParamList[i];
                                    if (parameter.code.toLowerCase() == param.code.toLowerCase()) {
                                        _this.addParameterToSelectedParamList(param.code);
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    var newParam = {
                                        code: param.code,
                                        description: param.description,
                                        checked: false,
                                        toggleable: true
                                    };
                                    _this.availableParamList.push(newParam);
                                    _this.addParameterToSelectedParamList(param.code);
                                }
                            });
                        });
                    }
                });
            };
            BatchProcessorController.prototype.checkStats = function () {
                if (this.selectedFlowStatsList.length > 0) {
                    this.showBasinCharacteristics = true;
                }
                else {
                    this.showBasinCharacteristics = false;
                }
            };
            BatchProcessorController.prototype.updateSelectedParamList = function (parameter) {
                if (parameter.toggleable == false) {
                    parameter.checked = true;
                    return;
                }
                var paramCode = parameter.code;
                var index = this.selectedParamList.indexOf(paramCode);
                if (!parameter.checked && index > -1) {
                    this.selectedParamList.splice(index, 1);
                }
                else if (parameter.checked && index == -1) {
                    this.selectedParamList.push(paramCode);
                }
                this.checkParameters();
            };
            BatchProcessorController.prototype.checkParameters = function () {
                var allChecked = true;
                for (var _i = 0, _a = this.availableParamList; _i < _a.length; _i++) {
                    var param = _a[_i];
                    if (!param['checked']) {
                        allChecked = false;
                    }
                }
                if (allChecked) {
                    this.parametersAllChecked = false;
                }
                else {
                    this.parametersAllChecked = true;
                }
            };
            BatchProcessorController.prototype.toggleFlowStatisticsAllChecked = function () {
                var _this = this;
                if (this.flowStatsAllChecked) {
                    this.flowStatsAllChecked = false;
                    this.flowStatsList.forEach(function (flowStat) {
                        flowStat['checked'] = true;
                        _this.setRegionStats(flowStat, true);
                    });
                }
                else {
                    this.flowStatsAllChecked = true;
                    this.flowStatsList.forEach(function (flowStat) {
                        flowStat['checked'] = false;
                        _this.setRegionStats(flowStat, false);
                    });
                }
            };
            BatchProcessorController.prototype.toggleParametersAllChecked = function () {
                var _this = this;
                this.availableParamList.forEach(function (parameter) {
                    var paramCheck = _this.selectedParamList.indexOf(parameter.code);
                    if (_this.parametersAllChecked) {
                        if (paramCheck == -1)
                            _this.selectedParamList.push(parameter.code);
                        parameter.checked = true;
                    }
                    else {
                        if (paramCheck > -1 && parameter.toggleable) {
                            _this.selectedParamList.splice(paramCheck, 1);
                            parameter.checked = false;
                        }
                    }
                });
                this.parametersAllChecked = !this.parametersAllChecked;
            };
            BatchProcessorController.prototype.getBatchStatusList = function (email) {
                var _this = this;
                this.getBatchStatusByEmail(email).then(function (response) {
                    _this.batchStatusList = response;
                    _this.retrievingBatchStatus = false;
                });
            };
            BatchProcessorController.prototype.getManageQueueList = function () {
                var _this = this;
                this.getBatchStatusByEmail().then(function (response) {
                    _this.manageQueueList = response;
                    console.log(_this.manageQueueList);
                    _this.retrievingManageQueue = false;
                });
            };
            BatchProcessorController.prototype.trashBatch = function (batchID, deleteCode, batchStatusEmail) {
                var text = "Are you sure you want to delete Batch ID " + batchID + "?";
                if (confirm(text) == true) {
                    this.deleteBatch(batchID, deleteCode, batchStatusEmail);
                }
            };
            BatchProcessorController.prototype.submitBatch = function (submit250) {
                var _this = this;
                if (submit250 === void 0) { submit250 = false; }
                this.toaster.pop("wait", "Submitting Batch", "Please wait...", 0);
                if (this.batchStatusEmail == undefined || this.batchStatusEmail == null) {
                    this.batchStatusEmail = this.submitBatchData.email.toString();
                }
                this.addStatIDtoList();
                var formdata = new FormData();
                formdata.append('region', this.selectedRegion.toString());
                formdata.append('basinCharacteristics', this.selectedParamList.toString());
                formdata.append('flowStatistics', this.flowStatIDs.toString());
                formdata.append('email', this.submitBatchData.email.toString());
                formdata.append('IDField', this.submitBatchData.idField.toString());
                formdata.append('geometryFile', this.submitBatchData.attachment, this.submitBatchData.attachment.name);
                var headers = {
                    "Content-Type": undefined
                };
                this.submittingBatch = true;
                if (submit250 == true) {
                    formdata.append('moreThan250Points', submit250.toString());
                    this.postBatchFormData(formdata, headers).then(function (response) {
                        var r = response;
                        if (r.status == 200) {
                            _this.submitBatchSuccessAlert = true;
                            _this.toaster.clear();
                            _this.toaster.pop('success', "The batch was submitted successfully. You will be notified by email when results are available.", "", 5000);
                            _this.clearBatchForm();
                            _this.getBatchStatusList(_this.batchStatusEmail);
                        }
                        else {
                            var detail = r.data.detail;
                            _this.toaster.clear();
                            _this.toaster.pop('error', "The submission failed for the following reason:", detail, 15000);
                        }
                    }).finally(function () {
                        _this.submittingBatch = false;
                        _this.submitBatchOver250 = false;
                        _this.submitBatchSuccessAlert = true;
                    });
                }
                else {
                    this.toaster.pop("wait", "Submitting Batch", "Please wait...", 0);
                    this.postBatchFormData(formdata, headers).then(function (response) {
                        var r = response;
                        if (r.status == 500 && r.data.detail.indexOf("250") > -1) {
                            _this.submitBatchOver250Message = "Batch contains more than 250 points. Only the first 250 points will be processed. Please select the 'Submit Batch Over 250 Points' button if you would like only the first 250 points to be processed.";
                            _this.submitBatchOver250 = true;
                            _this.toaster.clear();
                            _this.toaster.pop("warning", _this.submitBatchOver250Message, "", 5000);
                        }
                        else if (r.status == 200) {
                            _this.submitBatchSuccessAlert = true;
                            _this.toaster.clear();
                            _this.toaster.pop('success', "The batch was submitted successfully. You will be notified by email when results are available.", "", 5000);
                            _this.clearBatchForm();
                            _this.getBatchStatusList(_this.batchStatusEmail);
                        }
                        else {
                            var detail = r.data.detail;
                            _this.toaster.clear();
                            _this.toaster.pop('error', "The submission failed for the following reason:" + detail, "", 15000);
                        }
                    }).finally(function () {
                        _this.submittingBatch = false;
                    });
                }
            };
            BatchProcessorController.prototype.reorderQueue = function () {
                this.reorderingQueue = true;
                var reorderBatchesPOSTBody = { "batchOrder": [] };
                this.manageQueueList.forEach(function (batch) {
                    if (batch.order != null) {
                        reorderBatchesPOSTBody["batchOrder"].push({
                            "batchID": batch.batchID,
                            "order": batch.order
                        });
                    }
                });
                this.reorderBatches(reorderBatchesPOSTBody);
            };
            BatchProcessorController.prototype.submitPauseBatch = function (batchID) {
                console.log("Pausing batch " + batchID);
                this.pauseBatch(batchID);
            };
            BatchProcessorController.prototype.submitUnpauseBatch = function (batchID) {
                console.log("Unpausing batch " + batchID);
                this.unpauseBatch(batchID);
            };
            BatchProcessorController.prototype.loadParametersByRegionBP = function (rcode) {
                if (!rcode)
                    return;
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSAvailableParams'].format(rcode);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                return this.Execute(request).then(function (response) {
                    if (response.data.parameters && response.data.parameters.length > 0) {
                        var paramRaw = [];
                        response.data.parameters.forEach(function (parameter) {
                            try {
                                var param = {
                                    code: parameter.code,
                                    description: parameter.description,
                                    checked: false,
                                    toggleable: true
                                };
                                paramRaw.push(param);
                            }
                            catch (e) {
                                alert(e);
                            }
                        });
                    }
                    return paramRaw;
                }, function (error) {
                }).finally(function () {
                });
            };
            BatchProcessorController.prototype.postBatchFormData = function (formdata, headers) {
                var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['SSBatchProcessorSubmitBatch'];
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', formdata, headers);
                return this.Execute(request).then(function (response) {
                    return response;
                }, function (error) {
                    return error;
                }).finally(function () { });
            };
            BatchProcessorController.prototype.retrieveBatchStatusMessages = function () {
                var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['SSBatchProcessorStatusMessages'];
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                return this.Execute(request).then(function (response) {
                    var batchStatusMessages = [];
                    response.data.forEach(function (item) {
                        try {
                            var status_1 = {
                                id: item.ID,
                                message: item.Message,
                                description: item.Description
                            };
                            batchStatusMessages.push(status_1);
                        }
                        catch (e) {
                            alert(e);
                        }
                    });
                    return batchStatusMessages;
                }, function (error) {
                }).finally(function () {
                });
            };
            BatchProcessorController.prototype.getBatchStatusByEmail = function (email) {
                var _this = this;
                if (email === void 0) { email = null; }
                if (email) {
                    var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['SSBatchProcessorBatchStatus'].format(email);
                }
                else {
                    var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['SSBatchProcessorGetBatch'];
                }
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                return this.Execute(request).then(function (response) {
                    var batchStatusMessages = [];
                    response.data.forEach(function (batch) {
                        try {
                            var status_2 = {
                                batchID: batch.ID,
                                order: batch.Order,
                                emailAddress: batch.EmailAddress,
                                status: _this.batchStatusMessageList.filter(function (item) { return item.id == batch.StatusID; })[0].id,
                                statusMessage: _this.batchStatusMessageList.filter(function (item) { return item.id == batch.StatusID; })[0].message,
                                statusDescription: _this.batchStatusMessageList.filter(function (item) { return item.id == batch.StatusID; })[0].description,
                                timeSubmitted: batch.TimeSubmitted,
                                timeStarted: batch.TimeStarted,
                                timeCompleted: batch.TimeCompleted,
                                resultsURL: batch.ResultsURL,
                                region: batch.Region,
                                pointsRequested: batch.NumberPoints,
                                pointsSuccessful: batch.NumberPointsSuccessful,
                                deleteCode: batch.DeleteCode
                            };
                            batchStatusMessages.push(status_2);
                        }
                        catch (e) {
                            alert(e);
                        }
                    });
                    return batchStatusMessages;
                }, function (error) {
                }).finally(function () {
                });
            };
            BatchProcessorController.prototype.deleteBatch = function (batchID, deleteCode, batchStatusEmail) {
                var _this = this;
                var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['SSBatchProcessorDeleteBatch'].format(deleteCode);
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.DELETE);
                return this.Execute(request).then(function (response) {
                    var text = "Batch ID " + batchID + " was deleted.";
                    alert(text);
                    _this.getBatchStatusList(batchStatusEmail);
                    _this.retrievingBatchStatus = true;
                    _this.getManageQueueList();
                    _this.retrievingManageQueue = true;
                }, function (error) {
                    var text = "Error deleting batch ID " + batchID + ". Please try again later or click the Help menu button to submit a Support Request.";
                    alert(text);
                }).finally(function () {
                });
            };
            BatchProcessorController.prototype.reorderBatches = function (batchOrder) {
                var _this = this;
                var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['SSBatchProcessorReorderBatch'];
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, "json", angular.toJson(batchOrder));
                return this.Execute(request).then(function (response) {
                    _this.getManageQueueList();
                    _this.retrievingManageQueue = true;
                    _this.toaster.pop('success', "Queue was successfully reordered", "", 5000);
                    return response;
                }, function (error) {
                    _this.toaster.pop('error', "Queue failed to reorder: ", error, 15000);
                    return error;
                }).finally(function () {
                    _this.reorderingQueue = false;
                });
            };
            BatchProcessorController.prototype.pauseBatch = function (batchID) {
                var _this = this;
                var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['SSBatchProcessorBatchPause'].format(batchID);
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST);
                return this.Execute(request).then(function (response) {
                    _this.getManageQueueList();
                    _this.retrievingManageQueue = true;
                    _this.toaster.pop('success', "Batch ID " + batchID + " was paused.", "", 5000);
                    return response;
                }, function (error) {
                    _this.toaster.pop('error', "Batch ID " + batchID + " could not be paused.", error, 15000);
                    return error;
                }).finally(function () {
                });
            };
            BatchProcessorController.prototype.unpauseBatch = function (batchID) {
                var _this = this;
                var url = configuration.baseurls['BatchProcessorServices'] + configuration.queryparams['SSBatchProcessorBatchUnpause'].format(batchID);
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST);
                return this.Execute(request).then(function (response) {
                    _this.getManageQueueList();
                    _this.retrievingManageQueue = true;
                    _this.toaster.pop('success', "Batch ID " + batchID + " was unpaused.", "", 5000);
                    return response;
                }, function (error) {
                    _this.toaster.pop('error', "Batch ID " + batchID + " could not be unpaused.", error, 15000);
                    return error;
                }).finally(function () {
                });
            };
            BatchProcessorController.prototype.init = function () {
                var _this = this;
                this.getRegions();
                this.retrieveBatchStatusMessages().then(function (response) {
                    _this.batchStatusMessageList = response;
                });
            };
            BatchProcessorController.prototype.checkArrayForObj = function (arr, obj) {
                for (var i = 0; i < arr.length; i++) {
                    if (angular.equals(arr[i], obj)) {
                        return i;
                    }
                }
                ;
                return -1;
            };
            BatchProcessorController.prototype.validateZipFile = function ($files) {
                if ($files[0].type != "application/x-zip-compressed" && $files[0].type != "application/zip") {
                    this.toaster.pop('warning', "Please upload a .zip file.", "", 5000);
                    this.submitBatchData.attachment = null;
                }
                return;
            };
            BatchProcessorController.prototype.addParameterToSelectedParamList = function (paramCode) {
                try {
                    for (var i = 0; i < this.availableParamList.length; i++) {
                        var p = this.availableParamList[i];
                        if (p['code'].toUpperCase() === paramCode.toUpperCase() && this.checkArrayForObj(this.selectedParamList, p['code']) == -1) {
                            this.selectedParamList.push(p['code']);
                            p['checked'] = true;
                            p['toggleable'] = false;
                            break;
                        }
                    }
                }
                catch (e) {
                    return false;
                }
            };
            BatchProcessorController.prototype.addStatIDtoList = function () {
                var _this = this;
                this.selectedFlowStatsList.forEach(function (item) {
                    _this.flowStatIDs.push(item['statisticGroupID']);
                });
            };
            BatchProcessorController.prototype.clearBatchForm = function () {
                delete this.selectedRegion;
                delete this.submitBatchData.email;
                delete this.submitBatchData.idField;
                delete this.submitBatchData.attachment;
                this.selectedParamList.length = 0;
                this.flowStatIDs.length = 0;
                this.flowStatsList.length = 0;
                this.availableParamList.length = 0;
                this.selectedFlowStatsList.length = 0;
                this.checkStats();
            };
            BatchProcessorController.$inject = ['$scope', '$http', 'StreamStats.Services.ModalService', 'StreamStats.Services.nssService', '$modalInstance', 'toaster'];
            return BatchProcessorController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.BatchProcessorController', BatchProcessorController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
