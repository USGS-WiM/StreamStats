//------------------------------------------------------------------------------
//----- ReportrController ------------------------------------------------------
//------------------------------------------------------------------------------
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2014 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//   purpose:  
//discussion:   Controllers are typically built to reflect a View. 
//              and should only contailn business logic needed for a single view. For example, if a View 
//              contains a ListBox of objects, a Selected object, and a Save button, the Controller 
//              will have an ObservableCollection ObectList, 
//              Model SelectedObject, and SaveCommand.
//Comments
//04.14.2015 jkn - Created
//Imports"
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use strinct';
        var Center = (function () {
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function Center(lt, lg, zm) {
                this.lat = lt;
                this.lng = lg;
                this.zoom = zm;
            }
            return Center;
        })();
        var ReportController = (function () {
            function ReportController($scope, $modalInstance, studyArea, leafletData) {
                var _this = this;
                this.markers = null;
                this.geojson = null;
                this.center = null;
                this.layers = null;
                $scope.vm = this;
                this.studyAreaService = studyArea;
                this.leafletData = leafletData;
                this.reportTitle = 'Report Title';
                this.reportComments = 'Some comments here';
                this.initMap();
                $scope.$on('leafletDirectiveMap.load', function (event, args) {
                    console.log('report map load');
                    _this.showFeatures();
                });
                this.close = function () {
                    $modalInstance.dismiss('cancel');
                };
                this.print = function () {
                    window.print();
                };
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ReportController.prototype.initMap = function () {
                this.center = new Center(39, -96, 4);
                this.layers = {
                    baselayers: configuration.basemaps,
                    geojson: this.geojson
                };
                this.geojson = {};
                L.Icon.Default.imagePath = 'images';
            };
            ReportController.prototype.showFeatures = function () {
                var _this = this;
                if (!this.studyAreaService.selectedStudyArea)
                    return;
                this.geojson = {};
                this.studyAreaService.selectedStudyArea.Features.forEach(function (item) {
                    console.log('in each loop', item.name);
                    if (item.name == 'globalwatershed') {
                        _this.geojson[item.name] = {
                            data: item.feature,
                            style: {
                                fillColor: "yellow",
                                weight: 2,
                                opacity: 1,
                                color: 'white',
                                fillOpacity: 0.5
                            }
                        };
                        var bbox = _this.geojson['globalwatershed'].data.features[0].bbox;
                        _this.leafletData.getMap().then(function (map) {
                            //method to reset the map for modal weirdness
                            map.invalidateSize();
                            console.log('in getmap: ', bbox);
                            map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
                        });
                    }
                    if (item.name == 'globalwatershedpoint') {
                        _this.geojson[item.name] = {
                            data: item.feature
                        };
                    }
                    if (item.name == 'regulatedWatershed') {
                        console.log('showing regulated watershed');
                        _this.geojson[item.name] = {
                            data: item.feature,
                            style: {
                                fillColor: "red",
                                weight: 2,
                                opacity: 1,
                                color: 'white',
                                fillOpacity: 0.5
                            }
                        };
                    }
                });
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            ReportController.$inject = ['$scope', '$modalInstance', 'StreamStats.Services.StudyAreaService', 'leafletData'];
            return ReportController;
        })(); //end class
        angular.module('StreamStats.Controllers').controller('StreamStats.Controllers.ReportController', ReportController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module
//# sourceMappingURL=ReportController.js.map