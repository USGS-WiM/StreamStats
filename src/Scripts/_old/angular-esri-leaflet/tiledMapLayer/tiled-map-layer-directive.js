/**
 * Created by dann6343 on 9/4/14.
 */
(function() {
    var app = angular.module('esri-map-module');

    app.directive('esriTiledmapLayer', function(){
        return {
            require: '^esriMap',
            restrict: 'E',
            transclude: true,
            scope: {
                url: '@',
                opacity: '@',
                name: '@'
            },
            link: function(scope, element, attrs, mapCtrl){
                var options = {};

                options.opacity = scope.opacity;
                options.name = scope.name;

                mapCtrl.addTiledMapLayer(scope.url, options);
            },
            template: '<div ng-transclude></div>'
        };
    });


})();