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
declare var configuration: any;

module StreamStats.Controllers {
    'use strinct';
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
    interface ILayer {
        baselayers: Object;
        overlays: Object;
        markers: Object;
    }
    interface IMapDefault {
        maxZoom: number;
        zoomControl: boolean;
        minZoom: number;
    }
    interface IMapController {
        center: ICenter;
        layers: ILayer;
        controls: Object;
        markers: Object;
        bounds: Object;

    }
    interface IMapControllerScope extends ng.IScope {
        vm: MapController;
    }
    class MapPoint implements IMapPoint{
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
    class MapDefault implements IMapDefault {
        public maxZoom: number;
        public zoomControl: boolean;
        public minZoom: number;
        
        constructor(mxZm: number = null, mnZm: number = null, zmCtrl:boolean = true) {
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
        
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private streamStatsService: Services.ISessionService;
        private regionServices: Services.IRegionService;
        private leafletBoundsHelperService: any;
        private $locationService: ng.ILocationService;

        public center: ICenter = null;
        public layers: ILayer = null;
        public mapDefaults: IMapDefault = null;
        public mapPoint: IMapPoint = null;
        public bounds: IBounds = null;

        public controls: Object = null;
        public markers: Object = null;
        public events: Object = null;
        
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$location','$stateParams','leafletBoundsHelpers','StreamStats.Services.SessionService', 'StreamStats.Services.RegionService'];
        constructor($scope:IMapControllerScope, $location:ng.ILocationService,$stateParams, leafletBoundsHelper:any, streamStats:Services.ISessionService, regionService:Services.IRegionService) {
            $scope.vm = this;
            this.init(); 

            $scope.$on('leafletDirectiveMap.mousemove',  (event, args) => {
                var latlng = args.leafletEvent.latlng;
                this.mapPoint.lat = latlng.lat;
                this.mapPoint.lng = latlng.lng;
            }); 
                       

            $scope.$watch(() => this.bounds,(newval, oldval) => this.setRegionsByBounds(oldval, newval));
            $scope.$on('$locationChangeStart',() => this.updateRegion());


            
            this.streamStatsService = streamStats;
            this.$locationService = $location;
            this.regionServices = regionService;
            this.leafletBoundsHelperService = leafletBoundsHelper;

            //subscribe to Events
            streamStats.onSelectedAreaOfInterestChanged.subscribe(this._onSelectedAreaOfInterestHandler);

            if ($stateParams.region) this.setBoundsByRegion($stateParams.region);
                       
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void { 
            //init event handler
            this._onSelectedAreaOfInterestHandler = new WiM.Event.EventHandler<WiM.Event.EventArgs>((sender: any, e: WiM.Event.EventArgs) => {
                this.onSelectedAreaOfInterestChanged(sender);
            });
            
            //init map           
            this.center = new Center(39, -100, 4);
            this.layers = {
                baselayers: configuration.basemaps,
                overlays: configuration.overlayedLayers,
                markers: this.markers
            }             
            this.mapDefaults = new MapDefault(null, 3, false);   
            this.markers = {};        
            //add custom controls
            this.controls = {
                scale: true,
                zoomControl:false,
                custom: new Array(
                    //zoom home button control
                    (<any>L.Control).zoomHome({ homeCoordinates: [39, -100], homeZoom: 4 }),
                    //location control
                    (<any>L.control).locate({ follow: true })       
                    )
            };
            this.events= { 
                map: {
                    enable: ['mousemove']
                }
            }
            this.mapPoint = new MapPoint();          
        }
        private onSelectedAreaOfInterestChanged(e: WiM.Event.EventArgs) {
            var AOI = this.streamStatsService.selectedAreaOfInterest;

            this.markers['AOI'] = {
                lat: AOI.Latitude,
                lng: AOI.Longitude,
                message: AOI.Name,
                focus: true,
                draggable:false
            }

            this.center = new Center(AOI.Latitude, AOI.Longitude, 14);
        }
        private setRegionsByBounds(oldValue, newValue) {

            if (this.center.zoom >= 14 && oldValue !== newValue) {
                this.regionServices.loadRegionListByExtent(this.bounds.northEast.lng, this.bounds.southWest.lng,
                                                this.bounds.southWest.lat, this.bounds.northEast.lat);
            }
        }
        private updateRegion() {
            //get regionkey
            var key: string= (this.$locationService.search()).region
            this.setBoundsByRegion(key);

        }
        private setBoundsByRegion(key:string) {           
            if (key && this.regionServices.loadRegionListByRegion(key)) {
                this.streamStatsService.selectedRegion = this.regionServices.regionList[0];
                this.bounds = this.leafletBoundsHelperService.createBoundsFromArray(this.streamStatsService.selectedRegion.Bounds);      
                this.center = <ICenter>{};         
            }

        }
    }//end class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.MapController', MapController)

}//end module
 