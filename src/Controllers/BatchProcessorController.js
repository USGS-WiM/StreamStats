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
                _this.regionStatsList = [];
                _this.flowStatsAllChecked = true;
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
            };
            BatchProcessorController.prototype.getFlowStats = function (rcode) {
                var _this = this;
                this.nssService.getFlowStatsList(rcode).then(function (response) { _this.flowStatsList = response; });
            };
            BatchProcessorController.prototype.toggleflowStatsAllChecked = function () {
                var _this = this;
                this.flowStatsList.forEach(function (parameter) {
                    var statisticGroupID = parameter.statisticGroupID;
                    var paramCheck = _this.checkArrayForObj(_this.regionStatsList, statisticGroupID);
                    if (_this.flowStatsAllChecked) {
                        if (paramCheck == -1)
                            _this.regionStatsList.push(statisticGroupID);
                        parameter.checked = true;
                    }
                    else {
                        if (paramCheck > -1) {
                            _this.regionStatsList.splice(paramCheck, 1);
                            parameter.checked = false;
                        }
                    }
                });
                this.flowStatsAllChecked = !this.flowStatsAllChecked;
            };
            BatchProcessorController.prototype.updateRegionStatsList = function (parameter) {
                var statisticGroupID = parameter.statisticGroupID;
                var index = this.regionStatsList.indexOf(statisticGroupID);
                if (!parameter.checked && index > -1) {
                    parameter.checked = false;
                    this.regionStatsList.splice(index, 1);
                }
                else if (parameter.checked && index == -1) {
                    parameter.checked = true;
                    this.regionStatsList.push(statisticGroupID);
                }
                this.checkParameters();
            };
            BatchProcessorController.prototype.checkParameters = function () {
                var allChecked = true;
                for (var _i = 0, _a = this.regionStatsList; _i < _a.length; _i++) {
                    var param = _a[_i];
                    if (!param.checked) {
                        allChecked = false;
                    }
                }
                if (allChecked) {
                    this.flowStatsAllChecked = false;
                }
                else {
                    this.flowStatsAllChecked = true;
                }
            };
            BatchProcessorController.prototype.loadParametersByRegionBP = function (rcode) {
                var _this = this;
                this.getParametersByRegionBP(rcode).then(function (response) { _this.parameterListBP = response; });
            };
            BatchProcessorController.prototype.getParametersByRegionBP = function (rcode) {
                if (!rcode)
                    return;
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSAvailableParams'].format(rcode);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                return this.Execute(request).then(function (response) {
                    var paramRaw = [];
                    response.data.parameters.forEach(function (parameter) {
                        parameter.checked = false;
                        parameter.toggleable = true;
                        paramRaw.push(parameter);
                    });
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
            BatchProcessorController.$inject = ['$scope', '$http', 'StreamStats.Services.ModalService', 'StreamStats.Services.nssService', '$modalInstance'];
            return BatchProcessorController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.BatchProcessorController', BatchProcessorController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
