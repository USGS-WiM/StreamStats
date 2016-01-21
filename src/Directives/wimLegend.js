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
            wimLegendController.prototype.initOverlays = function (mlyr) {
                if (mlyr.type != "agsDynamic")
                    return;
                //getsublayers
                var url = mlyr.url + "/legend?f=pjson";
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    console.log(response.data);
                    if (response.data.layers.length > 0) {
                        mlyr.layerArray = response.data.layers;
                    }
                }, function (error) {
                });
            };
            wimLegendController.prototype.changeBaseLayer = function (key, evt) {
                var _this = this;
                this.baselayers.selectedlayerName = key.toString();
                this.leafletData.getMap().then(function (map) {
                    _this.leafletData.getLayers().then(function (maplayers) {
                        if (map.hasLayer(maplayers.baselayers[key])) {
                            return;
                        }
                        for (var mlayr in maplayers.baselayers) {
                            if (map.hasLayer(maplayers.baselayers[mlayr])) {
                                map.removeLayer(maplayers.baselayers[mlayr]);
                            } //end if
                        }
                        map.addLayer(maplayers.baselayers[key]);
                    });
                });
                evt.preventDefault();
            }; //end change baseLayer
            //Helper Methods
            wimLegendController.prototype.init = function () {
                var _this = this;
                this.overlays = {};
                this.baselayers = {};
                this.overlays.isOpen = false;
                this.baselayers.isOpen = true;
                this.leafletData.getMap().then(function (map) {
                    _this.leafletData.getLayers().then(function (maplayers) {
                        for (var key in maplayers.baselayers) {
                            if (map.hasLayer(maplayers.baselayers[key])) {
                                _this.baselayers.selectedlayerName = key.toString();
                                break;
                            } //end if
                        }
                    }); //end getLayers
                    //remove legend
                }); //end getMap   
                //http://pastebin.com/k8z6ZkdX
            }; //end init
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            wimLegendController.$inject = ['$scope', '$http', '$element', '$sce', 'leafletData', 'leafletHelpers'];
            return wimLegendController;
        })(WiM.Services.HTTPServiceBase); //end wimLayerControlController class
        var wimLegend = (function () {
            function wimLegend() {
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
                this.templateUrl = 'Views/Legend/legend.html';
                this.replace = true;
            }
            wimLegend.instance = function () {
                return new wimLegend;
            };
            wimLegend.prototype.link = function (scope, element, attributes, controller) {
                //this is where we can register listeners, set up watches, and add functionality. 
                // The result of this process is why the live data- binding exists between the scope and the DOM tree.
                var leafletScope = controller.getLeafletScope();
                var layers = leafletScope.layers;
                scope.vm.overlays.layergroup = layers.overlays;
                scope.vm.baselayers.layergroup = layers.baselayers;
                scope.vm.layers = layers;
                element.bind('click', function (e) {
                    e.stopPropagation();
                });
            }; //end link
            return wimLegend;
        })(); //end UrlDirective
        angular.module('wim_angular').directive('wimLegend', wimLegend.instance);
    })(Directives = WiM.Directives || (WiM.Directives = {}));
})(WiM || (WiM = {})); //end module 
//# sourceMappingURL=wimLegend.js.map