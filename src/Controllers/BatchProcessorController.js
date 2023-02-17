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
            BatchProcessorController.prototype.getFlowStats = function (rcode) {
                var _this = this;
                this.nssService.getFlowStatsList(rcode).then(function (response) { _this.flowStatsList = response; });
            };
            BatchProcessorController.prototype.toggleflowStatsAllChecked = function () {
                this.flowStatsAllChecked = !this.flowStatsAllChecked;
            };
            BatchProcessorController.prototype.init = function () {
                this.AppVersion = configuration.version;
                this.getRegions();
            };
            BatchProcessorController.$inject = ['$scope', '$http', 'StreamStats.Services.ModalService', 'StreamStats.Services.nssService', '$modalInstance'];
            return BatchProcessorController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.BatchProcessorController', BatchProcessorController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
