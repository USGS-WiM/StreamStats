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
                _this_1.NWSforecast = undefined;
                _this_1.meanPercentileStats = undefined;
                _this_1.meanPercent = undefined;
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
                console.log('GetFloodFreqURL', url);
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    var data = response.data;
                    var AEPlookup = [9, 852, 8, 4, 7, 3, 6, 1, 501, 5, 2, 500, 851, 1438, 818];
                    var altAEPlookup = [2311, 2312, 2313, 2314, 2315, 2316, 2317, 2318];
                    var oneDayLookup = [820, 819, 84, 1130, 1138, 1696, 1139, 1699, 1140, 1702, 1141, 1705, 1737, 85, 1142, 82, 1759, 1143, 1756, 909, 596, 83];
                    var sevenDayLookup = [1167, 822, 821, 1423, 92, 1131, 1433, 1159, 1976, 1160, 1979, 1161, 1982, 1162, 1985, 536, 1165, 1424, 93, 537, 1163, 90, 535, 1432, 1425, 2030, 1164, 2026, 1426, 1166, 1427, 589, 91, 1428, 1429, 1430, 1431];
                    var fourteenDayLookup = [829, 823, 96, 539, 97, 540, 94, 538, 1670, 828, 95];
                    var thirtyDayLookup = [1176, 830, 824, 100, 542, 1168, 1825, 1169, 1827, 1170, 1830, 1171, 1833, 1174, 101, 543, 1172, 98, 541, 1875, 1173, 1872, 1175, 657, 99];
                    var contrOneDayLookup = [1712, 1744, 1753, 1766, 1773];
                    var contrSevenDayLookup = [1992, 2015, 2039, 2048];
                    var contrFourteenDayLookup = [1645, 1652, 1662, 1669, 1677, 1683];
                    var contrThirtyDayLookup = [1837, 1861, 1882, 1891];
                    var weightedOneDayLookup = [1698, 1701, 1704, 1707, 1732, 1736, 1746, 1755, 1758, 1775];
                    var weightedSevenDayLookup = [1978, 1981, 1984, 1987, 2001, 2005, 2007, 2017, 2025, 2028, 2041, 2050];
                    var weightedThirtyDayLookup = [1829, 1832, 1835, 1852, 1854, 1863, 1871, 1874, 1884, 1893, 1845];
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
                    if (dailyValues !== 0) {
                        var filteredDaily = dailyValues.filter(function (item) {
                            return (parseFloat(item.value) !== -999999);
                        });
                        _this_1.dailyFlow = filteredDaily;
                    }
                    _this_1.getNWSForecast();
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
                                smallerData_1.forEach(function (datum) {
                                    if (datum.childNodes[0] !== undefined) {
                                        var forecastObj = {
                                            x: new Date(datum.childNodes[0].textContent),
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
                    if (data.length > 0) {
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
                    }
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
                var endYear = endDate.getUTCFullYear();
                var endOfFinalYear = new Date(12 + '/' + 31 + '/' + endYear);
                if (this.oneDayStats) {
                    this.formattedOneDayStats = [];
                    var oneDayStatsColors_1 = {
                        820: '#9A6324',
                        819: '#800000',
                        84: '#e6194B',
                        1130: '#ffd8b1',
                        1138: '#f58231',
                        1696: '#ffe119',
                        1139: '#bfef45',
                        1699: '#3cb44b',
                        1140: '#42d4f4',
                        1702: '#4363d8',
                        1141: '#000075',
                        1705: '#911eb4',
                        1737: '#dcbeff',
                        85: '#fabed4',
                        1142: '#469990',
                        82: '#f58231',
                        1759: '#3cb44b',
                        1143: '#e6194B',
                        1756: '#bfef45',
                        909: '#911eb4',
                        596: '#9A6324',
                        83: '#9A6324'
                    };
                    this.oneDayStats.forEach(function (oneDayItem) {
                        var colorIndex = oneDayItem.regressionTypeID;
                        var formattedName = oneDayItem.regressionType.name.substring(0, oneDayItem.regressionType.name.length - 18);
                        _this_1.formattedOneDayStats.push({
                            name: oneDayItem.regressionType.name,
                            tooltip: {
                                headerFormat: '<b>1-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>AEP: <b>' + formattedName + '%' + '</b><br>Value: <b>' + oneDayItem.value + ' ft³/s<br>';
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
                                        return formattedName + '% AEP';
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
                            linkedTo: null,
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                        });
                    });
                }
                if (this.sevenDayStats) {
                    this.formattedSevenDayStats = [];
                    var sevenDayStatsColors_1 = {
                        1167: '#9A6324',
                        822: '#800000',
                        821: '#e6194B',
                        1423: '#ffd8b1',
                        92: '#f58231',
                        1131: '#ffe119',
                        1433: '#bfef45',
                        1159: '#3cb44b',
                        1976: '#42d4f4',
                        1160: '#4363d8',
                        1979: '#000075',
                        1161: '#911eb4',
                        1982: '#dcbeff',
                        1162: '#fabed4',
                        1985: '#469990',
                        536: '#f58231',
                        1165: '#3cb44b',
                        1424: '#e6194B',
                        93: '#bfef45',
                        537: '#911eb4',
                        1163: '#9A6324',
                        90: '#9A6324',
                        535: '#800000',
                        1432: '#e6194B',
                        1425: '#ffd8b1',
                        2030: '#f58231',
                        1164: '#ffe119',
                        2026: '#bfef45',
                        1426: '#3cb44b',
                        1166: '#42d4f4',
                        1427: '#4363d8',
                        589: '#000075',
                        91: '#911eb4',
                        1428: '#dcbeff',
                        1429: '#fabed4',
                        1430: '#469990',
                        1431: '#f58231'
                    };
                    this.sevenDayStats.forEach(function (sevenDayItem) {
                        var colorIndex = sevenDayItem.regressionTypeID;
                        var formattedName = sevenDayItem.regressionType.name.substring(0, sevenDayItem.regressionType.name.length - 18);
                        _this_1.formattedSevenDayStats.push({
                            name: sevenDayItem.regressionType.name,
                            tooltip: {
                                headerFormat: '<b>7-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>AEP: <b>' + formattedName + '%' + '</b><br>Value: <b>' + sevenDayItem.value + ' ft³/s<br>';
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
                                        return formattedName + '% AEP';
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
                            linkedTo: null,
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
                        829: '#9A6324',
                        823: '#800000',
                        96: '#e6194B',
                        539: '#ffd8b1',
                        97: '#f58231',
                        540: '#ffe119',
                        94: '#bfef45',
                        538: '#3cb44b',
                        1670: '#42d4f4',
                        828: '#4363d8',
                        95: '#000075'
                    };
                    this.fourteenDayStats.forEach(function (fourteenDayItem) {
                        var colorIndex = fourteenDayItem.regressionTypeID;
                        var formattedName = fourteenDayItem.regressionType.name.substring(0, fourteenDayItem.regressionType.name.length - 18);
                        _this_1.formattedFourteenDayStats.push({
                            name: fourteenDayItem.regressionType.name,
                            tooltip: {
                                headerFormat: '<b>14-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>AEP: <b>' + formattedName + '%' + '</b><br>Value: <b>' + fourteenDayItem.value + ' ft³/s<br>';
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
                                        return formattedName + '% AEP';
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
                            linkedTo: null,
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
                        1176: '#9A6324',
                        830: '#800000',
                        824: '#e6194B',
                        100: '#ffd8b1',
                        542: '#f58231',
                        1168: '#ffe119',
                        1825: '#bfef45',
                        1169: '#3cb44b',
                        1827: '#42d4f4',
                        1170: '#4363d8',
                        1830: '#000075',
                        1171: '#911eb4',
                        1833: '#dcbeff',
                        1174: '#fabed4',
                        101: '#469990',
                        543: '#f58231',
                        1172: '#3cb44b',
                        98: '#e6194B',
                        541: '#bfef45',
                        1875: '#911eb4',
                        1173: '#9A6324',
                        1872: '#ffe119',
                        1175: '#42d4f4',
                        657: '#9A6324',
                        99: '#800000'
                    };
                    this.thirtyDayStats.forEach(function (thirtyDayItem) {
                        var colorIndex = thirtyDayItem.regressionTypeID;
                        var formattedName = thirtyDayItem.regressionType.name.substring(0, thirtyDayItem.regressionType.name.length - 18);
                        _this_1.formattedThirtyDayStats.push({
                            name: thirtyDayItem.regressionType.name,
                            tooltip: {
                                headerFormat: '<b>30-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>AEP: <b>' + formattedName + '%' + '</b><br>Value: <b>' + thirtyDayItem.value + ' ft³/s<br>';
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
                                        return formattedName + '% AEP';
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
                            linkedTo: null,
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
                        1712: '#9A6324',
                        1744: '#800000',
                        1753: '#e6194B',
                        1766: '#ffd8b1',
                        1773: '#f58231'
                    };
                    this.contrOneDayStats.forEach(function (contrOneDayItem) {
                        var colorIndex = contrOneDayItem.regressionTypeID;
                        var formattedName = contrOneDayItem.regressionType.name.substring(0, contrOneDayItem.regressionType.name.length - 18);
                        _this_1.formattedContrOneDayStats.push({
                            name: contrOneDayItem.regressionType.name,
                            tooltip: {
                                headerFormat: '<b>Controlled 1-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>AEP: <b>' + formattedName + '%' + '</b><br>Value: <b>' + contrOneDayItem.value + ' ft³/s<br>';
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
                                        return formattedName + '% AEP';
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
                            linkedTo: null,
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
                        1992: '#9A6324',
                        2015: '#800000',
                        2039: '#e6194B',
                        2048: '#ffd8b1'
                    };
                    this.contrSevenDayStats.forEach(function (contrSevenDayItem) {
                        var colorIndex = contrSevenDayItem.regressionTypeID;
                        var formattedName = contrSevenDayItem.regressionType.name.substring(0, contrSevenDayItem.regressionType.name.length - 18);
                        _this_1.formattedContrSevenDayStats.push({
                            name: contrSevenDayItem.regressionType.name,
                            tooltip: {
                                headerFormat: '<b>Controlled 7-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>AEP: <b>' + formattedName + '%' + '</b><br>Value: <b>' + contrSevenDayItem.value + ' ft³/s<br>';
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
                                        return formattedName + '% AEP';
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
                            linkedTo: null,
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
                        1645: '#9A6324',
                        1652: '#800000',
                        1662: '#e6194B',
                        1669: '#ffd8b1',
                        1677: '#f58231',
                        1683: '#ffe119'
                    };
                    this.contrFourteenDayStats.forEach(function (contrFourteenDayItem) {
                        var colorIndex = contrFourteenDayItem.regressionTypeID;
                        var formattedName = contrFourteenDayItem.regressionType.name.substring(0, contrFourteenDayItem.regressionType.name.length - 18);
                        _this_1.formattedContrFourteenDayStats.push({
                            name: contrFourteenDayItem.regressionType.name,
                            tooltip: {
                                headerFormat: '<b>Controlled 14-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>AEP: <b>' + formattedName + '%' + '</b><br>Value: <b>' + contrFourteenDayItem.value + ' ft³/s<br>';
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
                                        return formattedName + '% AEP';
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
                            linkedTo: null,
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
                        1837: '#9A6324',
                        1861: '#800000',
                        1882: '#e6194B',
                        1891: '#ffd8b1'
                    };
                    this.contrThirtyDayStats.forEach(function (contrThirtyDayItem) {
                        var colorIndex = contrThirtyDayItem.regressionTypeID;
                        var formattedName = contrThirtyDayItem.regressionType.name.substring(0, contrThirtyDayItem.regressionType.name.length - 18);
                        _this_1.formattedContrThirtyDayStats.push({
                            name: contrThirtyDayItem.regressionType.name,
                            tooltip: {
                                headerFormat: '<b>Controlled 30-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>AEP: <b>' + formattedName + '%' + '</b><br>Value: <b>' + contrThirtyDayItem.value + ' ft³/s<br>';
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
                                        return formattedName + '% AEP';
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
                            linkedTo: null,
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
                        1698: '#9A6324',
                        1701: '#800000',
                        1704: '#e6194B',
                        1707: '#ffd8b1',
                        1732: '#f58231',
                        1736: '#ffe119',
                        1746: '#bfef45',
                        1755: '#3cb44b',
                        1758: '#42d4f4',
                        1775: '#4363d8'
                    };
                    this.weightedOneDayStats.forEach(function (weightedOneDayItem) {
                        var colorIndex = weightedOneDayItem.regressionTypeID;
                        var formattedName = weightedOneDayItem.regressionType.name.substring(0, weightedOneDayItem.regressionType.name.length - 18);
                        _this_1.formattedWeightedOneDayStats.push({
                            name: weightedOneDayItem.regressionType.name,
                            tooltip: {
                                headerFormat: '<b>Weighted 1-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>AEP: <b>' + formattedName + '%' + '</b><br>Value: <b>' + weightedOneDayItem.value + ' ft³/s<br>';
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
                                        return formattedName + '% AEP';
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
                            linkedTo: null,
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
                        1978: '#9A6324',
                        1981: '#800000',
                        1984: '#e6194B',
                        1987: '#ffd8b1',
                        2001: '#f58231',
                        2005: '#ffe119',
                        2007: '#bfef45',
                        2017: '#3cb44b',
                        2025: '#42d4f4',
                        2028: '#4363d8',
                        2041: '#000075',
                        2050: '#911eb4'
                    };
                    this.weightedSevenDayStats.forEach(function (weightedSevenDayItem) {
                        var colorIndex = weightedSevenDayItem.regressionTypeID;
                        var formattedName = weightedSevenDayItem.regressionType.name.substring(0, weightedSevenDayItem.regressionType.name.length - 18);
                        _this_1.formattedWeightedSevenDayStats.push({
                            name: weightedSevenDayItem.regressionType.name,
                            tooltip: {
                                headerFormat: '<b>Weighted 7-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>AEP: <b>' + formattedName + '%' + '</b><br>Value: <b>' + weightedSevenDayItem.value + ' ft³/s<br>';
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
                                        return formattedName + '% AEP';
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
                            linkedTo: null,
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
                        1829: '#9A6324',
                        1832: '#800000',
                        1835: '#e6194B',
                        1852: '#ffd8b1',
                        1854: '#f58231',
                        1863: '#ffe119',
                        1871: '#bfef45',
                        1874: '#3cb44b',
                        1884: '#42d4f4',
                        1893: '#4363d8',
                        1845: '#000075'
                    };
                    this.weightedThirtyDayStats.forEach(function (weightedThirtyDayItem) {
                        var colorIndex = weightedThirtyDayItem.regressionTypeID;
                        var formattedName = weightedThirtyDayItem.regressionType.name.substring(0, weightedThirtyDayItem.regressionType.name.length - 18);
                        _this_1.formattedWeightedThirtyDayStats.push({
                            name: weightedThirtyDayItem.regressionType.name,
                            tooltip: {
                                headerFormat: '<b>Weighted 30-Day Low Flow Statistics',
                                pointFormatter: function () {
                                    if (this.formattedPeakDates !== null) {
                                        return '</b><br>AEP: <b>' + formattedName + '%' + '</b><br>Value: <b>' + weightedThirtyDayItem.value + ' ft³/s<br>';
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
                                        return formattedName + '% AEP';
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
                            linkedTo: null,
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
                            linkedTo: null,
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                        });
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
                            linkedTo: ':previous',
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                        });
                    });
                    this.allFloodFreqStats.push(this.formattedFloodFreq, this.formattedAltFloodFreq, this.formattedOneDayStats, this.formattedSevenDayStats, this.formattedFourteenDayStats, this.formattedThirtyDayStats, this.formattedContrOneDayStats, this.formattedContrOneDayStats, this.formattedContrSevenDayStats, this.formattedContrFourteenDayStats, this.formattedContrThirtyDayStats, this.formattedWeightedOneDayStats, this.formattedWeightedSevenDayStats, this.formattedWeightedThirtyDayStats);
                    this.allFloodFreqStats = this.allFloodFreqStats.filter(function (group) { return group.length > 0; });
                    this.allFloodFreqStats.forEach(function (group, index) {
                        console.log(group);
                        _this_1.allFloodFreqStats[index] = {
                            name: group[0].tooltip.headerFormat.replace("<b>", ""),
                            statistics: group
                        };
                    });
                    console.log(this.allFloodFreqStats);
                    this.createAnnualFlowPlot();
                }
            };
            GagePageController.prototype.createAnnualFlowPlot = function () {
                var _this_1 = this;
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
                                headerFormat: '<b>P 90-100 %</b>',
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
                            marker: {
                                symbol: null,
                                radius: null
                            },
                            showInLegend: this.formattedP90to100.length > 0
                        },
                        {
                            name: 'P 0-10%',
                            showInNavigator: false,
                            tooltip: {
                                headerFormat: '<b>P 0-10 %</b>',
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
                            marker: {
                                symbol: null,
                                radius: null
                            },
                            showInLegend: false
                        },
                        {
                            name: 'p 10-25 %',
                            showInNavigator: false,
                            tooltip: {
                                headerFormat: '<b>P 10-25 %</b>',
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
                                headerFormat: '<b>P 25-75 %</b>',
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
                                headerFormat: '<b>P 75-90 %</b>',
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
                                symbol: 'circle',
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
            GagePageController.prototype.chooseFloodStats = function () {
                var _this_1 = this;
                var chart = $('#chart1').highcharts();
                if (chart.gageFloodStatsSelect.name == '30-Day Low Flow Statistics') {
                    this.formattedThirtyDayStats.forEach(function (formattedThirtyDayItem) {
                        _this_1.chartConfig.series.push(formattedThirtyDayItem);
                    });
                }
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
