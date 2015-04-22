/**
 * Created by dann6343 on 8/27/14.
 */
(function() {
    var app = angular.module('esri-map-module');

    app.directive('esriGeocoder', function(){
        return {
            require: '^esriMap',
            restrict: 'E',
            transclude: true,
            scope: {
                position: "@",
                url: "@"
            },
            link: function(scope, element, attrs, mapCtrl){
                var options = {};
                if (scope.position){
                    options.position = scope.position;
                }
                if (scope.url){
                    options.url = scope.url;
                }
                mapCtrl.addGeocoder(options);
            },
            template: "<div></div>"
        };
    });


})();