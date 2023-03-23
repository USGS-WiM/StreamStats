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
        var GageCharacteristic = (function () {
            function GageCharacteristic() {
            }
            return GageCharacteristic;
        }());
        var UnitType = (function () {
            function UnitType() {
            }
            return UnitType;
        }());
        var VariableType = (function () {
            function VariableType() {
            }
            return VariableType;
        }());
        var Citation = (function () {
            function Citation() {
            }
            return Citation;
        }());
        var GageStatisticGroup = (function () {
            function GageStatisticGroup() {
            }
            return GageStatisticGroup;
        }());
        var GageStatistic = (function () {
            function GageStatistic() {
            }
            return GageStatistic;
        }());
        var PredictionInterval = (function () {
            function PredictionInterval() {
            }
            return PredictionInterval;
        }());
        var StationType = (function () {
            function StationType() {
            }
            return StationType;
        }());
        var Agency = (function () {
            function Agency() {
            }
            return Agency;
        }());
        var RegressionType = (function () {
            function RegressionType() {
            }
            return RegressionType;
        }());
        var GagePageController = (function (_super) {
            __extends(GagePageController, _super);
            function GagePageController($scope, $http, modalService, modal) {
                var _this_1 = _super.call(this, $http, configuration.baseurls.StreamStats) || this;
                _this_1.filteredStatGroupsChar = [];
                _this_1.showPreferred = false;
                _this_1.multiselectOptions = {
                    displayProp: 'name'
                };
                _this_1.citationMultiselectOptions = {
                    displayProp: 'id'
                };
                _this_1.URLsToDisplay = [];
                _this_1.floodFreq = undefined;
                _this_1.peakDates = undefined;
                _this_1.estPeakDates = undefined;
                _this_1.dailyFlow = undefined;
                _this_1.NWSforecast = undefined;
                _this_1.meanPercentileStats = undefined;
                _this_1.meanPercent = undefined;
                _this_1.formattedP0to10 = [];
                _this_1.formattedP10to25 = [];
                _this_1.formattedP25to75 = [];
                _this_1.formattedP75to90 = [];
                _this_1.formattedP90to100 = [];
                _this_1.formattedFloodFreq = [];
                _this_1.formattedPeakDates = [];
                _this_1.formattedPeakDatesOnYear = [];
                _this_1.formattedEstPeakDatesOnYear = [];
                _this_1.formattedEstPeakDates = [];
                _this_1.formattedDailyFlow = [];
                _this_1.dailyDatesOnly = [];
                _this_1.showAEP = true;
                _this_1.logScale = false;
                _this_1.peaksOnYear = true;
                $scope.vm = _this_1;
                _this_1.modalInstance = modal;
                _this_1.modalService = modalService;
                _this_1.init();
                _this_1.selectedStatisticGroups = [];
                _this_1.selectedCitations = [];
                _this_1.selectedStatGroupsChar = [];
                _this_1.selectedCitationsChar = [];
                _this_1.statCitationList = [];
                _this_1.charCitationList = [];
                _this_1.showPreferred = false;
                _this_1.print = function () {
                    gtag('event', 'Download', { 'Category': 'GagePage', "Type": 'Print' });
                    window.print();
                };
                return _this_1;
            }
            Object.defineProperty(GagePageController.prototype, "SelectedTab", {
                get: function () {
                    return this._selectedTab;
                },
                set: function (val) {
                    if (this._selectedTab != val) {
                        this._selectedTab = val;
                    }
                },
                enumerable: false,
                configurable: true
            });
            GagePageController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            GagePageController.prototype.getGagePage = function () {
                var _this_1 = this;
                this.gage = new GageInfo(this.modalService.modalOptions.siteid);
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + this.gage.code;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    _this_1.gage = response.data;
                    _this_1.gage.lat = response.data.location.coordinates[1];
                    _this_1.gage.lng = response.data.location.coordinates[0];
                    _this_1.gage.statisticsgroups = [];
                    _this_1.gage.citations = [];
                    _this_1.getStationCharacteristics(response.data.characteristics);
                    _this_1.getStationStatistics(response.data.statistics);
                    _this_1.getNWISInfo();
                    _this_1.getNWISPeriodOfRecord(_this_1.gage);
                    _this_1.additionalLinkCheck(_this_1.gage.code);
                }, function (error) {
                }).finally(function () {
                });
            };
            GagePageController.prototype.additionalLinkCheck = function (siteNo) {
                var _this_1 = this;
                this.URLsToDisplay = [];
                var additionalURLs = [
                    {
                        url: 'https://streamstats.usgs.gov/gagePages/NC/Sta_' + siteNo + '_daily_discharge_percentiles_table_by-wateryears.txt',
                        text: "Flow-Duration Statistics by Water Year",
                        available: false
                    },
                    {
                        url: 'https://streamstats.usgs.gov/gagePages/NC/Sta_' + siteNo + '_daily_discharge_percentiles_table_by-day-month-seasonal.txt',
                        text: "Flow-Duration Statistics by Period of Record, Calendar Day & Month, & Seasonal Periods",
                        available: false
                    },
                    {
                        url: 'https://streamstats.usgs.gov/gagePages/IA/' + siteNo + '_stats.pdf',
                        text: "Stream Flow Statistics",
                        available: false
                    }
                ];
                var _loop_1 = function (index) {
                    request = new WiM.Services.Helpers.RequestInfo(additionalURLs[index].url, true, WiM.Services.Helpers.methodType.GET, 'json');
                    this_1.Execute(request).then(function (response) {
                        if (response.status == 200) {
                            additionalURLs[index].available = true;
                            _this_1.URLsToDisplay.push(additionalURLs[index]);
                        }
                    }, function (error) {
                    }).finally(function () {
                    });
                };
                var this_1 = this, request;
                for (var index = 0; index < additionalURLs.length; index++) {
                    _loop_1(index);
                }
            };
            GagePageController.prototype.setPreferred = function (pref) {
                this.showPreferred = pref;
            };
            GagePageController.prototype.getStationCharacteristics = function (characteristics) {
                var _this_1 = this;
                characteristics.forEach(function (char, index) {
                    var characteristic = char;
                    if (char.hasOwnProperty('citation') && char.citation.id) {
                        if (char.citation && char.citation.citationURL)
                            char.citation.citationURL = char.citation.citationURL.replace('#', '');
                        if (!_this_1.checkForCitation(char.citation.id)) {
                            _this_1.gage.citations.push(char.citation);
                        }
                        if (!_this_1.checkForStatOrCharCitation(char.citation.id, _this_1.charCitationList)) {
                            _this_1.charCitationList.push(char.citation);
                        }
                    }
                    if (!_this_1.checkForCharStatisticGroup(char.variableType.statisticGroupTypeID)) {
                        if (char.hasOwnProperty('statisticGroupType')) {
                            var statgroup = char.statisticGroupType;
                            _this_1.filteredStatGroupsChar.push(statgroup);
                        }
                        else {
                            _this_1.getCharStatGroup(char.variableType.statisticGroupTypeID);
                        }
                    }
                });
            };
            GagePageController.prototype.checkForCitation = function (id) {
                var found = this.gage.citations.some(function (el) { return el.id === id; });
                return found;
            };
            GagePageController.prototype.checkForStatOrCharCitation = function (id, citationlist) {
                var found = citationlist.some(function (el) { return el.id === id; });
                return found;
            };
            GagePageController.prototype.getStationStatistics = function (statistics) {
                var _this_1 = this;
                statistics.forEach(function (stat, index) {
                    if (stat.hasOwnProperty('citation') && stat.citation.id) {
                        if (stat.citation && stat.citation.citationURL)
                            stat.citation.citationURL = stat.citation.citationURL.replace('#', '');
                        if (!_this_1.checkForCitation(stat.citation.id)) {
                            _this_1.gage.citations.push(stat.citation);
                        }
                        if (!_this_1.checkForStatOrCharCitation(stat.citation.id, _this_1.statCitationList)) {
                            _this_1.statCitationList.push(stat.citation);
                        }
                    }
                    if (!_this_1.checkForStatisticGroup(stat.statisticGroupTypeID)) {
                        if (stat.hasOwnProperty('statisticGroupType')) {
                            var statgroup = stat.statisticGroupType;
                            _this_1.gage.statisticsgroups.push(statgroup);
                        }
                        else {
                            _this_1.getStatGroup(stat.statisticGroupTypeID);
                        }
                    }
                });
            };
            GagePageController.prototype.getStatGroup = function (id) {
                var _this_1 = this;
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStatGroups + id;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    if (!_this_1.checkForStatisticGroup(response.data.id))
                        _this_1.gage.statisticsgroups.push(response.data);
                });
            };
            GagePageController.prototype.getCharStatGroup = function (id) {
                var _this_1 = this;
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStatGroups + id;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    if (!_this_1.checkForCharStatisticGroup(response.data.id))
                        _this_1.filteredStatGroupsChar.push(response.data);
                });
            };
            GagePageController.prototype.checkForStatisticGroup = function (id) {
                var found = this.gage.statisticsgroups.some(function (el) { return el.id === id; });
                return found;
            };
            GagePageController.prototype.checkForCharStatisticGroup = function (id) {
                var found = this.filteredStatGroupsChar.some(function (el) { return el.id === id; });
                return found;
            };
            GagePageController.prototype.checkForPredInt = function (statGroupID) {
                var found = this.gage.statistics.some(function (el) { return el.statisticGroupTypeID == statGroupID && el.hasOwnProperty('predictionInterval'); });
                return found;
            };
            GagePageController.prototype.getNWISInfo = function () {
                var _this_1 = this;
                var url = configuration.baseurls.NWISurl + configuration.queryparams.NWISsiteinfo + this.gage.code;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    var regex = /[+-]?((\d+(\.\d*)?)|(\.\d+))/g;
                    var latLong = response.data.split(_this_1.gage.name)[1].match(regex);
                    _this_1.NWISlat = latLong[0];
                    _this_1.NWISlng = latLong[1];
                });
            };
            GagePageController.prototype.getNWISPeriodOfRecord = function (gage) {
                if (!gage.code)
                    return;
                var nwis_url = configuration.baseurls.NWISurl + configuration.queryparams.NWISperiodOfRecord + gage.code;
                var nwis_request = new WiM.Services.Helpers.RequestInfo(nwis_url, true, WiM.Services.Helpers.methodType.GET, 'TEXT');
                this.Execute(nwis_request).then(function (response) {
                    var data = response.data.split('\n').filter(function (r) { return (!r.startsWith("#") && r != ""); });
                    var headers = data.shift().split('\t');
                    data.shift();
                    do {
                        var station = data.shift().split('\t');
                        if (station[headers.indexOf("parm_cd")] == "00060") {
                            if (gage['StartDate'] == undefined)
                                gage['StartDate'] = new Date(station[headers.indexOf("begin_date")]);
                            else {
                                var nextStartDate = new Date(station[headers.indexOf("begin_date")]);
                                if (nextStartDate < gage['StartDate'])
                                    gage['StartDate'] = nextStartDate;
                            }
                            if (gage['EndDate'] == undefined)
                                gage['EndDate'] = new Date(station[headers.indexOf("end_date")]);
                            else {
                                var nextEndDate = new Date(station[headers.indexOf("end_date")]);
                                if (nextEndDate > gage['EndDate'])
                                    gage['EndDate'] = nextEndDate;
                            }
                        }
                    } while (data.length > 0);
                }, function (error) {
                    gage['StartDate'] = undefined;
                    gage['EndDate'] = undefined;
                }).finally(function () {
                });
            };
            GagePageController.prototype.citationSelected = function (item, list) {
                for (var citation in list) {
                    if (list[citation].id === item.citationID) {
                        return true;
                    }
                }
                return false;
            };
            GagePageController.prototype.downloadCSV = function () {
                gtag('event', 'Download', { 'Category': 'GagePage', "Type": 'CSV' });
                var disclaimer = '"USGS Data Disclaimer: Unless otherwise stated, all data, metadata and related materials are considered to satisfy the quality standards relative to the purpose for which the data were collected. Although these data and associated metadata have been reviewed for accuracy and completeness and approved for release by the U.S. Geological Survey (USGS), no warranty expressed or implied is made regarding the display or utility of the data for other purposes, nor on all computer systems, nor shall the act of distribution constitute any such warranty."\n'
                    + '"USGS Software Disclaimer: This software has been approved for release by the U.S. Geological Survey (USGS). Although the software has been subjected to rigorous review, the USGS reserves the right to update the software as needed pursuant to further analysis and review. No warranty, expressed or implied, is made by the USGS or the U.S. Government as to the functionality of the software and related material nor shall the fact of release constitute any such warranty. Furthermore, the software is released on condition that neither the USGS nor the U.S. Government shall be held liable for any damages resulting from its authorized or unauthorized use."\n'
                    + '"USGS Product Names Disclaimer: Any use of trade, firm, or product names is for descriptive purposes only and does not imply endorsement by the U.S. Government."\n\n';
                var periodOfRecord = (this.gage['StartDate'] !== undefined || this.gage['EndDate'] !== undefined) ? this.convertDateToString(this.gage['StartDate']) + " - " + this.convertDateToString(this.gage['EndDate']) : "Undefined";
                var filename = 'data.csv';
                var csvFile = '\uFEFFStreamStats Gage Page\n\n'
                    + 'Gage Information\n'
                    + 'Name,Value\n'
                    + 'USGS Station Number,"' + this.gage.code + '"\n'
                    + 'Station Name,"' + this.gage.name + '"\n'
                    + 'Station Type,"' + this.gage.stationType.name + '"\n'
                    + 'Latitude,"' + this.gage.lat + '"\n'
                    + 'Longitude,"' + this.gage.lng + '"\n'
                    + 'NWIS Latitude,"' + this.NWISlat + '"\n'
                    + 'NWIS Longitude,"' + this.NWISlng + '"\n'
                    + 'Is regulated?,"' + this.gage.isRegulated + '"\n'
                    + 'Agency,"' + this.gage.agency.name + '"\n'
                    + 'NWIS Discharge Period of Record,"' + periodOfRecord + '"\n\n';
                var _this = this;
                if (this.gage.characteristics.length > 0) {
                    csvFile += 'Physical Characteristics\n\n';
                    this.filteredStatGroupsChar.forEach(function (statisticGroup) {
                        if (_this.selectedStatGroupsChar.length == 0 || _this.selectedStatGroupsChar.indexOf(statisticGroup) > -1) {
                            csvFile += '"' + statisticGroup.name + '"\n'
                                + _this.tableToCSV($('#physical-characteristics-table-' + statisticGroup.id)) + "\n\n";
                        }
                    });
                }
                if (this.gage.statisticsgroups.length > 0) {
                    csvFile += 'Streamflow Statistics\n\n';
                    this.gage.statisticsgroups.forEach(function (statisticGroup) {
                        if (_this.selectedStatisticGroups.length == 0 || _this.selectedStatisticGroups.indexOf(statisticGroup) > -1) {
                            csvFile += '"' + statisticGroup.name + '"\n'
                                + _this.tableToCSV($('#streamflow-statistics-table-' + statisticGroup.id)) + "\n\n";
                        }
                    });
                }
                if (this.gage.citations.length > 0) {
                    csvFile += "Citations\n"
                        + this.tableToCSV($('#citations-table')) + "\n\n";
                }
                csvFile += disclaimer
                    + '"Application Version:",' + this.AppVersion;
                var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, filename);
                }
                else {
                    var link = document.createElement("a");
                    var url = URL.createObjectURL(blob);
                    if (link.download !== undefined) {
                        link.setAttribute("href", url);
                        link.setAttribute("download", filename);
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                    else {
                        window.open(url);
                    }
                }
            };
            GagePageController.prototype.getGagePlots = function () {
                this.getPeakInfo();
            };
            GagePageController.prototype.getPeakInfo = function () {
                var _this_1 = this;
                var url = 'https://nwis.waterdata.usgs.gov/usa/nwis/peak/?format=rdb&site_no=' + this.gage.code;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    var peakValues = [];
                    var estPeakValues = [];
                    var data = response.data.split('\n').filter(function (r) { return (!r.startsWith("#") && r != ""); });
                    data.shift().split('\t');
                    data.shift();
                    do {
                        var dataRow = data.shift().split('\t');
                        var peakObj = {
                            agency_cd: dataRow[0],
                            site_no: dataRow[1],
                            peak_dt: dataRow[2],
                            peak_va: parseFloat(dataRow[4])
                        };
                        peakValues.push(peakObj);
                        var estPeakObj = {
                            agency_cd: dataRow[0],
                            site_no: dataRow[1],
                            peak_dt: dataRow[2].replaceAll('-00', '-01'),
                            peak_va: parseFloat(dataRow[4])
                        };
                        if (peakObj.peak_dt[8] + peakObj.peak_dt[9] === '00' || peakObj.peak_dt[5] + peakObj.peak_dt[6] === '00') {
                            estPeakValues.push(estPeakObj);
                        }
                        ;
                    } while (data.length > 0);
                    var filteredArray = peakValues.filter(function (item) {
                        return (item.peak_dt[8] + item.peak_dt[9] !== '00' || item.peak_dt[8] + item.peak_dt[9] !== '00');
                    });
                    _this_1.peakDates = filteredArray;
                    _this_1.estPeakDates = estPeakValues;
                }, function (error) {
                }).finally(function () {
                    _this_1.getFloodFreq();
                });
            };
            GagePageController.prototype.getFloodFreq = function () {
                var _this_1 = this;
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + this.gage.code;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    var data = response.data;
                    var lookup = [9, 852, 8, 4, 7, 3, 6, 1, 501, 5, 2, 500, 851, 1438, 818, 2311, 2312, 2313, 2314, 2315, 2316, 2317, 2318];
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
                    _this_1.floodFreq = chartData;
                }).finally(function () {
                    _this_1.getDailyFlow();
                });
            };
            GagePageController.prototype.getDailyFlow = function () {
                var _this_1 = this;
                var url = 'https://nwis.waterservices.usgs.gov/nwis/dv/?format=json&sites=' + this.gage.code + '&parameterCd=00060&statCd=00003&startDT=1900-01-01';
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    var data = response.data.value.timeSeries;
                    if (data.length !== 0) {
                        var dailyValues = data[0].values[0].value;
                    }
                    else {
                        dailyValues = 0;
                    }
                    ;
                    _this_1.dailyFlow = dailyValues;
                    _this_1.getNWSForecast();
                });
            };
            GagePageController.prototype.getNWSForecast = function () {
                var self = this;
                var url = undefined;
                var nwisCode = this.gage.code;
                this.$http.get('./data/gageNumberCrossWalk.json').then(function (response) {
                    self.crossWalk = response.data;
                    var NWScode = self.crossWalk[nwisCode];
                    if (NWScode !== undefined) {
                        url = "https://water.weather.gov/ahps2/hydrograph_to_xml.php?output=xml&gage=" + NWScode;
                        console.log(url);
                        var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'xml');
                        self.Execute(request).then(function (response) {
                            var xmlDocument = new DOMParser().parseFromString(response.data, "text/xml");
                            var forecastData = xmlDocument.querySelectorAll("forecast");
                            var smallerData = forecastData[0].childNodes;
                            var forecastArray = [];
                            smallerData.forEach(function (datum) {
                                var forecastObj = {
                                    x: new Date(datum.childNodes[0].textContent),
                                    y: parseFloat(datum.childNodes[2].textContent)
                                };
                                forecastArray.push(forecastObj);
                                self.NWSforecast = forecastArray;
                            });
                            self.getShadedDailyStats();
                        });
                    }
                    else {
                        self.getShadedDailyStats();
                    }
                });
            };
            GagePageController.prototype.getShadedDailyStats = function () {
                var _this_1 = this;
                var url = 'https://waterservices.usgs.gov/nwis/stat/?format=rdb,1.0&indent=on&sites=' + this.gage.code + '&statReportType=daily&statTypeCd=all&parameterCd=00060';
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    var meanPercentileStats = [];
                    var data = response.data.split('\n').filter(function (r) { return (!r.startsWith("#") && r != ""); });
                    data.shift().split('\t');
                    data.shift();
                    do {
                        var nonArrayDataRow = data.shift().split('\t');
                        var finalIndex = _this_1.dailyFlow.length - 1;
                        var finalDate = new Date(_this_1.dailyFlow[finalIndex].dateTime);
                        var finalYear = finalDate.getUTCFullYear();
                        var stringDate = parseFloat(nonArrayDataRow[5]) + '/' + parseFloat(nonArrayDataRow[6]) + '/' + finalYear;
                        var date = new Date(stringDate);
                        var meanPercentiles = {
                            date: date.toUTCString(),
                            begin_yr: parseFloat(nonArrayDataRow[7]),
                            end_yr: parseFloat(nonArrayDataRow[8]),
                            min_va: parseFloat(nonArrayDataRow[13]),
                            p10_va: parseFloat(nonArrayDataRow[16]),
                            p25_va: parseFloat(nonArrayDataRow[18]),
                            p75_va: parseFloat(nonArrayDataRow[20]),
                            p90_va: parseFloat(nonArrayDataRow[22]),
                            max_va: parseFloat(nonArrayDataRow[11])
                        };
                        meanPercentileStats.push(meanPercentiles);
                    } while (data.length > 0);
                    _this_1.meanPercent = meanPercentileStats;
                    _this_1.formatData();
                });
            };
            GagePageController.prototype.formatData = function () {
                var _this_1 = this;
                if (this.peakDates) {
                    this.peakDates.forEach(function (peakObj) {
                        if (!isNaN(peakObj.peak_va)) {
                            _this_1.formattedPeakDates.push({ x: new Date(peakObj.peak_dt), y: peakObj.peak_va });
                        }
                    });
                }
                if (this.estPeakDates) {
                    this.estPeakDates.forEach(function (estPeakObj) {
                        if (!isNaN(estPeakObj.peak_va)) {
                            _this_1.formattedEstPeakDates.push({ x: new Date(estPeakObj.peak_dt), y: estPeakObj.peak_va });
                        }
                    });
                }
                if (this.meanPercent) {
                    this.meanPercent.forEach(function (stats) {
                        _this_1.formattedP0to10.push({ x: new Date(stats.date), low: stats.min_va, high: stats.p10_va });
                        _this_1.formattedP10to25.push({ x: new Date(stats.date), low: stats.p10_va, high: stats.p25_va });
                        _this_1.formattedP25to75.push({ x: new Date(stats.date), low: stats.p25_va, high: stats.p75_va });
                        _this_1.formattedP75to90.push({ x: new Date(stats.date), low: stats.p75_va, high: stats.p90_va });
                        _this_1.formattedP90to100.push({ x: new Date(stats.date), low: stats.p90_va, high: stats.max_va });
                    });
                }
                if (this.dailyFlow) {
                    this.dailyFlow.forEach(function (dailyObj) {
                        if (parseFloat(dailyObj.value) !== -999999) {
                            _this_1.formattedDailyFlow.push({ x: new Date(dailyObj.dateTime), y: parseFloat(dailyObj.value) });
                            _this_1.dailyDatesOnly.push(new Date(dailyObj.dateTime));
                        }
                    });
                }
                var finalPeakorDailyDate = new Date('January 1, 1800');
                if (this.formattedPeakDates.length > 0) {
                    var finalPeakIndex = this.formattedPeakDates.length - 1;
                    if (this.formattedPeakDates[finalPeakIndex].x > finalPeakorDailyDate) {
                        finalPeakorDailyDate = this.formattedPeakDates[finalPeakIndex].x;
                    }
                }
                if (this.formattedDailyFlow.length > 0) {
                    var finalDailyIndex = this.formattedDailyFlow.length - 1;
                    if (this.formattedDailyFlow[finalDailyIndex].x > finalPeakorDailyDate) {
                        finalPeakorDailyDate = this.formattedDailyFlow[finalDailyIndex].x;
                    }
                }
                var finalIndex = this.formattedDailyFlow.length - 1;
                var finalYear = (finalPeakorDailyDate).getUTCFullYear();
                function dateRange(startDate, endDate, steps) {
                    if (steps === void 0) { steps = 1; }
                    var dateArray = [];
                    var currentDate = new Date(startDate);
                    while (currentDate <= new Date(endDate)) {
                        dateArray.push(new Date(currentDate));
                        currentDate.setUTCDate(currentDate.getUTCDate() + steps);
                    }
                    return dateArray;
                }
                var dates = dateRange(this.formattedDailyFlow[0].x, this.formattedDailyFlow[finalIndex].x);
                dates = dates.map(function (date) { return (date.getUTCMonth() + 1) + "/" + date.getUTCDate() + "/" + date.getUTCFullYear(); });
                var observedDates = this.dailyDatesOnly.map(function (observedDate) { return (observedDate.getUTCMonth() + 1) + "/" + observedDate.getUTCDate() + "/" + observedDate.getUTCFullYear(); });
                function difference(a1, a2) {
                    var result = [];
                    for (var i = 0; i < a1.length; i++) {
                        if (a2.indexOf(a1[i]) === -1) {
                            result.push(new Date(a1[i]));
                        }
                    }
                    return result;
                }
                var differences = difference(dates, observedDates);
                differences.forEach(function (date) { return _this_1.formattedDailyFlow.push({ x: date, y: null }); });
                this.formattedDailyFlow.sort(function (a, b) { return a.x - b.x; });
                if (this.peakDates) {
                    this.peakDates.forEach(function (peakOnYear) {
                        var adjustedDate = new Date(peakOnYear.peak_dt);
                        adjustedDate.setUTCFullYear(finalYear);
                        var currentYear = new Date(adjustedDate.toUTCString());
                        if (!isNaN(peakOnYear.peak_va)) {
                            _this_1.formattedPeakDatesOnYear.push({ x: currentYear, y: peakOnYear.peak_va, realDate: new Date(peakOnYear.peak_dt) });
                        }
                    });
                }
                if (this.estPeakDates) {
                    this.estPeakDates.forEach(function (estPeakOnYear) {
                        var adjustedDate = new Date(estPeakOnYear.peak_dt);
                        adjustedDate.setUTCFullYear(finalYear);
                        var currentYear = new Date(adjustedDate.toUTCString());
                        _this_1.formattedEstPeakDatesOnYear.push({ x: currentYear, y: estPeakOnYear.peak_va, realDate: new Date(estPeakOnYear.peak_dt) });
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
                        1438: '#469990',
                        2311: '#f58231',
                        2312: '#3cb44b',
                        2313: '#e6194B',
                        2314: '#bfef45',
                        2315: '#911eb4',
                        2316: '#9A6324',
                        2317: '#ffe119',
                        2318: '#42d4f4'
                    };
                    var startDate_1 = new Date('January 1, 3000');
                    var endDate_1 = new Date('January 1, 1800');
                    if (this.formattedPeakDates.length > 0) {
                        if (this.formattedPeakDates[0].x < startDate_1) {
                            startDate_1 = this.formattedPeakDates[0].x;
                        }
                        var finalPeakIndex = this.formattedPeakDates.length - 1;
                        if (this.formattedPeakDates[finalPeakIndex].x > endDate_1) {
                            endDate_1 = this.formattedPeakDates[finalPeakIndex].x;
                        }
                    }
                    if (this.formattedDailyFlow.length > 0) {
                        if (this.formattedDailyFlow[0].x < startDate_1) {
                            startDate_1 = this.formattedDailyFlow[0].x;
                        }
                        var finalDailyIndex = this.formattedDailyFlow.length - 1;
                        if (this.formattedDailyFlow[finalDailyIndex].x > endDate_1) {
                            endDate_1 = this.formattedDailyFlow[finalDailyIndex].x;
                        }
                    }
                    if (this.formattedEstPeakDates.length > 0) {
                        if (this.formattedEstPeakDates[0].x < startDate_1) {
                            startDate_1 = this.formattedEstPeakDates[0].x;
                        }
                        var finalEstIndex = this.formattedEstPeakDates.length - 1;
                        if (this.formattedEstPeakDates[finalEstIndex].x > endDate_1) {
                            endDate_1 = this.formattedEstPeakDates[finalEstIndex].x;
                        }
                    }
                    if (this.formattedPeakDatesOnYear.length > 0) {
                        this.formattedPeakDatesOnYear.sort(function (a, b) { return a.x - b.x; });
                        if (this.formattedPeakDatesOnYear[0].x < startDate_1) {
                            startDate_1 = this.formattedPeakDatesOnYear[0].x;
                        }
                        var finalPeakOnYearIndex = this.formattedPeakDatesOnYear.length - 1;
                        if (this.formattedPeakDatesOnYear[finalPeakOnYearIndex].x > endDate_1) {
                            endDate_1 = this.formattedPeakDatesOnYear[finalPeakOnYearIndex].x;
                        }
                    }
                    this.formattedFloodFreq = [];
                    this.floodFreq.forEach(function (floodFreqItem) {
                        var colorIndex = floodFreqItem.regressionTypeID;
                        var endYear = endDate_1.getUTCFullYear();
                        var endOfFinalYear = new Date(12 + '/' + 31 + '/' + endYear);
                        var formattedName = floodFreqItem.regressionType.name.substring(0, floodFreqItem.regressionType.name.length - 18);
                        _this_1.formattedFloodFreq.push({
                            name: floodFreqItem.regressionType.name,
                            tooltip: {
                                headerFormat: '<b>Annual Exceedance Probability (AEP)',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>AEP: <b>' + formattedName + '%' + '</b><br>Value: <b>' + floodFreqItem.value + ' ft³/s<br>';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'line',
                            color: AEPColors_1[colorIndex],
                            dataLabels: {
                                enabled: true,
                                zIndex: 3,
                                pointFormatter: function () {
                                    if (this.x.getUTCFullYear() == endDate_1.getUTCFullYear()) {
                                        return formattedName + '% AEP';
                                    }
                                }
                            },
                            data: [
                                {
                                    x: startDate_1,
                                    y: floodFreqItem.value
                                }, {
                                    x: endOfFinalYear,
                                    y: floodFreqItem.value
                                }
                            ],
                            linkedTo: ':previous',
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                        });
                    });
                    this.createAnnualFlowPlot();
                }
            };
            GagePageController.prototype.createAnnualFlowPlot = function () {
                var _this_1 = this;
                console.log('outside', this.NWSforecast);
                this.chartConfig = {
                    chart: {
                        height: 550,
                        width: 800,
                        zooming: {
                            type: 'xy'
                        },
                        panning: true,
                        panKey: 'shift'
                    },
                    title: {
                        text: 'Annual Peak Streamflow',
                        align: 'center'
                    },
                    subtitle: {
                        text: 'Click and drag to zoom in. Hold down shift key to pan.<br>AEP = Annual Exceedance Probability',
                        align: 'center'
                    },
                    rangeSelector: {
                        enabled: true,
                        inputPosition: {
                            align: 'left',
                            x: 0,
                            y: 0
                        },
                        selected: 3,
                        buttonPosition: {
                            align: 'right',
                            x: 0,
                            y: 0
                        },
                    },
                    navigator: {
                        enabled: true
                    },
                    xAxis: {
                        type: 'datetime',
                        title: {
                            text: 'Date'
                        },
                        custom: {
                            allowNegativeLog: true
                        }
                    },
                    yAxis: {
                        title: {
                            text: 'Discharge (Q), in ft³/s'
                        },
                        custom: {
                            allowNegativeLog: true
                        },
                        plotLines: [{ value: null, color: null, width: null, zIndex: null, label: { text: null }, id: 'plotlines' }]
                    },
                    series: [
                        {
                            name: 'Annual Peak Streamflow',
                            showInNavigator: false,
                            tooltip: {
                                headerFormat: '<b>Annual Peak Streamflow</b><br> Plotted on Latest Year',
                                pointFormatter: function () {
                                    if (this.formattedPeakDatesOnYear !== null) {
                                        var waterYear = this.realDate.getUTCFullYear();
                                        if (this.realDate.getUTCMonth() > 8) {
                                            waterYear += 1;
                                        }
                                        ;
                                        var UTCday = this.realDate.getUTCDate();
                                        var year = this.realDate.getUTCFullYear();
                                        var month = this.realDate.getUTCMonth();
                                        month += 1;
                                        var formattedUTCPeakDate = month + '/' + UTCday + '/' + year;
                                        return '<br>Date: <b>' + formattedUTCPeakDate + '</b><br>Value: <b>' + this.y + ' ft³/s</b><br>Water Year: <b>' + waterYear;
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'scatter',
                            color: 'black',
                            fillOpacity: null,
                            lineWidth: null,
                            data: this.formattedPeakDatesOnYear,
                            linkedTo: null,
                            marker: {
                                symbol: 'circle',
                                radius: 3
                            },
                            showInLegend: this.formattedPeakDates.length > 0
                        },
                        {
                            name: 'Annual Peak Streamflow (Date Estimated)',
                            showInNavigator: true,
                            tooltip: {
                                headerFormat: '<b>Annual Peak Streamflow</b><br> Plotted on Latest Year',
                                pointFormatter: function () {
                                    if (this.formattedEstPeakDatesOnYear !== null) {
                                        var waterYear = this.realDate.getUTCFullYear();
                                        if (this.realDate.getUTCMonth() > 8) {
                                            waterYear += 1;
                                        }
                                        ;
                                        var UTCday = this.realDate.getUTCDate();
                                        var year = this.realDate.getUTCFullYear();
                                        var month = this.realDate.getUTCMonth();
                                        month += 1;
                                        var formattedUTCPeakDate = month + '/' + UTCday + '/' + year;
                                        return '<br>Date (estimated): <b>' + formattedUTCPeakDate + '</b><br>Value: <b>' + this.y + ' ft³/s</b><br>Water Year: <b>' + waterYear;
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'scatter',
                            color: 'red',
                            fillOpacity: null,
                            lineWidth: null,
                            data: this.formattedEstPeakDatesOnYear,
                            linkedTo: null,
                            marker: {
                                symbol: 'square',
                                radius: 3
                            },
                            showInLegend: this.formattedEstPeakDates.length > 0
                        },
                        {
                            name: 'Shaded Daily Statistics',
                            showInNavigator: false,
                            tooltip: {
                                headerFormat: null,
                                pointFormatter: function () {
                                    return '<br>Date: <b>' + this.x + '</b><br>Min: <b>' + this.low + ' ft³/s</b><br>10th percentile: <b>' + this.high;
                                }
                            },
                            turboThreshold: 0,
                            type: 'arearange',
                            color: '#8B0000',
                            fillOpacity: 0.2,
                            lineWidth: 0,
                            data: this.formattedP0to10,
                            linkedTo: null,
                            marker: {
                                symbol: null,
                                radius: null
                            },
                            showInLegend: this.formattedP0to10.length > 0
                        },
                        {
                            name: 'p 10-25 %',
                            showInNavigator: false,
                            tooltip: {
                                headerFormat: null,
                                pointFormatter: function () {
                                    return '<br>Date: <b>' + this.x + '</b><br>Min: <b>' + this.low + ' ft³/s</b><br>10th percentile: <b>' + this.high;
                                }
                            },
                            turboThreshold: 0,
                            type: 'arearange',
                            color: '#B8860B',
                            fillOpacity: 0.2,
                            lineWidth: 0,
                            data: this.formattedP10to25,
                            linkedTo: ':previous',
                            marker: {
                                symbol: null,
                                radius: null
                            },
                            showInLegend: false
                        },
                        {
                            name: 'p 25-75 %',
                            showInNavigator: false,
                            tooltip: {
                                headerFormat: null,
                                pointFormatter: function () {
                                    return '<br>Date: <b>' + this.x + '</b><br>Min: <b>' + this.low + ' ft³/s</b><br>10th percentile: <b>' + this.high;
                                }
                            },
                            turboThreshold: 0,
                            type: 'arearange',
                            color: '#006400',
                            fillOpacity: 0.2,
                            lineWidth: 0,
                            data: this.formattedP25to75,
                            linkedTo: ':previous',
                            marker: {
                                symbol: null,
                                radius: null
                            },
                            showInLegend: false
                        },
                        {
                            name: 'p 75-90 %',
                            showInNavigator: false,
                            tooltip: {
                                headerFormat: null,
                                pointFormatter: function () {
                                    return '<br>Date: <b>' + this.x + '</b><br>Min: <b>' + this.low + ' ft³/s</b><br>10th percentile: <b>' + this.high;
                                }
                            },
                            turboThreshold: 0,
                            type: 'arearange',
                            color: '#008B8B',
                            fillOpacity: 0.2,
                            lineWidth: 0,
                            data: this.formattedP75to90,
                            linkedTo: ':previous',
                            marker: {
                                symbol: null,
                                radius: null
                            },
                            showInLegend: false
                        },
                        {
                            name: 'p 90-100 %',
                            showInNavigator: false,
                            tooltip: {
                                headerFormat: null,
                                pointFormatter: function () {
                                    return '<br>Date: <b>' + this.x + '</b><br>Min: <b>' + this.low + ' ft³/s</b><br>10th percentile: <b>' + this.high;
                                }
                            },
                            turboThreshold: 0,
                            type: 'arearange',
                            color: '#0000FF',
                            fillOpacity: 0.2,
                            lineWidth: 0,
                            data: this.formattedP90to100,
                            linkedTo: ':previous',
                            marker: {
                                symbol: null,
                                radius: null
                            },
                            showInLegend: false
                        },
                        {
                            name: 'Daily Streamflow',
                            showInNavigator: true,
                            tooltip: {
                                headerFormat: '<b>Daily Streamflow</b>',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        var UTCday = this.x.getUTCDate();
                                        var year = this.x.getUTCFullYear();
                                        var month = this.x.getUTCMonth();
                                        month += 1;
                                        var formattedUTCDailyDate = month + '/' + UTCday + '/' + year;
                                        return '<br>Date: <b>' + formattedUTCDailyDate + '</b><br>Value: <b>' + this.y + ' ft³/s';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'line',
                            color: '#1434A4',
                            fillOpacity: null,
                            lineWidth: 1.5,
                            data: this.formattedDailyFlow,
                            linkedTo: null,
                            marker: {
                                symbol: '',
                                radius: 3
                            },
                            showInLegend: this.formattedDailyFlow.length > 0
                        },
                        {
                            name: 'NWS Forecast',
                            showInNavigator: false,
                            tooltip: {
                                headerFormat: '<b>NWS Forecast</b>',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        var UTCday = this.x.getUTCDate();
                                        var year = this.x.getUTCFullYear();
                                        var month = this.x.getUTCMonth();
                                        month += 1;
                                        var formattedUTCDailyDate = month + '/' + UTCday + '/' + year;
                                        return '<br>Date: <b>' + formattedUTCDailyDate + '</b><br>Value: <b>' + this.y + ' ft³/s';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'line',
                            color: 'purple',
                            fillOpacity: null,
                            lineWidth: 1.5,
                            data: this.NWSforecast,
                            linkedTo: null,
                            marker: {
                                symbol: '',
                                radius: 3
                            },
                            showInLegend: this.NWSforecast !== undefined
                        },
                        {
                            name: 'Annual Exceedance Probability',
                            showInNavigator: false,
                            tooltip: {
                                headerFormat: null,
                                pointFormatter: function () {
                                }
                            },
                            turboThreshold: 0,
                            type: null,
                            color: 'black',
                            fillOpacity: null,
                            lineWidth: null,
                            data: null,
                            linkedTo: null,
                            marker: {
                                symbol: 'line',
                                radius: 0.1
                            },
                            showInLegend: false
                        }
                    ]
                };
                this.formattedFloodFreq.forEach(function (formattedFloodFreqItem) {
                    _this_1.chartConfig.series.push(formattedFloodFreqItem);
                });
            };
            GagePageController.prototype.toggleAEPlines = function () {
                var chart = $('#chart1').highcharts();
                var AEPseries = chart.series[9];
                if (this.showAEP) {
                    AEPseries.show();
                }
                else {
                    AEPseries.hide();
                }
            };
            GagePageController.prototype.toggleLogLinear = function () {
                var chart = $('#chart1').highcharts();
                if (this.logScale) {
                    chart.yAxis[0].update({ type: 'logarithmic' });
                }
                else {
                    chart.yAxis[0].update({ type: 'linear' });
                }
            };
            ;
            GagePageController.prototype.togglePeakYear = function () {
                var chart = $('#chart1').highcharts();
                if (this.peaksOnYear) {
                    var finalIndex = this.formattedDailyFlow.length - 1;
                    var finalYear = (this.formattedDailyFlow[finalIndex].x).getUTCFullYear();
                    chart.series[0].update({ data: this.formattedPeakDatesOnYear });
                    chart.series[1].update({ data: this.formattedEstPeakDatesOnYear });
                    chart.rangeSelector.update({ selected: 3 });
                    chart.series[0].update({ tooltip: {
                            headerFormat: '<b>Annual Peak Streamflow</b><br> Plotted on Latest Year',
                            pointFormatter: function () {
                                if (this.formattedPeakDatesOnYear !== null) {
                                    var waterYear = this.realDate.getUTCFullYear();
                                    if (this.realDate.getUTCMonth() > 8) {
                                        waterYear += 1;
                                    }
                                    ;
                                    var UTCday = this.realDate.getUTCDate();
                                    var year = this.realDate.getUTCFullYear();
                                    var month = this.realDate.getUTCMonth();
                                    month += 1;
                                    var formattedUTCPeakDate = month + '/' + UTCday + '/' + year;
                                    return '<br>Date: <b>' + formattedUTCPeakDate + '</b><br>Value: <b>' + this.y + ' ft³/s</b><br>Water Year: <b>' + waterYear;
                                }
                            }
                        } });
                    chart.series[1].update({ tooltip: {
                            headerFormat: '<b>Annual Peak Streamflow</b><br> Plotted on Latest Year',
                            pointFormatter: function () {
                                if (this.formattedEstPeakDatesOnYear !== null) {
                                    var waterYear = this.realDate.getUTCFullYear();
                                    if (this.realDate.getUTCMonth() > 8) {
                                        waterYear += 1;
                                    }
                                    ;
                                    var UTCday = this.realDate.getUTCDate();
                                    var year = this.realDate.getUTCFullYear();
                                    var month = this.realDate.getUTCMonth();
                                    month += 1;
                                    var formattedUTCPeakDate = month + '/' + UTCday + '/' + year;
                                    return '<br>Date (estimated): <b>' + formattedUTCPeakDate + '</b><br>Value: <b>' + this.y + ' ft³/s</b><br>Water Year: <b>' + waterYear;
                                }
                            }
                        } });
                }
                else {
                    chart.series[0].update({ data: this.formattedPeakDates });
                    chart.series[1].update({ data: this.formattedEstPeakDates });
                    chart.rangeSelector.update({ selected: 5 });
                    chart.series[0].update({ tooltip: {
                            headerFormat: '<b>Annual Peak Streamflow</b>',
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
                                    return '<br>Date: <b>' + formattedUTCPeakDate + '</b><br>Value: <b>' + this.y + ' ft³/s</b><br>Water Year: <b>' + waterYear;
                                }
                            }
                        } });
                    chart.series[1].update({ tooltip: {
                            headerFormat: '<b>Annual Peak Streamflow</b>',
                            pointFormatter: function () {
                                if (this.formattedEstPeakDates !== null) {
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
                                    return '<br>Date (estimated): <b>' + formattedUTCPeakDate + '</b><br>Value: <b>' + this.y + ' ft³/s</b><br>Water Year: <b>' + waterYear;
                                }
                            }
                        } });
                }
            };
            ;
            GagePageController.prototype.init = function () {
                this.AppVersion = configuration.version;
                this.getGagePage();
                this.getGagePlots();
                this.SelectedTab = GagePageTab.GageInformation;
            };
            GagePageController.prototype.convertDateToString = function (date) {
                var yyyy = date.getFullYear().toString();
                var mm = (date.getMonth() + 1).toString();
                var dd = date.getDate().toString();
                var mmChars = mm.split('');
                var ddChars = dd.split('');
                return yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
            };
            GagePageController.prototype.tableToCSV = function ($table) {
                var $headers = $table.find('tr:has(th)'), $rows = $table.find('tr:has(td)'), tmpColDelim = String.fromCharCode(11), tmpRowDelim = String.fromCharCode(0), colDelim = '","', rowDelim = '"\r\n"';
                var csv = '"';
                csv += formatRows($headers.map(grabRow));
                csv += rowDelim;
                csv += formatRows($rows.map(grabRow)) + '"';
                return csv;
                function formatRows(rows) {
                    return rows.get().join(tmpRowDelim)
                        .split(tmpRowDelim).join(rowDelim)
                        .split(tmpColDelim).join(colDelim);
                }
                function grabRow(i, row) {
                    var $row = $(row);
                    var $cols = $row.find('td');
                    if (!$cols.length)
                        $cols = $row.find('th');
                    return $cols.map(grabCol)
                        .get().join(tmpColDelim);
                }
                function grabCol(j, col) {
                    var $col = $(col), $text = $col.text();
                    return $text.replace('"', '""');
                }
            };
            GagePageController.$inject = ['$scope', '$http', 'StreamStats.Services.ModalService', '$modalInstance'];
            return GagePageController;
        }(WiM.Services.HTTPServiceBase));
        var GagePageTab;
        (function (GagePageTab) {
            GagePageTab[GagePageTab["GageInformation"] = 1] = "GageInformation";
            GagePageTab[GagePageTab["GageAnalysisPlots"] = 2] = "GageAnalysisPlots";
        })(GagePageTab || (GagePageTab = {}));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.GagePageController', GagePageController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
