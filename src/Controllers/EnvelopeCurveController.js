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
                _this.stationCodes = [];
                _this.peakData = [];
                _this.estPeakData = [];
                _this.drainageData = [];
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
            EnvelopeCurveController.prototype.getStationIDs = function () {
                var _this = this;
                var url = 'https://streamstats.usgs.gov/gagestatsservices/stations/Bounds?xmin=-81.21485781740073&ymin=33.97528059290039&xmax=-81.03042363540376&ymax=34.10508178764378&geojson=true&includeStats=false';
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    var data = response;
                    var stations = [];
                    data.data.features.forEach(function (row) {
                        var site = row.properties.Code;
                        stations.push(site);
                    });
                    _this.stationCodes = stations;
                }, function (error) {
                }).finally(function () {
                    _this.getStationStats();
                });
            };
            EnvelopeCurveController.prototype.getStationStats = function () {
                var _this = this;
                var peakData = [];
                var estPeakData = [];
                this.stationCodes.forEach(function (station) {
                    var url = 'https://nwis.waterdata.usgs.gov/usa/nwis/peak/?format=rdb&site_no=' + station;
                    var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                    _this.Execute(request).then(function (response) {
                        var data = response.data.split('\n').filter(function (r) { return (!r.startsWith("#") && r != ""); });
                        data.shift().split('\t');
                        data.shift();
                        do {
                            var dataRow = data.shift().split('\t');
                            var peakObj = {
                                agency_cd: dataRow[0],
                                site_no: dataRow[1],
                                peak_dt: dataRow[2],
                                peak_va: parseInt(dataRow[4]),
                                peak_stage: parseFloat(dataRow[6])
                            };
                            peakData.push(peakObj);
                            var estPeakObj = {
                                agency_cd: dataRow[0],
                                site_no: dataRow[1],
                                peak_dt: dataRow[2].replaceAll('-00', '-01'),
                                peak_va: parseInt(dataRow[4]),
                                peak_stage: parseFloat(dataRow[6])
                            };
                            if (peakObj.peak_dt[8] + peakObj.peak_dt[9] === '00' || peakObj.peak_dt[5] + peakObj.peak_dt[6] === '00') {
                                estPeakData.push(estPeakObj);
                            }
                            ;
                        } while (data.length > 0);
                        _this.peakData = peakData;
                        console.log('peaks', _this.peakData);
                        _this.estPeakData = estPeakData;
                        _this.getDrainageArea();
                    });
                });
            };
            EnvelopeCurveController.prototype.getDrainageArea = function () {
                var _this = this;
                var formattedPlotData = [];
                var completedStationCodes = [];
                this.stationCodes.forEach(function (station) {
                    var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + station;
                    console.log(url);
                    var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                    _this.Execute(request).then(function (response) {
                        var characteristics = response.data.characteristics;
                        characteristics.forEach(function (index) {
                            if (index.variableTypeID === 1) {
                                _this.peakData.forEach(function (peakElement) {
                                    if (peakElement.site_no === response.data.code && completedStationCodes.indexOf(response.data.code) == -1) {
                                        var formattedPeaksAndDrainage = {
                                            x: index.value,
                                            y: peakElement.peak_va,
                                            stationCode: peakElement.site_no,
                                            Date: peakElement.peak_dt
                                        };
                                        formattedPlotData.push(formattedPeaksAndDrainage);
                                    }
                                });
                                completedStationCodes.push(response.data.code);
                            }
                        });
                    });
                });
                console.log('plot data', formattedPlotData);
            };
            EnvelopeCurveController.prototype.init = function () {
                this.getStationIDs();
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
