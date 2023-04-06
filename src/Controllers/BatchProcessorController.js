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
        var BatchProcessorController = (function (_super) {
            __extends(BatchProcessorController, _super);
            function BatchProcessorController($scope, $http, modalService, nssService, modal) {
                var _this = _super.call(this, $http, configuration.baseurls.StreamStats) || this;
                $scope.vm = _this;
                _this.modalInstance = modal;
                _this.modalService = modalService;
                _this.selectedBatchProcessorTabName = "submitBatch";
                _this.nssService = nssService;
                _this.selectedFlowStatsList = [];
                _this.selectedParamList = [];
                _this.availableParamList = [];
                _this.flowStatsAllChecked = true;
                _this.parametersAllChecked = true;
                _this.showBasinCharacteristics = false;
                _this.init();
                return _this;
            }
            BatchProcessorController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            BatchProcessorController.prototype.selectBatchProcessorTab = function (tabname) {
                this.selectedBatchProcessorTabName = tabname;
            };
            BatchProcessorController.prototype.getRegions = function () {
                var _this = this;
                this.nssService.getRegionList().then(function (response) { _this.regionList = response; });
            };
            BatchProcessorController.prototype.getFlowStatsAndParams = function (rcode) {
                var _this = this;
                this.nssService.getFlowStatsList(rcode).then(function (response) { _this.flowStatsList = response; });
                this.loadParametersByRegionBP(rcode).then(function (response) { _this.availableParamList = response; });
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
                    else {
                    }
                    return paramRaw;
                }, function (error) {
                }).finally(function () {
                });
            };
            BatchProcessorController.prototype.init = function () {
                this.getRegions();
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
            BatchProcessorController.$inject = ['$scope', '$http', 'StreamStats.Services.ModalService', 'StreamStats.Services.nssService', '$modalInstance'];
            return BatchProcessorController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.BatchProcessorController', BatchProcessorController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
