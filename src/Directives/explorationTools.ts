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
    interface IexplorationToolsScope extends ng.IScope {
        vm: IexplorationToolsController;
    }
    interface IexplorationToolsController {
        //overlays: IwimLegendLayerGroup;
        //baselayers: IwimLegendLayerGroup;

    }
    interface IwimLegendLayerGroup {
        //selectedlayerName: string;
        //layergroup: any;
        //isOpen: boolean;

    }

    interface IwimLegendAttributes extends ng.IAttributes {
        //must use camelcase
        stopEvents: string;
    }

    class wimLegendController extends WiM.Services.HTTPServiceBase implements IexplorationToolsController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        //private safeApply: any;
        //private isDefined: any;
        private leafletHelpers: any;
        private leafletData: any;
        //public overlays: IwimLegendLayerGroup;
        //public baselayers: IwimLegendLayerGroup;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', '$element', '$sce', 'leafletData', 'leafletHelpers'];
        constructor($scope: IexplorationToolsScope, $http: ng.IHttpService, $element, $sce: ng.ISCEService, leafletData: any, leafletHelpers: any) {

            super($http, '');
            $scope.vm = this;
            this.leafletData = leafletData;
            this.leafletHelpers = leafletHelpers;
            this.init();

        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-


        //Helper Methods
        private init() {


        }//end init

    }//end wimLayerControlController class

    class explorationTools implements ng.IDirective {
        static instance(): ng.IDirective {
            return new explorationTools;
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
        transclude = false;
        controller = wimLegendController;
        templateUrl = 'Views/Exploration/exploration.html';
        replace = true;

        link(scope: ng.IScope, element: ng.IAugmentedJQuery, attributes: IwimLegendAttributes, controller: any): void {
            //this is where we can register listeners, set up watches, and add functionality. 
            // The result of this process is why the live data- binding exists between the scope and the DOM tree.

            var leafletScope = controller.getLeafletScope();
            var layers = leafletScope.layers;
            //(<any>scope).vm.overlays.layergroup = layers.overlays;
            //(<any>scope).vm.baselayers.layergroup = layers.baselayers;
            //(<any>scope).vm.layers = layers;

            element.bind('click', function (e) {
                e.stopPropagation();
            });

        }//end link

    }//end UrlDirective

    angular.module('wim_angular')
        .directive('explorationTools', explorationTools.instance);
}//end module 