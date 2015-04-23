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
///<reference path="../../typings/leaflet/leaflet.d.ts" />

declare var configuration: any;

module StreamStats.Controllers {
    'use strinct';

    interface ICenter {
        lat: number;
        lng: number;
        zoom: number;    
    }
    interface IMapPoint {
        lat: number;
        long: number;
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

    }
    interface IMapControllerScope extends ng.IScope {
        vm: MapController;
    }
    class MapPoint implements IMapPoint{
        lat: number;
        long: number;
        constructor() {
            this.lat = 0;
            this.long = 0;    
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
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public center: ICenter = null;
        public layers: ILayer = null;
        public controls: Object = null;
        public markers: Object = null;
        public mapDefaults: IMapDefault = null;
        public events: Object = null;
        public mapPoint: IMapPoint = null;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope'];
        constructor($scope:IMapControllerScope) {
            $scope.vm = this;
            $scope.$on('leafletDirectiveMap.mousemove',  (event, args) => {
                var latlng = args.leafletEvent.latlng;
                this.mapPoint.lat = latlng.lat;
                this.mapPoint.long = latlng.lng;
            });
            this.init();            
                        
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            
            this.center = new Center(39, -100, 4);
            this.layers = {
                baselayers: configuration.basemaps,
                overlays: configuration.overlayedLayers,
                markers: this.markers
            }             
            this.mapDefaults = new MapDefault(null, 3, false);           
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
                    enable: ['mousemove'],
                    logic:'emit'
                }
            }

            this.mapPoint = new MapPoint();
            
        }


    }//end class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.MapController', MapController)

}//end module
 