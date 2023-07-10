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
                _this_1.dischargeObj = undefined;
                _this_1.measuredObj = undefined;
                _this_1.floodFreq = undefined;
                _this_1.altFloodFreq = undefined;
                _this_1.oneDayStats = undefined;
                _this_1.sevenDayStats = undefined;
                _this_1.fourteenDayStats = undefined;
                _this_1.thirtyDayStats = undefined;
                _this_1.contrOneDayStats = undefined;
                _this_1.contrSevenDayStats = undefined;
                _this_1.contrFourteenDayStats = undefined;
                _this_1.contrThirtyDayStats = undefined;
                _this_1.weightedOneDayStats = undefined;
                _this_1.weightedSevenDayStats = undefined;
                _this_1.weightedThirtyDayStats = undefined;
                _this_1.peakDates = undefined;
                _this_1.estPeakDates = undefined;
                _this_1.dailyFlow = undefined;
                _this_1.instFlow = undefined;
                _this_1.gageTimeZone = undefined;
                _this_1.NWSforecast = undefined;
                _this_1.meanPercentileStats = undefined;
                _this_1.meanPercent = undefined;
                _this_1.rawShaded = undefined;
                _this_1.formattedP0to10 = [];
                _this_1.formattedP10to25 = [];
                _this_1.formattedP25to75 = [];
                _this_1.formattedP75to90 = [];
                _this_1.formattedP90to100 = [];
                _this_1.formattedFloodFreq = [];
                _this_1.formattedAltFloodFreq = [];
                _this_1.formattedOneDayStats = [];
                _this_1.formattedSevenDayStats = [];
                _this_1.formattedFourteenDayStats = [];
                _this_1.formattedThirtyDayStats = [];
                _this_1.formattedContrOneDayStats = [];
                _this_1.formattedContrSevenDayStats = [];
                _this_1.formattedContrFourteenDayStats = [];
                _this_1.formattedContrThirtyDayStats = [];
                _this_1.formattedWeightedOneDayStats = [];
                _this_1.formattedWeightedSevenDayStats = [];
                _this_1.formattedWeightedThirtyDayStats = [];
                _this_1.allFloodFreqStats = [];
                _this_1.formattedPeakDates = [];
                _this_1.formattedPeakDatesOnYear = [];
                _this_1.formattedEstPeakDatesOnYear = [];
                _this_1.formattedEstPeakDates = [];
                _this_1.formattedDailyFlow = [];
                _this_1.formattedInstFlow = [];
                _this_1.dailyDatesOnly = [];
                _this_1.startAndEnd = [];
                _this_1.formattedDailyHeat = [];
                _this_1.formattedDailyPlusAvg = [];
                _this_1.formattedDischargePeakDates = [];
                _this_1.dailyValuesOnly = [];
                _this_1.ageQualityData = 'age';
                _this_1.plotlines = true;
                _this_1.showFloodStats = true;
                _this_1.logScale = false;
                _this_1.peaksOnYear = true;
                _this_1.logScaleDischarge = false;
                $scope.vm = _this_1;
                _this_1.modalInstance = modal;
                _this_1.modalService = modalService;
                _this_1.init();
                _this_1.selectedStatisticGroups = [];
                _this_1.selectedCitations = [];
                _this_1.selectedFloodFreqStats = [];
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
                            peak_va: parseInt(dataRow[4]),
                            peak_stage: parseFloat(dataRow[6])
                        };
                        peakValues.push(peakObj);
                        var estPeakObj = {
                            agency_cd: dataRow[0],
                            site_no: dataRow[1],
                            peak_dt: dataRow[2].replaceAll('-00', '-01'),
                            peak_va: parseInt(dataRow[4]),
                            peak_stage: parseFloat(dataRow[6])
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
                    var AEPlookup = [9, 852, 8, 4, 7, 3, 6, 1, 501, 5, 2, 500, 851, 1438, 818];
                    var altAEPlookup = [2311, 2312, 2313, 2314, 2315, 2316, 2317, 2318];
                    var oneDayLookup = [82, 83, 84, 85, 596, 820, 1737];
                    var sevenDayLookup = [90, 91, 92, 93, 589, 822, 1165, 1166, 1167];
                    var fourteenDayLookup = [94, 95, 96, 97, 828, 829];
                    var thirtyDayLookup = [98, 99, 100, 101, 657, 830, 1174, 1175, 1176];
                    var contrOneDayLookup = [1753, 1773, 1081, 1744, 1766, 1712];
                    var contrSevenDayLookup = [1082, 1083, 1992, 2015, 2039, 2048];
                    var contrFourteenDayLookup = [1645, 1652, 1662, 1669, 1677, 1683];
                    var contrThirtyDayLookup = [1084, 1891, 1085, 1861, 1882, 1837];
                    var weightedOneDayLookup = [1755, 1775, 1732, 1746];
                    var weightedSevenDayLookup = [2025, 2050, 2001, 2017, 2041, 2007];
                    var weightedThirtyDayLookup = [1871, 1893, 1845, 1863, 1884, 1854];
                    var AEPchartData = [];
                    var altAEPchartData = [];
                    var oneDayChartData = [];
                    var sevenDayChartData = [];
                    var fourteenDayChartData = [];
                    var thirtyDayChartData = [];
                    var contrOneDayChartData = [];
                    var contrSevenDayChartData = [];
                    var contrFourteenDayChartData = [];
                    var contrThirtyDayChartData = [];
                    var weightedOneDayChartData = [];
                    var weightedSevenDayChartData = [];
                    var weightedThirtyDayChartData = [];
                    do {
                        var IDs = data.statistics;
                        for (var _i = 0, IDs_1 = IDs; _i < IDs_1.length; _i++) {
                            var item = IDs_1[_i];
                            if (AEPlookup.indexOf(item.regressionTypeID) >= 0 && item.isPreferred == true) {
                                AEPchartData.push(item);
                            }
                            if (altAEPlookup.indexOf(item.regressionTypeID) >= 0 && item.isPreferred == true) {
                                altAEPchartData.push(item);
                            }
                            if (oneDayLookup.indexOf(item.regressionTypeID) >= 0 && item.isPreferred == true) {
                                oneDayChartData.push(item);
                            }
                            if (sevenDayLookup.indexOf(item.regressionTypeID) >= 0 && item.isPreferred == true) {
                                sevenDayChartData.push(item);
                            }
                            if (fourteenDayLookup.indexOf(item.regressionTypeID) >= 0 && item.isPreferred == true) {
                                fourteenDayChartData.push(item);
                            }
                            if (thirtyDayLookup.indexOf(item.regressionTypeID) >= 0 && item.isPreferred == true) {
                                thirtyDayChartData.push(item);
                            }
                            if (contrOneDayLookup.indexOf(item.regressionTypeID) >= 0 && item.isPreferred == true) {
                                contrOneDayChartData.push(item);
                            }
                            if (contrSevenDayLookup.indexOf(item.regressionTypeID) >= 0 && item.isPreferred == true) {
                                contrSevenDayChartData.push(item);
                            }
                            if (contrFourteenDayLookup.indexOf(item.regressionTypeID) >= 0 && item.isPreferred == true) {
                                contrFourteenDayChartData.push(item);
                            }
                            if (contrThirtyDayLookup.indexOf(item.regressionTypeID) >= 0 && item.isPreferred == true) {
                                contrThirtyDayChartData.push(item);
                            }
                            if (weightedOneDayLookup.indexOf(item.regressionTypeID) >= 0 && item.isPreferred == true) {
                                weightedOneDayChartData.push(item);
                            }
                            if (weightedSevenDayLookup.indexOf(item.regressionTypeID) >= 0 && item.isPreferred == true) {
                                weightedSevenDayChartData.push(item);
                            }
                            if (weightedThirtyDayLookup.indexOf(item.regressionTypeID) >= 0 && item.isPreferred == true) {
                                weightedThirtyDayChartData.push(item);
                            }
                        }
                    } while (data.length > 0);
                    _this_1.floodFreq = AEPchartData;
                    _this_1.altFloodFreq = altAEPchartData;
                    _this_1.oneDayStats = oneDayChartData;
                    _this_1.sevenDayStats = sevenDayChartData;
                    _this_1.fourteenDayStats = fourteenDayChartData;
                    _this_1.thirtyDayStats = thirtyDayChartData;
                    _this_1.contrOneDayStats = contrOneDayChartData;
                    _this_1.contrSevenDayStats = contrSevenDayChartData;
                    _this_1.contrFourteenDayStats = contrFourteenDayChartData;
                    _this_1.contrThirtyDayStats = contrThirtyDayChartData;
                    _this_1.weightedOneDayStats = weightedOneDayChartData;
                    _this_1.weightedSevenDayStats = weightedSevenDayChartData;
                    _this_1.weightedThirtyDayStats = weightedThirtyDayChartData;
                }).finally(function () {
                    _this_1.getDailyFlow();
                });
            };
            GagePageController.prototype.getDailyFlow = function () {
                var _this_1 = this;
                var date = new Date();
                var timeInMillisec = date.getTime();
                timeInMillisec -= 15 * 24 * 60 * 60 * 1000;
                date.setTime(timeInMillisec);
                var twoWeeksAgo = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                    .toISOString()
                    .split("T")[0];
                var url = 'https://nwis.waterservices.usgs.gov/nwis/dv/?format=json&sites=' + this.gage.code + '&parameterCd=00060&statCd=00003&startDT=1900-01-01&endDT=' + twoWeeksAgo;
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
                    if (dailyValues !== 0) {
                        var filteredDaily = dailyValues.filter(function (item) {
                            return (parseFloat(item.value) !== -999999);
                        });
                        _this_1.dailyFlow = filteredDaily;
                    }
                    _this_1.getInstantaneousFlow();
                });
            };
            GagePageController.prototype.getInstantaneousFlow = function () {
                var _this_1 = this;
                var date = new Date();
                var timeInMillisec = date.getTime();
                timeInMillisec -= 15 * 24 * 60 * 60 * 1000;
                date.setTime(timeInMillisec);
                var twoWeeksAgo = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                    .toISOString()
                    .split("T")[0];
                var url = 'https://nwis.waterservices.usgs.gov/nwis/iv/?format=json&sites=' + this.gage.code + '&parameterCd=00060&startDT=' + twoWeeksAgo;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    var data = response.data.value.timeSeries;
                    if (data.length !== 0) {
                        var instValues = data[0].values[0].value;
                        var timeZoneInfo = data[0].sourceInfo.timeZoneInfo;
                        _this_1.gageTimeZone = timeZoneInfo;
                    }
                    else {
                        instValues = 0;
                    }
                    ;
                    if (instValues !== 0) {
                        var filteredInst = instValues.filter(function (item) {
                            return (parseFloat(item.value) !== -999999);
                        });
                        _this_1.instFlow = filteredInst;
                    }
                    _this_1.getNWSForecast();
                    console.log(_this_1.gageTimeZone);
                });
            };
            GagePageController.prototype.getNWSForecast = function () {
                var self = this;
                var nwisCode = this.gage.code;
                this.$http.get('./data/gageNumberCrossWalk.json').then(function (response) {
                    self.crossWalk = response.data;
                    var NWScode = self.crossWalk[nwisCode];
                    if (NWScode !== undefined) {
                        var url = "https://water.weather.gov/ahps2/hydrograph_to_xml.php?output=xml&gage=" + NWScode;
                        var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'xml');
                        self.Execute(request).then(function (response) {
                            var xmlDocument = new DOMParser().parseFromString(response.data, "text/xml");
                            var forecastData = xmlDocument.querySelectorAll("forecast");
                            if (forecastData[0] !== undefined) {
                                var smallerData_1 = forecastData[0].childNodes;
                                var forecastArray_1 = [];
                                if (self.dailyFlow !== undefined) {
                                    var timeZoneOffset = self.gageTimeZone.defaultTimeZone.zoneOffset;
                                    var numberOffset_1 = parseFloat(timeZoneOffset);
                                    smallerData_1.forEach(function (datum) {
                                        if (datum.childNodes[0] !== undefined) {
                                            var date = new Date(datum.childNodes[0].textContent);
                                            date.setUTCHours(date.getUTCHours() + numberOffset_1);
                                            var forecastObj = {
                                                x: date,
                                                y: parseFloat(datum.childNodes[2].textContent)
                                            };
                                            if ((smallerData_1[2].childNodes[2].getAttribute("units")) === 'kcfs') {
                                                forecastObj.y *= 1000;
                                            }
                                            forecastArray_1.push(forecastObj);
                                            self.NWSforecast = forecastArray_1;
                                        }
                                    });
                                }
                            }
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
                    var raw = [];
                    var data = response.data.split('\n').filter(function (r) { return (!r.startsWith("#") && r != ""); });
                    if (data.length > 0) {
                        data.shift().split('\t');
                        data.shift();
                        do {
                            var nonArrayDataRow = data.shift().split('\t');
                            raw.push(nonArrayDataRow);
                            var finalIndex = _this_1.dailyFlow.length - 1;
                            var finalDate = new Date(_this_1.dailyFlow[finalIndex].dateTime);
                            var finalYear = finalDate.getUTCFullYear();
                            var stringDate = new Date(parseFloat(nonArrayDataRow[5]) + '/' + parseFloat(nonArrayDataRow[6]) + '/' + finalYear);
                            var meanPercentiles = {
                                date: stringDate,
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
                    }
                    _this_1.meanPercent = meanPercentileStats;
                    _this_1.rawShaded = raw;
                    _this_1.getRatingCurve();
                });
            };
            GagePageController.prototype.getRatingCurve = function () {
                var _this_1 = this;
                var url = 'https://waterdata.usgs.gov/nwisweb/get_ratings?site_no=' + this.gage.code + '&file_type=exsa';
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.dischargeObj = [];
                this.Execute(request).then(function (response) {
                    var data = response.data.split('\n').filter(function (r) { return (!r.startsWith("#") && r != ""); });
                    data.shift().split('\t');
                    data.shift();
                    data.forEach(function (row) {
                        var dataRow = row.split('\t');
                        var object = {
                            x: parseFloat(dataRow[2]),
                            y: parseFloat(dataRow[0])
                        };
                        _this_1.dischargeObj.push(object);
                    });
                }, function (error) {
                }).finally(function () {
                    _this_1.getUSGSMeasured();
                });
            };
            GagePageController.prototype.getUSGSMeasured = function () {
                var _this_1 = this;
                var url = 'https://waterdata.usgs.gov/nwis/measurements?site_no=' + this.gage.code + '&agency_cd=USGS&format=rdb_expanded';
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.measuredObj = [];
                this.Execute(request).then(function (response) {
                    var data = response.data;
                    var errorMessage = '<title>USGS NwisWeb error message</title>';
                    _this_1.error = data.includes(errorMessage);
                    if (_this_1.error == false) {
                        var data_1 = response.data.split('\n').filter(function (r) { return (!r.startsWith("#") && r != ""); });
                        data_1.shift().split('\t');
                        data_1.shift();
                        data_1.forEach(function (row) {
                            var dataRow = row.split('\t');
                            var object = {
                                dateTime: dataRow[3],
                                timeZone: dataRow[4],
                                quality: dataRow[10],
                                control: dataRow[13],
                                x: parseFloat(dataRow[9]),
                                y: parseFloat(dataRow[8]),
                                qualityColor: _this_1.stageDischargeQualityColor(dataRow[10]),
                                color: _this_1.stageDischargeAgeColor(new Date(dataRow[3])),
                                ageColor: _this_1.stageDischargeAgeColor(new Date(dataRow[3]))
                            };
                            _this_1.measuredObj.push(object);
                        });
                    }
                }, function (error) {
                }).finally(function () {
                    _this_1.formatData();
                });
            };
            GagePageController.prototype.formatData = function () {
                var _this_1 = this;
                if (this.peakDates) {
                    this.peakDates.forEach(function (peakObj) {
                        if (!isNaN(peakObj.peak_va)) {
                            _this_1.formattedPeakDates.push({ x: new Date(peakObj.peak_dt), y: peakObj.peak_va });
                            _this_1.formattedDischargePeakDates.push({ x: peakObj.peak_va, y: peakObj.peak_stage, date: peakObj.peak_dt });
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
                        _this_1.formattedP0to10.push({ x: stats.date, low: stats.min_va, high: stats.p10_va });
                        _this_1.formattedP10to25.push({ x: stats.date, low: stats.p10_va, high: stats.p25_va });
                        _this_1.formattedP25to75.push({ x: stats.date, low: stats.p25_va, high: stats.p75_va });
                        _this_1.formattedP75to90.push({ x: stats.date, low: stats.p75_va, high: stats.p90_va });
                        _this_1.formattedP90to100.push({ x: stats.date, low: stats.p90_va, high: stats.max_va });
                    });
                }
                this.formattedP0to10.sort(function (a, b) { return a.x - b.x; });
                this.formattedP10to25.sort(function (a, b) { return a.x - b.x; });
                this.formattedP25to75.sort(function (a, b) { return a.x - b.x; });
                this.formattedP75to90.sort(function (a, b) { return a.x - b.x; });
                this.formattedP90to100.sort(function (a, b) { return a.x - b.x; });
                if (this.dailyFlow) {
                    this.dailyFlow.forEach(function (dailyObj) {
                        if (parseFloat(dailyObj.value) !== -999999) {
                            var date = new Date(dailyObj.dateTime);
                            date.setHours(12, 0, 0);
                            _this_1.formattedDailyFlow.push({ x: date, y: parseFloat(dailyObj.value) });
                            _this_1.dailyDatesOnly.push(new Date(dailyObj.dateTime));
                        }
                        var now = new Date(dailyObj.dateTime);
                        var year = new Date(dailyObj.dateTime).getUTCFullYear();
                        function daysIntoYear(now) {
                            return (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(now.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
                        }
                        ;
                        var doy = daysIntoYear(now);
                        function isLeapYear(year) {
                            if (year % 400 === 0)
                                return true;
                            if (year % 100 === 0)
                                return false;
                            return year % 4 === 0;
                        }
                        ;
                        if (parseInt(dailyObj.value) !== -999999) {
                            _this_1.dailyValuesOnly.push(parseInt(dailyObj.value));
                            if (isLeapYear(year) == false && doy > 59) {
                                doy += 1;
                            }
                            ;
                            if (doy > 274) {
                                year += 1;
                            }
                            ;
                            if (doy < 275) {
                                doy += 366;
                            }
                            ;
                            if (parseInt(dailyObj.value) !== -999999) {
                                _this_1.formattedDailyHeat.push({ x: doy, y: year, value: parseInt(dailyObj.value), length: 1 });
                            }
                            ;
                            if (isLeapYear(year) == false) {
                                _this_1.formattedDailyHeat.push({ x: 60, y: year, value: null, length: 1 });
                            }
                            ;
                        }
                    });
                }
                if (this.instFlow) {
                    this.instFlow.forEach(function (instObj) {
                        if (parseFloat(instObj.value) !== -999999) {
                            var index = _this_1.formattedDailyFlow.length - 1;
                            var finalDate = _this_1.formattedDailyFlow[index].x;
                            var stringDate = instObj.dateTime.split('.')[0];
                            var instDate = new Date(stringDate);
                            if (instDate > finalDate) {
                                _this_1.formattedInstFlow.push({ x: instDate, y: parseFloat(instObj.value) });
                            }
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
                var dates;
                function difference(a1, a2) {
                    var result = [];
                    for (var i = 0; i < a1.length; i++) {
                        if (a2.indexOf(a1[i]) === -1) {
                            result.push(new Date(a1[i]));
                        }
                    }
                    return result;
                }
                if (this.formattedDailyFlow.length > 0) {
                    dates = dateRange(this.formattedDailyFlow[0].x, this.formattedDailyFlow[finalIndex].x);
                    dates = dates.map(function (date) { return (date.getUTCMonth() + 1) + "/" + date.getUTCDate() + "/" + date.getUTCFullYear(); });
                    var observedDates = this.dailyDatesOnly.map(function (observedDate) { return (observedDate.getUTCMonth() + 1) + "/" + observedDate.getUTCDate() + "/" + observedDate.getUTCFullYear(); });
                    var differences = difference(dates, observedDates);
                    differences.forEach(function (date) { return _this_1.formattedDailyFlow.push({ x: date, y: null }); });
                    this.formattedDailyFlow.sort(function (a, b) { return a.x - b.x; });
                }
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
                var startDate = new Date('January 1, 3000');
                var endDate = new Date('January 1, 1800');
                if (this.formattedPeakDates.length > 0) {
                    if (this.formattedPeakDates[0].x < startDate) {
                        startDate = this.formattedPeakDates[0].x;
                    }
                    var finalPeakIndex = this.formattedPeakDates.length - 1;
                    if (this.formattedPeakDates[finalPeakIndex].x > endDate) {
                        endDate = this.formattedPeakDates[finalPeakIndex].x;
                    }
                }
                if (this.formattedDailyFlow.length > 0) {
                    if (this.formattedDailyFlow[0].x < startDate) {
                        startDate = this.formattedDailyFlow[0].x;
                    }
                    var finalDailyIndex = this.formattedDailyFlow.length - 1;
                    if (this.formattedDailyFlow[finalDailyIndex].x > endDate) {
                        endDate = this.formattedDailyFlow[finalDailyIndex].x;
                    }
                }
                if (this.formattedEstPeakDates.length > 0) {
                    if (this.formattedEstPeakDates[0].x < startDate) {
                        startDate = this.formattedEstPeakDates[0].x;
                    }
                    var finalEstIndex = this.formattedEstPeakDates.length - 1;
                    if (this.formattedEstPeakDates[finalEstIndex].x > endDate) {
                        endDate = this.formattedEstPeakDates[finalEstIndex].x;
                    }
                }
                if (this.formattedPeakDatesOnYear.length > 0) {
                    this.formattedPeakDatesOnYear.sort(function (a, b) { return a.x - b.x; });
                    if (this.formattedPeakDatesOnYear[0].x < startDate) {
                        startDate = this.formattedPeakDatesOnYear[0].x;
                    }
                    var finalPeakOnYearIndex = this.formattedPeakDatesOnYear.length - 1;
                    if (this.formattedPeakDatesOnYear[finalPeakOnYearIndex].x > endDate) {
                        endDate = this.formattedPeakDatesOnYear[finalPeakOnYearIndex].x;
                    }
                }
                this.startAndEnd.push(startDate, endDate);
                var endYear = endDate.getUTCFullYear();
                var endOfFinalYear = new Date(12 + '/' + 31 + '/' + endYear);
                if (this.oneDayStats) {
                    this.formattedOneDayStats = [];
                    var oneDayStatsColors_1 = {
                        82: '#e6194B',
                        83: '#f58231',
                        84: '#ffe119',
                        85: '#bfef45',
                        596: '#3cb44b',
                        820: '#42d4f4',
                        1737: '#911eb4'
                    };
                    this.oneDayStats.forEach(function (oneDayItem) {
                        var colorIndex = oneDayItem.regressionTypeID;
                        var formattedName = oneDayItem.regressionType.name.replaceAll('_', ' ');
                        _this_1.formattedOneDayStats.push({
                            name: formattedName,
                            tooltip: {
                                headerFormat: '<b>1-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>Value: <b>' + oneDayItem.value + ' ft³/s<br>';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'line',
                            color: oneDayStatsColors_1[colorIndex],
                            dataLabels: {
                                enabled: true,
                                zIndex: 3,
                                pointFormatter: function () {
                                    if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                        return formattedName;
                                    }
                                }
                            },
                            data: [
                                {
                                    x: startDate,
                                    y: oneDayItem.value
                                }, {
                                    x: endOfFinalYear,
                                    y: oneDayItem.value
                                }
                            ],
                            linkedTo: 'oneDay',
                            number: 10,
                            marker: {
                                symbol: 'circle',
                                radius: 1
                            },
                        });
                    });
                }
                if (this.sevenDayStats) {
                    this.formattedSevenDayStats = [];
                    var sevenDayStatsColors_1 = {
                        90: '#9A6324',
                        91: '#e6194B',
                        92: '#f58231',
                        93: '#ffe119',
                        589: '#bfef45',
                        822: '#3cb44b',
                        1165: '#42d4f4',
                        1166: '#911eb4',
                        1167: '#dcbeff'
                    };
                    this.sevenDayStats.forEach(function (sevenDayItem) {
                        var colorIndex = sevenDayItem.regressionTypeID;
                        var formattedName = sevenDayItem.regressionType.name.replaceAll('_', ' ');
                        _this_1.formattedSevenDayStats.push({
                            name: formattedName,
                            tooltip: {
                                headerFormat: '<b>7-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>Value: <b>' + sevenDayItem.value + ' ft³/s<br>';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'line',
                            color: sevenDayStatsColors_1[colorIndex],
                            dataLabels: {
                                enabled: true,
                                zIndex: 3,
                                pointFormatter: function () {
                                    if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                        return formattedName;
                                    }
                                }
                            },
                            data: [
                                {
                                    x: startDate,
                                    y: sevenDayItem.value
                                }, {
                                    x: endOfFinalYear,
                                    y: sevenDayItem.value
                                }
                            ],
                            linkedTo: 'sevenDay',
                            number: 11,
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                        });
                    });
                }
                if (this.fourteenDayStats) {
                    this.formattedFourteenDayStats = [];
                    var fourteenDayStatsColors_1 = {
                        94: '#e6194B',
                        95: '#f58231',
                        96: '#ffe119',
                        97: '#3cb44b',
                        828: '#42d4f4',
                        829: '#911eb4'
                    };
                    this.fourteenDayStats.forEach(function (fourteenDayItem) {
                        var colorIndex = fourteenDayItem.regressionTypeID;
                        var formattedName = fourteenDayItem.regressionType.name.replaceAll('_', ' ');
                        _this_1.formattedFourteenDayStats.push({
                            name: formattedName,
                            tooltip: {
                                headerFormat: '<b>14-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>Value: <b>' + fourteenDayItem.value + ' ft³/s<br>';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'line',
                            color: fourteenDayStatsColors_1[colorIndex],
                            dataLabels: {
                                enabled: true,
                                zIndex: 3,
                                pointFormatter: function () {
                                    if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                        return formattedName;
                                    }
                                }
                            },
                            data: [
                                {
                                    x: startDate,
                                    y: fourteenDayItem.value
                                }, {
                                    x: endOfFinalYear,
                                    y: fourteenDayItem.value
                                }
                            ],
                            linkedTo: 'fourteenDay',
                            number: 12,
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                        });
                    });
                }
                if (this.thirtyDayStats) {
                    this.formattedThirtyDayStats = [];
                    var thirtyDayStatsColors_1 = {
                        98: '#9A6324',
                        99: '#e6194B',
                        100: '#f58231',
                        101: '#ffe119',
                        657: '#bfef45',
                        830: '#3cb44b',
                        1174: '#42d4f4',
                        1175: '#911eb4',
                        1176: '#dcbeff'
                    };
                    this.thirtyDayStats.forEach(function (thirtyDayItem) {
                        var colorIndex = thirtyDayItem.regressionTypeID;
                        var formattedName = thirtyDayItem.regressionType.name.replaceAll('_', ' ');
                        _this_1.formattedThirtyDayStats.push({
                            name: formattedName,
                            tooltip: {
                                headerFormat: '<b>30-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>Value: <b>' + thirtyDayItem.value + ' ft³/s<br>';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'line',
                            color: thirtyDayStatsColors_1[colorIndex],
                            dataLabels: {
                                enabled: true,
                                zIndex: 3,
                                pointFormatter: function () {
                                    if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                        return formattedName;
                                    }
                                }
                            },
                            data: [
                                {
                                    x: startDate,
                                    y: thirtyDayItem.value
                                }, {
                                    x: endOfFinalYear,
                                    y: thirtyDayItem.value
                                }
                            ],
                            linkedTo: 'thirtyDay',
                            number: 13,
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                        });
                    });
                }
                if (this.contrOneDayStats) {
                    this.formattedContrOneDayStats = [];
                    var contrOneDayStatsColors_1 = {
                        1081: '#ffe119',
                        1712: '#911eb4',
                        1744: '#3cb44b',
                        1753: '#e6194B',
                        1766: '#42d4f4',
                        1773: '#f58231'
                    };
                    this.contrOneDayStats.forEach(function (contrOneDayItem) {
                        var colorIndex = contrOneDayItem.regressionTypeID;
                        var formattedName = contrOneDayItem.regressionType.name.replaceAll('_', ' ');
                        _this_1.formattedContrOneDayStats.push({
                            name: formattedName,
                            tooltip: {
                                headerFormat: '<b>Controlled 1-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>Value: <b>' + contrOneDayItem.value + ' ft³/s<br>';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'line',
                            color: contrOneDayStatsColors_1[colorIndex],
                            dataLabels: {
                                enabled: true,
                                zIndex: 3,
                                pointFormatter: function () {
                                    if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                        return formattedName;
                                    }
                                }
                            },
                            data: [
                                {
                                    x: startDate,
                                    y: contrOneDayItem.value
                                }, {
                                    x: endOfFinalYear,
                                    y: contrOneDayItem.value
                                }
                            ],
                            linkedTo: 'contrOneDay',
                            number: 14,
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                        });
                    });
                }
                if (this.contrSevenDayStats) {
                    this.formattedContrSevenDayStats = [];
                    var contrSevenDayStatsColors_1 = {
                        1082: '#e6194B',
                        1083: '#ffe119',
                        1992: '#911eb4',
                        2015: '#3cb44b',
                        2039: '#42d4f4',
                        2048: '#f58231'
                    };
                    this.contrSevenDayStats.forEach(function (contrSevenDayItem) {
                        var colorIndex = contrSevenDayItem.regressionTypeID;
                        var formattedName = contrSevenDayItem.regressionType.name.replaceAll('_', ' ');
                        _this_1.formattedContrSevenDayStats.push({
                            name: formattedName,
                            tooltip: {
                                headerFormat: '<b>Controlled 7-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>Value: <b>' + contrSevenDayItem.value + ' ft³/s<br>';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'line',
                            color: contrSevenDayStatsColors_1[colorIndex],
                            dataLabels: {
                                enabled: true,
                                zIndex: 3,
                                pointFormatter: function () {
                                    if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                        return formattedName;
                                    }
                                }
                            },
                            data: [
                                {
                                    x: startDate,
                                    y: contrSevenDayItem.value
                                }, {
                                    x: endOfFinalYear,
                                    y: contrSevenDayItem.value
                                }
                            ],
                            linkedTo: 'contrSevenDay',
                            number: 16,
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                        });
                    });
                }
                if (this.contrFourteenDayStats) {
                    this.formattedContrFourteenDayStats = [];
                    var contrFourteenDayStatsColors_1 = {
                        1645: '#911eb4',
                        1652: '#ffe119',
                        1662: '#3cb44b',
                        1669: '#e6194B',
                        1677: '#42d4f4',
                        1683: '#f58231'
                    };
                    this.contrFourteenDayStats.forEach(function (contrFourteenDayItem) {
                        var colorIndex = contrFourteenDayItem.regressionTypeID;
                        var formattedName = contrFourteenDayItem.regressionType.name.replaceAll('_', ' ');
                        _this_1.formattedContrFourteenDayStats.push({
                            name: formattedName,
                            tooltip: {
                                headerFormat: '<b>Controlled 14-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>Value: <b>' + contrFourteenDayItem.value + ' ft³/s<br>';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'line',
                            color: contrFourteenDayStatsColors_1[colorIndex],
                            dataLabels: {
                                enabled: true,
                                zIndex: 3,
                                pointFormatter: function () {
                                    if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                        return formattedName;
                                    }
                                }
                            },
                            data: [
                                {
                                    x: startDate,
                                    y: contrFourteenDayItem.value
                                }, {
                                    x: endOfFinalYear,
                                    y: contrFourteenDayItem.value
                                }
                            ],
                            linkedTo: 'contrFourteenDay',
                            number: 17,
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                        });
                    });
                }
                if (this.contrThirtyDayStats) {
                    this.formattedContrThirtyDayStats = [];
                    var contrThirtyDayStatsColors_1 = {
                        1084: '#e6194B',
                        1085: '#ffe119',
                        1837: '#911eb4',
                        1861: '#3cb44b',
                        1882: '#42d4f4',
                        1891: '#f58231'
                    };
                    this.contrThirtyDayStats.forEach(function (contrThirtyDayItem) {
                        var colorIndex = contrThirtyDayItem.regressionTypeID;
                        var formattedName = contrThirtyDayItem.regressionType.name.replaceAll('_', ' ');
                        _this_1.formattedContrThirtyDayStats.push({
                            name: formattedName,
                            tooltip: {
                                headerFormat: '<b>Controlled 30-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>Value: <b>' + contrThirtyDayItem.value + ' ft³/s<br>';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'line',
                            color: contrThirtyDayStatsColors_1[colorIndex],
                            dataLabels: {
                                enabled: true,
                                zIndex: 3,
                                pointFormatter: function () {
                                    if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                        return formattedName;
                                    }
                                }
                            },
                            data: [
                                {
                                    x: startDate,
                                    y: contrThirtyDayItem.value
                                }, {
                                    x: endOfFinalYear,
                                    y: contrThirtyDayItem.value
                                }
                            ],
                            linkedTo: 'contrThirtyDay',
                            number: 18,
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                        });
                    });
                }
                if (this.weightedOneDayStats) {
                    this.formattedWeightedOneDayStats = [];
                    var contrweightedOneStatsColors_1 = {
                        1755: '#e6194B',
                        1775: '#ffe119',
                        1732: '#3cb44b',
                        1746: '#42d4f4'
                    };
                    this.weightedOneDayStats.forEach(function (weightedOneDayItem) {
                        var colorIndex = weightedOneDayItem.regressionTypeID;
                        var formattedName = weightedOneDayItem.regressionType.name.replaceAll('_', ' ');
                        _this_1.formattedWeightedOneDayStats.push({
                            name: formattedName,
                            tooltip: {
                                headerFormat: '<b>Weighted 1-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>Value: <b>' + weightedOneDayItem.value + ' ft³/s<br>';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'line',
                            color: contrweightedOneStatsColors_1[colorIndex],
                            dataLabels: {
                                enabled: true,
                                zIndex: 3,
                                pointFormatter: function () {
                                    if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                        return formattedName;
                                    }
                                }
                            },
                            data: [
                                {
                                    x: startDate,
                                    y: weightedOneDayItem.value
                                }, {
                                    x: endOfFinalYear,
                                    y: weightedOneDayItem.value
                                }
                            ],
                            linkedTo: 'weightedOneDay',
                            number: 19,
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                        });
                    });
                }
                if (this.weightedSevenDayStats) {
                    this.formattedWeightedSevenDayStats = [];
                    var contrweightedSevenStatsColors_1 = {
                        2025: '#e6194B',
                        2050: '#f58231',
                        2001: '#ffe119',
                        2017: '#3cb44b',
                        2041: '#42d4f4',
                        2007: '#911eb4'
                    };
                    this.weightedSevenDayStats.forEach(function (weightedSevenDayItem) {
                        var colorIndex = weightedSevenDayItem.regressionTypeID;
                        var formattedName = weightedSevenDayItem.regressionType.name.replaceAll('_', ' ');
                        _this_1.formattedWeightedSevenDayStats.push({
                            name: formattedName,
                            tooltip: {
                                headerFormat: '<b>Weighted 7-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>Value: <b>' + weightedSevenDayItem.value + ' ft³/s<br>';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'line',
                            color: contrweightedSevenStatsColors_1[colorIndex],
                            dataLabels: {
                                enabled: true,
                                zIndex: 3,
                                pointFormatter: function () {
                                    if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                        return formattedName;
                                    }
                                }
                            },
                            data: [
                                {
                                    x: startDate,
                                    y: weightedSevenDayItem.value
                                }, {
                                    x: endOfFinalYear,
                                    y: weightedSevenDayItem.value
                                }
                            ],
                            linkedTo: 'weightedSevenDay',
                            number: 20,
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                        });
                    });
                }
                if (this.weightedThirtyDayStats) {
                    this.formattedWeightedThirtyDayStats = [];
                    var contrweightedThirtyStatsColors_1 = {
                        1871: '#e6194B',
                        1893: '#f58231',
                        1845: '#ffe119',
                        1863: '#3cb44b',
                        1884: '#42d4f4',
                        1854: '#911eb4'
                    };
                    this.weightedThirtyDayStats.forEach(function (weightedThirtyDayItem) {
                        var colorIndex = weightedThirtyDayItem.regressionTypeID;
                        var formattedName = weightedThirtyDayItem.regressionType.name.replaceAll('_', ' ');
                        _this_1.formattedWeightedThirtyDayStats.push({
                            name: formattedName,
                            tooltip: {
                                headerFormat: '<b>Weighted 30-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>Value: <b>' + weightedThirtyDayItem.value + ' ft³/s<br>';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'line',
                            color: contrweightedThirtyStatsColors_1[colorIndex],
                            dataLabels: {
                                enabled: true,
                                zIndex: 3,
                                pointFormatter: function () {
                                    if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                        return formattedName;
                                    }
                                }
                            },
                            data: [
                                {
                                    x: startDate,
                                    y: weightedThirtyDayItem.value
                                }, {
                                    x: endOfFinalYear,
                                    y: weightedThirtyDayItem.value
                                }
                            ],
                            linkedTo: 'weightedThirtyDay',
                            number: 21,
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                        });
                    });
                }
                if (this.altFloodFreq) {
                    this.formattedAltFloodFreq = [];
                    var altFloodFreqColors_1 = {
                        2311: '#f58231',
                        2312: '#3cb44b',
                        2313: '#e6194B',
                        2314: '#bfef45',
                        2315: '#911eb4',
                        2316: '#9A6324',
                        2317: '#ffe119',
                        2318: '#42d4f4'
                    };
                    this.altFloodFreq.forEach(function (altFloodFreqItem) {
                        var colorIndex = altFloodFreqItem.regressionTypeID;
                        var formattedName = altFloodFreqItem.regressionType.name.substring(0, altFloodFreqItem.regressionType.name.length - 18);
                        _this_1.formattedAltFloodFreq.push({
                            name: altFloodFreqItem.regressionType.name,
                            tooltip: {
                                headerFormat: '<b>Alternative Annual Exceedance Probability (AEP)',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>AEP: <b>' + formattedName + '%' + '</b><br>Value: <b>' + altFloodFreqItem.value + ' ft³/s<br>';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'line',
                            color: altFloodFreqColors_1[colorIndex],
                            dataLabels: {
                                enabled: true,
                                zIndex: 3,
                                pointFormatter: function () {
                                    if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                        return formattedName + '% AEP';
                                    }
                                }
                            },
                            data: [
                                {
                                    x: startDate,
                                    y: altFloodFreqItem.value
                                }, {
                                    x: endOfFinalYear,
                                    y: altFloodFreqItem.value
                                }
                            ],
                            linkedTo: 'altAEP',
                            number: 15,
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                        });
                    });
                }
                if (this.formattedDailyHeat.length > 0) {
                    var noNulls = this.formattedDailyHeat.filter(function (item) {
                        return (item.value != null);
                    });
                    var previousYear = noNulls[0].y;
                    var sum = 0;
                    var length_1 = 0;
                    var listOfSummations = [];
                    for (var i = 0; i < noNulls.length; i++) {
                        var currentData = noNulls[i];
                        var currentYear = currentData.y;
                        if (previousYear == currentYear) {
                            sum += currentData.value;
                            length_1 += currentData.length;
                        }
                        else {
                            listOfSummations.push({ x: 650, y: currentYear - 1, value: sum / length_1, sum: sum, length: length_1 }, { x: 651, y: currentYear - 1, value: sum / length_1, sum: sum, length: length_1 }, { x: 652, y: currentYear - 1, value: sum / length_1, sum: sum, length: length_1 }, { x: 653, y: currentYear - 1, value: sum / length_1, sum: sum, length: length_1 }, { x: 654, y: currentYear - 1, value: sum / length_1, sum: sum, length: length_1 }, { x: 655, y: currentYear - 1, value: sum / length_1, sum: sum, length: length_1 }, { x: 656, y: currentYear - 1, value: sum / length_1, sum: sum, length: length_1 }, { x: 657, y: currentYear - 1, value: sum / length_1, sum: sum, length: length_1 }, { x: 658, y: currentYear - 1, value: sum / length_1, sum: sum, length: length_1 });
                            sum = currentData.value;
                            length_1 = currentData.length;
                        }
                        if (i == noNulls.length - 1) {
                            listOfSummations.push({ x: 650, y: currentYear, value: sum / length_1, sum: sum, length: length_1 }, { x: 651, y: currentYear, value: sum / length_1, sum: sum, length: length_1 }, { x: 652, y: currentYear, value: sum / length_1, sum: sum, length: length_1 }, { x: 653, y: currentYear, value: sum / length_1, sum: sum, length: length_1 }, { x: 654, y: currentYear, value: sum / length_1, sum: sum, length: length_1 }, { x: 655, y: currentYear, value: sum / length_1, sum: sum, length: length_1 }, { x: 656, y: currentYear, value: sum / length_1, sum: sum, length: length_1 }, { x: 657, y: currentYear, value: sum / length_1, sum: sum, length: length_1 }, { x: 658, y: currentYear, value: sum / length_1, sum: sum, length: length_1 });
                        }
                        previousYear = currentYear;
                    }
                    var addAvg = this.formattedDailyHeat.concat(listOfSummations);
                    this.formattedDailyPlusAvg.push(addAvg);
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
                                    if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                        return formattedName + '% AEP';
                                    }
                                }
                            },
                            data: [
                                {
                                    x: startDate,
                                    y: floodFreqItem.value
                                }, {
                                    x: endOfFinalYear,
                                    y: floodFreqItem.value
                                }
                            ],
                            linkedTo: 'dummyAEP',
                            number: 9,
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                        });
                    });
                    this.allFloodFreqStats.push(this.formattedFloodFreq, this.formattedAltFloodFreq, this.formattedOneDayStats, this.formattedSevenDayStats, this.formattedFourteenDayStats, this.formattedThirtyDayStats, this.formattedContrOneDayStats, this.formattedContrSevenDayStats, this.formattedContrFourteenDayStats, this.formattedContrThirtyDayStats, this.formattedWeightedOneDayStats, this.formattedWeightedSevenDayStats, this.formattedWeightedThirtyDayStats);
                    this.allFloodFreqStats = this.allFloodFreqStats.filter(function (group) { return group.length > 0; });
                    this.allFloodFreqStats.forEach(function (group, index) {
                        _this_1.allFloodFreqStats[index] = {
                            name: group[0].tooltip.headerFormat.replace("<b>", ""),
                            statistics: group,
                            seriesIndex: group[0].number
                        };
                    });
                    this.selectedFloodFreqStats = this.allFloodFreqStats[0];
                    this.createAnnualFlowPlot();
                    this.createDailyRasterPlot();
                    this.createDischargePlot();
                }
            };
            GagePageController.prototype.createAnnualFlowPlot = function () {
                var _this_1 = this;
                var timezone;
                var zoneAbbreviation;
                if (this.formattedInstFlow.length > 0) {
                    zoneAbbreviation = this.gageTimeZone.defaultTimeZone.zoneAbbreviation;
                    if (zoneAbbreviation === 'EST' || zoneAbbreviation === 'EDT' || zoneAbbreviation === 'ET') {
                        timezone = 'America/New_York';
                    }
                    if (zoneAbbreviation === 'CST' || zoneAbbreviation === 'CDT' || zoneAbbreviation === 'CT') {
                        timezone = 'America/Chicago';
                    }
                    if (zoneAbbreviation === 'MST' || zoneAbbreviation === 'MDT' || zoneAbbreviation === 'MT') {
                        timezone = 'America/Denver';
                    }
                    if (zoneAbbreviation === 'PST' || zoneAbbreviation === 'PDT' || zoneAbbreviation === 'PT') {
                        timezone = 'America/Los_Angeles';
                    }
                    if (zoneAbbreviation === 'AKST' || zoneAbbreviation === 'AKDT' || zoneAbbreviation === 'AKT') {
                        timezone = 'America/Anchorage';
                    }
                    if (zoneAbbreviation === 'HST' || zoneAbbreviation === 'HT' || zoneAbbreviation === 'HDT') {
                        timezone === 'Pacific/Honolulu';
                    }
                    if (zoneAbbreviation === 'AST' || zoneAbbreviation === 'ADT') {
                        timezone === 'America/Puerto_Rico';
                    }
                }
                if (zoneAbbreviation === undefined) {
                    zoneAbbreviation = '';
                }
                var self = this;
                var min;
                if (this.formattedPeakDatesOnYear.length > 0) {
                    min = (new Date(1 + '/' + 1 + '/' + this.startAndEnd[1].getFullYear())).getTime();
                }
                else {
                    min = this.startAndEnd[0].getTime();
                }
                var max = (new Date(12 + '/' + 31 + '/' + this.startAndEnd[1].getFullYear())).getTime();
                this.chartConfig = {
                    chart: {
                        height: 550,
                        width: 800,
                        zooming: {
                            type: 'xy'
                        },
                        panning: true,
                        panKey: 'shift',
                        events: {
                            load: function () {
                                self.updateShadedStats();
                            }
                        }
                    },
                    title: {
                        text: 'Annual Peak Streamflow',
                        align: 'center'
                    },
                    time: {
                        useUTC: false,
                        timezone: 'America/New_York'
                    },
                    legend: {
                        useHTML: true,
                        symbolPadding: null,
                        symbolWidth: null,
                        symbolHeight: null,
                        squareSymbol: null,
                        labelFormatter: function () {
                            return this.name;
                        }
                    },
                    subtitle: {
                        text: 'Click and drag to zoom in. Hold down shift key to pan.<br>AEP = Annual Exceedance Probability',
                        align: 'center'
                    },
                    rangeSelector: {
                        enabled: false,
                        inputPosition: {
                            align: 'left',
                            x: 0,
                            y: 0
                        },
                        buttons: [],
                    },
                    navigator: {
                        enabled: true
                    },
                    xAxis: {
                        type: 'datetime',
                        events: {
                            afterSetExtremes: function () {
                                self.updateShadedStats();
                            }
                        },
                        gridLineWidth: 0,
                        min: min,
                        max: max,
                        title: {
                            text: 'Date '
                        },
                        custom: {
                            allowNegativeLog: true
                        }
                    },
                    yAxis: {
                        title: {
                            text: 'Discharge (Q), in ft³/s'
                        },
                        gridLineWidth: 1,
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
                            visible: true,
                            id: null,
                            zIndex: 5,
                            marker: {
                                symbol: 'circle',
                                radius: 3
                            },
                            showInLegend: this.formattedPeakDates.length > 0
                        }, {
                            name: 'Annual Peak Streamflow (Date Estimated)',
                            showInNavigator: false,
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
                            visible: true,
                            id: null,
                            zIndex: 5,
                            marker: {
                                symbol: 'square',
                                radius: 3
                            },
                            showInLegend: this.formattedEstPeakDates.length > 0
                        }, {
                            name: 'Daily Percentile Streamflow',
                            showInNavigator: false,
                            tooltip: {
                                headerFormat: '<b>90-100% Streamflow</b>',
                                pointFormatter: function () {
                                    var UTCday = this.x.getUTCDate();
                                    var year = this.x.getUTCFullYear();
                                    var month = this.x.getUTCMonth();
                                    month += 1;
                                    var formattedUTCDate = month + '/' + UTCday + '/' + year;
                                    return '<br>Date: <b>' + formattedUTCDate + '</b><br>90th percentile: <b>' + this.low + ' ft³/s</b><br>Max: <b>' + this.high + ' ft³/s';
                                }
                            },
                            turboThreshold: 0,
                            type: 'arearange',
                            color: '#0000FF',
                            fillOpacity: 0.2,
                            lineWidth: 0,
                            data: this.formattedP90to100,
                            linkedTo: null,
                            visible: true,
                            id: null,
                            zIndex: 1,
                            marker: {
                                symbol: null,
                                radius: null
                            },
                            showInLegend: this.formattedP90to100.length > 0
                        }, {
                            name: 'P 0-10%',
                            showInNavigator: false,
                            tooltip: {
                                headerFormat: '<b>0-10% Streamflow</b>',
                                pointFormatter: function () {
                                    var UTCday = this.x.getUTCDate();
                                    var year = this.x.getUTCFullYear();
                                    var month = this.x.getUTCMonth();
                                    month += 1;
                                    var formattedUTCDate = month + '/' + UTCday + '/' + year;
                                    return '<br>Date: <b>' + formattedUTCDate + '</b><br>Min: <b>' + this.low + ' ft³/s</b><br>10th percentile: <b>' + this.high + ' ft³/s';
                                }
                            },
                            turboThreshold: 0,
                            type: 'arearange',
                            color: '#8B0000',
                            fillOpacity: 0.2,
                            lineWidth: 0,
                            data: this.formattedP0to10,
                            linkedTo: ':previous',
                            visible: true,
                            id: null,
                            zIndex: 1,
                            marker: {
                                symbol: null,
                                radius: null
                            },
                            showInLegend: false
                        }, {
                            name: 'p 10-25 %',
                            showInNavigator: false,
                            tooltip: {
                                headerFormat: '<b>10-25% Streamflow</b>',
                                pointFormatter: function () {
                                    var UTCday = this.x.getUTCDate();
                                    var year = this.x.getUTCFullYear();
                                    var month = this.x.getUTCMonth();
                                    month += 1;
                                    var formattedUTCDate = month + '/' + UTCday + '/' + year;
                                    return '<br>Date: <b>' + formattedUTCDate + '</b><br>10th percentile: <b>' + this.low + ' ft³/s</b><br>25th percentile: <b>' + this.high + ' ft³/s';
                                }
                            },
                            turboThreshold: 0,
                            type: 'arearange',
                            color: '#B8860B',
                            fillOpacity: 0.2,
                            lineWidth: 0,
                            data: this.formattedP10to25,
                            linkedTo: ':previous',
                            visible: true,
                            id: null,
                            zIndex: 1,
                            marker: {
                                symbol: null,
                                radius: null
                            },
                            showInLegend: false
                        }, {
                            name: 'p 25-75 %',
                            showInNavigator: false,
                            tooltip: {
                                headerFormat: '<b>25-75% Streamflow</b>',
                                pointFormatter: function () {
                                    var UTCday = this.x.getUTCDate();
                                    var year = this.x.getUTCFullYear();
                                    var month = this.x.getUTCMonth();
                                    month += 1;
                                    var formattedUTCDate = month + '/' + UTCday + '/' + year;
                                    return '<br>Date: <b>' + formattedUTCDate + '</b><br>25th percentile: <b>' + this.low + ' ft³/s</b><br>75th percentile: <b>' + this.high + ' ft³/s';
                                }
                            },
                            turboThreshold: 0,
                            type: 'arearange',
                            color: '#006400',
                            fillOpacity: 0.2,
                            lineWidth: 0,
                            data: this.formattedP25to75,
                            linkedTo: ':previous',
                            visible: true,
                            id: null,
                            zIndex: 1,
                            marker: {
                                symbol: null,
                                radius: null
                            },
                            showInLegend: false
                        }, {
                            name: 'p 75-90 %',
                            showInNavigator: false,
                            tooltip: {
                                headerFormat: '<b>75-90% Streamflow</b>',
                                pointFormatter: function () {
                                    var UTCday = this.x.getUTCDate();
                                    var year = this.x.getUTCFullYear();
                                    var month = this.x.getUTCMonth();
                                    month += 1;
                                    var formattedUTCDate = month + '/' + UTCday + '/' + year;
                                    return '<br>Date: <b>' + formattedUTCDate + '</b><br>75th percentile: <b>' + this.low + ' ft³/s</b><br>90th percentile: <b>' + this.high + ' ft³/s';
                                }
                            },
                            turboThreshold: 0,
                            type: 'arearange',
                            color: '#008B8B',
                            fillOpacity: 0.2,
                            lineWidth: 0,
                            data: this.formattedP75to90,
                            linkedTo: ':previous',
                            visible: true,
                            id: null,
                            zIndex: 1,
                            marker: {
                                symbol: null,
                                radius: null
                            },
                            showInLegend: false
                        }, {
                            name: 'Daily Mean Streamflow',
                            showInNavigator: true,
                            tooltip: {
                                headerFormat: '<b>Daily Mean Streamflow</b>',
                                pointFormatter: function () {
                                    if (this.formattedDailyFlow !== null) {
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
                            visible: true,
                            id: null,
                            zIndex: 4,
                            marker: {
                                symbol: 'circle',
                                radius: 3
                            },
                            showInLegend: this.formattedDailyFlow.length > 0
                        }, {
                            name: 'NWS Forecast',
                            showInNavigator: false,
                            tooltip: {
                                headerFormat: '<b>NWS Forecast</b>',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        var hours = this.x.getHours();
                                        if (hours < 10) {
                                            hours = '0' + hours;
                                        }
                                        var minutes = this.x.getMinutes();
                                        if (minutes < 10) {
                                            minutes = '0' + minutes;
                                        }
                                        var UTCday = this.x.getDate();
                                        var year = this.x.getFullYear();
                                        var month = this.x.getMonth();
                                        month += 1;
                                        var formattedDailyDate = month + '/' + UTCday + '/' + year;
                                        return '<br>Date: <b>' + formattedDailyDate + ' (' + hours + ':' + minutes + ' ' + zoneAbbreviation + ')</b><br>Value: <b>' + this.y + ' ft³/s';
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
                            visible: true,
                            id: null,
                            zIndex: 3,
                            marker: {
                                symbol: '',
                                radius: 3
                            },
                            showInLegend: this.NWSforecast !== undefined
                        }, {
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
                            visible: true,
                            id: 'dummyAEP',
                            zIndex: 2,
                            marker: {
                                symbol: 'line',
                                radius: 0.1
                            },
                            showInLegend: false
                        }, {
                            name: '1-Day Low Flow Statistics',
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
                            visible: false,
                            id: 'oneDay',
                            zIndex: 2,
                            marker: {
                                symbol: 'line',
                                radius: 0.1
                            },
                            showInLegend: false
                        }, {
                            name: '7-Day Low Flow Statistics',
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
                            visible: false,
                            id: 'sevenDay',
                            zIndex: 2,
                            marker: {
                                symbol: 'line',
                                radius: 0.1
                            },
                            showInLegend: false
                        }, {
                            name: '14-Day Low Flow Statistics',
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
                            visible: false,
                            id: 'fourteenDay',
                            zIndex: 2,
                            marker: {
                                symbol: 'line',
                                radius: 0.1
                            },
                            showInLegend: false
                        }, {
                            name: '30-Day Low Flow Statistics',
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
                            visible: false,
                            id: 'thirtyDay',
                            zIndex: 2,
                            marker: {
                                symbol: 'line',
                                radius: 0.1
                            },
                            showInLegend: false
                        }, {
                            name: 'Controlled 1-Day Low Flow Statistics',
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
                            visible: false,
                            id: 'contrOneDay',
                            zIndex: 2,
                            marker: {
                                symbol: 'line',
                                radius: 0.1
                            },
                            showInLegend: false
                        }, {
                            name: 'Alternative Annual Exceedance Probability (AEP)',
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
                            visible: this.formattedFloodFreq.length === 0,
                            id: 'altAEP',
                            zIndex: 2,
                            marker: {
                                symbol: 'line',
                                radius: 0.1
                            },
                            showInLegend: false
                        }, {
                            name: 'Controlled 7-Day Low Flow Statistics',
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
                            visible: false,
                            id: 'contrSevenDay',
                            zIndex: 2,
                            marker: {
                                symbol: 'line',
                                radius: 0.1
                            },
                            showInLegend: false
                        }, {
                            name: 'Controlled 14-Day Low Flow Statistics',
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
                            visible: false,
                            id: 'contrFourteenDay',
                            zIndex: 2,
                            marker: {
                                symbol: 'line',
                                radius: 0.1
                            },
                            showInLegend: false
                        }, {
                            name: 'Controlled 30-Day Low Flow Statistics',
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
                            visible: false,
                            id: 'contrThirtyDay',
                            zIndex: 2,
                            marker: {
                                symbol: 'line',
                                radius: 0.1
                            },
                            showInLegend: false
                        }, {
                            name: 'Weighted 1-Day Low Flow Statistics',
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
                            visible: false,
                            id: 'weightedOneDay',
                            zIndex: 2,
                            marker: {
                                symbol: 'line',
                                radius: 0.1
                            },
                            showInLegend: false
                        }, {
                            name: 'Weighted 7-Day Low Flow Statistics',
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
                            visible: false,
                            id: 'weightedSevenDay',
                            zIndex: 2,
                            marker: {
                                symbol: 'line',
                                radius: 0.1
                            },
                            showInLegend: false
                        }, {
                            name: 'Weighted 30-Day Low Flow Statistics',
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
                            visible: false,
                            id: 'weightedThirtyDay',
                            zIndex: 2,
                            marker: {
                                symbol: 'line',
                                radius: 0.1
                            },
                            showInLegend: false
                        }, {
                            name: 'Instantaneous Streamflow',
                            showInNavigator: true,
                            tooltip: {
                                headerFormat: '<b>Instantaneous Streamflow</b>',
                                pointFormatter: function () {
                                    if (this.formattedInstFlow !== null) {
                                        var hours = this.x.getHours();
                                        if (hours < 10) {
                                            hours = '0' + hours;
                                        }
                                        var minutes = this.x.getMinutes();
                                        if (minutes < 10) {
                                            minutes = '0' + minutes;
                                        }
                                        var UTCday = this.x.getUTCDate();
                                        var year = this.x.getUTCFullYear();
                                        var month = this.x.getUTCMonth();
                                        month += 1;
                                        var formattedUTCDailyDate = month + '/' + UTCday + '/' + year;
                                        return '<br>Date: <b>' + formattedUTCDailyDate + ' (' + hours + ':' + minutes + ' ' + zoneAbbreviation + ')</b><br>Value: <b>' + this.y + ' ft³/s';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'line',
                            color: '#008000',
                            fillOpacity: null,
                            lineWidth: 1.5,
                            data: this.formattedInstFlow,
                            linkedTo: null,
                            visible: true,
                            id: null,
                            zIndex: 4,
                            marker: {
                                symbol: 'circle',
                                radius: 3
                            },
                            showInLegend: this.formattedInstFlow.length > 0
                        }
                    ]
                };
                this.formattedFloodFreq.forEach(function (formattedFloodFreqItem) {
                    _this_1.chartConfig.series.push(formattedFloodFreqItem);
                });
                this.formattedOneDayStats.forEach(function (formattedOneDay) {
                    _this_1.chartConfig.series.push(formattedOneDay);
                });
                this.formattedSevenDayStats.forEach(function (formattedSevenDay) {
                    _this_1.chartConfig.series.push(formattedSevenDay);
                });
                this.formattedFourteenDayStats.forEach(function (formattedFourteenDay) {
                    _this_1.chartConfig.series.push((formattedFourteenDay));
                });
                this.formattedThirtyDayStats.forEach(function (formattedThirtyDay) {
                    _this_1.chartConfig.series.push((formattedThirtyDay));
                });
                this.formattedContrOneDayStats.forEach(function (formattedContrOneDay) {
                    _this_1.chartConfig.series.push((formattedContrOneDay));
                });
                this.formattedAltFloodFreq.forEach(function (formattedAltFloodFreqItem) {
                    _this_1.chartConfig.series.push(formattedAltFloodFreqItem);
                });
                this.formattedContrSevenDayStats.forEach(function (formattedContrSevenDay) {
                    _this_1.chartConfig.series.push((formattedContrSevenDay));
                });
                this.formattedContrFourteenDayStats.forEach(function (formattedContrFourteenDay) {
                    _this_1.chartConfig.series.push((formattedContrFourteenDay));
                });
                this.formattedContrThirtyDayStats.forEach(function (formattedContrThirtyDay) {
                    _this_1.chartConfig.series.push((formattedContrThirtyDay));
                });
                this.formattedWeightedOneDayStats.forEach(function (formattedWeightedOneDay) {
                    _this_1.chartConfig.series.push((formattedWeightedOneDay));
                });
                this.formattedWeightedSevenDayStats.forEach(function (formattedWeightedSevenDay) {
                    _this_1.chartConfig.series.push((formattedWeightedSevenDay));
                });
                this.formattedWeightedThirtyDayStats.forEach(function (formattedWeightedThirtyDay) {
                    _this_1.chartConfig.series.push((formattedWeightedThirtyDay));
                });
            };
            GagePageController.prototype.chooseFloodStats = function () {
                var chart = $('#chart1').highcharts();
                var floodSeries = chart.series[this.selectedFloodFreqStats.seriesIndex];
                if (this.selectedFloodFreqStats.name === this.selectedFloodFreqStats.name) {
                    this.allFloodFreqStats.forEach(function (stat) {
                        var index = stat.seriesIndex;
                        chart.series[index].hide();
                    });
                    floodSeries.show();
                }
            };
            GagePageController.prototype.stageDischargeAgeColor = function (date) {
                var days = (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
                if (days <= 31) {
                    return 'red';
                }
                else if (days <= 365) {
                    return 'orange';
                }
                else if (days <= 730) {
                    return "#0000cdcc";
                }
                else {
                    return "#0000cd4d";
                }
            };
            GagePageController.prototype.stageDischargeQualityColor = function (quality) {
                if (quality === "Good") {
                    return "#2ED017";
                }
                else if (quality === "Fair") {
                    return "#E7F317";
                }
                else {
                    (quality === "Poor");
                }
                return "#FFA200";
            };
            GagePageController.prototype.createDischargePlot = function () {
                this.dischargeChartConfig = {
                    chart: {
                        height: 450,
                        width: 800,
                        zooming: {
                            type: 'xy'
                        }
                    },
                    title: {
                        text: 'Stage vs. Discharge',
                        align: 'center'
                    },
                    subtitle: {
                        text: 'Click and drag in the plot area to zoom in',
                        align: 'center'
                    },
                    xAxis: {
                        type: null,
                        title: {
                            text: 'River Discharge (cfs)'
                        },
                        custom: {
                            allowNegativeLog: true
                        }
                    },
                    yAxis: {
                        title: {
                            text: 'River Stage (ft)'
                        },
                        custom: {
                            allowNegativeLog: true
                        },
                        plotLines: [{ value: null, color: null, width: null, zIndex: null, label: { text: null }, id: 'plotlines' }]
                    },
                    series: [
                        {
                            name: 'USGS Rating Curve',
                            showInNavigator: false,
                            tooltip: { headerFormat: '<b>USGS Rating Curve</b>',
                                pointFormatter: function () {
                                    if (this.dischargeObj !== null) {
                                        var discharge = this.x;
                                        var stage = this.y;
                                        return '<br>Gage Height: <b>' + stage + ' ft' + '</b><br>Discharge: <b>' + discharge + ' cfs';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'spline',
                            color: 'black ',
                            data: this.dischargeObj,
                            marker: {
                                symbol: 'square',
                                radius: 2.5
                            },
                            showInLegend: this.dischargeObj.length > 5
                        },
                        {
                            name: 'Annual Peaks',
                            showInNavigator: false,
                            tooltip: {
                                headerFormat: '<b>Annual Peaks</b>',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        var UTCday = this.getUTCDate;
                                        var year = this.getUTCFullYear;
                                        var month = this.getUTCMonth;
                                        month += 1;
                                        var formattedUTCPeakDate = month + '/' + UTCday + '/' + year;
                                        var discharge = this.x;
                                        var stage = this.y;
                                        var peakDate = this.date;
                                        return '<br>Date: <b>' + peakDate + '</b></br>Peak: <b>' + discharge + ' cfs</b></br>at stage <b>' + stage + ' ft</b></br>';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'scatter',
                            color: 'black',
                            data: this.formattedDischargePeakDates,
                            marker: {
                                symbol: 'circle',
                                radius: 3
                            },
                            showInLegend: this.formattedDischargePeakDates.length > 0
                        },
                        {
                            name: 'USGS Measured',
                            showInNavigator: false,
                            tooltip: { headerFormat: '<b>USGS Measured Discharge</b>',
                                pointFormatter: function () {
                                    if (this.measuredObj !== null) {
                                        var dateTime = this.dateTime;
                                        var timeZone = this.timeZone;
                                        var quality = this.quality;
                                        var control = this.control;
                                        var discharge = this.x;
                                        var stage = this.y;
                                        return '<br> Date: <b>' + dateTime + ' ' + timeZone + '</b></br>Gage Height: <b>' + stage + ' ft</b></br>' + 'Discharge: <b>' + discharge + ' cfs</b></br>' + 'Quality: <b>' + quality + '</b></br>Control: <b>' + control + '</b></br>';
                                    }
                                }
                            },
                            turboThreshold: 0,
                            type: 'scatter',
                            color: null,
                            data: this.measuredObj,
                            marker: {
                                symbol: 'diamond',
                                radius: 3
                            },
                            showInLegend: this.error == false
                        }
                    ]
                };
            };
            GagePageController.prototype.createDailyRasterPlot = function () {
                if (this.dailyValuesOnly.length > 0) {
                    var asc = this.dailyValuesOnly.sort(function (a, b) { return a - b; });
                    var fifthPercentile = asc[Math.floor(asc.length * 0.05)];
                    var ninetyfifthPercentile = asc[Math.floor(asc.length * 0.95)];
                }
                ;
                function logOrLinear(dailyValuesOnly) {
                    if (dailyValuesOnly.some(function (v) { return v <= 0; })) {
                        return {
                            type: 'linear',
                            min: fifthPercentile,
                            max: ninetyfifthPercentile,
                            stops: [
                                [0, '#fde725'],
                                [0.3, '#7ad151'],
                                [0.5, '#22a884'],
                                [0.6, '#2a788e'],
                                [0.8, '#414487'],
                                [1, '#440154']
                            ],
                            startOnTick: false,
                            endOnTick: false,
                            labels: {
                                format: '{value} ft³/s'
                            },
                            allowNegativeLog: true
                        };
                    }
                    if (dailyValuesOnly.some(function (v) { return v > 0; })) {
                        return {
                            type: 'logarithmic',
                            min: null,
                            max: null,
                            stops: [
                                [0, '#fde725'],
                                [0.3, '#7ad151'],
                                [0.5, '#22a884'],
                                [0.6, '#2a788e'],
                                [0.8, '#414487'],
                                [1, '#440154']
                            ],
                            startOnTick: false,
                            endOnTick: false,
                            labels: {
                                format: '{value} ft³/s'
                            },
                            allowNegativeLog: true
                        };
                    }
                }
                function isLeapYear(year) {
                    if (year % 400 === 0)
                        return true;
                    if (year % 100 === 0)
                        return false;
                    return year % 4 === 0;
                }
                this.heatChartConfig = {
                    chart: {
                        height: 450,
                        width: 800,
                        zooming: {
                            type: 'xy'
                        }
                    },
                    title: {
                        text: 'Daily Streamflow',
                        align: 'center'
                    },
                    subtitle: {
                        text: 'Click and drag in the plot area to zoom in',
                        align: 'center'
                    },
                    xAxis: {
                        type: null,
                        min: 275,
                        max: 665,
                        tickPositions: [275, 306, 336, 367, 398, 427, 458, 488, 519, 549, 580, 611, 650],
                        title: {
                            text: 'Day of Year'
                        },
                        threshold: 273,
                        labels: {
                            formatter: function () {
                                if (this.value > 366) {
                                    this.value -= 365;
                                }
                                if (this.value == 285)
                                    return 'Annual Average';
                                return moment("2015 " + this.value, "YYYY DDD").format("MMM");
                            }
                        }
                    },
                    yAxis: {
                        title: {
                            text: 'Water Year'
                        },
                        custom: {
                            allowNegativeLog: true
                        }
                    },
                    colorAxis: logOrLinear(this.dailyValuesOnly),
                    series: [{
                            name: 'Daily Streamflow',
                            pixelSpacing: null,
                            borderWidth: 0,
                            borderColor: 'white',
                            type: 'heatmap',
                            data: this.formattedDailyPlusAvg[0],
                            tooltip: {
                                headerFormat: '<b>Daily Streamflow</b>',
                                pointFormatter: function () {
                                    if (this.formattedDailyPlusAvg !== null) {
                                        var year = this.y;
                                        var doy = this.x;
                                        if (doy > 366) {
                                            doy -= 366;
                                        }
                                        ;
                                        if (doy > 274) {
                                            year -= 1;
                                        }
                                        ;
                                        if (isLeapYear(year) == false && doy > 59) {
                                            doy -= 1;
                                        }
                                        ;
                                        var fullDate = new Date(year, 0, doy);
                                        var UTCday = fullDate.getUTCDate();
                                        var month = fullDate.getUTCMonth();
                                        month += 1;
                                        var formattedUTCDate = month + '/' + UTCday + '/' + year;
                                        var waterYear = year;
                                        if (month > 9) {
                                            waterYear += 1;
                                        }
                                        ;
                                        if (doy > 282 && doy < 293)
                                            return '</b><br>Water Year: <b>' + waterYear + '</b><br>Water Year Average Value: <b>' + this.value.toFixed(2) + ' ft³/s</b>';
                                        if (doy !== 283 && doy !== 284 && doy !== 285 && doy !== 286 && doy !== 287 && doy !== 288 && doy !== 289 && doy !== 290 && doy !== 291 && doy !== 292)
                                            return '<br>Date: <b>' + formattedUTCDate + '</b><br>Value: <b>' + this.value + ' ft³/s</b><br>Water Year: <b>' + waterYear;
                                    }
                                }
                            },
                            turboThreshold: 0
                        }]
                };
            };
            ;
            GagePageController.prototype.containsNegatives = function () {
                if (this.dailyValuesOnly.some(function (v) { return v <= 0; })) {
                    return true;
                }
                if (this.dailyValuesOnly.some(function (v) { return v > 0; })) {
                    return false;
                }
            };
            GagePageController.prototype.togglePlotLines = function () {
                var chart = $('#chart1').highcharts();
                if (this.plotlines) {
                    this.chartConfig.yAxis.plotLines.forEach(function (plotLine) {
                        chart.yAxis[0].addPlotLine(plotLine);
                    });
                }
            };
            GagePageController.prototype.toggleFloodStats = function () {
                var chart = $('#chart1').highcharts();
                var floodSeries = chart.series[this.selectedFloodFreqStats.seriesIndex];
                if (this.showFloodStats) {
                    floodSeries.show();
                }
                else {
                    floodSeries.hide();
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
                var _this_1 = this;
                var chart = $('#chart1').highcharts();
                chart.showLoading('Loading...');
                setTimeout(function () {
                    var min = _this_1.startAndEnd[0].getTime();
                    var oneYearMin = (new Date(1 + '/' + 1 + '/' + _this_1.startAndEnd[1].getFullYear())).getTime();
                    var max = (new Date(12 + '/' + 31 + '/' + _this_1.startAndEnd[1].getFullYear())).getTime();
                    if (_this_1.peaksOnYear) {
                        chart.series[0].update({ data: _this_1.formattedPeakDatesOnYear });
                        chart.series[1].update({ data: _this_1.formattedEstPeakDatesOnYear });
                        chart.xAxis[0].setExtremes(oneYearMin, max);
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
                        chart.series[0].update({ data: _this_1.formattedPeakDates });
                        chart.series[1].update({ data: _this_1.formattedEstPeakDates });
                        chart.xAxis[0].setExtremes(min, max);
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
                    chart.hideLoading();
                }, 100);
            };
            ;
            GagePageController.prototype.destroyResetZoom = function () {
                var chart = $('#chart1').highcharts();
                chart.showResetZoom();
                chart.resetZoomButton.hide();
            };
            GagePageController.prototype.resetZoom = function () {
                var chart = $('#chart1').highcharts();
                var min = this.startAndEnd[0].getTime();
                var oneYearMin = (new Date(1 + '/' + 1 + '/' + this.startAndEnd[1].getFullYear())).getTime();
                var max = (new Date(12 + '/' + 31 + '/' + this.startAndEnd[1].getFullYear())).getTime();
                if (this.peaksOnYear) {
                    chart.xAxis[0].setExtremes(oneYearMin, max);
                    chart.yAxis[0].setExtremes();
                }
                else {
                    chart.yAxis[0].setExtremes();
                    chart.xAxis[0].setExtremes(min, max);
                }
            };
            GagePageController.prototype.dateRangePicker = function () {
                var chart = $('#chart1').highcharts();
                if (($('#dischargeStart').val()).length === 10 && ($('#dischargeEnd').val()).length === 10) {
                    var inputStart = Date.parse($('#dischargeStart').val());
                    var inputEnd = Date.parse($('#dischargeEnd').val());
                    chart.yAxis[0].setExtremes();
                    chart.xAxis[0].setExtremes(inputStart, inputEnd);
                }
                else {
                }
            };
            GagePageController.prototype.updateShadedStats = function () {
                var _this_1 = this;
                var chart = $('#chart1').highcharts();
                var extremes = chart.xAxis[0].getExtremes();
                var min = new Date(extremes.min);
                var max = new Date(extremes.max);
                var minDateString = new Date(min.getTime() - (min.getTimezoneOffset() * 60000))
                    .toISOString()
                    .split("T")[0];
                var maxDateString = new Date(max.getTime() - (min.getTimezoneOffset() * 60000))
                    .toISOString()
                    .split("T")[0];
                var minAndMax = {
                    min: minDateString,
                    max: maxDateString
                };
                this.extremes = minAndMax;
                var maxYear = max.getFullYear();
                var minYear = min.getFullYear();
                function inMonths(d1, d2) {
                    var d1Y = d1.getFullYear();
                    var d2Y = d2.getFullYear();
                    var d1M = d1.getMonth();
                    var d2M = d2.getMonth();
                    return (d2M + 12 * d2Y) - (d1M + 12 * d1Y);
                }
                function generateYearsBetween(startYear, endYear) {
                    if (startYear === void 0) { startYear = 2000; }
                    var endDate = endYear || new Date().getFullYear();
                    var years = [];
                    for (var i = startYear; i <= endDate; i++) {
                        years.push(startYear);
                        startYear++;
                    }
                    return years;
                }
                if ((inMonths(min, max)) <= 60) {
                    chart.series[3].show();
                    chart.series[4].show();
                    var yearsArray = generateYearsBetween(minYear, maxYear);
                    var newData_1 = [];
                    yearsArray.forEach(function (year) {
                        _this_1.rawShaded.forEach(function (index) {
                            var data = {
                                date: new Date(parseFloat(index[5]) + '/' + parseFloat(index[6]) + '/' + year),
                                begin_yr: parseFloat(index[7]),
                                end_yr: parseFloat(index[8]),
                                min_va: parseFloat(index[13]),
                                p10_va: parseFloat(index[16]),
                                p25_va: parseFloat(index[18]),
                                p75_va: parseFloat(index[20]),
                                p90_va: parseFloat(index[22]),
                                max_va: parseFloat(index[11])
                            };
                            newData_1.push(data);
                        });
                    });
                    var newP0to10_1 = [];
                    var newP10to25_1 = [];
                    var newP25to75_1 = [];
                    var newP75to90_1 = [];
                    var newP90to100_1 = [];
                    if (newData_1) {
                        newData_1.forEach(function (stats) {
                            newP0to10_1.push({ x: stats.date, low: stats.min_va, high: stats.p10_va });
                            newP10to25_1.push({ x: stats.date, low: stats.p10_va, high: stats.p25_va });
                            newP25to75_1.push({ x: stats.date, low: stats.p25_va, high: stats.p75_va });
                            newP75to90_1.push({ x: stats.date, low: stats.p75_va, high: stats.p90_va });
                            newP90to100_1.push({ x: stats.date, low: stats.p90_va, high: stats.max_va });
                        });
                    }
                    chart.series[5].show();
                    chart.series[6].show();
                    chart.series[2].show();
                    chart.series[3].update({ data: newP0to10_1 });
                    chart.series[4].update({ data: newP10to25_1 });
                    chart.series[5].update({ data: newP25to75_1 });
                    chart.series[6].update({ data: newP75to90_1 });
                    chart.series[2].update({ data: newP90to100_1 });
                }
                else {
                    chart.series[3].hide();
                    chart.series[4].hide();
                    chart.series[5].hide();
                    chart.series[6].hide();
                    chart.series[2].hide();
                }
            };
            GagePageController.prototype.toggleLogLinearDischarge = function () {
                var chart = $('#chart3').highcharts();
                if (this.logScaleDischarge) {
                    chart.xAxis[0].update({ type: 'logarithmic' });
                    chart.yAxis[0].update({ type: 'logarithmic' });
                }
                else {
                    chart.xAxis[0].update({ type: 'linear' });
                    chart.yAxis[0].update({ type: 'linear' });
                }
            };
            ;
            GagePageController.prototype.toggleDischargeData = function (dataType) {
                var chart = $('#chart3').highcharts();
                var currentUSGSMeasuredData = chart.series[2].data;
                currentUSGSMeasuredData.forEach(function (row) {
                    row.color = (dataType == 'age') ? row.ageColor : row.qualityColor;
                });
                chart.series[2].update({ data: currentUSGSMeasuredData });
            };
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
