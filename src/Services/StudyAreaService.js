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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var StreamStats;
(function (StreamStats) {
    var Services;
    (function (Services) {
        'use strict';
        Services.onSelectedStudyAreaChanged = "onSelectedStudyAreaChanged";
        Services.onSelectedStudyParametersLoaded = "onSelectedStudyParametersLoaded";
        Services.onStudyAreaReset = "onStudyAreaReset";
        Services.onEditClick = "onEditClick";
        Services.onAdditionalFeaturesLoaded = "onAdditionalFeaturesLoaded";
        Services.onRegressionLoaded = "onRegressionLoaded";
        var StudyAreaEventArgs = (function (_super) {
            __extends(StudyAreaEventArgs, _super);
            function StudyAreaEventArgs(studyArea, saVisible, paramState) {
                if (studyArea === void 0) { studyArea = null; }
                if (saVisible === void 0) { saVisible = false; }
                if (paramState === void 0) { paramState = false; }
                var _this = _super.call(this) || this;
                _this.studyArea = studyArea;
                _this.studyAreaVisible = saVisible;
                _this.parameterLoaded = paramState;
                return _this;
            }
            return StudyAreaEventArgs;
        }(WiM.Event.EventArgs));
        Services.StudyAreaEventArgs = StudyAreaEventArgs;
        var StudyAreaService = (function (_super) {
            __extends(StudyAreaService, _super);
            function StudyAreaService($http, $q, eventManager, toaster, modal, nssService, regionService) {
                var _this = _super.call(this, $http, configuration.baseurls['StreamStatsServices']) || this;
                _this.$http = $http;
                _this.$q = $q;
                _this.eventManager = eventManager;
                _this.nssService = nssService;
                _this.regionService = regionService;
                _this._onStudyAreaServiceFinishedChanged = new WiM.Event.Delegate();
                _this.surfacecontributionsonly = false;
                _this.doSelectMapGage = false;
                _this.doSelectNearestGage = false;
                _this.NSSServicesVersion = '';
                _this.streamgagesVisible = true;
                _this.additionalFeaturesLoaded = false;
                _this.extensionDateRange = null;
                _this.extensionsConfigured = false;
                _this.loadingDrainageArea = false;
                _this.extensionResultsChanged = 0;
                _this.flowAnywhereData = null;
                _this.modalservices = modal;
                eventManager.AddEvent(Services.onSelectedStudyParametersLoaded);
                eventManager.AddEvent(Services.onSelectedStudyAreaChanged);
                eventManager.AddEvent(Services.onStudyAreaReset);
                eventManager.AddEvent(Services.onAdditionalFeaturesLoaded);
                eventManager.SubscribeToEvent(Services.onSelectedStudyAreaChanged, new WiM.Event.EventHandler(function (sender, e) {
                    _this.onStudyAreaChanged(sender, e);
                }));
                eventManager.SubscribeToEvent(Services.onScenarioExtensionChanged, new WiM.Event.EventHandler(function (sender, e) {
                    _this.onNSSExtensionChanged(sender, e);
                }));
                eventManager.SubscribeToEvent(Services.onScenarioExtensionResultsChanged, new WiM.Event.EventHandler(function (sender, e) {
                    _this.onNSSExtensionResultsChanged(sender, e);
                }));
                eventManager.AddEvent(Services.onEditClick);
                _this._studyAreaList = [];
                _this.toaster = toaster;
                _this.clearStudyArea();
                _this.servicesURL = configuration.baseurls['StreamStatsServices'];
                _this._onQ10Loaded = new WiM.Event.Delegate();
                _this.parameterloadedEventHandler = new WiM.Event.EventHandler(function (sender, e) {
                    if (e != null && e.parameterLoaded) {
                        _this.nssService.estimateFlows(_this.studyAreaParameterList, "value", _this.selectedStudyArea.RegionID, false, _this.regtype, false);
                        _this.onQ10Available();
                    }
                });
                _this.statisticgroupEventHandler = new WiM.Event.EventHandler(function () {
                    _this.eventManager.SubscribeToEvent(Services.onSelectedStudyParametersLoaded, _this.parameterloadedEventHandler);
                    _this.loadParameters();
                    _this.afterSelectedStatisticsGroupChanged();
                });
                _this.q10EventHandler = new WiM.Event.EventHandler(function (sender, e) {
                    _this.afterQ10Loaded();
                });
                return _this;
            }
            Object.defineProperty(StudyAreaService.prototype, "onStudyAreaServiceBusyChanged", {
                get: function () {
                    return this._onStudyAreaServiceFinishedChanged;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(StudyAreaService.prototype, "onQ10Loaded", {
                get: function () {
                    return this._onQ10Loaded;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(StudyAreaService.prototype, "StudyAreaList", {
                get: function () {
                    return this._studyAreaList;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(StudyAreaService.prototype, "selectedStudyArea", {
                get: function () {
                    return this._selectedStudyArea;
                },
                set: function (val) {
                    if (!this.canUpdate)
                        return;
                    if (this._selectedStudyArea != val) {
                        this._selectedStudyArea = val;
                        this.eventManager.RaiseEvent(Services.onSelectedStudyAreaChanged, this, StudyAreaEventArgs.Empty);
                    }
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(StudyAreaService.prototype, "selectedStudyAreaExtensions", {
                get: function () {
                    if (this.selectedStudyArea == null)
                        return null;
                    else
                        return this.selectedStudyArea.NSS_Extensions;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(StudyAreaService.prototype, "freshdeskCredentials", {
                get: function () {
                    return this._freshdeskCreds;
                },
                set: function (val) {
                    if (this._freshdeskCreds != val)
                        this._freshdeskCreds = val;
                },
                enumerable: false,
                configurable: true
            });
            StudyAreaService.prototype.editBasin = function (selection) {
                this.selectedStudyArea.Disclaimers['isEdited'] = true;
                this.drawControlOption = selection;
                this.eventManager.RaiseEvent(Services.onEditClick, this, WiM.Event.EventArgs.Empty);
            };
            StudyAreaService.prototype.undoEdit = function () {
                delete this.selectedStudyArea.Disclaimers['isEdited'];
                this.WatershedEditDecisionList = new StreamStats.Models.WatershedEditDecisionList();
                this.eventManager.RaiseEvent(Services.onSelectedStudyAreaChanged, this, StudyAreaEventArgs.Empty);
            };
            StudyAreaService.prototype.AddStudyArea = function (sa) {
                this.clearStudyArea();
                this.StudyAreaList.push(sa);
                this.selectedStudyArea = sa;
                this.selectedStudyArea.Disclaimers = {};
            };
            StudyAreaService.prototype.RemoveStudyArea = function () {
            };
            StudyAreaService.prototype.clearStudyArea = function () {
                this.canUpdate = true;
                this.regulationCheckComplete = true;
                this.parametersLoading = false;
                this.doDelineateFlag = false;
                this.checkingDelineatedPoint = false;
                this.studyAreaParameterList = [];
                this.regulationCheckResults = [];
                this.allIndexGages = undefined;
                if (this.selectedStudyArea)
                    this.selectedStudyArea.Disclaimers = {};
                this.showEditToolbar = false;
                this.WatershedEditDecisionList = new StreamStats.Models.WatershedEditDecisionList();
                this.selectedStudyArea = null;
                this.zoomLevel15 = true;
                this.regressionRegionQueryComplete = false;
                this.regressionRegionQueryLoading = false;
                this.delineateByPoint = false;
                this.delineateByLine = false;
                this.eventManager.RaiseEvent(Services.onStudyAreaReset, this, WiM.Event.EventArgs.Empty);
            };
            StudyAreaService.prototype.loadStudyBoundary = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var regionID, url, url, request, delineations, features, index, _i, _a, point, url, request, i, result, featuresToMerge, _b, _c, feature, featuresCollectionToMerge, dissolvedFeatures, bbox;
                    var _this = this;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                this.toaster.pop("wait", "Delineating Basin", "Please wait...", 0);
                                this.canUpdate = false;
                                regionID = this.selectedStudyArea.RegionID;
                                if (!(this.selectedStudyArea.Pourpoint.length == 1)) return [3, 1];
                                url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSdelineation'].format('geojson', regionID, this.selectedStudyArea.Pourpoint[0].Longitude.toString(), this.selectedStudyArea.Pourpoint[0].Latitude.toString(), this.selectedStudyArea.Pourpoint[0].crs.toString());
                                if (this.regionService.selectedRegion.Applications.indexOf('StormDrain') > -1) {
                                    url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSstormwaterDelineation'].format(regionID, this.selectedStudyArea.Pourpoint[0].Longitude.toString(), this.selectedStudyArea.Pourpoint[0].Latitude.toString(), this.surfacecontributionsonly);
                                }
                                request = new WiM.Services.Helpers.RequestInfo(url, true);
                                request.withCredentials = true;
                                this.Execute(request).then(function (response) {
                                    if (_this.regionService.selectedRegion.Applications.indexOf('StormDrain') > -1) {
                                        if (response.data.layers && response.data.layers.features && response.data.layers.features[1].geometry.coordinates.length > 0) {
                                            _this.selectedStudyArea.Disclaimers['isStormDrain'] = true;
                                            var fc = response.data.hasOwnProperty("layers") ? response.data["layers"] : null;
                                            if (fc)
                                                fc.features.forEach(function (f) { return f.id = f.id.toString().toLowerCase(); });
                                            _this.selectedStudyArea.FeatureCollection = fc;
                                            _this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                                            _this.selectedStudyArea.Date = new Date();
                                            _this.toaster.clear();
                                            _this.eventManager.RaiseEvent(Services.onSelectedStudyAreaChanged, _this, StudyAreaEventArgs.Empty);
                                            _this.canUpdate = true;
                                        }
                                        else {
                                            _this.clearStudyArea();
                                            _this.toaster.clear();
                                            _this.toaster.pop("error", "A watershed was not returned from the delineation request", "Please retry", 0);
                                        }
                                    }
                                    else if (response.data.hasOwnProperty("featurecollection") && response.data.featurecollection[1] && response.data.featurecollection[1].feature.features.length > 0) {
                                        _this.selectedStudyArea.Server = response.headers()['usgswim-hostname'].toLowerCase();
                                        _this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                                        _this.selectedStudyArea.FeatureCollection = {
                                            type: "FeatureCollection",
                                            features: _this.reconfigureWatershedResponse(response.data.featurecollection),
                                            bbox: response.data.featurecollection.filter(function (f) { return f.name == "globalwatershed"; })[0].feature.features[0].bbox
                                        };
                                        _this.snappedPourPoint = response.data.featurecollection.filter(function (f) { return f.name == "globalwatershedpoint"; })[0].feature.features[0].geometry.coordinates;
                                        _this.selectedStudyArea.Date = new Date();
                                        _this.toaster.clear();
                                        _this.eventManager.RaiseEvent(Services.onSelectedStudyAreaChanged, _this, StudyAreaEventArgs.Empty);
                                        _this.canUpdate = true;
                                        if (_this.regionService.selectedRegion.Applications.indexOf("HydrologicFeatures") != -1) {
                                            _this.queryHydrologicFeatures();
                                        }
                                    }
                                    else {
                                        _this.clearStudyArea();
                                        _this.toaster.clear();
                                        _this.toaster.pop("error", "A watershed was not returned from the delineation request", "Please retry", 0);
                                    }
                                    _this.selectedStudyArea.FeatureCollection.features.forEach(function (f) { return f.properties = {}; });
                                }, function (error) {
                                    _this.clearStudyArea();
                                    _this.toaster.clear();
                                    _this.toaster.pop("error", "There was an HTTP error with the delineation request", "Please retry", 0);
                                }).finally(function () {
                                });
                                return [3, 8];
                            case 1:
                                delineations = [];
                                features = [];
                                index = 0;
                                _i = 0, _a = this.selectedStudyArea.Pourpoint;
                                _d.label = 2;
                            case 2:
                                if (!(_i < _a.length)) return [3, 7];
                                point = _a[_i];
                                console.log(point);
                                url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSdelineation'].format('geojson', regionID, point.Longitude.toString(), point.Latitude.toString(), point.crs.toString());
                                index = index + 1;
                                request = new WiM.Services.Helpers.RequestInfo(url, true);
                                request.withCredentials = true;
                                i = 0;
                                _d.label = 3;
                            case 3:
                                if (!(i < 3)) return [3, 6];
                                console.log('Try' + i);
                                return [4, this.executeDelineationRequest(request).then(function (response) {
                                        return (response);
                                    })];
                            case 4:
                                result = _d.sent();
                                if (result) {
                                    result.features.forEach(function (feature) {
                                        feature['id'] = feature['id'] + String(index);
                                        feature.properties.WorkspaceID = result.workspaceID;
                                        features.push(feature);
                                    });
                                    delineations.push(result);
                                    return [3, 6];
                                }
                                _d.label = 5;
                            case 5:
                                i++;
                                return [3, 3];
                            case 6:
                                _i++;
                                return [3, 2];
                            case 7:
                                ;
                                if (delineations.length == this.selectedStudyArea.Pourpoint.length) {
                                    this.selectedStudyArea.FeatureCollection = {
                                        type: "FeatureCollection",
                                        features: features,
                                        bbox: null
                                    };
                                    featuresToMerge = [];
                                    for (_b = 0, _c = this.selectedStudyArea.FeatureCollection.features.filter(function (f) { return (f.id).toLowerCase().includes("globalwatershed") && f.geometry.type == 'Polygon'; }); _b < _c.length; _b++) {
                                        feature = _c[_b];
                                        featuresToMerge.push(feature);
                                    }
                                    featuresCollectionToMerge = turf.featureCollection(featuresToMerge);
                                    dissolvedFeatures = turf.dissolve(featuresCollectionToMerge);
                                    dissolvedFeatures.features[0]['id'] = 'globalwatershed';
                                    this.selectedStudyArea.FeatureCollection.features.push(dissolvedFeatures.features[0]);
                                    bbox = turf.bbox(dissolvedFeatures);
                                    this.selectedStudyArea.FeatureCollection['bbox'] = bbox;
                                    this.selectedStudyArea.Date = new Date();
                                    this.toaster.clear();
                                    this.eventManager.RaiseEvent(Services.onSelectedStudyAreaChanged, this, StudyAreaEventArgs.Empty);
                                    this.canUpdate = true;
                                }
                                else {
                                    this.toaster.clear();
                                    this.toaster.pop("error", "A watershed was not returned from the delineation request", "Please retry", 0);
                                }
                                _d.label = 8;
                            case 8: return [2];
                        }
                    });
                });
            };
            StudyAreaService.prototype.executeDelineationRequest = function (request) {
                var _this = this;
                return this.Execute(request).then(function (response) {
                    if (response.data.hasOwnProperty("featurecollection") && response.data.featurecollection[1] && response.data.featurecollection[1].feature.features.length > 0) {
                        _this.selectedStudyArea.Server = response.headers()['usgswim-hostname'].toLowerCase();
                        _this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                        var watershed = {
                            type: "FeatureCollection",
                            features: _this.reconfigureWatershedResponse(response.data.featurecollection),
                            bbox: response.data.featurecollection.filter(function (f) { return f.name == "globalwatershed"; })[0].feature.features[0].bbox,
                            workspaceID: response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null
                        };
                        return watershed;
                    }
                    else {
                        return;
                    }
                }, function (error) {
                    _this.clearStudyArea();
                    _this.toaster.clear();
                    _this.toaster.pop("error", "There was an HTTP error with the delineation request", "Please retry", 0);
                    return;
                }).finally(function () {
                });
            };
            StudyAreaService.prototype.computeAreaWeightedMean = function (values, DRNAREAs) {
                var numerator = 0;
                values.forEach(function (value, index) {
                    numerator = numerator + (value * DRNAREAs[index]);
                });
                var denominator = DRNAREAs.reduce(function (a, b) { return a + b; }, 0);
                return (numerator / denominator);
            };
            StudyAreaService.prototype.computeSum = function (values) {
                return values.reduce(function (a, b) { return a + b; }, 0);
            };
            StudyAreaService.prototype.computeMax = function (values) {
                return Math.max.apply(Math, values);
            };
            StudyAreaService.prototype.computeMin = function (values) {
                return Math.min.apply(Math, values);
            };
            StudyAreaService.prototype.computeCSL10_85fm = function (values, LFPLENGTHs) {
                var maxLFPLENGTHIndex = LFPLENGTHs.indexOf(Math.max.apply(Math, LFPLENGTHs));
                return values[maxLFPLENGTHIndex];
            };
            StudyAreaService.prototype.executeBasinCharacteristicsRequest = function (request) {
                var _this = this;
                return this.Execute(request).then(function (response) {
                    if (response.data.parameters && response.data.parameters.length > 0) {
                        return response.data.parameters;
                    }
                    else {
                        return;
                    }
                }, function (error) {
                    _this.toaster.clear();
                    _this.toaster.pop("error", "There was an HTTP error calculating basin characteristics", "Please retry", 0);
                }).finally(function () {
                });
            };
            StudyAreaService.prototype.loadWatershed = function (rcode, workspaceID) {
                var _this = this;
                try {
                    this.toaster.pop("wait", "Opening Basin", "Please wait...", 0);
                    var studyArea = new StreamStats.Models.StudyArea(rcode, null);
                    this.AddStudyArea(studyArea);
                    var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSwatershedByWorkspace'].format('geojson', rcode, workspaceID, 4326, false);
                    var request = new WiM.Services.Helpers.RequestInfo(url, true);
                    request.withCredentials = true;
                    this.Execute(request).then(function (response) {
                        _this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                        _this.selectedStudyArea.Date = new Date();
                        _this.selectedStudyArea.FeatureCollection = {
                            type: "FeatureCollection",
                            features: _this.reconfigureWatershedResponse(response.data.featurecollection),
                            bbox: response.data.featurecollection.filter(function (f) { return f.name == "globalwatershed"; })[0].feature.features[0].bbox
                        };
                        var pointFeature = response.data.featurecollection.filter(function (f) { return f.name == "globalwatershedpoint"; })[0].feature.features[0];
                        _this.selectedStudyArea.Pourpoint[0] = new WiM.Models.Point(pointFeature.bbox[1], pointFeature.bbox[0], pointFeature.crs.properties.code);
                    }, function (error) {
                        _this.toaster.clear();
                        _this.toaster.pop("error", "Error Delineating Basin", "Please retry", 0);
                    }).finally(function () {
                        _this.canUpdate = true;
                        _this.eventManager.RaiseEvent(Services.onSelectedStudyAreaChanged, _this, StudyAreaEventArgs.Empty);
                        _this.toaster.clear();
                    });
                }
                catch (err) {
                    return;
                }
            };
            StudyAreaService.prototype.loadEditedStudyBoundary = function () {
                var _this = this;
                this.toaster.pop("wait", "Loading Edited Basin", "Please wait...", 0);
                this.canUpdate = false;
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSeditBasin'].format('geojson', this.selectedStudyArea.RegionID, this.selectedStudyArea.WorkspaceID, this.selectedStudyArea.Pourpoint[0].crs.toString());
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.PUT, 'json', angular.toJson(this.WatershedEditDecisionList), {});
                request.withCredentials = true;
                this.Execute(request).then(function (response) {
                    _this.AddStudyArea(new StreamStats.Models.StudyArea(_this.selectedStudyArea.RegionID, _this.selectedStudyArea.Pourpoint));
                    _this.selectedStudyArea.FeatureCollection = {
                        type: "FeatureCollection",
                        features: _this.reconfigureWatershedResponse(response.data.featurecollection),
                        bbox: response.data.featurecollection.filter(function (f) { return f.name.toLowerCase() == "globalwatershed"; })[0].feature.features[0].bbox
                    };
                    _this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                    _this.selectedStudyArea.Date = new Date();
                    _this.toaster.clear();
                }, function (error) {
                    _this.toaster.clear();
                    _this.toaster.pop("error", "Error Delineating Basin", "Please retry", 0);
                }).finally(function () {
                    _this.canUpdate = true;
                    var evnt = new StudyAreaEventArgs();
                    evnt.studyArea = _this.selectedStudyArea;
                    _this.eventManager.RaiseEvent(Services.onSelectedStudyAreaChanged, _this, evnt);
                    _this.selectedStudyArea.Disclaimers['isEdited'] = true;
                });
            };
            StudyAreaService.prototype.loadDrainageArea = function () {
                var _this = this;
                this.loadingDrainageArea = true;
                this.toaster.clear();
                this.toaster.pop('wait', "Calculating Drainage Area", "Please wait...", 0);
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(this.selectedStudyArea.RegionID, this.selectedStudyArea.WorkspaceID, 'drnarea');
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                request.withCredentials = true;
                this.Execute(request).then(function (response) {
                    if (response.data.parameters && response.data.parameters.length > 0) {
                        _this.toaster.clear();
                        var paramErrors = false;
                        angular.forEach(response.data.parameters, function (parameter, index) {
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
                            _this.toaster.pop('error', "Error", "Drainage area failed to compute", 0);
                        }
                        var results = response.data.parameters;
                        _this.loadParameterResults(results);
                        _this.loadingDrainageArea = false;
                    }
                }, function (error) {
                    _this.loadingDrainageArea = false;
                    _this.toaster.clear();
                    _this.toaster.pop("error", "There was an HTTP error calculating drainage area", "Please retry", 0);
                }).finally(function () {
                });
            };
            StudyAreaService.prototype.lineIntersection = function (line) {
                var _this = this;
                var data = {
                    'region': 'SC',
                    'startPoint': line.point1,
                    'endPoint': line.point2
                };
                var url = configuration.baseurls['PourPointServices'] + configuration.queryparams['lineIntersection'];
                var headers = {
                    "Content-Type": "application/json",
                    "X-warning": true
                };
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', JSON.stringify(data), headers);
                return this.Execute(request).then(function (response) {
                    console.log(response.data.response.points.length);
                    if (response.data.response.points.length == 0) {
                        _this.toaster.pop("error", "Error", "Delineation not possible. Line does not intersect any streams.", 0);
                        throw new Error;
                    }
                    else if (response.data.response.points.length > 10) {
                        _this.toaster.pop("error", "Error", "Delineation not possible. Line has more than 10 intersections.", 0);
                        throw new Error;
                    }
                    else {
                        return _this.checkExcludePolygon(response.data.response);
                    }
                }, function (error) {
                }).finally(function () {
                });
            };
            StudyAreaService.prototype.checkExcludePolygon = function (points) {
                var data = {
                    'region': 'SC',
                    'points': points["points"]
                };
                var url = configuration.baseurls['PourPointServices'] + configuration.queryparams['checkExcludePolygons'];
                var headers = {
                    "Content-Type": "application/json",
                    "X-warning": true
                };
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', JSON.stringify(data), headers);
                return this.Execute(request).then(function (response) {
                    return (response.data.response);
                }, function (error) {
                }).finally(function () {
                });
            };
            StudyAreaService.prototype.loadAllIndexGages = function () {
                var _this = this;
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['KrigService'].format(this.selectedStudyArea.RegionID, this.selectedStudyArea.Pourpoint[0].Longitude, this.selectedStudyArea.Pourpoint[0].Latitude, this.selectedStudyArea.Pourpoint[0].crs, '300');
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    _this.allIndexGages = response.data;
                }, function (error) {
                    _this.allIndexGages = [];
                    _this.toaster.clear();
                    _this.toaster.pop('error', "There was an HTTP error returning index gages.", "Please retry", 0);
                }).finally(function () {
                });
            };
            StudyAreaService.prototype.loadParameters = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var argState, requestParameterList, saEvent, basinCharacteristicResponses, finalResponse, computationDictionary, roundingDictionary, _i, _a, feature, url, request, i, result, basinCharacteristics, parametersCombined_1, parameterResults, parameterCode, value, isNull, paramErrors, saEvent, url, request;
                    var _this = this;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                this.parametersLoading = true;
                                argState = { "isLoaded": false };
                                requestParameterList = [];
                                this.toaster.clear();
                                this.toaster.pop('wait', "Calculating Selected Basin Characteristics", "Please wait...", 0);
                                this.eventManager.RaiseEvent(Services.onSelectedStudyParametersLoaded, this, StudyAreaEventArgs.Empty);
                                if (!this.selectedStudyArea || !this.selectedStudyArea.WorkspaceID || !this.selectedStudyArea.RegionID) {
                                    alert('No Study Area');
                                    return [2];
                                }
                                requestParameterList = this.studyAreaParameterList.filter(function (param) { return (!param.value || param.value < 0); }).map(function (param) { return param.code; });
                                if (requestParameterList.length == 0 && this.regionService.selectedRegion.Applications.indexOf('FDCTM') > -1)
                                    requestParameterList.push('drnarea');
                                if (requestParameterList.length < 1) {
                                    saEvent = new StudyAreaEventArgs();
                                    saEvent.parameterLoaded = true;
                                    this.eventManager.RaiseEvent(Services.onSelectedStudyParametersLoaded, this, saEvent);
                                    this.toaster.clear();
                                    this.parametersLoading = false;
                                    return [2];
                                }
                                basinCharacteristicResponses = [];
                                finalResponse = [];
                                if (!(this.selectedStudyArea.Pourpoint.length > 1)) return [3, 7];
                                computationDictionary = {
                                    "BSLDEM30FT": "areaWeightedMean",
                                    "CSL10_85fm": "CSL10_85fm",
                                    "DRNAREA": "sum",
                                    "ELEV": "areaWeightedMean",
                                    "ELEVMAX": "max",
                                    "I24H100Y": "max",
                                    "I24H10Y": "max",
                                    "I24H25Y": "max",
                                    "I24H2Y": "max",
                                    "I24H50Y": "max",
                                    "LC01DEV": "areaWeightedMean",
                                    "LC01FOREST": "areaWeightedMean",
                                    "LC01IMP": "areaWeightedMean",
                                    "LC06DEV": "areaWeightedMean",
                                    "LC06FOREST": "areaWeightedMean",
                                    "LC06IMP": "areaWeightedMean",
                                    "LC11DEV": "areaWeightedMean",
                                    "LC11FOREST": "areaWeightedMean",
                                    "LC11IMP": "areaWeightedMean",
                                    "LC16DEV": "areaWeightedMean",
                                    "LC16FOREST": "areaWeightedMean",
                                    "LC16IMP": "areaWeightedMean",
                                    "LC16STOR": "areaWeightedMean",
                                    "LC19IMP": "areaWeightedMean",
                                    "LFPLENGTH": "max",
                                    "MINBELEV": "min",
                                    "PCTREG1": "areaWeightedMean",
                                    "PCTREG2": "areaWeightedMean",
                                    "PCTREG3": "areaWeightedMean",
                                    "PCTREG4": "areaWeightedMean",
                                    "PCTREG5": "areaWeightedMean",
                                    "PRECIP": "areaWeightedMean",
                                    "RCN": "areaWeightedMean",
                                    "SSURGOA": "areaWeightedMean",
                                    "SSURGOB": "areaWeightedMean",
                                    "SSURGOC": "areaWeightedMean",
                                    "SSURGOD": "areaWeightedMean",
                                    "STORAGE": "areaWeightedMean"
                                };
                                roundingDictionary = {
                                    "BSLDEM30FT": 1,
                                    "CSL10_85fm": 2,
                                    "DRNAREA": 1,
                                    "ELEV": 1,
                                    "ELEVMAX": 1,
                                    "I24H100Y": 1,
                                    "I24H10Y": 1,
                                    "I24H25Y": 1,
                                    "I24H2Y": 1,
                                    "I24H50Y": 1,
                                    "LC01DEV": 1,
                                    "LC01FOREST": 1,
                                    "LC01IMP": 2,
                                    "LC06DEV": 1,
                                    "LC06FOREST": 1,
                                    "LC06IMP": 2,
                                    "LC11DEV": 1,
                                    "LC11FOREST": 1,
                                    "LC11IMP": 2,
                                    "LC16DEV": 1,
                                    "LC16FOREST": 1,
                                    "LC16IMP": 1,
                                    "LC16STOR": 1,
                                    "LC19IMP": 1,
                                    "LFPLENGTH": 3,
                                    "MINBELEV": 1,
                                    "PCTREG1": 1,
                                    "PCTREG2": 1,
                                    "PCTREG3": 1,
                                    "PCTREG4": 1,
                                    "PCTREG5": 1,
                                    "PRECIP": 1,
                                    "RCN": 2,
                                    "SSURGOA": 1,
                                    "SSURGOB": 1,
                                    "SSURGOC": 1,
                                    "SSURGOD": 1,
                                    "STORAGE": 1
                                };
                                requestParameterList.forEach(function (parameterCode) {
                                    if (parameterCode == 'CSL10_85fm' && requestParameterList.indexOf('LFPLENGTH') == -1) {
                                        requestParameterList.push('LFPLENGTH');
                                    }
                                    else if (computationDictionary[parameterCode] == "areaWeightedMean" && requestParameterList.indexOf('DRNAREA') == -1) {
                                        requestParameterList.push('DRNAREA');
                                    }
                                });
                                console.log(requestParameterList);
                                console.log(this.selectedStudyArea.FeatureCollection.features[2].properties);
                                _i = 0, _a = this.selectedStudyArea.FeatureCollection.features.filter(function (f) { return (f.id).toLowerCase().includes("globalwatershed") && f.geometry.type == 'Polygon' && /\d/.test((f.id)); });
                                _b.label = 1;
                            case 1:
                                if (!(_i < _a.length)) return [3, 6];
                                feature = _a[_i];
                                url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(this.selectedStudyArea.RegionID, feature.properties.WorkspaceID, requestParameterList.join(','));
                                request = new WiM.Services.Helpers.RequestInfo(url, true);
                                request.withCredentials = true;
                                i = 0;
                                _b.label = 2;
                            case 2:
                                if (!(i < 3)) return [3, 5];
                                console.log('Try' + i);
                                return [4, this.executeBasinCharacteristicsRequest(request).then(function (response) {
                                        return (response);
                                    })];
                            case 3:
                                result = _b.sent();
                                if (result) {
                                    feature.properties.parameters = result;
                                    finalResponse = structuredClone(result);
                                    finalResponse.forEach(function (p) { p.value = null; });
                                    finalResponse.forEach(function (p) { p.loaded = false; });
                                    basinCharacteristicResponses.push(result);
                                    return [3, 5];
                                }
                                _b.label = 4;
                            case 4:
                                i++;
                                return [3, 2];
                            case 5:
                                _i++;
                                return [3, 1];
                            case 6:
                                basinCharacteristics = basinCharacteristicResponses.reduce(function (a, b) { return a.concat(b); }, []);
                                parametersCombined_1 = {};
                                basinCharacteristics.forEach(function (parameter) {
                                    if (parametersCombined_1.hasOwnProperty(parameter.code)) {
                                        parametersCombined_1[parameter.code].push(parameter.value);
                                    }
                                    else {
                                        parametersCombined_1[parameter.code] = [parameter.value];
                                    }
                                });
                                parameterResults = {};
                                for (parameterCode in parametersCombined_1) {
                                    value = null;
                                    console.log(parametersCombined_1[parameterCode]);
                                    console.log(computationDictionary[parameterCode]);
                                    isNull = false;
                                    parametersCombined_1[parameterCode].forEach(function (value) {
                                        console.log(value);
                                        if (value == null) {
                                            isNull = true;
                                            console.log(isNull);
                                        }
                                    });
                                    if (isNull == false) {
                                        try {
                                            switch (computationDictionary[parameterCode]) {
                                                case "areaWeightedMean":
                                                    value = this.computeAreaWeightedMean(parametersCombined_1[parameterCode], parametersCombined_1["DRNAREA"]);
                                                    break;
                                                case "sum":
                                                    value = this.computeSum(parametersCombined_1[parameterCode]);
                                                    break;
                                                case "max":
                                                    value = this.computeMax(parametersCombined_1[parameterCode]);
                                                    break;
                                                case "min":
                                                    value = this.computeMin(parametersCombined_1[parameterCode]);
                                                    break;
                                                case "CSL10_85fm":
                                                    value = this.computeCSL10_85fm(parametersCombined_1[parameterCode], parametersCombined_1["LFPLENGTH"]);
                                                    break;
                                            }
                                            value = Number(value.toFixed(roundingDictionary[parameterCode]));
                                        }
                                        catch (error) {
                                            console.log(error);
                                            value = null;
                                        }
                                    }
                                    else {
                                        value = null;
                                    }
                                    parameterResults[parameterCode] = value;
                                }
                                ;
                                console.log(parameterResults);
                                paramErrors = false;
                                finalResponse.forEach(function (parameter) {
                                    parameter["value"] = parameterResults[parameter["code"]];
                                    parameter["loaded"] = parameterResults[parameter["code"]] == null ? false : true;
                                    if (parameterResults[parameter["code"]] == null) {
                                        paramErrors = true;
                                    }
                                });
                                if (paramErrors) {
                                    this.showModifyBasinCharacterstics = true;
                                    this.toaster.pop('error', "One or more basin characteristics failed to compute", "Click the 'Calculate Missing Parameters' button or manually enter parameter values to continue", 0);
                                }
                                console.log(finalResponse);
                                this.toaster.clear();
                                this.parametersLoading = false;
                                this.loadParameterResults(finalResponse);
                                saEvent = new StudyAreaEventArgs();
                                saEvent.parameterLoaded = true;
                                this.eventManager.RaiseEvent(Services.onSelectedStudyParametersLoaded, this, saEvent);
                                return [3, 8];
                            case 7:
                                url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(this.selectedStudyArea.RegionID, this.selectedStudyArea.WorkspaceID, requestParameterList.join(','));
                                request = new WiM.Services.Helpers.RequestInfo(url, true);
                                request.withCredentials = true;
                                this.Execute(request).then(function (response) {
                                    if (response.data.parameters && response.data.parameters.length > 0) {
                                        _this.toaster.clear();
                                        var paramErrors = false;
                                        angular.forEach(response.data.parameters, function (parameter, index) {
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
                                            _this.showModifyBasinCharacterstics = true;
                                            _this.toaster.pop('error', "One or more basin characteristics failed to compute", "Click the 'Calculate Missing Parameters' button or manually enter parameter values to continue", 0);
                                        }
                                        var results = response.data.parameters;
                                        _this.loadParameterResults(results);
                                        _this.getAdditionalFeatureList();
                                        if (_this.selectedStudyArea.Disclaimers['isRegulated']) {
                                            _this.loadRegulatedParameterResults(_this.regulationCheckResults.parameters);
                                        }
                                        var saEvent = new StudyAreaEventArgs();
                                        saEvent.parameterLoaded = true;
                                        _this.eventManager.RaiseEvent(Services.onSelectedStudyParametersLoaded, _this, saEvent);
                                    }
                                }, function (error) {
                                    _this.toaster.clear();
                                    _this.toaster.pop("error", "There was an HTTP error calculating basin characteristics", "Please retry", 0);
                                }).finally(function () {
                                    _this.parametersLoading = false;
                                });
                                _b.label = 8;
                            case 8: return [2];
                        }
                    });
                });
            };
            StudyAreaService.prototype.getAdditionalFeatureList = function () {
                var _this = this;
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSavailableFeatures'].format(this.selectedStudyArea.WorkspaceID);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                request.withCredentials = true;
                this.Execute(request).then(function (response) {
                    if (response.data.featurecollection && response.data.featurecollection.length > 0) {
                        _this.additionalFeaturesLoaded = false;
                        var features = [];
                        angular.forEach(response.data.featurecollection, function (feature, index) {
                            if (_this.selectedStudyArea.FeatureCollection.features.map(function (f) { return f.id; }).indexOf(feature.name) === -1) {
                                features.push(feature.name);
                            }
                        });
                        _this.getAdditionalFeatures(features.join(','));
                    }
                    else {
                        _this.additionalFeaturesLoaded = true;
                    }
                }, function (error) {
                    _this.toaster.clear();
                    _this.additionalFeaturesLoaded = true;
                    _this.toaster.pop("error", "There was an HTTP error requesting additional feautres list", "Please retry", 0);
                }).finally(function () {
                });
            };
            StudyAreaService.prototype.getAdditionalFeatures = function (featureString) {
                var _this = this;
                if (!featureString) {
                    this.additionalFeaturesLoaded = true;
                    return;
                }
                this.toaster.pop('wait', "Downloading additional features", "Please wait...", 0);
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSfeatures'].format(this.selectedStudyArea.WorkspaceID, 4326, featureString);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                request.withCredentials = true;
                this.Execute(request).then(function (response) {
                    if (response.data.featurecollection && response.data.featurecollection.length > 0) {
                        _this.toaster.clear();
                        var features = _this.reconfigureWatershedResponse(response.data.featurecollection);
                        angular.forEach(features, function (feature, index) {
                            if (features.length < 1) {
                                for (var i = 0; i < _this.selectedStudyArea.FeatureCollection.features.length; i++) {
                                    if (_this.selectedStudyArea.FeatureCollection.features[i].id.toLowerCase() === feature.id.toLowerCase()) {
                                        _this.selectedStudyArea.FeatureCollection.features.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                            else {
                                _this.selectedStudyArea.FeatureCollection.features.push(feature);
                            }
                            if (feature && (feature.id == "longestflowpath3d" || feature.id == "longestflowpath")) {
                                _this.eventManager.RaiseEvent(WiM.Directives.onLayerAdded, _this, new WiM.Directives.LegendLayerAddedEventArgs(feature.id, "geojson", { displayName: feature.id, imagesrc: null }, true));
                            }
                            else {
                                _this.eventManager.RaiseEvent(WiM.Directives.onLayerAdded, _this, new WiM.Directives.LegendLayerAddedEventArgs(feature.id, "geojson", { displayName: feature.id, imagesrc: null }, false));
                            }
                            _this.eventManager.RaiseEvent(Services.onAdditionalFeaturesLoaded, _this, '');
                        });
                    }
                    _this.additionalFeaturesLoaded = true;
                }, function (error) {
                    _this.toaster.clear();
                    _this.toaster.pop("error", "There was an HTTP error getting additional features", "Please retry", 0);
                    _this.additionalFeaturesLoaded = true;
                }).finally(function () {
                });
            };
            StudyAreaService.prototype.queryLandCover = function () {
                var _this = this;
                this.toaster.pop('wait', "Querying Land Cover Data with your Basin", "Please wait...", 0);
                var esriJSON = '{"geometryType":"esriGeometryPolygon","spatialReference":{"wkid":"4326"},"fields": [],"features":[{"geometry": {"type":"polygon", "rings":[' + JSON.stringify(this.selectedStudyArea.FeatureCollection.features.filter(function (f) { return (f.id).toLowerCase() == "globalwatershed"; })[0].geometry.coordinates) + ']}}]}';
                var url = configuration.baseurls['NationalMapRasterServices'] + configuration.queryparams['NLCDQueryService'];
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', { InputLineFeatures: esriJSON, returnZ: true, f: 'json' }, { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, WiM.Services.Helpers.paramsTransform);
                this.Execute(request).then(function (response) {
                    _this.toaster.clear();
                    if (response.data.length > 0) {
                        _this.toaster.pop('success', "Land Cover was succcessfully queried", "Please continue", 5000);
                    }
                }, function (error) {
                    _this.toaster.pop('error', "There was an HTTP error querying Land Cover", "Please retry", 0);
                    return _this.$q.reject(error.data);
                }).finally(function () {
                });
            };
            StudyAreaService.prototype.queryCoordinatedReach = function () {
                var _this = this;
                this.toaster.pop('wait', "Checking if study area is a coordinated reach.", "Please wait...", 0);
                var ppt = this.snappedPourPoint;
                var turfPoint = turf.point([ppt[0], ppt[1]]);
                var distance = 0.005;
                var bearings = [-90, 0, 90, 180];
                var boundingBox = [];
                bearings.forEach(function (bearing, index) {
                    var destination = turf.destination(turfPoint, distance, bearing);
                    boundingBox[index] = destination.geometry.coordinates[index % 2 == 0 ? 0 : 1];
                });
                var outFields = "eqWithStrID.Stream_Name,eqWithStrID.StreamID_ID,eqWithStrID.BASIN_NAME,eqWithStrID.BEGIN_DA,eqWithStrID.END_DA,eqWithStrID.DVA_EQ_ID,eqWithStrID.a10,eqWithStrID.b10,eqWithStrID.a25,eqWithStrID.b25,eqWithStrID.a50,eqWithStrID.b50,eqWithStrID.a100,eqWithStrID.b100,eqWithStrID.a500,eqWithStrID.b500";
                var url = configuration.baseurls['StreamStatsMapServices'] + configuration.queryparams['coordinatedReachQueryService']
                    .format(this.selectedStudyArea.RegionID.toLowerCase(), boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3], this.selectedStudyArea.Pourpoint[0].crs, outFields);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    if (response.data.error) {
                        _this.toaster.pop('error', "There was an error querying coordinated reach", response.data.error.message, 0);
                        return;
                    }
                    if (response.data.features.length > 0) {
                        var attributes = response.data.features[0].attributes;
                        _this.selectedStudyArea.CoordinatedReach = new StreamStats.Models.CoordinatedReach(attributes["eqWithStrID.BASIN_NAME"], attributes["eqWithStrID.DVA_EQ_ID"], attributes["eqWithStrID.Stream_Name"], attributes["eqWithStrID.StreamID_ID"], attributes["eqWithStrID.BEGIN_DA"], attributes["eqWithStrID.END_DA"]);
                        delete attributes["eqWithStrID.BASIN_NAME"];
                        delete attributes["eqWithStrID.DVA_EQ_ID"];
                        var feildprecursor = "eqWithStrID.";
                        var pkID = Object.keys(attributes).map(function (key, index) {
                            return key.substr(feildprecursor.length + 1);
                        }).filter(function (value, index, self) { return self.indexOf(value) === index; });
                        for (var i = 0; i < pkID.length; i++) {
                            var code = pkID[i];
                            var acoeff = attributes[feildprecursor + "a" + code];
                            var bcoeff = attributes[feildprecursor + "b" + code];
                            if (acoeff != null && bcoeff != null)
                                _this.selectedStudyArea.CoordinatedReach.AddFlowCoefficient("PK" + code, acoeff, bcoeff);
                        }
                        _this.toaster.pop('success', "Selected reach is a coordinated reach", "Please continue", 5000);
                    }
                }, function (error) {
                    _this.toaster.pop('error', "There was an HTTP error querying coordinated reach", "Please retry", 0);
                });
            };
            StudyAreaService.prototype.queryHydrologicFeatures = function () {
                var _this = this;
                var snappedDelineationPoint = turf.point([this.snappedPourPoint[0], this.snappedPourPoint[1]]);
                var delineatedBasinGeometry = this.selectedStudyArea.FeatureCollection.features[1].geometry;
                var NHDStreamIntersections = {};
                var nhdLayerOptions = {
                    "url": configuration.baseurls['NationalMapServices'] + configuration.queryparams['NHDQueryService']
                };
                var nhdLayer = L.esri.dynamicMapLayer(nhdLayerOptions);
                nhdLayer.query().intersects(delineatedBasinGeometry).where("GNIS_ID IS NOT NULL")
                    .run(function (error, results) {
                    if (error) {
                        _this.toaster.pop('error', "There was an error querying NHD streams", error, 0);
                        _this.selectedStudyArea.NHDStreamIntersections = [];
                    }
                    else if (results && results.features.length > 0) {
                        results.features.forEach(function (feature) {
                            if (feature.properties["gnis_id"]) {
                                var stream = turf.lineString(feature.geometry.coordinates);
                                var distanceToPourPoint = turf.pointToLineDistance(snappedDelineationPoint, stream) * 1000 * 3.28084;
                                if (Object.keys(NHDStreamIntersections).indexOf(feature.properties["gnis_id"]) == -1) {
                                    NHDStreamIntersections[feature.properties["gnis_id"]] = { "GNIS_ID": feature.properties["gnis_id"], "GNIS_NAME": feature.properties["gnis_name"], "distanceToPourPoint": distanceToPourPoint };
                                }
                                else {
                                    if (distanceToPourPoint < NHDStreamIntersections[feature.properties["gnis_id"]]["distanceToPourPoint"]) {
                                        NHDStreamIntersections[feature.properties["gnis_id"]]["distanceToPourPoint"] = distanceToPourPoint;
                                    }
                                }
                            }
                        });
                        _this.selectedStudyArea.NHDStreamIntersections = Object.keys(NHDStreamIntersections).map(function (key) { return NHDStreamIntersections[key]; });
                        var minDistanceToPourPointFeature = _this.selectedStudyArea.NHDStreamIntersections.reduce(function (prev, curr) {
                            return prev.distanceToPourPoint < curr.distanceToPourPoint ? prev : curr;
                        });
                        _this.selectedStudyArea.NHDStream = minDistanceToPourPointFeature;
                        _this.selectedStudyArea.defaultNHDStream = minDistanceToPourPointFeature;
                    }
                    else if (results && results.features.length == 0) {
                        _this.selectedStudyArea.NHDStreamIntersections = [];
                    }
                    else {
                        _this.toaster.pop('error', "There was an error querying NHD streams", "Please retry", 0);
                        _this.selectedStudyArea.NHDStreamIntersections = [];
                    }
                });
                var WBDHUC8Intersections = {};
                var wbdLayerOptions = {
                    "url": configuration.baseurls['NationalMapServices'] + configuration.queryparams['WBDQueryService']
                };
                var wbdLayer = L.esri.dynamicMapLayer(wbdLayerOptions);
                wbdLayer.query().intersects(delineatedBasinGeometry).where("huc8 IS NOT NULL")
                    .run(function (error, results) {
                    if (error) {
                        _this.toaster.pop('error', "There was an error querying WBD HUC 8 watersheds", error, 0);
                        _this.selectedStudyArea.WBDHUC8Intersections = [];
                    }
                    else if (results && results.features.length > 0) {
                        results.features.forEach(function (feature) {
                            if (feature.properties.huc8) {
                                var huc8 = turf.polygon(feature.geometry.coordinates);
                                if (turf.booleanPointInPolygon(snappedDelineationPoint, huc8)) {
                                    var distanceToPourPoint = 0;
                                }
                                else {
                                    var distanceToPourPoint = turf.pointToLineDistance(snappedDelineationPoint, turf.polygonToLineString(huc8)) * 1000 * 3.28084;
                                }
                                if (Object.keys(WBDHUC8Intersections).indexOf(feature.properties.huc8) == -1) {
                                    WBDHUC8Intersections[feature.properties.huc8] = { "huc8": feature.properties.huc8, "name": feature.properties.name, "distanceToPourPoint": distanceToPourPoint };
                                }
                                else {
                                    if (distanceToPourPoint < WBDHUC8Intersections[feature.properties.huc8]["distanceToPourPoint"]) {
                                        WBDHUC8Intersections[feature.properties.huc8]["distanceToPourPoint"] = distanceToPourPoint;
                                    }
                                }
                            }
                        });
                        _this.selectedStudyArea.WBDHUC8Intersections = Object.keys(WBDHUC8Intersections).map(function (key) { return WBDHUC8Intersections[key]; });
                        var minDistanceToPourPointFeature = _this.selectedStudyArea.WBDHUC8Intersections.reduce(function (prev, curr) {
                            return prev.distanceToPourPoint < curr.distanceToPourPoint ? prev : curr;
                        });
                        _this.selectedStudyArea.WBDHUC8 = minDistanceToPourPointFeature;
                        _this.selectedStudyArea.defaultWBDHUC8 = minDistanceToPourPointFeature;
                    }
                    else if (results && results.features.length == 0) {
                        _this.selectedStudyArea.WBDHUC8Intersections = [];
                    }
                    else {
                        _this.toaster.pop('error', "There was an error querying WBD HUC 8 watersheds", "Please retry", 0);
                        _this.selectedStudyArea.WBDHUC8Intersections = [];
                    }
                });
            };
            StudyAreaService.prototype.queryRegressionRegions = function () {
                var _this = this;
                this.toaster.pop('wait', "Querying regression regions with your Basin", "Please wait...", 0);
                this.regressionRegionQueryLoading = true;
                this.regressionRegionQueryComplete = false;
                var headers = {
                    "Content-Type": "application/json",
                    "X-Is-StreamStats": true
                };
                var url = configuration.baseurls['NSS'] + configuration.queryparams['RegressionRegionQueryService'];
                var studyArea = this.simplify(angular.fromJson(angular.toJson(this.selectedStudyArea.FeatureCollection.features.filter(function (f) { return (f.id).toLowerCase() == "globalwatershed"; })[0])));
                var studyAreaGeom = studyArea.geometry;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, "json", angular.toJson(studyAreaGeom), headers);
                this.Execute(request).then(function (response) {
                    _this.NSSServicesVersion = response.headers()['x-version'];
                    _this.toaster.clear();
                    if (response.data.error) {
                        _this.toaster.pop('error', "There was an error querying regression regions", response.data.error.message, 0);
                        return;
                    }
                    if (response.data.length == 0) {
                        _this.regressionRegionQueryComplete = true;
                        _this.selectedStudyArea.RegressionRegions = response.data;
                        _this.toaster.pop('error', "No regression regions were returned", "Regression based scenario computation not allowed", 0);
                        return;
                    }
                    if (response.data.length > 0) {
                        _this.regressionRegionQueryComplete = true;
                        response.data.forEach(function (p) { p.code = p.code.toUpperCase().split(","); });
                        _this.selectedStudyArea.RegressionRegions = response.data;
                        _this.toaster.pop('success', "Regression regions were succcessfully queried", "Please continue", 5000);
                    }
                }, function (error) {
                    _this.toaster.pop('error', "There was an HTTP error querying Regression regions", "Please retry", 0);
                    return _this.$q.reject(error.data);
                }).finally(function () {
                    _this.regressionRegionQueryLoading = false;
                });
            };
            StudyAreaService.prototype.queryKarst = function (regionID, regionMapLayerList) {
                var _this = this;
                this.toaster.pop('wait', "Querying for Karst Areas", "Please wait...", 0);
                var layerID;
                regionMapLayerList.forEach(function (item) {
                    if (item[0] == 'ExcludePolys')
                        layerID = item[1];
                });
                this.regressionRegionQueryLoading = true;
                this.regressionRegionQueryComplete = false;
                var watershed = '{"rings":' + angular.toJson(this.selectedStudyArea.FeatureCollection.features.filter(function (f) { return (f.id).toLowerCase() == "globalwatershed"; })[0].geometry.coordinates, null) + ',"spatialReference":{"wkid":4326}}';
                var options = {
                    where: '1=1',
                    geometry: watershed,
                    geometryType: 'esriGeometryPolygon',
                    inSR: 4326,
                    spatialRel: 'esriSpatialRelIntersects',
                    outFields: '*',
                    returnGeometry: false,
                    outSR: 4326,
                    returnIdsOnly: false,
                    returnCountOnly: false,
                    returnZ: false,
                    returnM: false,
                    returnDistinctValues: false,
                    returnTrueCurves: false,
                    f: 'json'
                };
                var url = configuration.baseurls.StreamStatsMapServices + configuration.queryparams.SSStateLayers + '/' + layerID + '/query';
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', options, { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, WiM.Services.Helpers.paramsTransform);
                this.Execute(request).then(function (response) {
                    _this.toaster.clear();
                    if (response.status == 200) {
                        _this.toaster.pop('success', "Karst regions were succcessfully queried", "Please continue", 5000);
                        var karstFound = false;
                        if (response.data.features.length > 0) {
                            response.data.features.forEach(function (exclusionArea) {
                                if (exclusionArea.attributes.ExcludeCode == 2) {
                                    karstFound = true;
                                    _this.toaster.pop("warning", "Warning", exclusionArea.attributes.ExcludeReason, 0);
                                    _this.selectedStudyArea.Disclaimers['hasKarst'] = exclusionArea.attributes.ExcludeReason;
                                }
                            });
                            if (!karstFound)
                                _this.toaster.pop('success', "No Karst found", "Please continue", 5000);
                        }
                    }
                    else {
                        _this.toaster.pop('error', "Error", "Karst region query failed", 0);
                    }
                }, function (error) {
                    _this.toaster.pop('error', "There was an HTTP error querying Regression regions", "Please retry", 0);
                    return _this.$q.reject(error.data);
                }).finally(function () {
                    _this.regressionRegionQueryLoading = false;
                });
            };
            StudyAreaService.prototype.queryNWIS = function (latlng) {
                var _this = this;
                if (!latlng || !latlng.lng || !latlng.lat)
                    return;
                if (!this.selectedStudyAreaExtensions)
                    return;
                var sid = this.selectedStudyAreaExtensions.reduce(function (acc, val) { return acc.concat(val.parameters); }, []).filter(function (f) { return (f.code).toLowerCase() == "sid"; });
                if (sid.length < 0)
                    return;
                var ppt = latlng;
                var ex = new L.Circle([ppt.lat, ppt.lng], 100).getBounds();
                var url = configuration.baseurls['NWISurl'] + configuration.queryparams['NWISsite']
                    .format(ex.getWest().toFixed(7), ex.getSouth().toFixed(7), ex.getEast().toFixed(7), ex.getNorth().toFixed(7));
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    if (response.data.error) {
                        _this.toaster.pop('error', "There was an error querying NWIS", response.data.error.message, 0);
                        return;
                    }
                    if (response.data) {
                        var siteList = [];
                        var data = response.data.split('\n').filter(function (r) { return (!r.startsWith("#") && r != ""); });
                        var headers = data.shift().split('\t');
                        data.shift();
                        do {
                            var station = data.shift().split('\t');
                            if (station[headers.indexOf("parm_cd")] == "00060") {
                                console.log(station[headers.indexOf("site_no")]);
                                var rg = new StreamStats.Models.ReferenceGage(station[headers.indexOf("site_no")], station[headers.indexOf("station_nm")]);
                                rg.Latitude_DD = station[headers.indexOf("dec_lat_va")];
                                rg.Longitude_DD = station[headers.indexOf("dec_long_va")];
                                siteList.push(rg);
                            }
                        } while (data.length > 0);
                        if (siteList.length > 0) {
                            sid[0].options = siteList;
                            sid[0].value = siteList[0];
                            _this.toaster.pop('success', "Found USGS NWIS index gage", "Please continue", 5000);
                            _this.modalservices.openModal(Services.SSModalType.e_extensionsupport);
                            _this.doSelectMapGage = false;
                        }
                    }
                }, function (error) {
                    _this.toaster.pop('warning', "No USGS NWIS index gage found at this location.", "Try zooming in closer or a different location", 5000);
                });
            };
            StudyAreaService.prototype.selectGage = function (gage) {
                var sid = this.selectedStudyAreaExtensions.reduce(function (acc, val) { return acc.concat(val.parameters); }, []).filter(function (f) { return (f.code).toLowerCase() == "sid"; });
                var siteList = [];
                var rg = new StreamStats.Models.ReferenceGage(gage.properties.Code, gage.properties.Name);
                rg.Latitude_DD = gage.geometry.coordinates[0];
                rg.Longitude_DD = gage.geometry.coordinates[1];
                rg.properties = gage.properties;
                siteList.push(rg);
                if (siteList.length > 0) {
                    sid[0].options = siteList;
                    sid[0].value = new StreamStats.Models.ReferenceGage('', '');
                    this.modalservices.openModal(Services.SSModalType.e_extensionsupport);
                    this.doSelectNearestGage = false;
                }
            };
            StudyAreaService.prototype.getStreamgages = function (xmin, xmax, ymin, ymax) {
                var _this = this;
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesBounds.format(xmin, xmax, ymin, ymax);
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(function (response) {
                    _this.streamgageLayer = response.data;
                    _this.streamgagesVisible = true;
                }, function (error) {
                    _this.toaster.clear();
                    _this.toaster.pop('error', "Error querying streamgage layer");
                });
            };
            StudyAreaService.prototype.GetKriggedReferenceGages = function () {
                var _this = this;
                var url = configuration.queryparams['KrigService'].format(this.selectedStudyArea.RegionID, this.selectedStudyArea.Pourpoint[0].Longitude, this.selectedStudyArea.Pourpoint[0].Latitude, this.selectedStudyArea.Pourpoint[0].crs, '5');
                if (!this.selectedStudyAreaExtensions)
                    return;
                var sid = this.selectedStudyAreaExtensions.reduce(function (acc, val) { return acc.concat(val.parameters); }, []).filter(function (f) { return (f.code).toLowerCase() == "sid"; });
                if (sid.length < 0)
                    return;
                var request = new WiM.Services.Helpers.RequestInfo(url);
                this.Execute(request).then(function (response) {
                    var siteList = [];
                    var result = response.data;
                    for (var i = 0; i < result.length; i++) {
                        var gage = new StreamStats.Models.ReferenceGage(result[i].id, result[i].name);
                        gage.DrainageArea_sqMI = result[i].drainageArea;
                        gage.correlation = result[i].correlation;
                        siteList.push(gage);
                    }
                    if (siteList.length > 0) {
                        sid[0].options = siteList;
                        sid[0].value = new StreamStats.Models.ReferenceGage("", "");
                        _this.toaster.pop('success', "Found index gages", "Please continue", 5000);
                    }
                }, function (error) {
                    _this.toaster.pop('warning', "No index gage found at this location.", "Please try again", 5000);
                }).finally(function () {
                    _this._onStudyAreaServiceFinishedChanged.raise(null, WiM.Event.EventArgs.Empty);
                });
            };
            StudyAreaService.prototype.upstreamRegulation = function () {
                var _this = this;
                this.toaster.pop('wait', "Checking for Upstream Regulation", "Please wait...", 0);
                this.regulationCheckComplete = false;
                var watershed = angular.toJson({
                    type: "FeatureCollection",
                    crs: { type: "ESPG", properties: { code: 4326 } },
                    features: this.selectedStudyArea.FeatureCollection.features.filter(function (f) { return (f.id).toLowerCase() == "globalwatershed"; }),
                }, null);
                var url = configuration.baseurls['StreamStatsMapServices'] + configuration.queryparams['regulationService'].format(this.selectedStudyArea.RegionID.toLowerCase());
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', { watershed: watershed, outputcrs: 4326, f: 'geojson' }, { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, WiM.Services.Helpers.paramsTransform);
                this.Execute(request).then(function (response) {
                    _this.selectedStudyArea.Disclaimers['regulationChecked'] = true;
                    if (response.data.percentarearegulated > 0) {
                        _this.toaster.clear();
                        _this.toaster.pop('success', "Map updated with Regulated Area", "Continue to 'Modify Basin Characteristics' to see area-weighted basin characteristics", 5000);
                        var features = _this.reconfigureWatershedResponse(response.data["featurecollection"]);
                        _this.selectedStudyArea.FeatureCollection.features.push(features[0]);
                        _this.regulationCheckResults = response.data;
                        _this.selectedStudyArea.Disclaimers['isRegulated'] = true;
                        _this.eventManager.RaiseEvent(Services.onSelectedStudyAreaChanged, _this, StudyAreaEventArgs.Empty);
                    }
                    else {
                        _this.selectedStudyArea.Disclaimers['isRegulated'] = false;
                        _this.toaster.clear();
                        _this.toaster.pop('warning', "No regulation found", "Please continue", 5000);
                    }
                }, function (error) {
                    _this.toaster.clear();
                    _this.toaster.pop('error', "Error Checking for Upstream Regulation", "Please retry", 0);
                }).finally(function () {
                    _this.regulationCheckComplete = true;
                });
            };
            StudyAreaService.prototype.getflattenStudyArea = function () {
                var _this = this;
                var result = null;
                try {
                    var result = this.selectedStudyArea.FeatureCollection;
                    result.features.forEach(function (f) {
                        f.properties["Name"] = _this.selectedStudyArea.WorkspaceID;
                        if (f.id && f.id == "globalwatershed") {
                            f.properties = [f.properties, _this.studyAreaParameterList.reduce(function (dict, param) { dict[param.code] = param.value; return dict; }, {})].reduce(function (r, o) {
                                Object.keys(o).forEach(function (k) { r[k] = o[k]; });
                                return r;
                            }, {});
                        }
                    });
                }
                catch (e) {
                    result = null;
                    console.log('Failed to flatted shapefile.');
                }
                return result;
            };
            StudyAreaService.prototype.simplify = function (feature) {
                var tolerance = 0;
                try {
                    var verticies = feature.geometry.coordinates.reduce(function (count, row) { return count + row.length; }, 0);
                    if (verticies < 5000) {
                        return feature;
                    }
                    else if (verticies < 10000) {
                        tolerance = 0.0001;
                    }
                    else if (verticies < 100000) {
                        tolerance = 0.001;
                    }
                    else {
                        tolerance = 0.01;
                    }
                    if (this.selectedStudyArea.Pourpoint.length == 1) {
                        this.toaster.pop('warning', "Displaying simplified Basin.", "See FAQ for more information.", 0);
                    }
                    return turf.simplify(feature, { tolerance: tolerance, highQuality: false, mutate: true });
                }
                catch (e) {
                }
            };
            StudyAreaService.prototype.computeRegressionEquation = function (regtype) {
                this.regtype = regtype;
                this.onSelectedStatisticsGroupChanged();
                this.nssService.loadParametersByStatisticsGroup(this.selectedStudyArea.RegionID, "", "GC1449, GC1450", [], regtype);
            };
            StudyAreaService.prototype.reconfigureWatershedResponse = function (watershedResponse) {
                var featureArray = [];
                watershedResponse.forEach(function (fc) {
                    for (var i = 0; i < fc.feature.features.length; i++) {
                        var feature = {
                            type: "Feature",
                            geometry: fc.feature.features[i].geometry,
                            id: fc.feature.features.length > 1 && fc.feature.features[i].properties && fc.feature.features[i].properties["Name"] ? fc.name + "_" + fc.feature.features[i].properties["Name"].toLowerCase() : fc.name.toLowerCase(),
                            properties: fc.feature.features[i].properties
                        };
                        featureArray.push(feature);
                    }
                });
                return featureArray;
            };
            StudyAreaService.prototype.loadParameterResults = function (results) {
                var paramList = this.studyAreaParameterList;
                var self = this;
                results.map(function (val) {
                    angular.forEach(paramList, function (value, index) {
                        if (val.code.toUpperCase().trim() === value.code.toUpperCase().trim()) {
                            if (val.value != undefined && val.code.toUpperCase().trim() == 'DRNAREA' && value.value != val.value) {
                                var latLong = self.selectedStudyArea.Pourpoint[0].Latitude.toFixed(5) + ',' + self.selectedStudyArea.Pourpoint[0].Longitude.toFixed(5);
                                var daValue = val.value;
                                if (val.unit.toLowerCase().trim() == 'square kilometers')
                                    daValue = daValue / 2.59;
                                gtag('event', 'Calculate', { 'Category': 'DraingeArea', 'Location': latLong, 'Value': daValue.toFixed(0) });
                            }
                            value.value = val.value;
                            value.loaded = val.loaded;
                            return;
                        }
                    });
                });
            };
            StudyAreaService.prototype.loadRegulatedParameterResults = function (regulatedResults) {
                this.toaster.pop('wait', "Loading Regulated Basin Characteristics", "Please wait...");
                var paramList = this.studyAreaParameterList;
                regulatedResults.map(function (regulatedParam) {
                    angular.forEach(paramList, function (param, index) {
                        if (regulatedParam.code.toUpperCase().trim() === param.code.toUpperCase().trim()) {
                            switch (regulatedParam.operation) {
                                case "Sum":
                                    param.unRegulatedValue = param.value - regulatedParam.value;
                                    break;
                                case "WeightedAverage":
                                    var totalSum, regulatedSum, regulatedValue, totalValue;
                                    angular.forEach(paramList, function (checkParam, index) {
                                        if (checkParam.code == regulatedParam.operationField) {
                                            totalSum = checkParam.value;
                                        }
                                    });
                                    angular.forEach(regulatedResults, function (checkRegulatedParam, index) {
                                        if (checkRegulatedParam.code == regulatedParam.operationField) {
                                            regulatedSum = checkRegulatedParam.value;
                                        }
                                    });
                                    regulatedValue = regulatedParam.value;
                                    totalValue = param.value;
                                    var tempVal1 = regulatedSum * (regulatedValue / totalSum);
                                    var tempVal2 = totalValue - tempVal1;
                                    var tempVal3 = totalSum - regulatedSum;
                                    var tempVal4 = tempVal2 * (totalSum / tempVal3);
                                    param.unRegulatedValue = tempVal4;
                            }
                            param.regulatedValue = regulatedParam.value;
                            return;
                        }
                        else {
                        }
                    });
                });
            };
            StudyAreaService.prototype.computeFlowAnywhereResults = function () {
                var _this = this;
                var drainageArea;
                this.studyAreaParameterList.forEach(function (parameter) {
                    if (parameter.code == 'DRNAREA') {
                        drainageArea = parameter.value;
                    }
                });
                var dataFLA = {
                    "startdate": this.flowAnywhereData.dateRange.dates.startDate,
                    "enddate": this.flowAnywhereData.dateRange.dates.endDate,
                    "nwis_station_id": this.flowAnywhereData.selectedGage.StationID,
                    "parameters": [
                        {
                            "code": "drnarea",
                            "value": drainageArea
                        }
                    ],
                    "region": Number(this.flowAnywhereData.selectedGage.AggregatedRegion)
                };
                var url = configuration.baseurls.FlowAnywhereRegressionServices + configuration.queryparams.FlowAnywhereEstimates.format(this.regionService.selectedRegion.RegionID);
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', angular.toJson(dataFLA));
                this.Execute(request).then(function (response) {
                    if (response.data) {
                        _this.flowAnywhereData.results = response.data;
                        _this.flowAnywhereData.estimatedFlowsArray = [];
                        _this.flowAnywhereData.results.EstimatedFlow.Observations.forEach(function (observation, index) {
                            _this.flowAnywhereData.estimatedFlowsArray.push({
                                "date": observation.Date,
                                "estimatedFlow": observation.Value,
                                "observedFlow": _this.flowAnywhereData.results.ReferanceGage.Discharge.Observations[index].Value
                            });
                        });
                        _this.flowAnywhereData["graphData"] = {
                            data: [
                                { key: "Observed", values: _this.processData(_this.flowAnywhereData.results.ReferanceGage.Discharge.Observations, 0) },
                                { key: "Estimated", values: _this.processData(_this.flowAnywhereData.results.EstimatedFlow.Observations, 1) }
                            ],
                            options: {
                                chart: {
                                    type: 'lineChart',
                                    height: 450,
                                    margin: {
                                        top: 20,
                                        right: 20,
                                        bottom: 50,
                                        left: 80
                                    },
                                    x: function (d) {
                                        return new Date(d.x).getTime();
                                    },
                                    y: function (d) {
                                        return d.y;
                                    },
                                    useInteractiveGuideline: false,
                                    interactive: true,
                                    tooltips: true,
                                    xAxis: {
                                        tickFormat: function (d) {
                                            return d3.time.format('%x')(new Date(d));
                                        },
                                        rotateLabels: -30,
                                        showMaxMin: true
                                    },
                                    yAxis: {
                                        axisLabel: 'Discharge (cfs)',
                                        tickFormat: function (d) {
                                            return d != null ? d.toUSGSvalue() : d;
                                        }
                                    },
                                    zoom: {
                                        enabled: false
                                    },
                                    forceY: 0
                                }
                            }
                        };
                    }
                    else {
                        _this.toaster.clear();
                        _this.toaster.pop('error', "Error", "Error computing Flow Anywhere results", 0);
                    }
                }, function (error) {
                    _this.toaster.clear();
                    _this.toaster.pop('error', "Error", "Error computing Flow Anywhere results", 0);
                }).finally(function () {
                });
            };
            StudyAreaService.prototype.processData = function (data, seriesNumber) {
                var returnData = [];
                var startDate = new Date(Math.min.apply(null, data.map(function (e) { return new Date(e["Date"]); })));
                var endDate = new Date(Math.max.apply(null, data.map(function (e) { return new Date(e["Date"]); })));
                for (var d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
                    var obs = data.filter(function (item) { return new Date(item["Date"]).getTime() == d.getTime(); })[0];
                    if (obs == undefined)
                        returnData.push({ x: d.getTime(), y: null });
                    else
                        returnData.push({ x: d.getTime(), y: obs.hasOwnProperty('Value') ? typeof obs["Value"] == 'number' ? obs["Value"].toUSGSvalue() : obs["Value"] : null });
                }
                return returnData;
            };
            StudyAreaService.prototype.onStudyAreaChanged = function (sender, e) {
                if (!this.selectedStudyArea || !this.selectedStudyArea.FeatureCollection || this.regressionRegionQueryComplete)
                    return;
            };
            StudyAreaService.prototype.onNSSExtensionChanged = function (sender, e) {
                var _this = this;
                e.extensions.forEach(function (f) {
                    if (_this.checkArrayForObj(_this.selectedStudyArea.NSS_Extensions, f) == -1)
                        _this.selectedStudyArea.NSS_Extensions.push(f);
                });
            };
            StudyAreaService.prototype.onNSSExtensionResultsChanged = function (sender, e) {
                var _this = this;
                e.results.forEach(function (ex) {
                    var item = _this.selectedStudyArea.NSS_Extensions.filter(function (f) { return f.code == ex.code; });
                    if (item.length < 1)
                        return;
                    item[0].parameters = angular.copy(ex.parameters);
                    if (item[0].result === undefined)
                        item[0].result = [];
                    if (_this.extensionResultsChanged == 0)
                        item[0].result = [];
                    item[0].result[_this.extensionResultsChanged] = angular.copy(ex.result);
                    item[0].result[_this.extensionResultsChanged].name = e.regressionRegionName;
                });
                this.extensionResultsChanged++;
            };
            StudyAreaService.prototype.afterSelectedStatisticsGroupChanged = function () {
                this.nssService.onSelectedStatisticsGroupChanged.unsubscribe(this.statisticgroupEventHandler);
            };
            StudyAreaService.prototype.onSelectedStatisticsGroupChanged = function () {
                this.nssService.onSelectedStatisticsGroupChanged.subscribe(this.statisticgroupEventHandler);
            };
            StudyAreaService.prototype.onQ10Available = function () {
                this.nssService.onQ10Loaded.subscribe(this.q10EventHandler);
            };
            StudyAreaService.prototype.afterQ10Loaded = function () {
                this.selectedStudyArea.wateruseQ10 = this.nssService.selectedStatisticsGroupList[0].regressionRegions[0].results[0].value;
                this._onQ10Loaded.raise(null, WiM.Event.EventArgs.Empty);
                this.eventManager.UnSubscribeToEvent(Services.onSelectedStudyParametersLoaded, this.parameterloadedEventHandler);
                this.nssService.selectedStatisticsGroupList = [];
                this.nssService.onQ10Loaded.unsubscribe(this.q10EventHandler);
            };
            StudyAreaService.prototype.updateExtensions = function () {
                var _this = this;
                this.nssService.statisticsGroupList.forEach(function (sg) {
                    if (sg.regressionRegions)
                        sg.regressionRegions.forEach(function (rr) {
                            if (rr.extensions) {
                                rr.extensions = _this.selectedStudyAreaExtensions;
                            }
                        });
                });
            };
            StudyAreaService.prototype.checkArrayForObj = function (arr, obj) {
                for (var i = 0; i < arr.length; i++) {
                    if (angular.equals(arr[i], obj)) {
                        return i;
                    }
                }
                ;
                return -1;
            };
            return StudyAreaService;
        }(WiM.Services.HTTPServiceBase));
        factory.$inject = ['$http', '$q', 'WiM.Event.EventManager', 'toaster', 'StreamStats.Services.ModalService', 'StreamStats.Services.nssService', 'StreamStats.Services.RegionService'];
        function factory($http, $q, eventManager, toaster, modalService, nssService, regionService) {
            return new StudyAreaService($http, $q, eventManager, toaster, modalService, nssService, regionService);
        }
        angular.module('StreamStats.Services')
            .factory('StreamStats.Services.StudyAreaService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {}));
