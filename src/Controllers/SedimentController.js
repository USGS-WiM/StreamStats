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
        var SedimentController = (function (_super) {
            __extends(SedimentController, _super);
            function SedimentController($scope, modal, modalservice, studyArea, events, $http, toaster) {
                var _this = _super.call(this, $http, configuration.baseurls.StreamStats) || this;
                _this.events = events;
                _this.isBusy = false;
                _this.selectedReferenceGage = null;
                $scope.vm = _this;
                _this.modalInstance = modal;
                _this.studyAreaService = studyArea;
                _this.modalService = modalservice;
                _this.eventManager = events;
                _this.toaster = toaster;
                _this.init();
                _this.load();
                return _this;
            }
            SedimentController.prototype.close = function () {
                this.modalInstance.dismiss('cancel');
            };
            SedimentController.prototype.ok = function () {
            };
            SedimentController.prototype.init = function () {
                this.isBusy = true;
                this.referenceGageList = null;
                var lat = this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toString();
                var lon = this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toString();
                var url = configuration.baseurls.StreamStatsMapServices + configuration.queryparams.FlowAnywhereGages.format(lon, lat);
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            };
            SedimentController.prototype.load = function () {
            };
            SedimentController.$inject = ['$scope', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.StudyAreaService', 'WiM.Event.EventManager', '$http', 'toaster'];
            return SedimentController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.SedimentController', SedimentController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
