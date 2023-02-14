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
            function SCStormRunoffController($scope, toaster, $http, studyAreaService, modal, $timeout, EventManager) {
                var _this = _super.call(this, $http, configuration.baseurls.StormRunoffServices) || this;
                _this.$timeout = $timeout;
                _this.EventManager = EventManager;
                _this.GC1939 = 0;
                _this.GC1940 = 0;
                _this.GC1941 = 0;
                _this.GC1942 = 0;
                _this.GC1943 = 0;
                _this.showRuralResults = false;
                _this.isBohmanRuralOpen = false;
                _this.region3Percent = 0;
                _this.region4Percent = 0;
                _this.showUrbanResults = false;
                _this.isBohmanUrbanOpen = false;
                _this.showResultsSynthetic = false;
                _this.isSyntheticUHOpen = false;
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
                _this.prfForm = {
                    landUse: null,
                    prfValue: null,
                    area: null
                };
                _this.AEPOptionsSynthetic = [{
                        "name": "10% AEP / 10 Year Return Period",
                        "value": 10
                    }, {
                        "name": "4% AEP / 25 Year Return Period",
                        "value": 4
                    }, {
                        "name": "2% AEP / 50 Year Return Period",
                        "value": 2
                    }, {
                        "name": "1% AEP / 100 Year Return Period",
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
                _this.prfTypes = [
                    { name: "Open Space - Poor Condition (grass cover < 50%)", value: 250 },
                    { name: "Open Space - Fair Condition (grass cover 50-75%)", value: 250 },
                    { name: "Open Space - Good Condition (grass cover > 75%)", value: 250 },
                    { name: "Impervious Areas (paved parking lots, roofs, etc.)	", value: 550 },
                    { name: "Streets and Roads - Paved with curbs and storm sewers", value: 550 },
                    { name: "Streets and Roads - Paved with open ditches", value: 500 },
                    { name: "Streets and Roads - Gravel", value: 450 },
                    { name: "Streets and Roads - Dirt", value: 350 },
                    { name: "Urban Land Use - Commercial and Business", value: 550 },
                    { name: "Urban Land Use - Industrial", value: 550 },
                    { name: "Urban Land Use - 1/8 Acre", value: 400 },
                    { name: "Urban Land Use - 1/4 Acre", value: 375 },
                    { name: "Urban Land Use - 1/3 Acre", value: 350 },
                    { name: "Urban Land Use - 1/2 Acre", value: 350 },
                    { name: "Urban Land Use - 1 Acre", value: 325 },
                    { name: "Urban Land Use - 2 Acre", value: 300 },
                    { name: "Developing urban areas, newly graded, no grass cover", value: 400 },
                    { name: "Pasture - Poor", value: 200 },
                    { name: "Pasture - Fair", value: 190 },
                    { name: "Pasture - Good", value: 180 },
                    { name: "Woods - Poor", value: 200 },
                    { name: "Woods - Fair", value: 190 },
                    { name: "Woods - Good", value: 180 },
                    { name: "Row Crop - Straight Row", value: 300 },
                    { name: "Row Crop - Contoured", value: 275 },
                    { name: "Row Crop - Contoured and Terraced", value: 250 }
                ];
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
                                    "Aluminum": 1,
                                    "CMP": 2,
                                    "Concrete": 3,
                                    "Corrugated HDPE": 4,
                                    "PVC": 5,
                                    "Steel": 6
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
                _this.prfSegments = [];
                _this.addFlowSegmentOpen = false;
                _this.DHourStormOptions = [{
                        "name": "1-Hour",
                        "value": 1,
                        "maxTimeMinutes": 500
                    },
                    {
                        "name": "2-Hour",
                        "value": 2,
                        "maxTimeMinutes": 500
                    },
                    {
                        "name": "3-Hour",
                        "value": 3,
                        "maxTimeMinutes": 600
                    },
                    {
                        "name": "6-Hour",
                        "value": 6,
                        "maxTimeMinutes": 800
                    },
                    {
                        "name": "12-Hour",
                        "value": 12,
                        "maxTimeMinutes": 1000
                    },
                    {
                        "name": "24-Hour",
                        "value": 24,
                        "maxTimeMinutes": 1800
                    }];
                _this._selectedDHourStorm = {
                    "name": "1-Hour",
                    "value": 1,
                    "maxTimeMinutes": 500
                };
                $scope.vm = _this;
                $scope.greaterThanZero = _this.greaterThanZero;
                $scope.greaterThanOrEqualToZero = _this.greaterThanOrEqualToZero;
                $scope.betweenZeroOneHundred = _this.betweenZeroOneHundred;
                _this.AppVersion = configuration.version;
                _this.toaster = toaster;
                _this.modalInstance = modal;
                _this.StudyArea = studyAreaService.selectedStudyArea;
                _this.studyAreaService = studyAreaService;
                _this.init();
                _this.print = function () {
                    if (this.SelectedTab == 3)
                        this.isSyntheticUHOpen = true;
                    if (this.SelectedTab == 2)
                        this.isBohmanUrbanOpen = true;
                    if (this.SelectedTab == 1)
                        this.isBohmanRuralOpen = true;
                    setTimeout(function () {
                        window.print();
                    }, 300);
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
                    return this._chosenFlowType;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(SCStormRunoffController.prototype, "SelectedDHourStorm", {
                get: function () {
                    return this._selectedDHourStorm;
                },
                set: function (val) {
                    this._selectedDHourStorm = val;
                },
                enumerable: false,
                configurable: true
            });
            SCStormRunoffController.prototype.estimateFlows = function (statisticGroup) {
                var _this = this;
                if (this.methodType == 'Urban') {
                    var data = [{
                            "id": 31,
                            "name": "Urban Peak-Flow Statistics",
                            "code": "UPFS",
                            "defType": "FS",
                            "statisticGroupName": "Urban Peak-Flow Statistics",
                            "statisticGroupID": "31",
                            "regressionRegions": statisticGroup[0].regressionRegions
                        }];
                }
                else if (this.methodType == 'Rural') {
                    var data = [{
                            "id": 2,
                            "name": "Peak-Flow Statistics",
                            "code": "PFS",
                            "defType": "FS",
                            "statisticGroupName": "Peak-Flow Statistics",
                            "statisticGroupID": "2",
                            "regressionRegions": statisticGroup[0].regressionRegions
                        }];
                }
                var url = configuration.baseurls['NSS'] + configuration.queryparams['estimateFlows'].format('SC');
                var request = new WiM.Services.Helpers.RequestInfo(url, true, 1, 'json', JSON.stringify(data));
                this.Execute(request).then(function (response) {
                    if (response.data[0].regressionRegions.length > 0 && response.data[0].regressionRegions[0].results && response.data[0].regressionRegions[0].results.length > 0) {
                        var weightedAEP = 0;
                        if (_this.methodType == 'Urban') {
                            response.data[0].regressionRegions.forEach(function (regressionregion) {
                                if (regressionregion.code == 'GC1583' || regressionregion.code == 'GC1584' || regressionregion.code == 'GC1585' || regressionregion.code == 'GC1586') {
                                    regressionregion.results.forEach(function (result) {
                                        if (result.name.indexOf(_this.SelectedAEP.value) !== -1) {
                                            weightedAEP += (result.value * (regressionregion.percentWeight / 100.0));
                                        }
                                    });
                                }
                            });
                            var urbanData = {
                                "lat": _this.studyAreaService.selectedStudyArea.Pourpoint.Latitude,
                                "lon": _this.studyAreaService.selectedStudyArea.Pourpoint.Longitude,
                                "region3PercentArea": _this.region3Percent,
                                "region4PercentArea": _this.region4Percent,
                                "Qp": weightedAEP,
                                "A": _this.drainageArea,
                                "L": _this.mainChannelLength,
                                "S": _this.mainChannelSlope,
                                "TIA": _this.totalImperviousArea
                            };
                            _this.getUrbanStormRunoffResults(urbanData);
                        }
                        else if (_this.methodType == 'Rural') {
                            response.data[0].regressionRegions.forEach(function (regressionregion) {
                                if (regressionregion.citationID == 191) {
                                    regressionregion.results.forEach(function (result) {
                                        if (result.name.indexOf(_this.SelectedAEP.value) !== -1) {
                                            weightedAEP += (result.value * (regressionregion.percentWeight / 100.0));
                                        }
                                    });
                                }
                            });
                            var ruralData = {
                                "regionBlueRidgePercentArea": _this.GC1943,
                                "regionPiedmontPercentArea": _this.GC1942,
                                "regionUpperCoastalPlainPercentArea": _this.GC1941,
                                "regionLowerCoastalPlain1PercentArea": _this.GC1939,
                                "regionLowerCoastalPlain2PercentArea": _this.GC1940,
                                "Qp": weightedAEP,
                                "A": _this.drainageArea
                            };
                            _this.getRuralStormRunoffResults(ruralData);
                        }
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
            SCStormRunoffController.prototype.getUrbanStormRunoffResults = function (data) {
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
                    _this.showUrbanResults = true;
                    if (response.headers()['x-warning']) {
                        _this.warningMessages = response.headers()['x-warning'];
                    }
                }, function (error) {
                    _this.toaster.pop('error', "Error", error["data"]["detail"], 0);
                }).finally(function () {
                    _this.canContinue = true;
                });
            };
            SCStormRunoffController.prototype.getRuralStormRunoffResults = function (data) {
                var _this = this;
                var url = configuration.baseurls['SCStormRunoffServices'] + configuration.queryparams['SCStormRunoffBohman1989'];
                var headers = {
                    "Content-Type": "application/json",
                    "X-warning": true
                };
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', JSON.stringify(data), headers);
                this.Execute(request).then(function (response) {
                    _this.reportData = response.data;
                    _this.ReportData.BohmanRural1989.Graph = _this.loadGraphData();
                    _this.ReportData.BohmanRural1989.WeightedRunoff = _this.reportData.weighted_runoff_volume;
                    _this.setGraphOptions();
                    _this.showRuralResults = true;
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
                if (this.methodType == 'Urban') {
                    var statGroup = 31;
                }
                else if (this.methodType == 'Rural') {
                    var statGroup = 2;
                }
                var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupParameterLookup'];
                url = url.format('SC', statGroup, regressionregions);
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
                        text: 'USGS SC Flood Hydrograph for ' + this.methodType + ' Watersheds using ' + this.SelectedAEP.name + ' AEP',
                        css: {
                            'font-size': '10pt',
                            'font-weight': 'bold'
                        }
                    }
                };
            };
            SCStormRunoffController.prototype.queryRegressionRegions = function (methodType) {
                var _this = this;
                this.methodType = methodType;
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
                        response.data.forEach(function (regressionRegion) {
                            if (regressionRegion.code == "GC1585") {
                                _this.region3Percent = regressionRegion.percentWeight;
                            }
                            else if (regressionRegion.code == "GC1586") {
                                _this.region4Percent = regressionRegion.percentWeight;
                            }
                            else if (regressionRegion.code == "GC1939") {
                                _this.GC1939 = regressionRegion.percentWeight;
                            }
                            else if (regressionRegion.code == "GC1940") {
                                _this.GC1940 = regressionRegion.percentWeight;
                            }
                            else if (regressionRegion.code == "GC1941") {
                                _this.GC1941 = regressionRegion.percentWeight;
                            }
                            else if (regressionRegion.code == "GC1942") {
                                _this.GC1942 = regressionRegion.percentWeight;
                            }
                            else if (regressionRegion.code == "GC1943") {
                                _this.GC1943 = regressionRegion.percentWeight;
                            }
                        });
                        _this.loadParametersByStatisticsGroup(response.data.map(function (elem) {
                            return elem.code;
                        }).join(","), response.data);
                    }
                }, function (error) {
                    _this.toaster.pop('error', "There was an HTTP error querying Regression Regions", "Please retry", 0);
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
                                if (param.code.toLowerCase() == 'lc19imp')
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
            SCStormRunoffController.prototype.calculateSynthetic = function () {
                var _this = this;
                this.canContinueSynthetic = false;
                var headers = {
                    "Content-Type": "application/json",
                    "X-Is-StreamStats": true
                };
                var url = configuration.baseurls['SCStormRunoffServices'] + configuration.queryparams['SCStormRunoffSyntheticUnitComputerGraphResults'];
                var data = {
                    "lat": this.studyAreaService.selectedStudyArea.Pourpoint.Latitude,
                    "lon": this.studyAreaService.selectedStudyArea.Pourpoint.Longitude,
                    "AEP": this._selectedAEPSynthetic.value,
                    "CNModificationMethod": this._selectedCNModification.name,
                    "Area": this.drainageAreaSynthetic,
                    "Tc": this.timeOfConcentrationMin,
                    "RainfallDistributionCurve": this._selectedRainfallDistribution.name.split(" ")[1],
                    "PRF": this.peakRateFactor,
                    "CN": this.standardCurveNumber,
                    "S": this.watershedRetention,
                    "Ia": this.initialAbstraction
                };
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, "json", angular.toJson(data), headers);
                this.Execute(request).then(function (response) {
                    if (!response.data) {
                        _this.toaster.pop('error', "There was an HTTP error querying Regression regions", "Please retry", 0);
                        return;
                    }
                    if (!response.data.hydrograph_ordinates_table || !response.data.runoff_results_table || !response.data.unit_hydrograph_data || !response.data.watershed_data) {
                        _this.toaster.pop('error', "One or more of the expected data responses came back null.", "Please retry", 0);
                        return;
                    }
                    _this.syntheticResponseData = response.data;
                    _this.DHourStormChange();
                    _this.showResultsSynthetic = true;
                    _this.canContinueSynthetic = true;
                }, function (error) {
                    _this.toaster.pop('error', "There was an HTTP error querying Regression regions", "Please retry", 0);
                }).finally(function () {
                });
            };
            SCStormRunoffController.prototype.loadSyntheticGraphData = function () {
                var _this = this;
                var results = [];
                var hydrograph = [];
                var flowHour = "flow_" + this._selectedDHourStorm.value + "_hour";
                var timeArray = [];
                for (var _i = 0, _a = this.syntheticResponseData.hydrograph_ordinates_table.time; _i < _a.length; _i++) {
                    var time = _a[_i];
                    timeArray.push(time);
                    if (Math.abs(time - this._selectedDHourStorm.maxTimeMinutes) < 6) {
                        break;
                    }
                }
                hydrograph = timeArray.map(function (v, i) { return [v, _this.syntheticResponseData.hydrograph_ordinates_table[flowHour][i]]; }).map(function (_a) {
                    var x = _a[0], y = _a[1];
                    return ({ x: x, y: y });
                });
                results.push({ values: hydrograph, key: "Flow (ft³/s)", color: " #009900", type: "line", yAxis: 1 });
                return results;
            };
            SCStormRunoffController.prototype.setSyntheticGraphOptions = function () {
                this.ReportOptionsSynthetic = {
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
                            axisLabel: 'Time, in minutes',
                            tickFormat: function (d) {
                                return d.toUSGSvalue();
                            }
                        },
                        yAxis1: {
                            axisLabel: 'Flow, ft³/s',
                            tickFormat: function (d) {
                                return d.toUSGSvalue();
                            }
                        }
                    },
                    title: {
                        enable: true,
                        text: '' + this._selectedDHourStorm.value + " Hour Storm Hydrograph",
                        css: {
                            'font-size': '10pt',
                            'font-weight': 'bold'
                        }
                    }
                };
            };
            SCStormRunoffController.prototype.DHourStormChange = function () {
                this.ReportData.SyntheticUrbanHydrograph.Graph = this.loadSyntheticGraphData();
                this.ReportData.SyntheticUrbanHydrograph.WeightedRunoff = this.syntheticResponseData.runoff_results_table;
                this.setSyntheticGraphOptions();
            };
            SCStormRunoffController.prototype.isMaxRunoffVolume = function (index) {
                var max_runoff_volume_storm_duration = this.syntheticResponseData.runoff_results_table.max_runoff_volume_storm_duration;
                if (this.DHourStormOptions[index].value == max_runoff_volume_storm_duration) {
                    return true;
                }
                return false;
            };
            SCStormRunoffController.prototype.isMaxPeakRunoff = function (index) {
                var max_peak_runoff_storm_duration = this.syntheticResponseData.runoff_results_table.max_peak_runoff_storm_duration;
                if (this.DHourStormOptions[index].value == max_peak_runoff_storm_duration) {
                    return true;
                }
                return false;
            };
            SCStormRunoffController.prototype.calculateSyntheticParameters = function (parameters) {
                var _this = this;
                try {
                    this.toaster.pop("wait", "Calculating Missing Parameters", "Please wait...", 0);
                    this.parameters = parameters;
                    this.canContinueSynthetic = false;
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
                                if (param.code.toLowerCase() == 'drnarea' && !_this.drainageAreaSynthetic)
                                    _this.drainageAreaSynthetic = param.value;
                                if (param.code.toLowerCase() == 'csl10_85fm' && ((_a = _this._selectedTimeOfConcentration) === null || _a === void 0 ? void 0 : _a.value) == 2 && !_this.lagTimeLength)
                                    _this.lagTimeLength = param.value;
                                if (param.code.toLowerCase() == 'lfplength' && ((_b = _this._selectedTimeOfConcentration) === null || _b === void 0 ? void 0 : _b.value) == 2 && !_this.lagTimeSlope)
                                    _this.lagTimeSlope = param.value;
                            });
                            var data = {};
                            var url = "";
                            var headers = {
                                "Content-Type": "application/json",
                                "X-warning": true
                            };
                            var formattedSegments = _this.getFormattedFlowSegments();
                            var studyArea = _this.studyAreaService.simplify(angular.fromJson(angular.toJson(_this.studyAreaService.selectedStudyArea.FeatureCollection.features.filter(function (f) { return (f.id).toLowerCase() == "globalwatershed"; })[0])));
                            var studyAreaGeom = studyArea.geometry;
                            var watershedFeature = [
                                {
                                    "type": "Feature",
                                    "geometry": studyAreaGeom
                                }
                            ];
                            data = {
                                "lat": _this.studyAreaService.selectedStudyArea.Pourpoint.Latitude,
                                "lon": _this.studyAreaService.selectedStudyArea.Pourpoint.Longitude,
                                "watershedFeatures": watershedFeature,
                                "prfData": _this.prfSegments,
                                "AEP": (_a = _this._selectedAEPSynthetic) === null || _a === void 0 ? void 0 : _a.value,
                                "curveNumberMethod": (_b = _this._selectedStandardCurve) === null || _b === void 0 ? void 0 : _b.endpointValue,
                                "TcMethod": _this._selectedTimeOfConcentration.endpointValue,
                                "length": ((_c = _this._selectedTimeOfConcentration) === null || _c === void 0 ? void 0 : _c.value) == 2 ? _this.lagTimeLength : null,
                                "slope": ((_d = _this._selectedTimeOfConcentration) === null || _d === void 0 ? void 0 : _d.value) == 2 ? _this.lagTimeSlope : null,
                                "dataSheetFlow": ((_e = _this._selectedTimeOfConcentration) === null || _e === void 0 ? void 0 : _e.value) == 1 ? formattedSegments.sheetFlow : null,
                                "dataExcessSheetFlow": ((_f = _this._selectedTimeOfConcentration) === null || _f === void 0 ? void 0 : _f.value) == 1 ? formattedSegments.excessSheetFlow : null,
                                "dataShallowConcentratedFlow": ((_g = _this._selectedTimeOfConcentration) === null || _g === void 0 ? void 0 : _g.value) == 1 ? formattedSegments.shallowConcentratedFlow : null,
                                "dataChannelizedFlowOpenChannel": ((_h = _this._selectedTimeOfConcentration) === null || _h === void 0 ? void 0 : _h.value) == 1 ? formattedSegments.channelizedFlowOpen : null,
                                "dataChannelizedFlowStormSewer": ((_j = _this._selectedTimeOfConcentration) === null || _j === void 0 ? void 0 : _j.value) == 1 ? formattedSegments.channelizedFlowStorm : null,
                                "dataChannelizedFlowStormSewerOrOpenChannelUserInputVelocity": ((_k = _this._selectedTimeOfConcentration) === null || _k === void 0 ? void 0 : _k.value) == 1 ? formattedSegments.channelizedFlowUserInput : null
                            };
                            url = configuration.baseurls['SCStormRunoffServices'] + configuration.queryparams['SCStormRunoffSyntheticUnitHydrograph'];
                            var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', JSON.stringify(data), headers);
                            _this.Execute(request).then(function (response) {
                                var data = response.data;
                                var keys = Object.keys(data);
                                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                                    var key = keys_1[_i];
                                    if (key == "Ia" && !_this.initialAbstraction)
                                        _this.initialAbstraction = response.data.Ia.toUSGSvalue();
                                    if (key == "S" && !_this.watershedRetention)
                                        _this.watershedRetention = response.data.S.toUSGSvalue();
                                    if (key == "curve_number" && !_this.standardCurveNumber)
                                        _this.standardCurveNumber = response.data.curve_number.toUSGSvalue();
                                    if (key == "peak_rate_factor" && !_this.peakRateFactor)
                                        _this.peakRateFactor = response.data.peak_rate_factor.toUSGSvalue();
                                    if (key == "rainfall_distribution_curve_letter" && !_this._selectedRainfallDistribution) {
                                        for (var _a = 0, _b = _this.RainfallDistributionOptions; _a < _b.length; _a++) {
                                            var option = _b[_a];
                                            if (option.name.indexOf(response.data.rainfall_distribution_curve_letter) != -1) {
                                                _this._selectedRainfallDistribution = option;
                                                break;
                                            }
                                        }
                                    }
                                    if (key == "time_of_concentration" && !_this.timeOfConcentrationMin)
                                        _this.timeOfConcentrationMin = response.data.time_of_concentration.value.toUSGSvalue();
                                }
                                var paramErrors = false;
                                var failedToCompute = [];
                                if (!_this.initialAbstraction) {
                                    paramErrors = true;
                                    failedToCompute.push("Initial Abstraction");
                                }
                                if (!_this.watershedRetention) {
                                    paramErrors = true;
                                    failedToCompute.push("Watershed Retention");
                                }
                                if (!_this.standardCurveNumber) {
                                    paramErrors = true;
                                    failedToCompute.push("Standard Curve Number");
                                }
                                if (!_this.peakRateFactor) {
                                    paramErrors = true;
                                    failedToCompute.push("Peak Rate Factor");
                                }
                                if (!_this._selectedRainfallDistribution) {
                                    paramErrors = true;
                                    failedToCompute.push("Rainfall Distribution");
                                }
                                if (!_this.timeOfConcentrationMin) {
                                    paramErrors = true;
                                    failedToCompute.push("Time of Concentration");
                                }
                                if (paramErrors) {
                                    _this.toaster.clear();
                                    _this.toaster.pop('error', "Error", "Parameter(s) failed to compute: " + failedToCompute.join(", "), 0);
                                }
                                else {
                                    _this.toaster.clear();
                                }
                            }).catch(function (error) {
                                _this.toaster.clear();
                                _this.toaster.pop("error", "There was an HTTP error calculating parameters", "Please retry", 0);
                            });
                        }
                    }, function (error) {
                        _this.toaster.clear();
                        _this.toaster.pop("error", "There was an HTTP error calculating parameters", "Please retry", 0);
                    }).finally(function () {
                        _this.canContinueSynthetic = true;
                        _this.hideAlerts = true;
                    });
                }
                catch (e) {
                    this.toaster.pop('error', "There was an error calculating parameters", "", 0);
                }
            };
            SCStormRunoffController.prototype.openAddFlowSegment = function (chosenFlow) {
                this.addFlowSegmentOpen = true;
                this._chosenFlowType = chosenFlow;
            };
            SCStormRunoffController.prototype.closeAddFlowSegment = function () {
                this.addFlowSegmentOpen = false;
                this._chosenFlowType = null;
                this.TravelTimeFlowTypes = this._defaultFlowTypes.slice();
            };
            SCStormRunoffController.prototype.addFlowSegment = function (index) {
                if (this._chosenFlowType == 'PRF') {
                    var newSegment = {};
                    newSegment = {
                        landUse: this.prfForm.landUse.name,
                        PRF: this.prfForm.prfValue,
                        Area: this.prfForm.area
                    };
                    this.prfSegments.push(newSegment);
                    this.prfForm = { landUse: null, prfValue: null, area: null };
                }
                else {
                    var newSegment = [];
                    var questionSet = this.TravelTimeFlowTypes[index].questions;
                    for (var _i = 0, questionSet_1 = questionSet; _i < questionSet_1.length; _i++) {
                        var question = questionSet_1[_i];
                        newSegment.push(JSON.parse(JSON.stringify(question)));
                        question.value = null;
                    }
                    this.TravelTimeFlowSegments[this.TravelTimeFlowTypes[index].id].push(newSegment);
                }
                this._chosenFlowType = null;
                this.addFlowSegmentOpen = false;
            };
            SCStormRunoffController.prototype.removeFlowSegment = function (flowTypeID, indexOfRemoval) {
                var flowType = null;
                if (flowTypeID == "PRF") {
                    flowType = this.prfSegments;
                }
                else {
                    flowType = this.TravelTimeFlowSegments[flowTypeID];
                }
                if (!flowType) {
                    console.error("Unable to remove flow segment: improper flow type ID. This is a bug!");
                    return;
                }
                flowType.splice(indexOfRemoval, 1);
            };
            SCStormRunoffController.prototype.setPRF = function (landuse) {
                this.prfForm.prfValue = landuse.value;
            };
            SCStormRunoffController.prototype.calculatePRF = function () {
                var _this = this;
                if (this.prfSegments.length == 0) {
                    this.toaster.pop('error', "No PRF information was added, cannot calculate.", "", 500);
                    this.peakRateFactor = 0;
                }
                else {
                    var data = {
                        "prfData": this.prfSegments
                    };
                    var url = configuration.baseurls['SCStormRunoffServices'] + configuration.queryparams['SCStormRunoffPRF'];
                    var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', JSON.stringify(data));
                    this.Execute(request).then(function (response) {
                        _this.peakRateFactor = response.data.PRF;
                    }, function (error) {
                        _this.toaster.clear();
                        _this.toaster.pop("error", "There was an HTTP error calculating prf", "Please retry", 0);
                    }).finally(function () {
                    });
                }
            };
            SCStormRunoffController.prototype.calculateSyntheticParamsDisabled = function () {
                var _a;
                if (((_a = this._selectedTimeOfConcentration) === null || _a === void 0 ? void 0 : _a.value) == 1) {
                    var numCompletedFlowSegments = this.completedFlowSegments();
                    if (!this._selectedAEPSynthetic || !this._selectedStandardCurve) {
                        return 2;
                    }
                    if (numCompletedFlowSegments < 1) {
                        return 3;
                    }
                }
                if (!this._selectedAEPSynthetic || !this._selectedStandardCurve || !this._selectedTimeOfConcentration || this.prfSegments.length == 0) {
                    return 1;
                }
                return 0;
            };
            SCStormRunoffController.prototype.completedFlowSegments = function () {
                var _a;
                var counter = 0;
                if (((_a = this._selectedTimeOfConcentration) === null || _a === void 0 ? void 0 : _a.value) == 1) {
                    var keys = Object.keys(this.TravelTimeFlowSegments);
                    for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
                        var segmentName = keys_2[_i];
                        if (this.TravelTimeFlowSegments[segmentName].length) {
                            counter++;
                        }
                    }
                }
                return counter;
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
                            this.showRuralResults = false;
                            this.showUrbanResults = false;
                            this.hideAlerts = false;
                            return false;
                        }
                    }
                }
                if (mainForm.$valid) {
                    return true;
                }
                else {
                    this.showRuralResults = false;
                    this.showUrbanResults = false;
                    this.hideAlerts = false;
                    return false;
                }
            };
            SCStormRunoffController.prototype.clearResults = function (form) {
                if (form.$name == "BohmanUrbanForm" || form.$name == "BohmanRuralForm") {
                    this.drainageArea = null;
                    this.timeOfConcentrationMin = null;
                    this.peakRateFactor = null;
                    this.standardCurveNumber = null;
                    this.watershedRetention = null;
                    this.initialAbstraction = null;
                    this.lagTimeLength = null;
                    this.lagTimeSlope = null;
                    this._chosenFlowType = null;
                    this.mainChannelLength = null;
                    this.mainChannelSlope = null;
                    this.totalImperviousArea = null;
                    this.SelectedAEP = null;
                    this.SelectedAEPSynthetic = null;
                    this.showUrbanResults = false;
                    this.showRuralResults = false;
                    this.warningMessages = null;
                    this.methodType = null;
                }
                else if (form.$name == "SyntheticUrbanHydrograph") {
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
                    this._selectedCNModification = null;
                    this.showResultsSynthetic = false;
                    this.stormHydrographOrdinatesAccordionOpen = false;
                    this.warningMessagesSynthetic = null;
                    this._selectedDHourStorm = {
                        "name": "1-Hour",
                        "value": 1,
                        "maxTimeMinutes": 500
                    };
                    this.prfSegments = [];
                }
            };
            SCStormRunoffController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            SCStormRunoffController.prototype.Reset = function () {
                this.init();
            };
            SCStormRunoffController.prototype.downloadCSV = function () {
                var _this = this;
                if (this.SelectedTab == 3) {
                    this.isSyntheticUHOpen = true;
                    setTimeout(function () {
                        _this.formatCSV();
                    }, 300);
                }
                else if (this.SelectedTab == 2) {
                    this.isBohmanUrbanOpen = true;
                    setTimeout(function () {
                        _this.formatCSV();
                    }, 300);
                }
                else if (this.SelectedTab == 1) {
                    this.isBohmanRuralOpen = true;
                    setTimeout(function () {
                        _this.formatCSV();
                    }, 300);
                }
            };
            SCStormRunoffController.prototype.formatCSV = function () {
                var _this = this;
                var filename = 'data.csv';
                var BohmanRural1989 = function () {
                    var finalVal = 'USGS SC Flood Hydrograph for Rural Watersheds using ' + _this.SelectedAEP.name + ' AEP\n';
                    finalVal += '\n' + 'Warning Messages:,"' + _this.warningMessages + '"\n';
                    finalVal += _this.tableToCSV($('#BohmanRuralParameterTable'));
                    finalVal += '\n' + _this.tableToCSV($('#BohmanRuralSummaryTable'));
                    finalVal += '\n\nTabular Hydrograph';
                    finalVal += '\n' + _this.tableToCSV($('#BohmanRuralHydrograph'));
                    return finalVal + '\r\n';
                };
                var BohmanUrban1992 = function () {
                    var finalVal = 'USGS SC Flood Hydrograph for Urban Watersheds using ' + _this.SelectedAEP.name + ' AEP\n';
                    finalVal += '\n' + 'Warning Messages:,"' + _this.warningMessages + '"\n';
                    finalVal += _this.tableToCSV($('#BohmanUrbanParameterTable'));
                    finalVal += '\n' + _this.tableToCSV($('#BohmanUrbanSummaryTable'));
                    finalVal += '\n\nTabular Hydrograph';
                    finalVal += '\n' + _this.tableToCSV($('#BohmanUrbanHydrograph'));
                    return finalVal + '\r\n';
                };
                var SyntheticUrbanHydrograph = function () {
                    var warning = _this.warningMessagesSynthetic ? _this.warningMessagesSynthetic : null;
                    var finalVal = 'USGS SC Synthetic Unit Hydrograph using ' + _this.SelectedAEPSynthetic.name + '\n';
                    if (warning) {
                        finalVal += '\n' + 'Warning Messages:,"' + warning + '"\n';
                    }
                    var WatershedDataTable = (_this.tableToCSV($('#WatershedDataTable')).slice(3));
                    var UnitHydrographTable = (_this.tableToCSV($('#UnitHydrographTable')).slice(3));
                    finalVal += '\n' + "Watershed Data" + WatershedDataTable;
                    finalVal += '\n\n' + "Unit Hydrograph Data" + UnitHydrographTable;
                    finalVal += '\n\n' + "Runoff Results" + '\n' + _this.tableToCSV($('#SyntheticUnitHydrographRunoffTable'));
                    finalVal += '\n\n' + "Critical Durations" + '\n' + _this.tableToCSV($('#SyntheticUnitHydrographCriticalDurationsTable'));
                    finalVal += '\n\nTabular Hydrograph';
                    finalVal += '\n' + "D-Hour Storm Hydrograph Ordinates" + '\n' + _this.tableToCSV($('#SyntheticUnitHydrographDataTable'));
                    finalVal += '\n\n' + _this.tableToCSV($('#SyntheticUnitHydrographDisclaimerReport'));
                    var node = document.getElementById('SyntheticUnitHydrographDisclaimerReport');
                    var string = node.textContent.replace(/\s+/g, ' ').trim();
                    string = string.replace(/,/g, ' ');
                    string = string.replace(/(?=\(\d\))/g, '\n');
                    finalVal += '\n\n' + string;
                    return finalVal + '\r\n';
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
                this.hideAlerts = false;
                this.canContinue = true;
                this.canContinueSynthetic = true;
                this._chosenFlowType = null;
                this.stormHydrographOrdinatesAccordionOpen = false;
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
            SCStormRunoffController.$inject = ['$scope', 'toaster', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance', '$timeout', 'WiM.Event.EventManager'];
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
