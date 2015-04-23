/**
 * Created by dann6343 on 8/18/14.
 */
(function() {
    var app = angular.module('esri-map-module');

    app.directive('esriFeatureLayer', function(){
        return {
            require: '^esriMap',
            restrict: 'E',
            transclude: true,
            scope: {
                url: '@',
                featureIcon: '=',
                popupTemplate: '@',
                name: '@',
                where:'@'
            },
            link: function(scope, element, attrs, mapCtrl){
                var options = {};
                var layer = null;

                if ( scope.featureIcon){
                    console.log(typeof scope.featureIcon);
                    if (typeof scope.featureIcon == "string") {
                        options.pointToLayer = function (geojson, latlng) {
                            return L.marker(latlng, {
                                icon: L.icon({
                                    iconUrl: scope.featureIcon
                                })
                            })
                        };
                    } else {
                        options.pointToLayer = function (geojson, latlng) {
                            return L.marker(latlng, {
                                icon: L.icon(scope.featureIcon)
                            })
                        }
                    }
                }

                if (scope.popupTemplate){
                    options.popupTemplate = scope.popupTemplate;
                }

                options.name = scope.name;

                if(scope.where){
                    options.where = scope.where;
                }


//                if (scope.clusterPoints){
//                    options.clusterPoints = true;
//                }

                mapCtrl.addFeatureLayer(scope.url, options).then(function(featureLayer) {
                    layer = featureLayer;
                });

                attrs.$observe("where", function (value) {
                    if (value) {
                        //mapCtrl.updateWhere(scope.layer, value);
                        layer.setWhere(value);
                    }

                });


            },
            template: '<div ng-transclude></div>'
        };
    });


})();