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
    //'use strict';
    interface ILeafletData {
        getMap(): ng.IPromise<any>;
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
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private regionServices: Services.IRegionService;
        private searchService: WiM.Services.ISearchAPIService;
        private leafletBoundsHelperService: any;
        private $locationService: ng.ILocationService;
        private leafletData: ILeafletData;
        private studyArea: Services.IStudyAreaService;

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
        

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$location', '$stateParams', 'leafletBoundsHelpers', 'leafletData', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService'];
        constructor($scope: IMapControllerScope, $location: ng.ILocationService, $stateParams, leafletBoundsHelper: any, leafletData: ILeafletData, search: WiM.Services.ISearchAPIService, region: Services.IRegionService, studyArea: Services.IStudyAreaService) {
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

            $scope.$on('leafletDirectiveMap.overlayadd',(event, args) => {
                console.log('overlay added');

                //pan by sidebar width after region overlay add
                this.leafletData.getMap().then((map: any) => {
                    console.log('in add regionoverlays');
                    //map.panBy([-document.getElementById("sidebar").offsetWidth, 0]);
                    map.panBy([-200, 0]);
                });
            });

            $scope.$on('leafletDirectiveMap.mousemove',(event, args) => {
                var latlng = args.leafletEvent.latlng;
                this.mapPoint.lat = latlng.lat;
                this.mapPoint.lng = latlng.lng;
            });

            $scope.$on('leafletDirectiveMap.click',(event, args) => {
                if (!studyArea.doDelineateFlag) return;
                var latlng = args.leafletEvent.latlng;
                this.startDelineate(latlng);
                studyArea.doDelineateFlag = false;
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

            //init map           
            this.center = new Center(39, -100, 4);
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
                zoomControl: false,
                custom: new Array(
                    //zoom home button control
                    (<any>L.Control).zoomHome({ homeCoordinates: [39, -100], homeZoom: 4 }),
                    //location control
                    (<any>L.control).locate({ follow: true })
                    )
            };
            this.events = {
                map: {
                    enable: ['mousemove']
                }
            }
            this.mapPoint = new MapPoint();
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
            this.removeOverlayLayers("_region", true)
            this.addRegionOverlayLayers(this.regionServices.selectedRegion.RegionID);  
        }
        private onSelectedStudyAreaChanged() {
            
            if (!this.studyArea.selectedStudyArea.Features) return;

            var geoJson = this.geojson;
            angular.forEach(this.studyArea.selectedStudyArea.Features, function (value, index) {
                geoJson[value.name] = {
                    data: value.feature
                }
                //this.geojson = this.studyArea.selectedStudyArea.Features;
            });

            
            
            console.log(this.geojson);
            /*
            if (!this.studyArea.selectedStudyArea.Basin) return;

            this.geojson['delineatedBasin'] = {
                data: this.studyArea.selectedStudyArea.Basin,
                style: {
                    fillColor: "yellow",
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.5
                }
            }

            this.geojson['pourpoint'] = {
                data: this.studyArea.selectedStudyArea.Pourpoint,
                onEachFeature: function (feature, layer) {
                    var popupContent = '';
                    angular.forEach(feature.properties, function (value, key) {
                        popupContent += '<strong>' + key + ': </strong>' + value + '</br>';
                    });
                    layer.bindPopup(popupContent).openPopup();
                }
            }
            */
            

            //clear out this.markers
            this.markers = {};

            //console.log(JSON.stringify(this.geojson));    
            var bbox = this.geojson['delineatedbasin(simplified)'].data.features[0].bbox;
            //this.bounds = this.leafletBoundsHelperService.createBoundsFromArray([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
            this.leafletData.getMap().then((map: any) => {              
                map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]], {
                    //offset width of sidebar from left, 50px from top
                    paddingTopLeft: [document.getElementById("sidebar").offsetWidth,50]
                });          
            });
        }
       
        private setRegionsByBounds(oldValue, newValue) {

            if (this.center.zoom >= 14 && oldValue !== newValue) {
                this.regionServices.loadRegionListByExtent(this.bounds.northEast.lng, this.bounds.southWest.lng,
                    this.bounds.southWest.lat, this.bounds.northEast.lat);
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
            this.layers.overlays[regionId + "_region"] = new Layer(regionId + " Region", configuration.baseurls['StreamStats'] + "/arcgis/rest/services/{0}_ss/MapServer".format(regionId.toLowerCase()),
                "dynamic", true, {
                    "opacity": 0.5,
                    "layers": this.regionServices.loadMapLayersByRegion(regionId)
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
            layeridList.forEach((item) => { delete this.layers.overlays[item] });
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
                message: 'new pourpoint',
                focus: true,
                draggable: true
            }

            var studyArea: Models.IStudyArea = new Models.StudyArea(this.regionServices.selectedRegion.RegionID, new WiM.Models.Point(latlng.lat, latlng.lng, '4326'));

            this.studyArea.AddStudyArea(studyArea);
            this.studyArea.loadStudyBoundary();
        }
    }//end class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.MapController', MapController)

}//end module
 