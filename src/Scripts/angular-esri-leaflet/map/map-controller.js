/**
 * Created by dann6343 on 8/8/14.
 */
(function() {
    var module = angular.module('esri-map-module', ["leaflet-directive"]);


    module.controller("MapCtrl", ['$scope', '$http', '$q', 'AppData', 'leafletData', function($scope, $http, $q, AppData, leafletData){
        var mapCtrl = this;

        mapCtrl.baseLayer = null;

        mapCtrl.layers = [];
        // Layer Control
        mapCtrl.layerControl = null;

        if ($scope.mapCenter){
            leafletData.getMap().then(function(map) {
                map.setView($scope.mapCenter, $scope.zoomLevel);
                map.invalidateSize();
            });
        }

        if($scope.showLayerControl) {
            leafletData.getMap().then(function(map) {
               mapCtrl.layerControl = L.control.layers(null, null,{position:$scope.layerControlPosition}).addTo(map);

                for (var i = 0; i < mapCtrl.layers.length; i++) {
                    var obj = mapCtrl.layers[i];
                    mapCtrl.layerControl.addOverlay(obj.layer, obj.name);
                }
            });
        }

        // For now I am adding a custom baselayer and then removing it to keep the leaflet directive from adding it's own anonymous baselayer.
        // TODO: Extend the directive to not add a default base layer.
        /*angular.extend($scope, {
           layers: {
               baselayers:{
                   topo: {
                       name: "World Topographic",
                       type: "dynamic",
                       url: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",
                       visible: false,
                       layerOptions: {
                           layers: [0],
                           opacity: 0.9,
                           attribution: "Copyright:© 2014 Esri, FAO, NOAA"
                       }
                   }
               }
           }
        });*/
        //delete $scope.layers.baselayers['topo'];

        this.setBasemapLayer = function(strLayerName) {
            leafletData.getMap().then(function(map) {
                if ( mapCtrl.baseLayer ){
                    map.removeLayer(mapCtrl.baseLayer);
//                    if ( mapCtrl.layerControl ){
//                        mapCtrl.layerControl.removeLayer(mapCtrl.baseLayer);
//                    }
                } else {
                    // this is the first time the base layer has been set.  Check for and remove any the unwanted openstreetmap layer at this point.
                    var streetLayer = null;
                    map.eachLayer( function (layer) {
                        if(layer._url.indexOf("openstreetmap.org") > -1){
                            streetLayer = layer;
                        }
                    });
                    if (streetLayer){
                        map.removeLayer(streetLayer);
                    }
                }
                mapCtrl.baseLayer = L.esri.basemapLayer(strLayerName);
                mapCtrl.baseLayer.addTo(map);//'Streets'
//                if ( mapCtrl.layerControl ){
//                    mapCtrl.layerControl.addBaseLayer(mapCtrl.baseLayer, strLayerName);
//                }
            });
        };

        this.addTiledMapLayer = function(layerUrl, options) {
            leafletData.getMap().then(function(map) {
               var tiledLayer = L.esri.tiledMapLayer(layerUrl, options).addTo(map);

                if ($scope.showLayerControl){
                    var layerName = options.name;
                    $scope.addLayerToLayerControl(tiledLayer, layerName);
                }
            });
        }

        this.addDynamicMapLayer = function(layerUrl, options) {
            leafletData.getMap().then(function(map) {
                var dynLayer = L.esri.dynamicMapLayer(layerUrl, options).addTo(map);

                if ($scope.showLayerControl){
                    var layerName = options.name;
                    $scope.addLayerToLayerControl(dynLayer, layerName);
                }
            });
        }

        this.addFeatureLayer = function(layerUrl, options) {
            var deferred = $q.defer();

            leafletData.getMap().then(function(map) {

                var featureLayer = L.esri.featureLayer(layerUrl, options).addTo(map);


                if(options.popupTemplate) {
                    featureLayer.bindPopup(function(feature) {
                       return L.Util.template(options.popupTemplate, feature.properties);
                    });
                }

                if ($scope.showLayerControl){
                    var layerName = options.name;
                    $scope.addLayerToLayerControl(featureLayer, layerName);
                }

                deferred.resolve(featureLayer);
            });

            return deferred.promise;
        }

        this.addClusterLayer = function(layerUrl, options) {
            leafletData.getMap().then(function(map) {

                var clusterLayer = L.esri.clusteredFeatureLayer(layerUrl, options).addTo(map);

                if ($scope.showLayerControl) {
                    var layerName = options.name;
                    $scope.addLayerToLayerControl(clusterLayer, layerName);
                }
            });
        }

        this.addGeocoder = function(options) {
            leafletData.getMap().then(function(map) {
                var searchControl;

                searchControl = new L.esri.Controls.Geosearch(options).addTo(map);


                // create an empty layer group to store the results and add it to the map
                var results = new L.LayerGroup().addTo(map);

                // listen for the results event and add every result to the map
                searchControl.on("results", function(data){
                    results.clearLayers();
                    for (var i = data.results.length - 1; i >= 0; i--) {
                        results.addLayer(L.marker(data.results[i].latlng));
                    };
                });
            });
        }

        $scope.addLayerToLayerControl = function(layer, layerName){
            if(!layerName){
                //try to get the name from metadata
                layer.metadata(function (error, metadata){
                    if (metadata) {
                        layerName = metadata.name;
                    }

                    if (!layerName) {
                        layerName = "Layer " + (mapCtrl.layers.length + 1);
                    }

                    if ( mapCtrl.layerControl ){
                        mapCtrl.layerControl.addOverlay(layer, layerName);
                    } else {
                        mapCtrl.layers.push({name:layerName, layer:layer});
                    }
                });
            } else {
                if ( mapCtrl.layerControl ){
                    mapCtrl.layerControl.addOverlay(layer, layerName);
                } else {
                    mapCtrl.layers.push({name:layerName, layer:layer});
                }
            }
        }

        /*$scope.$on("map.click", function(event, e) {
         console.log("broadcast", event, e);
         });*/

    }]);




})();