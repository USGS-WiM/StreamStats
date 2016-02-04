//------------------------------------------------------------------------------
//----- RegionService -----------------------------------------------------
//------------------------------------------------------------------------------
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
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
//             the Controller.
//          
//discussion:
//
//https://docs.angularjs.org/api/ng/service/$http
//Comments
//03.26.2015 jkn - Created
//Import
var StreamStats;
(function (StreamStats) {
    var Services;
    (function (Services) {
        'use strict';
        var Region = (function () {
            function Region() {
            }
            return Region;
        })();
        Services.Region = Region; //end class
        var Parameter = (function () {
            function Parameter() {
            }
            return Parameter;
        })();
        Services.Parameter = Parameter; //end class
        Services.onSelectedRegionChanged = "onSelectedRegionChanged";
        var RegionService = (function (_super) {
            __extends(RegionService, _super);
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function RegionService($http, $q, toaster, eventManager) {
                _super.call(this, $http, configuration.baseurls['StreamStats']);
                this.$q = $q;
                this.eventManager = eventManager;
                this.toaster = toaster;
                this.regionList = [];
                this.parameterList = [];
                this.masterRegionList = configuration.regions;
                this.loadNationalMapLayers();
                this.streamStatsAvailable = false;
                this.allowStreamgageQuery = false;
                this.eventManager.AddEvent(Services.onSelectedRegionChanged);
            }
            Object.defineProperty(RegionService.prototype, "selectedRegion", {
                get: function () {
                    return this._selectedRegion;
                },
                set: function (val) {
                    if (this._selectedRegion != val) {
                        this._selectedRegion = val;
                        this.eventManager.RaiseEvent(Services.onSelectedRegionChanged, this, WiM.Event.EventArgs.Empty);
                    }
                },
                enumerable: true,
                configurable: true
            });
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            RegionService.prototype.clearRegion = function () {
                //console.log('in clear region');
                this.regionList = [];
                this.parameterList = [];
                this.regionMapLayerList = [];
                this.selectedRegion = null;
                this.regionMapLayerListLoaded = false;
                this.allowStreamgageQuery = false;
            };
            RegionService.prototype.loadRegionListByExtent = function (xmin, xmax, ymin, ymax, sr) {
                var _this = this;
                if (sr === void 0) { sr = 4326; }
                //    clear List
                this.regionList.length = 0; //clear array
                var input = {
                    f: 'json',
                    geometry: { "xmin": xmin, "ymin": ymin, "xmax": xmax, "ymax": ymax, "spatialReference": { "wkid": sr } },
                    tolerance: 2,
                    returnGeometry: false,
                    mapExtent: { "xmin": xmin, "ymin": ymin, "xmax": xmax, "ymax": ymax, "spatialReference": { "wkid": sr } },
                    imageDisplay: "1647, 457,96",
                    geometryType: "esriGeometryEnvelope",
                    sr: sr,
                    layers: "all: 4"
                };
                var url = configuration.baseurls['StreamStats'] + configuration.queryparams['regionService'];
                var request = new WiM.Services.Helpers.RequestInfo(url, true, 0 /* GET */, 'json');
                request.params = input;
                this.Execute(request).then(function (response) {
                    //console.log(response);
                    if (response.data.results.length < 1) {
                        _this.toaster.pop('warning', "No State/Regional Study Areas available here", "", 5000);
                    }
                    response.data.results.map(function (item) {
                        try {
                            var region = _this.getRegion(item.attributes.st_abbr);
                            if (region != null && _this.regionList.indexOf(region) == -1)
                                _this.regionList.push(region);
                        }
                        catch (e) {
                            alert(e);
                        }
                    });
                }, function (error) {
                    return _this.$q.reject(error.data);
                });
            };
            RegionService.prototype.loadRegionListByRegion = function (regionid) {
                this.regionList.length = 0; //clear array;
                var selectedRegion = this.getRegion(regionid);
                if (selectedRegion == null)
                    return false;
                this.regionList.push(selectedRegion);
                return true;
            };
            RegionService.prototype.loadNationalMapLayers = function () {
                var _this = this;
                var url = configuration.baseurls['StreamStats'] + "/arcgis/rest/services/ss_studyAreas_prod/MapServer?f=pjson";
                var request = new WiM.Services.Helpers.RequestInfo(url, true, 0 /* GET */, 'json');
                this.nationalMapLayerList = [];
                this.Execute(request).then(function (response) {
                    response.data.layers.forEach(function (value, key) {
                        //console.log("Adding layer: ", value);
                        _this.nationalMapLayerList.push([value.name, value.id]);
                    });
                    //console.log('list of national map layers', this.nationalMapLayerList);
                    //return layerArray;
                }, function (error) {
                    //console.log('No national map layers found');
                    return _this.$q.reject(error.data);
                });
            };
            RegionService.prototype.loadMapLayersByRegion = function (regionid) {
                var _this = this;
                //console.log('in loadMapLayersByRegion');
                this.regionMapLayerListLoaded = false;
                var url = configuration.baseurls['StreamStats'] + configuration.queryparams['SSStateLayers'].format(regionid.toLowerCase());
                var request = new WiM.Services.Helpers.RequestInfo(url, true, 0 /* GET */, 'json');
                this.regionMapLayerList = [];
                this.Execute(request).then(function (response) {
                    if (!response.data.layers) {
                        _this.toaster.pop('warning', "No map layers available", "", 5000);
                        return;
                    }
                    //set initial visibility array
                    response.data.layers.forEach(function (value, key) {
                        var visible = false;
                        if (value.name.toLowerCase() == 'stream grid' || value.name.toLowerCase() == 'area of limited functionality') {
                            visible = true;
                        }
                        ;
                        _this.regionMapLayerList.push([value.name, value.id, visible]);
                    });
                    _this.regionMapLayerListLoaded = true;
                }, function (error) {
                    console.log('No region map layers found');
                    return _this.$q.reject(error.data);
                }).finally(function () {
                });
            };
            RegionService.prototype.loadParametersByRegion = function () {
                var _this = this;
                //console.log('in load parameters', this.selectedRegion);
                if (!this.selectedRegion)
                    return;
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSAvailableParams'].format(this.selectedRegion.RegionID);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    //console.log(response);
                    if (response.data.parameters && response.data.parameters.length > 0) {
                        _this.streamStatsAvailable = true;
                        response.data.parameters.forEach(function (parameter) {
                            try {
                                ////dont add an always selected param twice
                                //configuration.alwaysSelectedParameters.forEach((alwaysSelectedParam) => {
                                //    if (alwaysSelectedParam.name == parameter.code) {
                                //        parameter.checked = true;
                                //        parameter.toggleable = false;
                                //    }
                                //    else {
                                //        parameter.checked = false;
                                //        parameter.toggleable = true;
                                //    }
                                //});
                                parameter.checked = false;
                                parameter.toggleable = true;
                                _this.parameterList.push(parameter);
                            }
                            catch (e) {
                                alert(e);
                            }
                        });
                    }
                    else {
                        _this.streamStatsAvailable = false;
                        _this.toaster.pop('warning', "StreamStats not available here at this time", "", 5000);
                    }
                    //sm when complete
                }, function (error) {
                    console.log('Bad response from the regression service');
                    _this.streamStatsAvailable = false;
                    _this.toaster.pop('warning', "StreamStats not available here at this time", "", 5000);
                    //sm when complete
                }).finally(function () {
                });
            };
            //HelperMethods
            //-+-+-+-+-+-+-+-+-+-+-+-
            RegionService.prototype.getRegion = function (lookupID) {
                var regionArray = configuration.regions;
                try {
                    for (var i = 0; i < regionArray.length; i++) {
                        if (regionArray[i].Name.toUpperCase().trim() === lookupID.toUpperCase().trim() || regionArray[i].RegionID.toUpperCase().trim() === lookupID.toUpperCase().trim())
                            return regionArray[i];
                    }
                    return null;
                }
                catch (e) {
                    return null;
                }
            };
            return RegionService;
        })(WiM.Services.HTTPServiceBase); //end class
        factory.$inject = ['$http', '$q', 'toaster', 'WiM.Event.EventManager'];
        function factory($http, $q, toaster, eventManager) {
            return new RegionService($http, $q, toaster, eventManager);
        }
        angular.module('StreamStats.Services').factory('StreamStats.Services.RegionService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=RegionService.js.map