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
                _this_1.ratingCurve = undefined;
                _this_1.measuredObj = undefined;
                _this_1.USGSMeasured = undefined;
                _this_1.floodFreq = undefined;
                _this_1.peakDates = undefined;
                _this_1.estPeakDates = undefined;
                _this_1.dailyFlow = undefined;
                _this_1.formattedFloodFreq = undefined;
                _this_1.formattedDailyHeat = [];
                _this_1.formattedPeakDates = [];
                _this_1.formattedDailyPlusAvg = [];
                _this_1.formattedEstPeakDates = [];
                _this_1.formattedDailyFlow = [];
                _this_1.dailyRange = [];
                _this_1.formattedDischargePeakDates = [];
                _this_1.formattedDischargeObj = [];
                _this_1.formattedRatingCurve = [];
                _this_1.formattedUSGSMeasured = [];
                _this_1.ageQualityData = 'age';
                _this_1.dailyValuesOnly = [];
                _this_1.plotlines = true;
                _this_1.logScale = false;
                _this_1.logScaleDischarge = false;
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
                    var data = response.data.split('\n').filter(function (r) { return (!r.startsWith("#") && r != ""); });
                    data.shift().split('\t');
                    data.shift();
                    data.forEach(function (row) {
                        var dataRow = row.split('\t');
                        var object = {
                            dateTime: dataRow[3],
                            timeZone: dataRow[4],
                            quality: dataRow[10],
                            control: dataRow[13],
                            x: parseFloat(dataRow[9]),
                            y: parseFloat(dataRow[8]),
                            qualityColor: _this_1.getCorrectQualityColor(dataRow[10]),
                            color: _this_1.getCorrectColor(new Date(dataRow[3])),
                            ageColor: _this_1.getCorrectColor(new Date(dataRow[3]))
                        };
                        _this_1.measuredObj.push(object);
                    });
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
                if (this.dailyFlow) {
                    this.dailyFlow.forEach(function (dailyObj) {
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
                            _this_1.formattedDailyFlow.push({ x: new Date(dailyObj.dateTime), y: parseInt(dailyObj.value) });
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
                    this.floodFreq.forEach(function (floodFreqItem) {
                        var colorIndex = floodFreqItem.regressionTypeID;
                        var formattedName = floodFreqItem.regressionType.name.substring(0, floodFreqItem.regressionType.name.length - 18);
                        _this_1.formattedFloodFreq.push({
                            value: floodFreqItem.value,
                            color: AEPColors_1[colorIndex],
                            width: 1.5,
                            zIndex: 4,
                            label: { text: formattedName + '% AEP' },
                            id: 'plotlines'
                        });
                    });
                    this.createAnnualFlowPlot();
                    this.createDailyRasterPlot();
                    this.createDischargePlot();
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
                        }
                    },
                    title: {
                        text: 'Annual Peak Streamflow',
                        align: 'center'
                    },
                    subtitle: {
                        text: 'Click and drag in the plot area to zoom in<br>AEP = Annual Exceedance Probability',
                        align: 'center'
                    },
                    rangeSelector: {
                        enabled: true,
                        inputPosition: {
                            align: 'left',
                            x: 0,
                            y: 0
                        },
                        selected: 5,
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
                        min: null,
                        max: null,
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
                            name: 'Daily Streamflow',
                            showInNavigator: true,
                            tooltip: {
                                headerFormat: '<b>Daily Streamflow</b>',
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
                            color: '#add8f2',
                            data: this.formattedDailyFlow,
                            marker: {
                                symbol: '',
                                radius: 3
                            },
                            showInLegend: this.formattedDailyFlow.length > 0
                        },
                        {
                            name: 'Annual Peak Streamflow',
                            showInNavigator: false,
                            tooltip: {
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
                            },
                            turboThreshold: 0,
                            type: 'scatter',
                            color: 'black',
                            data: this.formattedPeakDates,
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
                                        return '<br>Date (estimated): <b>' + formattedUTCPeakDate + '</b><br>Value: <b>' + this.y + ' ft³/s</b><br>Water Year: <b>' + waterYear;
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
                            },
                            showInLegend: this.formattedEstPeakDates.length > 0
                        }
                    ]
                };
                this.formattedFloodFreq.forEach(function (formattedFloodFreqItem) {
                    _this_1.chartConfig.yAxis.plotLines.push(formattedFloodFreqItem);
                });
            };
            GagePageController.prototype.getCorrectColor = function (date) {
                var days = (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
                if (days <= 31) {
                    console.log("first month", days);
                    return 'red';
                }
                else if (days <= 365) {
                    console.log("first year", days);
                    return 'orange';
                }
                else if (days <= 730) {
                    console.log("second year", days);
                    return "#0000cdcc";
                }
                else {
                    console.log("any other year", days);
                    return "#0000cd4d";
                }
            };
            GagePageController.prototype.getCorrectQualityColor = function (quality) {
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
                            showInLegend: this.dischargeObj.length > 0
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
                                        return '<br>Date <b>' + peakDate + '<br>Peak <b>' + discharge + ' cfs' + '<br>at stage <b>' + stage + ' ft';
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
                            tooltip: { headerFormat: '<b>USGS Measured</b>',
                                pointFormatter: function () {
                                    if (this.measuredObj !== null) {
                                        var dateTime = this.dateTime;
                                        var timeZone = this.timeZone;
                                        var quality = this.quality;
                                        var control = this.control;
                                        var discharge = this.x;
                                        var stage = this.y;
                                        return '<br><b>' + dateTime + ' ' + timeZone + '<br>Gage Height: <b>' + stage + ' ft' + '<br>Discharge: <b>' + discharge + ' cfs' + '<br>Quality: <b>' + quality + '<br>Control: <b>' + control;
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
                            showInLegend: this.measuredObj.length > 0
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
                                [0, '#FF0000'],
                                [0.3, '#FFCC33'],
                                [0.8, '#66CCFF'],
                                [1, '#3300CC']
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
                                [0, '#FF0000'],
                                [0.3, '#FFCC33'],
                                [0.8, '#66CCFF'],
                                [1, '#3300CC']
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
            GagePageController.prototype.togglePlotLines = function () {
                var chart = $('#chart1').highcharts();
                if (this.plotlines) {
                    this.chartConfig.yAxis.plotLines.forEach(function (plotLine) {
                        chart.yAxis[0].addPlotLine(plotLine);
                    });
                }
                else {
                    chart.yAxis[0].removePlotLine('plotlines');
                }
            };
            ;
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
            GagePageController.prototype.toggleLogLinearDischarge = function () {
                var chart = $('#chart3').highcharts();
                if (this.logScaleDischarge) {
                    chart.yAxis[0].update({ type: 'logarithmic' });
                    chart.xAxis[0].update({ type: 'logarithmic' });
                }
                else {
                    chart.yAxis[0].update({ type: 'linear' });
                    chart.xAxis[0].update({ type: 'linear' });
                }
            };
            ;
            GagePageController.prototype.toggleData = function (dataType) {
                console.log('this is age data');
                var chart = $('#chart3').highcharts();
                console.log('this is chart data', chart);
                console.log('this is measuredObj data', this.measuredObj);
                if (dataType === 'age') {
                    this.measuredObj.forEach(function (row) {
                        row.color = row.ageColor;
                    });
                }
                else {
                    this.measuredObj.forEach(function (row) {
                        row.color = row.qualityColor;
                    });
                }
                ;
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
