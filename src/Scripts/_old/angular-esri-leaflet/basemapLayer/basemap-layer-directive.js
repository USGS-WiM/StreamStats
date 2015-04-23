/**
 * Created by dann6343 on 8/18/14.
 */
(function() {
    var app = angular.module('esri-map-module');

    app.directive('esriBasemapLayer', function(){
        return {
            require: '^esriMap',
            restrict: 'E',
            transclude: true,
            scope: {
              layerName: '@'
            },
            link: function(scope, element, attrs, mapCtrl){
              mapCtrl.setBasemapLayer(scope.layerName);

                attrs.$observe("layerName" ,function(value){
                    if(value) {
                        mapCtrl.setBasemapLayer(value);
                    }

                });
            },
            template: '<div ng-transclude></div>'
        };
    });


})();