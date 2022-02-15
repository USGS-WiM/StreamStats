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
    var Services;
    (function (Services) {
        'use strict';
        Services.onSelectedStudyAreaChanged = "onSelectedStudyAreaChanged";
        Services.onSelectedStudyParametersLoaded = "onSelectedStudyParametersLoaded";
        Services.onStudyAreaReset = "onStudyAreaReset";
        Services.onEditClick = "onEditClick";
        Services.onRegressionLoaded = "onRegressionLoaded";
        var StudyAreaEventArgs = (function (_super) {
            __extends(StudyAreaEventArgs, _super);
            function StudyAreaEventArgs(studyArea, saVisible, paramState, additionalFeatures) {
                if (studyArea === void 0) { studyArea = null; }
                if (saVisible === void 0) { saVisible = false; }
                if (paramState === void 0) { paramState = false; }
                if (additionalFeatures === void 0) { additionalFeatures = false; }
                var _this = _super.call(this) || this;
                _this.studyArea = studyArea;
                _this.studyAreaVisible = saVisible;
                _this.parameterLoaded = paramState;
                _this.additionalFeaturesLoaded = additionalFeatures;
                return _this;
            }
            return StudyAreaEventArgs;
        }(WiM.Event.EventArgs));
        Services.StudyAreaEventArgs = StudyAreaEventArgs;
        var StudyAreaService = (function (_super) {
            __extends(StudyAreaService, _super);
            function StudyAreaService($http, $q, eventManager, toaster, modal, nssService, regionService, $analytics) {
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
                _this.extensionDateRange = null;
                _this.extensionsConfigured = false;
                _this.loadingDrainageArea = false;
                _this.modalservices = modal;
                eventManager.AddEvent(Services.onSelectedStudyParametersLoaded);
                eventManager.AddEvent(Services.onSelectedStudyAreaChanged);
                eventManager.AddEvent(Services.onStudyAreaReset);
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
                _this.angulartics = $analytics;
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
                this.eventManager.RaiseEvent(Services.onStudyAreaReset, this, WiM.Event.EventArgs.Empty);
            };
            StudyAreaService.prototype.loadStudyBoundary = function () {
                var _this = this;
                this.toaster.pop("wait", "Delineating Basin", "Please wait...", 0);
                this.canUpdate = false;
                var regionID = this.selectedStudyArea.RegionID;
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSdelineation'].format('geojson', regionID, this.selectedStudyArea.Pourpoint.Longitude.toString(), this.selectedStudyArea.Pourpoint.Latitude.toString(), this.selectedStudyArea.Pourpoint.crs.toString());
                if (this.regionService.selectedRegion.Applications.indexOf('StormDrain') > -1) {
                    var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSstormwaterDelineation'].format(regionID, this.selectedStudyArea.Pourpoint.Longitude.toString(), this.selectedStudyArea.Pourpoint.Latitude.toString(), this.surfacecontributionsonly);
                }
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
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
                    _this.selectedStudyArea.FeatureCollection.features.forEach(function (f) { return f.properties = {}; });
                }, function (error) {
                    _this.clearStudyArea();
                    _this.toaster.clear();
                    _this.toaster.pop("error", "There was an HTTP error with the delineation request", "Please retry", 0);
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
                        _this.selectedStudyArea.Pourpoint = new WiM.Models.Point(pointFeature.bbox[1], pointFeature.bbox[0], pointFeature.crs.properties.code);
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
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSeditBasin'].format('geojson', this.selectedStudyArea.RegionID, this.selectedStudyArea.WorkspaceID, this.selectedStudyArea.Pourpoint.crs.toString());
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
            StudyAreaService.prototype.loadAllIndexGages = function () {
                var _this = this;
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['KrigService'].format(this.selectedStudyArea.RegionID, this.selectedStudyArea.Pourpoint.Longitude, this.selectedStudyArea.Pourpoint.Latitude, this.selectedStudyArea.Pourpoint.crs, '300');
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
                var _this = this;
                this.parametersLoading = true;
                var argState = { "isLoaded": false };
                var requestParameterList = [];
                this.toaster.clear();
                this.toaster.pop('wait', "Calculating Selected Basin Characteristics", "Please wait...", 0);
                this.eventManager.RaiseEvent(Services.onSelectedStudyParametersLoaded, this, StudyAreaEventArgs.Empty);
                if (!this.selectedStudyArea || !this.selectedStudyArea.WorkspaceID || !this.selectedStudyArea.RegionID) {
                    alert('No Study Area');
                    return;
                }
                requestParameterList = this.studyAreaParameterList.filter(function (param) { return (!param.value || param.value < 0); }).map(function (param) { return param.code; });
                if (requestParameterList.length == 0 && this.regionService.selectedRegion.Applications.indexOf('FDCTM') > -1)
                    requestParameterList.push('drnarea');
                if (requestParameterList.length < 1) {
                    var saEvent = new StudyAreaEventArgs();
                    saEvent.parameterLoaded = true;
                    this.eventManager.RaiseEvent(Services.onSelectedStudyParametersLoaded, this, saEvent);
                    this.toaster.clear();
                    this.parametersLoading = false;
                    return;
                }
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(this.selectedStudyArea.RegionID, this.selectedStudyArea.WorkspaceID, requestParameterList.join(','));
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
            };
            StudyAreaService.prototype.getAdditionalFeatureList = function () {
                var _this = this;
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSavailableFeatures'].format(this.selectedStudyArea.WorkspaceID);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                request.withCredentials = true;
                this.Execute(request).then(function (response) {
                    if (response.data.featurecollection && response.data.featurecollection.length > 0) {
                        var features = [];
                        angular.forEach(response.data.featurecollection, function (feature, index) {
                            if (_this.selectedStudyArea.FeatureCollection.features.map(function (f) { return f.id; }).indexOf(feature.name) === -1) {
                                features.push(feature.name);
                            }
                        });
                        _this.getAdditionalFeatures(features.join(','));
                    }
                }, function (error) {
                    _this.toaster.clear();
                    _this.toaster.pop("error", "There was an HTTP error requesting additional feautres list", "Please retry", 0);
                }).finally(function () {
                });
            };
            StudyAreaService.prototype.getAdditionalFeatures = function (featureString) {
                var _this = this;
                if (!featureString)
                    return;
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
                            _this.eventManager.RaiseEvent(WiM.Directives.onLayerAdded, _this, new WiM.Directives.LegendLayerAddedEventArgs(feature.id, "geojson", { displayName: feature.id, imagesrc: null }, false));
                        });
                    }
                }, function (error) {
                    _this.toaster.clear();
                    _this.toaster.pop("error", "There was an HTTP error getting additional features", "Please retry", 0);
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
                var ppt = this.selectedStudyArea.Pourpoint;
                var turfPoint = turf.point([ppt.Longitude, ppt.Latitude]);
                var distance = 0.005;
                var bearings = [-90, 0, 90, 180];
                var boundingBox = [];
                bearings.forEach(function (bearing, index) {
                    var destination = turf.destination(turfPoint, distance, bearing);
                    boundingBox[index] = destination.geometry.coordinates[index % 2 == 0 ? 0 : 1];
                });
                var outFields = "eqWithStrID.BASIN_NAME,eqWithStrID.DVA_EQ_ID,eqWithStrID.a10,eqWithStrID.b10,eqWithStrID.a25,eqWithStrID.b25,eqWithStrID.a50,eqWithStrID.b50,eqWithStrID.a100,eqWithStrID.b100,eqWithStrID.a500,eqWithStrID.b500";
                var url = configuration.baseurls['StreamStatsMapServices'] + configuration.queryparams['coordinatedReachQueryService']
                    .format(this.selectedStudyArea.RegionID.toLowerCase(), boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3], ppt.crs, outFields);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    if (response.data.error) {
                        _this.toaster.pop('error', "There was an error querying coordinated reach", response.data.error.message, 0);
                        return;
                    }
                    if (response.data.features.length > 0) {
                        var attributes = response.data.features[0].attributes;
                        _this.selectedStudyArea.CoordinatedReach = new StreamStats.Models.CoordinatedReach(attributes["eqWithStrID.BASIN_NAME"], attributes["eqWithStrID.DVA_EQ_ID"]);
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
                }, function (error) {
                    _this.toaster.clear();
                    _this.toaster.pop('error', "Error querying streamgage layer");
                });
            };
            StudyAreaService.prototype.GetKriggedReferenceGages = function () {
                var _this = this;
                var url = configuration.queryparams['KrigService'].format(this.selectedStudyArea.RegionID, this.selectedStudyArea.Pourpoint.Longitude, this.selectedStudyArea.Pourpoint.Latitude, this.selectedStudyArea.Pourpoint.crs, '5');
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
                    this.toaster.pop('warning', "Displaying simplified Basin.", "See FAQ for more information.", 0);
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
                                var latLong = self.selectedStudyArea.Pourpoint.Latitude.toFixed(5) + ',' + self.selectedStudyArea.Pourpoint.Longitude.toFixed(5);
                                var daValue = val.value;
                                if (val.unit.toLowerCase().trim() == 'square kilometers')
                                    daValue = daValue / 2.59;
                                self.angulartics.eventTrack('ComputedDrainageArea', { category: 'SideBar', label: latLong, value: daValue.toFixed(0) });
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
            StudyAreaService.prototype.onStudyAreaChanged = function (sender, e) {
                if (!this.selectedStudyArea || !this.selectedStudyArea.FeatureCollection || this.regressionRegionQueryComplete)
                    return;
            };
            StudyAreaService.prototype.onNSSExtensionChanged = function (sender, e) {
                var _this = this;
                console.log('onNSSExtensionChanged');
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
                    item[0].result = angular.copy(ex.result);
                });
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
        factory.$inject = ['$http', '$q', 'WiM.Event.EventManager', 'toaster', 'StreamStats.Services.ModalService', 'StreamStats.Services.nssService', 'StreamStats.Services.RegionService', '$analytics'];
        function factory($http, $q, eventManager, toaster, modalService, nssService, regionService, $analytics) {
            return new StudyAreaService($http, $q, eventManager, toaster, modalService, nssService, regionService, $analytics);
        }
        angular.module('StreamStats.Services')
            .factory('StreamStats.Services.StudyAreaService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {}));
