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
module StreamStats.Controllers {

    declare var greinerHormann;
    declare var ga;

    //'use strict';
    interface ILeafletData {
        getMap(): ng.IPromise<any>;
        getLayers(): ng.IPromise<any>;
    }
    interface ICenter {
        lat: number;
        lng: number;
        zoom: number;
    }
    interface IBounds {
        southWest: IMapPoint;
        northEast: IMapPoint;
    }
    interface IMapPoint {
        lat: number;
        lng: number;
    }
    interface IMapLayers {
        baselayers: Object;
        overlays: ILayer;
        markers: Object;
        geojson: Object;
    }
    interface ILayer {
        name: string;
        url: string;
        type: string;
        visible: boolean;
        layerOptions: Object;
    }
    interface IMapDefault {
        maxZoom: number;
        zoomControl: boolean;
        minZoom: number;
    }
    interface IMapController {
        center: ICenter;
        layers: IMapLayers;
        controls: Object;
        markers: Object;
        bounds: Object;
        geojson: Object;
        layercontrol: Object;

    }
    interface IMapControllerScope extends ng.IScope {
        vm: MapController;
    }

    class MapPoint implements IMapPoint {
        lat: number;
        lng: number;
        constructor() {
            this.lat = 0;
            this.lng = 0;
        }
    }
    class Center implements ICenter {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public lat: number;
        public lng: number;
        public zoom: number;
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor(lt: number, lg: number, zm: number) {
            this.lat = lt;
            this.lng = lg;
            this.zoom = zm;
        }
    }
    class Layer implements ILayer {
        public name: string;
        public url: string;
        public type: string;
        public visible: boolean;
        public layerOptions: Object;

        public constructor(nm: string, ul: string, ty: string, vis: boolean, op: Object = undefined) {
            this.name = nm;
            this.url = ul;
            this.type = ty;
            this.visible = vis;
            this.layerOptions = op;

        }
    }
    class MapDefault implements IMapDefault {
        public maxZoom: number;
        public zoomControl: boolean;
        public minZoom: number;

        constructor(mxZm: number = null, mnZm: number = null, zmCtrl: boolean = true) {
            this.maxZoom = mxZm;
            this.minZoom = mnZm;
            this.zoomControl = zmCtrl;
        }
    }

    class MapController implements IMapController {
        //Events
        //-+-+-+-+-+-+-+-+-+-+-+-
        private _onSelectedAreaOfInterestHandler: WiM.Event.EventHandler<WiM.Event.EventArgs>;
        private _onSelectedRegionHandler: WiM.Event.EventHandler<WiM.Event.EventArgs>;
        private _onSelectedStudyAreaHandler: WiM.Event.EventHandler<WiM.Event.EventArgs>;
        private _onEditClickHandler: WiM.Event.EventHandler<WiM.Event.EventArgs>;
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private regionServices: Services.IRegionService;
        private searchService: WiM.Services.ISearchAPIService;
        private leafletBoundsHelperService: any;
        private $locationService: ng.ILocationService;
        private leafletData: ILeafletData;
        private studyArea: Services.IStudyAreaService;
        private nssService: Services.InssService;
        private explorationService: Services.IExplorationService;

        public cursorStyle: string;
        public center: ICenter = null;
        public layers: IMapLayers = null;
        public mapDefaults: IMapDefault = null;
        public mapPoint: IMapPoint = null;
        public bounds: IBounds = null;

        public controls: any;
        public markers: Object = null;
        public geojson: Object = null;
        public events: Object = null;
        public layercontrol: Object = null;
        public regionLayer: Object = null;
        public drawControl: any;
        public toaster: any;
        public angulartics: any;
        public nomnimalZoomLevel: string;

