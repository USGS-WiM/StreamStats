var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
                var _this = _super.call(this, $http, configuration.baseurls.StreamStats) || this;
                _this.showPreferred = false;
                _this.multiselectOptions = {
                    displayProp: 'name'
                };
                $scope.vm = _this;
                _this.modalInstance = modal;
                _this.modalService = modalService;
                _this.init();
                _this.selectedStatisticGroups = [];
                _this.showPreferred = false;
                return _this;
            }
            GagePageController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            GagePageController.prototype.getGagePage = function () {
                var _this = this;
                this.gage = new GageInfo(this.modalService.modalOptions.siteid);
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + this.gage.code;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    _this.gage = response.data;
                    _this.gage.lat = response.data.location.coordinates[1];
                    _this.gage.lng = response.data.location.coordinates[0];
                    _this.gage.statisticsgroups = [];
                    _this.gage.citations = [];
                    _this.getStationCharacteristics(response.data.characteristics);
                    _this.getStationStatistics(response.data.statistics);
                    _this.getNWISInfo();
                }, function (error) {
                }).finally(function () {
                });
            };
            GagePageController.prototype.setPreferred = function (pref) {
                this.showPreferred = pref;
            };
            GagePageController.prototype.getStationCharacteristics = function (characteristics) {
                var _this = this;
                characteristics.forEach(function (char, index) {
                    var characteristic = char;
                    if (char.hasOwnProperty('citation') && char.citation.id) {
                        if (char.citation && char.citation.citationURL)
                            char.citation.citationURL = char.citation.citationURL.replace('#', '');
                        if (!_this.checkForCitation(char.citation.id)) {
                            _this.gage.citations.push(char.citation);
                        }
                    }
                });
            };
            GagePageController.prototype.checkForCitation = function (id) {
                var found = this.gage.citations.some(function (el) { return el.id === id; });
                return found;
            };
            GagePageController.prototype.getStationStatistics = function (statistics) {
                var _this = this;
                statistics.forEach(function (stat, index) {
                    if (stat.hasOwnProperty('citation') && stat.citation.id) {
                        if (stat.citation && stat.citation.citationURL)
                            stat.citation.citationURL = stat.citation.citationURL.replace('#', '');
                        if (!_this.checkForCitation(stat.citation.id)) {
                            _this.gage.citations.push(stat.citation);
                        }
                    }
                    if (!_this.checkForStatisticGroup(stat.statisticGroupTypeID)) {
                        if (stat.hasOwnProperty('statisticGroupType')) {
                            var statgroup = stat.statisticGroupType;
                            _this.gage.statisticsgroups.push(statgroup);
                        }
                        else {
                            _this.getStatGroup(stat.statisticGroupTypeID);
                        }
                    }
                });
            };
            GagePageController.prototype.getStatGroup = function (id) {
                var _this = this;
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStatGroups + id;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    if (!_this.checkForStatisticGroup(response.data.id))
                        _this.gage.statisticsgroups.push(response.data);
                });
            };
            GagePageController.prototype.checkForStatisticGroup = function (id) {
                var found = this.gage.statisticsgroups.some(function (el) { return el.id === id; });
                return found;
            };
            GagePageController.prototype.checkForPredInt = function (statGroupID) {
                var found = this.gage.statistics.some(function (el) { return el.statisticGroupTypeID == statGroupID && el.hasOwnProperty('predictionInterval'); });
                return found;
            };
            GagePageController.prototype.getNWISInfo = function () {
                var _this = this;
                var url = configuration.baseurls.NWISurl + configuration.queryparams.NWISsiteinfo + this.gage.code;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    var regex = /[+-]?((\d+(\.\d*)?)|(\.\d+))/g;
                    var latLong = response.data.split(_this.gage.name)[1].match(regex);
                    _this.NWISlat = latLong[0];
                    _this.NWISlng = latLong[1];
                });
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
