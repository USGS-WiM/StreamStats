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
            function MapController($scope, toaster, $location, $stateParams, leafletBoundsHelper, leafletData, search, region, studyArea, StatisticsGroup) {
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
                this.toaster = toaster;
                this.searchService = search;
                this.$locationService = $location;
                this.regionServices = region;
                this.leafletBoundsHelperService = leafletBoundsHelper;
                this.leafletData = leafletData;
                this.studyArea = studyArea;
                this.nssService = StatisticsGroup;
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
                    console.log('caputred map click');
                    //listen for delineate click if ready
                    if (studyArea.doDelineateFlag) {
                        var latlng = args.leafletEvent.latlng;
                        _this.checkDelineatePoint(latlng);
                    }
                    else {
                        _this.queryStates(args.leafletEvent);
                    }
                });
                $scope.$watch(function () { return _this.bounds; }, function (newval, oldval) { return _this.mapBoundsChange(oldval, newval); });
                $scope.$on('$locationChangeStart', function () { return _this.updateRegion(); });
                $scope.$watch(function () { return studyArea.doDelineateFlag; }, function (newval, oldval) { return newval ? _this.cursorStyle = 'crosshair' : _this.cursorStyle = 'hand'; });
                // check if region was explicitly set.
                if ($stateParams.rcode)
                    this.setBoundsByRegion($stateParams.rcode);
                if ($stateParams.rcode && $stateParams.workspaceID)
                    this.studyArea.loadWatershed($stateParams.rcode, $stateParams.workspaceID);
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
                this.center = new Center(39, -100, 3);
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
                    custom: new Array(L.Control.zoomHome({ homeCoordinates: [39, -100], homeZoom: 4 }), L.control.locate({ follow: false }))
                };
                this.events = {
                    map: {
                        enable: ['mousemove']
                    }
                };
                this.mapPoint = new MapPoint();
                L.Icon.Default.imagePath = 'images';
            };
            MapController.prototype.scaleLookup = function (mapZoom) {
                console.log('in scale lookup', mapZoom);
                switch (mapZoom) {
                    case 19: return '1,128';
                    case 18: return '2,256';
                    case 17: return '4,513';
                    case 16: return '9,027';
                    case 15: return '18,055';
                    case 14: return '36,111';
                    case 13: return '72,223';
                    case 12: return '144,447';
                    case 11: return '288,895';
                    case 10: return '577,790';
                    case 9: return '1,155,581';
                    case 8: return '2,311,162';
                    case 7: return '4,622,324';
                    case 6: return '9,244,649';
                    case 5: return '18,489,298';
                    case 4: return '36,978,596';
                    case 3: return '73,957,193';
                    case 2: return '147,914,387';
                    case 1: return '295,828,775';
                    case 0: return '591,657,550';
                }
            };
            MapController.prototype.queryStates = function (evt) {
                var _this = this;
                console.log('in querystates');
                this.leafletData.getMap().then(function (map) {
                    _this.leafletData.getLayers().then(function (maplayers) {
                        maplayers.overlays["SSLayer"].identify().on(map).at(evt.latlng).returnGeometry(false).layers([3]).run(function (error, results) {
                            console.log('map query', error, results);
                            if (!results.features[0])
                                return;
                            var rcode = results.features[0].properties.ST_ABBR;
                            _this.regionServices.masterRegionList.forEach(function (item) {
                                if (item.RegionID == rcode) {
                                    _this.setBoundsByRegion(rcode);
                                    _this.regionServices.loadParametersByRegion();
                                }
                            });
                        });
                    });
                });
            };
            MapController.prototype.basinEditor = function () {
                var _this = this;
                var basin = angular.fromJson(angular.toJson(this.geojson['globalwatershed'].data.features[0]));
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
                                _this.studyArea.WatershedEditDecisionList.append.push(layer.toGeoJSON());
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
                                _this.studyArea.WatershedEditDecisionList.remove.push(layer.toGeoJSON());
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
                            console.log('editedAreas', angular.toJson(_this.studyArea.WatershedEditDecisionList));
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
                console.log('in onselected region changed', this.regionServices.regionList, this.regionServices.selectedRegion);
                if (!this.regionServices.selectedRegion)
                    return;
                this.removeOverlayLayers("_region", true);
                this.addRegionOverlayLayers(this.regionServices.selectedRegion.RegionID);
            };
            MapController.prototype.onSelectedStudyAreaChanged = function () {
                var _this = this;
                console.log('study area changed');
                this.geojson = {};
                if (!this.studyArea.selectedStudyArea || !this.studyArea.selectedStudyArea.Features)
                    return;
                var lat = this.studyArea.selectedStudyArea.Pourpoint.Latitude;
                var lng = this.studyArea.selectedStudyArea.Pourpoint.Longitude;
                var rcode = this.studyArea.selectedStudyArea.RegionID;
                var workspaceID = this.studyArea.selectedStudyArea.WorkspaceID;
                this.studyArea.selectedStudyArea.Features.forEach(function (layer) {
                    var item = angular.fromJson(angular.toJson(layer));
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
                //console.log(angular.toJson(this.geojson));    
                var bbox = this.geojson['globalwatershed'].data.features[0].bbox;
                //this.bounds = this.leafletBoundsHelperService.createBoundsFromArray([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
                this.leafletData.getMap().then(function (map) {
                    map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]], {});
                });
                //query basin against regression regions
                this.queryRegressionRegions();
            };
            MapController.prototype.queryRegressionRegions = function () {
                this.toaster.pop('info', "Query regression regions with delineated basin", "Please wait...", 0);
                this.nssService.queriedRegions = true;
                //send watershed to map service query that returns list of regression regions that overlap the watershed
                //DO MAP SERVICE REQUEST HERE
                //region placeholder
                this.studyArea.selectedStudyArea.RegressionRegions = ['290'];
                this.nssService.loadStatisticsGroupTypes(this.regionServices.selectedRegion.RegionID, this.studyArea.selectedStudyArea.RegressionRegions[0]);
            };
            MapController.prototype.mapBoundsChange = function (oldValue, newValue) {
                this.nomnimalZoomLevel = this.scaleLookup(this.center.zoom);
                if (this.center.zoom >= 9 && oldValue !== newValue) {
                    console.log('requesting region list');
                    this.regionServices.loadRegionListByExtent(this.bounds.northEast.lng, this.bounds.southWest.lng, this.bounds.southWest.lat, this.bounds.northEast.lat);
                }
                //if a region was selected, and then user zooms back out, clear and start over
                if (this.center.zoom <= 6 && oldValue !== newValue) {
                    console.log('removing region layers', this.layers.overlays);
                    this.regionServices.clearRegion();
                    this.studyArea.clearStudyArea();
                    this.nssService.clearNSSdata();
                    //THIS IS JUST THROWING AN ANGULAR LEAFLET ERROR EVEN THOUGH SAME AS DOCS
                    // http://tombatossals.github.io/angular-leaflet-directive/examples/0000-viewer.html#/layers/dynamic-addition-example
                    this.removeOverlayLayers("_region", true);
                }
                if (this.center.zoom >= 15) {
                    this.studyArea.showDelineateButton = true;
                }
                else {
                    this.studyArea.showDelineateButton = false;
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
                this.regionServices.loadMapLayersByRegion(regionId);
                //refine list here if needed
                //if ((value.name.toLowerCase().indexOf('stream grid') > -1) || (value.name.toLowerCase().indexOf('study area bndys') > -1) || (value.name.toLowerCase().indexOf('str') > -1)) {   };
                console.log('adding layers to map');
                this.layers.overlays[regionId + "_region"] = new Layer(regionId + " Map layers", configuration.baseurls['StreamStats'] + "/arcgis/rest/services/{0}_ss/MapServer".format(regionId.toLowerCase()), "agsDynamic", true, {
                    "opacity": 0.5,
                    "layers": this.regionServices.regionMapLayerList,
                    "format": "png8",
                    "f": "image"
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
                    console.log('removing map overlay layer: ', item);
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
            MapController.prototype.checkDelineatePoint = function (latlng) {
                var _this = this;
                console.log('in check delineate point');
                //put pourpoint on the map
                this.markers['pourpoint'] = {
                    lat: latlng.lat,
                    lng: latlng.lng,
                    message: 'Your clicked point</br></br><strong>Latitude: </strong>' + latlng.lat.toFixed(5) + '</br><strong>Longitude: </strong>' + latlng.lng.toFixed(5),
                    focus: true,
                    draggable: false
                };
                //turn off delineate flag
                this.studyArea.doDelineateFlag = false;
                //clear toasts
                this.toaster.clear();
                //build list of layers to query before delineate
                var queryString = 'visible:';
                this.regionServices.regionMapLayerList.forEach(function (item) {
                    if (item[0] == "Area of limited functionality")
                        queryString += String(item[1]);
                });
                console.log('queryList', queryString);
                this.toaster.pop("info", "Information", "Validating your clicked point...", 5000);
                this.leafletData.getMap().then(function (map) {
                    _this.leafletData.getLayers().then(function (maplayers) {
                        var selectedRegionLayerName = _this.regionServices.selectedRegion.RegionID + "_region";
                        maplayers.overlays[selectedRegionLayerName].identify().on(map).at(latlng).returnGeometry(false).layers(queryString).run(function (error, results) {
                            //if there are no exclusion area hits
                            if (results.features.length == 0) {
                                _this.toaster.pop("success", "Your clicked point is valid", "Delineating your basin now...", 5000);
                                _this.startDelineate(latlng);
                            }
                            else {
                                var excludeCode = results.features[0].properties.ExcludeCode;
                                var popupMsg = results.features[0].properties.ExcludeReason;
                                if (excludeCode == 1) {
                                    _this.toaster.pop("error", "Delineation and flow statistic computation not allowed here", popupMsg, 0);
                                }
                                else {
                                    _this.toaster.pop("warning", "Delineation and flow statistic computation possible but not advised", popupMsg, true, 0);
                                    _this.startDelineate(latlng);
                                }
                            }
                        });
                    });
                });
            };
            MapController.prototype.startDelineate = function (latlng) {
                console.log('in startDelineate', latlng);
                var studyArea = new StreamStats.Models.StudyArea(this.regionServices.selectedRegion.RegionID, new WiM.Models.Point(latlng.lat, latlng.lng, '4326'));
                this.studyArea.AddStudyArea(studyArea);
                this.studyArea.loadStudyBoundary();
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            MapController.$inject = ['$scope', 'toaster', '$location', '$stateParams', 'leafletBoundsHelpers', 'leafletData', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService'];
            return MapController;
        })(); //end class
        angular.module('StreamStats.Controllers').controller('StreamStats.Controllers.MapController', MapController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module
//# sourceMappingURL=MapController.js.map