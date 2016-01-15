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
        baselayer: any;
        oldGroup: string;
        layerProperties: any;
        groupProperties: any;
        rangeIsSupported: any;
        
    }
    interface ILayerController {
        getLeafletScope();
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

        public $scope: ng.IScope;
        public baselayer: string;
        public oldGroup: string;
        public layerProperties: any;
        public groupProperties: any;
        public rangeIsSupported: any;

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
        
        public changeBaseLayer(key: any, evt: any)
        {
            this.baselayer = key.toString();
            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {
                    if (map.hasLayer(maplayers.baselayers[key])) { return; }

                    for (var i in maplayers.baselayers) {
                        if (map.hasLayer(maplayers.baselayers[i])) {
                            map.removeLayer(maplayers.baselayers[i]);
                        }//end if
                    }//next

                    map.addLayer(maplayers.baselayers[key]);
                });
            });            
            evt.preventDefault();
            
        }//end change baseLayer

        //Helper Methods
        private init() {
            this.leafletData.getMap().then((map: any) => {
                this.leafletData.getLayers().then((maplayers: any) => {
                    for (var key in maplayers.baselayers) {
                        if (map.hasLayer(maplayers.baselayers[key])) {
                            this.baselayer = key;
                            return;
                        }//end if
                    }//next
                });//end getLayers
            });//end getMap   

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
        templateUrl = 'Directives/legend.html';
        replace = true;

        link(scope: ng.IScope, element: ng.IAugmentedJQuery, attributes: IwimLegendAttributes, controller: ILayerController): void {
            //this is where we can register listeners, set up watches, and add functionality. 
            // The result of this process is why the live data- binding exists between the scope and the DOM tree.

            var leafletScope = controller.getLeafletScope();
            var layers = leafletScope.layers;

            element.bind('click', function (e) {
                    e.stopPropagation();
            });

            (<any>scope).layers = layers;
           
        }//end link

    }//end UrlDirective

    angular.module('wim_angular')
        .directive('wimLegend', wimLegend.instance);
}//end module 