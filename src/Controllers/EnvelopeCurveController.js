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
            function EnvelopeCurveController($scope, $http, modalService, modal) {
                var _this = _super.call(this, $http, configuration.baseurls.StreamStats) || this;
                _this.regionCodesList = [];
                _this.stationCodes = [];
                _this.peakData = [];
                _this.estPeakData = [];
                _this.drainageData = [];
                _this.formattedPlotData = [];
                $scope.vm = _this;
                _this.selectedRegion = [];
                _this.modalInstance = modal;
                _this.modalService = modalService;
                _this.init();
                return _this;
            }
            Object.defineProperty(EnvelopeCurveController.prototype, "ResultsAvailable", {
                get: function () {
                    return this._resultsAvailable;
                },
                enumerable: false,
                configurable: true
            });
            EnvelopeCurveController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            EnvelopeCurveController.prototype.chooseRegionalCode = function () {
                var _this = this;
                var url = 'https://streamstats.usgs.gov/gagestatsservices/regions';
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    _this.regionCodesList = response.data;
                });
            };
            EnvelopeCurveController.prototype.drawMapBounds = function (options, enable) {
                var _this = this;
                this.leafletData.getMap("mainMap").then(function (map) {
                    _this.drawControl = new L.Draw.Polyline(map, options);
                    _this.drawControl.enable();
                });
            };
            EnvelopeCurveController.prototype.loadPlot = function () {
                this.getStationIDs();
            };
            EnvelopeCurveController.prototype.getStationIDs = function () {
                var _this = this;
                if (this.selectedRegion.length !== 0) {
                    var regionalUrl = 'https://streamstats.usgs.gov/gagestatsservices/stations?regions=' + this.selectedRegion.code + '&pageCount=1000&includeStats=false&geojson=true';
                    var regionalRequest = new WiM.Services.Helpers.RequestInfo(regionalUrl, true, WiM.Services.Helpers.methodType.GET, 'json');
                    this.Execute(regionalRequest).then(function (response) {
                        var stations = [];
                        console.log('region request firing');
                        var data = response.data.features;
                        console.log('data', data);
                        data.forEach(function (station) {
                            var site = station.properties.Code;
                            stations.push(site);
                        });
                        _this.stationCodes = stations;
                        console.log('stationCodes', _this.stationCodes);
                    });
                }
                else {
                    var boundsUrl = 'https://streamstats.usgs.gov/gagestatsservices/stations/Bounds?xmin=-81.21485781740073&ymin=33.97528059290039&xmax=-81.03042363540376&ymax=34.10508178764378&geojson=true&includeStats=false';
                    var boundsRequest = new WiM.Services.Helpers.RequestInfo(boundsUrl, true, WiM.Services.Helpers.methodType.GET, 'json');
                    this.Execute(boundsRequest).then(function (response) {
                        var stations = [];
                        console.log('bounds request firing');
                        var data = response;
                        data.data.features.forEach(function (row) {
                            var site = row.properties.Code;
                            stations.push(site);
                        });
                        _this.stationCodes = stations;
                    });
                }
            };
            EnvelopeCurveController.prototype.getStationStats = function () {
                console.log('hello?');
                var peakData = [];
                var estPeakData = [];
                console.log('stations', this.stationCodes);
                this.stationCodes.forEach(function (station) {
                    var url = 'https://nwis.waterdata.usgs.gov/usa/nwis/peak/?format=json&site_no=' + station;
                    console.log(url);
                    var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                });
            };
            EnvelopeCurveController.prototype.getDrainageArea = function () {
                var _this = this;
                var formattedPlotData = [];
                var completedStationCodes = [];
                this.stationCodes.forEach(function (station) {
                    var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + station;
                    var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                    _this.Execute(request).then(function (response) {
                        var characteristics = response.data.characteristics;
                        characteristics.forEach(function (index) {
                            if (index.variableTypeID === 1) {
                                _this.peakData.forEach(function (peakElement) {
                                    if (peakElement.site_no === response.data.code && completedStationCodes.indexOf(response.data.code) == -1) {
                                        var formattedPeaksAndDrainage = {
                                            x: parseFloat(index.value),
                                            y: parseFloat(peakElement.peak_va),
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
                this.formattedPlotData = formattedPlotData;
                this.createEnvelopeCurvePlot();
            };
            EnvelopeCurveController.prototype.createEnvelopeCurvePlot = function () {
                this.envelopeChartConfig = {
                    chart: {
                        height: 550,
                        width: 800,
                        zooming: { type: 'xy' }
                    },
                    title: {
                        text: 'Envelope Curve',
                        align: 'center'
                    },
                    subtitle: {
                        text: 'example',
                        align: 'center'
                    },
                    xAxis: {
                        title: { text: 'Drainage Area, in mi²' }
                    },
                    yAxis: {
                        title: { text: 'Peak Flow, in ft³/s' }
                    },
                    series: [{
                            name: 'Peak Flow',
                            tooltip: {
                                headerFormat: '',
                                pointFormatter: function () {
                                    if (this.formattedPlotData !== null) {
                                        return '</b><br>Value: <b>' + this.x + 'ft³/s</b><br>Site Number: <b>' + this.stationCode + '<br>';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'scatter',
                            color: '#007df5',
                            data: this.formattedPlotData,
                            marker: { symbol: 'circle', radius: 3 },
                            showInLegend: true
                        }]
                };
            };
            EnvelopeCurveController.prototype.init = function () {
                this.chooseRegionalCode();
            };
            EnvelopeCurveController.$inject = ['$scope', '$http', 'leafletBoundsHelpers', 'leafletData', 'StreamStats.Services.ModalService', '$modalInstance'];
            return EnvelopeCurveController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.EnvelopeCurveController', EnvelopeCurveController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