        //Constructro
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', 'toaster', '$analytics', '$location', '$stateParams', 'leafletBoundsHelpers', 'leafletData', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'StreamStats.Services.ExplorationService'];
        constructor($scope: IMapControllerScope, toaster, $analytics, $location: ng.ILocationService, $stateParams, leafletBoundsHelper: any, leafletData: ILeafletData, search: WiM.Services.ISearchAPIService, region: Services.IRegionService, studyArea: Services.IStudyAreaService, StatisticsGroup: Services.InssService, exploration: Services.IExplorationService) {
            $scope.vm = this;
            this.init();

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

            //subscribe to Events
            search.onSelectedAreaOfInterestChanged.subscribe(this._onSelectedAreaOfInterestHandler);
            region.onSelectedRegionChanged.subscribe(this._onSelectedRegionHandler);
            studyArea.onSelectedStudyAreaChanged.subscribe(this._onSelectedStudyAreaHandler);
            studyArea.onEditClick.subscribe(this._onEditClickHandler);

            $scope.$on('leafletDirectiveMap.mousemove',(event, args) => {
                var latlng = args.leafletEvent.latlng;
                this.mapPoint.lat = latlng.lat;
                this.mapPoint.lng = latlng.lng;
            });

            $scope.$on('leafletDirectiveMap.drag',(event, args) => {
                this.cursorStyle = 'grabbing'
            });

            $scope.$on('leafletDirectiveMap.dragend',(event, args) => {
                this.cursorStyle = 'pointer'
            });

            $scope.$on('leafletDirectiveMap.click',(event, args) => {
                //listen for delineate click if ready
                if (studyArea.doDelineateFlag) this.checkDelineatePoint(args.leafletEvent.latlng);

                //otherwise query map layers
                else if (!region.selectedRegion && !this.explorationService.drawElevationProfile && !this.explorationService.drawMeasurement) this.queryNationalMapLayers(args.leafletEvent)
                else if (region.selectedRegion && this.regionServices.allowStreamgageQuery && !this.explorationService.drawElevationProfile && !this.explorationService.drawMeasurement) this.queryStreamgages(args.leafletEvent);
            });

            $scope.$watch(() => this.bounds,(newval, oldval) => this.mapBoundsChange(oldval, newval));

            $scope.$watch(() => this.explorationService.elevationProfileGeoJSON,(newval, oldval) => this.displayElevationProfile());

            $scope.$watch(() => this.explorationService.drawElevationProfile,(newval, oldval) => {
                if (newval) this.elevationProfile();
            });

            $scope.$watch(() => this.explorationService.drawMeasurement,(newval, oldval) => {
                if (newval) this.measurement();
            });

            $scope.$watch(() => this.regionServices.regionMapLayerListLoaded,(newval, oldval) => {
                if (newval) {
                    //console.log(newval);
                    this.addRegionOverlayLayers(this.regionServices.selectedRegion.RegionID);
                }
            });

            $scope.$on('$locationChangeStart',() => this.updateRegion());

            $scope.$watch(() => studyArea.doDelineateFlag,(newval, oldval) => newval ? this.cursorStyle = 'crosshair' : this.cursorStyle = 'pointer');

            // check if region was explicitly set.
            if ($stateParams.rcode) {
                this.regionServices.loadParametersByRegion();
                this.setBoundsByRegion($stateParams.rcode);
            }
            if ($stateParams.rcode && $stateParams.workspaceID) {
                this.regionServices.loadParametersByRegion();
                this.studyArea.loadWatershed($stateParams.rcode, $stateParams.workspaceID);
            }

            //watch for result of regressionregion query
            $scope.$watch(() => this.studyArea.regressionRegionQueryComplete,(newval, oldval) => {
                //console.log('in regression query watch', newval, oldval);
                //join codes from regression region object list and run query
                if (newval && this.studyArea.selectedStudyArea.RegressionRegions) this.nssService.loadStatisticsGroupTypes(this.regionServices.selectedRegion.RegionID, this.studyArea.selectedStudyArea.RegressionRegions.map(function (elem) {
                    return elem.code;
                }).join(","));
            });
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void { 
            //init event handler
            this._onSelectedAreaOfInterestHandler = new WiM.Event.EventHandler<WiM.Event.EventArgs>((sender: any, e: WiM.Services.SearchAPIEventArgs) => {
                this.onSelectedAreaOfInterestChanged(sender, e);
            });
            this._onSelectedRegionHandler = new WiM.Event.EventHandler<WiM.Event.EventArgs>(() => {
                this.onSelectedRegionChanged();
            });
            this._onSelectedStudyAreaHandler = new WiM.Event.EventHandler<WiM.Event.EventArgs>(() => {
                this.onSelectedStudyAreaChanged();
            });

            this._onEditClickHandler = new WiM.Event.EventHandler<WiM.Event.EventArgs>(() => {
                this.basinEditor();
            });

            //init map           
            this.center = new Center(39, -100, 3);
            //this.center = new Center(39, -106, 16);
            this.layers = {
                baselayers: configuration.basemaps,
                overlays: configuration.overlayedLayers,
                markers: this.markers,
                geojson: this.geojson
            }
            this.mapDefaults = new MapDefault(null, 3, false);
            this.markers = {};
            this.geojson = {};
            this.regionLayer = {};     
            //add custom controls
            //this.layercontrol = {
            //    icons: {
            //        uncheck: "fa fa-toggle-off",
            //        check: "fa fa-toggle-on"
            //    }
            //};

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
                custom:
                new Array(
                    //zoom home button control
                    (<any>L.Control).zoomHome({ homeCoordinates: [39, -100], homeZoom: 4 }),
                    //location control
                    (<any>L.control).locate({ follow: false }),
                    (<any>L.control).elevation({ imperial: true })
                    )
            };
            this.events = {
                map: {
                    enable: ['mousemove']
                }
            }
            this.mapPoint = new MapPoint();

            L.Icon.Default.imagePath = 'images';
        }

