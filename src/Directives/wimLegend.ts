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
        layergroup: any;
        isOpen: boolean;

    }

    interface IwimLegendAttributes extends ng.IAttributes {
        //must use camelcase
        stopEvents: string;
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

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', '$element','$sce' ,'leafletData', 'leafletHelpers'];
        constructor($scope: IwimLegendControllerScope, $http: ng.IHttpService, $element, $sce: ng.ISCEService, leafletData: any, leafletHelpers: any) {

            super($http, '');
            $scope.vm = this;
            this.leafletData = leafletData;
            this.leafletHelpers = leafletHelpers;
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
            this.overlays.isOpen = false;
            this.baselayers.isOpen = true;

            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {
                    for (var key in maplayers.baselayers) {
                        if (map.hasLayer(maplayers.baselayers[key])) {
                            this.baselayers.selectedlayerName = key.toString();
                            break;
                        }//end if
                    }//next
                });//end getLayers

                //remove legend
                
            });//end getMap   

            
            //http://pastebin.com/k8z6ZkdX


        }//end init

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
            (<any>scope).vm.layers = layers;

            element.bind('click', function (e) {
                    e.stopPropagation();
            });

        }//end link

    }//end UrlDirective

    angular.module('wim_angular')
        .directive('wimLegend', wimLegend.instance);
}//end module 