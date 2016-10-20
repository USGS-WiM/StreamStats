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
        Services.onSelectedMethodExecuteComplete = "onSelectedMethodExecuteComplete";
        var ExplorationServiceEventArgs = (function (_super) {
            __extends(ExplorationServiceEventArgs, _super);
            function ExplorationServiceEventArgs() {
                _super.call(this);
            }
            return ExplorationServiceEventArgs;
        }(WiM.Event.EventArgs));
        Services.ExplorationServiceEventArgs = ExplorationServiceEventArgs;
        var ExplorationService = (function (_super) {
            __extends(ExplorationService, _super);
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function ExplorationService($http, $q, toaster, eventManager, regionservice) {
                _super.call(this, $http, configuration.baseurls['StreamStats']);
                this.$q = $q;
                this.eventManager = eventManager;
                this.regionservice = regionservice;
                this.toaster = toaster;
                this.drawElevationProfile = false;
                this.drawMeasurement = false;
                this.showElevationChart = false;
                this.allowStreamgageQuery = false;
                this.measurementData = '';
                this._selectedMethod = null;
                eventManager.AddEvent(Services.onSelectedStudyAreaChanged);
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
                var url = 'http://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer/Profile/execute';
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', { InputLineFeatures: esriJSON, MaximumSampleDistanceUnits: 'feet', returnZ: true, f: 'json' }, { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, WiM.Services.Helpers.paramsTransform);
                //do ajax call for future precip layer, needs to happen even if only runoff value is needed for this region
                this.Execute(request).then(function (response) {
                    //console.log('elevation profile response: ', response.data);
                    if (response.data && response.data.results) {
                        var coords = response.data.results[0].value.features[0].geometry.paths[0];
                        if (coords.length > 0) {
                            //console.log('coords: ', coords)
                            _this.elevationProfileGeoJSON = {
                                "name": "NewFeatureType", "type": "FeatureCollection",
                                "features": [
                                    { "type": "Feature", "geometry": { "type": "LineString", "coordinates": coords }, "properties": "" }
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
            ExplorationService.prototype.setMethod = function (methodtype) {
                if (this._selectedMethod != null && methodtype === this._selectedMethod.ModelType)
                    methodtype = ExplorationMethodType.undefined;
                switch (methodtype) {
                    case ExplorationMethodType.FINDPATH2OUTLET:
                        this._selectedMethod = new StreamStats.Models.Path2Outlet();
                        break;
                    case ExplorationMethodType.FINDPATHBETWEENPOINTS:
                        this._selectedMethod = new StreamStats.Models.PathBetweenPoints();
                        break;
                    case ExplorationMethodType.GETNETWORKREPORT:
                        this._selectedMethod = new StreamStats.Models.NetworkReport();
                        break;
                    default:
                        this._selectedMethod = null;
                        break;
                } //end switch
            };
            ExplorationService.prototype.GetToolName = function (methodID) {
                switch (methodID) {
                    case ExplorationMethodType.FINDPATHBETWEENPOINTS:
                        return "Find path between two points";
                    case ExplorationMethodType.FINDPATH2OUTLET:
                        return "Find path to outlet";
                    case ExplorationMethodType.GETNETWORKREPORT:
                        return "Get network report";
                    default:
                        return "";
                } //end switch
            };
            ExplorationService.prototype.ExecuteSelectedModel = function () {
                var _this = this;
                //build url
                //streamstatsservices/navigation / { 0}.geojson ? rcode = { 1}& startpoint={ 2}& endpoint={ 3 }&crs={ 4 }&workspaceID={ 5 }&direction={ 6 }&layers={ 7 }
                var urlParams = [];
                urlParams.push("startpoint=" + JSON.stringify(new Array(this.selectedMethod.locations[0].Longitude, this.selectedMethod.locations[0].Latitude)));
                if (this.selectedMethod.locations.length > 1)
                    urlParams.push("endpoint=" + JSON.stringify(new Array(this.selectedMethod.locations[1].Longitude, this.selectedMethod.locations[1].Latitude)));
                urlParams.push("crs=" + this.selectedMethod.locations[0].crs);
                if ("workspaceID" in this.selectedMethod && this.selectedMethod.workspaceID !== '')
                    urlParams.push("workspaceID=" + this.selectedMethod.workspaceID);
                if (this.selectedMethod.hasOwnProperty("selectedDirectionType"))
                    urlParams.push("direction=" + this.selectedMethod.selectedDirectionType);
                if (this.selectedMethod.hasOwnProperty("layerOptions")) {
                    var itemstring = this.selectedMethod.layerOptions.map(function (elem) {
                        if (elem.selected)
                            return elem.name;
                    }).join(";");
                    urlParams.push("layers=" + itemstring);
                } //endif
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSNavigationServices']
                    .format(this.selectedMethod.ModelType, this.regionservice.selectedRegion.RegionID) + urlParams.join("&");
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    var results = response.data;
                    var evtarg = new ExplorationServiceEventArgs();
                    evtarg.features = results.hasOwnProperty("featurecollection") ? results["featurecollection"] : null;
                    evtarg.report = results.hasOwnProperty("Report") ? results["Report"] : null;
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
        (function (ExplorationMethodType) {
            ExplorationMethodType[ExplorationMethodType["undefined"] = 0] = "undefined";
            ExplorationMethodType[ExplorationMethodType["FINDPATHBETWEENPOINTS"] = 1] = "FINDPATHBETWEENPOINTS";
            ExplorationMethodType[ExplorationMethodType["FINDPATH2OUTLET"] = 2] = "FINDPATH2OUTLET";
            ExplorationMethodType[ExplorationMethodType["GETNETWORKREPORT"] = 3] = "GETNETWORKREPORT";
        })(Services.ExplorationMethodType || (Services.ExplorationMethodType = {}));
        var ExplorationMethodType = Services.ExplorationMethodType;
        factory.$inject = ['$http', '$q', 'toaster', 'WiM.Event.EventManager', 'StreamStats.Services.RegionService'];
        function factory($http, $q, toaster, eventmngr, regionservice) {
            return new ExplorationService($http, $q, toaster, eventmngr, regionservice);
        }
        angular.module('StreamStats.Services')
            .factory('StreamStats.Services.ExplorationService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=ExplorationService.js.map