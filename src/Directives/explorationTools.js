//------------------------------------------------------------------------------
//----- WiM Legend ------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
var WiM;
(function (WiM) {
    var Directives;
    (function (Directives) {
        'use string';
        var wimLegendController = (function (_super) {
            __extends(wimLegendController, _super);
            function wimLegendController($scope, $http, $element, $sce, leafletData, leafletHelpers) {
                _super.call(this, $http, '');
                $scope.vm = this;
                this.leafletData = leafletData;
                this.leafletHelpers = leafletHelpers;
                this.init();
            }
            //Methods  
            //-+-+-+-+-+-+-+-+-+-+-+-
            //Helper Methods
            wimLegendController.prototype.init = function () {
            }; //end init
            //public overlays: IwimLegendLayerGroup;
            //public baselayers: IwimLegendLayerGroup;
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            wimLegendController.$inject = ['$scope', '$http', '$element', '$sce', 'leafletData', 'leafletHelpers'];
            return wimLegendController;
        })(WiM.Services.HTTPServiceBase); //end wimLayerControlController class
        var explorationTools = (function () {
            function explorationTools() {
                //create isolated scope
                this.scope = {
                    icons: '=?',
                    autoHideOpacity: '=?',
                    showGroups: '=?',
                    title: '@',
                    baseTitle: '@',
                    overlaysTitle: '@',
                };
                this.restrict = 'E';
                this.require = '^leaflet';
                this.transclude = false;
                this.controller = wimLegendController;
                this.templateUrl = 'Views/Exploration/exploration.html';
                this.replace = true;
            }
            explorationTools.instance = function () {
                return new explorationTools;
            };
            explorationTools.prototype.link = function (scope, element, attributes, controller) {
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
            }; //end link
            return explorationTools;
        })(); //end UrlDirective
        angular.module('wim_angular').directive('explorationTools', explorationTools.instance);
    })(Directives = WiM.Directives || (WiM.Directives = {}));
})(WiM || (WiM = {})); //end module 
//# sourceMappingURL=explorationTools.js.map