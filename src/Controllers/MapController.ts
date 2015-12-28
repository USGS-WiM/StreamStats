﻿//------------------------------------------------------------------------------
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

        public cursorStyle: string;
        public center: ICenter = null;
        public layers: IMapLayers = null;
        public mapDefaults: IMapDefault = null;
        public mapPoint: IMapPoint = null;
        public bounds: IBounds = null;

        public controls: Object = null;
        public markers: Object = null;
        public events: Object = null;
        public regionLayer: Object = null;
        public drawControl: any;    
        public toaster: any; 
        public nomnimalZoomLevel: string;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', 'toaster', '$location', '$stateParams', 'leafletBoundsHelpers', 'leafletData', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService'];
        constructor($scope: IMapControllerScope, toaster, $location: ng.ILocationService, $stateParams, leafletBoundsHelper: any, leafletData: ILeafletData, search: WiM.Services.ISearchAPIService, region: Services.IRegionService, studyArea: Services.IStudyAreaService, StatisticsGroup: Services.InssService) {
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
                console.log('caputred map click');
                
                //listen for delineate click if ready
                if (studyArea.doDelineateFlag) {
                    var latlng = args.leafletEvent.latlng;
                    this.checkDelineatePoint(latlng);
                }

                //otherwise query map layers
                else {
                    this.queryMapLayers(args.leafletEvent);
                }
            });

            $scope.$watch(() => this.bounds,(newval, oldval) => this.mapBoundsChange(oldval, newval));
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
                console.log('in regression query watch', newval, oldval);
                //join codes from regression region object list and run query
                if (newval) this.nssService.loadStatisticsGroupTypes(this.regionServices.selectedRegion.RegionID, this.studyArea.selectedStudyArea.RegressionRegions.map(function (elem) {
                    return elem.code; }).join(","));
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
                markers: this.markers
            }
            this.mapDefaults = new MapDefault(null, 3, false);
            this.markers = {};
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

        private queryMapLayers(evt) {

            console.log('in querystates');

            //build list of layers to query before delineate
            var queryString = 'visible:'
            this.regionServices.nationalMapLayerList.forEach((item) => {
                if (item[0] == "Area of limited functionality") queryString += String(item[1]);
            });
            console.log('queryList', queryString);

            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {

                    maplayers.overlays["SSLayer"].identify().on(map).at(evt.latlng).returnGeometry(false).run((error: any, results: any) => {
                        if (!results.features) return;

                        results.features.forEach((queryResult) => {


                            this.regionServices.nationalMapLayerList.forEach((item) => {
                                if (queryResult.layerId == item[1]) {
                                    console.log('Map query found a match with: ', item[0], queryResult)

                                    if (((item[0] == 'State Applications') || (item[0] == 'Regional Studies')) && (map.getZoom() <= 7)) {

                                        if (item[0] == 'State Applications') var rcode = queryResult.properties.ST_ABBR;
                                        if (item[0] == 'Regional Studies') var rcode = queryResult.properties.ST_ABBR;

                                        this.markers['rcodeSelect'] = {
                                            lat: evt.latlng.lat,
                                            lng: evt.latlng.lng,
                                            message: 'State/Regional Study Found',
                                            focus: true,
                                            draggable: false
                                        }

                                        this.regionServices.masterRegionList.forEach((item) => {
                                            if (item.RegionID == rcode) {
                                                this.setBoundsByRegion(rcode);
                                                this.regionServices.loadParametersByRegion();
                                            }
                                        });
                                    }
                                }
                            });  

                        });
 


                    });
                });
            });

        }

        private basinEditor() {

            var basin = angular.fromJson(angular.toJson(this.layers.overlays['globalwatershed']));
            var basinConverted = [];
            basin.data.features[0].geometry.coordinates[0].forEach((item) => { basinConverted.push([item[1], item[0]]) });

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
                            this.studyArea.WatershedEditDecisionList.append.push(layer.toGeoJSON());
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

                            this.studyArea.WatershedEditDecisionList.remove.push(layer.toGeoJSON());
                        }

                        //set studyArea basin to new edited polygon
                        basin.data.features[0].geometry.coordinates[0] = [];  
                        editPolygon.forEach((item) => { basin.data.features[0].geometry.coordinates[0].push([item[1], item[0]]) });
                        console.log('edited basin', basin, basin.data.features[0].geometry.coordinates[0].length, this.layers.overlays['globalwatershed'].data.features[0].geometry.coordinates[0].length);
                        this.toaster.pop("info", "Submitting your edit", "Please wait...", 5000)

                        //clear old watershed
                        this.removeOverlayLayers('globalwatershed', false);
                        //clear edit layer
                        drawnItems.clearLayers();

                        //show new polygon
                        setTimeout(() => {
                            
                            this.layers.overlays['globalwatershed'] = {
                                name: 'Edited Basin Boundary',
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


                        console.log('editedAreas', angular.toJson(this.studyArea.WatershedEditDecisionList));
                    });
                });
            });
        }

        private onSelectedAreaOfInterestChanged(sender: any, e: WiM.Services.SearchAPIEventArgs) {
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

            this.center = new Center(AOI.Latitude, AOI.Longitude, zoomlevel);

            this.leafletData.getMap().then((map: any) => {
                map.invalidateSize();
            });
        }
        private onSelectedRegionChanged() {
            console.log('in onselected region changed', this.regionServices.regionList, this.regionServices.selectedRegion);
            if (!this.regionServices.selectedRegion) return;
            this.removeOverlayLayers("_region", true);
            this.addRegionOverlayLayers(this.regionServices.selectedRegion.RegionID);
        }
        private onSelectedStudyAreaChanged() {

            console.log('study area changed');
            this.removeOverlayLayers('globalwatershed', true);

            if (!this.studyArea.selectedStudyArea || !this.studyArea.selectedStudyArea.Features) return;

            var lat = this.studyArea.selectedStudyArea.Pourpoint.Latitude;
            var lng = this.studyArea.selectedStudyArea.Pourpoint.Longitude;
            var rcode = this.studyArea.selectedStudyArea.RegionID;
            var workspaceID = this.studyArea.selectedStudyArea.WorkspaceID;

            this.studyArea.selectedStudyArea.Features.forEach((layer) => {

                var item = angular.fromJson(angular.toJson(layer));

                console.log('in onselectedstudyarea changed', item.name);

                if (item.name == 'globalwatershed') {
                    this.layers.overlays[item.name] = {
                        name: 'Basin Boundary',
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
                        name: 'Basin Clicked Point',
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

                if (item.name == 'globalwatershedregulated') {
                    console.log('showing regulated watershed');
                    this.layers.overlays[item.name] = {
                        name: 'Basin Boundary (Regulated Area)',
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
                console.log('requesting region list');
                this.regionServices.loadRegionListByExtent(this.bounds.northEast.lng, this.bounds.southWest.lng,
                    this.bounds.southWest.lat, this.bounds.northEast.lat);
            }
            
            //if a region was selected, and then user zooms back out, clear and start over
            if (this.center.zoom <= 6 && oldValue !== newValue) {
                console.log('removing region layers', this.layers.overlays);

                this.regionServices.clearRegion();
                this.studyArea.clearStudyArea();
                this.nssService.clearNSSdata();

                //THIS IS JUST THROWING AN ANGULAR LEAFLET ERROR EVEN THOUGH SAME AS DOCS
                // http://tombatossals.github.io/angular-leaflet-directive/examples/0000-viewer.html#/layers/dynamic-addition-example
                this.removeOverlayLayers("_region", true)
                //this.onSelectedRegionChanged();
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
                this.center = <ICenter>{};
            }

        }
        
        private addRegionOverlayLayers(regionId: string) {
            this.regionServices.loadMapLayersByRegion(regionId)

            //refine list here if needed
            //if ((value.name.toLowerCase().indexOf('stream grid') > -1) || (value.name.toLowerCase().indexOf('study area bndys') > -1) || (value.name.toLowerCase().indexOf('str') > -1)) {   };

            console.log('adding layers to map');

            this.layers.overlays[regionId + "_region"] = new Layer(regionId + " Map layers", configuration.baseurls['StreamStats'] + "/arcgis/rest/services/{0}_ss/MapServer".format(regionId.toLowerCase()),
                "agsDynamic", true, {
                    "opacity": 0.5,
                    "layers": this.regionServices.regionMapLayerList,
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

        private checkDelineatePoint(latlng) {

            console.log('in check delineate point');

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

            //clear toasts
            this.toaster.clear();

            //build list of layers to query before delineate
            var queryString = 'visible:' 
            this.regionServices.regionMapLayerList.forEach((item) => {
                if (item[0] == "Area of limited functionality") queryString += String(item[1]);
            });
            console.log('queryList', queryString);

            this.toaster.pop("info", "Information", "Validating your clicked point...", 5000);

            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {

                    //force map refresh
                    map.invalidateSize(); 

                    var selectedRegionLayerName = this.regionServices.selectedRegion.RegionID + "_region"

                    maplayers.overlays[selectedRegionLayerName].identify().on(map).at(latlng).returnGeometry(false).layers(queryString).run((error: any, results: any) => {

                        //if there are no exclusion area hits
                        if (results.features.length == 0) {
                            this.toaster.pop("success", "Your clicked point is valid", "Delineating your basin now...", 5000)
                            this.startDelineate(latlng);
                        }

                        //otherwise parse exclude Codes
                        else {
                            var excludeCode = results.features[0].properties.ExcludeCode;
                            var popupMsg = results.features[0].properties.ExcludeReason;
                            if (excludeCode == 1) {
                                this.toaster.pop("error", "Delineation and flow statistic computation not allowed here", popupMsg, 0);
                            }
                            else {
                                this.toaster.pop("warning", "Delineation and flow statistic computation possible but not advised", popupMsg, true, 0);
                                this.startDelineate(latlng);
                            }
                        } 
                    });
                });
            });
        }

        private startDelineate(latlng: any) {
            console.log('in startDelineate', latlng);

            var studyArea: Models.IStudyArea = new Models.StudyArea(this.regionServices.selectedRegion.RegionID, new WiM.Models.Point(latlng.lat, latlng.lng, '4326'));

            this.studyArea.AddStudyArea(studyArea);
            this.studyArea.loadStudyBoundary();
        }
    }//end class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.MapController', MapController)

}//end module
 