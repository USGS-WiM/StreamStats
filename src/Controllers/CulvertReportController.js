var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use strict';
        var Center = (function () {
            function Center(lt, lg, zm) {
                this.lat = lt;
                this.lng = lg;
                this.zoom = zm;
            }
            return Center;
        }());
        var CulvertReportController = (function () {
            function CulvertReportController($scope, $analytics, $modalInstance, studyArea, StatisticsGroup, leafletData, regionService, modal) {
                var _this = this;
                this.regionService = regionService;
                this.modal = modal;
                this.disclaimer = "USGS Data Disclaimer: Unless otherwise stated, all data, metadata and related materials are considered to satisfy the quality standards relative to the purpose for which the data were collected. Although these data and associated metadata have been reviewed for accuracy and completeness and approved for release by the U.S. Geological Survey (USGS), no warranty expressed or implied is made regarding the display or utility of the data for other purposes, nor on all computer systems, nor shall the act of distribution constitute any such warranty." + '\n' +
                    "USGS Software Disclaimer: This software has been approved for release by the U.S. Geological Survey (USGS). Although the software has been subjected to rigorous review, the USGS reserves the right to update the software as needed pursuant to further analysis and review. No warranty, expressed or implied, is made by the USGS or the U.S. Government as to the functionality of the software and related material nor shall the fact of release constitute any such warranty. Furthermore, the software is released on condition that neither the USGS nor the U.S. Government shall be held liable for any damages resulting from its authorized or unauthorized use." + '\n' +
                    "USGS Product Names Disclaimer: Any use of trade, firm, or product names is for descriptive purposes only and does not imply endorsement by the U.S. Government." + '\n\n';
                this.markers = null;
                this.overlays = null;
                this.center = null;
                this.layers = null;
                this.geojson = null;
                this.isExceedanceTableOpen = false;
                this.isFlowTableOpen = false;
                this.SSServicesVersion = '1.2.22';
                this._graphData = {
                    data: {},
                    options: {}
                };
                $scope.vm = this;
                this.angulartics = $analytics;
                this.studyAreaService = studyArea;
                this.nssService = StatisticsGroup;
                this.leafletData = leafletData;
                this.reportTitle = 'StreamStats Report';
                this.reportComments = 'Some comments here';
                this.AppVersion = configuration.version;
                this.environment = configuration.environment;
                this.selectedTabName = "10-yr Flow";
                this.initMap();
                $scope.$on('leafletDirectiveMap.reportMap.load', function (event, args) {
                    _this.showFeatures();
                });
                this.close = function () {
                    $modalInstance.dismiss('cancel');
                };
                this.print = function () {
                    window.print();
                };
                this.NSSServicesVersion = this.studyAreaService.NSSServicesVersion;
            }
            Object.defineProperty(CulvertReportController.prototype, "showReport", {
                get: function () {
                    if (!this.studyAreaService.studyAreaParameterList)
                        return false;
                    for (var i = 0; i < this.studyAreaService.studyAreaParameterList.length; i++) {
                        var param = this.studyAreaService.studyAreaParameterList[i];
                        if (param.value && param.value >= 0)
                            return true;
                    }
                    return false;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CulvertReportController.prototype, "GraphData", {
                get: function () {
                    return this._graphData;
                },
                enumerable: false,
                configurable: true
            });
            CulvertReportController.prototype.selectCulvertTab = function (tabname) {
                if (this.selectedTabName == tabname)
                    return;
                this.selectedTabName = tabname;
            };
            CulvertReportController.prototype.initMap = function () {
                this.center = new Center(39, -96, 4);
                this.layers = {
                    baselayers: configuration.basemaps,
                    overlays: {}
                };
                this.geojson = {};
                L.Icon.Default.imagePath = 'images';
                this.defaults = {
                    scrollWheelZoom: false,
                    touchZoom: false,
                    doubleClickZoom: false,
                    boxZoom: false,
                    keyboard: false
                };
            };
            CulvertReportController.prototype.showFeatures = function () {
                var _this = this;
                if (!this.studyAreaService.selectedStudyArea)
                    return;
                this.overlays = {};
                this.studyAreaService.selectedStudyArea.FeatureCollection.features.forEach(function (item) {
                    _this.addGeoJSON(item.id, item);
                });
                if (this.studyAreaService.selectedGage && this.studyAreaService.selectedGage.hasOwnProperty('Latitude_DD') && this.studyAreaService.selectedGage.hasOwnProperty('Longitude_DD')) {
                    var gagePoint = {
                        type: "Feature",
                        geometry: {
                            coordinates: [
                                this.studyAreaService.selectedGage["Latitude_DD"],
                                this.studyAreaService.selectedGage["Longitude_DD"]
                            ],
                            type: "Point"
                        }
                    };
                    this.addGeoJSON('referenceGage', gagePoint);
                }
                var bbox = this.studyAreaService.selectedStudyArea.FeatureCollection.bbox;
                this.leafletData.getMap("reportMap").then(function (map) {
                    map.invalidateSize();
                    map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
                });
            };
            CulvertReportController.prototype.addGeoJSON = function (LayerName, feature) {
                this.layers.overlays[LayerName] = {
                    name: LayerName,
                    type: 'geoJSONShape',
                    data: feature,
                    visible: false,
                    layerOptions: {
                        style: {
                            fillColor: "red",
                            color: 'red'
                        }
                    }
                };
            };
            CulvertReportController.$inject = ['$scope', '$analytics', '$modalInstance', 'StreamStats.Services.StudyAreaService', 'leafletData', 'StreamStats.Services.nssService', 'StreamStats.Services.RegionService', 'StreamStats.Services.ModalService'];
            return CulvertReportController;
        }());
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.CulvertReportController', CulvertReportController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
