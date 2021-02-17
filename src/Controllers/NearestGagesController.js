//------------------------------------------------------------------------------
//----- NearestGages ---------------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
        })();
        var GageCharacteristic = (function () {
            function GageCharacteristic() {
            }
            return GageCharacteristic;
        })();
        var UnitType = (function () {
            function UnitType() {
            }
            return UnitType;
        })();
        var VariableType = (function () {
            function VariableType() {
            }
            return VariableType;
        })();
        var Citation = (function () {
            function Citation() {
            }
            return Citation;
        })();
        var GageStatisticGroup = (function () {
            function GageStatisticGroup() {
            }
            return GageStatisticGroup;
        })();
        var GageStatistic = (function () {
            function GageStatistic() {
            }
            return GageStatistic;
        })();
        var PredictionInterval = (function () {
            function PredictionInterval() {
            }
            return PredictionInterval;
        })();
        var StationType = (function () {
            function StationType() {
            }
            return StationType;
        })();
        var Agency = (function () {
            function Agency() {
            }
            return Agency;
        })();
        var RegressionType = (function () {
            function RegressionType() {
            }
            return RegressionType;
        })();
        var NearestGagesController = (function (_super) {
            __extends(NearestGagesController, _super);
            function NearestGagesController($scope, toaster, $http, modalService, modal, studyArea) {
                _super.call(this, $http, configuration.baseurls.StreamStats);
                this.showPreferred = false;
                this.multiselectOptions = {
                    displayProp: 'name'
                };
                this.queryBy = 'Nearest';
                this.distance = 10;
                this.nearbyGages = [];
                $scope.vm = this;
                this.modalInstance = modal;
                this.modalService = modalService;
                this.init();
                this.selectedStatisticGroups = [];
                this.showPreferred = false;
                this.studyAreaService = studyArea;
                this.toaster = toaster;
            }
            NearestGagesController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            NearestGagesController.prototype.getNearestGages = function () {
                var _this = this;
                this.toaster.pop("wait", "Searching for gages", "Please wait...", 0);
                var headers = {
                    "X-Is-Streamstats": true
                };
                var lat = this.studyAreaService.selectedStudyArea ? this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toString() : '41.50459213282905';
                var long = this.studyAreaService.selectedStudyArea ? this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toString() : '-88.30548763275146';
                var url = configuration.baseurls.GageStatsServices;
                if (this.queryBy == 'Nearest')
                    url += configuration.queryparams.GageStatsServicesNearest.format(lat, long, this.distance);
                if (this.queryBy == 'Network')
                    url += configuration.queryparams.GageStatsServicesNetwork.format(lat, long, this.distance);
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                this.nearbyGages = [];
                this.Execute(request).then(function (response) {
                    console.log(response.data);
                    _this.toaster.clear();
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
                        });
                        _this.nearbyGages = response.data.features;
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
            NearestGagesController.prototype.selectGage = function (gage) {
                if (this.studyAreaService.doSelectNearestGage) {
                    this.Close();
                    this.studyAreaService.selectGage(gage);
                }
            };
            NearestGagesController.prototype.openGagePage = function (siteid) {
                console.log('gage page id:', siteid);
                this.modalService.openModal(StreamStats.Services.SSModalType.e_gagepage, { 'siteid': siteid });
            };
            NearestGagesController.prototype.init = function () {
                this.AppVersion = configuration.version;
            };
            NearestGagesController.$inject = ['$scope', 'toaster', '$http', 'StreamStats.Services.ModalService', '$modalInstance', 'StreamStats.Services.StudyAreaService'];
            return NearestGagesController;
        })(WiM.Services.HTTPServiceBase);
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.NearestGagesController', NearestGagesController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
