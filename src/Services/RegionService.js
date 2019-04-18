//------------------------------------------------------------------------------
//----- RegionService -----------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
<<<<<<< HEAD
    }
=======
    };
>>>>>>> 68c114f47eb605137c0b9244039abc3d599f8ca3
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
        var Region = /** @class */ (function () {
            function Region() {
            }
            return Region;
        }()); //end class
        Services.Region = Region;
        var Parameter = /** @class */ (function () {
            function Parameter() {
            }
            return Parameter;
        }()); //end class
        Services.Parameter = Parameter;
        Services.onSelectedRegionChanged = "onSelectedRegionChanged";
        var RegionService = /** @class */ (function (_super) {
            __extends(RegionService, _super);
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function RegionService($http, $q, toaster, eventManager) {
                var _this = _super.call(this, $http, configuration.baseurls['StreamStatsServices']) || this;
                _this.$q = $q;
                _this.eventManager = eventManager;
                _this.toaster = toaster;
                _this.regionList = [];
                _this.parameterList = [];
                _this.masterRegionList = configuration.regions;
                _this.streamStatsAvailable = false;
                _this.eventManager.AddEvent(Services.onSelectedRegionChanged);
                return _this;
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
                this.resetView = false;
            };
            RegionService.prototype.clearSelectedParameters = function () {
                this.parameterList.forEach(function (parameter) {
                    parameter.checked = false;
                    delete parameter.value;
                });
            };
            //intersect method modified from
            //https://stackoverflow.com/questions/2752349/fast-rectangle-to-rectangle-intersection
            RegionService.prototype.intersect = function (a, b) {
                return Math.max(a.left, b.left) < Math.min(a.right, b.right) && Math.min(a.top, b.top) > Math.max(a.bottom, b.bottom);
            };
            RegionService.prototype.loadRegionListByExtent = function (xmin, xmax, ymin, ymax, sr) {
                var _this = this;
                if (sr === void 0) { sr = 4326; }
                this.regionList = [];
                var a = { "top": ymax, "bottom": ymin, "left": xmax, "right": xmin };
                configuration.regions.forEach(function (value, key) {
                    var b = { "top": value.Bounds[1][0], "bottom": value.Bounds[0][0], "left": value.Bounds[0][1], "right": value.Bounds[1][1] };
                    if (_this.intersect(a, b)) {
                        _this.regionList.push(value);
                    }
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
            RegionService.prototype.loadMapLayersByRegion = function (regionid) {
                var _this = this;
                //console.log('in loadMapLayersByRegion');
                this.regionMapLayerListLoaded = false;
                var url = configuration.baseurls['StreamStatsMapServices'] + configuration.queryparams['SSStateLayers'] + '?f=pjson';
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.regionMapLayerList = [];
                this.Execute(request).then(function (response) {
                    if (!response.data.layers) {
                        _this.toaster.pop('warning', "No map layers available", "", 5000);
                        return;
                    }
                    //console.log('layers:', response.data.layers);
                    //set initial visibility array
                    response.data.layers.forEach(function (value, key) {
                        var visible = false;
                        if (value.name == regionid) {
                            //console.log('MATCH FOUND:', value.subLayerIds)
                            value.subLayerIds.forEach(function (sublayer, sublayerkey) {
                                //console.log('here',sublayer,sublayerkey)
                                _this.regionMapLayerList.push([response.data.layers[sublayer].name, response.data.layers[sublayer].id, visible]);
                            });
                        }
                        //if (value.name.toLowerCase() == 'stream grid' || value.name.toLowerCase() == 'area of limited functionality') {
                        //    visible = true
                        //};
                        //this.regionMapLayerList.push([value.name, value.id, visible]);
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
                                parameter.checked = false;
                                parameter.toggleable = true;
                                _this.parameterList.push(parameter);
                            }
                            catch (e) {
                                alert(e);
                            }
                        });
                        //sort the list by code
                        _this.parameterList.sort(function (a, b) { return (a.code > b.code) ? 1 : ((b.code > a.code) ? -1 : 0); });
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
                }).finally(function () { });
            };
            //HelperMethods
            //-+-+-+-+-+-+-+-+-+-+-+-
            RegionService.prototype.getRegion = function (lookupID) {
                var regionArray = configuration.regions;
                try {
                    //search for item
                    for (var i = 0; i < regionArray.length; i++) {
                        if (regionArray[i].Name.toUpperCase().trim() === lookupID.toUpperCase().trim() ||
                            regionArray[i].RegionID.toUpperCase().trim() === lookupID.toUpperCase().trim())
                            return regionArray[i];
                    } //next region
                    return null;
                }
                catch (e) {
                    return null;
                }
            };
            return RegionService;
        }(WiM.Services.HTTPServiceBase)); //end class
        factory.$inject = ['$http', '$q', 'toaster', 'WiM.Event.EventManager'];
        function factory($http, $q, toaster, eventManager) {
            return new RegionService($http, $q, toaster, eventManager);
        }
        angular.module('StreamStats.Services')
            .factory('StreamStats.Services.RegionService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=RegionService.js.map