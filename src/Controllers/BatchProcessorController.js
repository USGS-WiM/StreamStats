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
                _this.regionParamList = [];
                _this.flowStatChecked = false;
                _this.parametersAllChecked = true;
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
            BatchProcessorController.prototype.setRegionStats = function (statisticsGroup) {
                var checkStatisticsGroup = this.checkArrayForObj(this.selectedFlowStatsList, statisticsGroup);
                if (checkStatisticsGroup != -1) {
                    var preventRemoval = false;
                    if (this.selectedFlowStatsList.filter(function (selectedStatisticsGroup) { return selectedStatisticsGroup.statisticGroupName == "Flow-Duration Curve Transfer Method"; }).length > 0 && statisticsGroup['statisticGroupName'] == "Flow-Duration Statistics") {
                        preventRemoval = true;
                    }
                    if (!preventRemoval) {
                        this.selectedFlowStatsList.splice(checkStatisticsGroup, 1);
                        statisticsGroup['checked'] = false;
                        if (this.selectedFlowStatsList.length == 0) {
                            this.selectedParamList = [];
                            this.availableParamList.forEach(function (parameter) {
                                parameter.checked = false;
                                parameter.toggleable = true;
                            });
                        }
                    }
                }
                else {
                    this.selectedFlowStatsList.push(statisticsGroup);
                    if (typeof statisticsGroup['statisticGroupID'] != 'number' && statisticsGroup['statisticGroupID'].indexOf('fdctm')) {
                        var statisticsGroupFDS = this.selectedFlowStatsList.filter(function (statisticsGroup) { return statisticsGroup.statisticGroupName == "Flow-Duration Statistics"; })[0];
                        var checkStatisticsGroupFDS = this.checkArrayForObj(this.selectedFlowStatsList, statisticsGroupFDS);
                        if (checkStatisticsGroupFDS == -1) {
                            this.selectedFlowStatsList.push(statisticsGroupFDS);
                        }
                    }
                    this.setParamCheck(statisticsGroup['regressionRegions']);
                    this.addParameterToSelectedParamList("DRNAREA");
                }
                this.onSelectedStatisticsGroupChanged();
                this.checkStats();
            };
            BatchProcessorController.prototype.setParamCheck = function (regressionRegions) {
                var _this = this;
                regressionRegions.forEach(function (regressionRegion) {
                    regressionRegion.parameters.forEach(function (parameter) {
                        var paramCode = parameter.code;
                        for (var i = 0; i < _this.availableParamList.length; i++) {
                            var p = _this.availableParamList[i];
                            if (p.code.toUpperCase() === paramCode.toUpperCase()) {
                                p['checked'] = true;
                                p['toggleable'] = false;
                                break;
                            }
                        }
                    });
                });
            };
            BatchProcessorController.prototype.onSelectedStatisticsGroupChanged = function () {
                var _this = this;
                this.selectedFlowStatsList.forEach(function (statisticsGroup) {
                    statisticsGroup.checked = true;
                    if (statisticsGroup.regressionRegions) {
                        statisticsGroup.regressionRegions.forEach(function (regressionRegion) {
                            regressionRegion.parameters.forEach(function (param) {
                                var found = false;
                                for (var i = 0; i < _this.availableParamList.length; i++) {
                                    var parameter = _this.availableParamList[i];
                                    if (parameter.code.toLowerCase() == param.code.toLowerCase()) {
                                        console.log('PARAM FOUND', param.Code);
                                        _this.addParameterToSelectedParamList(param.code);
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    console.log('PARAM NOT FOUND', param.Code);
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
                                    };
                                    _this.availableParamList.push(newParam);
                                    _this.addParameterToSelectedParamList(param.code);
                                }
                            });
                        });
                    }
                });
                console.log("onSelectedStatisticsGroupChanged_selectedParamList", this.selectedParamList);
            };
            BatchProcessorController.prototype.checkStats = function () {
                if (this.selectedFlowStatsList.length > 0) {
                    this.flowStatChecked = true;
                }
                else {
                    this.flowStatChecked = false;
                }
                var allChecked = true;
                for (var _i = 0, _a = this.flowStatsList; _i < _a.length; _i++) {
                    var stat = _a[_i];
                    if (!stat.checked) {
                        allChecked = false;
                    }
                }
                if (allChecked) {
                }
                else {
                }
            };
            BatchProcessorController.prototype.updateSelectedParamList = function (parameter) {
                if (parameter['toggleable'] == false) {
                    console.log("Can't unselect");
                    parameter['checked'] = true;
                    return;
                }
                var paramCode = parameter['code'];
                var index = this.selectedParamList.indexOf(paramCode);
                if (!parameter['checked'] && index > -1) {
                    this.selectedParamList.splice(index, 1);
                    console.log("updateParamsSplice", this.selectedParamList);
                }
                else if (parameter['checked'] && index == -1) {
                    this.selectedParamList.push(paramCode);
                    console.log("updateParamsPush", this.selectedParamList);
                }
                console.log("updateSelectedParamList", this.selectedParamList);
                this.checkParameters();
            };
            BatchProcessorController.prototype.checkParameters = function () {
                var allChecked = true;
                for (var _i = 0, _a = this.availableParamList; _i < _a.length; _i++) {
                    var param = _a[_i];
                    if (!param.checked) {
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
            BatchProcessorController.prototype.toggleParametersAllChecked = function () {
                var _this = this;
                this.availableParamList.forEach(function (parameter) {
                    var paramCheck = _this.checkArrayForObj(_this.selectedParamList, parameter.code);
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
                console.log("toggleParametersAllChecked", this.selectedParamList);
            };
            BatchProcessorController.prototype.init = function () {
                this.AppVersion = configuration.version;
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
                        if (p.code.toUpperCase() === paramCode.toUpperCase() && this.checkArrayForObj(this.selectedParamList, p.code) == -1) {
                            this.selectedParamList.push(p.code);
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
