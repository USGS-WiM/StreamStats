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
        var SedimentController = (function (_super) {
            __extends(SedimentController, _super);
            function SedimentController($scope, modal, modalservice, studyArea, events, $http, toaster) {
                var _this = _super.call(this, $http, configuration.baseurls.StreamStats) || this;
                _this.events = events;
                _this.isBusy = false;
                _this.selectedReferenceGage = null;
                _this.queryBy = 'Nearest';
                _this.getNearest = false;
                _this.distance = 10;
                _this.stationNumber = '';
                $scope.vm = _this;
                _this.modalInstance = modal;
                _this.studyAreaService = studyArea;
                _this.modalService = modalservice;
                _this.eventManager = events;
                _this.toaster = toaster;
                _this.init();
                _this.load();
                return _this;
            }
            SedimentController.prototype.close = function () {
                this.modalInstance.dismiss('cancel');
            };
            SedimentController.prototype.ok = function () {
                var errorMessage = this.verifyExtensionCanContinue();
                if (!errorMessage) {
                    this.close();
                    this.toaster.pop('success', "Sediment Machine Learning Method was successfully configured", "Please continue", 5000);
                }
                else {
                    this.toaster.pop('error', "Error", errorMessage, 5000);
                }
            };
            SedimentController.prototype.setReferenceGageFromMap = function (name) {
                this.isBusy = true;
                this.studyAreaService.doSelectMapGage = true;
                this.modalInstance.dismiss('cancel');
            };
            SedimentController.prototype.init = function () {
                this.isBusy = false;
                if (this.studyAreaService.sedimentModelData != null && this.studyAreaService.sedimentModelData.selectedGage == null) {
                    this.selectedReferenceGage = new StreamStats.Models.ReferenceGage("", "");
                }
                this.referenceGageList = null;
                var lat = this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toString();
                var lon = this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toString();
                var url = configuration.baseurls.StreamStatsMapServices + configuration.queryparams.FlowAnywhereGages.format(lon, lat);
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.dateRange = { dates: { startDate: this.addDay(new Date(), -32), endDate: this.addDay(new Date(), -2) }, minDate: new Date(2006, 0, 1), maxDate: this.addDay(new Date(), -1) };
            };
            SedimentController.prototype.load = function () {
            };
            SedimentController.prototype.verifyExtensionCanContinue = function () {
                if (this.dateRange) {
                    if ((this.dateRange.dates === undefined || this.dateRange.dates.startDate === undefined || this.dateRange.dates.endDate === undefined) || !((this.dateRange.dates || this.dateRange.dates.startDate <= this.dateRange.maxDate || this.dateRange.dates.endDate <= this.dateRange.maxDate) &&
                        (this.dateRange.dates.startDate >= this.dateRange.minDate || this.dateRange.dates.endDate >= this.dateRange.minDate) &&
                        (this.dateRange.dates.startDate <= this.dateRange.dates.endDate))) {
                        return "Date range is not valid.";
                    }
                }
                return null;
            };
            SedimentController.prototype.addDay = function (d, days) {
                try {
                    var dayAsTime = 1000 * 60 * 60 * 24;
                    return new Date(d.getTime() + days * dayAsTime);
                }
                catch (e) {
                    return d;
                }
            };
            SedimentController.prototype.getExtensionParameters = function (codes) {
                if (codes === void 0) { codes = null; }
                var parameters = this.studyAreaService.selectedStudyAreaExtensions.reduce(function (acc, val) { return acc.concat(val.parameters); }, []);
                if (codes) {
                    parameters = parameters.filter(function (f) { return (codes.indexOf((f.code)) > -1); });
                }
                return parameters;
            };
            SedimentController.prototype.onStudyServiceBusyChanged = function () {
                var _this = this;
                this.studyAreaService.onStudyAreaServiceBusyChanged.unsubscribe(new WiM.Event.EventHandler(function () {
                    _this.onStudyServiceBusyChanged();
                }));
                this.load();
                this.isBusy = false;
            };
            SedimentController.prototype.updateReferenceGage = function (item) {
                this.selectedReferenceGage = item;
                this.studyAreaService.selectedGage = item;
            };
            SedimentController.prototype.openGagePage = function (siteid) {
                console.log('gage page id:', siteid);
                this.modalService.openModal(StreamStats.Services.SSModalType.e_gagepage, { 'siteid': siteid });
            };
            SedimentController.prototype.getGageInfo = function () {
                this.toaster.pop('wait', "Querying gage information", "Please wait...", 0);
                this.isBusy = true;
                var selectedGageDone = false;
                if (this.referenceGageList)
                    for (var i = this.referenceGageList.length - 1; i >= 0; i--) {
                        var gage = this.referenceGageList[i];
                        if (this.selectedReferenceGage && this.selectedReferenceGage.StationID && gage.StationID == this.selectedReferenceGage.StationID)
                            selectedGageDone = true;
                        this.getGageStatsStationInfo(gage);
                    }
                if (this.selectedReferenceGage && this.selectedReferenceGage.StationID != "" && !selectedGageDone) {
                    this.getGageStatsStationInfo(this.selectedReferenceGage);
                }
            };
            SedimentController.prototype.getGageStatsStationInfo = function (gage, newGage) {
                var _this = this;
                if (newGage === void 0) { newGage = false; }
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + gage.StationID;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    var gageInfo = response.data;
                    if (gageInfo.stationType && gageInfo.stationType.code != 'GS') {
                        if (newGage) {
                            _this.toaster.clear();
                            _this.toaster.pop('error', "Invalid gage", "Gage is not continuous record", 0);
                            _this.isBusy = false;
                        }
                        else {
                            _this.removeItem(gage);
                            if (_this.referenceGageList.length == 0) {
                                _this.toaster.pop('warning', "No valid gages returned", "Gages without continuous record removed from response", 0);
                            }
                            else {
                                _this.toaster.clear();
                                _this.toaster.pop('error', "Invalid gage", "Gage is not continuous record", 0);
                                _this.isBusy = false;
                            }
                        }
                    }
                    else {
                        if (gageInfo.hasOwnProperty('isRegulated'))
                            gage['isRegulated'] = gageInfo.isRegulated;
                        if (gageInfo.hasOwnProperty('stationType'))
                            gage['stationType'] = gageInfo.stationType;
                        if (gageInfo.hasOwnProperty('statistics')) {
                            var hasFlowDurationStats = false;
                            gageInfo['statistics'].forEach(function (stat) {
                                if (stat['statisticGroupType'].code == 'FDS' && stat['isPreferred'])
                                    hasFlowDurationStats = true;
                            });
                            gage['HasFlowDurationStats'] = hasFlowDurationStats;
                        }
                        if (gageInfo.hasOwnProperty('characteristics')) {
                            gageInfo.characteristics.forEach(function (char) {
                                if (char['variableType'].code == 'DRNAREA')
                                    gage['DrainageArea'] = char['value'];
                            });
                        }
                        if (gageInfo.hasOwnProperty('name'))
                            gage['Name'] = gageInfo.name;
                        if (newGage) {
                            if (!_this.referenceGageList)
                                _this.referenceGageList = [];
                            if (_this.referenceGageList.length == 0 || !_this.referenceGageList.some(function (g) { return g.StationID == gage.StationID; }))
                                _this.referenceGageList.unshift(gage);
                        }
                        if (gageInfo.hasOwnProperty('location')) {
                            var lat = _this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toString();
                            var long = _this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toString();
                            var from = turf.point(gageInfo.location.coordinates);
                            var to = turf.point([long, lat]);
                            var options = { units: 'miles' };
                            var distance = turf.distance(from, to, options);
                            gage['distanceFromClick'] = distance.toFixed(2);
                        }
                        _this.getNWISPeriodOfRecord(gage);
                    }
                }, function (error) {
                    _this.toaster.clear();
                    _this.isBusy = false;
                    console.log(error);
                    if (error.headers()['x-usgswim-messages']) {
                        var headerMsgs = JSON.parse(error.headers()['x-usgswim-messages']);
                        Object.keys(headerMsgs).forEach(function (key) {
                            headerMsgs[key].forEach(function (element) {
                                _this.toaster.pop(key, key, element);
                            });
                        });
                    }
                    _this.removeItem(gage);
                }).finally(function () {
                });
            };
            SedimentController.prototype.removeItem = function (gage) {
                var gageIndex = this.referenceGageList.indexOf(this.referenceGageList.filter(function (item) { return item.StationID == gage.StationID; })[0]);
                if (gageIndex)
                    this.referenceGageList.splice(gageIndex, 1);
            };
            SedimentController.prototype.getNearestGages = function () {
                var _this = this;
                this.isBusy = true;
                this.toaster.pop("wait", "Searching for gages", "Please wait...", 0);
                var headers = {
                    "X-Is-Streamstats": true
                };
                var lat = this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toString();
                var long = this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toString();
                var url = configuration.baseurls.GageStatsServices;
                if (this.queryBy == 'Nearest')
                    url += configuration.queryparams.GageStatsServicesNearest.format(lat, long, (this.distance * 1.60934).toFixed(0));
                if (this.queryBy == 'Network')
                    url += configuration.queryparams.GageStatsServicesNetwork.format(lat, long, (this.distance * 1.60934).toFixed(0));
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                this.referenceGageList = [];
                if (this.selectedReferenceGage != null) {
                    this.selectedReferenceGage.StationID = '';
                }
                this.Execute(request).then(function (response) {
                    _this.toaster.clear();
                    _this.isBusy = false;
                    if (typeof response.data == 'string') {
                        _this.toaster.pop("warning", "Warning", response.data, 0);
                    }
                    else if (response.data && response.data.length == 0) {
                        _this.toaster.pop("warning", "Warning", "No stations located within search distance");
                    }
                    else if (response.data && response.data.length > 0) {
                        for (var i = response.data.length - 1; i >= 0; i--) {
                            var gage = response.data[i];
                            if (gage.stationType.code != 'GS') {
                                response.data.splice(i, 1);
                                if (response.data.length == 0)
                                    _this.toaster.pop('warning', "No valid gages returned", "Gages without continuous record removed from response", 0);
                            }
                            else {
                                if (gage.hasOwnProperty('statistics')) {
                                    var hasFlowDurationStats = false;
                                    gage.statistics.forEach(function (stat) {
                                        if (stat['statisticGroupType'].code == 'FDS' && stat['isPreferred'])
                                            hasFlowDurationStats = true;
                                    });
                                    gage['HasFlowDurationStats'] = hasFlowDurationStats;
                                }
                                if (gage.hasOwnProperty('characteristics')) {
                                    gage.characteristics.forEach(function (char) {
                                        if (char['variableType'].code == 'DRNAREA')
                                            gage['DrainageArea'] = char['value'];
                                    });
                                }
                                if (gage.hasOwnProperty('name'))
                                    gage.Name = gage.name;
                                if (gage.hasOwnProperty('code'))
                                    gage.StationID = gage.code;
                                if (gage.hasOwnProperty('location')) {
                                    var lat = _this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toString();
                                    var long = _this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toString();
                                    var from = turf.point(gage.location.coordinates);
                                    var to = turf.point([long, lat]);
                                    var options = { units: 'miles' };
                                    var distance = turf.distance(from, to, options);
                                    gage['distanceFromClick'] = distance.toFixed(2);
                                }
                                _this.getNWISPeriodOfRecord(gage);
                            }
                        }
                        _this.referenceGageList = response.data;
                        _this.getNWISDailyValues();
                    }
                    if (response.headers()['x-usgswim-messages']) {
                        var headerMsgs = JSON.parse(response.headers()['x-usgswim-messages']);
                        Object.keys(headerMsgs).forEach(function (key) {
                            headerMsgs[key].forEach(function (element) {
                                _this.toaster.pop(key, key, element);
                            });
                        });
                    }
                }, function (error) {
                    _this.toaster.clear();
                    _this.isBusy = false;
                    console.log(error);
                    if (error.headers()['x-usgswim-messages']) {
                        var headerMsgs = JSON.parse(error.headers()['x-usgswim-messages']);
                        Object.keys(headerMsgs).forEach(function (key) {
                            headerMsgs[key].forEach(function (element) {
                                _this.toaster.pop(key, key, element);
                            });
                        });
                    }
                    else {
                        _this.toaster.pop('error', "There was an error finding nearby gages.", "Please retry", 0);
                    }
                });
            };
            SedimentController.prototype.selectGage = function (gage) {
                var sid = this.studyAreaService.selectedStudyAreaExtensions.reduce(function (acc, val) { return acc.concat(val.parameters); }, []).filter(function (f) { return (f.code).toLowerCase() == "sid"; });
                var rg = new StreamStats.Models.ReferenceGage(gage.StationID, gage.Name);
                if (gage.geometry) {
                    rg.Latitude_DD = gage.geometry.coordinates[0];
                    rg.Longitude_DD = gage.geometry.coordinates[1];
                }
                this.selectedReferenceGage = rg;
                this.studyAreaService.selectedGage = rg;
            };
            SedimentController.prototype.getStyling = function (gage) {
                if (this.selectedReferenceGage !== null && gage.StationID == this.selectedReferenceGage.StationID)
                    return { 'background-color': '#ebf0f5' };
                else
                    return { 'background-color': 'unset' };
            };
            SedimentController.prototype.getNWISPeriodOfRecord = function (gage) {
                var _this = this;
                if (!gage.StationID)
                    return;
                var nwis_url = configuration.baseurls.NWISurl + configuration.queryparams.NWISperiodOfRecord + gage.StationID;
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
                    _this.toaster.clear();
                    _this.isBusy = false;
                }, function (error) {
                    _this.toaster.clear();
                    _this.isBusy = false;
                    _this.toaster.pop('error', "Error", "NWIS period of record not found", 0);
                }).finally(function () {
                });
            };
            SedimentController.prototype.checkPeriodOfRecord = function (gage) {
                if (!this.dateRange.dates && gage.hasOwnProperty('SelectEnabled'))
                    return gage['SelectEnabled'];
                if (this.dateRange.dates.startDate >= this.addDay(gage['StartDate'], 1) && this.addDay(gage['EndDate'], 1) >= this.dateRange.dates.endDate)
                    gage['SelectEnabled'] = true;
                else {
                    gage['SelectEnabled'] = false;
                }
                return gage['SelectEnabled'];
            };
            SedimentController.prototype.getNWISDailyValues = function () {
                var _this = this;
                if (!this.referenceGageList)
                    return;
                var start = this.dateRange.dates.startDate.toISOString();
                start = start.substr(0, start.indexOf('T'));
                var end = this.dateRange.dates.endDate.toISOString();
                end = end.substr(0, end.indexOf('T'));
                this.referenceGageList.forEach(function (gage) {
                    gage['HasZeroFlows'] = 'N/A';
                    var nwis_url = configuration.baseurls.NWISurl + configuration.queryparams.NWISdailyValues.format(gage.StationID, start, end);
                    var nwis_request = new WiM.Services.Helpers.RequestInfo(nwis_url, true, WiM.Services.Helpers.methodType.GET, 'TEXT');
                    _this.Execute(nwis_request).then(function (response) {
                        var data = response.data.split('\n').filter(function (r) { return (!r.startsWith("#") && r != ""); });
                        data.shift();
                        gage['HasZeroFlows'] = false;
                        if (data.length <= 2)
                            gage['HasZeroFlows'] = 'N/A';
                        do {
                            var row = data.shift().split('\t');
                            var value = parseInt(row[3]);
                            if (typeof (value) == 'number' && value == 0)
                                gage['HasZeroFlows'] = 'true';
                        } while (data.length > 0);
                    }, function (error) {
                        gage['HasZeroFlows'] = 'N/A';
                    });
                });
            };
            SedimentController.prototype.queryGage = function () {
                this.toaster.pop('wait', "Querying gage information", "Please wait...", 0);
                this.isBusy = true;
                var gage = new StreamStats.Models.ReferenceGage(this.stationNumber, '');
                this.getGageStatsStationInfo(gage, true);
            };
            SedimentController.$inject = ['$scope', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.StudyAreaService', 'WiM.Event.EventManager', '$http', 'toaster'];
            return SedimentController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.SedimentController', SedimentController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
