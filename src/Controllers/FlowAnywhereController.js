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
        var FlowAnywhereController = (function (_super) {
            __extends(FlowAnywhereController, _super);
            function FlowAnywhereController($scope, $analytics, modal, modalservice, studyArea, events, $http, toaster) {
                var _this = _super.call(this, $http, configuration.baseurls.StreamStats) || this;
                _this.events = events;
                _this.isBusy = false;
                _this.selectedReferenceGage = null;
                $scope.vm = _this;
                _this.angulartics = $analytics;
                _this.modalInstance = modal;
                _this.studyAreaService = studyArea;
                _this.modalService = modalservice;
                _this.eventManager = events;
                _this.toaster = toaster;
                _this.init();
                _this.load();
                return _this;
            }
            FlowAnywhereController.prototype.close = function () {
                this.modalInstance.dismiss('cancel');
            };
            FlowAnywhereController.prototype.ok = function () {
                var errorMessage = this.verifyExtensionCanContinue();
                if (!errorMessage) {
                    this.close();
                    this.studyAreaService.flowAnywhereData = {};
                    this.studyAreaService.flowAnywhereData.dateRange = this.dateRange;
                    this.studyAreaService.flowAnywhereData.selectedGage = this.selectedReferenceGage;
                    this.toaster.pop('success', "Flow Anywhere Method was successfully configured", "Please continue", 5000);
                }
                else {
                    this.toaster.pop('error', "Error", errorMessage, 0);
                }
            };
            FlowAnywhereController.prototype.init = function () {
                var _this = this;
                this.referenceGageList = [];
                var lat = this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toString();
                var lon = this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toString();
                var url = configuration.baseurls.FlowAnywhereMapServices + configuration.queryparams.FlowAnywhereGages.format(lon, lat);
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    response.data.features.forEach(function (gage) {
                        _this.gage = new StreamStats.Models.ReferenceGage(gage.attributes["reference_gages.site_id"], gage.attributes["reference_gages.site_name"]);
                        _this.gage.DrainageArea_sqMI = gage.attributes["reference_gages.da_gis_mi2"];
                        _this.gage.Latitude_DD = gage.attributes["reference_gages.lat_dd_nad"];
                        _this.gage.Longitude_DD = gage.attributes["reference_gages.long_dd_na"];
                        _this.gage.AggregatedRegion = gage.attributes["regions_local.Region_Agg"];
                        _this.getNWISPeriodOfRecord(_this.gage);
                        _this.referenceGageList.push(_this.gage);
                    });
                }, function (error) {
                    _this.toaster.clear();
                    _this.isBusy = false;
                    console.log(error);
                }).finally(function () {
                });
                this.dateRange = { dates: { startDate: this.addDay(new Date(), -32), endDate: this.addDay(new Date(), -2) }, minDate: new Date(1900, 1, 1), maxDate: this.addDay(new Date(), -1) };
            };
            FlowAnywhereController.prototype.load = function () {
                if (this.getDrainageArea() == 'N/A' && !this.studyAreaService.loadingDrainageArea)
                    this.studyAreaService.loadDrainageArea();
                if (this.studyAreaService.flowAnywhereData) {
                    if (this.studyAreaService.flowAnywhereData.selectedGage) {
                        this.selectedReferenceGage = this.studyAreaService.flowAnywhereData.selectedGage;
                    }
                    if (this.studyAreaService.flowAnywhereData.dateRange) {
                        this.dateRange = this.studyAreaService.flowAnywhereData.dateRange;
                    }
                }
            };
            FlowAnywhereController.prototype.verifyExtensionCanContinue = function () {
                if (!this.selectedReferenceGage) {
                    return "A reference gage must be selected.";
                }
                if (this.selectedReferenceGage.StationID == "") {
                    return "A reference gage must be selected.";
                }
                if (this.dateRange) {
                    if (!((this.dateRange.dates.startDate <= this.dateRange.maxDate || this.dateRange.dates.endDate <= this.dateRange.maxDate) &&
                        (this.dateRange.dates.startDate >= this.dateRange.minDate || this.dateRange.dates.endDate >= this.dateRange.minDate) &&
                        (this.dateRange.dates.startDate <= this.dateRange.dates.endDate))) {
                        return "Date range is not valid.";
                    }
                }
                if (this.selectedReferenceGage.StartDate > this.dateRange.dates.startDate) {
                    return "The selected start date is not valid for the selected reference gage.";
                }
                if (this.selectedReferenceGage.EndDate < this.dateRange.dates.endDate) {
                    return "The selected end date is not valid for the selected reference gage.";
                }
                return null;
            };
            FlowAnywhereController.prototype.addDay = function (d, days) {
                try {
                    var dayAsTime = 1000 * 60 * 60 * 24;
                    return new Date(d.getTime() + days * dayAsTime);
                }
                catch (e) {
                    return d;
                }
            };
            FlowAnywhereController.prototype.openGagePage = function (siteid) {
                console.log('gage page id:', siteid);
                this.modalService.openModal(StreamStats.Services.SSModalType.e_gagepage, { 'siteid': siteid });
            };
            FlowAnywhereController.prototype.selectGage = function (gage) {
                this.selectedReferenceGage = gage;
            };
            FlowAnywhereController.prototype.getStyling = function (gage) {
                if (this.selectedReferenceGage && gage.StationID == this.selectedReferenceGage.StationID)
                    return { 'background-color': '#FFF' };
                else
                    return { 'background-color': 'unset' };
            };
            FlowAnywhereController.prototype.getNWISPeriodOfRecord = function (gage) {
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
            FlowAnywhereController.prototype.getDrainageArea = function () {
                var drainageArea = this.studyAreaService.studyAreaParameterList.filter(function (p) { return p.code.toLowerCase() == 'drnarea'; })[0];
                if (drainageArea && drainageArea.hasOwnProperty('value'))
                    return drainageArea.value;
                else
                    return 'N/A';
            };
            FlowAnywhereController.$inject = ['$scope', '$analytics', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.StudyAreaService', 'WiM.Event.EventManager', '$http', 'toaster'];
            return FlowAnywhereController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.FlowAnywhereController', FlowAnywhereController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
