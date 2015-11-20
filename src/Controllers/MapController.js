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
            function MapController($scope, $location, $stateParams, leafletBoundsHelper, leafletData, search, region, studyArea) {
                var _this = this;
                this.center = null;
                this.layers = null;
                this.mapDefaults = null;
                this.mapPoint = null;
                this.bounds = null;
                this.controls = null;
                this.markers = null;
                this.geojson = null;
                this.events = null;
                this.regionLayer = null;
                $scope.vm = this;
                this.init();
                this.searchService = search;
                this.$locationService = $location;
                this.regionServices = region;
                this.leafletBoundsHelperService = leafletBoundsHelper;
                this.leafletData = leafletData;
                this.studyArea = studyArea;
                //subscribe to Events
                search.onSelectedAreaOfInterestChanged.subscribe(this._onSelectedAreaOfInterestHandler);
                region.onSelectedRegionChanged.subscribe(this._onSelectedRegionHandler);
                studyArea.onSelectedStudyAreaChanged.subscribe(this._onSelectedStudyAreaHandler);
                studyArea.onEditClick.subscribe(this._onEditClickHandler);
                $scope.$on('leafletDirectiveMap.mousemove', function (event, args) {
                    var latlng = args.leafletEvent.latlng;
                    _this.mapPoint.lat = latlng.lat;
                    _this.mapPoint.lng = latlng.lng;
                });
                $scope.$on('leafletDirectiveMap.click', function (event, args) {
                    if (!studyArea.doDelineateFlag)
                        return;
                    var latlng = args.leafletEvent.latlng;
                    _this.startDelineate(latlng);
                    studyArea.doDelineateFlag = false;
                });
                $scope.$watch(function () { return _this.bounds; }, function (newval, oldval) { return _this.setRegionsByBounds(oldval, newval); });
                $scope.$on('$locationChangeStart', function () { return _this.updateRegion(); });
                $scope.$watch(function () { return studyArea.doDelineateFlag; }, function (newval, oldval) { return newval ? _this.cursorStyle = 'crosshair' : _this.cursorStyle = 'hand'; });
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
                this._onSelectedStudyAreaHandler = new WiM.Event.EventHandler(function () {
                    _this.onSelectedStudyAreaChanged();
                });
                this._onEditClickHandler = new WiM.Event.EventHandler(function () {
                    _this.basinEditor();
                });
                //init map           
                this.center = new Center(39, -100, 4);
                //this.center = new Center(39, -106, 16);
                this.layers = {
                    baselayers: configuration.basemaps,
                    overlays: configuration.overlayedLayers,
                    markers: this.markers,
                    geojson: this.geojson
                };
                this.mapDefaults = new MapDefault(null, 3, false);
                this.markers = {};
                this.geojson = {};
                this.regionLayer = {};
                //add custom controls
                this.controls = {
                    scale: true,
                    draw: {
                        draw: {
                            polygon: false,
                            polyline: false,
                            rectangle: false,
                            circle: false,
                            marker: false
                        }
                    },
                    custom: new Array(L.Control.zoomHome({ homeCoordinates: [39, -100], homeZoom: 4 }), L.control.locate({ follow: true }))
                };
                this.events = {
                    map: {
                        enable: ['mousemove']
                    }
                };
                this.mapPoint = new MapPoint();
                L.Icon.Default.imagePath = 'images';
            };
            MapController.prototype.basinEditor = function () {
                var _this = this;
                var basin = JSON.parse(JSON.stringify(this.geojson['globalwatershed'].data.features[0]));
                var basinConverted = [];
                basin.geometry.coordinates[0].forEach(function (item) {
                    basinConverted.push([item[1], item[0]]);
                });
                this.leafletData.getMap().then(function (map) {
                    _this.leafletData.getLayers().then(function (maplayers) {
                        console.log('maplayers', map, maplayers);
                        //create draw control
                        var drawnItems = maplayers.overlays.draw;
                        drawnItems.clearLayers();
                        var drawControl = new L.Draw.Polygon(map, drawnItems);
                        drawControl.enable();
                        //listen for end of draw
                        map.on('draw:created', function (e) {
                            map.removeEventListener('draw:created');
                            var layer = e.layer;
                            drawnItems.addLayer(layer);
                            //convert edit polygon coords
                            var editArea = layer.toGeoJSON().geometry.coordinates[0];
                            var editAreaConverted = [];
                            editArea.forEach(function (item) {
                                editAreaConverted.push([item[1], item[0]]);
                            });
                            var sourcePolygon = L.polygon(basinConverted);
                            var clipPolygon = L.polygon(editAreaConverted);
                            if (_this.studyArea.drawControlOption == 'add') {
                                console.log('add layer', layer.toGeoJSON());
                                var editPolygon = greinerHormann.union(sourcePolygon, clipPolygon);
                                _this.studyArea.editedAreas.added.push(layer.toGeoJSON());
                            }
                            if (_this.studyArea.drawControlOption == 'remove') {
                                console.log('remove layer', layer.toGeoJSON());
                                var editPolygon = greinerHormann.diff(sourcePolygon, clipPolygon);
                                //check for split polygon
                                console.log('editPoly', editPolygon.length);
                                if (editPolygon.length == 2) {
                                    alert('Splitting polygons is not permitted');
                                    drawnItems.clearLayers();
                                    return;
                                }
                                _this.studyArea.editedAreas.removed.push(layer.toGeoJSON());
                            }
                            //set studyArea basin to new edited polygon
                            basin.geometry.coordinates[0] = [];
                            editPolygon.forEach(function (item) {
                                basin.geometry.coordinates[0].push([item[1], item[0]]);
                            });
                            console.log('edited basin', basin);
                            //show new polygon
                            _this.geojson['globalwatershed'].data.features[0] = basin;
                            drawnItems.clearLayers();
                            console.log('editedAreas', _this.studyArea.editedAreas);
                        });
                    });
                });
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
            MapController.prototype.onSelectedStudyAreaChanged = function () {
                var _this = this;
                console.log('study area changed');
                this.geojson = {};
                if (!this.studyArea.selectedStudyArea.Features)
                    return;
                var lat = this.studyArea.selectedStudyArea.Pourpoint.Latitude;
                var lng = this.studyArea.selectedStudyArea.Pourpoint.Longitude;
                var rcode = this.studyArea.selectedStudyArea.RegionID;
                var workspaceID = this.studyArea.selectedStudyArea.WorkspaceID;
                this.studyArea.selectedStudyArea.Features.forEach(function (layer) {
                    var item = JSON.parse(JSON.stringify(layer));
                    console.log('in onselectedstudyarea changed', item.name);
                    if (item.name == 'globalwatershed') {
                        _this.geojson[item.name] = {
                            data: item.feature,
                            style: {
                                fillColor: "yellow",
                                weight: 2,
                                opacity: 1,
                                color: 'white',
                                fillOpacity: 0.5
                            }
                        };
                    }
                    if (item.name == 'globalwatershedpoint') {
                        _this.geojson[item.name] = {
                            data: item.feature,
                            onEachFeature: function (feature, layer) {
                                var popupContent = '<strong>Latitude: </strong>' + lat + '</br><strong>Longitude: </strong>' + lng + '</br><strong>Region: </strong>' + rcode + '</br><strong>WorkspaceID: </strong>' + workspaceID + '</br>';
                                angular.forEach(feature.properties, function (value, key) {
                                    popupContent += '<strong>' + key + ': </strong>' + value + '</br>';
                                });
                                layer.bindPopup(popupContent);
                            }
                        };
                    }
                    if (item.name == 'regulatedWatershed') {
                        console.log('showing regulated watershed');
                        _this.geojson[item.name] = {
                            data: item.feature,
                            style: {
                                fillColor: "red",
                                weight: 2,
                                opacity: 1,
                                color: 'white',
                                fillOpacity: 0.5
                            }
                        };
                    }
                });
                console.log('geojson', this.geojson);
                //clear out this.markers
                this.markers = {};
                //console.log(JSON.stringify(this.geojson));    
                var bbox = this.geojson['globalwatershed'].data.features[0].bbox;
                //this.bounds = this.leafletBoundsHelperService.createBoundsFromArray([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
                this.leafletData.getMap().then(function (map) {
                    map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]], {});
                });
            };
            MapController.prototype.setRegionsByBounds = function (oldValue, newValue) {
                if (this.center.zoom >= 9 && oldValue !== newValue) {
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
                this.layers.overlays[regionId + "_region"] = new Layer(regionId + " Region", configuration.baseurls['StreamStats'] + "/arcgis/rest/services/{0}_ss/MapServer".format(regionId.toLowerCase()), "agsDynamic", true, {
                    "opacity": 0.5,
                    "layers": this.regionServices.loadMapLayersByRegion(regionId)
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
            MapController.prototype.startDelineate = function (latlng) {
                console.log('in startDelineate', latlng);
                this.markers['pourpoint'] = {
                    lat: latlng.lat,
                    lng: latlng.lng,
                    message: 'New Pourpoint</br><strong>Latitude: </strong>' + latlng.lat + '</br><strong>Longitude: </strong>' + latlng.lng,
                    focus: false,
                    draggable: false
                };
                var studyArea = new StreamStats.Models.StudyArea(this.regionServices.selectedRegion.RegionID, new WiM.Models.Point(latlng.lat, latlng.lng, '4326'));
                this.studyArea.AddStudyArea(studyArea);
                this.studyArea.loadStudyBoundary();
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            MapController.$inject = ['$scope', '$location', '$stateParams', 'leafletBoundsHelpers', 'leafletData', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService'];
            return MapController;
        })(); //end class
        angular.module('StreamStats.Controllers').controller('StreamStats.Controllers.MapController', MapController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module
//# sourceMappingURL=MapController.js.map