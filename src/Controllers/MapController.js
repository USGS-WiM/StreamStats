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
            function MapController($scope, $location, $stateParams, leafletBoundsHelper, search, region) {
                var _this = this;
                this.center = null;
                this.layers = null;
                this.mapDefaults = null;
                this.mapPoint = null;
                this.bounds = null;
                this.controls = null;
                this.markers = null;
                this.events = null;
                $scope.vm = this;
                this.init();
                this.searchService = search;
                this.$locationService = $location;
                this.regionServices = region;
                this.leafletBoundsHelperService = leafletBoundsHelper;
                //subscribe to Events
                search.onSelectedAreaOfInterestChanged.subscribe(this._onSelectedAreaOfInterestHandler);
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
                //init map           
                this.center = new Center(39, -100, 4);
                this.layers = {
                    baselayers: configuration.basemaps,
                    overlays: configuration.overlayedLayers,
                    markers: this.markers
                };
                this.mapDefaults = new MapDefault(null, 3, false);
                this.markers = {};
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
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            MapController.$inject = ['$scope', '$location', '$stateParams', 'leafletBoundsHelpers', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService'];
            return MapController;
        })(); //end class
        angular.module('StreamStats.Controllers').controller('StreamStats.Controllers.MapController', MapController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module
//# sourceMappingURL=MapController.js.map