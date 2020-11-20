//------------------------------------------------------------------------------
//----- RegionService -----------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
        Services.Region = Region;
        var Parameter = (function () {
            function Parameter() {
            }
            return Parameter;
        })();
        Services.Parameter = Parameter;
        Services.onSelectedRegionChanged = "onSelectedRegionChanged";
        var RegionService = (function (_super) {
            __extends(RegionService, _super);
            function RegionService($http, $q, toaster, eventManager) {
                _super.call(this, $http, configuration.baseurls['StreamStatsServices']);
                this.$q = $q;
                this.eventManager = eventManager;
                this.toaster = toaster;
                this.regionList = [];
                this.parameterList = [];
                this.masterRegionList = configuration.regions;
                this.streamStatsAvailable = false;
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
            RegionService.prototype.clearRegion = function () {
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
                this.regionList.length = 0;
                var selectedRegion = this.getRegion(regionid);
                if (selectedRegion == null)
                    return false;
                this.regionList.push(selectedRegion);
                return true;
            };
            RegionService.prototype.loadMapLayersByRegion = function (regionid) {
                var _this = this;
                this.regionMapLayerListLoaded = false;
                var url = configuration.baseurls['StreamStatsMapServices'] + configuration.queryparams['SSStateLayers'] + '?f=pjson';
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.regionMapLayerList = [];
                this.Execute(request).then(function (response) {
                    if (!response.data.layers) {
                        _this.toaster.pop('warning', "No map layers available", "", 5000);
                        return;
                    }
                    response.data.layers.forEach(function (value, key) {
                        var visible = false;
                        if (value.name == regionid) {
                            value.subLayerIds.forEach(function (sublayer, sublayerkey) {
                                _this.regionMapLayerList.push([response.data.layers[sublayer].name, response.data.layers[sublayer].id, visible]);
                            });
                        }
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
                        _this.parameterList.sort(function (a, b) { return (a.code > b.code) ? 1 : ((b.code > a.code) ? -1 : 0); });
                    }
                    else {
                        _this.streamStatsAvailable = false;
                        _this.toaster.pop('warning', "StreamStats not available here at this time", "", 5000);
                    }
                }, function (error) {
                    console.log('Bad response from the regression service');
                    _this.streamStatsAvailable = false;
                    _this.toaster.pop('warning', "StreamStats not available here at this time", "", 5000);
                }).finally(function () { });
            };
            RegionService.prototype.getRegion = function (lookupID) {
                var regionArray = configuration.regions;
                try {
                    for (var i = 0; i < regionArray.length; i++) {
                        if (regionArray[i].Name.toUpperCase().trim() === lookupID.toUpperCase().trim() ||
                            regionArray[i].RegionID.toUpperCase().trim() === lookupID.toUpperCase().trim())
                            return regionArray[i];
                    }
                    return null;
                }
                catch (e) {
                    return null;
                }
            };
            return RegionService;
        })(WiM.Services.HTTPServiceBase);
        factory.$inject = ['$http', '$q', 'toaster', 'WiM.Event.EventManager'];
        function factory($http, $q, toaster, eventManager) {
            return new RegionService($http, $q, toaster, eventManager);
        }
        angular.module('StreamStats.Services')
            .factory('StreamStats.Services.RegionService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {}));
