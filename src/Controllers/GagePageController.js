var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
                this.siteid = sid;
            }
            return GageInfo;
        }());
        var GageCharacteristic = (function () {
            function GageCharacteristic() {
            }
            return GageCharacteristic;
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
        var GagePageController = (function (_super) {
            __extends(GagePageController, _super);
            function GagePageController($scope, $http, modalService, modal) {
                var _this = _super.call(this, $http, configuration.baseurls.StreamStats) || this;
                $scope.vm = _this;
                _this.modalInstance = modal;
                _this.modalService = modalService;
                _this.init();
                return _this;
            }
            GagePageController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            GagePageController.prototype.getGagePage = function () {
                var _this = this;
                this.gage = new GageInfo(this.modalService.modalOptions.siteid);
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + this.gage.siteid;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    _this.gage.sitename = response.data.name;
                    _this.gage.lat = response.data.location.coordinates[1];
                    _this.gage.lng = response.data.location.coordinates[0];
                    _this.gage.isRegulated = response.data.isRegulated;
                    _this.gage.characteristics = [];
                    _this.gage.statisticsgroups = [];
                    _this.gage.citations = [];
                    _this.getStationType(response.data.stationTypeID);
                    _this.getStationAgency(response.data.agencyID);
                    _this.getStationCharacteristics(response.data.characteristics);
                    _this.getStationStatistics(response.data.statistics);
                    console.log('gage info:', _this.gage);
                }, function (error) {
                }).finally(function () {
                });
            };
            GagePageController.prototype.getStationType = function (id) {
                var _this = this;
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStationTypes + id;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    _this.gage.stationtype = response.data.name;
                });
            };
            GagePageController.prototype.getUnit = function (id, statistic) {
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesUnits + id;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    statistic.units = response.data.name;
                });
            };
            GagePageController.prototype.getStationAgency = function (id) {
                var _this = this;
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesAgencies + id;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    _this.gage.agency = response.data.name;
                });
            };
            GagePageController.prototype.getStationCharacteristics = function (characteristics) {
                var _this = this;
                characteristics.forEach(function (char, index) {
                    var characteristic = new GageCharacteristic;
                    characteristic.comments = char.comments;
                    characteristic.value = char.value;
                    if (char.hasOwnProperty('citation') && char.citation.id) {
                        characteristic.citationID = char.citation.id;
                        if (!_this.checkForCitation(char.citation.id)) {
                            _this.gage.citations.push(char.citation);
                        }
                    }
                    else {
                        if (char.citationID) {
                            characteristic.citationID = char.citationID;
                        }
                    }
                    var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesCharacteristics + char.id;
                    var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                    _this.Execute(request).then(function (response) {
                        characteristic.name = response.data.variableType.name;
                        characteristic.units = response.data.unitType.name;
                        _this.gage.characteristics.push(characteristic);
                    });
                });
            };
            GagePageController.prototype.checkForCitation = function (id) {
                var found = this.gage.citations.some(function (el) { return el.id === id; });
                return found;
            };
            GagePageController.prototype.getCitation = function (id) {
                var _this = this;
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesCitations + id;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    console.log('get citation response:', response.data);
                    if (response.data.title && response.data.title.length !== 0) {
                        var citation = new Citation;
                        citation.id = response.data.id;
                        citation.title = response.data.title;
                        citation.author = response.data.author;
                        citation.url = response.data.citationURL;
                        var found = _this.gage.citations.some(function (el) { return el.id === citation.id; });
                        if (!found)
                            _this.gage.citations.push(citation);
                    }
                });
            };
            GagePageController.prototype.getStationStatistics = function (statistics) {
                var _this = this;
                statistics.forEach(function (stat, index) {
                    var statistic = new GageStatistic;
                    statistic.comments = stat.comments;
                    statistic.isPreferred = stat.isPreffered;
                    statistic.value = stat.value;
                    statistic.yearsofRecord = stat.yearsofRecord;
                    if (stat.hasOwnProperty('citation') && stat.citation.id) {
                        statistic.citationID = stat.citation.id;
                        if (!_this.checkForCitation(stat.citation.id)) {
                            _this.gage.citations.push(stat.citation);
                        }
                    }
                    else {
                        if (stat.citationID) {
                            statistic.citationID = stat.citationID;
                        }
                    }
                    var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStatistics + stat.id;
                    var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                    _this.Execute(request).then(function (response) {
                        statistic.name = response.data.regressionType.name;
                        _this.getUnit(response.data.unitTypeID, statistic);
                        if (!_this.checkForStatisticGroup(response.data.statisticGroupType.id)) {
                            var statgroup = response.data.statisticGroupType;
                            statgroup.statistics = [statistic];
                            _this.gage.statisticsgroups.push(statgroup);
                        }
                        else {
                            _this.gage.statisticsgroups.forEach(function (sg, index) {
                                if (sg.id === response.data.statisticGroupTypeID) {
                                    sg.statistics.push(statistic);
                                }
                            });
                        }
                    });
                });
            };
            GagePageController.prototype.checkForStatisticGroup = function (id) {
                var found = this.gage.statisticsgroups.some(function (el) { return el.id === id; });
                return found;
            };
            GagePageController.prototype.init = function () {
                this.AppVersion = configuration.version;
                this.getGagePage();
            };
            GagePageController.$inject = ['$scope', '$http', 'StreamStats.Services.ModalService', '$modalInstance'];
            return GagePageController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.GagePageController', GagePageController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
