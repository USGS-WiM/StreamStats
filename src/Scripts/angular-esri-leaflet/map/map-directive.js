/**
 * Created by dann6343 on 8/8/14.
 */
(function () {
    var module = angular.module('esri-map-module');

    module.directive('esriMap', function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                mapCenter: "=",
                zoomLevel: "@",
                showLayerControl: "@",
                layerControlPosition: "@",
                defaults: "="
            },
            controller: 'MapCtrl',
            templateUrl: '/MapApp/components/map/esri-map.html',
            link: function(scope, element, attributes){}
        };
    });


})();