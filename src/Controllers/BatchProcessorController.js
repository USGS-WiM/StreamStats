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
                _this.flowStatsAllChecked = true;
                _this.flowStatChecked = true;
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
                this.flowStatsAllChecked = true;
                this.flowStatChecked = false;
            };
            BatchProcessorController.prototype.getFlowStatsAndParams = function (rcode) {
                var _this = this;
                this.nssService.getFlowStatsList(rcode).then(function (response) { _this.flowStatsList = response; });
                this.loadParametersByRegionBP(rcode).then(function (response) { _this.availableParamList = response; });
            };
            BatchProcessorController.prototype.setRegionStats = function (statisticsGroup) {
                console.log("statisticsGroup", statisticsGroup);
                var checkStatisticsGroup = this.checkArrayForObj(this.selectedFlowStatsList, statisticsGroup);
                if (checkStatisticsGroup != -1) {
                    var preventRemoval = false;
                    if (this.selectedFlowStatsList.filter(function (selectedStatisticsGroup) { return selectedStatisticsGroup.statisticGroupName == "Flow-Duration Curve Transfer Method"; }).length > 0 && statisticsGroup.statisticGroupName == "Flow-Duration Statistics") {
                        preventRemoval = true;
                    }
                    if (!preventRemoval) {
                        this.selectedFlowStatsList.splice(checkStatisticsGroup, 1);
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
                    if (typeof statisticsGroup.statisticGroupID != 'number' && statisticsGroup.statisticGroupID.indexOf('fdctm')) {
                        var statisticsGroupFDS = this.selectedFlowStatsList.filter(function (statisticsGroup) { return statisticsGroup.statisticGroupName == "Flow-Duration Statistics"; })[0];
                        var checkStatisticsGroupFDS = this.checkArrayForObj(this.selectedFlowStatsList, statisticsGroupFDS);
                        if (checkStatisticsGroupFDS == -1) {
                            this.selectedFlowStatsList.push(statisticsGroupFDS);
                        }
                    }
                    this.loadParametersByStatisticsGroupBP(statisticsGroup.regressionRegions);
                }
                console.log("setRegionStats_selectedFlowStatsList", this.selectedFlowStatsList);
                console.log("setRegionStats_selectedParamList", this.selectedParamList);
            };
            BatchProcessorController.prototype.loadParametersByStatisticsGroupBP = function (regressionRegions) {
                var _this = this;
                regressionRegions.forEach(function (regressionRegion) {
                    regressionRegion.parameters.forEach(function (parameter) {
                        _this.selectedParamList.push(parameter.code);
                    });
                });
                console.log("loadParametersByStatisticsGroupBP_selectedParamList", this.selectedParamList);
            };
            BatchProcessorController.prototype.updateRegionStatsList = function (statistic) {
                var statisticGroupID = statistic.statisticGroupID;
                var index = this.selectedFlowStatsList.indexOf(statisticGroupID);
                if (!statistic.checked && index > -1) {
                    statistic.checked = false;
                    this.selectedFlowStatsList.splice(index, 1);
                }
                else if (statistic.checked && index == -1) {
                    statistic.checked = true;
                    this.selectedFlowStatsList.push(statisticGroupID);
                }
                this.checkStats();
            };
            BatchProcessorController.prototype.checkStats = function () {
                var allChecked = true;
                for (var _i = 0, _a = this.selectedFlowStatsList; _i < _a.length; _i++) {
                    var stat = _a[_i];
                    if (!stat.checked) {
                        allChecked = false;
                    }
                }
                if (allChecked) {
                    this.flowStatsAllChecked = false;
                    this.flowStatChecked = false;
                }
                else {
                    this.flowStatsAllChecked = true;
                    this.flowStatChecked = true;
                }
            };
            BatchProcessorController.prototype.updateSelectedParamList = function (parameter) {
                if (parameter.toggleable == false) {
                    parameter.checked = true;
                    return;
                }
                var index = this.selectedParamList.indexOf(parameter);
                if (!parameter.checked && index > -1) {
                    this.selectedParamList.splice(index, 1);
                }
                else if (parameter.checked && index == -1) {
                    this.selectedParamList.push(parameter);
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
                        if (p.code.toUpperCase() === paramCode.toUpperCase() && this.checkArrayForObj(this.selectedParamList, p) == -1) {
                            this.selectedParamList.push(p);
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
            BatchProcessorController.prototype.toggleflowStatsAllChecked = function () {
                var _this = this;
                this.flowStatsList.forEach(function (parameter) {
                    var statisticGroupID = parameter.statisticGroupID;
                    var paramCheck = _this.checkArrayForObj(_this.selectedFlowStatsList, statisticGroupID);
                    if (_this.flowStatsAllChecked) {
                        if (paramCheck == -1)
                            _this.selectedFlowStatsList.push(statisticGroupID);
                        parameter.checked = true;
                        _this.flowStatChecked = true;
                    }
                    else {
                        if (paramCheck > -1) {
                            _this.selectedFlowStatsList.splice(paramCheck, 1);
                            parameter.checked = false;
                            _this.flowStatChecked = false;
                        }
                    }
                });
                this.flowStatsAllChecked = !this.flowStatsAllChecked;
            };
            BatchProcessorController.$inject = ['$scope', '$http', 'StreamStats.Services.ModalService', 'StreamStats.Services.nssService', '$modalInstance'];
            return BatchProcessorController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.BatchProcessorController', BatchProcessorController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
