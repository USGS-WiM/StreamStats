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
            function ReportController($scope, $analytics, $modalInstance, studyArea, StatisticsGroup, leafletData) {
                var _this = this;
                this.markers = null;
                this.overlays = null;
                this.center = null;
                this.layers = null;
                $scope.vm = this;
                this.angulartics = $analytics;
                this.studyAreaService = studyArea;
                this.nssService = StatisticsGroup;
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
                    overlays: {}
                };
                L.Icon.Default.imagePath = 'images';
            };
            ReportController.prototype.showFeatures = function () {
                var _this = this;
                if (!this.studyAreaService.selectedStudyArea)
                    return;
                this.overlays = {};
                this.studyAreaService.selectedStudyArea.Features.forEach(function (item) {
                    console.log('in each loop', item.name);
                    if (item.name == 'globalwatershed') {
                        _this.layers.overlays[item.name] = {
                            name: 'Basin Boundary',
                            type: 'geoJSONShape',
                            data: item.feature,
                            visible: true,
                            layerOptions: {
                                style: {
                                    fillColor: "yellow",
                                    weight: 2,
                                    opacity: 1,
                                    color: 'white',
                                    fillOpacity: 0.5
                                }
                            }
                        };
                        var bbox = _this.layers.overlays[item.name].data.features[0].bbox;
                        _this.leafletData.getMap().then(function (map) {
                            //method to reset the map for modal weirdness
                            map.invalidateSize();
                            console.log('in getmap: ', bbox);
                            map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
                            //map.dragging.disable();
                            map.touchZoom.disable();
                            map.doubleClickZoom.disable();
                            map.scrollWheelZoom.disable();
                            map.boxZoom.disable();
                            map.keyboard.disable();
                            if (map.tap)
                                map.tap.disable();
                        });
                    }
                    if (item.name == 'globalwatershedpoint') {
                        _this.layers.overlays[item.name] = {
                            name: 'Basin Clicked Point',
                            type: 'geoJSONShape',
                            data: item.feature,
                            visible: true,
                        };
                    }
                    if (item.name == 'regulatedWatershed') {
                        console.log('showing regulated watershed');
                        _this.layers.overlays["globalwatershedregulated"] = {
                            name: 'Basin Boundary (Regulated Area)',
                            type: 'geoJSONShape',
                            data: item.feature,
                            visible: true,
                            layerOptions: {
                                style: {
                                    fillColor: "red",
                                    weight: 2,
                                    opacity: 1,
                                    color: 'white',
                                    fillOpacity: 0.5
                                }
                            }
                        };
                    }
                });
            };
            ReportController.prototype.downloadCSV = function () {
                var _this = this;
                //ga event
                this.angulartics.eventTrack('Download', { category: 'Report', label: 'CSV' });
                var filename = 'data.csv';
                var processParameterTable = function (data) {
                    var finalVal = '\n\nParameters\n';
                    if (_this.studyAreaService.isRegulated)
                        finalVal += 'Name,Value,Reglated Value, Unregulated Value, Unit\n';
                    else
                        finalVal += 'Name,Value,Unit\n';
                    data.forEach(function (item) {
                        if (_this.studyAreaService.isRegulated)
                            finalVal += item.name + ',' + item.value + ',' + item.unRegulatedValue.toFixed(2) + ',' + item.regulatedValue.toFixed(2) + ',' + item.unit + '\n';
                        else
                            finalVal += item.name + ',' + item.value + ',' + item.unit + '\n';
                    });
                    return finalVal + '\n';
                };
                var processScenarioParamTable = function (statGroup) {
                    var finalVal = statGroup.Name + ' Parameters\n';
                    finalVal += 'Name,Value,Min Limit, Max Limit\n';
                    statGroup.RegressionRegions[0].Parameters.forEach(function (item) {
                        finalVal += item.Name + ',' + item.Value + ',' + item.Limits.Min.toFixed(2) + ',' + item.Limits.Max.toFixed(2) + '\n';
                    });
                    return finalVal + '\n';
                };
                var processScenarioFlowTable = function (statGroup) {
                    var finalVal = statGroup.Name + ' Flow Report\n';
                    finalVal += 'Name,Value,Unit,Prediction Error\n';
                    statGroup.Results.forEach(function (item) {
                        finalVal += item.Name + ',' + item.Value.toFixed(0) + ',' + item.Unit.Abbr + ',' + '' + '\n';
                    });
                    return finalVal + '\n';
                };
                var csvFile = 'State/Region ID,' + this.studyAreaService.selectedStudyArea.RegionID.toUpperCase() + '\nWorkspace ID,' + this.studyAreaService.selectedStudyArea.WorkspaceID + '\nLatitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toFixed(5) + '\nLongitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toFixed(5) + '\nTime,' + this.studyAreaService.selectedStudyArea.Date.toLocaleString();
                //process parametertable
                csvFile += processParameterTable(this.studyAreaService.studyAreaParameterList);
                this.nssService.selectedStatisticsGroupList.forEach(function (statGroup) {
                    csvFile += processScenarioParamTable(statGroup);
                    csvFile += processScenarioFlowTable(statGroup);
                });
                var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, filename);
                }
                else {
                    var link = document.createElement("a");
                    var url = URL.createObjectURL(blob);
                    if (link.download !== undefined) {
                        // Browsers that support HTML5 download attribute
                        link.setAttribute("href", url);
                        link.setAttribute("download", filename);
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                    else {
                        window.open(url);
                    }
                }
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            ReportController.$inject = ['$scope', '$analytics', '$modalInstance', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'leafletData'];
            return ReportController;
        })(); //end class
        angular.module('StreamStats.Controllers').controller('StreamStats.Controllers.ReportController', ReportController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module
//# sourceMappingURL=ReportController.js.map