        public scaleLookup(mapZoom: number) {
            switch (mapZoom) {
                case 19: return '1,128'
                case 18: return '2,256'
                case 17: return '4,513'
                case 16: return '9,027'
                case 15: return '18,055'
                case 14: return '36,111'
                case 13: return '72,223'
                case 12: return '144,447'
                case 11: return '288,895'
                case 10: return '577,790'
                case 9: return '1,155,581'
                case 8: return '2,311,162'
                case 7: return '4,622,324'
                case 6: return '9,244,649'
                case 5: return '18,489,298'
                case 4: return '36,978,596'
                case 3: return '73,957,193'
                case 2: return '147,914,387'
                case 1: return '295,828,775'
                case 0: return '591,657,550'
            }
        }

        private queryNationalMapLayers(evt) {

            //console.log('in querystates');
            this.toaster.pop("info", "Information", "Querying National map layers...", 0);
            this.cursorStyle = 'wait'; 

            //ga event
            this.angulartics.eventTrack('initialOperation', { category: 'Map', label: 'Map click query' });
            
            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {

                    maplayers.overlays["SSLayer"].identify().on(map).at(evt.latlng).returnGeometry(false).run((error: any, results: any) => {
                        //console.log('national results', results, results.features.length);

                        if (results.features.length < 1) {
                            //console.log('here');
                            this.cursorStyle = 'pointer';
                            this.toaster.clear();
                            this.toaster.pop("warning", "Warning", "No State/Regional Study Found", 0);
                            map.panBy([0, 1]);
                            return;
                        }

                        var rcodeList = []

                        results.features.forEach((queryResult) => {

                            this.regionServices.nationalMapLayerList.forEach((item) => {
                                if (queryResult.layerId == item[1]) {
                                    //console.log('Map query found a match with: ', item[0], queryResult)

                                    if (((item[0] == 'State Applications') || (item[0] == 'Regional Studies')) && (map.getZoom() <= 7)) {

                                        if (item[0] == 'State Applications') rcodeList.push(queryResult.properties.ST_ABBR);
                                        if (item[0] == 'Regional Studies') rcodeList.push(queryResult.properties.st_abbr);
                                    }
                                }

                            });
                        });

                        //console.log('RCODELIST: ', rcodeList);
                        console.log('bounds', map.getBounds())

                        if (rcodeList.length < 1) return;

                        if (rcodeList.length == 1) {
                            this.regionServices.masterRegionList.forEach((item) => {
                                if (item.RegionID == rcodeList[0]) {
                                    this.setBoundsByRegion(rcodeList[0]);
                                    //console.log('right here', this.regionServices.selectedRegion);
                                    if (this.regionServices.selectedRegion) this.regionServices.loadParametersByRegion();
                                }
                            });
                        }

                        //if multiple results, zoom to level 9 where selection options appear in sidebar
                        if (rcodeList.length > 1) {
                            map.setView(evt.latlng, 9)
                        }

                        this.toaster.clear();
                        this.cursorStyle = 'pointer';
                    });
                });
            });
        }

        private queryStreamgages(evt) {

            //console.log('in query regional layers');
            this.toaster.pop("info", "Information", "Querying Streamgages...", 0);
            this.cursorStyle = 'wait';
            this.markers = {};

            //report ga event
            this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'queryStreamgages' });

            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {

                    //maplayers.overlays[this.regionServices.selectedRegion.RegionID + "_region"].identify().on(map).at(evt.latlng).returnGeometry(false).tolerance(5).run((error: any, results: any) => {
                    maplayers.overlays["SSLayer"].identify().on(map).at(evt.latlng).returnGeometry(false).tolerance(5).run((error: any, results: any) => {
                        if (!results.features) {
                            this.toaster.clear();
                            return;
                        }

                        results.features.forEach((queryResult) => {

                            this.regionServices.regionMapLayerList.forEach((item) => {
                                if (queryResult.layerId == item[1]) {
                                    //console.log('Map query found a match with: ', item[0], queryResult)

                                    if (item[0].toLowerCase() == "streamgages") {
                                        var popupContent = '';
                                        var popupKeyList = ['latitude', 'longitude', 'sta_id', 'sta_name', 'featureurl', 'drnarea'];

                                        angular.forEach(queryResult.properties, function (value, key) {
                                            if (popupKeyList.indexOf(key) != -1) {
                                                if (key == "featureurl") {

                                                    var siteNo = value.split('site_no=')[1];
                                                    var SSgagepage = 'http://streamstatsags.cr.usgs.gov/gagepages/html/' + siteNo + '.htm'

                                                    popupContent += '<strong>NWIS page: </strong><a href="' + value + ' "target="_blank">link</a></br><strong>StreamStats Gage page: </strong><a href="' + SSgagepage + '" target="_blank">link</a></br>';

                                                }
                                                else popupContent += '<strong>' + key + ': </strong>' + value + '</br>';
                                            }
                                        });

                                        this.markers['regionalQueryResult'] = {
                                            lat: evt.latlng.lat,
                                            lng: evt.latlng.lng,
                                            message: popupContent,
                                            focus: true,
                                            draggable: false
                                        };

                                        map.panBy([0, 1]);
                                        this.toaster.clear();
                                    }
                                }
                            });
                        });
                        this.cursorStyle = 'pointer';
                    });
                });
            });
        }

        private elevationProfile() {

            //get reference to elevation control
            var el = this.controls.custom[2];

            //report ga event
            this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'elevationProfile' });

            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {

                    //create draw control
                    var drawnItems = maplayers.overlays.draw;
                    drawnItems.clearLayers();


                    var drawControl = new (<any>L).Draw.Polyline(map, {
                        metric: false
                    });
                    drawControl.enable();
                    this.geojson = {};

                    map.on('draw:drawstart',(e) => {
                        //console.log('in draw start');
                        el.clear();
                    });

                    //listen for end of draw
                    map.on('draw:created',(e) => {

                        map.removeEventListener('draw:created');

                        var feature = e.layer.toGeoJSON();
			
                        //convert to esriJSON
                        var esriJSON = '{"geometryType":"esriGeometryPolyline","spatialReference":{"wkid":"4326"},"fields": [],"features":[{"geometry": {"type":"polyline", "paths":[' + JSON.stringify(feature.geometry.coordinates) + ']}}]}'

                        //make the request
                        this.cursorStyle = 'wait'
                        this.toaster.pop("info", "Information", "Querying the elevation service...", 0);
                        this.explorationService.elevationProfile(esriJSON)

                        //disable button 
                        this.explorationService.drawElevationProfile = false;
                    });
                });
            });
        }

        private displayElevationProfile() {
            var el = this.controls.custom[2];

            //parse it
            this.geojson["elevationProfileLine3D"] = {
                data: this.explorationService.elevationProfileGeoJSON,
                style: {
                    "color": "#ff7800",
                    "weight": 5,
                    "opacity": 0.65
                },
                onEachFeature: el.addData.bind(el)
            }

            //show the div
            angular.element(document.querySelector('.elevation')).css('display', 'block');
            this.toaster.clear();
            this.cursorStyle = 'pointer'
        }

        private measurement() {

            //console.log('in measurement');

            //report ga event
            this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'measurement' });

            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {

                    var stopclick = false; //to prevent more than one click listener

                    var polyline = new (<any>L).Draw.Polyline(map, {
                        shapeOptions: {
                            color: 'blue'
                        },
                        metric: false
                    });
                    polyline.enable();

                    var drawnItems = maplayers.overlays.draw;
                    drawnItems.clearLayers();

                    //user affordance
                    this.explorationService.measurementData = 'Click the map to begin';
			
                    //listeners active during drawing
                    var measuremove = () => {
                        this.explorationService.measurementData = "Total length: " + polyline._getMeasurementString();
                    };
                    var measurestart = () => {
                        if (stopclick == false) {
                            stopclick = true;
                            this.explorationService.measurementData = "Total Length: ";
                            map.on("mousemove", measuremove);
                        };
                    };

                    var measurestop = (e) => {
                        var layer = e.layer;
                        drawnItems.addLayer(layer);
                        drawnItems.addTo(map);
			
                        //reset button
                        this.explorationService.measurementData = "Total length: " + polyline._getMeasurementString();
                        //remove listeners
                        map.off("click", measurestart);
                        map.off("mousemove", measuremove);
                        map.off("draw:created", measurestop);

                        polyline.disable();
                        this.explorationService.drawMeasurement = false;
                    };

                    map.on("click", measurestart);
                    map.on("draw:created", measurestop);


                });
            });
        }

        private checkDelineatePoint(latlng) {

            //console.log('in check delineate point');
            this.studyArea.checkingDelineatedPoint = true;
            
            this.toaster.pop("info", "Information", "Validating your clicked point...", 5000);
            this.cursorStyle = 'wait';
            this.markers = {};

            //put pourpoint on the map
            this.markers['pourpoint'] = {
                lat: latlng.lat,
                lng: latlng.lng,
                message: 'Your clicked point</br></br><strong>Latitude: </strong>' + latlng.lat.toFixed(5) + '</br><strong>Longitude: </strong>' + latlng.lng.toFixed(5),
                focus: true,
                draggable: false
            }

            //turn off delineate flag
            this.studyArea.doDelineateFlag = false;

            //build list of layers to query before delineate
            var queryString = 'visible:'
            this.regionServices.regionMapLayerList.forEach((item) => {
                if (item[0].toLowerCase() == "area of limited functionality" || item[0].toLowerCase() == "areas of limited functionality") queryString += String(item[1]);
            });

            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {

                    this.angulartics.eventTrack('delineationClick', { category: 'Map', label: this.regionServices.selectedRegion.Name });

                    //force map refresh
                    map.invalidateSize();

                    var selectedRegionLayerName = this.regionServices.selectedRegion.RegionID + "_region"

                    maplayers.overlays[selectedRegionLayerName].identify().on(map).at(latlng).returnGeometry(false).layers(queryString).run((error: any, results: any) => {

                        //console.log('exclusion area check: ', queryString, results.features); 

                        //if there are no exclusion area hits
                        if (results.features.length == 0) {
                            //ga event
                            this.angulartics.eventTrack('validatePoint', { category: 'Map', label: 'validPoint'});

                            this.toaster.pop("success", "Your clicked point is valid", "Delineating your basin now...", 5000)
                            this.studyArea.checkingDelineatedPoint = false;
                            this.startDelineate(latlng);
                        }

                        //otherwise parse exclude Codes
                        else {
                            this.studyArea.Disclaimers['isInExclusionArea'] = true;
                            this.studyArea.checkingDelineatedPoint = false;
                            var excludeCode = results.features[0].properties.ExcludeCode;
                            var popupMsg = results.features[0].properties.ExcludeReason;
                            if (excludeCode == 1) {
                                this.toaster.pop("error", "Delineation and flow statistic computation not allowed here", popupMsg, 0);
                                //ga event
                                this.angulartics.eventTrack('validatePoint', { category: 'Map', label: 'exclusionAreaPoint' });
                            }
                            else {
                                this.toaster.pop("warning", "Delineation and flow statistic computation possible but not advised", popupMsg, true, 0);
                                this.startDelineate(latlng);
                            }
                        }

                        this.cursorStyle = 'pointer';
                    });
                });
            });


        }

        private basinEditor() {

            if (this.layers.overlays['globalwatershed'].data.features.length > 1) {
                this.toaster.pop("warning", "Warning", "You cannot edit a global watershed", 5000);
                return;
            }

            var basin = angular.fromJson(angular.toJson(this.layers.overlays['globalwatershed']));
            var basinConverted = [];
            basin.data.features[0].geometry.coordinates[0].forEach((item) => { basinConverted.push([item[1], item[0]]) });

            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {

                    //console.log('maplayers', map, maplayers);

                    //create draw control
                    var drawnItems = maplayers.overlays.draw;
                    drawnItems.clearLayers();
                    var drawControl = new (<any>L).Draw.Polygon(map, drawnItems);
                    drawControl.enable();

                    //listen for end of draw
                    map.on('draw:created',(e) => {

                        map.removeEventListener('draw:created');

                        var layer = e.layer;
                        drawnItems.addLayer(layer);
                        this.studyArea.Disclaimers['isEdited'] = true;  

                        //convert edit polygon coords
                        var editArea = layer.toGeoJSON().geometry.coordinates[0];
                        var editAreaConverted = [];
                        editArea.forEach((item) => { editAreaConverted.push([item[1], item[0]]) });

                        var sourcePolygon = L.polygon(basinConverted);
                        var clipPolygon = L.polygon(editAreaConverted);

                        if (this.studyArea.drawControlOption == 'add') {
                            //console.log('add layer', layer.toGeoJSON());
                            var editPolygon = greinerHormann.union(sourcePolygon, clipPolygon);
                            this.studyArea.WatershedEditDecisionList.append.push(layer.toGeoJSON());

                            //ga event
                            this.angulartics.eventTrack('basinEditor', { category: 'Map', label: 'addArea' });
                        }

                        if (this.studyArea.drawControlOption == 'remove') {
                            //console.log('remove layer', layer.toGeoJSON());
                            var editPolygon = greinerHormann.diff(sourcePolygon, clipPolygon);

                            //check for split polygon
                            //console.log('editPoly', editPolygon.length);
                            if (editPolygon.length == 2) {
                                alert('Splitting polygons is not permitted');
                                drawnItems.clearLayers();
                                return;
                            }

                            this.studyArea.WatershedEditDecisionList.remove.push(layer.toGeoJSON());

                            //ga event
                            this.angulartics.eventTrack('basinEditor', { category: 'Map', label: 'removeArea' });
                        }



                        //set studyArea basin to new edited polygon
                        basin.data.features[0].geometry.coordinates[0] = [];
                        editPolygon.forEach((item) => { basin.data.features[0].geometry.coordinates[0].push([item[1], item[0]]) });
                        //console.log('edited basin', basin, basin.data.features[0].geometry.coordinates[0].length, this.layers.overlays['globalwatershed'].data.features[0].geometry.coordinates[0].length);
                        this.toaster.pop("info", "Submitting your edit", "Please wait...", 5000)

                        //clear old watershed
                        this.removeOverlayLayers('globalwatershed', false);
                        //clear edit layer
                        drawnItems.clearLayers();

                        //show new polygon
                        setTimeout(() => {

                            this.layers.overlays['globalwatershed'] = {
                                name: '<img src=images/regulated-basin.png height="16">&nbsp;&nbsp;Edited Basin Boundary',
                                type: 'geoJSONShape',
                                data: basin.data,
                                visible: true,
                                layerOptions: {
                                    style: {
                                        fillColor: "yellow",
                                        weight: 2,
                                        opacity: 1,
                                        color: 'white',
                                        fillOpacity: 0.5
                                    }
                                }
                            }
                        }, 100);

                        //console.log('editedAreas', angular.toJson(this.studyArea.WatershedEditDecisionList));
                    });
                });
            });
        }

        private onSelectedAreaOfInterestChanged(sender: any, e: WiM.Services.SearchAPIEventArgs) {

            //ga event
            this.angulartics.eventTrack('initialOperation', { category: 'Map', label: 'Search' });

            this.markers = {};
            var AOI = e.selectedAreaOfInterest;

            if (AOI.Category == "U.S. State or Territory") var zoomlevel = 9;
            else var zoomlevel = 14;

            this.markers['AOI'] = {
                lat: AOI.Latitude,
                lng: AOI.Longitude,
                message: AOI.Name,
                focus: true,
                draggable: false
            }

            //this.center = new Center(AOI.Latitude, AOI.Longitude, zoomlevel);

            this.leafletData.getMap().then((map: any) => {
                map.setView([AOI.Latitude, AOI.Longitude], zoomlevel)
            });
        }
        private onSelectedRegionChanged() {
            //console.log('in onselected region changed', this.regionServices.regionList, this.regionServices.selectedRegion);
            if (!this.regionServices.selectedRegion) return;
            this.removeOverlayLayers("_region", true);

            this.regionServices.loadMapLayersByRegion(this.regionServices.selectedRegion.RegionID)
        }
        private onSelectedStudyAreaChanged() {

            //console.log('study area changed');
            this.removeOverlayLayers('globalwatershed', true);

            if (!this.studyArea.selectedStudyArea || !this.studyArea.selectedStudyArea.Features) return;

            var lat = this.studyArea.selectedStudyArea.Pourpoint.Latitude;
            var lng = this.studyArea.selectedStudyArea.Pourpoint.Longitude;
            var rcode = this.studyArea.selectedStudyArea.RegionID;
            var workspaceID = this.studyArea.selectedStudyArea.WorkspaceID;

            this.studyArea.selectedStudyArea.Features.forEach((layer) => {

                var item = angular.fromJson(angular.toJson(layer));

                //console.log('in onselectedstudyarea changed', item.name);

                if (item.name == 'globalwatershed') {
                    this.layers.overlays[item.name] = {
                        name: '<img src=images/basin.png height="16">&nbsp;&nbsp;Basin Boundary',
                        type: 'geoJSONShape',
                        data: item.feature,
                        visible: true,
                        layerOptions: {
                            style: {
                                fillColor: "yellow",
                                weight: 2,
                                opacity: 1,
                                color: 'white',
                                fillOpacity: 0.5
                            }
                        }
                    }
                }
                if (item.name == 'globalwatershedpoint') {
                    this.layers.overlays[item.name] = {
                        name: '<img src=images/marker-icon.png height="16">&nbsp;&nbsp;Basin Clicked Point',
                        type: 'geoJSONShape',
                        data: item.feature,
                        visible: true,
                        layerOptions: {
                            onEachFeature: function (feature, layer) {
                                var popupContent = '<strong>Latitude: </strong>' + lat + '</br><strong>Longitude: </strong>' + lng + '</br><strong>Region: </strong>' + rcode + '</br><strong>WorkspaceID: </strong>' + workspaceID + '</br>';
                                angular.forEach(feature.properties, function (value, key) {
                                    popupContent += '<strong>' + key + ': </strong>' + value + '</br>';
                                });
                                layer.bindPopup(popupContent);
                            }
                        }
                    }
                }

                if (item.name == 'regulatedWatershed') {
                    //console.log('showing regulated watershed');
                    this.layers.overlays["globalwatershedregulated"] = {
                        name: '<img src=images/regulated-basin.png height="16">&nbsp;&nbsp;Basin Boundary (Regulated Area)',
                        type: 'geoJSONShape',
                        data: item.feature,
                        visible: true,
                        layerOptions: {
                            style: {
                                fillColor: "red",
                                weight: 2,
                                opacity: 1,
                                color: 'white',
                                fillOpacity: 0.5
                            }
                        }
                    }
                }
            });

            //clear out this.markers
            this.markers = {};

            var bbox = this.layers.overlays['globalwatershed'].data.features[0].bbox;
            this.leafletData.getMap().then((map: any) => {
                map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]], {
                });
            });

            //query basin against regression regions
            if (!this.nssService.queriedRegions) this.queryRegressionRegions();
        }

        private queryRegressionRegions() {

            this.nssService.queriedRegions = true;

            //send watershed to map service query that returns list of regression regions that overlap the watershed
            this.studyArea.queryRegressionRegions();
        }

        private mapBoundsChange(oldValue, newValue) {

            this.nomnimalZoomLevel = this.scaleLookup(this.center.zoom);

            if (this.center.zoom >= 9 && oldValue !== newValue) {
                //console.log('requesting region list');
                this.regionServices.loadRegionListByExtent(this.bounds.northEast.lng, this.bounds.southWest.lng,
                    this.bounds.southWest.lat, this.bounds.northEast.lat);
            }
            
            //if a region was selected, and then user zooms back out, clear and start over
            if (this.center.zoom <= 6 && oldValue !== newValue) {
                ////console.log('removing region layers', this.layers.overlays);

                //this.regionServices.clearRegion();
                //this.studyArea.clearStudyArea();
                //this.nssService.clearNSSdata();

                ////THIS IS JUST THROWING AN ANGULAR LEAFLET ERROR EVEN THOUGH SAME AS DOCS
                //// http://tombatossals.github.io/angular-leaflet-directive/examples/0000-viewer.html#/layers/dynamic-addition-example
                //this.removeOverlayLayers("_region", true)
                ////this.onSelectedRegionChanged();
            }

            if (this.center.zoom >= 15) {
                this.studyArea.showDelineateButton = true;
            }
            else {
                this.studyArea.showDelineateButton = false;
            }

        }
        private updateRegion() {
            //get regionkey
            var key: string = (this.$locationService.search()).region
            this.setBoundsByRegion(key);

        }
        private setBoundsByRegion(key: string) {
            if (key && this.regionServices.loadRegionListByRegion(key)) {
                this.regionServices.selectedRegion = this.regionServices.regionList[0];
                this.bounds = this.leafletBoundsHelperService.createBoundsFromArray(this.regionServices.selectedRegion.Bounds);
                //this.center = <ICenter>{};
            }

        }

        private addRegionOverlayLayers(regionId: string) {

            if (this.regionServices.regionMapLayerList.length < 1) return;

            this.layers.overlays[regionId + "_region"] = new Layer(regionId + " Map layers", configuration.baseurls['StreamStats'] + "/arcgis/rest/services/{0}_ss/MapServer".format(regionId.toLowerCase()),
                "agsDynamic", true, {
                    "opacity": 1,
                    //"layers": this.regionServices.regionMapLayerList,
                    "format": "png8",
                    "f": "image"
                });

            //override default map service visibility
            this.leafletData.getLayers().then((maplayers: any) => {
                var regionLayer = maplayers.overlays[regionId + "_region"];

                var visibleLayers = [];
                this.regionServices.regionMapLayerList.forEach((item) => {
                    if (item[2]) visibleLayers.push(item[1]);
                });
                console.log('visible state/region map layers: ', visibleLayers);
                regionLayer.setLayers([visibleLayers]);
            });
            
            //get any other layers specified in config
            var layers = this.regionServices.selectedRegion.Layers;
            if (layers == undefined) return;

            for (var layer in layers) {
                this.layers.overlays[layer + "_region"] = layers[layer];
            }

        }
        private removeOverlayLayers(name: string, isPartial: boolean = false) {
            var layeridList: Array<string>;

            layeridList = this.getLayerIdsByID(name, this.layers.overlays, isPartial);

            layeridList.forEach((item) => {
                //console.log('removing map overlay layer: ', item);
                delete this.layers.overlays[item];
            });
        }
        private getLayerIdsByName(name: string, layerObj: Object, isPartial: boolean): Array<string> {
            var layeridList: Array<string> = [];

            for (var variable in layerObj) {
                if (layerObj[variable].hasOwnProperty("name") && (isPartial ? (layerObj[variable].name.indexOf(name) > -1) : (layerObj[variable].name === name))) {
                    layeridList.push(variable);
                }
            }//next variable
            return layeridList;
        }
        private getLayerIdsByID(id: string, layerObj: Object, isPartial: boolean): Array<string> {
            var layeridList: Array<string> = [];

            for (var variable in layerObj) {
                if (isPartial ? (variable.indexOf(id) > -1) : (variable === id)) {
                    layeridList.push(variable);
                }
            }//next variable
            return layeridList;
        }

        private startDelineate(latlng: any) {
            //console.log('in startDelineate', latlng);

            var studyArea: Models.IStudyArea = new Models.StudyArea(this.regionServices.selectedRegion.RegionID, new WiM.Models.Point(latlng.lat, latlng.lng, '4326'));

            this.studyArea.AddStudyArea(studyArea);
            this.studyArea.loadStudyBoundary();
        }
    }//end class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.MapController', MapController)
}//end module
 