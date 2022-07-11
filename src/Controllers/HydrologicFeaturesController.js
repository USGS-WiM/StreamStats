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
        'use strict';
        var HydrologicFeaturesController = (function (_super) {
            __extends(HydrologicFeaturesController, _super);
            function HydrologicFeaturesController($scope, $analytics, toaster, $http, studyAreaService, modal, $timeout, EventManager) {
                var _this = _super.call(this, $http, configuration.baseurls.StormRunoffServices) || this;
                _this.$timeout = $timeout;
                _this.EventManager = EventManager;
                $scope.vm = _this;
                _this.angulartics = $analytics;
                _this.modalInstance = modal;
                _this.StudyArea = studyAreaService.selectedStudyArea;
                _this.studyAreaService = studyAreaService;
                _this.init();
                return _this;
            }
            HydrologicFeaturesController.prototype.selectStream = function (stream) {
                console.log("Stream selected: " + stream.GNIS_ID);
                this.studyAreaService.selectedStudyArea.NHDStream = stream;
            };
            HydrologicFeaturesController.prototype.close = function () {
                this.modalInstance.dismiss('cancel');
            };
            HydrologicFeaturesController.prototype.init = function () { };
            HydrologicFeaturesController.$inject = ['$scope', '$analytics', 'toaster', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance', '$timeout', 'WiM.Event.EventManager'];
            return HydrologicFeaturesController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.HydrologicFeaturesController', HydrologicFeaturesController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
