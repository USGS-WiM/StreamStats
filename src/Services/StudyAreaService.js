//------------------------------------------------------------------------------
//----- StudyAreaService -------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2015 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  The service agent is responsible for initiating service calls, 
//             capturing the data that's returned and forwarding the data back to 
//             the ViewModel.
//          
//discussion:
//
//Comments
//04.15.2015 jkn - Created
//Import
var StreamStats;
(function (StreamStats) {
    var Services;
    (function (Services) {
        'use strict';
        Services.onSelectedStudyAreaChanged = "onSelectedStudyAreaChanged";
        Services.onSelectedStudyParametersLoaded = "onSelectedStudyParametersLoaded";
        Services.onStudyAreaReset = "onStudyAreaReset";
        Services.onEditClick = "onEditClick";
        var StudyAreaEventArgs = (function (_super) {
            __extends(StudyAreaEventArgs, _super);
            function StudyAreaEventArgs(studyArea, saVisible, paramState) {
                if (studyArea === void 0) { studyArea = null; }
                if (saVisible === void 0) { saVisible = false; }
                if (paramState === void 0) { paramState = false; }
                _super.call(this);
                this.studyArea = studyArea;
                this.studyAreaVisible = saVisible;
                this.parameterLoaded = paramState;
            }
            return StudyAreaEventArgs;
        }(WiM.Event.EventArgs));
        Services.StudyAreaEventArgs = StudyAreaEventArgs;
        var StudyAreaService = (function (_super) {
            __extends(StudyAreaService, _super);
            //public requestParameterList: Array<any>; jkn
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function StudyAreaService($http, $q, eventManager, toaster) {
                var _this = this;
                _super.call(this, $http, configuration.baseurls['StreamStatsServices']);
                this.$http = $http;
                this.$q = $q;
                this.eventManager = eventManager;
                eventManager.AddEvent(Services.onSelectedStudyParametersLoaded);
                eventManager.AddEvent(Services.onSelectedStudyAreaChanged);
                eventManager.AddEvent(Services.onStudyAreaReset);
                eventManager.SubscribeToEvent(Services.onSelectedStudyAreaChanged, new WiM.Event.EventHandler(function (sender, e) {
                    _this.onStudyAreaChanged(sender, e);
                }));
                eventManager.AddEvent(Services.onEditClick);
                this._studyAreaList = [];
                this.toaster = toaster;
                this.clearStudyArea();
                this.servicesURL = configuration.baseurls['StreamStatsServices'];
            }
            Object.defineProperty(StudyAreaService.prototype, "StudyAreaList", {
                get: function () {
                    return this._studyAreaList;
                },
                enumerable: true,
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
                enumerable: true,
                configurable: true
            });
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            StudyAreaService.prototype.editBasin = function (selection) {
                //console.log('in editbasin, selection: ', selection);
                this.selectedStudyArea.Disclaimers['isEdited'] = true;
                this.drawControlOption = selection;
                this.eventManager.RaiseEvent(Services.onEditClick, this, WiM.Event.EventArgs.Empty);
            };
            StudyAreaService.prototype.undoEdit = function () {
                //console.log('undo edit');
                delete this.selectedStudyArea.Disclaimers['isEdited'];
                this.WatershedEditDecisionList = new StreamStats.Models.WatershedEditDecisionList();
                this.eventManager.RaiseEvent(Services.onSelectedStudyAreaChanged, this, StudyAreaEventArgs.Empty);
            };
            StudyAreaService.prototype.AddStudyArea = function (sa) {
                //add the study area to studyAreaList
                this.clearStudyArea();
                this.StudyAreaList.push(sa);
                this.selectedStudyArea = sa;
                this.selectedStudyArea.Disclaimers = {};
            };
            StudyAreaService.prototype.RemoveStudyArea = function () {
                //remove the study area to studyAreaList
            };
            StudyAreaService.prototype.clearStudyArea = function () {
                //console.log('in clear study area');
                this.canUpdate = true;
                this.regulationCheckComplete = true;
                this.parametersLoading = false;
                this.doDelineateFlag = false;
                this.checkingDelineatedPoint = false;
                this.studyAreaParameterList = []; //angular.fromJson(angular.toJson(configuration.alwaysSelectedParameters));
                this.regulationCheckResults = [];
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
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSdelineation'].format('geojson', this.selectedStudyArea.RegionID, this.selectedStudyArea.Pourpoint.Longitude.toString(), this.selectedStudyArea.Pourpoint.Latitude.toString(), this.selectedStudyArea.Pourpoint.crs.toString(), false);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    //console.log('delineation response headers: ', response.headers());
                    //tests
                    //response.data.featurecollection[1].feature.features.length = 0;
                    if (response.data.featurecollection && response.data.featurecollection[1] && response.data.featurecollection[1].feature.features.length > 0) {
                        _this.selectedStudyArea.Server = response.headers()['usgswim-hostname'];
                        _this.selectedStudyArea.Features = response.data.hasOwnProperty("featurecollection") ? response.data["featurecollection"] : null;
                        _this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                        _this.selectedStudyArea.Date = new Date();
                        //check for global
                        //this.selectedStudyArea.Features.forEach((item) => { 
                        //    if (item.name == "globalwatershed") {
                        //        angular.forEach(item.feature.features[0].properties, (i,v) => {
                        //            console.log(v, i);
                        //            if (v == "GlobalWshd" && i == 1) {
                        //                this.selectedStudyArea.isGlobal = true;
                        //            }
                        //            else this.selectedStudyArea.isGlobal = false;
                        //        });
                        //    }
                        //});
                        _this.toaster.clear();
                        _this.eventManager.RaiseEvent(Services.onSelectedStudyAreaChanged, _this, StudyAreaEventArgs.Empty);
                        _this.canUpdate = true;
                    }
                    else {
                        _this.clearStudyArea();
                        _this.toaster.clear();
                        _this.toaster.pop("error", "A watershed was not returned from the delineation request", "Please retry", 0);
                    }
                    //sm when complete
                }, function (error) {
                    //sm when error
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
                    this.Execute(request).then(function (response) {
                        _this.selectedStudyArea.Features = response.data.hasOwnProperty("featurecollection") ? response.data["featurecollection"] : null;
                        _this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                        _this.selectedStudyArea.Date = new Date();
                        //set point
                        _this.selectedStudyArea.Features.forEach(function (layer) {
                            var item = angular.fromJson(angular.toJson(layer));
                            if (item.name == 'globalwatershedpoint') {
                                //get and set geometry
                                var geom = item.feature.features[0].bbox;
                                _this.selectedStudyArea.Pourpoint = new WiM.Models.Point(geom[0], geom[1], item.feature.crs.properties.code);
                                return;
                            } //end if
                        });
                    }, function (error) {
                        //sm when error
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
                //Content-Type: application/json
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSeditBasin'].format('geojson', this.selectedStudyArea.RegionID, this.selectedStudyArea.WorkspaceID, this.selectedStudyArea.Pourpoint.crs.toString());
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.PUT, 'json', angular.toJson(this.WatershedEditDecisionList), {});
                this.Execute(request).then(function (response) {
                    //create new study area                    
                    _this.AddStudyArea(new StreamStats.Models.StudyArea(_this.selectedStudyArea.RegionID, _this.selectedStudyArea.Pourpoint));
                    _this.selectedStudyArea.Features = response.data.hasOwnProperty("featurecollection") ? response.data["featurecollection"] : null;
                    _this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                    _this.selectedStudyArea.Date = new Date();
                    _this.toaster.clear();
                    //sm when complete
                }, function (error) {
                    //sm when error
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
            StudyAreaService.prototype.loadParameters = function () {
                var _this = this;
                this.parametersLoading = true;
                var argState = { "isLoaded": false };
                var requestParameterList = [];
                this.toaster.clear();
                this.toaster.pop('wait', "Calculating Selected Basin Characteristics", "Please wait...", 0);
                //console.log('in load parameters');
                //this.canUpdate = false;
                this.eventManager.RaiseEvent(Services.onSelectedStudyParametersLoaded, this, StudyAreaEventArgs.Empty);
                if (!this.selectedStudyArea || !this.selectedStudyArea.WorkspaceID || !this.selectedStudyArea.RegionID) {
                    alert('No Study Area');
                    return;
                } //end if
                //only compute missing characteristics
                requestParameterList = this.studyAreaParameterList.filter(function (param) { return (!param.value || param.value < 0); }).map(function (param) { return param.code; });
                if (requestParameterList.length < 1) {
                    var saEvent = new StudyAreaEventArgs();
                    saEvent.parameterLoaded = true;
                    this.eventManager.RaiseEvent(Services.onSelectedStudyParametersLoaded, this, saEvent);
                    this.toaster.clear();
                    this.parametersLoading = false;
                    return;
                } //end if
                //console.log('request parameter list before: ', this.requestParameterList);
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(this.selectedStudyArea.RegionID, this.selectedStudyArea.WorkspaceID, requestParameterList.join(','));
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    if (response.data.parameters && response.data.parameters.length > 0) {
                        _this.toaster.clear();
                        //check each returned parameter for issues
                        var paramErrors = false;
                        angular.forEach(response.data.parameters, function (parameter, index) {
                            //for testing
                            //if (parameter.code == 'DRNAREA') {
                            //    parameter.value = -999;
                            //}
                            if (!parameter.hasOwnProperty('value') || parameter.value == -999) {
                                paramErrors = true;
                                console.error('Parameter failed to compute: ', parameter.code);
                                parameter.loaded = false;
                            }
                            else {
                                //    //remove this param from requestParameterList
                                //    var idx = this.requestParameterList.indexOf(parameter.code);
                                //    if (idx != -1) this.requestParameterList.splice(idx, 1);
                                parameter.loaded = true;
                            }
                        });
                        //if there is an issue, pop open 
                        if (paramErrors) {
                            _this.showModifyBasinCharacterstics = true;
                            _this.toaster.pop('error', "One or more basin characteristics failed to compute", "Click the 'Calculate Missing Parameters' button or manually enter parameter values to continue", 0);
                        }
                        var results = response.data.parameters;
                        _this.loadParameterResults(results);
                        //do regulation parameter update if needed
                        if (_this.selectedStudyArea.Disclaimers['isRegulated']) {
                            _this.loadRegulatedParameterResults(_this.regulationCheckResults.parameters);
                        }
                        var saEvent = new StudyAreaEventArgs();
                        saEvent.parameterLoaded = true;
                        _this.eventManager.RaiseEvent(Services.onSelectedStudyParametersLoaded, _this, saEvent);
                    }
                    //sm when complete
                }, function (error) {
                    //sm when error
                    _this.toaster.clear();
                    _this.toaster.pop("error", "There was an HTTP error calculating basin characteristics", "Please retry", 0);
                }).finally(function () {
                    //this.canUpdate = true;
                    _this.parametersLoading = false;
                });
            };
            StudyAreaService.prototype.queryLandCover = function () {
                var _this = this;
                this.toaster.pop('wait', "Querying Land Cover Data with your Basin", "Please wait...", 0);
                //console.log('querying land cover');
                var esriJSON = '{"geometryType":"esriGeometryPolygon","spatialReference":{"wkid":"4326"},"fields": [],"features":[{"geometry": {"type":"polygon", "rings":[' + JSON.stringify(this.selectedStudyArea.Features[1].feature.features[0].geometry.coordinates) + ']}}]}';
                //var watershed = angular.toJson(this.selectedStudyArea.Features[1].feature, null);
                var url = configuration.baseurls['NationalMapRasterServices'] + configuration.queryparams['NLCDQueryService'];
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', { InputLineFeatures: esriJSON, returnZ: true, f: 'json' }, { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, WiM.Services.Helpers.paramsTransform);
                this.Execute(request).then(function (response) {
                    //console.log(response.data);
                    _this.toaster.clear();
                    if (response.data.length > 0) {
                        //console.log('query success');
                        _this.toaster.pop('success', "Land Cover was succcessfully queried", "Please continue", 5000);
                    }
                }, function (error) {
                    //sm when complete
                    //console.log('Regression query failed, HTTP Error');
                    _this.toaster.pop('error', "There was an HTTP error querying Land Cover", "Please retry", 0);
                    return _this.$q.reject(error.data);
                }).finally(function () {
                });
            };
            StudyAreaService.prototype.queryRegressionRegions = function () {
                var _this = this;
                this.toaster.pop('wait', "Querying regression regions with your Basin", "Please wait...", 0);
                //console.log('in load query regression regions');
                this.regressionRegionQueryLoading = true;
                this.regressionRegionQueryComplete = false;
                var watershed = angular.toJson(this.selectedStudyArea.Features[1].feature, null);
                //var url = configuration.baseurls['NodeServer'] + configuration.queryparams['RegressionRegionQueryService'];
                //var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', watershed);
                var url = configuration.baseurls['GISserver'] + configuration.queryparams['RegressionRegionQueryService'];
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', { geometry: watershed, f: 'json' }, { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, WiM.Services.Helpers.paramsTransform);
                this.Execute(request).then(function (response) {
                    //console.log(response.data);
                    _this.toaster.clear();
                    //tests
                    //response.data.error = true;
                    if (response.data.error) {
                        //console.log('query error');
                        _this.toaster.pop('error', "There was an error querying regression regions", response.data.error.message, 0);
                        return;
                    }
                    if (response.data.length == 0) {
                        //console.log('query error');
                        _this.toaster.pop('error', "Regression region query failed", "This type of query may not be supported here at this time", 0);
                        return;
                    }
                    if (response.data.length > 0) {
                        //console.log('query success');
                        _this.regressionRegionQueryComplete = true;
                        response.data.forEach(function (p) { p.code = p.code.toUpperCase().split(","); });
                        _this.selectedStudyArea.RegressionRegions = response.data;
                        _this.toaster.pop('success', "Regression regions were succcessfully queried", "Please continue", 5000);
                    }
                    //this.queryLandCover();
                }, function (error) {
                    //sm when complete
                    //console.log('Regression query failed, HTTP Error');
                    _this.toaster.pop('error', "There was an HTTP error querying Regression regions", "Please retry", 0);
                    return _this.$q.reject(error.data);
                }).finally(function () {
                    _this.regressionRegionQueryLoading = false;
                });
            };
            StudyAreaService.prototype.queryKarst = function (regionID, regionMapLayerList) {
                var _this = this;
                this.toaster.pop('wait', "Querying for Karst Areas", "Please wait...", 0);
                //console.log('in load query regression regions');
                //get layerID of exclude poly
                var layerID;
                regionMapLayerList.forEach(function (item) {
                    if (item[0] == 'ExcludePolys')
                        layerID = item[1];
                });
                this.regressionRegionQueryLoading = true;
                this.regressionRegionQueryComplete = false;
                var watershed = '{"rings":' + angular.toJson(this.selectedStudyArea.Features[1].feature.features[0].geometry.coordinates, null) + ',"spatialReference":{"wkid":4326}}';
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
                    //this.queryLandCover();
                }, function (error) {
                    //sm when complete
                    //console.log('Regression query failed, HTTP Error');
                    _this.toaster.pop('error', "There was an HTTP error querying Regression regions", "Please retry", 0);
                    return _this.$q.reject(error.data);
                }).finally(function () {
                    _this.regressionRegionQueryLoading = false;
                });
            };
            StudyAreaService.prototype.upstreamRegulation = function () {
                var _this = this;
                //console.log('upstream regulation');
                this.toaster.pop('wait', "Checking for Upstream Regulation", "Please wait...", 0);
                this.regulationCheckComplete = false;
                var watershed = angular.toJson(this.selectedStudyArea.Features[1].feature, null);
                var url = configuration.baseurls['GISserver'] + configuration.queryparams['regulationService'].format(this.selectedStudyArea.RegionID);
                //CLOUD CHECK
                if (configuration.cloud)
                    url = configuration.baseurls['GISserver'] + configuration.queryparams['regulationService'].format(this.selectedStudyArea.RegionID.toLowerCase());
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', { watershed: watershed, outputcrs: 4326, f: 'geojson' }, { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, WiM.Services.Helpers.paramsTransform);
                this.Execute(request).then(function (response) {
                    //console.log(response);
                    if (response.data.percentarearegulated > 0) {
                        _this.toaster.clear();
                        _this.toaster.pop('success', "Map updated with Regulated Area", "Continue to 'Modify Basin Characteristics' to see area-weighted basin characteristics", 5000);
                        _this.selectedStudyArea.Features.push(response.data["featurecollection"][0]);
                        _this.regulationCheckResults = response.data;
                        //this.loadRegulatedParameterResults(this.regulationCheckResults.parameters);
                        _this.selectedStudyArea.Disclaimers['isRegulated'] = true;
                        //COMMENT OUT ONSELECTEDSTUDYAREA changed event 3/11/16
                        _this.eventManager.RaiseEvent(Services.onSelectedStudyAreaChanged, _this, StudyAreaEventArgs.Empty);
                    }
                    else {
                        //alert("No regulation found");
                        _this.selectedStudyArea.Disclaimers['isRegulated'] = false;
                        _this.toaster.clear();
                        _this.toaster.pop('warning', "No regulation found", "Please continue", 5000);
                    }
                    //sm when complete
                }, function (error) {
                    //sm when error
                    _this.toaster.clear();
                    _this.toaster.pop('error', "Error Checking for Upstream Regulation", "Please retry", 0);
                }).finally(function () {
                    //this.toaster.clear();
                    _this.regulationCheckComplete = true;
                });
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-       
            StudyAreaService.prototype.loadParameterResults = function (results) {
                //this.toaster.pop('wait', "Loading Basin Characteristics", "Please wait...", 0);
                //console.log('in load parameter results');
                var paramList = this.studyAreaParameterList;
                results.map(function (val) {
                    angular.forEach(paramList, function (value, index) {
                        if (val.code.toUpperCase().trim() === value.code.toUpperCase().trim()) {
                            value.value = val.value;
                            value.loaded = val.loaded;
                            return; //exit loop
                        } //endif
                    });
                });
                //console.log('params', this.studyAreaParameterList);
            };
            StudyAreaService.prototype.loadRegulatedParameterResults = function (regulatedResults) {
                this.toaster.pop('wait', "Loading Regulated Basin Characteristics", "Please wait...");
                //console.log('in load regulated parameter results');
                var paramList = this.studyAreaParameterList;
                regulatedResults.map(function (regulatedParam) {
                    angular.forEach(paramList, function (param, index) {
                        if (regulatedParam.code.toUpperCase().trim() === param.code.toUpperCase().trim()) {
                            //calculate unregulated values
                            switch (regulatedParam.operation) {
                                case "Sum":
                                    param.unRegulatedValue = param.value - regulatedParam.value;
                                    break;
                                case "WeightedAverage":
                                    var totalSum, regulatedSum, regulatedValue, totalValue;
                                    //get the value for the weight field, need to find it from parameter list
                                    angular.forEach(paramList, function (checkParam, index) {
                                        if (checkParam.code == regulatedParam.operationField) {
                                            totalSum = checkParam.value;
                                        }
                                    });
                                    //get the value for the weight field, need to find it from regulated parameter list
                                    angular.forEach(regulatedResults, function (checkRegulatedParam, index) {
                                        if (checkRegulatedParam.code == regulatedParam.operationField) {
                                            regulatedSum = checkRegulatedParam.value;
                                        }
                                    });
                                    regulatedValue = regulatedParam.value;
                                    totalValue = param.value;
                                    //console.log('regulated params: ', regulatedParam.code, totalSum, regulatedSum, regulatedValue, totalValue);
                                    var tempVal1 = regulatedSum * (regulatedValue / totalSum);
                                    var tempVal2 = totalValue - tempVal1;
                                    var tempVal3 = totalSum - regulatedSum;
                                    var tempVal4 = tempVal2 * (totalSum / tempVal3);
                                    param.unRegulatedValue = tempVal4;
                            }
                            //pass through regulated value
                            param.regulatedValue = regulatedParam.value;
                            return; //exit loop
                        } //endif
                        else {
                        }
                    });
                });
                //console.log('regulated params', this.studyAreaParameterList);
            };
            //EventHandlers Methods
            //-+-+-+-+-+-+-+-+-+-+-+- 
            StudyAreaService.prototype.onStudyAreaChanged = function (sender, e) {
                //console.log('in onStudyAreaChanged');
                if (!this.selectedStudyArea || !this.selectedStudyArea.Features || this.regressionRegionQueryComplete)
                    return;
                //this.queryRegressionRegions();
            };
            return StudyAreaService;
        }(WiM.Services.HTTPServiceBase)); //end class
        factory.$inject = ['$http', '$q', 'WiM.Event.EventManager', 'toaster'];
        function factory($http, $q, eventManager, toaster) {
            return new StudyAreaService($http, $q, eventManager, toaster);
        }
        angular.module('StreamStats.Services')
            .factory('StreamStats.Services.StudyAreaService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {})); //end module
//# sourceMappingURL=StudyAreaService.js.map