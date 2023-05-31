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
        var EnvelopeCurveController = (function (_super) {
            __extends(EnvelopeCurveController, _super);
            function EnvelopeCurveController($scope, $http, modal, $sce, pservices) {
                var _this = _super.call(this, $http, configuration.baseurls.StreamStats) || this;
                $scope.vm = _this;
                _this.sce = $sce;
                _this.modalInstance = modal;
                _this.init();
                return _this;
            }
            Object.defineProperty(EnvelopeCurveController.prototype, "Location", {
                get: function () {
                    return this._results.point;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(EnvelopeCurveController.prototype, "Date", {
                get: function () {
                    return this._results.date;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(EnvelopeCurveController.prototype, "Table", {
                get: function () {
                    return this._table;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(EnvelopeCurveController.prototype, "ResultsAvailable", {
                get: function () {
                    return this._resultsAvailable;
                },
                enumerable: false,
                configurable: true
            });
            EnvelopeCurveController.prototype.convertUnsafe = function (x) {
                return this.sce.trustAsHtml(x);
            };
            ;
            Object.defineProperty(EnvelopeCurveController.prototype, "Description", {
                get: function () {
                    var desc = "Envelope Curve Plot";
                    return this.sce.trustAsHtml(desc);
                },
                enumerable: false,
                configurable: true
            });
            EnvelopeCurveController.prototype.getGageStats = function () {
                var url = 'https://streamstats.usgs.gov/gagestatsservices/stations/Bounds?xmin=-81.21485781740073&ymin=33.97528059290039&xmax=-81.03042363540376&ymax=34.10508178764378&geojson=true&includeStats=true';
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                console.log('here', url);
                this.Execute(request).then(function (response) {
                    console.log(response);
                }, function (error) {
                }).finally(function () {
                });
            };
            EnvelopeCurveController.prototype.init = function () {
                this.getGageStats();
            };
            EnvelopeCurveController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            EnvelopeCurveController.$inject = ['$scope', '$http', '$modalInstance', '$sce', 'StreamStats.Services.ProsperService'];
            return EnvelopeCurveController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.EnvelopeCurveController', EnvelopeCurveController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
