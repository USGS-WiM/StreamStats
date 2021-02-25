var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
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
        Services.onSelectExplorationMethod = "onSelectExplorationMethod";
        Services.onSelectedMethodExecuteComplete = "onSelectedMethodExecuteComplete";
        var ExplorationServiceEventArgs = (function (_super) {
            __extends(ExplorationServiceEventArgs, _super);
            function ExplorationServiceEventArgs() {
                return _super.call(this) || this;
            }
            return ExplorationServiceEventArgs;
        }(WiM.Event.EventArgs));
        Services.ExplorationServiceEventArgs = ExplorationServiceEventArgs;
        var ExplorationService = (function (_super) {
            __extends(ExplorationService, _super);
            function ExplorationService($http, $q, toaster, eventManager, regionservice) {
                var _this = _super.call(this, $http, configuration.baseurls['StreamStatsServices']) || this;
                _this.$q = $q;
                _this.eventManager = eventManager;
                _this.regionservice = regionservice;
                _this.toaster = toaster;
                _this.drawElevationProfile = false;
                _this.drawMeasurement = false;
                _this.showElevationChart = false;
                _this.measurementData = '';
                _this._selectedMethod = null;
                _this.networkNavResults = [];
                eventManager.AddEvent(Services.onSelectedStudyAreaChanged);
                _this.selectElevationPoints = false;
                _this.DEMresolution = '30m';
                return _this;
            }
            Object.defineProperty(ExplorationService.prototype, "selectedMethod", {
                get: function () {
                    return this._selectedMethod;
                },
                enumerable: true,
                configurable: true
            });
            ExplorationService.prototype.elevationProfile = function (esriJSON) {
                var _this = this;
                var elevationOptions = {
                    InputLineFeatures: esriJSON,
                    returnZ: true,
                    DEMResolution: this.DEMresolution,
                    f: 'json',
                    MaximumSampleDistance: null,
                };
                if (this.samplingDistance)
                    elevationOptions.MaximumSampleDistance = this.samplingDistance;
                var url = 'https://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer/Profile/execute';
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', elevationOptions, { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, WiM.Services.Helpers.paramsTransform);
                this.Execute(request).then(function (response) {
                    console.log('elevation profile response: ', response.data);
                    if (response.data && response.data.results) {
                        var coords = response.data.results[0].value.features[0].geometry.paths[0];
                        if (coords.length > 0) {
                            var coords_orig = angular.fromJson(angular.toJson(coords));
                            var units = 'feet';
                            response.data.results[0].value.fields.forEach(function (field) {
                                if (field.name == "ProfileLength" && field.alias == "Length Meters")
                                    units = 'meters';
                            });
                            if (units = 'meters') {
                                coords = coords.map(function (elem) {
                                    return [elem[0], elem[1], elem[2] * 3.28084];
                                });
                            }
                            var totalDistance = 0;
                            _this.coordinateList = [[coords[0][1].toFixed(5), coords[0][0].toFixed(5), coords[0][2].toFixed(2), totalDistance.toFixed(2)]];
                            for (var i = 1; i < coords.length; i++) {
                                var previousPoint = L.latLng(coords[i - 1][1], coords[i - 1][0]);
                                var currentPoint = L.latLng(coords[i][1], coords[i][0]);
                                totalDistance += previousPoint.distanceTo(currentPoint);
                                _this.coordinateList.push([coords[i][1].toFixed(5), coords[i][0].toFixed(5), coords[i][2].toFixed(2), (totalDistance * 0.000621371).toFixed(2)]);
                            }
                            _this.elevationProfileGeoJSON = {
                                "name": "NewFeatureType", "type": "FeatureCollection",
                                "features": [
                                    { "type": "Feature", "geometry": { "type": "LineString", "coordinates": coords_orig }, "properties": "" }
                                ]
                            };
                        }
                    }
                    else {
                        console.error("There was a zero length response from the elevation service");
                        _this.toaster.clear();
                        _this.toaster.pop("error", "Error", "No elevation results are available here", 0);
                    }
                }, function (error) {
                    console.error("There was an error requestion the elevation service");
                    _this.toaster.clear();
                    _this.toaster.pop("error", "Error processing request", "Please try again", 0);
                }).finally(function () {
                });
            };
            ExplorationService.prototype.getNavigationEndPoints = function () {
                var _this = this;
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSNavigationServices'];
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    var results = response.data;
                    _this.navigationResources = results;
                }, function (error) {
                    _this.toaster.pop("error", "Error processing request", "Please try again", 0);
                    _this.eventManager.RaiseEvent(Services.onSelectedMethodExecuteComplete, _this, ExplorationServiceEventArgs.Empty);
                }).finally(function () {
                });
            };
            ExplorationService.prototype.getNavigationConfiguration = function (id) {
                var _this = this;
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSNavigationServices'] + '/' + id;
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    var config = response.data;
                    console.log('navigation config:', config);
                    _this.setMethod(id, config);
                }, function (error) {
                    _this.toaster.pop("error", "Error processing request", "Please try again", 0);
                    _this.eventManager.RaiseEvent(Services.onSelectedMethodExecuteComplete, _this, ExplorationServiceEventArgs.Empty);
                }).finally(function () {
                });
            };
            ExplorationService.prototype.getCountByType = function (object, text) {
                return object.filter(function (item) { return (item.valueType.toLowerCase().indexOf(text) >= 0); }).length;
            };
            ExplorationService.prototype.setMethod = function (methodtype, config) {
                if (this._selectedMethod != null && methodtype === this._selectedMethod.navigationID)
                    methodtype = ExplorationMethodType.undefined;
                this._selectedMethod = new StreamStats.Models.NetworkNav(methodtype, config);
                this.eventManager.RaiseEvent(Services.onSelectExplorationMethod, this, ExplorationServiceEventArgs.Empty);
            };
            ExplorationService.prototype.ExecuteSelectedModel = function () {
                var _this = this;
                console.log('selected method:', this.selectedMethod);
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSNavigationServices'] + '/' + this.selectedMethod.navigationInfo.code + '/route';
                console.log('url: ', url);
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', angular.toJson(this.selectedMethod.navigationConfiguration));
                this.Execute(request).then(function (response) {
                    var results = response.data;
                    console.log('successfull navigation request results:', results);
                    var netnavroute = {
                        feature: {
                            features: [],
                            type: 'FeatureCollection'
                        },
                        name: "netnavroute"
                    };
                    var netnavpoints = {
                        feature: {
                            features: [],
                            type: 'FeatureCollection'
                        },
                        name: "netnavpoints"
                    };
                    results.features.forEach(function (layer, key) {
                        if (layer.geometry.type == 'Point') {
                            netnavpoints.feature.features.push(layer);
                        }
                        else {
                            netnavroute.feature.features.push(layer);
                        }
                    });
                    if (netnavroute.feature.features.length > 0)
                        _this.networkNavResults.push(netnavroute);
                    if (netnavpoints.feature.features.length > 0)
                        _this.networkNavResults.push(netnavpoints);
                    var evtarg = new ExplorationServiceEventArgs();
                    evtarg.features = results.type === "FeatureCollection" ? results : null;
                    evtarg.report = results.type == "Report" ? results : null;
                    _this.eventManager.RaiseEvent(Services.onSelectedMethodExecuteComplete, _this, evtarg);
                }, function (error) {
                    _this.toaster.pop("error", "Error processing request", "Please try again", 0);
                    _this.eventManager.RaiseEvent(Services.onSelectedMethodExecuteComplete, _this, ExplorationServiceEventArgs.Empty);
                }).finally(function () {
                });
            };
            return ExplorationService;
        }(WiM.Services.HTTPServiceBase));
        var ExplorationMethodType;
        (function (ExplorationMethodType) {
            ExplorationMethodType[ExplorationMethodType["undefined"] = 0] = "undefined";
            ExplorationMethodType[ExplorationMethodType["FLOWPATH"] = 1] = "FLOWPATH";
            ExplorationMethodType[ExplorationMethodType["NETWORKPATH"] = 2] = "NETWORKPATH";
            ExplorationMethodType[ExplorationMethodType["NETWORKTRACE"] = 3] = "NETWORKTRACE";
        })(ExplorationMethodType = Services.ExplorationMethodType || (Services.ExplorationMethodType = {}));
        factory.$inject = ['$http', '$q', 'toaster', 'WiM.Event.EventManager', 'StreamStats.Services.RegionService'];
        function factory($http, $q, toaster, eventmngr, regionservice) {
            return new ExplorationService($http, $q, toaster, eventmngr, regionservice);
        }
        angular.module('StreamStats.Services')
            .factory('StreamStats.Services.ExplorationService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {}));
