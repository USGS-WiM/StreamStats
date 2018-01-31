//------------------------------------------------------------------------------
//----- StudyAreaService -------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
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
                return _this;
            }
            Object.defineProperty(ExplorationService.prototype, "selectedMethod", {
                get: function () {
                    return this._selectedMethod;
                },
                enumerable: true,
                configurable: true
            });
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ExplorationService.prototype.elevationProfile = function (esriJSON) {
                var _this = this;
                //ESRI elevation profile tool
                //Help page: https://elevation.arcgis.com/arcgis/rest/directories/arcgisoutput/Tools/ElevationSync_GPServer/Tools_ElevationSync/Profile.htm
                var url = 'https://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer/Profile/execute';
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', { InputLineFeatures: esriJSON, returnZ: true, DEMResolution: '30m', f: 'json' }, { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, WiM.Services.Helpers.paramsTransform);
                //do ajax call for future precip layer, needs to happen even if only runoff value is needed for this region
                this.Execute(request).then(function (response) {
                    console.log('elevation profile response: ', response.data);
                    if (response.data && response.data.results) {
                        var coords = response.data.results[0].value.features[0].geometry.paths[0];
                        if (coords.length > 0) {
                            //get copy of coordinates for elevation plugin
                            var coords_orig = angular.fromJson(angular.toJson(coords));
                            //convert elevation values if units are meters
                            var units = 'feet';
                            response.data.results[0].value.fields.forEach(function (field) {
                                if (field.name == "ProfileLength" && field.alias == "Length Meters")
                                    units = 'meters';
                            });
                            if (units = 'meters') {
                                coords = coords.map(function (elem) {
                                    //convert elevation value from meters to feet
                                    return [elem[0], elem[1], elem[2] * 3.28084];
                                });
                            }
                            // build table data and get distance between points
                            var totalDistance = 0;
                            //initialize list with first value and zero distance
                            _this.coordinateList = [[coords[0][1].toFixed(5), coords[0][0].toFixed(5), coords[0][2].toFixed(2), totalDistance.toFixed(2)]];
                            //loop over coords and calulate distances
                            for (var i = 1; i < coords.length; i++) {
                                //use leaflet 'distanceTo' method (units meters)
                                var previousPoint = L.latLng(coords[i - 1][1], coords[i - 1][0]);
                                var currentPoint = L.latLng(coords[i][1], coords[i][0]);
                                totalDistance += previousPoint.distanceTo(currentPoint);
                                //console.log('total D:', totalDistance * 0.000621371, coords)
                                //convert meters to miles for total distance
                                _this.coordinateList.push([coords[i][1].toFixed(5), coords[i][0].toFixed(5), coords[i][2].toFixed(2), (totalDistance * 0.000621371).toFixed(2)]);
                            } //next i    
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
                    //sm when complete
                }, function (error) {
                    //sm when error
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
                    console.log('network nav options:', results);
                    _this.navigationResources = results;
                    //sm when complete
                }, function (error) {
                    //sm when error                    
                    _this.toaster.pop("error", "Error processing request", "Please try again", 0);
                    _this.eventManager.RaiseEvent(Services.onSelectedMethodExecuteComplete, _this, ExplorationServiceEventArgs.Empty);
                }).finally(function () {
                    //busy
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
                    //sm when complete
                }, function (error) {
                    //sm when error                    
                    _this.toaster.pop("error", "Error processing request", "Please try again", 0);
                    _this.eventManager.RaiseEvent(Services.onSelectedMethodExecuteComplete, _this, ExplorationServiceEventArgs.Empty);
                }).finally(function () {
                    //busy
                });
            };
            ExplorationService.prototype.getCountByType = function (object, text) {
                return object.filter(function (item) { return item.valueType.toLowerCase().includes(text); }).length;
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
                //build url
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSNavigationServices'] + '/' + this.selectedMethod.navigationInfo.code + '/route';
                console.log('url: ', url);
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', angular.toJson(this.selectedMethod.navigationConfiguration));
                this.Execute(request).then(function (response) {
                    var results = response.data;
                    console.log('successfull navigation request results:', results);
                    //init netnavresults
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
                            //console.log('we have a point:', layer);
                        }
                        else {
                            netnavroute.feature.features.push(layer);
                        }
                    });
                    if (netnavroute.feature.features.length > 0)
                        _this.networkNavResults.push(netnavroute);
                    if (netnavpoints.feature.features.length > 0)
                        _this.networkNavResults.push(netnavpoints);
                    //console.log('saved net nav results:', this.networkNavResults)
                    var evtarg = new ExplorationServiceEventArgs();
                    evtarg.features = results.type === "FeatureCollection" ? results : null;
                    evtarg.report = results.type == "Report" ? results : null;
                    _this.eventManager.RaiseEvent(Services.onSelectedMethodExecuteComplete, _this, evtarg);
                    //sm when complete
                }, function (error) {
                    //sm when error                    
                    _this.toaster.pop("error", "Error processing request", "Please try again", 0);
                    _this.eventManager.RaiseEvent(Services.onSelectedMethodExecuteComplete, _this, ExplorationServiceEventArgs.Empty);
                }).finally(function () {
                    //busy
                });
            };
            return ExplorationService;
        }(WiM.Services.HTTPServiceBase)); //end class
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
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=ExplorationService.js.map