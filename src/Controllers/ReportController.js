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
        }());
        var ReportController = (function () {
            function ReportController($scope, $analytics, $modalInstance, studyArea, StatisticsGroup, leafletData, regionService) {
                var _this = this;
                this.regionService = regionService;
                this.markers = null;
                this.overlays = null;
                this.center = null;
                this.layers = null;
                $scope.vm = this;
                this.angulartics = $analytics;
                this.studyAreaService = studyArea;
                this.nssService = StatisticsGroup;
                this.leafletData = leafletData;
                this.reportTitle = 'StreamStats Report';
                this.reportComments = 'Some comments here';
                this.initMap();
                $scope.$on('leafletDirectiveMap.reportMap.load', function (event, args) {
                    //console.log('report map load');
                    _this.showFeatures();
                });
                this.close = function () {
                    $modalInstance.dismiss('cancel');
                };
                this.print = function () {
                    window.print();
                };
                this.getPercentWeights();
            }
            Object.defineProperty(ReportController.prototype, "showReport", {
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
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ReportController.prototype, "showRegulation", {
                get: function () {
                    if (this.regionService.selectedRegion.Applications.indexOf("RegulationFlows") > -1)
                        return true;
                    else
                        return false;
                },
                enumerable: true,
                configurable: true
            });
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ReportController.prototype.initMap = function () {
                this.center = new Center(39, -96, 4);
                this.layers = {
                    baselayers: this.studyAreaService.baseMap,
                    overlays: {}
                };
                L.Icon.Default.imagePath = 'images';
                this.defaults = {
                    scrollWheelZoom: false,
                    touchZoom: false,
                    doubleClickZoom: false,
                    boxZoom: false,
                    keyboard: false
                };
            };
            ReportController.prototype.getPercentWeights = function () {
                var _this = this;
                this.nssService.selectedStatisticsGroupList.forEach(function (statGroup) {
                    //console.log('here1', statGroup)
                    statGroup.RegressionRegions.forEach(function (regRegion) {
                        //console.log('here2', regRegion)
                        _this.studyAreaService.selectedStudyArea.RegressionRegions.forEach(function (percentOverlay) {
                            //console.log('here3', percentOverlay)
                            if (percentOverlay.code.indexOf(regRegion.Code.toUpperCase()) > -1) {
                                _this.areaSQMI = percentOverlay.maskareasqmeter * 0.000000386102159;
                            }
                        });
                    });
                });
            };
            ReportController.prototype.showFeatures = function () {
                var _this = this;
                if (!this.studyAreaService.selectedStudyArea)
                    return;
                this.overlays = {};
                this.studyAreaService.selectedStudyArea.Features.forEach(function (item) {
                    //console.log('in each loop', item.name);
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
                        _this.leafletData.getMap("reportMap").then(function (map) {
                            //method to reset the map for modal weirdness
                            map.invalidateSize();
                            //console.log('in getmap: ', bbox);
                            map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
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
                        //console.log('showing regulated watershed');
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
                    if (_this.studyAreaService.selectedStudyArea.Disclaimers['isRegulated'])
                        finalVal += 'Name,Value,Reglated Value, Unregulated Value, Unit\n';
                    else
                        finalVal += 'Parameter Code,Parameter Name,Value,Unit\n';
                    data.forEach(function (item) {
                        if (_this.studyAreaService.selectedStudyArea.Disclaimers['isRegulated'])
                            finalVal += item.code + ',' + item.name + ',' + item.value + ',' + item.unRegulatedValue.toFixed(2) + ',' + item.regulatedValue.toFixed(2) + ',' + item.unit + '\n';
                        else
                            finalVal += item.code + ',' + item.description + ',' + item.value + ',' + item.unit + '\n';
                    });
                    return finalVal + '\n';
                };
                var processScenarioParamTable = function (statGroup) {
                    var finalVal = '';
                    statGroup.RegressionRegions.forEach(function (regressionRegion) {
                        console.log('regression regions loop: ', regressionRegion);
                        //bail if in Area-Averaged section
                        if (regressionRegion.Name == 'Area-Averaged')
                            return;
                        var regionPercent = 'n/a';
                        if (regressionRegion.PercentWeight)
                            regionPercent = regressionRegion.PercentWeight.toFixed(0) + ' Percent ';
                        finalVal += statGroup.Name + ' Parameters, ' + regionPercent + regressionRegion.Name.split("_").join(" ") + '\n';
                        finalVal += 'Parameter Code,Parameter Name,Value,Min Limit, Max Limit\n';
                        if (regressionRegion.Parameters) {
                            regressionRegion.Parameters.forEach(function (item) {
                                console.log('here', item);
                                var limitMin = 'n/a';
                                var limitMax = 'n/a';
                                if (item.Limits) {
                                    limitMin = item.Limits.Min.toFixed(2);
                                    limitMax = item.Limits.Max.toFixed(2);
                                }
                                finalVal += item.Code + ',' + item.Name + ',' + item.Value + ',' + limitMin + ',' + limitMax + '\n';
                            });
                        }
                    });
                    return finalVal + '\n';
                };
                var processDisclaimers = function (statGroup) {
                    //console.log('Process disclaimers statGroup: ', statGroup);
                    var finalVal = '*** ' + statGroup.Name + ' Disclaimers ***\n';
                    angular.forEach(statGroup.Disclaimers, function (i, v) {
                        finalVal += v + ',' + i + '\n';
                    });
                    return finalVal + '\n';
                };
                var processScenarioFlowTable = function (statGroup) {
                    //console.log('ScenarioFlowTable statGroup: ', statGroup);
                    var finalVal = '';
                    statGroup.RegressionRegions.forEach(function (regressionRegion) {
                        console.log('ScenarioFlowTable regressionRegion: ', regressionRegion);
                        if (regressionRegion.Results) {
                            var regionPercent = 'n/a';
                            if (regressionRegion.PercentWeight)
                                regionPercent = regressionRegion.PercentWeight.toFixed(0) + ' Percent ';
                            finalVal += statGroup.Name + ' Flow Report, ' + regionPercent + regressionRegion.Name.split("_").join(" ") + '\n';
                            var errorName = 'Error';
                            if (regressionRegion.Results[0].Errors)
                                errorName = regressionRegion.Results[0].Errors[0].Name;
                            finalVal += 'Statistic,Value,Unit,' + errorName + ',Lower Prediction Interval,Upper Prediction Interval\n';
                            regressionRegion.Results.forEach(function (item) {
                                //console.log('ScenarioFlowTable regressionRegion item: ', item);
                                var unit = '';
                                if (item.Unit)
                                    unit = item.Unit.Abbr;
                                var errors = '--';
                                if (item.Errors)
                                    errors = item.Errors[0].Value;
                                var lowerPredictionInterval = '--';
                                if (item.IntervalBounds && item.IntervalBounds.Lower)
                                    lowerPredictionInterval = item.IntervalBounds.Lower.toUSGSvalue();
                                var upperPredictionInterval = '--';
                                if (item.IntervalBounds && item.IntervalBounds.Upper)
                                    upperPredictionInterval = item.IntervalBounds.Upper.toUSGSvalue();
                                finalVal += item.Name + ',' + item.Value.toUSGSvalue() + ',' + unit + ',' + errors + ',' + lowerPredictionInterval + ',' + upperPredictionInterval + '\n';
                            });
                        }
                    });
                    return finalVal + '\n';
                };
                var csvFile = 'StreamStats Output Report\n\n' + 'State/Region ID,' + this.studyAreaService.selectedStudyArea.RegionID.toUpperCase() + '\nWorkspace ID,' + this.studyAreaService.selectedStudyArea.WorkspaceID + '\nLatitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toFixed(5) + '\nLongitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toFixed(5) + '\nTime,' + this.studyAreaService.selectedStudyArea.Date.toLocaleString();
                //process parametertable
                csvFile += processParameterTable(this.studyAreaService.studyAreaParameterList);
                this.nssService.selectedStatisticsGroupList.forEach(function (statGroup) {
                    csvFile += processScenarioParamTable(statGroup);
                    if (statGroup.Disclaimers.Warnings || statGroup.Disclaimers.Errors)
                        csvFile += processDisclaimers(statGroup);
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
            ReportController.prototype.downloadGeoJSON = function () {
                var GeoJSON = angular.toJson(this.studyAreaService.selectedStudyArea.Features[1].feature);
                var filename = 'data.geojson';
                var blob = new Blob([GeoJSON], { type: 'text/csv;charset=utf-8;' });
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
            ReportController.prototype.downloadPDF = function () {
                var pdf = new jsPDF('p', 'pt', 'letter');
                // source can be HTML-formatted string, or a reference
                // to an actual DOM element from which the text will be scraped.
                //var source = $('#customers')[0];
                //var source = angular.element(document.getElementById('printArea'));
                var source = document.getElementById('printArea').innerHTML;
                //console.log(source);
                // we support special element handlers. Register them with jQuery-style 
                // ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
                // There is no support for any other type of selectors 
                // (class, of compound) at this time.
                var specialElementHandlers = {
                    // element with id of "bypass" - jQuery style selector
                    '#bypassme': function (element, renderer) {
                        // true = "handled elsewhere, bypass text extraction"
                        return true;
                    }
                };
                var margins = {
                    top: 80,
                    bottom: 60,
                    left: 40,
                    width: 522
                };
                // all coords and widths are in jsPDF instance's declared units
                // 'inches' in this case
                pdf.fromHTML(source, // HTML string or DOM elem ref.
                margins.left, // x coord
                margins.top, {
                    'width': margins.width,
                    'elementHandlers': specialElementHandlers
                }, function (dispose) {
                    // dispose: object with X, Y of the last line add to the PDF 
                    //          this allow the insertion of new lines after html
                    pdf.save('Test.pdf');
                }, margins);
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            ReportController.$inject = ['$scope', '$analytics', '$modalInstance', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'leafletData', 'StreamStats.Services.RegionService'];
            return ReportController;
        }()); //end class
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.ReportController', ReportController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module
//# sourceMappingURL=ReportController.js.map