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
        var SCStormRunoffReportable = (function () {
            function SCStormRunoffReportable() {
                this.SyntheticUrbanHydrograph = { Graph: {}, Table: {}, PeakQ: {}, Infiltration: {}, ExcessPrecip: {} };
                this.BohmanRural1989 = { Graph: {}, Table: {}, PeakQ: {}, Infiltration: {}, ExcessPrecip: {} };
                this.BohmanUrban1992 = { Graph: {}, Table: {}, PeakQ: {}, Infiltration: {}, ExcessPrecip: {} };
            }
            return SCStormRunoffReportable;
        }());
        var SCStormRunoffController = (function (_super) {
            __extends(SCStormRunoffController, _super);
            function SCStormRunoffController($scope, $analytics, toaster, $http, studyAreaService, modal, $timeout, EventManager) {
                var _this = _super.call(this, $http, configuration.baseurls.StormRunoffServices) || this;
                _this.$timeout = $timeout;
                _this.EventManager = EventManager;
                _this.AEPOptions = [{
                        "name": "50%",
                        "value": 50
                    }, {
                        "name": "20%",
                        "value": 20
                    }, {
                        "name": "10%",
                        "value": 10
                    }, {
                        "name": "4%",
                        "value": 4
                    }, {
                        "name": "2%",
                        "value": 2
                    }, {
                        "name": "1%",
                        "value": 1
                    }, {
                        "name": ".5%",
                        "value": 0.5
                    }, {
                        "name": ".2%",
                        "value": 0.2
                    }];
                $scope.vm = _this;
                _this.angulartics = $analytics;
                _this.toaster = toaster;
                _this.modalInstance = modal;
                _this.StudyArea = studyAreaService.selectedStudyArea;
                _this.studyAreaService = studyAreaService;
                _this.init();
                _this.print = function () {
                    window.print();
                };
                return _this;
            }
            Object.defineProperty(SCStormRunoffController.prototype, "SelectedAEP", {
                get: function () {
                    return this._selectedAEP;
                },
                set: function (val) {
                    this._selectedAEP = val;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(SCStormRunoffController.prototype, "SelectedTab", {
                get: function () {
                    return this._selectedTab;
                },
                set: function (val) {
                    if (this._selectedTab != val) {
                        this._selectedTab = val;
                        this.selectRunoffType();
                    }
                },
                enumerable: false,
                configurable: true
            });
            SCStormRunoffController.prototype.GetStormRunoffResults = function (statisticGroup) {
                console.log('in GetStormRunoffResults');
                console.log(statisticGroup);
                var data = [{
                        "id": 31,
                        "name": "Urban Peak-Flow Statistics",
                        "code": "UPFS",
                        "defType": "FS",
                        "statisticGroupName": "Urban Peak-Flow Statistics",
                        "statisticGroupID": "31",
                        "regressionRegions": statisticGroup[0].regressionRegions
                    }];
                console.log(data);
                this.CanContinue = true;
            };
            SCStormRunoffController.prototype.addParameterValues = function (statisticGroup) {
                var _this = this;
                console.log('in calc additional parameters');
                var parameterList = [];
                statisticGroup[0].regressionRegions.forEach(function (regressionRegion) {
                    regressionRegion.parameters.forEach(function (regressionParam) {
                        parameterList.push(regressionParam.code);
                    });
                });
                parameterList = parameterList.filter(function (element, i) { return i === parameterList.indexOf(element); });
                try {
                    var workspaceID = this.studyAreaService.selectedStudyArea.WorkspaceID;
                    var regionID = this.studyAreaService.selectedStudyArea.RegionID;
                    var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(regionID, workspaceID, parameterList.join(','));
                    var request = new WiM.Services.Helpers.RequestInfo(url, true);
                    request.withCredentials = true;
                    this.Execute(request).then(function (response) {
                        if (response.data.parameters && response.data.parameters.length > 0) {
                            _this.toaster.clear();
                            var paramErrors = false;
                            angular.forEach(response.data.parameters, function (parameter) {
                                if (!parameter.hasOwnProperty('value') || parameter.value == -999) {
                                    paramErrors = true;
                                    console.error('Parameter failed to compute: ', parameter.code);
                                    parameter.loaded = false;
                                }
                                else {
                                    parameter.loaded = true;
                                }
                            });
                            if (paramErrors) {
                                _this.toaster.pop('error', "Error", "Parameter failed to compute", 0);
                            }
                            statisticGroup[0].regressionRegions.forEach(function (regressionRegion) {
                                regressionRegion.parameters.forEach(function (regressionParam) {
                                    response.data.parameters.forEach(function (param) {
                                        if (regressionParam.code.toLowerCase() == param.code.toLowerCase()) {
                                            regressionParam.value = param['value'];
                                        }
                                    });
                                });
                            });
                            _this.GetStormRunoffResults(statisticGroup);
                        }
                    }, function (error) {
                        _this.toaster.clear();
                        _this.toaster.pop("error", "There was an HTTP error calculating parameters", "Please retry", 0);
                    }).finally(function () {
                        _this.CanContinue = true;
                        _this.hideAlerts = true;
                        console.log('done calc additional parameters');
                    });
                }
                catch (e) {
                    this.toaster.pop('error', "There was an error calculating parameters", "", 0);
                }
            };
            SCStormRunoffController.prototype.loadParametersByStatisticsGroup = function (regressionregions, percentWeights) {
                var _this = this;
                console.log('in loadParametersByStatisticsGroup');
                var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupParameterLookup'];
                url = url.format('SC', 31, regressionregions);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    if (response.data[0].regressionRegions[0].parameters && response.data[0].regressionRegions[0].parameters.length > 0) {
                        response.data[0].regressionRegions.forEach(function (regressionRegion) {
                            if (percentWeights.length > 0) {
                                percentWeights.forEach(function (regressionRegionPercentWeight) {
                                    if (regressionRegionPercentWeight.code.indexOf(regressionRegion.code.toUpperCase()) > -1) {
                                        regressionRegion["percentWeight"] = regressionRegionPercentWeight.percentWeight;
                                    }
                                });
                            }
                        });
                        _this.addParameterValues(response.data);
                    }
                }, function (error) {
                    _this.toaster.clear();
                    _this.toaster.pop('error', "There was an error Loading Parameters by Statistics Group", "Please retry", 0);
                }).finally(function () {
                });
            };
            SCStormRunoffController.prototype.queryRegressionRegions = function () {
                var _this = this;
                this.CanContinue = false;
                console.log('in queryRegressionRegions');
                var headers = {
                    "Content-Type": "application/json",
                    "X-Is-StreamStats": true
                };
                var url = configuration.baseurls['NSS'] + configuration.queryparams['RegressionRegionQueryService'];
                var studyArea = this.studyAreaService.simplify(angular.fromJson(angular.toJson(this.studyAreaService.selectedStudyArea.FeatureCollection.features.filter(function (f) { return (f.id).toLowerCase() == "globalwatershed"; })[0])));
                var studyAreaGeom = studyArea.geometry;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, "json", angular.toJson(studyAreaGeom), headers);
                this.Execute(request).then(function (response) {
                    if (response.data.error) {
                        _this.toaster.pop('error', "There was an error querying regression regions", response.data.error.message, 0);
                    }
                    if (response.data.length == 0) {
                        _this.toaster.pop('error', "No regression regions were returned", "Regression based scenario computation not allowed", 0);
                    }
                    if (response.data.length > 0) {
                        response.data.forEach(function (p) { p.code = p.code.toUpperCase().split(","); });
                        _this.loadParametersByStatisticsGroup(response.data.map(function (elem) {
                            return elem.code;
                        }).join(","), response.data);
                    }
                }, function (error) {
                    _this.toaster.pop('error', "There was an HTTP error querying Regression regions", "Please retry", 0);
                }).finally(function () {
                });
            };
            SCStormRunoffController.prototype.CalculateParameters = function (parameters) {
                var _this = this;
                console.log('in CalculateParameters');
                try {
                    this.toaster.pop("wait", "Calculating Missing Parameters", "Please wait...", 0);
                    this.parameters = parameters;
                    this.CanContinue = false;
                    var workspaceID = this.studyAreaService.selectedStudyArea.WorkspaceID;
                    var regionID = this.studyAreaService.selectedStudyArea.RegionID;
                    var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(regionID, workspaceID, parameters);
                    var request = new WiM.Services.Helpers.RequestInfo(url, true);
                    request.withCredentials = true;
                    this.Execute(request).then(function (response) {
                        if (response.data.parameters && response.data.parameters.length > 0) {
                            _this.toaster.clear();
                            var paramErrors = false;
                            angular.forEach(response.data.parameters, function (parameter) {
                                if (!parameter.hasOwnProperty('value') || parameter.value == -999) {
                                    paramErrors = true;
                                    console.error('Parameter failed to compute: ', parameter.code);
                                    parameter.loaded = false;
                                }
                                else {
                                    parameter.loaded = true;
                                }
                            });
                            if (paramErrors) {
                                _this.toaster.pop('error', "Error", "Parameter failed to compute", 0);
                            }
                            response.data.parameters.forEach(function (param) {
                                if (param.code.toLowerCase() == 'drnarea')
                                    _this.drainageArea = param.value;
                                if (param.code.toLowerCase() == 'csl10_85fm')
                                    _this.mainChannelSlope = param.value;
                                if (param.code.toLowerCase() == 'lc06imp')
                                    _this.totalImperviousArea = param.value;
                                if (param.code.toLowerCase() == 'lfplength')
                                    _this.mainChannelLength = param.value;
                            });
                            console.log('done calc parameters');
                        }
                    }, function (error) {
                        _this.toaster.clear();
                        _this.toaster.pop("error", "There was an HTTP error calculating parameters", "Please retry", 0);
                    }).finally(function () {
                        _this.CanContinue = true;
                        _this.hideAlerts = true;
                    });
                }
                catch (e) {
                    this.toaster.pop('error', "There was an error calculating parameters", "", 0);
                }
            };
            SCStormRunoffController.prototype.validateForm = function (mainForm) {
                if (mainForm.$valid) {
                    return true;
                }
                else {
                    this.showResults = false;
                    this.hideAlerts = false;
                    return false;
                }
            };
            SCStormRunoffController.prototype.ClearResults = function () {
                for (var i in this.studyAreaService.studyAreaParameterList) {
                    this.studyAreaService.studyAreaParameterList[i].value = null;
                }
                this.SelectedAEP = this.AEPOptions[0];
                this.SelectedAEP = null;
                this.drainageArea = null;
                this.mainChannelLength = null;
                this.mainChannelSlope = null;
                this.totalImperviousArea = null;
                this.SelectedAEP = { "name": "50%", "value": 50 };
                this.showResults = false;
            };
            SCStormRunoffController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            SCStormRunoffController.prototype.Reset = function () {
                this.init();
            };
            SCStormRunoffController.prototype.downloadCSV = function () {
            };
            SCStormRunoffController.prototype.loadGraphData = function () {
            };
            SCStormRunoffController.prototype.GetTableData = function () {
            };
            SCStormRunoffController.prototype.init = function () {
                this.SelectedTab = SCStormRunoffType.BohmanRural1989;
                this.showResults = false;
                this.hideAlerts = false;
                this.CanContinue = true;
                this.SelectedAEP = { "name": "50%", "value": 50 };
            };
            SCStormRunoffController.prototype.selectRunoffType = function () {
                switch (this._selectedTab) {
                    case SCStormRunoffType.BohmanRural1989:
                        break;
                    case SCStormRunoffType.BohmanUrban1992:
                        break;
                    default:
                        break;
                }
            };
            SCStormRunoffController.prototype.tableToCSV = function ($table) {
            };
            SCStormRunoffController.$inject = ['$scope', '$analytics', 'toaster', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance', '$timeout', 'WiM.Event.EventManager'];
            return SCStormRunoffController;
        }(WiM.Services.HTTPServiceBase));
        var SCStormRunoffType;
        (function (SCStormRunoffType) {
            SCStormRunoffType[SCStormRunoffType["BohmanRural1989"] = 1] = "BohmanRural1989";
            SCStormRunoffType[SCStormRunoffType["BohmanUrban1992"] = 2] = "BohmanUrban1992";
            SCStormRunoffType[SCStormRunoffType["SyntheticUrbanHydrograph"] = 3] = "SyntheticUrbanHydrograph";
        })(SCStormRunoffType || (SCStormRunoffType = {}));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.SCStormRunoffController', SCStormRunoffController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
