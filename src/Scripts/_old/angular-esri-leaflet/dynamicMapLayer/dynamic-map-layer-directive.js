/**
 * Created by dann6343 on 8/18/14.
 */
(function() {
    var app = angular.module('esri-map-module');

    app.directive('esriDynamicLayer', function(){
        return {
            require: '^esriMap',
            restrict: 'E',
            transclude: true,
            scope: {
                url: '@',
                opacity:'@',
                name:'@',
                layerDefs:'='
            },
            link: function(scope, element, attrs, mapCtrl){
                var options = {};

                options.opacity = scope.opacity;
                options.name = scope.name;

                if(scope.layerDefs){
                    options.layerDefs = scope.layerDefs;
                }

                mapCtrl.addDynamicMapLayer(scope.url, options);
            },
            template: '<div ng-transclude></div>'
        };
    });


})();