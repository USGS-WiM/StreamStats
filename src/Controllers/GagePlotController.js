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
        var GageInfo = (function () {
            function GageInfo(sid) {
                this.code = sid;
            }
            return GageInfo;
        }());
        var peakValue = (function () {
            function peakValue() {
            }
            return peakValue;
        }());
        var GagePlotController = (function (_super) {
            __extends(GagePlotController, _super);
            function GagePlotController($scope, $http, modalService, modal) {
                var _this = _super.call(this, $http, configuration.baseurls.StreamStats) || this;
                _this.floodFreq = undefined;
                _this.peakDates = undefined;
                _this.estPeakDates = undefined;
                _this.dailyFlow = undefined;
                _this.formattedFloodFreq = undefined;
                _this.formattedPeakDates = undefined;
                _this.formattedEstPeakDates = undefined;
                _this.formattedDailyFlow = undefined;
                _this.filteredStatGroupsChar = [];
                _this.showPreferred = false;
                _this.multiselectOptions = {
                    displayProp: 'name'
                };
                _this.citationMultiselectOptions = {
                    displayProp: 'id'
                };
                $scope.vm = _this;
                _this.modalInstance = modal;
                _this.modalService = modalService;
                _this.init();
                _this.selectedStatisticGroups = [];
                _this.selectedCitations = [];
                _this.selectedStatGroupsChar = [];
                _this.selectedCitationsChar = [];
                _this.statCitationList = [];
                _this.charCitationList = [];
                _this.showPreferred = false;
                _this.print = function () {
                    window.print();
                };
                return _this;
            }
            GagePlotController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            GagePlotController.prototype.getGagePlot = function () {
                var _this = this;
                this.gage = new GageInfo(this.modalService.modalOptions.siteid);
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + this.gage.code;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    _this.gage = response.data;
                    _this.getPeakInfo();
                    _this.getFloodFreq();
                    _this.getDailyFlow();
                }, function (error) {
                }).finally(function () {
                });
            };
            GagePlotController.prototype.setPreferred = function (pref) {
                this.showPreferred = pref;
            };
            GagePlotController.prototype.getPeakInfo = function () {
                var _this = this;
                var url = 'https://nwis.waterdata.usgs.gov/usa/nwis/peak/?format=rdb&site_no=' + this.gage.code;
                console.log('GetPeakURL', url);
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    var peakValues = [];
                    var estPeakValues = [];
                    var data = response.data.split('\n').filter(function (r) { return (!r.startsWith("#") && r != ""); });
                    var headers = data.shift().split('\t');
                    data.shift();
                    do {
                        var dataRow = data.shift().split('\t');
                        var peakObj = {
                            agency_cd: dataRow[0],
                            site_no: dataRow[1],
                            peak_dt: dataRow[2],
                            peak_va: parseInt(dataRow[4])
                        };
                        peakValues.push(peakObj);
                        var estPeakObj = {
                            agency_cd: dataRow[0],
                            site_no: dataRow[1],
                            peak_dt: dataRow[2].substring(0, 9) + '1',
                            peak_va: parseInt(dataRow[4])
                        };
                        if (peakObj.peak_dt[8] + peakObj.peak_dt[9] === '00' || peakObj.peak_dt[5] + peakObj.peak_dt[6] === '00') {
                            estPeakValues.push(estPeakObj);
                        }
                        ;
                    } while (data.length > 0);
                    var filteredArray = peakValues.filter(function (item) {
                        return (item.peak_dt[8] + item.peak_dt[9] !== '00' || item.peak_dt[5] + item.peak_dt[6] !== '00');
                    });
                    _this.peakDates = filteredArray;
                    _this.estPeakDates = estPeakValues;
                }, function (error) {
                }).finally(function () {
                    _this.getFloodFreq();
                });
            };
            GagePlotController.prototype.getFloodFreq = function () {
                var _this = this;
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + this.gage.code;
                console.log('GetFloodFreqURL', url);
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    var data = response.data;
                    var lookup = [9, 852, 8, 4, 7, 3, 6, 1, 501, 5, 2, 500, 851, 1438, 818];
                    var chartData = [];
                    do {
                        var IDs = data.statistics;
                        for (var _i = 0, IDs_1 = IDs; _i < IDs_1.length; _i++) {
                            var item = IDs_1[_i];
                            if (lookup.indexOf(item.regressionTypeID) >= 0 && item.isPreferred == true) {
                                chartData.push(item);
                            }
                        }
                    } while (data.length > 0);
                    _this.floodFreq = chartData;
                }).finally(function () {
                    _this.getDailyFlow();
                });
            };
            ;
            GagePlotController.prototype.getDailyFlow = function () {
                var _this = this;
                var url = 'https://nwis.waterservices.usgs.gov/nwis/dv/?format=json&sites=' + this.gage.code + '&parameterCd=00060&statCd=00003&startDT=1900-01-01';
                console.log('GetDailyFlowURL', url);
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    var data = response.data.value.timeSeries[0].values[0].value;
                    _this.dailyFlow = data;
                    console.log('daily flow', data);
                    _this.formatData();
                });
            };
            ;
            GagePlotController.prototype.formatData = function () {
                var _this = this;
                if (this.peakDates) {
                    this.formattedPeakDates = [];
                    this.peakDates.forEach(function (test) {
                        _this.formattedPeakDates.push({ x: new Date(test.peak_dt), y: test.peak_va });
                    });
                }
                if (this.estPeakDates) {
                    this.formattedEstPeakDates = [];
                    this.estPeakDates.forEach(function (test) {
                        _this.formattedEstPeakDates.push({ x: new Date(test.peak_dt), y: test.peak_va });
                    });
                }
                if (this.dailyFlow) {
                    this.formattedDailyFlow = [];
                    this.dailyFlow.forEach(function (test) {
                        if (test.qualifiers[0] === 'A') {
                            _this.formattedDailyFlow.push({ x: new Date(test.dateTime), y: parseInt(test.value) });
                        }
                    });
                }
                if (this.floodFreq) {
                    this.formattedFloodFreq = [];
                    var AEPColors_1 = {
                        9: '#9A6324',
                        852: '#800000',
                        8: '#e6194B',
                        818: '#ffd8b1',
                        7: '#f58231',
                        6: '#ffe119',
                        5: '#bfef45',
                        4: '#3cb44b',
                        3: '#42d4f4',
                        1: '#4363d8',
                        501: '#000075',
                        2: '#911eb4',
                        500: '#dcbeff',
                        851: '#fabed4',
                        1438: '#469990'
                    };
                    this.floodFreq.forEach(function (floodFreqItem) {
                        var colorIndex = floodFreqItem.regressionTypeID;
                        var formattedName = floodFreqItem.regressionType.name.substring(0, floodFreqItem.regressionType.name.length - 18);
                        _this.formattedFloodFreq.push({
                            value: floodFreqItem.value,
                            color: AEPColors_1[colorIndex],
                            width: 1.5,
                            zIndex: 4,
                            label: { text: formattedName + '% AEP' }
                        });
                    });
                    this.createAnnualFlowPlot();
                }
            };
            GagePlotController.prototype.createAnnualFlowPlot = function () {
                var _this = this;
                console.log('peak value plot data', this.formattedPeakDates);
                console.log('daily flow plot data', this.formattedDailyFlow);
                this.chartConfig = {
                    chart: {
                        height: 450,
                        width: 800,
                        zooming: {
                            type: 'xy'
                        }
                    },
                    title: {
                        text: 'Annual Peak Streamflow',
                        align: 'center'
                    },
                    subtitle: {
                        text: 'Click and drag in the plot area to zoom in',
                        align: 'center'
                    },
                    xAxis: {
                        type: 'datetime',
                        title: {
                            text: 'Date'
                        },
                    },
                    yAxis: {
                        title: {
                            text: 'Discharge (Q), in ft³/s'
                        },
                        plotLines: []
                    },
                    series: [
                        {
                            name: 'Daily Flow',
                            tooltip: {
                                headerFormat: '<b>Daily Flow<br>',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        var UTCday = this.x.getUTCDate();
                                        var year = this.x.getUTCFullYear();
                                        var month = this.x.getUTCMonth();
                                        month += 1;
                                        var formattedUTCDailyDate = month + '/' + UTCday + '/' + year;
                                        return '<b>Date: ' + formattedUTCDailyDate + '<br>Value: ' + this.y + ' ft³/s';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'line',
                            color: '#add8f2',
                            data: this.formattedDailyFlow,
                            marker: {
                                symbol: '',
                                radius: 3
                            }
                        },
                        {
                            name: 'Annual Peak Streamflow',
                            tooltip: {
                                headerFormat: '<b>Peak Annual Flow<br>',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        var waterYear = this.x.getUTCFullYear();
                                        if (this.x.getUTCMonth() > 8) {
                                            waterYear += 1;
                                        }
                                        ;
                                        var UTCday = this.x.getUTCDate();
                                        var year = this.x.getUTCFullYear();
                                        var month = this.x.getUTCMonth();
                                        month += 1;
                                        var formattedUTCPeakDate = month + '/' + UTCday + '/' + year;
                                        return '<b>Date: ' + formattedUTCPeakDate + '<br>Value: ' + this.y + ' ft³/s<br>Water Year: ' + waterYear;
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'scatter',
                            color: 'black',
                            data: this.formattedPeakDates,
                            marker: {
                                symbol: 'circle',
                                radius: 3
                            }
                        },
                        {
                            name: 'Annual Peak Streamflow (Date Estimated)',
                            tooltip: {
                                headerFormat: '<b>Peak Annual Flow<br>',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        var waterYear = this.x.getUTCFullYear();
                                        if (this.x.getUTCMonth() > 8) {
                                            waterYear += 1;
                                        }
                                        ;
                                        var UTCday = this.x.getUTCDate();
                                        var year = this.x.getUTCFullYear();
                                        var month = this.x.getUTCMonth();
                                        month += 1;
                                        var formattedUTCPeakDate = month + '/' + UTCday + '/' + year;
                                        return '<b>Date (estimated): ' + formattedUTCPeakDate + '<br>Value: ' + this.y + ' ft³/s<br>Water Year: ' + waterYear;
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'scatter',
                            color: 'red',
                            data: this.formattedEstPeakDates,
                            marker: {
                                symbol: 'square',
                                radius: 3
                            }
                        }
                    ]
                };
                this.formattedFloodFreq.forEach(function (formattedFloodFreqItem) {
                    _this.chartConfig.yAxis.plotLines.push(formattedFloodFreqItem);
                });
            };
            GagePlotController.prototype.init = function () {
                this.AppVersion = configuration.version;
                this.getGagePlot();
            };
            GagePlotController.$inject = ['$scope', '$http', 'StreamStats.Services.ModalService', '$modalInstance'];
            return GagePlotController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers').controller('StreamStats.Controllers.GagePlotController', GagePlotController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
