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
                this.SyntheticUrbanHydrograph = { Graph: {}, WeightedRunoff: null };
                this.BohmanRural1989 = { Graph: {}, WeightedRunoff: null };
                this.BohmanUrban1992 = { Graph: {}, WeightedRunoff: null };
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
                _this.AEPOptionsSynthetic = [{
                        "name": "10% / 10 Year Return Period",
                        "value": 10
                    }, {
                        "name": "4% / 25 Year Return Period",
                        "value": 4
                    }, {
                        "name": "2% / 50 Year Return Period",
                        "value": 2
                    }, {
                        "name": "1% / 100 Year Return Period",
                        "value": 1
                    }];
                _this.StandardCurveOptions = [{
                        "name": "Area-Weighted Curve Number",
                        "value": 1,
                        "endpointValue": "area"
                    }, {
                        "name": "Runoff-Weighted Curve Number",
                        "value": 2,
                        "endpointValue": "runoff"
                    }];
                _this.CNModificationOptions = [{
                        "name": "McCuen",
                        "value": 1
                    }, {
                        "name": "Merkel",
                        "value": 2
                    }];
                _this.TimeOfConcentrationOptions = [{
                        "name": "Travel Time Method",
                        "value": 1,
                        "endpointValue": "traveltime"
                    }, {
                        "name": "Lag Time Equation",
                        "value": 2,
                        "endpointValue": "lagtime"
                    }];
                _this.RainfallDistributionOptions = [{
                        "name": "Type II",
                        "value": 2,
                    }, {
                        "name": "Type III",
                        "value": 3,
                    }, {
                        "name": "NOAA A",
                        "value": 4,
                    }, {
                        "name": "NOAA B",
                        "value": 5,
                    }, {
                        "name": "NOAA C",
                        "value": 6,
                    }, {
                        "name": "NOAA D",
                        "value": 7,
                    }];
                _this.greaterThanZero = /^([0-9]*[1-9][0-9]*(\.[0-9]+)?|[0]+\.[0-9]*[1-9][0-9]*)$/;
                _this.gTZInvalidMessage = "Value must be greater than 0";
                _this.greaterThanOrEqualToZero = /0+|^([0-9]*[1-9][0-9]*(\.[0-9]+)?|[0]+\.[0-9]*[1-9][0-9]*)$/;
                _this.gTOETZInvalidMessage = "Value must be greater than or equal to 0";
                _this.betweenZeroOneHundred = /^(\d{0,2}(\.\d{1,2})?|100(\.00?)?)$/;
                _this._defaultFlowTypes = [
                    {
                        id: "sheetFlow",
                        displayName: "Sheet Flow",
                        accordionOpen: false,
                        questions: [
                            {
                                id: "surface",
                                label: "Surface",
                                type: "select",
                                value: null,
                                options: {
                                    "Smooth asphalt": 0.011,
                                    "Smooth concrete": 0.012,
                                    "Fallow (no residue)": 0.050,
                                    "Short grass prairie": 0.150,
                                    "Dense grasses": 0.240,
                                    "Bermuda grass": 0.410,
                                    "Light underbrush": 0.400,
                                    "Dense underbrush": 0.800,
                                    "Cultivated Soil with Residue cover <=20%": 0.060,
                                    "Cultivated Soil with Residue cover >=20%": 0.170,
                                    "Natural Range": 0.130
                                }
                            },
                            {
                                id: "length",
                                label: "Length (ft)",
                                type: "number",
                                value: null,
                                pattern: "greaterThanZero",
                                invalidMessage: _this.gTZInvalidMessage
                            },
                            {
                                id: "overland",
                                label: "Overland Slope (%)",
                                type: "number",
                                value: null,
                                pattern: "greaterThanOrEqualToZero",
                                invalidMessage: _this.gTOETZInvalidMessage
                            }
                        ],
                    },
                    {
                        id: "excessSheetFlow",
                        displayName: "Excess Sheet Flow",
                        accordionOpen: false,
                        questions: [
                            {
                                id: "surface",
                                label: "Surface",
                                type: "select",
                                value: null,
                                options: {
                                    "Pavement and small upland gullies": 1,
                                    "Grassed waterways": 2,
                                    "Nearly bare and untilled (overland flow)": 3,
                                    "Cultivated straight row crops": 4,
                                    "Short-grass pasture": 5,
                                    "Minimum cultivation, contour or strip-cropped, and woodlands": 6,
                                    "Forest with heavy ground litter and hay meadows": 7
                                }
                            },
                            {
                                id: "slope",
                                label: "Slope (%)",
                                type: "number",
                                value: null,
                                pattern: "greaterThanOrEqualToZero",
                                invalidMessage: _this.gTOETZInvalidMessage
                            }
                        ]
                    },
                    {
                        id: "shallowConcentratedFlow",
                        displayName: "Shallow Concentrated Flow",
                        accordionOpen: false,
                        questions: [
                            {
                                id: "shallowFlowType",
                                label: "Shallow Flow Type",
                                type: "select",
                                value: null,
                                options: {
                                    "Pavement and small upland gullies": 1,
                                    "Grassed waterways": 2,
                                    "Nearly bare and untilled (overland flow)": 3,
                                    "Cultivated straight row crops": 4,
                                    "Short-grass pasture": 5,
                                    "Minimum cultivation, contour or strip-cropped, and woodlands": 6,
                                    "Forest with heavy ground litter and hay meadows": 7
                                }
                            },
                            {
                                id: "length",
                                label: "Length (ft)",
                                type: "number",
                                value: null,
                                pattern: "greaterThanZero",
                                invalidMessage: _this.gTZInvalidMessage
                            },
                            {
                                id: "slope",
                                label: "Slope (%)",
                                type: "number",
                                value: null,
                                pattern: "greaterThanOrEqualToZero",
                                invalidMessage: _this.gTOETZInvalidMessage
                            },
                        ]
                    },
                    {
                        id: "channelizedFlowOpen",
                        displayName: "Channelized Flow - Open Channel",
                        accordionOpen: false,
                        questions: [
                            {
                                id: "baseWidth",
                                label: "Base Width",
                                type: "number",
                                value: null,
                                pattern: "greaterThanZero",
                                invalidMessage: _this.gTZInvalidMessage
                            },
                            {
                                id: "frontSlope",
                                label: "Front Slope (Z hor:1 vert)",
                                type: "number",
                                value: null,
                                pattern: "greaterThanZero",
                                invalidMessage: _this.gTZInvalidMessage
                            },
                            {
                                id: "backSlope",
                                label: "Back Slope (Z hor:1 vert)",
                                type: "number",
                                value: null,
                                pattern: "greaterThanZero",
                                invalidMessage: _this.gTZInvalidMessage
                            },
                            {
                                id: "channelDepth",
                                label: "Channel Depth (ft)",
                                type: "number",
                                value: null,
                                pattern: "greaterThanZero",
                                invalidMessage: _this.gTZInvalidMessage
                            },
                            {
                                id: "length",
                                label: "Length (ft)",
                                type: "number",
                                value: null,
                                pattern: "greaterThanZero",
                                invalidMessage: _this.gTZInvalidMessage
                            },
                            {
                                id: "channelBedSlope",
                                label: "Channel Bed Slope (%)",
                                type: "number",
                                value: null,
                                pattern: "greaterThanZero",
                                invalidMessage: _this.gTZInvalidMessage
                            },
                            {
                                id: "manningNValue",
                                label: "Manning n-value",
                                type: "number",
                                value: null,
                                pattern: "greaterThanZero",
                                invalidMessage: _this.gTZInvalidMessage
                            },
                        ]
                    },
                    {
                        id: "channelizedFlowStorm",
                        displayName: "Channelized Flow - Storm Sewer",
                        accordionOpen: false,
                        questions: [
                            {
                                id: "pipeMaterial",
                                label: "Pipe Material",
                                type: "select",
                                value: null,
                                options: {
                                    "Aluminum": 0.024,
                                    "CMP": 0.024,
                                    "Concrete": 0.013,
                                    "Corrugated HDPE": 0.02,
                                    "PVC": 0.01,
                                    "Steel": 0.013
                                }
                            },
                            {
                                id: "diameter",
                                label: "Diameter (in)",
                                type: "number",
                                value: null,
                                pattern: "greaterThanZero",
                                invalidMessage: _this.gTZInvalidMessage
                            },
                            {
                                id: "length",
                                label: "Length (ft)",
                                type: "number",
                                value: null,
                                pattern: "greaterThanZero",
                                invalidMessage: _this.gTZInvalidMessage
                            },
                            {
                                id: "slope",
                                label: "Slope (%)",
                                type: "number",
                                value: null,
                                pattern: "greaterThanOrEqualToZero",
                                invalidMessage: _this.gTOETZInvalidMessage
                            }
                        ]
                    },
                    {
                        id: "channelizedFlowUserInput",
                        displayName: "Channelized Flow - User Input",
                        accordionOpen: false,
                        questions: [
                            {
                                id: "length",
                                label: "Length (ft)",
                                type: "number",
                                value: null,
                                pattern: "greaterThanZero",
                                invalidMessage: _this.gTZInvalidMessage
                            },
                            {
                                id: "velocity",
                                label: "Velocity (fps)",
                                type: "number",
                                value: null,
                                pattern: "greaterThanZero",
                                invalidMessage: _this.gTZInvalidMessage
                            },
                        ]
                    },
                ];
                _this._defaultFlowSegments = {
                    sheetFlow: [],
                    excessSheetFlow: [],
                    shallowConcentratedFlow: [],
                    channelizedFlowOpen: [],
                    channelizedFlowStorm: [],
                    channelizedFlowUserInput: []
                };
                _this.TravelTimeFlowTypes = _this._defaultFlowTypes.slice();
                _this.TravelTimeFlowSegments = JSON.parse(JSON.stringify(_this._defaultFlowSegments));
                _this.addFlowSegmentOpen = false;
                $scope.vm = _this;
                $scope.greaterThanZero = _this.greaterThanZero;
                $scope.greaterThanOrEqualToZero = _this.greaterThanOrEqualToZero;
                $scope.betweenZeroOneHundred = _this.betweenZeroOneHundred;
                _this.AppVersion = configuration.version;
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
            Object.defineProperty(SCStormRunoffController.prototype, "SelectedAEPSynthetic", {
                get: function () {
                    return this._selectedAEPSynthetic;
                },
                set: function (val) {
                    this._selectedAEPSynthetic = val;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(SCStormRunoffController.prototype, "SelectedStandardCurve", {
                get: function () {
                    return this._selectedStandardCurve;
                },
                set: function (val) {
                    this._selectedStandardCurve = val;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(SCStormRunoffController.prototype, "SelectedCNModification", {
                get: function () {
                    return this._selectedCNModification;
                },
                set: function (val) {
                    this._selectedCNModification = val;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(SCStormRunoffController.prototype, "SelectedTimeOfConcentration", {
                get: function () {
                    return this._selectedTimeOfConcentration;
                },
                set: function (val) {
                    this._selectedTimeOfConcentration = val;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(SCStormRunoffController.prototype, "SelectedRainfallDistribution", {
                get: function () {
                    return this._selectedRainfallDistribution;
                },
                set: function (val) {
                    this._selectedRainfallDistribution = val;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(SCStormRunoffController.prototype, "chosenFlowTypeIndex", {
                get: function () {
                    return this._chosenFlowTypeIndex;
                },
                enumerable: false,
                configurable: true
            });
            SCStormRunoffController.prototype.estimateFlows = function (statisticGroup) {
                var _this = this;
                var data = [{
                        "id": 31,
                        "name": "Urban Peak-Flow Statistics",
                        "code": "UPFS",
                        "defType": "FS",
                        "statisticGroupName": "Urban Peak-Flow Statistics",
                        "statisticGroupID": "31",
                        "regressionRegions": statisticGroup[0].regressionRegions
                    }];
                var url = configuration.baseurls['NSS'] + configuration.queryparams['estimateFlows'].format('SC');
                var request = new WiM.Services.Helpers.RequestInfo(url, true, 1, 'json', JSON.stringify(data));
                this.Execute(request).then(function (response) {
                    if (response.data[0].regressionRegions.length > 0 && response.data[0].regressionRegions[0].results && response.data[0].regressionRegions[0].results.length > 0) {
                        var region3Percent = 0;
                        var region4Percent = 0;
                        var region3AEP = 0;
                        var region4AEP = 0;
                        response.data[0].regressionRegions.forEach(function (regressionregion) {
                            if (regressionregion.code == 'GC1585') {
                                region3Percent = regressionregion.percentWeight;
                                regressionregion.results.forEach(function (result) {
                                    if (result.name.indexOf(_this.SelectedAEP.value) !== -1) {
                                        region3AEP = result.value;
                                    }
                                });
                            }
                            else if (regressionregion.code == 'GC1586') {
                                region4Percent = regressionregion.percentWeight;
                                regressionregion.results.forEach(function (result) {
                                    if (result.name.indexOf(_this.SelectedAEP.value) !== -1) {
                                        region4AEP = result.value;
                                    }
                                });
                            }
                        });
                        var data = {
                            "lat": _this.studyAreaService.selectedStudyArea.Pourpoint.Latitude,
                            "lon": _this.studyAreaService.selectedStudyArea.Pourpoint.Longitude,
                            "region3PercentArea": region3Percent,
                            "region4PercentArea": region4Percent,
                            "region3Qp": region3AEP,
                            "region4Qp": region4AEP,
                            "A": _this.drainageArea,
                            "L": _this.mainChannelLength,
                            "S": _this.mainChannelSlope,
                            "TIA": _this.totalImperviousArea
                        };
                        _this.getStormRunoffResults(data);
                    }
                    else {
                        _this.toaster.clear();
                        _this.toaster.pop('error', "There was an error Estimating Flows", "No results were returned", 0);
                    }
                }, function (error) {
                    _this.toaster.clear();
                    _this.toaster.pop('error', "There was an error Estimating Flows", "HTTP request error", 0);
                }).finally(function () {
                });
            };
            SCStormRunoffController.prototype.getStormRunoffResults = function (data) {
                var _this = this;
                var url = configuration.baseurls['SCStormRunoffServices'] + configuration.queryparams['SCStormRunoffBohman1992'];
                var headers = {
                    "Content-Type": "application/json",
                    "X-warning": true
                };
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', JSON.stringify(data), headers);
                this.Execute(request).then(function (response) {
                    _this.reportData = response.data;
                    _this.ReportData.BohmanUrban1992.Graph = _this.loadGraphData();
                    _this.ReportData.BohmanUrban1992.WeightedRunoff = _this.reportData.weighted_runoff_volume;
                    _this.setGraphOptions();
                    _this.showResults = true;
                    if (response.headers()['x-warning']) {
                        _this.warningMessages = response.headers()['x-warning'];
                    }
                }, function (error) {
                    _this.toaster.pop('error', "Error", error["data"]["detail"], 0);
                }).finally(function () {
                    _this.canContinue = true;
                });
            };
            SCStormRunoffController.prototype.addParameterValues = function (statisticGroup) {
                var _this = this;
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
                            _this.estimateFlows(statisticGroup);
                        }
                    }, function (error) {
                        _this.toaster.clear();
                        _this.toaster.pop("error", "There was an HTTP error calculating parameters", "Please retry", 0);
                    }).finally(function () {
                        _this.canContinue = true;
                        _this.hideAlerts = true;
                    });
                }
                catch (e) {
                    this.toaster.pop('error', "There was an error calculating parameters", "", 0);
                }
            };
            SCStormRunoffController.prototype.loadParametersByStatisticsGroup = function (regressionregions, percentWeights) {
                var _this = this;
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
                this.canContinue = false;
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
            SCStormRunoffController.prototype.calculateParameters = function (parameters) {
                var _this = this;
                try {
                    this.toaster.pop("wait", "Calculating Missing Parameters", "Please wait...", 0);
                    this.parameters = parameters;
                    this.canContinue = false;
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
                        }
                    }, function (error) {
                        _this.toaster.clear();
                        _this.toaster.pop("error", "There was an HTTP error calculating parameters", "Please retry", 0);
                    }).finally(function () {
                        _this.canContinue = true;
                        _this.hideAlerts = true;
                    });
                }
                catch (e) {
                    this.toaster.pop('error', "There was an error calculating parameters", "", 0);
                }
            };
            SCStormRunoffController.prototype.getFormattedFlowSegments = function () {
                var formattedSegments = {
                    sheetFlow: [],
                    excessSheetFlow: [],
                    shallowConcentratedFlow: [],
                    channelizedFlowOpen: [],
                    channelizedFlowStorm: [],
                    channelizedFlowUserInput: []
                };
                var flowKeys = Object.keys(this.TravelTimeFlowSegments);
                for (var _i = 0, flowKeys_1 = flowKeys; _i < flowKeys_1.length; _i++) {
                    var flowSegment = flowKeys_1[_i];
                    var allSegmentsOfType = [];
                    for (var _a = 0, _b = this.TravelTimeFlowSegments[flowSegment]; _a < _b.length; _a++) {
                        var segment = _b[_a];
                        var segmentData = {};
                        for (var _c = 0, segment_1 = segment; _c < segment_1.length; _c++) {
                            var question = segment_1[_c];
                            var value = question.value;
                            if (question.options) {
                                var optionKeys = Object.keys(question.options);
                                for (var _d = 0, optionKeys_1 = optionKeys; _d < optionKeys_1.length; _d++) {
                                    var key = optionKeys_1[_d];
                                    if (value == question.options[key]) {
                                        value = key;
                                        break;
                                    }
                                }
                            }
                            var label = question.label.split(" (")[0];
                            segmentData[label] = value;
                        }
                        allSegmentsOfType.push(segmentData);
                    }
                    formattedSegments[flowSegment] = allSegmentsOfType;
                }
                return formattedSegments;
            };
            SCStormRunoffController.prototype.calculateSyntheticParameters = function (parameters) {
                var _this = this;
                try {
                    this.toaster.pop("wait", "Calculating Missing Parameters", "Please wait...", 0);
                    this.parameters = parameters;
                    var workspaceID = this.studyAreaService.selectedStudyArea.WorkspaceID;
                    var regionID = this.studyAreaService.selectedStudyArea.RegionID;
                    var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(regionID, workspaceID, parameters);
                    var request = new WiM.Services.Helpers.RequestInfo(url, true);
                    request.withCredentials = true;
                    this.Execute(request).then(function (response) {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                        if (response.data.parameters && response.data.parameters.length > 0) {
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
                                var _a, _b;
                                if (param.code.toLowerCase() == 'drnarea')
                                    _this.drainageAreaSynthetic = param.value;
                                if (param.code.toLowerCase() == 'csl10_85fm' && ((_a = _this._selectedTimeOfConcentration) === null || _a === void 0 ? void 0 : _a.value) == 2)
                                    _this.lagTimeLength = param.value;
                                if (param.code.toLowerCase() == 'lfplength' && ((_b = _this._selectedTimeOfConcentration) === null || _b === void 0 ? void 0 : _b.value) == 2)
                                    _this.lagTimeSlope = param.value;
                            });
                            var data = {};
                            var url = "";
                            var headers = {
                                "Content-Type": "application/json",
                                "X-warning": true
                            };
                            var formmatedSegments = _this.getFormattedFlowSegments();
                            data = {
                                "lat": _this.studyAreaService.selectedStudyArea.Pourpoint.Latitude,
                                "lon": _this.studyAreaService.selectedStudyArea.Pourpoint.Longitude,
                                "AEP": (_a = _this._selectedAEPSynthetic) === null || _a === void 0 ? void 0 : _a.value,
                                "curveNumberMethod": (_b = _this._selectedStandardCurve) === null || _b === void 0 ? void 0 : _b.endpointValue,
                                "TcMethod": _this._selectedTimeOfConcentration.endpointValue,
                                "length": ((_c = _this._selectedTimeOfConcentration) === null || _c === void 0 ? void 0 : _c.value) == 2 ? _this.lagTimeLength : null,
                                "slope": ((_d = _this._selectedTimeOfConcentration) === null || _d === void 0 ? void 0 : _d.value) == 2 ? _this.lagTimeSlope : null,
                                "dataSheetFlow": ((_e = _this._selectedTimeOfConcentration) === null || _e === void 0 ? void 0 : _e.value) == 1 ? formmatedSegments.sheetFlow : null,
                                "dataExcessSheetFlow": ((_f = _this._selectedTimeOfConcentration) === null || _f === void 0 ? void 0 : _f.value) == 1 ? formmatedSegments.excessSheetFlow : null,
                                "dataShallowConcentratedFlow": ((_g = _this._selectedTimeOfConcentration) === null || _g === void 0 ? void 0 : _g.value) == 1 ? formmatedSegments.shallowConcentratedFlow : null,
                                "dataChannelizedFlowOpenChannel": ((_h = _this._selectedTimeOfConcentration) === null || _h === void 0 ? void 0 : _h.value) == 1 ? formmatedSegments.channelizedFlowOpen : null,
                                "dataChannelizedFlowStormSewer": ((_j = _this._selectedTimeOfConcentration) === null || _j === void 0 ? void 0 : _j.value) == 1 ? formmatedSegments.channelizedFlowStorm : null,
                                "dataChannelizedFlowStormSewerOrOpenChannelUserInputVelocity": ((_k = _this._selectedTimeOfConcentration) === null || _k === void 0 ? void 0 : _k.value) == 1 ? formmatedSegments.channelizedFlowUserInput : null
                            };
                            url = configuration.baseurls['SCStormRunoffServices'] + configuration.queryparams['SCStormRunoffSyntheticUnitHydrograph'];
                            var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', JSON.stringify(data), headers);
                            _this.Execute(request).then(function (response) {
                                var data = response.data;
                                var keys = Object.keys(data);
                                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                                    var key = keys_1[_i];
                                    if (key == "Ia")
                                        _this.initialAbstraction = response.data.Ia;
                                    if (key == "S")
                                        _this.watershedRetention = response.data.S;
                                    if (key == "curve_number")
                                        _this.standardCurveNumber = response.data.curve_number;
                                    if (key == "peak_rate_factor")
                                        _this.peakRateFactor = response.data.peak_rate_factor;
                                    if (key == "rainfall_distribution_curve_letter") {
                                        for (var _a = 0, _b = _this.RainfallDistributionOptions; _a < _b.length; _a++) {
                                            var option = _b[_a];
                                            if (option.name.indexOf(response.data.rainfall_distribution_curve_letter) == -1) {
                                                _this._selectedRainfallDistribution = option;
                                                break;
                                            }
                                        }
                                    }
                                    if (key == "time_of_concentration")
                                        _this.timeOfConcentrationMin = response.data.time_of_concentration.value;
                                }
                                _this.toaster.clear();
                            }).catch(function (error) {
                                _this.toaster.clear();
                                _this.toaster.pop("error", "There was an HTTP error calculating parameters", "Please retry", 0);
                            });
                        }
                    }, function (error) {
                        _this.toaster.clear();
                        _this.toaster.pop("error", "There was an HTTP error calculating parameters", "Please retry", 0);
                    }).finally(function () {
                        _this.canContinue = true;
                        _this.hideAlerts = true;
                    });
                }
                catch (e) {
                    this.toaster.pop('error', "There was an error calculating parameters", "", 0);
                }
            };
            SCStormRunoffController.prototype.loadGraphData = function () {
                var _this = this;
                var results = [];
                var hydrograph = [];
                hydrograph = this.reportData.time_coordinates.map(function (v, i) { return [v, _this.reportData.discharge_coordinates[i]]; }).map(function (_a) {
                    var x = _a[0], y = _a[1];
                    return ({ x: x, y: y });
                });
                results.push({ values: hydrograph, key: "Discharge (ft³/s)", color: " #009900", type: "line", yAxis: 1 });
                return results;
            };
            SCStormRunoffController.prototype.setGraphOptions = function () {
                this.ReportOptions = {
                    chart: {
                        type: 'multiChart',
                        height: 275,
                        width: 650,
                        margin: {
                            top: 10,
                            right: 80,
                            bottom: 80,
                            left: 90
                        },
                        xAxis: {
                            axisLabel: 'Time, in hours',
                            tickFormat: function (d) {
                                return d.toUSGSvalue();
                            }
                        },
                        yAxis1: {
                            axisLabel: 'Discharge (Q), in ft³/s',
                            tickFormat: function (d) {
                                return d.toUSGSvalue();
                            }
                        }
                    },
                    title: {
                        enable: true,
                        text: 'USGS SC Flood Hydrograph for Urban Watersheds using ' + this.SelectedAEP.name + ' AEP',
                        css: {
                            'font-size': '10pt',
                            'font-weight': 'bold'
                        }
                    }
                };
            };
            SCStormRunoffController.prototype.openAddFlowSegment = function (indexOfFlow) {
                this.addFlowSegmentOpen = true;
                this._chosenFlowTypeIndex = indexOfFlow;
            };
            SCStormRunoffController.prototype.closeAddFlowSegment = function () {
                this.addFlowSegmentOpen = false;
                this._chosenFlowTypeIndex = null;
                this.TravelTimeFlowTypes = this._defaultFlowTypes.slice();
            };
            SCStormRunoffController.prototype.addFlowSegment = function () {
                var questionSet = this.TravelTimeFlowTypes[this._chosenFlowTypeIndex].questions;
                var newSegment = [];
                for (var _i = 0, questionSet_1 = questionSet; _i < questionSet_1.length; _i++) {
                    var question = questionSet_1[_i];
                    newSegment.push(JSON.parse(JSON.stringify(question)));
                    question.value = null;
                }
                this.TravelTimeFlowSegments[this.TravelTimeFlowTypes[this._chosenFlowTypeIndex].id].push(newSegment);
                this._chosenFlowTypeIndex = null;
                this.addFlowSegmentOpen = false;
            };
            SCStormRunoffController.prototype.removeFlowSegment = function (flowTypeID, indexOfRemoval) {
                var flowType = this.TravelTimeFlowSegments[flowTypeID];
                if (!flowType) {
                    console.error("Unable to remove flow segment: improper flow type ID. This is a bug!");
                    return;
                }
                flowType.splice(indexOfRemoval, 1);
            };
            SCStormRunoffController.prototype.calculateSyntheticParamsDisabled = function () {
                var _a;
                if (((_a = this._selectedTimeOfConcentration) === null || _a === void 0 ? void 0 : _a.value) == 1) {
                    var completedAllFlowSegments = this.completedFlowSegments();
                    if (!this._selectedAEPSynthetic || !this._selectedStandardCurve) {
                        if (completedAllFlowSegments) {
                            return 2;
                        }
                        return 3;
                    }
                    if (!completedAllFlowSegments) {
                        return 4;
                    }
                }
                if (!this._selectedAEPSynthetic || !this._selectedStandardCurve || !this._selectedTimeOfConcentration) {
                    return 1;
                }
                return 0;
            };
            SCStormRunoffController.prototype.completedFlowSegments = function () {
                var _a;
                if (((_a = this._selectedTimeOfConcentration) === null || _a === void 0 ? void 0 : _a.value) == 1) {
                    var keys = Object.keys(this.TravelTimeFlowSegments);
                    for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
                        var segmentName = keys_2[_i];
                        if (!this.TravelTimeFlowSegments[segmentName].length) {
                            return false;
                        }
                    }
                }
                return true;
            };
            SCStormRunoffController.prototype.validateForm = function (mainForm) {
                var _a;
                if (mainForm.$name == "SyntheticUrbanHydrograph") {
                    if (((_a = this._selectedTimeOfConcentration) === null || _a === void 0 ? void 0 : _a.value) == 1) {
                        var atLeastOneSegment = false;
                        var keys = Object.keys(this.TravelTimeFlowSegments);
                        for (var _i = 0, keys_3 = keys; _i < keys_3.length; _i++) {
                            var key = keys_3[_i];
                            if (this.TravelTimeFlowSegments[key].length) {
                                atLeastOneSegment = true;
                                break;
                            }
                        }
                        if (!atLeastOneSegment) {
                            this.showResults = false;
                            this.hideAlerts = false;
                            return false;
                        }
                    }
                }
                if (mainForm.$valid) {
                    return true;
                }
                else {
                    this.showResults = false;
                    this.hideAlerts = false;
                    return false;
                }
            };
            SCStormRunoffController.prototype.clearResults = function () {
                this.drainageArea = null;
                this.drainageAreaSynthetic = null;
                this.timeOfConcentrationMin = null;
                this.peakRateFactor = null;
                this.standardCurveNumber = null;
                this.watershedRetention = null;
                this.initialAbstraction = null;
                this.lagTimeLength = null;
                this.lagTimeSlope = null;
                this._chosenFlowTypeIndex = null;
                this.mainChannelLength = null;
                this.mainChannelSlope = null;
                this.totalImperviousArea = null;
                this.SelectedAEP = null;
                this.SelectedAEPSynthetic = null;
                this.showResults = false;
                this.warningMessages = null;
            };
            SCStormRunoffController.prototype.clearSyntheticResults = function () {
                this._selectedAEPSynthetic = null;
                this._selectedStandardCurve = null;
                this._selectedCNModification = null;
                this._selectedTimeOfConcentration = null;
                this._selectedRainfallDistribution = null;
                this.TravelTimeFlowTypes = this._defaultFlowTypes.slice();
                this.TravelTimeFlowSegments = JSON.parse(JSON.stringify(this._defaultFlowSegments));
                this.drainageAreaSynthetic = null;
                this.timeOfConcentrationMin = null;
                this.peakRateFactor = null;
                this.standardCurveNumber = null;
                this.watershedRetention = null;
                this.initialAbstraction = null;
                this.lagTimeLength = null;
                this.lagTimeSlope = null;
            };
            SCStormRunoffController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            SCStormRunoffController.prototype.Reset = function () {
                this.init();
            };
            SCStormRunoffController.prototype.downloadCSV = function () {
                var _this = this;
                this.angulartics.eventTrack('Download', { category: 'Report', label: 'CSV' });
                var filename = 'data.csv';
                var BohmanRural1989 = function () {
                };
                var BohmanUrban1992 = function () {
                    var finalVal = 'USGS SC Flood Hydrograph for Urban Watersheds using ' + _this.SelectedAEP.name + ' AEP\n';
                    finalVal += '\n' + "Warning Messages:," + _this.warningMessages + '\n';
                    finalVal += _this.tableToCSV($('#BohmanUrbanParameterTable'));
                    finalVal += '\n' + _this.tableToCSV($('#BohmanUrbanSummaryTable'));
                    finalVal += '\n\n' + _this.tableToCSV($('#BohmanUrbanHydrograph'));
                    return finalVal + '\r\n';
                };
                var SyntheticUrbanHydrograph = function () {
                };
                var csvFile = 'StreamStats Output Report\n\n' + 'State/Region ID,' + this.studyAreaService.selectedStudyArea.RegionID.toUpperCase() + '\nWorkspace ID,' + this.studyAreaService.selectedStudyArea.WorkspaceID + '\nLatitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toFixed(5) + '\nLongitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toFixed(5) + '\nTime,' + this.studyAreaService.selectedStudyArea.Date.toLocaleString() + '\n\n';
                if (this.SelectedTab == 1) {
                    csvFile += BohmanRural1989();
                }
                else if (this.SelectedTab == 2) {
                    csvFile += BohmanUrban1992();
                }
                else if (this.SelectedTab == 3) {
                    csvFile += SyntheticUrbanHydrograph();
                }
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
            SCStormRunoffController.prototype.init = function () {
                this.ReportData = new SCStormRunoffReportable();
                this.SelectedTab = SCStormRunoffType.BohmanRural1989;
                this.showResults = false;
                this.hideAlerts = false;
                this.canContinue = true;
                this._chosenFlowTypeIndex = null;
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
