//------------------------------------------------------------------------------
//----- MapController ----------------------------------------------------------
//------------------------------------------------------------------------------
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2015 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//   purpose:  
//discussion:   Controllers are typically built to reflect a View. 
//              and should only contailn business logic needed for a single view. For example, if a View 
//              contains a ListBox of objects, a Selected object, and a Save button, the Controller 
//              will have an ObservableCollection ObectList, 
//              Model SelectedObject, and SaveCommand.
//Comments
//04.15.2015 jkn - Created
//Imports"
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use strinct';
        var MapPoint = (function () {
            function MapPoint() {
                this.lat = 0;
                this.lng = 0;
            }
            return MapPoint;
        })();
        var Center = (function () {
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function Center(lt, lg, zm) {
                this.lat = lt;
                this.lng = lg;
                this.zoom = zm;
            }
            return Center;
        })();
        var Layer = (function () {
            function Layer(nm, ul, ty, vis, op) {
                if (op === void 0) { op = undefined; }
                this.name = nm;
                this.url = ul;
                this.type = ty;
                this.visible = vis;
                this.layerOptions = op;
            }
            return Layer;
        })();
        var MapDefault = (function () {
            function MapDefault(mxZm, mnZm, zmCtrl) {
                if (mxZm === void 0) { mxZm = null; }
                if (mnZm === void 0) { mnZm = null; }
                if (zmCtrl === void 0) { zmCtrl = true; }
                this.maxZoom = mxZm;
                this.minZoom = mnZm;
                this.zoomControl = zmCtrl;
            }
            return MapDefault;
        })();
        //examples/access-leaflet-object-example.html
        //http://www.codeitive.com/0JiejWjjXg/two-or-multiple-geojson-layers-in-angular-leaflet-directive.html
        var MapController = (function () {
            function MapController($scope, $location, $stateParams, leafletBoundsHelper, leafletData, search, region) {
                var _this = this;
                this.center = null;
                this.layers = null;
                this.mapDefaults = null;
                this.mapPoint = null;
                this.bounds = null;
                this.controls = null;
                this.markers = null;
                this.events = null;
                this.regionLayer = null;
                $scope.vm = this;
                this.init();
                this.searchService = search;
                this.$locationService = $location;
                this.regionServices = region;
                this.leafletBoundsHelperService = leafletBoundsHelper;
                //subscribe to Events
                search.onSelectedAreaOfInterestChanged.subscribe(this._onSelectedAreaOfInterestHandler);
                region.onSelectedRegionChanged.subscribe(this._onSelectedRegionHandler);
                $scope.$on('leafletDirectiveMap.mousemove', function (event, args) {
                    var latlng = args.leafletEvent.latlng;
                    _this.mapPoint.lat = latlng.lat;
                    _this.mapPoint.lng = latlng.lng;
                });
                $scope.$watch(function () { return _this.bounds; }, function (newval, oldval) { return _this.setRegionsByBounds(oldval, newval); });
                $scope.$on('$locationChangeStart', function () { return _this.updateRegion(); });
                // check if region was explicitly set.
                if ($stateParams.region)
                    this.setBoundsByRegion($stateParams.region);
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            MapController.prototype.init = function () {
                var _this = this;
                //init event handler
                this._onSelectedAreaOfInterestHandler = new WiM.Event.EventHandler(function (sender, e) {
                    _this.onSelectedAreaOfInterestChanged(sender, e);
                });
                this._onSelectedRegionHandler = new WiM.Event.EventHandler(function () {
                    _this.onSelectedRegionChanged();
                });
                //init map           
                this.center = new Center(39, -100, 4);
                this.layers = {
                    baselayers: configuration.basemaps,
                    overlays: configuration.overlayedLayers,
                    markers: this.markers
                };
                this.mapDefaults = new MapDefault(null, 3, false);
                this.markers = {};
                this.regionLayer = {};
                //add custom controls
                this.controls = {
                    scale: true,
                    zoomControl: false,
                    custom: new Array(L.Control.zoomHome({ homeCoordinates: [39, -100], homeZoom: 4 }), L.control.locate({ follow: true }))
                };
                this.events = {
                    map: {
                        enable: ['mousemove']
                    }
                };
                this.mapPoint = new MapPoint();
            };
            MapController.prototype.onSelectedAreaOfInterestChanged = function (sender, e) {
                var AOI = e.selectedAreaOfInterest;
                this.markers['AOI'] = {
                    lat: AOI.Latitude,
                    lng: AOI.Longitude,
                    message: AOI.Name,
                    focus: true,
                    draggable: false
                };
                this.center = new Center(AOI.Latitude, AOI.Longitude, 14);
            };
            MapController.prototype.onSelectedRegionChanged = function () {
                this.removeOverlayLayers("_region", true);
                this.addRegionOverlayLayers(this.regionServices.selectedRegion.RegionID);
            };
            MapController.prototype.setRegionsByBounds = function (oldValue, newValue) {
                if (this.center.zoom >= 14 && oldValue !== newValue) {
                    this.regionServices.loadRegionListByExtent(this.bounds.northEast.lng, this.bounds.southWest.lng, this.bounds.southWest.lat, this.bounds.northEast.lat);
                }
            };
            MapController.prototype.updateRegion = function () {
                //get regionkey
                var key = (this.$locationService.search()).region;
                this.setBoundsByRegion(key);
            };
            MapController.prototype.setBoundsByRegion = function (key) {
                if (key && this.regionServices.loadRegionListByRegion(key)) {
                    this.regionServices.selectedRegion = this.regionServices.regionList[0];
                    this.bounds = this.leafletBoundsHelperService.createBoundsFromArray(this.regionServices.selectedRegion.Bounds);
                    this.center = {};
                }
            };
            MapController.prototype.addRegionOverlayLayers = function (regionId) {
                this.layers.overlays[regionId + "_region"] = new Layer(regionId + " Region", configuration.baseurls['StreamStats'] + "/arcgis/rest/services/{0}_ss/MapServer".format(regionId.toLowerCase()), "dynamic", true, {
                    "opacity": 0.5,
                    "layers": [1, 2, 3, 4, 5, 6]
                });
                //get any other layers specified in config
                var layers = configuration.customMapServices[regionId];
                if (layers == undefined)
                    return;
                for (var layer in layers) {
                    this.layers.overlays[layer + "_region"] = layers[layer];
                }
            };
            MapController.prototype.removeOverlayLayers = function (name, isPartial) {
                var _this = this;
                if (isPartial === void 0) { isPartial = false; }
                var layeridList;
                layeridList = this.getLayerIdsByID(name, this.layers.overlays, isPartial);
                layeridList.forEach(function (item) {
                    delete _this.layers.overlays[item];
                });
            };
            MapController.prototype.getLayerIdsByName = function (name, layerObj, isPartial) {
                var layeridList = [];
                for (var variable in layerObj) {
                    if (layerObj[variable].hasOwnProperty("name") && (isPartial ? (layerObj[variable].name.indexOf(name) > -1) : (layerObj[variable].name === name))) {
                        layeridList.push(variable);
                    }
                }
                return layeridList;
            };
            MapController.prototype.getLayerIdsByID = function (id, layerObj, isPartial) {
                var layeridList = [];
                for (var variable in layerObj) {
                    if (isPartial ? (variable.indexOf(id) > -1) : (variable === id)) {
                        layeridList.push(variable);
                    }
                }
                return layeridList;
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            MapController.$inject = ['$scope', '$location', '$stateParams', 'leafletBoundsHelpers', 'leafletData', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService'];
            return MapController;
        })(); //end class
        angular.module('StreamStats.Controllers').controller('StreamStats.Controllers.MapController', MapController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module
//# sourceMappingURL=MapController.js.map