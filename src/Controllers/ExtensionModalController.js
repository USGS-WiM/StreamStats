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
        'use string';
        var ExtensionModalController = (function (_super) {
            __extends(ExtensionModalController, _super);
            function ExtensionModalController($scope, $analytics, modal, modalservice, studyArea, events, $http, toaster) {
                var _this = _super.call(this, $http, configuration.baseurls.StreamStats) || this;
                _this.events = events;
                _this.isBusy = false;
                _this.CanContinue = true;
                _this.selectedReferenceGage = null;
                _this.queryBy = 'Nearest';
                _this.getNearest = false;
                _this.distance = 10;
                $scope.vm = _this;
                _this.angulartics = $analytics;
                _this.modalInstance = modal;
                _this.studyAreaService = studyArea;
                _this.modalService = modalservice;
                _this.eventManager = events;
                _this.toaster = toaster;
                _this.dateRangeOptions = {
                    locale: { format: 'MMMM D, YYYY' },
                    eventHandlers: { 'hide.daterangepicker': function (e) { return _this.SetExtensionDate(e); } }
                };
                _this.init();
                _this.load();
                $scope.$watch(function () { return _this.dateRange.dates; }, function (newval, oldval) {
                    _this.studyAreaService.selectedStudyAreaExtensions.forEach(function (ext) {
                        ext.parameters.forEach(function (p) {
                            if (p.code == "sdate") {
                                p.value = _this.dateRange.dates.startDate;
                            }
                            if (p.code == "edate") {
                                p.value = _this.dateRange.dates.endDate;
                            }
                        });
                    });
                    if (newval != oldval)
                        _this.getNWISDailyValues();
                });
                return _this;
            }
            ExtensionModalController.prototype.close = function () {
                this.modalInstance.dismiss('cancel');
            };
            ExtensionModalController.prototype.ok = function () {
                if (this.verifyExtensionCanContinue()) {
                    this.close();
                }
            };
            ExtensionModalController.prototype.setReferenceGageFromMap = function (name) {
                this.isBusy = true;
                this.studyAreaService.doSelectMapGage = true;
                this.modalInstance.dismiss('cancel');
            };
            ExtensionModalController.prototype.setBestCorrelatedReferenceGage = function () {
                var _this = this;
                this.isBusy = true;
                this.studyAreaService.onStudyAreaServiceBusyChanged.subscribe(new WiM.Event.EventHandler(function () {
                    _this.onStudyServiceBusyChanged();
                }));
                this.studyAreaService.GetKriggedReferenceGages();
            };
            ExtensionModalController.prototype.SetExtensionDate = function (event) {
                var _this = this;
                var dates = this.getExtensionParameters(['sdate', 'edate']);
                dates.forEach(function (dt) {
                    if (dt.code === "sdate")
                        dt.value = _this.dateRange.dates.startDate;
                    if (dt.code === "edate")
                        dt.value = _this.dateRange.dates.endDate;
                });
                this.studyAreaService.extensionDateRange = this.dateRange;
            };
            ExtensionModalController.prototype.init = function () {
                this.selectedReferenceGage = null;
                if (this.studyAreaService.selectedStudyAreaExtensions == null)
                    return;
                this.title = this.studyAreaService.selectedStudyAreaExtensions.map(function (c) { return c.name; }).join(", ");
                var parameters = this.getExtensionParameters();
                var pcodes = parameters.map(function (p) { return p.code; });
                if (['sid'].some(function (r) { return pcodes.indexOf(r) > -1; })) {
                    this.selectedReferenceGage = new StreamStats.Models.ReferenceGage("", "");
                }
                if (['sdate', 'edate'].every(function (elem) { return pcodes.indexOf(elem) > -1; })) {
                    if (this.studyAreaService.extensionDateRange != undefined) {
                        this.dateRange = this.studyAreaService.extensionDateRange;
                    }
                    else {
                        this.dateRange = { dates: { startDate: this.addDay(new Date(), -30), endDate: this.addDay(new Date(), -1) }, minDate: new Date(1900, 1, 1), maxDate: this.addDay(new Date(), -1) };
                    }
                    parameters[pcodes.indexOf('sdate')].value = this.dateRange.dates.startDate;
                    parameters[pcodes.indexOf('edate')].value = this.dateRange.dates.endDate;
                }
            };
            ExtensionModalController.prototype.load = function () {
                var parameters = this.getExtensionParameters();
                var _loop_1 = function () {
                    var f = parameters.pop();
                    if (this_1.selectedReferenceGage && ['sid'].indexOf(f.code) > -1) {
                        if (typeof f.value != 'string')
                            this_1.selectedReferenceGage = f.value;
                        else if (typeof f.options == 'object')
                            this_1.selectedReferenceGage = f.options.filter(function (g) { return g.StationID == f.value; })[0];
                        this_1.referenceGageList = f.options;
                    }
                    if (this_1.dateRange && ['sdate', 'edate'].indexOf(f.code) > -1) {
                        if (f.code == "sdate")
                            this_1.dateRange.dates.startDate = f.value;
                        if (f.code == "edate")
                            this_1.dateRange.dates.endDate = f.value;
                    }
                };
                var this_1 = this;
                do {
                    _loop_1();
                } while (parameters.length > 0);
                if (this.studyAreaService.selectedGage)
                    this.studyAreaService.selectedGage = this.selectedReferenceGage;
                this.getGageInfo();
                this.getNWISDailyValues();
            };
            ExtensionModalController.prototype.verifyExtensionCanContinue = function () {
                var _this = this;
                if (this.dateRange) {
                    if (!((this.dateRange.dates.startDate <= this.dateRange.maxDate || this.dateRange.dates.endDate <= this.dateRange.maxDate) &&
                        (this.dateRange.dates.startDate >= this.dateRange.minDate || this.dateRange.dates.endDate >= this.dateRange.minDate) &&
                        (this.dateRange.dates.startDate <= this.dateRange.dates.endDate))) {
                        return false;
                    }
                }
                if (this.selectedReferenceGage) {
                    if (this.selectedReferenceGage.StationID == "")
                        return false;
                }
                this.studyAreaService.selectedStudyAreaExtensions.forEach(function (ext) {
                    ext.parameters.forEach(function (p) {
                        if (p.code == "sid" && typeof p.value != 'string') {
                            if (p.options == undefined || p.options.length == 0)
                                p.options = [_this.selectedReferenceGage];
                            p.value = _this.selectedReferenceGage.StationID;
                        }
                        ;
                        if (p.code == "sdate") {
                            p.value = _this.dateRange.dates.startDate;
                        }
                        if (p.code == "edate") {
                            p.value = _this.dateRange.dates.endDate;
                        }
                    });
                });
                this.studyAreaService.updateExtensions();
                return true;
            };
            ExtensionModalController.prototype.addDay = function (d, days) {
                try {
                    var dayAsTime = 1000 * 60 * 60 * 24;
                    return new Date(d.getTime() + days * dayAsTime);
                }
                catch (e) {
                    return d;
                }
            };
            ExtensionModalController.prototype.getExtensionParameters = function (codes) {
                if (codes === void 0) { codes = null; }
                var parameters = this.studyAreaService.selectedStudyAreaExtensions.reduce(function (acc, val) { return acc.concat(val.parameters); }, []);
                if (codes) {
                    parameters = parameters.filter(function (f) { return (codes.indexOf((f.code)) > -1); });
                }
                return parameters;
            };
            ExtensionModalController.prototype.onStudyServiceBusyChanged = function () {
                var _this = this;
                this.studyAreaService.onStudyAreaServiceBusyChanged.unsubscribe(new WiM.Event.EventHandler(function () {
                    _this.onStudyServiceBusyChanged();
                }));
                this.load();
                this.isBusy = false;
            };
            ExtensionModalController.prototype.updateReferenceGage = function (item) {
                this.selectedReferenceGage = item;
                this.studyAreaService.selectedGage = item;
            };
            ExtensionModalController.prototype.openGagePage = function (siteid) {
                console.log('gage page id:', siteid);
                this.modalService.openModal(StreamStats.Services.SSModalType.e_gagepage, { 'siteid': siteid });
            };
            ExtensionModalController.prototype.getGageInfo = function () {
                var _this = this;
                var selectedGageDone = false;
                if (this.referenceGageList)
                    this.referenceGageList.forEach(function (gage) {
                        if (_this.selectedReferenceGage && _this.selectedReferenceGage.StationID && gage.StationID == _this.selectedReferenceGage.StationID)
                            selectedGageDone = true;
                        var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + gage.StationID;
                        var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                        _this.Execute(request).then(function (response) {
                            var gageInfo = response.data;
                            if (!gage.hasOwnProperty('properties'))
                                gage['properties'] = {};
                            if (gageInfo.hasOwnProperty('statistics')) {
                                var hasFlowDurationStats = false;
                                gageInfo.statistics.forEach(function (stat) {
                                    if (stat['statisticGroupType'].code == 'FDS')
                                        hasFlowDurationStats = true;
                                });
                                gage['properties']['HasFlowDurationStats'] = hasFlowDurationStats;
                            }
                            if (gageInfo.hasOwnProperty('isRegulated'))
                                gage['properties'].IsRegulated = gageInfo.isRegulated;
                            if (gageInfo.hasOwnProperty('characteristics')) {
                                gageInfo.characteristics.forEach(function (char) {
                                    if (char['variableType'].code == 'DRNAREA')
                                        gage['properties']['DrainageArea'] = char['value'];
                                });
                            }
                            if (gageInfo.stationType)
                                gage['properties'].StationType = gageInfo.stationType;
                        }, function (error) {
                        }).finally(function () {
                        });
                        _this.getNWISPeriodOfRecord(gage);
                    });
                if (this.selectedReferenceGage && !selectedGageDone) {
                    var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + this.selectedReferenceGage.StationID;
                    var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                    this.Execute(request).then(function (response) {
                        var gageInfo = response.data;
                        if (gageInfo.hasOwnProperty('statistics')) {
                            var hasFlowDurationStats = false;
                            gageInfo.statistics.forEach(function (stat) {
                                if (stat['statisticGroupType'].code == 'FDS')
                                    hasFlowDurationStats = true;
                            });
                            _this.selectedReferenceGage['properties']['HasFlowDurationStats'] = hasFlowDurationStats;
                        }
                        if (gageInfo.hasOwnProperty('characteristics')) {
                            gageInfo.characteristics.forEach(function (char) {
                                if (char['variableType'].code == 'DRNAREA')
                                    _this.selectedReferenceGage['properties']['DrainageArea'] = char['value'];
                            });
                        }
                    }, function (error) {
                    }).finally(function () {
                    });
                    this.getNWISPeriodOfRecord(this.selectedReferenceGage);
                }
            };
            ExtensionModalController.prototype.getNearestGages = function () {
                var _this = this;
                this.CanContinue = false;
                this.toaster.pop("wait", "Searching for gages", "Please wait...", 0);
                var headers = {
                    "X-Is-Streamstats": true
                };
                var lat = this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toString();
                var long = this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toString();
                var url = configuration.baseurls.GageStatsServices;
                if (this.queryBy == 'Nearest')
                    url += configuration.queryparams.GageStatsServicesNearest.format(lat, long, this.distance);
                if (this.queryBy == 'Network')
                    url += configuration.queryparams.GageStatsServicesNetwork.format(lat, long, this.distance);
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                this.referenceGageList = [];
                this.selectedReferenceGage.StationID = '';
                this.Execute(request).then(function (response) {
                    _this.toaster.clear();
                    _this.CanContinue = true;
                    if (typeof response.data == 'string') {
                        _this.toaster.pop("warning", "Warning", response.data, 0);
                    }
                    else if (response.data.hasOwnProperty('features') && response.data.features.length == 0) {
                        _this.toaster.pop("warning", "Warning", "No stations located within search distance");
                    }
                    else if (response.data.hasOwnProperty('features') && response.data.features.length > 0) {
                        response.data.features.forEach(function (feat) {
                            if (feat.properties.hasOwnProperty('Statistics')) {
                                var hasFlowDurationStats = false;
                                feat.properties.Statistics.forEach(function (stat) {
                                    if (stat['statisticGroupType'].code == 'FDS')
                                        hasFlowDurationStats = true;
                                });
                                feat.properties['HasFlowDurationStats'] = hasFlowDurationStats;
                            }
                            if (feat.properties.hasOwnProperty('Characteristics')) {
                                feat.properties.Characteristics.forEach(function (char) {
                                    if (char['variableType'].code == 'DRNAREA')
                                        feat.properties['DrainageArea'] = char['value'];
                                });
                            }
                            if (feat.properties.code)
                                feat.StationID = feat.properties.code;
                            else if (feat.properties.Code)
                                feat.StationID = feat.properties.Code;
                            _this.getNWISPeriodOfRecord(feat);
                        });
                        _this.referenceGageList = response.data.features;
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
                    _this.CanContinue = true;
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
            ExtensionModalController.prototype.selectGage = function (gage) {
                var sid = this.studyAreaService.selectedStudyAreaExtensions.reduce(function (acc, val) { return acc.concat(val.parameters); }, []).filter(function (f) { return (f.code).toLowerCase() == "sid"; });
                var rg;
                if (gage.properties && gage.properties.Code) {
                    rg = new StreamStats.Models.ReferenceGage(gage.properties.Code, gage.properties.Name);
                    rg.properties = gage.properties;
                }
                else {
                    rg = new StreamStats.Models.ReferenceGage(gage.StationID, gage.Name);
                }
                if (gage.geometry) {
                    rg.Latitude_DD = gage.geometry.coordinates[0];
                    rg.Longitude_DD = gage.geometry.coordinates[1];
                }
                sid[0].options = this.referenceGageList;
                sid[0].value = rg;
                this.selectedReferenceGage = rg;
                this.studyAreaService.selectedGage = rg;
            };
            ExtensionModalController.prototype.getStyling = function (gage) {
                if (gage.StationID == this.selectedReferenceGage.StationID)
                    return { 'background-color': '#ebf0f5' };
                else
                    return { 'background-color': 'unset' };
            };
            ExtensionModalController.prototype.getNWISPeriodOfRecord = function (gage) {
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
                }, function (error) {
                }).finally(function () {
                });
            };
            ExtensionModalController.prototype.checkPeriodOfRecord = function (gage) {
                if (!this.dateRange.dates && gage.hasOwnProperty('SelectEnabled'))
                    return gage['SelectEnabled'];
                if (this.dateRange.dates.startDate >= this.addDay(gage['StartDate'], 1) && this.addDay(gage['EndDate'], 1) >= this.dateRange.dates.endDate)
                    gage['SelectEnabled'] = true;
                else {
                    gage['SelectEnabled'] = false;
                }
                return gage['SelectEnabled'];
            };
            ExtensionModalController.prototype.getNWISDailyValues = function () {
                var _this = this;
                if (!this.referenceGageList)
                    return;
                var start = this.dateRange.dates.startDate.toISOString();
                start = start.substr(0, start.indexOf('T'));
                var end = this.dateRange.dates.endDate.toISOString();
                end = end.substr(0, end.indexOf('T'));
                this.referenceGageList.forEach(function (gage) {
                    gage['HasZeroFlows'] = undefined;
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
            ExtensionModalController.prototype.checkCorrelation = function () {
                if (this.referenceGageList)
                    return this.referenceGageList.some(function (g) { return g.hasOwnProperty('correlation'); });
                else
                    return false;
            };
            ExtensionModalController.prototype.getDrainageArea = function () {
                var drainageArea = this.studyAreaService.studyAreaParameterList.filter(function (p) { return p.code.toLowerCase() == 'drnarea'; })[0];
                if (drainageArea && drainageArea.hasOwnProperty('value'))
                    return drainageArea.value;
                else
                    return 'N/A';
            };
            ExtensionModalController.$inject = ['$scope', '$analytics', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.StudyAreaService', 'WiM.Event.EventManager', '$http', 'toaster'];
            return ExtensionModalController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.ExtensionModalController', ExtensionModalController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
