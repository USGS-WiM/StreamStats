var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use strinct';
        var Center = (function () {
            function Center(lt, lg, zm) {
                this.lat = lt;
                this.lng = lg;
                this.zoom = zm;
            }
            return Center;
        }());
        var ReportController = (function () {
            function ReportController($scope, $analytics, $modalInstance, studyArea, StatisticsGroup, leafletData, regionService, modal) {
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
                this.extensions = this.ActiveExtensions;
                this.environment = configuration.environment;
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
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ReportController.prototype, "canShowDisclaimers", {
                get: function () {
                    if (this.studyAreaService.selectedStudyArea.Disclaimers == null)
                        return false;
                    var canshow = Object.keys(this.studyAreaService.selectedStudyArea.Disclaimers).length > 0;
                    return canshow;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ReportController.prototype, "showRegulation", {
                get: function () {
                    if (this.regionService.selectedRegion.Applications.indexOf("RegulationFlows") > -1)
                        return true;
                    else
                        return false;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ReportController.prototype, "ActiveExtensions", {
                get: function () {
                    if (this.studyAreaService.selectedStudyArea.NSS_Extensions && this.studyAreaService.selectedStudyArea.NSS_Extensions.length > 0)
                        return this.studyAreaService.selectedStudyArea.NSS_Extensions;
                    else
                        return null;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ReportController.prototype, "GraphData", {
                get: function () {
                    return this._graphData;
                },
                enumerable: false,
                configurable: true
            });
            ReportController.prototype.downloadCSV = function () {
                var _this = this;
                this.angulartics.eventTrack('Download', { category: 'Report', label: 'CSV' });
                var filename = 'data.csv';
                var processMainParameterTable = function (data) {
                    var finalVal = '\nBasin Characteristics\n';
                    finalVal += _this.tableToCSV($('#mainParamTable'));
                    return finalVal + '\n';
                };
                var processScenarioParamTable = function (statGroup) {
                    var finalVal = '\n';
                    statGroup.regressionRegions.forEach(function (regressionRegion) {
                        if (regressionRegion.name == 'Area-Averaged')
                            return;
                        var regionPercent = '';
                        if (regressionRegion.percentWeight)
                            regionPercent = regressionRegion.percentWeight.toFixed(1) + ' Percent ';
                        finalVal += statGroup.name + ' Parameters,' + regionPercent + regressionRegion.name.split("_").join(" ") + '\r\n';
                        finalVal += _this.tableToCSV($(document.getElementById(_this.camelize(statGroup.name + regressionRegion.name + 'ScenarioParamTable')))) + '\n';
                    });
                    return finalVal + '\n';
                };
                var processDisclaimers = function (statGroup) {
                    var finalVal = '*** ' + statGroup.name + ' Disclaimers ***\r\n';
                    angular.forEach(statGroup.disclaimer, function (i, v) {
                        finalVal += v + ',' + i + '\r\n';
                    });
                    return finalVal + '\r\n';
                };
                var processScenarioFlowTable = function (statGroup) {
                    var finalVal = '';
                    statGroup.regressionRegions.forEach(function (regressionRegion) {
                        if (regressionRegion.results) {
                            var regionPercent = '';
                            if (regressionRegion.percentWeight)
                                regionPercent = regressionRegion.percentWeight.toFixed(1) + ' Percent ';
                            finalVal += statGroup.name + ' Flow Report,' + regionPercent + regressionRegion.name.split("_").join(" ") + '\r\n';
                            if (regressionRegion.results[0].intervalBounds && regressionRegion.results[0].errors && regressionRegion.results[0].errors.length > 0)
                                finalVal +=
                                    '"PIl: Prediction Interval- Lower, PIu: Prediction Interval- Upper, SEp: Standard Error of Prediction, SE: Standard Error (other-- see report)"\r\n';
                            finalVal += _this.tableToCSV($(document.getElementById(_this.camelize(statGroup.name + regressionRegion.name + 'ScenarioFlowTable')))) + '\n';
                        }
                    });
                    return finalVal + '\n';
                };
                var csvFile = 'StreamStats Output Report\n\n' + 'State/Region ID,' + this.studyAreaService.selectedStudyArea.RegionID.toUpperCase() + '\nWorkspace ID,' + this.studyAreaService.selectedStudyArea.WorkspaceID + '\nLatitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toFixed(5) + '\nLongitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toFixed(5) + '\nTime,' + this.studyAreaService.selectedStudyArea.Date.toLocaleString() + '\n';
                if (this.nssService.selectedStatisticsGroupList.length > 1 || (this.extensions && this.extensions[0].code != 'QPPQ')) {
                    csvFile += processMainParameterTable(this.studyAreaService.studyAreaParameterList);
                }
                this.nssService.selectedStatisticsGroupList.forEach(function (statGroup) {
                    csvFile += processScenarioParamTable(statGroup);
                    if (statGroup.disclaimers && (statGroup.disclaimers.Warnings || statGroup.disclaimers.Errors))
                        csvFile += processDisclaimers(statGroup);
                    csvFile += processScenarioFlowTable(statGroup);
                });
                this.isExceedanceTableOpen = true;
                this.isFlowTableOpen = true;
                var self = this;
                setTimeout(function () {
                    var extVal = '';
                    if (self.extensions) {
                        for (var _i = 0, _a = self.extensions; _i < _a.length; _i++) {
                            var sc = _a[_i];
                            if (sc.code == 'QPPQ') {
                                extVal += sc.name += ' (' + sc.code + ')' + '\n';
                                for (var _b = 0, _c = sc.parameters; _b < _c.length; _b++) {
                                    var p = _c[_b];
                                    if (['sdate', 'edate'].indexOf(p.code) > -1) {
                                        var date = new Date(p.value);
                                        extVal += p.name + ':, ' + date.toLocaleDateString() + '\n';
                                    }
                                }
                                extVal += '\n';
                                extVal += self.tableToCSV($('#ReferanceGage'));
                                extVal += '\n\nExceedance Probabilities\n';
                                extVal += self.tableToCSV($('#exceedanceTable'));
                                extVal += '\n\nEstimated Flows\n';
                                extVal += self.tableToCSV($('#flowTable'));
                            }
                        }
                        csvFile += extVal + '\n\n';
                    }
                    csvFile += self.disclaimer + 'Application Version: ' + self.AppVersion;
                    if (self.SSServicesVersion)
                        csvFile += '\nStreamStats Services Version: ' + self.SSServicesVersion;
                    if (self.NSSServicesVersion)
                        csvFile += '\nNSS Services Version: ' + self.NSSServicesVersion;
                    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
                    if (navigator.msSaveBlob) {
                        navigator.msSaveBlob(blob, filename);
                    }
                    else {
                        var link = document.createElement("a");
                        var url = URL.createObjectURL(blob);
                        if (link.download !== undefined) {
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
                    this.isExceedanceTableOpen = false;
                    this.isFlowTableOpen = false;
                }, 300);
            };
            ReportController.prototype.downloadGeoJSON = function () {
                var _this = this;
                var fc = this.studyAreaService.selectedStudyArea.FeatureCollection;
                fc.features.forEach(function (f) {
                    f.properties["Name"] = _this.studyAreaService.selectedStudyArea.WorkspaceID;
                    if (f.id && f.id == "globalwatershed") {
                        f.properties = [f.properties, _this.studyAreaService.studyAreaParameterList.reduce(function (dict, param) { dict[param.code] = param.value; return dict; }, {})].reduce(function (r, o) {
                            Object.keys(o).forEach(function (k) { r[k] = o[k]; });
                            return r;
                        }, {});
                        f.properties["FlowStatistics"] = _this.nssService.selectedStatisticsGroupList;
                    }
                });
                var GeoJSON = angular.toJson(fc);
                var filename = 'data.geojson';
                var blob = new Blob([GeoJSON], { type: 'text/csv;charset=utf-8;' });
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, filename);
                }
                else {
                    var link = document.createElement("a");
                    var url = URL.createObjectURL(blob);
                    if (link.download !== undefined) {
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
            ReportController.prototype.downloadKML = function () {
                var _this = this;
                var fc = this.studyAreaService.selectedStudyArea.FeatureCollection;
                fc.features.forEach(function (f) {
                    f.properties["Name"] = _this.studyAreaService.selectedStudyArea.WorkspaceID;
                    if (f.id && f.id == "globalwatershed") {
                        f.properties = [f.properties, _this.studyAreaService.studyAreaParameterList.reduce(function (dict, param) { dict[param.code] = param.value; return dict; }, {})].reduce(function (r, o) {
                            Object.keys(o).forEach(function (k) { r[k] = o[k]; });
                            return r;
                        }, {});
                        f.properties["FlowStatistics"] = _this.nssService.selectedStatisticsGroupList;
                    }
                });
                var GeoJSON = JSON.parse(angular.toJson(fc));
                var filename = 'data.geojson';
                var kml = tokml(GeoJSON);
                var blob = new Blob([kml], { type: 'text/csv;charset=utf-8;' });
                var filename = 'data.kml';
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, filename);
                }
                else {
                    var link = document.createElement("a");
                    var url = URL.createObjectURL(blob);
                    if (link.download !== undefined) {
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
            ReportController.prototype.downloadShapeFile = function () {
                try {
                    var flowTable = null;
                    if (this.nssService.showFlowsTable)
                        flowTable = this.nssService.getflattenNSSTable(this.studyAreaService.selectedStudyArea.WorkspaceID);
                    var fc = this.studyAreaService.getflattenStudyArea();
                    var versionText = 'Application Version: ' + this.AppVersion;
                    if (this.SSServicesVersion)
                        versionText += '\nStreamStats Services Version: ' + this.SSServicesVersion;
                    if (this.NSSServicesVersion)
                        versionText += '\nNSS Services Version: ' + this.NSSServicesVersion;
                    shpwrite.download(fc, flowTable, this.disclaimer + versionText);
                }
                catch (e) {
                    console.log(e);
                }
            };
            ReportController.prototype.downloadPNG = function (graph) {
                var svg;
                var children = document.getElementById(graph).children;
                for (var i = 0; i < children.length; i++) {
                    if (children[i].tagName === 'svg') {
                        svg = children[i];
                    }
                }
                saveSvgAsPng(svg, graph + ".png");
            };
            ReportController.prototype.downloadPDF = function () {
                var pdf = new jsPDF('p', 'pt', 'letter');
                var source = document.getElementById('printArea').innerHTML;
                var specialElementHandlers = {
                    '#bypassme': function (element, renderer) {
                        return true;
                    }
                };
                var margins = {
                    top: 80,
                    bottom: 60,
                    left: 40,
                    width: 522
                };
                pdf.fromHTML(source, margins.left, margins.top, {
                    'width': margins.width,
                    'elementHandlers': specialElementHandlers
                }, function (dispose) {
                    pdf.save('Test.pdf');
                }, margins);
            };
            ReportController.prototype.ActivateGraphs = function (result) {
                result.graphdata = {
                    exceedance: {
                        data: [{ values: [], area: true, color: '#7777ff' }],
                        options: {
                            chart: {
                                type: 'lineChart',
                                height: 450,
                                margin: {
                                    top: 20,
                                    right: 30,
                                    bottom: 60,
                                    left: 65
                                },
                                x: function (d) { return d.label; },
                                y: function (d) { return d.value; },
                                showLegend: false,
                                valueFormat: function (d) {
                                    return d3.format(',.3f')(d);
                                },
                                xAxis: {
                                    showMaxMin: false
                                },
                                yAxis: {
                                    axisLabel: 'Discharge (cfs)',
                                    tickFormat: function (d) {
                                        return d3.format(',.0f')(d);
                                    },
                                    tickValues: [1, 10, 100, 1000, 10000, 1000000]
                                },
                                yScale: d3.scale.log(),
                                title: {
                                    enable: true,
                                    text: "Flow Duration Curve Transfer Method (QPPQ) Model Estimated Exceedance Probabilities"
                                }
                            }
                        }
                    },
                    flow: {
                        data: [
                            { key: result.referanceGage.name, values: result.referanceGage.discharge.observations.map(function (obs) { return { x: new Date(obs.date).getTime(), y: obs.hasOwnProperty('value') ? typeof obs.value == 'number' ? obs.value.toUSGSvalue() : obs.value : null }; }) },
                            { key: "Estimated", values: result.estimatedFlow.observations.map(function (obs) { return { x: new Date(obs.date).getTime(), y: obs.hasOwnProperty('value') ? typeof obs.value == 'number' ? obs.value < 0.05 ? 0 : obs.value.toUSGSvalue() : obs.value : null }; }) }
                        ],
                        options: {
                            chart: {
                                type: 'lineChart',
                                height: 450,
                                margin: {
                                    top: 20,
                                    right: 20,
                                    bottom: 50,
                                    left: 75
                                },
                                x: function (d) {
                                    return new Date(d.x).getTime();
                                },
                                y: function (d) {
                                    return d.y;
                                },
                                useInteractiveGuideline: false,
                                interactive: true,
                                tooltips: true,
                                xAxis: {
                                    tickFormat: function (d) {
                                        return d3.time.format('%x')(new Date(d));
                                    },
                                    rotateLabels: -30,
                                    showMaxMin: true
                                },
                                yAxis: {
                                    axisLabel: 'Estimated Discharge (cfs)',
                                    tickFormat: function (d) {
                                        return d3.format('.02f')(d);
                                    },
                                    showMaxMin: true
                                },
                                zoom: {
                                    enabled: false
                                }
                            }
                        }
                    }
                };
                for (var key in result.exceedanceProbabilities) {
                    result.graphdata.exceedance.data[0].values.push({ label: key, value: result.exceedanceProbabilities[key] });
                }
            };
            ReportController.prototype.initMap = function () {
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
            ReportController.prototype.GetRegressionRegionHeader = function (regressionregion) {
                var header = regressionregion.name.split('_').join(' ');
                if (regressionregion.percentWeight && regressionregion.percentWeight < 100) {
                    for (var i = 0; i < this.studyAreaService.selectedStudyArea.RegressionRegions.length; i++) {
                        var rr = this.studyAreaService.selectedStudyArea.RegressionRegions[i];
                        if (regressionregion.code != null && rr.code.indexOf(regressionregion.code.toUpperCase()) > -1) {
                            header = '{0} Percent ({1} square miles) {2}'.format(regressionregion.percentWeight.toFixed(1), rr.area.toUSGSvalue(), header);
                            break;
                        }
                    }
                }
                return '[' + header + ']';
            };
            ReportController.prototype.showFeatures = function () {
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
            ReportController.prototype.addGeoJSON = function (LayerName, feature) {
                if (LayerName == 'globalwatershed') {
                    this.layers.overlays[LayerName] =
                        {
                            name: 'Basin Boundary',
                            type: 'geoJSONShape',
                            data: this.studyAreaService.simplify(angular.fromJson(angular.toJson(feature))),
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
                }
                else if (LayerName == 'globalwatershedpoint') {
                    this.layers.overlays[LayerName] = {
                        name: 'Basin Clicked Point',
                        type: 'geoJSONShape',
                        data: feature,
                        visible: true,
                    };
                }
                else if (LayerName == 'referenceGage') {
                    this.geojson[LayerName] = {
                        data: feature,
                        style: {
                            displayName: 'Reference Gage'
                        },
                        onEachFeature: function (feat, layer) {
                            var icon = L.icon({
                                iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAaJJREFUOI3dzz1IW1EYxvF/TMqpFQsJCF4QOuhUpTpEVCw6RSsdQhFB6hfiF0IDFqkoOCqKEhxEqm0H20YUgpQoqOBWOkgjpQgXowREEC5SuVBE6QtFHXQwYjSJmXzgDO85hx/PayPJsd0TcD6sqM6ZBFqAk7uD4dCyqu3dkLnhRmD6bqB/ q5DwZrl4hv6rb2MWEfEDR4mD + q9ZSl + mAC75 + HOGxvwuYDAx8MNaK / +Os3mUfj5nP + tSSlsUMbKAvfhA / dSKb3qEqvrLtwUS0CeVW + sWkbfxgcsr4zx12rFe + ZJu75PMPK / jcKfQNM1gbKBPz2Az2EzJi + ten / B1LdUse9AGxAhu//ZTXPkwanurrRd3RyeBqRrAfzM48b2IvwfPcWRG9QC76nnvlMDUY2ABkOjgbshHxWvrTRqAYPGo/s9uGWh6A3ivBR3epTZTpeWQmnabB6CkqqFOjbbvi0gG8CcSXF1NMZdCw7zqjAW7iKWOT+sVqtX5TkR6IkGXqx4IMub5EYeIQAlQrmlarmEY+uWVv1ycRDJgGAaRDZOUpINnJ5KDtx5X6hkAAAAASUVORK5CYII=',
                                iconSize: [15, 16],
                                iconAnchor: [7.5, 8],
                                popupAnchor: [0, -11],
                            });
                            layer.setIcon(icon);
                        },
                        layerArray: [{
                                "layerName": "Reference Gage",
                                "legend": [{
                                        "contentType": "image/png",
                                        "imageData": "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAaJJREFUOI3dzz1IW1EYxvF/TMqpFQsJCF4QOuhUpTpEVCw6RSsdQhFB6hfiF0IDFqkoOCqKEhxEqm0H20YUgpQoqOBWOkgjpQgXowREEC5SuVBE6QtFHXQwYjSJmXzgDO85hx/PayPJsd0TcD6sqM6ZBFqAk7uD4dCyqu3dkLnhRmD6bqB/ q5DwZrl4hv6rb2MWEfEDR4mD + q9ZSl + mAC75 + HOGxvwuYDAx8MNaK / +Os3mUfj5nP + tSSlsUMbKAvfhA / dSKb3qEqvrLtwUS0CeVW + sWkbfxgcsr4zx12rFe + ZJu75PMPK / jcKfQNM1gbKBPz2Az2EzJi + ten / B1LdUse9AGxAhu//ZTXPkwanurrRd3RyeBqRrAfzM48b2IvwfPcWRG9QC76nnvlMDUY2ABkOjgbshHxWvrTRqAYPGo/s9uGWh6A3ivBR3epTZTpeWQmnabB6CkqqFOjbbvi0gG8CcSXF1NMZdCw7zqjAW7iKWOT+sVqtX5TkR6IkGXqx4IMub5EYeIQAlQrmlarmEY+uWVv1ycRDJgGAaRDZOUpINnJ5KDtx5X6hkAAAAASUVORK5CYII=",
                                        "label": "Reference Gage"
                                    }]
                            }]
                    };
                }
                else if (LayerName == 'regulatedWatershed') {
                    this.layers.overlays[LayerName] = {
                        name: 'Basin Boundary (Regulated Area)',
                        type: 'geoJSONShape',
                        data: feature,
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
                else {
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
                }
            };
            ReportController.prototype.tableToCSV = function ($table) {
                var $headers = $table.find('tr:has(th)'), $rows = $table.find('tr:has(td)'), tmpColDelim = String.fromCharCode(11), tmpRowDelim = String.fromCharCode(0), colDelim = '","', rowDelim = '"\r\n"';
                var csv = '"';
                csv += formatRows($headers.map(grabRow));
                csv += rowDelim;
                csv += formatRows($rows.map(grabRow)) + '"';
                return csv;
                function formatRows(rows) {
                    return rows.get().join(tmpRowDelim)
                        .split(tmpRowDelim).join(rowDelim)
                        .split(tmpColDelim).join(colDelim);
                }
                function grabRow(i, row) {
                    var $row = $(row);
                    var $cols = $row.find('td');
                    if (!$cols.length)
                        $cols = $row.find('th');
                    return $cols.map(grabCol)
                        .get().join(tmpColDelim);
                }
                function grabCol(j, col) {
                    var $col = $(col), $text = $col.text();
                    return $text.replace('"', '""');
                }
            };
            ReportController.prototype.camelize = function (str) {
                return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
                    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
                }).replace(/\s+/g, '');
            };
            ReportController.prototype.openGagePage = function (siteid) {
                console.log('gage page id:', siteid);
                this.modal.openModal(StreamStats.Services.SSModalType.e_gagepage, { 'siteid': siteid });
            };
            ReportController.prototype.getEstimatedFlow = function (discharge, estimatedFlows) {
                var flow = estimatedFlows.filter(function (f) { return f.date == discharge.date; })[0];
                if (flow && flow.hasOwnProperty('value'))
                    return flow.value.toUSGSvalue();
                else
                    return 'N/A';
            };
            ReportController.$inject = ['$scope', '$analytics', '$modalInstance', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'leafletData', 'StreamStats.Services.RegionService', 'StreamStats.Services.ModalService'];
            return ReportController;
        }());
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.ReportController', ReportController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
