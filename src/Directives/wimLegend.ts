//------------------------------------------------------------------------------
//----- WiM Legend ------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2015 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:
//  http://www.ng-newsletter.com/posts/directives.html
//      Restrict parameters
//          'A' - <span ng-sparkline></span>
//          'E' - <ng-sparkline > </ng-sparkline>
//          'C' - <span class="ng-sparkline" > </span>
//          'M' - <!--directive: ng - sparkline-- >

//Comments
//01.11.2016 jkn - Created

//Import
module WiM.Directives {
    'use string';
    interface IwimLegendControllerScope extends ng.IScope {
        vm: IwimLegendController;
    }
    interface IwimLegendController {
        overlays: IwimLegendLayerGroup;
        baselayers: IwimLegendLayerGroup;
        
    }
    interface IwimLegendLayerGroup {
        selectedlayerName: string;
        isAvailable: boolean;
        layergroup: any;
        isOpen: boolean;

    }

    interface IwimLegendAttributes extends ng.IAttributes {
        //must use camelcase
        stopEvents: string;
    }

    export var onLayerAdded: string = "onLayerAdded";
    export var onLayerChanged: string = "onLayerChanged";

    export class LegendLayerAddedEventArgs extends WiM.Event.EventArgs {
        //properties
        public LayerName: string;
        public layerType: String;
        public style: any;

        constructor(layername:string, ltype:string, style:any) {
            super();
            this.LayerName = layername;
            this.layerType = ltype;
            this.style = style;
        }
    }
    export class LegendLayerChangedEventArgs extends WiM.Event.EventArgs {
        //properties
        public LayerName: string;
        public layerType: String;

        constructor(layername: string, propertyname: string) {
            super();
            this.LayerName = layername
        }
    }

    class wimLegendController extends WiM.Services.HTTPServiceBase implements IwimLegendController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private safeApply: any;
        private isDefined: any;
        private leafletHelpers: any;
        private leafletData: any;
        public overlays: IwimLegendLayerGroup;
        public baselayers: IwimLegendLayerGroup;
        public applicationLayer: IwimLegendLayerGroup;


        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'leafletData', 'WiM.Services.EventService'];
        constructor($scope: IwimLegendControllerScope, $http: ng.IHttpService, leafletData: any, eventService: WiM.Services.IEventService) {
            super($http, '');
            $scope.vm = this;
            //subscribe to Events
            eventService.AddEvent(onLayerAdded, new WiM.Event.Delegate<LegendLayerAddedEventArgs>());
            eventService.SubscribeToEvent(onLayerAdded, new WiM.Event.EventHandler<LegendLayerAddedEventArgs>((sender: any, e: LegendLayerAddedEventArgs) => {
                this.onLayerAdded(sender, e);
            }));

            this.leafletData = leafletData;
            this.init();
 
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public initOverlays(mlyr: any) {
            if (mlyr.type != "agsDynamic") return;
            //getsublayers
            var url = mlyr.url + "/legend?f=pjson";
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);
            this.Execute(request).then(
                (response: any) => {
                    console.log(response.data);
                    if (response.data.layers.length > 0) {
                        mlyr.isOpen = true;
                        mlyr.layerArray = response.data.layers;                      
                    }
                }, (error) => {

                });
        }
        
        public changeBaseLayer(key: any, evt: any)
        {
            this.baselayers.selectedlayerName = key.toString();
            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {
                    if (map.hasLayer(maplayers.baselayers[key])) { return; }

                    for (var mlayr in maplayers.baselayers) {
                        if (map.hasLayer(maplayers.baselayers[mlayr])) {
                            map.removeLayer(maplayers.baselayers[mlayr]);
                        }//end if
                    }//next

                    map.addLayer(maplayers.baselayers[key]);
                });
            });            
            evt.preventDefault();
            
        }//end change baseLayer

        //Helper Methods
        private init() {
            this.overlays = <IwimLegendLayerGroup>{};
            this.baselayers = <IwimLegendLayerGroup>{};
            this.baselayers.isOpen = true;

            this.applicationLayer = <IwimLegendLayerGroup>{
                selectedlayerName: "Application Layers",
                isAvailable:false,
                layergroup: {},
                isOpen: false
            };


            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {
                    for (var key in maplayers.baselayers) {
                        if (map.hasLayer(maplayers.baselayers[key])) {
                            this.baselayers.selectedlayerName = key.toString();
                            break;
                        }//end if
                    }//next
                });//end getLayers                                
            });//end getMap   

            

        }//end init

        private onLayerAdded(sender: any, e: LegendLayerAddedEventArgs) {
            if (e.layerType != 'geojson') return; 
            //add to legend
            if (this.applicationLayer.layergroup.hasOwnProperty(e.LayerName)) return;
            this.applicationLayer.isAvailable = true;
            this.applicationLayer.layergroup[e.LayerName] = {
                visible: true,
                style: e.style
            }         
        }

    }//end wimLayerControlController class

    class wimLegend implements ng.IDirective {
        static instance(): ng.IDirective {
            return new wimLegend;
        }
        //create isolated scope
        scope = {
            icons: '=?',
            autoHideOpacity: '=?', // Hide other opacity controls when one is activated.
            showGroups: '=?', // Hide other opacity controls when one is activated.
            title: '@',
            baseTitle: '@',
            overlaysTitle: '@',
        }
        restrict = 'E';
        require = '^leaflet';
        transclude= false;
        controller = wimLegendController;
        templateUrl = 'Views/Legend/legend.html';
        replace = true;

        link(scope: ng.IScope, element: ng.IAugmentedJQuery, attributes: IwimLegendAttributes, controller: any): void {
            //this is where we can register listeners, set up watches, and add functionality. 
            // The result of this process is why the live data- binding exists between the scope and the DOM tree.
            
            var leafletScope = controller.getLeafletScope();
            var layers = leafletScope.layers;
            (<any>scope).vm.overlays.layergroup = layers.overlays;
            (<any>scope).vm.baselayers.layergroup = layers.baselayers;

            element.bind('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
            });

            element.bind('mouseover', (e) => {
               controller.getMap().then((map: any) => {
                   map.dragging.disable();  
                   map.doubleClickZoom.disable
                   map.scrollWheelZoom.disable();                            
                });//end getMap   
            });
            element.bind('mouseout', (e) => {
                controller.getMap().then((map: any) => {
                    map.dragging.enable();
                    map.doubleClickZoom.enable();
                    map.scrollWheelZoom.enable();
                });//end getMap  
            });


        }//end link

    }//end UrlDirective

    angular.module('wim_angular')
        .directive('wimLegend', wimLegend.instance);
}//end module 