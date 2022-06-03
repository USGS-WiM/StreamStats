var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use strict';
        var MapPoint = (function () {
            function MapPoint() {
                this.lat = 0;
                this.lng = 0;
            }
            return MapPoint;
        }());
        var Center = (function () {
            function Center(lt, lg, zm) {
                this.lat = lt;
                this.lng = lg;
                this.zoom = zm;
            }
            return Center;
        }());
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
        }());
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
        }());
        var MapController = (function () {
            function MapController($scope, $compile, toaster, $analytics, $location, $stateParams, leafletBoundsHelper, leafletData, search, region, studyArea, StatisticsGroup, exploration, _prosperServices, eventManager, modal, modalStack) {
                var _this = this;
                this.$scope = $scope;
                this.$compile = $compile;
                this._prosperServices = _prosperServices;
                this.modal = modal;
                this.modalStack = modalStack;
                this.center = null;
                this.layers = null;
                this.mapDefaults = null;
                this.mapPoint = null;
                this.bounds = null;
                this.markers = null;
                this.paths = null;
                this.geojson = null;
                this.events = null;
                this.layercontrol = null;
                this.regionLayer = null;
                this._prosperIsActive = false;
                this.explorationToolsExpanded = false;
                this.gageLegendFix = false;
                this.regionLegendFix = false;
                this.nonsimplifiedBasinStyle = {
                    displayName: "Non-Simplified Basin",
                    imagesrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANkAAADJCAYAAACuaJftAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKsSURBVHhe7dwxbsJAEEBRkyPQU3L/A1HScwWCFEuRkEDB7I+t5L2Grei+lmEs7643E5D5mD+BiMggJjKIiQxiIoOYyCD2a3/hXw7H+QTbsz+f5tN4bjKIiQxiIoPYsJnMzMV/8soM5yaDmMggJjKILZ7JzGDw7dmM5iaDmMggJjKIiQxiIoOYyCAmMoj9eE9mLwaP2ZPBikQGMZFBzLOLMICZDFYkMoiJDGIig5jIICYyiIkMYvZksID3LsKGiAxiIoOYmQwG8OwirEhkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnEvOMDFvDeRdgQkUFMZBAzkz3wym9ueMZNBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQ211v5vNbLofjfPob9ufTfIL3uMkgJjKIiQxiIoOYyCAmMoiJDGLD9mT3Ru/N7vdW9ffDKG4yiIkMYiKDWDaTAV/cZBATGcREBjGRQUxkEBMZxEQGMZFBTGSQmqZPLJhZUkx8RY8AAAAASUVORK5CYII=",
                    fillColor: "red",
                    weight: 2,
                    opacity: 1,
                    color: 'red',
                    fillOpacity: 0.5
                };
                this.imageryToggled = false;
                $scope.vm = this;
                this.toaster = toaster;
                this.angulartics = $analytics;
                this.searchService = search;
                this.$locationService = $location;
                this.regionServices = region;
                this.leafletBoundsHelperService = leafletBoundsHelper;
                this.leafletData = leafletData;
                this.studyArea = studyArea;
                this.nssService = StatisticsGroup;
                this.explorationService = exploration;
                this.eventManager = eventManager;
                this.cursorStyle = 'pointer';
                this.environment = configuration.environment;
                this.selectedExplorationTool = null;
                this.init();
                this.eventManager.SubscribeToEvent(StreamStats.Services.onSelectedStudyAreaChanged, new WiM.Event.EventHandler(function () {
                    _this.onSelectedStudyAreaChanged();
                }));
                this.eventManager.SubscribeToEvent(WiM.Directives.onLayerChanged, new WiM.Event.EventHandler(function (sender, e) {
                    _this.onLayerChanged(sender, e);
                }));
                this.eventManager.SubscribeToEvent(WiM.Services.onSelectedAreaOfInterestChanged, new WiM.Event.EventHandler(function (sender, e) {
                    _this.onSelectedAreaOfInterestChanged(sender, e);
                }));
                this.eventManager.SubscribeToEvent(StreamStats.Services.onSelectedRegionChanged, new WiM.Event.EventHandler(function () {
                    _this.onSelectedRegionChanged();
                }));
                this.eventManager.SubscribeToEvent(StreamStats.Services.onEditClick, new WiM.Event.EventHandler(function (sender, e) {
                    _this.basinEditor();
                }));
                this.eventManager.SubscribeToEvent(StreamStats.Services.onStudyAreaReset, new WiM.Event.EventHandler(function () {
                    _this.removeGeoJson();
                }));
                this.eventManager.SubscribeToEvent(StreamStats.Services.onSelectedMethodExecuteComplete, new WiM.Event.EventHandler(function (sender, e) {
                    _this.onExplorationMethodComplete(sender, e);
                }));
                this.eventManager.SubscribeToEvent(StreamStats.Services.onSelectExplorationMethod, new WiM.Event.EventHandler(function (sender, e) {
                    if (sender.selectedMethod.navigationID != 0)
                        _this.onSelectExplorationMethod(sender, e);
                    if (sender.selectedMethod.navigationID == 0)
                        _this.selectedExplorationTool = null;
                }));
                $scope.$on('leafletDirectiveMap.mainMap.zoomend', function (event, args) {
                    if (_this.regionServices.selectedRegion && _this.center.zoom > 11 && _this.regionServices.selectedRegion.RegionID == "ME") {
                        _this.addGeoJSON("MeanAugustBaseflow", null);
                    }
                });
                $scope.$on('leafletDirectiveMap.mainMap.mousemove', function (event, args) {
                    var latlng = args.leafletEvent.latlng;
                    _this.mapPoint.lat = latlng.lat;
                    _this.mapPoint.lng = latlng.lng;
                    if (_this.studyArea.doDelineateFlag)
                        _this.cursorStyle = 'crosshair';
                });
                $scope.$on('leafletDirectiveMap.mainMap.drag', function (event, args) {
                    _this.cursorStyle = 'grabbing';
                });
                $scope.$on('leafletDirectiveMap.mainMap.dragend', function (event, args) {
                    _this.cursorStyle = 'pointer';
                });
                $scope.$on('leafletDirectiveMap.mainMap.click', function (event, args) {
                    if (_this._prosperServices.CanQuery) {
                        _this._prosperServices.GetPredictionValues(args.leafletEvent, _this.bounds);
                        return;
                    }
                    if (_this.studyArea.doDelineateFlag) {
                        _this.checkDelineatePoint(args.leafletEvent.latlng);
                        return;
                    }
                    if (_this.studyArea.showEditToolbar)
                        return;
                    if (_this.explorationService.drawMeasurement)
                        return;
                    if (_this.explorationService.drawElevationProfile)
                        return;
                    if (_this.studyArea.doSelectMapGage) {
                        _this.studyArea.queryNWIS(args.leafletEvent.latlng);
                        return;
                    }
                    if (exploration.selectedMethod != null && exploration.selectedMethod.locations.length <= exploration.selectedMethod.minLocations) {
                        console.log('in mapcontroller add point', exploration.selectedMethod.navigationPointCount, exploration.selectedMethod.locations.length);
                        if (exploration.explorationPointType == 'Start point location')
                            exploration.selectedMethod.addLocation('Start point location', new WiM.Models.Point(args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng, '4326'));
                        if (exploration.explorationPointType == 'End point location')
                            exploration.selectedMethod.addLocation('End point location', new WiM.Models.Point(args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng, '4326'));
                        for (var i = 0; i < exploration.selectedMethod.locations.length; i++) {
                            var item = exploration.selectedMethod.locations[i];
                            _this.markers['netnav_' + i] = {
                                lat: item.Latitude,
                                lng: item.Longitude,
                                message: exploration.selectedMethod.navigationName,
                                focus: true,
                                draggable: false
                            };
                        }
                        _this.modal.openModal(StreamStats.Services.SSModalType.e_exploration);
                    }
                    else {
                        _this.queryPoints(args.leafletEvent);
                    }
                });
                $scope.$watch(function () { return _this.bounds; }, function (newval, oldval) { return _this.mapBoundsChange(oldval, newval); });
                $scope.$watch(function () { return _this.explorationService.elevationProfileGeoJSON; }, function (newval, oldval) {
                    if (newval)
                        _this.displayElevationProfile();
                });
                $scope.$watch(function () { return _this.explorationService.drawElevationProfile; }, function (newval, oldval) {
                    if (newval) {
                        _this.modal.openModal(StreamStats.Services.SSModalType.e_exploration);
                    }
                });
                $scope.$watch(function () { return _this.explorationService.selectElevationPoints; }, function (newval, oldval) {
                    if (newval)
                        _this.elevationProfile();
                });
                $scope.$watch(function () { return _this.explorationService.drawMeasurement; }, function (newval, oldval) {
                    if (newval)
                        _this.measurement();
                });
                $scope.$watch(function () { return _this.regionServices.regionMapLayerListLoaded; }, function (newval, oldval) {
                    if (newval) {
                        _this.addRegionOverlayLayers(_this.regionServices.selectedRegion.RegionID);
                    }
                });
                $scope.$watch(function () { return _this._prosperServices.DisplayedPrediction; }, function (newval, oldval) {
                    if (newval && _this.ProsperIsActive) {
                        _this.removeOverlayLayers("prosper", true);
                        _this.AddProsperLayer(newval.id);
                    }
                });
                $scope.$on('$locationChangeStart', function () { return _this.updateRegion(); });
                if ($stateParams.rcode) {
                    this.regionServices.loadParametersByRegion();
                    this.setBoundsByRegion($stateParams.rcode);
                }
                if ($stateParams.rcode && $stateParams.workspaceID) {
                    this.regionServices.loadParametersByRegion();
                    this.studyArea.loadWatershed($stateParams.rcode, $stateParams.workspaceID);
                }
                $scope.$watch(function () { return _this.studyArea.regressionRegionQueryComplete; }, function (newval, oldval) {
                    if (newval && _this.studyArea.selectedStudyArea.RegressionRegions)
                        _this.nssService.loadStatisticsGroupTypes(_this.regionServices.selectedRegion.RegionID, _this.studyArea.selectedStudyArea.RegressionRegions.map(function (elem) {
                            return elem.code;
                        }).join(","));
                });
                $scope.$watch(function () { return _this.studyArea.streamgageLayer; }, function (newval, oldval) {
                    if (newval != oldval) {
                        _this.addGeoJSON('streamgages', newval);
                    }
                });
            }
            Object.defineProperty(MapController.prototype, "selectedExplorationMethodType", {
                get: function () {
                    if (this.explorationService.selectedMethod == null)
                        return 0;
                    return this.explorationService.selectedMethod.navigationID;
                },
                set: function (val) {
                    this.explorationService.setMethod(val, {});
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(MapController.prototype, "ProsperIsActive", {
                get: function () {
                    return this._prosperIsActive;
                },
                enumerable: false,
                configurable: true
            });
            MapController.prototype.setExplorationMethodType = function (val) {
                this.removeGeoJsonLayers("netnav_", true);
                this.explorationService.getNavigationConfiguration(val);
            };
            MapController.prototype.ExecuteNav = function () {
                if (this.explorationService.selectedMethod.locations.length != this.explorationService.selectedMethod.minLocations) {
                    this.toaster.pop("warning", "Warning", "You must select at least " + this.explorationService.selectedMethod.minLocations + " points.", 10000);
                    return;
                }
                var isOK = false;
                this.explorationService.explorationMethodBusy = true;
                this.explorationService.ExecuteSelectedModel();
            };
            MapController.prototype.ToggleProsper = function () {
                if (this._prosperIsActive) {
                    this._prosperIsActive = false;
                    this._prosperServices.CanQuery = false;
                    this.removeOverlayLayers("prosper", true);
                }
                else {
                    this._prosperIsActive = true;
                    this.AddProsperLayer(this._prosperServices.DisplayedPrediction.id);
                    this.ConfigureProsper();
                }
            };
            MapController.prototype.ConfigureProsper = function () {
                this.modal.openModal(StreamStats.Services.SSModalType.e_prosper);
            };
            MapController.prototype.openGagePage = function (siteid) {
                console.log('gage page id:', siteid);
                this.modal.openModal(StreamStats.Services.SSModalType.e_gagepage, { 'siteid': siteid });
            };
            MapController.prototype.init = function () {
                this.setupMap();
                this.explorationService.getNavigationEndPoints();
            };
            MapController.prototype.setupMap = function () {
                this.center = new Center(39, -100, 4);
                this.layers = {
                    baselayers: configuration.basemaps,
                    overlays: configuration.overlayedLayers
                };
                this.mapDefaults = new MapDefault(null, 3, true);
                this.markers = {};
                this.paths = {};
                this.geojson = {};
                this.regionLayer = {};
                var width = 600;
                if ($(window).width() < 768)
                    width = $(window).width() * 0.7;
                this.controls = {
                    scale: true,
                    draw: {
                        draw: {
                            polygon: false,
                            polyline: false,
                            rectangle: false,
                            circle: false,
                            circlemarker: false,
                            marker: false
                        }
                    },
                    custom: new Array(L.control.locate({ follow: false, locateOptions: { "maxZoom": 15 } }), L.control.elevation({ imperial: true, width: width }))
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
            MapController.prototype.queryPoints = function (evt) {
                var _this = this;
                this.toaster.pop("wait", "Information", "Querying Points...", 0);
                this.cursorStyle = 'wait';
                this.markers = {};
                this.leafletData.getMap("mainMap").then(function (map) {
                    _this.leafletData.getLayers("mainMap").then(function (maplayers) {
                        if (map.getZoom() <= 8) {
                            _this.cursorStyle = 'pointer';
                            _this.toaster.clear();
                            _this.toaster.pop("warning", "Warning", "You must be at Zoom Level 9 or greater to query points", 5000);
                            return;
                        }
                        _this.queryContent = { requestCount: 0, Content: $("<div>").attr("id", 'popupContent'), responseCount: 0 };
                        var _loop_1 = function (lyr) {
                            if (!maplayers.overlays.hasOwnProperty(lyr))
                                return "continue";
                            if (["MaskLayer", "draw"].indexOf(lyr) > -1)
                                return "continue";
                            if (!map.hasLayer(maplayers.overlays[lyr]))
                                return "continue";
                            switch (_this.layers.overlays[lyr].type) {
                                case "agsFeature":
                                    maplayers.overlays[lyr].query().nearby(evt.latlng, 4).returnGeometry(false).run(function (error, results) { return _this.handleQueryResult(lyr, error, results, map, evt.latlng); });
                                    break;
                                default:
                                    saveLayerName = lyr;
                                    maplayers.overlays[lyr].identify().on(map).at(evt.latlng).returnGeometry(false).tolerance(5).run(function (error, results) { return _this.handleQueryResult(saveLayerName, error, results, map, evt.latlng); });
                            }
                            _this.queryContent.requestCount++;
                        };
                        var saveLayerName;
                        for (var lyr in maplayers.overlays) {
                            _loop_1(lyr);
                        }
                    });
                });
            };
            MapController.prototype.handleQueryResult = function (lyr, error, results, map, latlng) {
                var _this = this;
                var querylayers = $("<div>").attr("id", lyr).appendTo(this.queryContent.Content);
                this.queryContent.requestCount--;
                results.features.forEach(function (queryResult) {
                    if (_this.layers.overlays[lyr].hasOwnProperty('layerArray')) {
                        _this.layers.overlays[lyr].layerArray.forEach(function (item) {
                            if (item.layerId !== queryResult.layerId)
                                return;
                            if (["StreamGrid", "ExcludePolys", "Region", "Subregion", "Basin", "Subbasin", "Watershed", "Subwatershed"].indexOf(item.layerName) > -1)
                                return;
                            querylayers.append('<h5>' + item.layerName + '</h5>');
                            _this.queryContent.responseCount++;
                            _this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'queryPoints' });
                            if (_this.layers.overlays[lyr].hasOwnProperty("queryProperties") && _this.layers.overlays[lyr].queryProperties.hasOwnProperty(item.layerName)) {
                                var queryProperties_1 = _this.layers.overlays[lyr].queryProperties[item.layerName];
                                Object.keys(queryProperties_1).map(function (k) {
                                    if (item.layerName == "Streamgages" && k == "FeatureURL") {
                                        var siteNo = queryResult.properties[k].split('site_no=')[1];
                                        var SSgagepage = 'https://streamstatsags.cr.usgs.gov/gagepages/html/' + siteNo + '.htm';
                                        var SSgagepageNew = "vm.openGagePage('" + siteNo + "')";
                                        var html = '<strong>NWIS page: </strong><a href="' + queryResult.properties[k] + ' "target="_blank">link</a></br><strong>StreamStats Gage page: </strong><a href="' + SSgagepage + '" target="_blank">link</a></br><strong>New StreamStats Gage Modal: </strong><a ng-click="' + SSgagepageNew + '">link</a></br>';
                                        querylayers.append(html);
                                        _this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'streamgageQuery' });
                                    }
                                    else if (item.layerName == "Mean August Baseflow") {
                                        if (queryProperties_1[k] == "Drainage Area out-of-bounds" || queryProperties_1[k] == "Mean July Precip out-of-bounds" || queryProperties_1[k] == "% Aquifer Area out-of-bounds" || queryProperties_1[k] == "Regulated stream/river") {
                                            if (queryResult.properties[k] == 0)
                                                queryResult.properties[k] = "No";
                                            else if (queryResult.properties[k] == 1)
                                                queryResult.properties[k] = "Yes";
                                        }
                                        querylayers.append('<strong>' + queryProperties_1[k] + ': </strong>' + queryResult.properties[k] + '</br>');
                                    }
                                    else {
                                        querylayers.append('<strong>' + queryProperties_1[k] + ': </strong>' + queryResult.properties[k] + '</br>');
                                    }
                                });
                            }
                            else {
                                angular.forEach(queryResult.properties, function (value, key) {
                                    querylayers.append('<strong>' + key + ': </strong>' + value + '</br>');
                                });
                            }
                        });
                    }
                });
                if (this.queryContent.requestCount < 1) {
                    this.toaster.clear();
                    this.cursorStyle = 'pointer';
                    if (this.queryContent.responseCount > 0) {
                        var html = this.queryContent.Content.html();
                        var compiledHtml = this.$compile(html)(this.$scope);
                        var compiledHtmlIndex = 0;
                        compiledHtml.toArray().forEach(function (htmlElement, index) {
                            if (htmlElement.innerHTML.length > 0) {
                                compiledHtmlIndex = index;
                            }
                        });
                        map.openPopup(compiledHtml[compiledHtmlIndex], [latlng.lat, latlng.lng], { maxHeight: 200 });
                    }
                    else {
                        this.toaster.pop("warning", "Information", "No points were found at this location", 5000);
                    }
                }
            };
            MapController.prototype.elevationProfile = function () {
                var _this = this;
                document.getElementById('measurement-div').innerHTML = '';
                this.explorationService.measurementData = '';
                this.explorationService.showElevationChart = true;
                var el;
                this.controls.custom.forEach(function (control) {
                    if (control._container.className.indexOf("elevation") > -1)
                        el = control;
                });
                this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'elevationProfile' });
                this.leafletData.getMap("mainMap").then(function (map) {
                    _this.leafletData.getLayers("mainMap").then(function (maplayers) {
                        var drawnItems = maplayers.overlays.draw;
                        drawnItems.clearLayers();
                        _this.drawController({ metric: false }, true);
                        delete _this.geojson['elevationProfileLine3D'];
                        map.on('draw:drawstart', function (e) {
                            el.clear();
                        });
                        map.on('draw:created', function (e) {
                            map.removeEventListener('draw:created');
                            var feature = e.layer.toGeoJSON();
                            var esriJSON = '{"geometryType":"esriGeometryPolyline","spatialReference":{"wkid":"4326"},"fields": [],"features":[{"geometry": {"type":"polyline", "paths":[' + JSON.stringify(feature.geometry.coordinates) + ']}}]}';
                            _this.toaster.pop("wait", "Information", "Querying the elevation service...", 0);
                            _this.explorationService.elevationProfile(esriJSON);
                            _this.explorationService.drawElevationProfile = false;
                            map.panBy([0, 1]);
                        });
                    });
                });
            };
            MapController.prototype.drawController = function (options, enable) {
                var _this = this;
                if (!enable) {
                    this.drawControl.disable();
                    this.drawControl = undefined;
                    return;
                }
                this.leafletData.getMap("mainMap").then(function (map) {
                    _this.drawControl = new L.Draw.Polyline(map, options);
                    _this.drawControl.enable();
                });
            };
            MapController.prototype.displayElevationProfile = function () {
                var _this = this;
                var el;
                this.controls.custom.forEach(function (control) {
                    if (control._container && control._container.className.indexOf("elevation") > -1)
                        el = control;
                });
                this.geojson["elevationProfileLine3D"] = {
                    data: this.explorationService.elevationProfileGeoJSON,
                    style: {
                        "color": "#ff7800",
                        "weight": 5,
                        "opacity": 0.65
                    },
                    onEachFeature: el.addData.bind(el)
                };
                this.leafletData.getMap("mainMap").then(function (map) {
                    var container = el.onAdd(map);
                    _this.explorationService.elevationProfileHTML = container.innerHTML;
                    _this.modal.openModal(StreamStats.Services.SSModalType.e_exploration);
                    delete _this.geojson['elevationProfileLine3D'];
                });
                this.toaster.clear();
                this.cursorStyle = 'pointer';
                this.selectedExplorationTool = null;
            };
            MapController.prototype.showLocation = function () {
                var _this = this;
                this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'showLocation' });
                var lc;
                this.controls.custom.forEach(function (control) {
                    if (control._container.className.indexOf("leaflet-control-locate") > -1)
                        lc = control;
                });
                lc.start();
                this.leafletData.getMap("mainMap").then(function (map) {
                    map.on('locationfound', function () { _this.selectedExplorationTool = null; });
                });
            };
            MapController.prototype.resetExplorationTools = function () {
                var _this = this;
                document.getElementById('measurement-div').innerHTML = '';
                this.explorationService.elevationProfileHTML = '';
                if (this.drawControl)
                    this.drawController({}, false);
                this.explorationService.measurementData = '';
                this.explorationService.drawElevationProfile = false;
                this.explorationService.drawMeasurement = false;
                this.explorationService.selectElevationPoints = false;
                delete this.geojson['elevationProfileLine3D'];
                this.leafletData.getMap("mainMap").then(function (map) {
                    _this.leafletData.getLayers("mainMap").then(function (maplayers) {
                        var drawnItems = maplayers.overlays.draw;
                        drawnItems.clearLayers();
                        if (_this.measurestart)
                            map.off("click", _this.measurestart);
                        if (_this.measuremove)
                            map.off("mousemove", _this.measuremove);
                        if (_this.measurestop)
                            map.off("draw:created", _this.measurestop);
                    });
                });
                this.explorationService.networkNavResults = [];
                this.selectedExplorationMethodType = 0;
                this.removeMarkerLayers("netnav_", true);
                this.removeGeoJsonLayers("netnavpoints", true);
                this.removeGeoJsonLayers("netnavroute", true);
                this.selectedExplorationTool = null;
                this.explorationService.explorationPointType = null;
            };
            MapController.prototype.measurement = function () {
                var _this = this;
                this.explorationService.measurementData = 'Click the map to begin\nDouble click to end the Drawing';
                this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'measurement' });
                this.leafletData.getMap("mainMap").then(function (map) {
                    _this.leafletData.getLayers("mainMap").then(function (maplayers) {
                        var stopclick = false;
                        _this.drawController({ shapeOptions: { color: 'blue' }, metric: false }, true);
                        var drawnItems = maplayers.overlays.draw;
                        drawnItems.clearLayers();
                        _this.measuremove = function () {
                            _this.explorationService.measurementData = "Total length: " + _this.drawControl._getMeasurementString();
                        };
                        _this.measurestart = function () {
                            if (stopclick == false) {
                                stopclick = true;
                                _this.explorationService.measurementData = "Total Length: ";
                                map.on("mousemove", _this.measuremove);
                            }
                            ;
                        };
                        _this.measurestop = function (e) {
                            var layer = e.layer;
                            drawnItems.addLayer(layer);
                            drawnItems.addTo(map);
                            var tempLatLng = null;
                            var totalDistance = 0.00000;
                            $.each(e.layer._latlngs, function (i, latlng) {
                                if (tempLatLng == null) {
                                    tempLatLng = latlng;
                                    return;
                                }
                                totalDistance += tempLatLng.distanceTo(latlng);
                                tempLatLng = latlng;
                            });
                            _this.explorationService.measurementData = "Total length: " + (totalDistance * 3.28084).toFixed(0) + " ft";
                            map.off("click", _this.measurestart);
                            map.off("mousemove", _this.measuremove);
                            map.off("draw:created", _this.measurestop);
                            _this.drawControl.disable();
                            _this.explorationService.drawMeasurement = false;
                            _this.selectedExplorationTool = null;
                        };
                        map.on("click", _this.measurestart);
                        map.on("draw:created", _this.measurestop);
                    });
                });
            };
            MapController.prototype.checkDelineatePoint = function (latlng) {
                var _this = this;
                this.leafletData.getMap("mainMap").then(function (map) {
                    _this.leafletData.getLayers("mainMap").then(function (maplayers) {
                        if (map.getZoom() < 15) {
                            _this.toaster.pop("error", "Delineation not allowed at this zoom level", 'Please zoom in to level 15 or greater', 5000);
                        }
                        else {
                            _this.toaster.clear();
                            _this.studyArea.checkingDelineatedPoint = true;
                            _this.toaster.pop("info", "Information", "Validating your clicked point...", true, 0);
                            _this.cursorStyle = 'wait';
                            _this.markers = {};
                            _this.markers['pourpoint'] = {
                                lat: latlng.lat,
                                lng: latlng.lng,
                                message: 'Your clicked point</br></br><strong>Latitude: </strong>' + latlng.lat.toFixed(5) + '</br><strong>Longitude: </strong>' + latlng.lng.toFixed(5),
                                focus: true,
                                draggable: true
                            };
                            _this.studyArea.doDelineateFlag = false;
                            var queryString = 'visible:';
                            _this.regionServices.regionMapLayerList.forEach(function (item) {
                                if (item[0] == 'ExcludePolys')
                                    queryString += item[1];
                            });
                            _this.angulartics.eventTrack('delineationClick', { category: 'Map', label: _this.regionServices.selectedRegion.Name });
                            map.invalidateSize();
                            var selectedRegionLayerName = _this.regionServices.selectedRegion.RegionID + "_region";
                            if (queryString === 'visible:') {
                                _this.toaster.clear();
                                _this.toaster.pop("warning", "Selected State/Region does not have exlusion areas defined", "Delineating with no exclude polygon layer...", true, 0);
                                _this.startDelineate(latlng, true);
                                _this.angulartics.eventTrack('validatePoint', { category: 'Map', label: 'not advised (no point query)' });
                                _this.cursorStyle = 'pointer';
                                return;
                            }
                            var layerName;
                            for (var layer in maplayers.overlays) {
                                for (var llayer in _this.layers.overlays) {
                                    if (llayer === layer && _this.layers.overlays[llayer].layerArray !== undefined && _this.layers.overlays[llayer].layerArray[0].layerName === 'ExcludePolys') {
                                        layerName = layer;
                                    }
                                }
                            }
                            ;
                            maplayers.overlays[layerName].identify().on(map).at(latlng).returnGeometry(false).layers(queryString).run(function (error, results) {
                                _this.toaster.clear();
                                if (results.features.length == 0) {
                                    _this.angulartics.eventTrack('validatePoint', { category: 'Map', label: 'valid' });
                                    _this.toaster.pop("success", "Your clicked point is valid", "Delineating your basin now...", 5000);
                                    _this.studyArea.checkingDelineatedPoint = false;
                                    _this.startDelineate(latlng, false);
                                }
                                else {
                                    _this.studyArea.checkingDelineatedPoint = false;
                                    var excludeCode = results.features[0].properties.ExcludeCod;
                                    var popupMsg = results.features[0].properties.ExcludeRea;
                                    if (excludeCode == 1) {
                                        _this.toaster.pop("error", "Delineation and flow statistic computation not allowed here", popupMsg, 0);
                                        _this.angulartics.eventTrack('validatePoint', { category: 'Map', label: 'not allowed' });
                                    }
                                    else {
                                        _this.toaster.pop("warning", "Delineation and flow statistic computation possible but not advised", popupMsg, true, 0);
                                        _this.startDelineate(latlng, true, popupMsg);
                                        _this.angulartics.eventTrack('validatePoint', { category: 'Map', label: 'not advised' });
                                    }
                                }
                                _this.cursorStyle = 'pointer';
                            });
                        }
                    });
                });
            };
            MapController.prototype.basinEditor = function () {
                var _this = this;
                this.leafletData.getMap("mainMap").then(function (map) {
                    _this.leafletData.getLayers("mainMap").then(function (maplayers) {
                        var drawnItems = maplayers.overlays.draw;
                        drawnItems.clearLayers();
                        var drawControl = new L.Draw.Polygon(map, drawnItems);
                        drawControl.enable();
                        map.on('draw:created', function (e) {
                            map.removeEventListener('draw:created');
                            var editLayer = e.layer;
                            drawnItems.addLayer(editLayer);
                            var clipPolygon = editLayer.toGeoJSON();
                            if (_this.studyArea.drawControlOption == 'add') {
                                if (_this.checkEditIntersects('adds', clipPolygon)) {
                                    _this.toaster.pop("warning", "Warning", "Overlapping add and remove edit areas are not allowed", 5000);
                                }
                                else {
                                    _this.addGeoJSON('adds', clipPolygon);
                                    _this.angulartics.eventTrack('basinEditor', { category: 'Map', label: 'addArea' });
                                    _this.studyArea.WatershedEditDecisionList.append.push(clipPolygon);
                                }
                            }
                            if (_this.studyArea.drawControlOption == 'remove') {
                                if (_this.checkEditIntersects('removes', clipPolygon)) {
                                    _this.toaster.pop("warning", "Warning", "Overlapping add and remove edit areas are not allowed", 5000);
                                }
                                else {
                                    _this.addGeoJSON('removes', clipPolygon);
                                    _this.angulartics.eventTrack('basinEditor', { category: 'Map', label: 'removeArea' });
                                    _this.studyArea.WatershedEditDecisionList.remove.push(clipPolygon);
                                }
                            }
                            drawnItems.clearLayers();
                        });
                    });
                });
            };
            MapController.prototype.checkEditIntersects = function (editType, editPolygon) {
                var found = false;
                var oppositeEditType;
                (editType === 'adds') ? oppositeEditType = 'removes' : oppositeEditType = 'adds';
                if (this.geojson.hasOwnProperty(oppositeEditType)) {
                    this.geojson[oppositeEditType].data.features.forEach(function (layer) {
                        var intersection = turf.intersect(editPolygon, layer);
                        if (intersection != undefined) {
                            found = true;
                        }
                    });
                }
                return found;
            };
            MapController.prototype.canSelectExplorationTool = function (methodval) {
                switch (methodval) {
                    case StreamStats.Services.ExplorationMethodType.NETWORKPATH:
                        break;
                    case StreamStats.Services.ExplorationMethodType.FLOWPATH:
                        break;
                    case StreamStats.Services.ExplorationMethodType.NETWORKTRACE:
                        break;
                    default:
                        return false;
                }
                return true;
            };
            MapController.prototype.onExplorationMethodComplete = function (sender, e) {
                var _this = this;
                this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'networknav-' + this.explorationService.selectedMethod.navigationInfo.code });
                this.explorationService.explorationMethodBusy = false;
                if (e.features != null && e.features['features'].length > 0) {
                    this.removeMarkerLayers("netnav_", true);
                    this.explorationService.networkNavResults.forEach(function (layer, key) {
                        _this.addGeoJSON(layer.name, layer.feature);
                        if (layer.name == "netnavroute") {
                            _this.leafletData.getMap("mainMap").then(function (map) {
                                var tempExtent = L.geoJson(layer.feature);
                                map.fitBounds(tempExtent.getBounds());
                            });
                        }
                        _this.eventManager.RaiseEvent(WiM.Directives.onLayerAdded, _this, new WiM.Directives.LegendLayerAddedEventArgs(layer.name, "geojson", _this.geojson[layer.name].style));
                    });
                    this.selectedExplorationMethodType = 0;
                    this.selectedExplorationTool = null;
                    this.modalStack.dismissAll();
                }
                if (e.report != null && e.report != '') {
                    this.modal.openModal(StreamStats.Services.SSModalType.e_navreport, { placeholder: e.report });
                }
            };
            MapController.prototype.onSelectExplorationMethod = function (sender, e) {
                this.modal.openModal(StreamStats.Services.SSModalType.e_exploration);
            };
            MapController.prototype.onSelectedAreaOfInterestChanged = function (sender, e) {
                this.angulartics.eventTrack('Search', { category: 'Sidebar' });
                this.paths = {};
                var AOI = e.selectedAreaOfInterest;
                this.paths['AOI'] = {
                    type: "circleMarker",
                    radius: 15,
                    color: '#ff0000',
                    fillOpacity: 0.6,
                    stroke: false,
                    latlngs: {
                        lat: AOI.properties['Lat'],
                        lng: AOI.properties['Lon'],
                    }
                };
                this.leafletData.getMap("mainMap").then(function (map) {
                    map.fitBounds([
                        [AOI.properties['LatMin'], AOI.properties['LonMin']],
                        [AOI.properties['LatMax'], AOI.properties['LonMax']]
                    ]);
                    setTimeout(function () {
                        if (map.getZoom() < 8)
                            map.setZoom(8);
                    }, 500);
                    map.openPopup($.map(Object.keys(AOI.properties), function (property) {
                        if (["Label", "ElevFt", "Lat", "Lon", "Source"].indexOf(property) != 0 - 1)
                            return "<b>" + property + ": </b>" + AOI.properties[property];
                    }).join("<br/>"), [AOI.properties['Lat'], AOI.properties['Lon']]);
                });
            };
            MapController.prototype.onSelectedRegionChanged = function () {
                if (!this.regionServices.selectedRegion)
                    return;
                this.removeOverlayLayers("_region", true);
                if (this.studyArea.zoomLevel15 && !this.imageryToggled && this.regionServices.selectedRegion.Applications.some(function (a) { return ['StormDrain', 'Localres'].indexOf(a) > -1; }))
                    this.toggleImageryLayer();
                this.regionServices.loadMapLayersByRegion(this.regionServices.selectedRegion.RegionID);
            };
            MapController.prototype.onSelectedStudyAreaChanged = function () {
                var _this = this;
                var bbox;
                if (!this.studyArea.selectedStudyArea || !this.studyArea.selectedStudyArea.FeatureCollection)
                    return;
                this.markers = {};
                this.removeOverlayLayers('globalwatershed', true);
                this.studyArea.selectedStudyArea.FeatureCollection['features'].forEach(function (layer) {
                    var item = angular.fromJson(angular.toJson(layer));
                    var name = item.id.toLowerCase();
                    _this.addGeoJSON(name, item);
                    _this.eventManager.RaiseEvent(WiM.Directives.onLayerAdded, _this, new WiM.Directives.LegendLayerAddedEventArgs(name, "geojson", _this.geojson[name].style));
                });
                if (this.studyArea.selectedStudyArea.FeatureCollection['bbox']) {
                    bbox = this.studyArea.selectedStudyArea.FeatureCollection['bbox'];
                    this.leafletData.getMap("mainMap").then(function (map) {
                        map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]], {});
                    });
                }
                if (this.regionServices.selectedRegion.Applications.indexOf("KarstCheck") > -1) {
                    this.studyArea.queryKarst(this.regionServices.selectedRegion.RegionID, this.regionServices.regionMapLayerList);
                }
                if (!this.nssService.queriedRegions) {
                    if (!this.regionServices.selectedRegion.ScenariosAvailable) {
                        this.studyArea.regressionRegionQueryComplete = true;
                        return;
                    }
                    this.nssService.queriedRegions = true;
                }
            };
            MapController.prototype.AddProsperLayer = function (id) {
                this.layers.overlays["prosper" + id] = new Layer("Prosper Layer", configuration.baseurls['ScienceBase'] + configuration.queryparams['ProsperPredictions'], "agsDynamic", true, {
                    "opacity": 1,
                    "layers": [id],
                    "format": "png8",
                    "f": "image"
                });
            };
            MapController.prototype.removeGeoJson = function (layerName) {
                if (layerName === void 0) { layerName = ""; }
                if (this.geojson['nonsimplifiedbasin'] == undefined && this.nonsimplifiedBasin != undefined) {
                    this.eventManager.RaiseEvent(WiM.Directives.onLayerRemoved, this, new WiM.Directives.LegendLayerRemovedEventArgs('nonsimplifiedbasin', "geojson"));
                    this.nonsimplifiedBasin = undefined;
                }
                for (var k in this.geojson) {
                    if (typeof this.geojson[k] !== 'function' && (k != 'streamgages' || k == layerName)) {
                        delete this.geojson[k];
                        this.eventManager.RaiseEvent(WiM.Directives.onLayerRemoved, this, new WiM.Directives.LegendLayerRemovedEventArgs(k, "geojson"));
                    }
                }
            };
            MapController.prototype.addGeoJSON = function (LayerName, feature) {
                var _this = this;
                if (LayerName == 'globalwatershed') {
                    var verticies = feature.geometry.coordinates.reduce(function (count, row) { return count + row.length; }, 0);
                    var data = this.studyArea.simplify(angular.copy(feature));
                    var data_verticies = data.geometry.coordinates.reduce(function (count, row) { return count + row.length; }, 0);
                    this.geojson[LayerName] =
                        {
                            data: data,
                            style: {
                                displayName: "Basin Boundary",
                                imagesrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADCCAYAAAC/i6XiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKOSURBVHhe7dxBjoJAEEBRcO/9D+oBlElYTEwmE7XlI763kS2Ln0qlsefrYgIyp/UXiIgQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGL7+GztMq8PEDi3CZiEEBMhxEQIsW12QjsfRzJ4hzQJISZCiIkQYu/ZCe2AfJMXd0STEGIihJgIISZCiIkQYiKEmAghNuac0Lkg38w5IXw2EUJMhBATIcRECDERQkyEEBMhxEQIMRFCTIQQ8+0oPMq9o3AsIoSYCCFmJ4RX+T8hfDYRQkyEEBMhxEQIMRFCTIQQEyHERAgxEUJMhBATIcRECDERQkyEEBMhxEQIMRFCTIQQc8cMPMq9o3AsIoSYCCFmJ4R7g3e+/5iEEBMhxEQIMTvhj413APjNJISYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIzdfF+jzOZV4fduo8/pXhWSYhxEQIMRFCTIQQEyHERAgxEULsPeeE9+pzQ+eC7JhJCDERQkyEENtmJwT+ZBJCTISQmqYb05tLRBeJJLsAAAAASUVORK5CYII=",
                                fillColor: "yellow",
                                weight: 2,
                                opacity: 1,
                                color: 'white',
                                fillOpacity: 0.5
                            }
                        };
                    if (verticies != data_verticies) {
                        this.nonsimplifiedBasin = feature;
                        this.eventManager.RaiseEvent(WiM.Directives.onLayerAdded, this, new WiM.Directives.LegendLayerAddedEventArgs('nonsimplifiedbasin', "geojson", this.nonsimplifiedBasinStyle, false));
                    }
                }
                else if (LayerName == 'nonsimplifiedbasin') {
                    this.geojson[LayerName] = {
                        data: feature,
                        style: this.nonsimplifiedBasinStyle
                    };
                }
                else if (LayerName == 'globalwatershedpoint') {
                    var lat = this.studyArea.selectedStudyArea.Pourpoint.Latitude;
                    var lng = this.studyArea.selectedStudyArea.Pourpoint.Longitude;
                    var rcode = this.studyArea.selectedStudyArea.RegionID;
                    var workspaceID = this.studyArea.selectedStudyArea.WorkspaceID;
                    this.geojson[LayerName] = {
                        data: feature,
                        onEachFeature: function (feature, layer) {
                            var popupContent = '<strong>Latitude: </strong>' + lat + '</br><strong>Longitude: </strong>' + lng + '</br><strong>Region: </strong>' + rcode + '</br><strong>WorkspaceID: </strong>' + workspaceID + '</br>';
                            angular.forEach(feature.properties, function (value, key) {
                                popupContent += '<strong>' + key + ': </strong>' + value + '</br>';
                            });
                            layer.bindPopup(popupContent);
                        },
                        style: {
                            displayName: "Basin Clicked Point",
                            imagesrc: "data:image/png;base64,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",
                            visible: true
                        }
                    };
                }
                else if (LayerName == 'regulatedwatershed') {
                    this.geojson[LayerName] =
                        {
                            data: feature,
                            style: {
                                displayName: "Basin Boundary (Regulated Area)",
                                imagesrc: "data:image/png;base64,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",
                                fillColor: "red",
                                weight: 2,
                                opacity: 1,
                                color: 'white',
                                fillOpacity: 0.5
                            }
                        };
                }
                else if (LayerName.indexOf('netnavpoints') != -1) {
                    this.geojson[LayerName] = {
                        data: feature,
                        onEachFeature: function (feature, layer) {
                            var popupContent = '<strong>Network navigation start/end point</strong></br>';
                            angular.forEach(feature.properties, function (value, key) {
                                popupContent += '<strong>' + key + ': </strong>' + value + '</br>';
                            });
                            layer.bindPopup(popupContent);
                        },
                        pointToLayer: function (feature, latlng) {
                            var classname = "wmm-pin wmm-mutedblue wmm-icon-noicon wmm-icon-black wmm-size-25";
                            if (feature.properties.source == 'ss_gages')
                                classname = "wmm-pin wmm-blue wmm-icon-triangle wmm-icon-black wmm-size-25";
                            if (feature.properties.source == 'WQP')
                                classname = "wmm-pin wmm-sky wmm-icon-square wmm-icon-black wmm-size-25";
                            var myIcon = L.divIcon({
                                className: classname,
                            });
                            return L.marker(latlng, { icon: myIcon });
                        },
                        style: {
                            displayName: "Network navigation point",
                            imagesrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAlCAYAAAC+uuLPAAAACXBIWXMAAA7EAAAOxAGVKw4bAAA57GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzggNzkuMTU5ODI0LCAyMDE2LzA5LzE0LTAxOjA5OjAxICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoV2luZG93cyk8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHhtcDpDcmVhdGVEYXRlPjIwMTgtMDEtMzBUMTU6NTk6NDgtMDU6MDA8L3htcDpDcmVhdGVEYXRlPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxOC0wMS0zMVQxMTowMDoyMC0wNTowMDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6TWV0YWRhdGFEYXRlPjIwMTgtMDEtMzFUMTE6MDA6MjAtMDU6MDA8L3htcDpNZXRhZGF0YURhdGU+CiAgICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2UvcG5nPC9kYzpmb3JtYXQ+CiAgICAgICAgIDxwaG90b3Nob3A6Q29sb3JNb2RlPjM8L3Bob3Rvc2hvcDpDb2xvck1vZGU+CiAgICAgICAgIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6M2FkNDgxMTctYjA3Mi05NjQ4LTk5MmYtZmIyZTgzNTcwOTkxPC94bXBNTTpJbnN0YW5jZUlEPgogICAgICAgICA8eG1wTU06RG9jdW1lbnRJRD5hZG9iZTpkb2NpZDpwaG90b3Nob3A6ZDZiMzhiZmUtMDY5Zi0xMWU4LTk2OTAtOGIzNWZmM2I1YzJjPC94bXBNTTpEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06T3JpZ2luYWxEb2N1bWVudElEPnhtcC5kaWQ6NDQ0OTVjNjYtY2JjZS04ZDQyLWFhYmUtYjJmZTM4MjRmYWI3PC94bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpIaXN0b3J5PgogICAgICAgICAgICA8cmRmOlNlcT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+Y3JlYXRlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjQ0NDk1YzY2LWNiY2UtOGQ0Mi1hYWJlLWIyZmUzODI0ZmFiNzwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxOC0wMS0zMFQxNTo1OTo0OC0wNTowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+c2F2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDozYWQ0ODExNy1iMDcyLTk2NDgtOTkyZi1mYjJlODM1NzA5OTE8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTgtMDEtMzFUMTE6MDA6MjAtMDU6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE3IChXaW5kb3dzKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmNoYW5nZWQ+Lzwvc3RFdnQ6Y2hhbmdlZD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOlNlcT4KICAgICAgICAgPC94bXBNTTpIaXN0b3J5PgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpYUmVzb2x1dGlvbj45NjAwMDAvMTAwMDA8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOllSZXNvbHV0aW9uPjk2MDAwMC8xMDAwMDwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT42NTUzNTwvZXhpZjpDb2xvclNwYWNlPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+Mjk8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+Mzc8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/Pj4hpkQAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAA2xJREFUeNrs181rI3Ucx/H3b2YyD8mkMZslSZOsaVfsXpaFlYLg3jwvgl4XRVGPXZ8FRawXQQVXlD3pQegee+tfIQiFZV1auw9tau3zQ9KkM5OZyfw81JV1aZNMCiq43/Mwr9985/f9zG+ElJJ/uhT+hfr/oFq/F07PzMj7tWU2t7dwHBdVU0nbaYbzea6++YaIg4peG+n7qSk5e+sX6o0GrucRBAGdKEIIgaqq6IkESctiuJDnufFxXrp8WZwI/fSLL+XthQUOHIdei9M0jbSd4pnz5/lwYkIMhL4/OSkX7i/S9n2EomAPDZErFknZaSzbJooimvU6rUaDxu4OTrMJgGWajF+4wCfvvStioR9Mfibn7t0lCEIM06JYrVKqjmBYJqqqoagqSEkYhnQ6Ic5+k5XFe2yurBBFEaZh8OzFi3z8ztuiL/Tza9/In2Zn8YOAoewpqmPnyBUK6IYB4ujFR1FE23VYW66xfOcOvueRtCyev3SJiSM22d9G5sb0tPz55k38ICBp25RGRsmXy+imeSwIoCgKVsqmVB2lNDKKoig4rsut+fnec3p7fh7X89ASCU4XhymcqaBqfU8VhmWRL5XJ5vMArK6v89X167IrenepBoCdyZCvVDAMM9bQCyEYymYpVs6gmyZBGLK6vtH9SVsHBwAk7TSZ3OmuLT221apKKpPBzmQAqO83uqNSSrREAjOZRFXVgWMukdAxTAsAx3F7Z6+iqmha4kTZqmoaCV0HIOiEvVEpJVEUnTDS5V8JpiB6o6Hv0/bcE5GBH+D/eQ/d0LujQgiklATtNr7nDYy2PZeDZutwElKp7uhw4XC+9vf22FpbHQj0220aOzs4rcMszj2R7Y6OnX0KANc5YGPlNxq7O/HeZBSxt7XJ+nKNqNNhKG3z9NnR7uhHb10VpWIRGUXUt3dYq9VitblZr7O6tITTOmxttVLh9StXRF9fmRdffU06rotumpRHRqmOnTvM3y61v7fL4twc2+trdMKQJ8tlfrj2dX9fmQf1wsuvyLbv9wU/CpYKBX787lsR+2A2c2NKGLqO73n8vrRIbeHXI1sdF+x5GuwFDwL2dTA7rtWe6wwE9o0+CmdO5QDY3dyIDcZCH4YVVUUAnU4nNhgbfRgGBgIHQh/AuWx2IHBg9PFf22P0P4H+MQCyncndp+2ZGQAAAABJRU5ErkJggg==",
                            visible: true
                        }
                    };
                }
                else if (LayerName == 'netnavroute') {
                    this.geojson[LayerName] =
                        {
                            data: feature,
                            visible: true,
                            style: {
                                displayName: "Network navigation route",
                                imagesrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA2CAYAAACMRWrdAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAVaSURBVGhDzZr5VxpXFMf7n7ZpkqZLmqbRaIxaEzWyzIjghhtuQBQNuKMii0vSnqZb2qZNm66iwfavuL33jVbEOzBvmBn44XOOHD3P+TD3vXu/MG95MsdQL3h38rDgjsLu9fvw9O07hll6MAb9Sz9eWKuuxGaCSch8+IC9eD1Stx7B4OK3l9aqGzHf+q+w2jYM++82sQIcB+80QNSfAF/yt0vr1Y1Y1B+H7I12vOCGSwJ6rLX0w+CT78CbPrq0Xl2IBR9/CVt3vHgHGlkBjtyNNpiYzIGS+ptds+ZivZt/QOLhBOxdvccK6DGvzEEfli+3JlFzsdmhtdMDw3gJbjaqMBz7Ckswz65J1FSM9keyySdVgntXm2FqdBvUrb/YNc+omZiSOoTFnlnYvdbCCugR75qEwPJP7JrF1EwsFMrCzsfdcCBRgvT3I5HPRSPn1iymJmL+lZ9h7f4A7F+5ywpwHFxphPDAqjhsuDVLcVyMes68GoPce62sgB4r2LwH4t+Dh+lZHI6LjYafwfZtt9SBkX2/Hcan98S+5NbkcFSsN/k7LHeM4tjUzAroMYd32Lf+ml1TD0fFwgMrkP3gM7xY4wfGRlMfDC18w45N5XBMbCj2NSSxscqU4O71FpicSIOyXb5ncTgiRhcW756CvWtyY9OiKwz+1VfsmpVwRGxqLAXpm514scZLkA4YGo6N9CwO28UCyy9h/V5AqmfR384Mb+DYZKxncdgqRhs+5n0Mu5I9a6njNOpLHhjF2Co2PrMPqU96RNLlBDjSHz2EsdmnWILGexaHbWIU9VfarYv6stgmJqI+TgxWRX1ZbBELzmHUb5CL+rQPaeLXi/qyWC6mbv0JiU75qB/zRKFv7Rd2TTNYLkafDdIBIBX1GxQYnn9eNurLYqnYQPwFbDT3YXYy3rMo6k+Pbok7za1pFsvEzEb9RGfIUNSXxTKx0CRG/VtyUZ/GrNHIs6p7FoclYv61Vxj1B6WjfqR/WWQ0bs1qsURsrndBfDLLCeix2jYkFfVlqVqMPjXa+tT+qC9LVWJORn1ZqhIzF/V9pqK+LKbF6OJMRf3xHVBNRH1ZTInRPPeke9rRqC+LKTF613duduHFGi/B7duuqqJ+Ke5TPJk3oGQ1vIg7ewyuzJG8mIj6GC9MRX2DH09XgoRcaeINvi6AmjsReHMFcKFYdzYvJ2Y26tPJWW3UL0aICXixLlmxMYz626ai/gEoFo9NWimSGJVhAcuwIH4m4UcypejbeI1RP1izqM+jiXlwbwkpUZ7H0IO/MywWCSzhxCDXs9ZbAjC4aE3UL8WLJSfAn8/3nAbdSUNiwbnnIgzWMuqXoqCUKsSOUCYPPfjmCSk8ULzpQmUxLeqHah71S1FQSM0eoVge99WZGJYkSqnpfyqLTY9sSkd9embD6qhfiiaWPxfD19rdOoHe9L/lxfoTP2DU98tHfXwzrI76FzlCsTyoyLkY7S08HfFulRWjSLHgjkg/iaZF/ZfsmtahiSkZaiGHQoz6F/U0pZIYPc5DT5ZJ9SyK+mF7ov5FcG9hmStp/D+Im8qQxLCXKRkS09ljFPVXWynqy/Qse6P+RbB9oJjYw8iZGDVpJYtTCO4zVsxU1G+lqP/CsrGpIvh/NDGUotdiCCYxumtMHxuJfoFR3yPVsyjqT0zt2tazWETPopNQa8hi+vifksmDHg6hx1DpZOME9HAi6hejzYnnU8bZaEXl6Mbe5i4dgrUn0TrwYo0fGMm7veKLc7ujfjFnA7AGDb/aACxkUcyVKxITUR8vUqYEaRqh75ediPrFaGIF5ARfY1zBacOLzVmI4UHSkzuE/wDtg18mgH26LgAAAABJRU5ErkJggg==",
                                color: 'red'
                            }
                        };
                }
                else if (LayerName == 'adds') {
                    if (this.geojson.hasOwnProperty(LayerName)) {
                        this.geojson[LayerName].data.features.push(feature);
                    }
                    else {
                        this.geojson[LayerName] =
                            {
                                data: {
                                    "type": "FeatureCollection",
                                    "features": [feature]
                                },
                                visible: true,
                                style: {
                                    displayName: LayerName,
                                    fillColor: "green",
                                    color: 'green'
                                }
                            };
                    }
                }
                else if (LayerName == 'removes') {
                    if (this.geojson.hasOwnProperty(LayerName)) {
                        this.geojson[LayerName].data.features.push(feature);
                    }
                    else {
                        this.geojson[LayerName] =
                            {
                                data: {
                                    "type": "FeatureCollection",
                                    "features": [feature]
                                },
                                visible: true,
                                style: {
                                    displayName: LayerName,
                                    fillColor: "red",
                                    color: 'red'
                                }
                            };
                    }
                }
                else if (LayerName == 'streamgages') {
                    var self = this;
                    this.geojson['streamgages'] = {
                        name: 'Streamgages',
                        type: 'geoJSONShape',
                        data: feature,
                        visible: true,
                        style: {
                            displayName: 'Streamgages'
                        },
                        onEachFeature: function (feature, layer) {
                            var siteNo = feature.properties['Code'];
                            var SSgagepage = 'https://streamstatsags.cr.usgs.gov/gagepages/html/' + siteNo + '.htm';
                            var NWISpage = 'http://nwis.waterdata.usgs.gov/nwis/inventory/?site_no=' + siteNo;
                            var gageButtonDiv = L.DomUtil.create('div', 'innerDiv');
                            gageButtonDiv.innerHTML = '<strong>Station ID: </strong>' + siteNo + '</br><strong>Station Name: </strong>' + feature.properties['Name'] + '</br><strong>Latitude: </strong>' + feature.geometry.coordinates[1] + '</br><strong>Longitude: </strong>' + feature.geometry.coordinates[0] + '</br><strong>Station Type</strong>: ' + feature.properties.StationType.name +
                                '</br><strong>NWIS page: </strong><a href="' + NWISpage + ' "target="_blank">link</a></br><strong>StreamStats Gage page: </strong><a href="' + SSgagepage + '" target="_blank">link</a></br><strong>New StreamStats Gage Modal: </strong><a id="gagePageLink" class="' + siteNo + '">link</a><br>';
                            layer.bindPopup(gageButtonDiv);
                            var styling = configuration.streamgageSymbology.filter(function (item) {
                                return item.label.toLowerCase() == feature.properties.StationType.name.toLowerCase();
                            })[0];
                            if (styling == undefined) {
                                styling = configuration.streamgageSymbology.filter(function (item) {
                                    return item.label == 'Unknown';
                                })[0];
                            }
                            var icon = L.icon({
                                iconUrl: 'data:image/png;base64,' + styling.imageData,
                                iconSize: [15, 16],
                                iconAnchor: [7.5, 8],
                                popupAnchor: [0, -11],
                            });
                            layer.setIcon(icon);
                            L.DomEvent.on(gageButtonDiv, 'click', function (event) {
                                var id = event.target['id'];
                                if (id === 'gagePageLink') {
                                    self.openGagePage(siteNo);
                                }
                            });
                            layer.on('mouseover', function (e) {
                                if (self.studyArea.doSelectMapGage)
                                    this.openPopup();
                            });
                            layer.on('click', function (e) {
                                if (self.studyArea.doSelectMapGage) {
                                    self.studyArea.selectGage(feature);
                                    self.studyArea.doSelectMapGage = false;
                                }
                                else
                                    this.openPopup();
                            });
                        }
                    };
                    this.eventManager.RaiseEvent(WiM.Directives.onLayerAdded, this, new WiM.Directives.LegendLayerAddedEventArgs('streamgages', 'geojson', this.geojson['streamgages'].style));
                    this.updateLegend();
                }
                else if (LayerName == "MeanAugustBaseflow") {
                    this.leafletData.getLayers("mainMap").then(function (maplayers) {
                        if (_this.center.zoom == 9 || _this.center.zoom == 9 || _this.center.zoom == 11) {
                            _this.layers.overlays['MeanAugustBaseflow_region'].layerArray[0].legend[0].label = "0.60 - 1.34 cfs/mi^2";
                            _this.layers.overlays['MeanAugustBaseflow_region'].layerArray[0].legend[1].label = "0.45 - 0.60 cfs/mi^2";
                            _this.layers.overlays['MeanAugustBaseflow_region'].layerArray[0].legend[2].label = "0.30 - 0.45 cfs/mi^2";
                            _this.layers.overlays['MeanAugustBaseflow_region'].layerArray[0].legend[3].label = "0.09 - 0.30 cfs/mi^2";
                        }
                        else if (_this.center.zoom == 12 || _this.center.zoom == 13 || _this.center.zoom == 14) {
                            _this.layers.overlays['MeanAugustBaseflow_region'].layerArray[0].legend[0].label = "0.50 - 1.34 cfs/mi^2";
                            _this.layers.overlays['MeanAugustBaseflow_region'].layerArray[0].legend[1].label = "0.40 - 0.50 cfs/mi^2";
                            _this.layers.overlays['MeanAugustBaseflow_region'].layerArray[0].legend[2].label = "0.20 - 0.44 cfs/mi^2";
                            _this.layers.overlays['MeanAugustBaseflow_region'].layerArray[0].legend[3].label = "0.09 - 0.20 cfs/mi^2";
                        }
                        else if (_this.center.zoom == 15 || _this.center.zoom == 16) {
                            _this.layers.overlays['MeanAugustBaseflow_region'].layerArray[0].legend[0].label = "0.35 - 1.34 cfs/mi^2";
                            _this.layers.overlays['MeanAugustBaseflow_region'].layerArray[0].legend[1].label = "0.25 - 0.35 cfs/mi^2";
                            _this.layers.overlays['MeanAugustBaseflow_region'].layerArray[0].legend[2].label = "0.15 - 0.25 cfs/mi^2";
                            _this.layers.overlays['MeanAugustBaseflow_region'].layerArray[0].legend[3].label = "0.09 - 0.15 cfs/mi^2";
                        }
                    });
                }
                else {
                    this.geojson[LayerName] =
                        {
                            data: feature,
                            visible: true,
                            style: {
                                displayName: LayerName,
                                fillColor: "blue",
                                color: 'blue'
                            }
                        };
                }
            };
            MapController.prototype.onLayerChanged = function (sender, e) {
                var _this = this;
                if (e.PropertyName === "visible") {
                    if (!e.Value) {
                        delete this.geojson[e.LayerName];
                        if (e.LayerName === "streamgages") {
                            this.studyArea.streamgagesVisible = false;
                        }
                    }
                    else {
                        var value = null;
                        if (this.studyArea.selectedStudyArea && this.studyArea.selectedStudyArea.FeatureCollection.features.length > 0) {
                            this.studyArea.selectedStudyArea.FeatureCollection['features'].forEach(function (layer) {
                                if (layer.id == e.LayerName) {
                                    var item = angular.fromJson(angular.toJson(layer));
                                    var name = item.id;
                                    _this.addGeoJSON(name, item);
                                }
                            });
                        }
                        if (e.LayerName == 'nonsimplifiedbasin') {
                            this.addGeoJSON('nonsimplifiedbasin', this.nonsimplifiedBasin);
                        }
                        if (this.explorationService.networkNavResults) {
                            for (var i = 0; i < this.explorationService.networkNavResults.length; i++) {
                                var item = angular.fromJson(angular.toJson(this.explorationService.networkNavResults[i]));
                                if (item.name == e.LayerName)
                                    this.addGeoJSON(e.LayerName, item.feature);
                            }
                        }
                        if (e.LayerName == 'streamgages' && this.center.zoom >= 8) {
                            this.studyArea.getStreamgages(this.bounds.southWest.lng, this.bounds.northEast.lng, this.bounds.southWest.lat, this.bounds.northEast.lat);
                        }
                        else if (e.LayerName == 'streamgages' && this.center.zoom < 8) {
                            this.studyArea.streamgagesVisible = true;
                        }
                    }
                }
            };
            MapController.prototype.mapBoundsChange = function (oldValue, newValue) {
                this.nomnimalZoomLevel = this.scaleLookup(this.center.zoom);
                if (this.center.zoom >= 8 && oldValue !== newValue) {
                    this.regionServices.loadRegionListByExtent(this.bounds.northEast.lng, this.bounds.southWest.lng, this.bounds.southWest.lat, this.bounds.northEast.lat);
                    if (!this.regionServices.selectedRegion) {
                        this.toaster.pop("info", "Information", "User input is needed to continue", 5000);
                    }
                    if (this.studyArea.streamgagesVisible) {
                        this.studyArea.getStreamgages(this.bounds.southWest.lng, this.bounds.northEast.lng, this.bounds.southWest.lat, this.bounds.northEast.lat);
                    }
                }
                if (this.center.zoom < 8 && oldValue !== newValue) {
                    this.regionServices.regionList = [];
                    this.removeGeoJsonLayers('streamgages');
                }
                if (this.center.zoom >= 15) {
                    if (!this.imageryToggled && this.regionServices.selectedRegion && this.regionServices.selectedRegion.Applications.some(function (a) { return ['StormDrain', 'Localres'].indexOf(a) > -1; }))
                        this.toggleImageryLayer();
                    this.studyArea.zoomLevel15 = true;
                }
                else {
                    this.studyArea.zoomLevel15 = false;
                }
            };
            MapController.prototype.updateLegend = function () {
                var _this = this;
                if (!this.gageLegendFix) {
                    setTimeout(function () {
                        var legendItems = document.getElementsByClassName('wimLegend-application-group');
                        for (var item in legendItems) {
                            if (legendItems[item]['innerHTML'] && legendItems[item]['innerHTML'].indexOf('Application Layers') > -1) {
                                var children = legendItems[item]['children'][1]['children'];
                                for (var child in children) {
                                    if (children[child]['innerHTML'] && children[child]['innerHTML'].indexOf('Streamgages') > -1 && !_this.gageLegendFix) {
                                        var layer = children[child]['children'][0];
                                        var node = document.createElement('div');
                                        node.innerHTML = '<div class="legendGroup"><!----><div ng-repeat="lyr in layer.layerArray "><!----><div ng-repeat="leg in lyr.legend "><img class="legendSwatch" alt="Embedded Image" ng-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAaJJREFUOI3dzz1IW1EYxvF/TMqpFQsJCF4QOuhUpTpEVCw6RSsdQhFB6hfiF0IDFqkoOCqKEhxEqm0H20YUgpQoqOBWOkgjpQgXowREEC5SuVBE6QtFHXQwYjSJmXzgDO85hx/PayPJsd0TcD6sqM6ZBFqAk7uD4dCyqu3dkLnhRmD6bqB/ q5DwZrl4hv6rb2MWEfEDR4mD + q9ZSl + mAC75 + HOGxvwuYDAx8MNaK / +Os3mUfj5nP + tSSlsUMbKAvfhA / dSKb3qEqvrLtwUS0CeVW + sWkbfxgcsr4zx12rFe + ZJu75PMPK / jcKfQNM1gbKBPz2Az2EzJi + ten / B1LdUse9AGxAhu//ZTXPkwanurrRd3RyeBqRrAfzM48b2IvwfPcWRG9QC76nnvlMDUY2ABkOjgbshHxWvrTRqAYPGo/s9uGWh6A3ivBR3epTZTpeWQmnabB6CkqqFOjbbvi0gG8CcSXF1NMZdCw7zqjAW7iKWOT+sVqtX5TkR6IkGXqx4IMub5EYeIQAlQrmlarmEY+uWVv1ycRDJgGAaRDZOUpINnJ5KDtx5X6hkAAAAASUVORK5CYII=" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAaJJREFUOI3dzz1IW1EYxvF/TMqpFQsJCF4QOuhUpTpEVCw6RSsdQhFB6hfiF0IDFqkoOCqKEhxEqm0H20YUgpQoqOBWOkgjpQgXowREEC5SuVBE6QtFHXQwYjSJmXzgDO85hx/PayPJsd0TcD6sqM6ZBFqAk7uD4dCyqu3dkLnhRmD6bqB/ q5DwZrl4hv6rb2MWEfEDR4mD + q9ZSl + mAC75 + HOGxvwuYDAx8MNaK / +Os3mUfj5nP + tSSlsUMbKAvfhA / dSKb3qEqvrLtwUS0CeVW + sWkbfxgcsr4zx12rFe + ZJu75PMPK / jcKfQNM1gbKBPz2Az2EzJi + ten / B1LdUse9AGxAhu//ZTXPkwanurrRd3RyeBqRrAfzM48b2IvwfPcWRG9QC76nnvlMDUY2ABkOjgbshHxWvrTRqAYPGo/s9uGWh6A3ivBR3epTZTpeWQmnabB6CkqqFOjbbvi0gG8CcSXF1NMZdCw7zqjAW7iKWOT+sVqtX5TkR6IkGXqx4IMub5EYeIQAlQrmlarmEY+uWVv1ycRDJgGAaRDZOUpINnJ5KDtx5X6hkAAAAASUVORK5CYII="><i>Gaging Station, Continuous Record</i></div><!----><div ng-repeat="leg in lyr.legend "><img class="legendSwatch" alt="Embedded Image" ng-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAZxJREFUOI1jYaAyYBk2BjIZGAgtunDhXRwDA8M/ig10cBDKrqiwt5848WDq9u3vZlJqoIC/v3a0u7uyzLVrbxK2bz+ 8hIGB4SvZBoaGyjcnJenpMTAwMCQm6ukdPHineuPG51XkGqgVEqJjzcfHycnAwMAgIMDJFRys57px4/NpDAwMT0g2MDZWvjUoSM0AWSwsTMNgx467zcuW3Ukk1UD/nBxrdRYWZkZkQXZ2VpaEBH39HTvemb579+ 40sQay5+cbFJiZSWlik3R2ljcMDBStnjv3XQBRBqqosBeVlJgp43I6ExMTQ36 + mercuTdDGRgYVhMyUDItzdhLRoZPFpeBDAwMDLq64lolJQYpPT0XNjEwMPzEaaCDg3xzZqaRHj7DYKCoyFJ19erreQ8f / uzGaqCQkJBZRoaOJg8PBx8xBkpKcitmZpq5VFQcXsDAwPAa3UBGW1v2upAQdTNiDIOB7Gx9 / dWrr1adPfuuEN3AWAMDKbODBx + SWgKJ6 + gIhT57xj7n + fPnV5E1L2psPLuIgeEsieahgsFfwAIAW21yjgzG0zwAAAAASUVORK5CYII=" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAZxJREFUOI1jYaAyYBk2BjIZGAgtunDhXRwDA8M/ig10cBDKrqiwt5848WDq9u3vZlJqoIC/v3a0u7uyzLVrbxK2bz+ 8hIGB4SvZBoaGyjcnJenpMTAwMCQm6ukdPHineuPG51XkGqgVEqJjzcfHycnAwMAgIMDJFRys57px4/NpDAwMT0g2MDZWvjUoSM0AWSwsTMNgx467zcuW3Ukk1UD/nBxrdRYWZkZkQXZ2VpaEBH39HTvemb579+ 40sQay5+cbFJiZSWlik3R2ljcMDBStnjv3XQBRBqqosBeVlJgp43I6ExMTQ36 + mercuTdDGRgYVhMyUDItzdhLRoZPFpeBDAwMDLq64lolJQYpPT0XNjEwMPzEaaCDg3xzZqaRHj7DYKCoyFJ19erreQ8f / uzGaqCQkJBZRoaOJg8PBx8xBkpKcitmZpq5VFQcXsDAwPAa3UBGW1v2upAQdTNiDIOB7Gx9 / dWrr1adPfuuEN3AWAMDKbODBx + SWgKJ6 + gIhT57xj7n + fPnV5E1L2psPLuIgeEsieahgsFfwAIAW21yjgzG0zwAAAAASUVORK5CYII="><i>Low Flow, Partial Record</i></div><!----><div ng-repeat="leg in lyr.legend "><img class="legendSwatch" alt="Embedded Image" ng-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAV5JREFUOI3d1DFIlGEYwPGfcvBRhMi3xIENURJKndfQLSEJFUGLpp6LGBoViZEpDqIQxNFUS0sQJMQhLTfZoqtzBC25B9I3BO/W8C7RJB2HV3d6U// xeXl + PNOb0 + Fy / w3YXaT6hbv4dWxwhIVVrr3mwTZvjwv2jibJ9K0Y + /aY3WYTP48Mlqnci7EAcxR2Wd9i7ajg4CRXezgBvZycSJKbWzG+wX7b4AwvxinWz6ZiLO5Q+cBcu+DoYy7k6KofJuRmGdpJ0yshhE+tgskiT0sMHPZ4nct3QljfYKwl8DzLK5xrdno3FunfoIzav8D8Q273caYZCJcYXOH+Kz4iNgVHqMxT+Bt20DL9NZ584+WhYJqmpUchDJyipxUwz9l5bqzyHj8awa7hEJ5NUmoFO2iBoVqSrH2OcakRnClS2m3/Bzp9Mcby93z + XZZlX + uXq8 + pton9Kcs0XtiROg7 + BnYMUkljozdEAAAAAElFTkSuQmCC" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAV5JREFUOI3d1DFIlGEYwPGfcvBRhMi3xIENURJKndfQLSEJFUGLpp6LGBoViZEpDqIQxNFUS0sQJMQhLTfZoqtzBC25B9I3BO/W8C7RJB2HV3d6U// xeXl + PNOb0 + Fy / w3YXaT6hbv4dWxwhIVVrr3mwTZvjwv2jibJ9K0Y + /aY3WYTP48Mlqnci7EAcxR2Wd9i7ajg4CRXezgBvZycSJKbWzG+wX7b4AwvxinWz6ZiLO5Q+cBcu+DoYy7k6KofJuRmGdpJ0yshhE+tgskiT0sMHPZ4nct3QljfYKwl8DzLK5xrdno3FunfoIzav8D8Q273caYZCJcYXOH+Kz4iNgVHqMxT+Bt20DL9NZ584+WhYJqmpUchDJyipxUwz9l5bqzyHj8awa7hEJ5NUmoFO2iBoVqSrH2OcakRnClS2m3/Bzp9Mcby93z + XZZlX + uXq8 + pton9Kcs0XtiROg7 + BnYMUkljozdEAAAAAElFTkSuQmCC"><i>Peak Flow, Partial Record</i></div><!----><div ng-repeat="leg in lyr.legend "><img class="legendSwatch" alt="Embedded Image" ng-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAYlJREFUOI3d1E0og3EcwPHv1lMPEnouWmHJJOLZJCuWzFtjDsPMRYQQkbd20FZKy4mLi1KU5uWygyhxcODARWolcl3kOajn5vA4yInWMjZ28j3+/v0+/U5 / gRQn / BtQbzEQDCv0A29 / Bu1GJuZ7qV / dZeQ4wvpfwRyXXex1mLW8uwcGjrfZAV5 + DXqqCAw1aDLAYCPy + Q3 + gzC + 34Jl3TZsWemkA+RkkOGuFVsOwtoa8Jg02FfHUlcNluhZj02znIQJ7F0ymCzommylRNCjix6KAsKAHfPJvVStqupVoqA47WDGaqL0q8cmmcpOWfVvntGREGgSmfN2UBTvdL0Opp0Ub57hAUI / gYZRN848ifx4IECFkTJvO8MrRxwCWlzQbiIw7kD + DvtozkVx6JSpiMbyl6AkSdYxp1qamUZWIqAhm8JxN83ze2wBz7Ggrq5AXeiuwZoI9tFEG + bQhei7jmizsWCfpRDr + W3SP1BueYHmeXo1bCiKchu9HFzcJ8h + ktxnCrEXpqSUg + 93zWK9ULsBDQAAAABJRU5ErkJggg==" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAYlJREFUOI3d1E0og3EcwPHv1lMPEnouWmHJJOLZJCuWzFtjDsPMRYQQkbd20FZKy4mLi1KU5uWygyhxcODARWolcl3kOajn5vA4yInWMjZ28j3+/v0+/U5 / gRQn / BtQbzEQDCv0A29 / Bu1GJuZ7qV / dZeQ4wvpfwRyXXex1mLW8uwcGjrfZAV5 + DXqqCAw1aDLAYCPy + Q3 + gzC + 34Jl3TZsWemkA+RkkOGuFVsOwtoa8Jg02FfHUlcNluhZj02znIQJ7F0ymCzommylRNCjix6KAsKAHfPJvVStqupVoqA47WDGaqL0q8cmmcpOWfVvntGREGgSmfN2UBTvdL0Opp0Ub57hAUI / gYZRN848ifx4IECFkTJvO8MrRxwCWlzQbiIw7kD + DvtozkVx6JSpiMbyl6AkSdYxp1qamUZWIqAhm8JxN83ze2wBz7Ggrq5AXeiuwZoI9tFEG + bQhei7jmizsWCfpRDr + W3SP1BueYHmeXo1bCiKchu9HFzcJ8h + ktxnCrEXpqSUg + 93zWK9ULsBDQAAAABJRU5ErkJggg=="><i>Peak and Low Flow, Partial Record</i></div><!----><div ng-repeat="leg in lyr.legend "><img class="legendSwatch" alt="Embedded Image" ng-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAXZJREFUOI3d1E8ow2EYwPHvmF5j/vRLbT/ZlmxpykayjJjkT0iUXIgoTko4buWynNyVctDIxUEpNwcXLi4rrRxclHqVvBc5vA5yoVjGxk6+ x + ft + fScXit5zvpvwAJMEkhmgJc / g4aHxbJJIo / 7LKgbtv4KVoouMeUM6prnW2bZZQ94+j3YQtzRowMARoSAuiSmk0R / CzaYYTqEDRuA3U6Jq130XSf1JnCbMyg6WXeHafo4qwjrJiNJXJ0zlys46h2gnkIsnxaKsJZ1E + TKaFVKXWQLCjHAst2L / 6tHZyPNdwEV45Sx7EDBqn+Uuoy3W8A7iC91ygRw8BNoesYZEgaujCBg99BgDjMvjzkCdGbQS7yqn8B32HuOEXzyhCU0G1 + ChmGExJDyW4spzwYUldSa4 / TKfXaA + 3TQ8uRWa742Qtlg71X3E1RnIqpv9Eo6OF1aS+ghlfMP5NBuPWE + m9tSytTH5YQ6JKEOc + TekkjSL8xLeQdfAVOiXI3dacB + AAAAAElFTkSuQmCC" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAXZJREFUOI3d1E8ow2EYwPHvmF5j/vRLbT/ZlmxpykayjJjkT0iUXIgoTko4buWynNyVctDIxUEpNwcXLi4rrRxclHqVvBc5vA5yoVjGxk6+ x + ft + fScXit5zvpvwAJMEkhmgJc / g4aHxbJJIo / 7LKgbtv4KVoouMeUM6prnW2bZZQ94+j3YQtzRowMARoSAuiSmk0R / CzaYYTqEDRuA3U6Jq130XSf1JnCbMyg6WXeHafo4qwjrJiNJXJ0zlys46h2gnkIsnxaKsJZ1E + TKaFVKXWQLCjHAst2L / 6tHZyPNdwEV45Sx7EDBqn+Uuoy3W8A7iC91ygRw8BNoesYZEgaujCBg99BgDjMvjzkCdGbQS7yqn8B32HuOEXzyhCU0G1 + ChmGExJDyW4spzwYUldSa4 / TKfXaA + 3TQ8uRWa742Qtlg71X3E1RnIqpv9Eo6OF1aS+ghlfMP5NBuPWE + m9tSytTH5YQ6JKEOc + TekkjSL8xLeQdfAVOiXI3dacB + AAAAAElFTkSuQmCC"><i>Stage Only</i></div><!----><div ng-repeat="leg in lyr.legend "><img class="legendSwatch" alt="Embedded Image" ng-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAYVJREFUOI3d1E8og3Ecx/H3mB6Tfz0XTWwtln/t2YQnjz+ b / A2J0i5EFCclHCmX5eSulINGLg5KOXEQcdFqJeWAWqmnqN / N4ecgBxQyNhzkc / nW99v31ff0tfLLsf4bMEXFHhaYw8DDj0EV50Q3A4EDNsZjxJZ / CubWKP7BUuktuOF6JMbaOnD3bbCEqpAumzWAagLaJadzF0RnvwuWaxj16dhsABlkZniVurYLGV0CrpMGK2hc8GD4Xvc80vCdEw2dcTyaLNjbQEdJKqmW18000qzVNHlN9bxGCHGSKKhU0THloLjso6EbT6VLaHOC / b6EQAVlpoXeoninW7BQS6c7wn4Q2PwKtPvp78pBLYwHAuTjLK + je + yYnW1AxgWdFIcM2rXPsJcE6HFH2JuUyMUPQVVVdV10lSmkZycCZpLr8tPfusvGKnD7HrRkCce8h1o9EewlBu3eiHI0K2Rs + j045MClX3GW7AfKs0tHULHfr5im + WY5fMhW + JCtJL3nmE / l7z / YR0W7YFxuKhm3AAAAAElFTkSuQmCC" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAYVJREFUOI3d1E8og3Ecx/H3mB6Tfz0XTWwtln/t2YQnjz+ b / A2J0i5EFCclHCmX5eSulINGLg5KOXEQcdFqJeWAWqmnqN / N4ecgBxQyNhzkc / nW99v31ff0tfLLsf4bMEXFHhaYw8DDj0EV50Q3A4EDNsZjxJZ / CubWKP7BUuktuOF6JMbaOnD3bbCEqpAumzWAagLaJadzF0RnvwuWaxj16dhsABlkZniVurYLGV0CrpMGK2hc8GD4Xvc80vCdEw2dcTyaLNjbQEdJKqmW18000qzVNHlN9bxGCHGSKKhU0THloLjso6EbT6VLaHOC / b6EQAVlpoXeoninW7BQS6c7wn4Q2PwKtPvp78pBLYwHAuTjLK + je + yYnW1AxgWdFIcM2rXPsJcE6HFH2JuUyMUPQVVVdV10lSmkZycCZpLr8tPfusvGKnD7HrRkCce8h1o9EewlBu3eiHI0K2Rs + j045MClX3GW7AfKs0tHULHfr5im + WY5fMhW + JCtJL3nmE / l7z / YR0W7YFxuKhm3AAAAAElFTkSuQmCC"><i>Low Flow, Partial Record, Stage</i></div><!----><div ng-repeat="leg in lyr.legend ">' +
                                            '<img class="legendSwatch" alt="Embedded Image" ng-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAZtJREFUOI1jYaAyYBk2BjKpCBksuvPuQhwDA8M/ig00FnLIzrOvsJ9zcGLq4XfbZ1JqoICXtn+0vbK7zJ031xIOH96+hIGB4SvZBrrLhzaH6yXpMTAwMIToJeodvXOwet/zjVXkGqjlpxNizcPJx8nAwMDAzynA5aMX7Lrv+ cZpDAwMT0g20F8 + ttVdLcgAWcxHI8xg / 90dzZvvLEsk1UD/ROscdRZmFkZkQTZWdpZQ/QT9o+ 92mL579+40sQayJxjkFxhImWlik7SRdzZ0Ew2sXvFubgBRBkqyqxRlmJUo43I6ExMTQ4JZvuqKm3NDGRgYVhMyUDLBOM1Lgk9GFpeBDAwMDBriulopBiUpcy70bGJgYPiJ00BzeYfmGKNMPXyGwUCaZZHq4uur837+fNiN1UAhISGzWJ0MTW4OHj5iDBTjllQsMst0aT9csYCBgeE1uoGMBuy2dZ7qIWbEGAYDMfrZ + tuvrq668O5sIbqBsTpSBmYnHx4ktQQSVxbSCX3J / mzO8 + fPryJrXjTpbOOiSWdJNA4NDP4CFgA3c3Kc0o9KfgAAAABJRU5ErkJggg == " src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAZtJREFUOI1jYaAyYBk2BjKpCBksuvPuQhwDA8M/ig00FnLIzrOvsJ9zcGLq4XfbZ1JqoICXtn+0vbK7zJ031xIOH96+hIGB4SvZBrrLhzaH6yXpMTAwMIToJeodvXOwet/zjVXkGqjlpxNizcPJx8nAwMDAzynA5aMX7Lrv+ cZpDAwMT0g20F8 + ttVdLcgAWcxHI8xg / 90dzZvvLEsk1UD/ROscdRZmFkZkQTZWdpZQ/QT9o+ 92mL579+40sQayJxjkFxhImWlik7SRdzZ0Ew2sXvFubgBRBkqyqxRlmJUo43I6ExMTQ4JZvuqKm3NDGRgYVhMyUDLBOM1Lgk9GFpeBDAwMDBriulopBiUpcy70bGJgYPiJ00BzeYfmGKNMPXyGwUCaZZHq4uur837+fNiN1UAhISGzWJ0MTW4OHj5iDBTjllQsMst0aT9csYCBgeE1uoGMBuy2dZ7qIWbEGAYDMfrZ + tuvrq668O5sIbqBsTpSBmYnHx4ktQQSVxbSCX3J / mzO8 + fPryJrXjTpbOOiSWdJNA4NDP4CFgA3c3Kc0o9KfgAAAABJRU5ErkJggg == "><i>Miscellaneous Record</i></div><!----><div ng-repeat="leg in lyr.legend "><img class="legendSwatch" alt="Embedded Image" ng-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAARVJREFUOI3d1L8rhVEYB/APqROD9C66xSBJDH4MLAYLi4XFJKKYlDBSlpvJrpRBstn8G2b/gXoHdTbDs8jgKt38eF138q1T55yn59MznE6XNqfr34CduMYGXtoB7mIeO7j4K9iXUlqLiAFs4gbPfwHrETHR2E/ gGEetguOYQ3fj3JNSWoyIczy2Ap5i6uNFREyhjq3fgssYRccnPZNFUczknO + rggn7GPuiPp1zPsZKVfAQw1 / U3jOCVdz + BNawhMEfwHFs4w7xHVj39jyqZAR7OPsULIpiNuc8ht6K4BAWcIWnZrAj53yC2YrYeyZTSkcRcdAMrjew3 / 5A/RGxWqvVLsuyfPjYfN1YLaUsS80TtiVtB18BHWxAwwk6imsAAAAASUVORK5CYII=" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAARVJREFUOI3d1L8rhVEYB/APqROD9C66xSBJDH4MLAYLi4XFJKKYlDBSlpvJrpRBstn8G2b/gXoHdTbDs8jgKt38eF138q1T55yn59MznE6XNqfr34CduMYGXtoB7mIeO7j4K9iXUlqLiAFs4gbPfwHrETHR2E/ gGEetguOYQ3fj3JNSWoyIczy2Ap5i6uNFREyhjq3fgssYRccnPZNFUczknO + rggn7GPuiPp1zPsZKVfAQw1 / U3jOCVdz + BNawhMEfwHFs4w7xHVj39jyqZAR7OPsULIpiNuc8ht6K4BAWcIWnZrAj53yC2YrYeyZTSkcRcdAMrjew3 / 5A/RGxWqvVLsuyfPjYfN1YLaUsS80TtiVtB18BHWxAwwk6imsAAAAASUVORK5CYII="><i>Unknown</i></div><!----></div><!----></div>';
                                        layer.appendChild(node);
                                        _this.gageLegendFix = true;
                                    }
                                }
                            }
                        }
                    }, 500);
                }
            };
            MapController.prototype.updateRegion = function () {
                var key = (this.$locationService.search()).region;
                this.setBoundsByRegion(key);
            };
            MapController.prototype.setBoundsByRegion = function (key) {
                if (key && this.regionServices.loadRegionListByRegion(key)) {
                    this.regionServices.selectedRegion = this.regionServices.regionList[0];
                    this.bounds = this.leafletBoundsHelperService.createBoundsFromArray(this.regionServices.selectedRegion.Bounds);
                }
            };
            MapController.prototype.toggleImageryLayer = function () {
                var legendItems = document.getElementsByClassName('wimLegend-basemap-item');
                for (var item in legendItems) {
                    var children = legendItems[item].childNodes;
                    var radio;
                    for (var child in children) {
                        if (children[child]['className'] == 'rdo') {
                            radio = children[child];
                            for (var chd in radio.childNodes) {
                                if (radio.childNodes[chd]['innerHTML'] == 'Imagery')
                                    radio.click();
                            }
                        }
                    }
                }
                this.imageryToggled = true;
            };
            MapController.prototype.addRegionOverlayLayers = function (regionId) {
                var _this = this;
                if (this.regionServices.regionMapLayerList.length < 1)
                    return;
                var layerList = [];
                var roots = this.regionServices.regionMapLayerList.map(function (layer) {
                    layerList.push(layer[1]);
                });
                var visible = true;
                if (regionId == 'MRB')
                    visible = false;
                layerList.forEach(function (layer) {
                    _this.layers.overlays[regionId + "_region" + layer] =
                        {
                            name: String(layer),
                            group: regionId + " Map layers",
                            url: configuration.baseurls['StreamStatsMapServices'] + configuration.queryparams['SSStateLayers'],
                            type: 'agsDynamic',
                            visible: visible,
                            layerOptions: {
                                opacity: 1,
                                layers: [layer],
                                format: "png8",
                                f: "image"
                            },
                        };
                });
                this.leafletData.getLayers("mainMap").then(function (maplayers) {
                    layerList.forEach(function (layer) {
                        maplayers.overlays[regionId + "_region" + layer].bringToBack();
                    });
                    maplayers.overlays.SSLayer.bringToFront();
                });
                var layers = this.regionServices.selectedRegion.Layers;
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
            MapController.prototype.removeMarkerLayers = function (name, isPartial) {
                var _this = this;
                if (isPartial === void 0) { isPartial = false; }
                var layeridList;
                layeridList = this.getLayerIdsByID(name, this.markers, isPartial);
                layeridList.forEach(function (item) {
                    delete _this.markers[item];
                });
            };
            MapController.prototype.removeGeoJsonLayers = function (name, isPartial) {
                var _this = this;
                if (isPartial === void 0) { isPartial = false; }
                var layeridList;
                layeridList = this.getLayerIdsByID(name, this.geojson, isPartial);
                layeridList.forEach(function (item) {
                    delete _this.geojson[item];
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
            MapController.prototype.startDelineate = function (latlng, isInExclusionArea, excludeReason) {
                var studyArea = new StreamStats.Models.StudyArea(this.regionServices.selectedRegion.RegionID, new WiM.Models.Point(latlng.lat, latlng.lng, '4326'));
                this.studyArea.AddStudyArea(studyArea);
                this.studyArea.loadStudyBoundary();
                if (isInExclusionArea && excludeReason)
                    this.studyArea.selectedStudyArea.Disclaimers['isInExclusionArea'] = 'The delineation point is in an exclusion area. ' + excludeReason;
            };
            MapController.$inject = ['$scope', '$compile', 'toaster', '$analytics', '$location', '$stateParams', 'leafletBoundsHelpers', 'leafletData', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'StreamStats.Services.ExplorationService', 'StreamStats.Services.ProsperService', 'WiM.Event.EventManager', 'StreamStats.Services.ModalService', '$modalStack'];
            return MapController;
        }());
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.MapController', MapController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
