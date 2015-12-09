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
        geojson: Object;
        bounds: Object;

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
    //examples/access-leaflet-object-example.html
    //http://www.codeitive.com/0JiejWjjXg/two-or-multiple-geojson-layers-in-angular-leaflet-directive.html
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

        public cursorStyle: string;
        public center: ICenter = null;
        public layers: IMapLayers = null;
        public mapDefaults: IMapDefault = null;
        public mapPoint: IMapPoint = null;
        public bounds: IBounds = null;

        public controls: Object = null;
        public markers: Object = null;
        public geojson: Object = null;
        public events: Object = null;
        public regionLayer: Object = null;
        public drawControl: any;       

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$location', '$stateParams', 'leafletBoundsHelpers', 'leafletData', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService'];
        constructor($scope: IMapControllerScope, $location: ng.ILocationService, $stateParams, leafletBoundsHelper: any, leafletData: ILeafletData, search: WiM.Services.ISearchAPIService, region: Services.IRegionService, studyArea: Services.IStudyAreaService, StatisticsGroup: Services.InssService) {
            $scope.vm = this;
            this.init();

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

            $scope.$on('leafletDirectiveMap.mousemove',(event, args) => {
                var latlng = args.leafletEvent.latlng;
                this.mapPoint.lat = latlng.lat;
                this.mapPoint.lng = latlng.lng;
            });

            $scope.$on('leafletDirectiveMap.click',(event, args) => {
                console.log('caputred map click');
                
                //otherwise listen for delineate click
                if (studyArea.doDelineateFlag) {
                    var latlng = args.leafletEvent.latlng;
                    this.startDelineate(latlng);
                    studyArea.doDelineateFlag = false;
                }

                //query map layers
                else {
                    this.queryStates(args.leafletEvent);
                }
            });

            $scope.$watch(() => this.bounds,(newval, oldval) => this.setRegionsByBounds(oldval, newval));
            $scope.$on('$locationChangeStart',() => this.updateRegion());

            $scope.$watch(() => studyArea.doDelineateFlag,(newval, oldval) => newval ? this.cursorStyle = 'crosshair' : this.cursorStyle = 'hand');

            // check if region was explicitly set.
            if ($stateParams.region) this.setBoundsByRegion($stateParams.region);
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
                custom: new Array(
                    //zoom home button control
                    (<any>L.Control).zoomHome({ homeCoordinates: [39, -100], homeZoom: 4 }),
                    //location control
                    (<any>L.control).locate({ follow: false })
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

        private queryStates(evt) {

            console.log('in querystates');

            //show msg
            //vm.Notification(new Notification("Querying region... please wait.", NotificationType.ALERT, 0.2, ActionType.SHOW));

            //do query

            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {

                    maplayers.overlays["SSLayer"].identify().on(map).at(evt.latlng).returnGeometry(false).layers([3]).run((error: any, results: any) => {
                        console.log('map query', error, results);

                        var rcode = results.features[0].properties.ST_ABBR;

                        this.regionServices.masterRegionList.forEach((item) => {
                            if (item.RegionID == rcode) {
                                this.setBoundsByRegion(rcode);
                                this.regionServices.loadParametersByRegion();
                                //this.studyArea.selectInitialParameters(this.regionServices.parameterList);
                            }
                            
                        });


                    });

                });
            });

        }

        private basinEditor() {

            var basin = JSON.parse(JSON.stringify(this.geojson['globalwatershed'].data.features[0]));
            var basinConverted = [];
            basin.geometry.coordinates[0].forEach((item) => { basinConverted.push([item[1], item[0]]) });

            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {

                    console.log('maplayers', map, maplayers);

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

                        //convert edit polygon coords
                        var editArea = layer.toGeoJSON().geometry.coordinates[0];
                        var editAreaConverted = [];
                        editArea.forEach((item) => { editAreaConverted.push([item[1], item[0]]) });

                        var sourcePolygon = L.polygon(basinConverted);
                        var clipPolygon = L.polygon(editAreaConverted);

                        if (this.studyArea.drawControlOption == 'add') {
                            console.log('add layer', layer.toGeoJSON());
                            var editPolygon = greinerHormann.union(sourcePolygon, clipPolygon);
                            this.studyArea.editedAreas.added.push(layer.toGeoJSON());
                        }

                        if (this.studyArea.drawControlOption == 'remove') {
                            console.log('remove layer', layer.toGeoJSON());
                            var editPolygon = greinerHormann.diff(sourcePolygon, clipPolygon);

                            //check for split polygon
                            console.log('editPoly', editPolygon.length);
                            if (editPolygon.length == 2) {
                                alert('Splitting polygons is not permitted');
                                drawnItems.clearLayers();
                                return;
                            }

                            this.studyArea.editedAreas.removed.push(layer.toGeoJSON());
                        }

                        //set studyArea basin to new edited polygon
                        basin.geometry.coordinates[0] = [];
                        editPolygon.forEach((item) => { basin.geometry.coordinates[0].push([item[1], item[0]]) });
                        console.log('edited basin', basin);
                        
                        //show new polygon
                        this.geojson['globalwatershed'].data.features[0] = basin;
                        drawnItems.clearLayers();
                        console.log('editedAreas', JSON.stringify(this.studyArea.editedAreas));
                    });
                });
            });
        }

        private onSelectedAreaOfInterestChanged(sender: any, e: WiM.Services.SearchAPIEventArgs) {
            var AOI = e.selectedAreaOfInterest;

            this.markers['AOI'] = {
                lat: AOI.Latitude,
                lng: AOI.Longitude,
                message: AOI.Name,
                focus: true,
                draggable: false
            }

            this.center = new Center(AOI.Latitude, AOI.Longitude, 14);
        }
        private onSelectedRegionChanged() {
            console.log('in onselected region changed', this.regionServices.regionList, this.regionServices.selectedRegion);
            if (!this.regionServices.selectedRegion) return;
            this.removeOverlayLayers("_region", true);
            this.addRegionOverlayLayers(this.regionServices.selectedRegion.RegionID);
        }
        private onSelectedStudyAreaChanged() {

            console.log('study area changed');
            this.geojson = {};

            if (!this.studyArea.selectedStudyArea || !this.studyArea.selectedStudyArea.Features) return;

            var lat = this.studyArea.selectedStudyArea.Pourpoint.Latitude;
            var lng = this.studyArea.selectedStudyArea.Pourpoint.Longitude;
            var rcode = this.studyArea.selectedStudyArea.RegionID;
            var workspaceID = this.studyArea.selectedStudyArea.WorkspaceID;

            this.studyArea.selectedStudyArea.Features.forEach((layer) => {

                var item = JSON.parse(JSON.stringify(layer));

                console.log('in onselectedstudyarea changed', item.name);

                if (item.name == 'globalwatershed') {
                    this.geojson[item.name] = {
                        data: item.feature,
                        style: {
                            fillColor: "yellow",
                            weight: 2,
                            opacity: 1,
                            color: 'white',
                            fillOpacity: 0.5
                        }
                    }
                }
                if (item.name == 'globalwatershedpoint') {
                    this.geojson[item.name] = {
                        data: item.feature,
                        onEachFeature: function (feature, layer) {
                            var popupContent = '<strong>Latitude: </strong>' + lat + '</br><strong>Longitude: </strong>' + lng + '</br><strong>Region: </strong>' + rcode + '</br><strong>WorkspaceID: </strong>' + workspaceID + '</br>';
                            angular.forEach(feature.properties, function (value, key) {
                                popupContent += '<strong>' + key + ': </strong>' + value + '</br>';
                            });
                            layer.bindPopup(popupContent);
                        }
                    }
                }

                if (item.name == 'regulatedWatershed') {
                    console.log('showing regulated watershed');
                    this.geojson[item.name] = {
                        data: item.feature,
                        style: {
                            fillColor: "red",
                            weight: 2,
                            opacity: 1,
                            color: 'white',
                            fillOpacity: 0.5
                        }
                    }
                }
            });

            console.log('geojson', this.geojson);

            //clear out this.markers
            this.markers = {};

            //console.log(JSON.stringify(this.geojson));    
            var bbox = this.geojson['globalwatershed'].data.features[0].bbox;
            //this.bounds = this.leafletBoundsHelperService.createBoundsFromArray([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
            this.leafletData.getMap().then((map: any) => {
                map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]], {
                    //offset width of sidebar from left, 50px from top
                    //paddingTopLeft: [document.getElementById("sidebar").offsetWidth,50]
                });
            });
        }

        private setRegionsByBounds(oldValue, newValue) {

            if (this.center.zoom >= 9 && oldValue !== newValue) {
                console.log('requesting region list');
                this.regionServices.loadRegionListByExtent(this.bounds.northEast.lng, this.bounds.southWest.lng,
                    this.bounds.southWest.lat, this.bounds.northEast.lat);
            }
            
            //if a region was selected, and then user zooms back out, clear and start over
            if (this.center.zoom <= 6 && oldValue !== newValue && this.regionServices.selectedRegion) {
                console.log('removing region layers', this.layers.overlays);

                this.regionServices.clearRegion();
                this.studyArea.clearStudyArea();
                this.nssService.clearNSSdata();

                //THIS IS JUST THROWING AN ANGULAR LEAFLET ERROR EVEN THOUGH SAME AS DOCS
                // http://tombatossals.github.io/angular-leaflet-directive/examples/0000-viewer.html#/layers/dynamic-addition-example
                this.removeOverlayLayers("_region", true)
                //this.onSelectedRegionChanged();
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
                this.center = <ICenter>{};
            }

        }
        private addRegionOverlayLayers(regionId: string) {
            var layerlist =this.regionServices.loadMapLayersByRegion(regionId)
            this.layers.overlays[regionId + "_region"] = new Layer(regionId + " Map layers", configuration.baseurls['StreamStats'] + "/arcgis/rest/services/{0}_ss/MapServer".format(regionId.toLowerCase()),
                "agsDynamic", true, {
                    "opacity": 0.5,
                    "layers": layerlist,
                    "zIndex": 999,
                    "format": "png8",
                    "f":"image"
                });
            
            //get any other layers specified in config
            var layers = configuration.customMapServices[regionId];
            if (layers == undefined) return;

            for (var layer in layers) {
                this.layers.overlays[layer + "_region"] = layers[layer];
            }

        }
        private removeOverlayLayers(name: string, isPartial: boolean = false) {
            var layeridList: Array<string>;

            layeridList = this.getLayerIdsByID(name, this.layers.overlays, isPartial);

            layeridList.forEach((item) => {
                console.log('removing map overlay layer: ', item);
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
            console.log('in startDelineate', latlng);

            this.markers['pourpoint'] = {
                lat: latlng.lat,
                lng: latlng.lng,
                message: 'New Pourpoint</br><strong>Latitude: </strong>' + latlng.lat + '</br><strong>Longitude: </strong>' + latlng.lng,
                focus: false,
                draggable: false
            }

            var studyArea: Models.IStudyArea = new Models.StudyArea(this.regionServices.selectedRegion.RegionID, new WiM.Models.Point(latlng.lat, latlng.lng, '4326'));

            this.studyArea.AddStudyArea(studyArea);
            this.studyArea.loadStudyBoundary();
        }
    }//end class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.MapController', MapController)

}//end module
 