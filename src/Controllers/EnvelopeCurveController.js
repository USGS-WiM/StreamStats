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
            function EnvelopeCurveController($scope, $http, modalService, modal, $sce) {
                var _this = _super.call(this, $http, configuration.baseurls.StreamStats) || this;
                _this.regionCodesList = [];
                _this.stationCodes = [];
                _this.peakData = [];
                _this.estPeakData = [];
                _this.drainageData = [];
                _this.formattedPlotData = [];
                $scope.vm = _this;
                _this.selectedRegion = [];
                _this.sce = $sce;
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
            EnvelopeCurveController.prototype.chooseRegionalCode = function () {
                var _this = this;
                var url = 'https://streamstats.usgs.gov/gagestatsservices/regions';
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    _this.regionCodesList = response.data;
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
                        var data = response.data.features;
                        data.forEach(function (station) {
                            var site = station.properties.Code;
                            stations.push(site);
                        });
                        _this.stationCodes = stations;
                    }, function (error) {
                    }).finally(function () {
                        _this.getStationStats();
                    });
                }
                else {
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
                        console.log('station codes', _this.stationCodes);
                    }, function (error) {
                    }).finally(function () {
                    });
                }
            };
            EnvelopeCurveController.prototype.getStationStats = function () {
                console.log('getStationStats');
                var peakData = [];
                var estPeakData = [];
                var stationString = this.stationCodes.toString();
                var numberOfGroups = Math.ceil(this.stationCodes.length / 50);
                var arrayLength = this.stationCodes.length;
                console.log(this.stationCodes.length, numberOfGroups);
                for (var counter = 50; counter < (arrayLength + 50); counter += 50) {
                    var arraySegment = this.stationCodes.slice(counter - 50, counter);
                    var url = 'https://nwis.waterdata.usgs.gov/usa/nwis/peak/?format=rdb&site_no=' + arraySegment.toString();
                    var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                    this.Execute(request).then(function (response) {
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
                    });
                }
                console.log(peakData);
                this.peakData = peakData;
                this.estPeakData = estPeakData;
                console.log('global', this.peakData);
            };
            EnvelopeCurveController.prototype.getDrainageArea = function () {
                var _this = this;
                console.log('getDrainageArea');
                var formattedPlotData = [];
                var completedStationCodes = [];
                var slicedArray = this.stationCodes.slice(0, 50);
                slicedArray.forEach(function (station, index) {
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
                            }
                        });
                        completedStationCodes.push(response.data.code);
                        _this.formattedPlotData = formattedPlotData;
                    }, function (error) {
                    }).finally(function () {
                        if (slicedArray.length - 1 === index) {
                            _this.createEnvelopeCurvePlot();
                        }
                    });
                });
            };
            EnvelopeCurveController.prototype.createEnvelopeCurvePlot = function () {
                console.log('createEnvelopeCurvePlot');
                console.log('inside plot function', this.formattedPlotData);
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
                        text: this.selectedRegion.name,
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
                                        return '</b><br>Value: <b>' + this.y + ' ft³/s</b><br>Site Number: <b>' + this.stationCode + '</b><br>Drainage Area: <b>' + this.x + ' mi²</b><br>';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'scatter',
                            color: 'rgba(83, 223, 83, .5)',
                            data: this.formattedPlotData,
                            marker: { symbol: 'circle', radius: 3 },
                            showInLegend: true
                        }]
                };
            };
            EnvelopeCurveController.prototype.init = function () {
                this.chooseRegionalCode();
            };
            EnvelopeCurveController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            EnvelopeCurveController.$inject = ['$scope', '$http', 'StreamStats.Services.ModalService', '$modalInstance'];
            return EnvelopeCurveController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.EnvelopeCurveController', EnvelopeCurveController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
