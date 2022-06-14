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
        var SCStormRunoffReportable = (function () {
            function SCStormRunoffReportable() {
                this.SyntheticUrbanHydrograph = { Graph: {}, Table: {}, PeakQ: {}, Infiltration: {}, ExcessPrecip: {} };
                this.BohmanRural1989 = { Graph: {}, Table: {}, PeakQ: {}, Infiltration: {}, ExcessPrecip: {} };
                this.BohmanUrban1992 = { Graph: {}, Table: {}, PeakQ: {}, Infiltration: {}, ExcessPrecip: {} };
            }
            return SCStormRunoffReportable;
        }());
        var SCStormRunoffController = (function (_super) {
            __extends(SCStormRunoffController, _super);
            function SCStormRunoffController($scope, $analytics, toaster, $http, studyAreaService, StatisticsGroup, region, modal, $timeout, EventManager) {
                var _this = _super.call(this, $http, configuration.baseurls.StormRunoffServices) || this;
                _this.$timeout = $timeout;
                _this.EventManager = EventManager;
                $scope.vm = _this;
                _this.angulartics = $analytics;
                _this.toaster = toaster;
                _this.modalInstance = modal;
                _this.StudyArea = studyAreaService.selectedStudyArea;
                _this.nssService = StatisticsGroup;
                _this.studyAreaService = studyAreaService;
                _this.init();
                _this.print = function () {
                    window.print();
                };
                return _this;
            }
            Object.defineProperty(SCStormRunoffController.prototype, "SelectedTab", {
                get: function () {
                    return this._selectedTab;
                },
                set: function (val) {
                    if (this._selectedTab != val) {
                        this._selectedTab = val;
                        this.selectRunoffType();
                    }
                },
                enumerable: false,
                configurable: true
            });
            SCStormRunoffController.prototype.GetStormRunoffResults = function () {
            };
            SCStormRunoffController.prototype.validateForm = function (mainForm) {
            };
            SCStormRunoffController.prototype.ClearResults = function () {
            };
            SCStormRunoffController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            SCStormRunoffController.prototype.Reset = function () {
                this.init();
            };
            SCStormRunoffController.prototype.downloadCSV = function () {
            };
            SCStormRunoffController.prototype.loadGraphData = function () {
            };
            SCStormRunoffController.prototype.GetTableData = function () {
            };
            SCStormRunoffController.prototype.init = function () {
                this.SelectedTab = SCStormRunoffType.BohmanRural1989;
                this.showResults = false;
                this.hideAlerts = false;
            };
            SCStormRunoffController.prototype.loadParameters = function () {
            };
            SCStormRunoffController.prototype.selectRunoffType = function () {
                switch (this._selectedTab) {
                    case SCStormRunoffType.BohmanRural1989:
                        break;
                    case SCStormRunoffType.BohmanUrban1992:
                        break;
                    default:
                        break;
                }
            };
            SCStormRunoffController.prototype.tableToCSV = function ($table) {
            };
            SCStormRunoffController.$inject = ['$scope', '$analytics', 'toaster', '$http', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'StreamStats.Services.RegionService', '$modalInstance', '$timeout', 'WiM.Event.EventManager'];
            return SCStormRunoffController;
        }(WiM.Services.HTTPServiceBase));
        var SCStormRunoffType;
        (function (SCStormRunoffType) {
            SCStormRunoffType[SCStormRunoffType["BohmanRural1989"] = 1] = "BohmanRural1989";
            SCStormRunoffType[SCStormRunoffType["BohmanUrban1992"] = 2] = "BohmanUrban1992";
            SCStormRunoffType[SCStormRunoffType["SyntheticUrbanHydrograph"] = 3] = "SyntheticUrbanHydrograph";
        })(SCStormRunoffType || (SCStormRunoffType = {}));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.SCStormRunoffController', SCStormRunoffController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
