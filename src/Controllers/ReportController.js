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
            function ReportController($scope, $modalInstance, studyArea, StatisticsGroup, leafletData, regionService, modal, eventManager) {
                var _this = this;
                this.regionService = regionService;
                this.modal = modal;
                this.disclaimer = '"USGS Data Disclaimer: Unless otherwise stated, all data, metadata and related materials are considered to satisfy the quality standards relative to the purpose for which the data were collected. Although these data and associated metadata have been reviewed for accuracy and completeness and approved for release by the U.S. Geological Survey (USGS), no warranty expressed or implied is made regarding the display or utility of the data for other purposes, nor on all computer systems, nor shall the act of distribution constitute any such warranty."\n'
                    + '"USGS Software Disclaimer: This software has been approved for release by the U.S. Geological Survey (USGS). Although the software has been subjected to rigorous review, the USGS reserves the right to update the software as needed pursuant to further analysis and review. No warranty, expressed or implied, is made by the USGS or the U.S. Government as to the functionality of the software and related material nor shall the fact of release constitute any such warranty. Furthermore, the software is released on condition that neither the USGS nor the U.S. Government shall be held liable for any damages resulting from its authorized or unauthorized use."\n'
                    + '"USGS Product Names Disclaimer: Any use of trade, firm, or product names is for descriptive purposes only and does not imply endorsement by the U.S. Government."\n\n';
                this.markers = null;
                this.overlays = null;
                this.center = null;
                this.layers = null;
                this.geojson = null;
                this.isExceedanceTableOpen = false;
                this.isFlowTableOpen = false;
                this.isEstimatedFlowFLATableOpen = false;
                this.SSServicesVersion = '1.2.22';
                this._graphData = {
                    data: {},
                    options: {}
                };
                $scope.vm = this;
                this.studyAreaService = studyArea;
                this.nssService = StatisticsGroup;
                this.leafletData = leafletData;
                this.reportTitle = 'StreamStats Report';
                this.reportComments = 'Some comments here';
                this.AppVersion = configuration.version;
                this.extensions = this.ActiveExtensions;
                this.applications = this.ActiveApplications;
                this.environment = configuration.environment;
                this.sectionCollapsed = [];
                this.basinCharCollapsed = false;
                this.collapsed = false;
                this.selectedFDCTMTabName = "";
                this.eventManager = eventManager;
                if (this.extensions && this.extensions[0].result && this.extensions[0].result.length > 1) {
                    this.extensions[0].result.forEach(function (r) {
                        if (r.name.toLowerCase().includes("multivar")) {
                            _this.selectedFDCTMTabName = r.name;
                        }
                    });
                    var names = this.extensions[0].result.map(function (r) { return r.name; });
                    this.extensions[0].result = this.extensions[0].result.filter(function (_a, index) {
                        var name = _a.name;
                        return !names.includes(name, index + 1);
                    });
                }
                this.initMap();
                this.eventManager.SubscribeToEvent(StreamStats.Services.onAdditionalFeaturesLoaded, new WiM.Event.EventHandler(function () {
                    var additionalFeatures = _this.studyAreaService.selectedStudyArea.FeatureCollection.features.filter(function (object) {
                        return object.id !== 'globalwatershed';
                    });
                    _this.showFeatures(additionalFeatures);
                }));
                $scope.$on('leafletDirectiveMap.reportMap.load', function (event, args) {
                    _this.showFeatures(_this.studyAreaService.selectedStudyArea.FeatureCollection.features);
                });
                this.close = function () {
                    $modalInstance.dismiss('cancel');
                };
                this.print = function () {
                    gtag('event', 'Download', { 'Category': 'Report', 'Type': 'Print' });
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
            Object.defineProperty(ReportController.prototype, "ActiveApplications", {
                get: function () {
                    if (this.regionService.selectedRegion.Applications && this.regionService.selectedRegion.Applications.length > 0)
                        return this.regionService.selectedRegion.Applications;
                    else
                        return null;
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
            ReportController.prototype.setStream = function (stream) {
                if (stream) {
                    this.studyAreaService.selectedStudyArea.NHDStream = stream;
                    var input = document.getElementById(stream.GNIS_ID);
                    if (input != null) {
                        input.checked = true;
                    }
                    else {
                        setTimeout(function () {
                            var input = document.getElementById(stream.GNIS_ID);
                            if (input != null) {
                                input.checked = true;
                            }
                        }, 1000);
                    }
                }
                else {
                    return;
                }
            };
            ReportController.prototype.selectFDCTMTab = function (tabname) {
                if (this.selectedFDCTMTabName == tabname)
                    return;
                this.selectedFDCTMTabName = tabname;
            };
            ReportController.prototype.downloadCSV = function () {
                var _this = this;
                gtag('event', 'Download', { 'Category': 'Report', 'Type': 'CSV' });
                var filename = 'data.csv';
                var processMainParameterTable = function (data) {
                    var finalVal = '\nBasin Characteristics\n';
                    finalVal += _this.tableToCSV($('#mainParamTable'));
                    return finalVal + '\n\n';
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
                                    '"PIL: Lower 90% Prediction Interval, PIU: Upper 90% Prediction Interval, ASEp: Average Standard Error of Prediction, SE: Standard Error (other-- see report)"\r\n';
                            finalVal += _this.tableToCSV($(document.getElementById(_this.camelize(statGroup.name + regressionRegion.name + 'ScenarioFlowTable')))) + '\n';
                        }
                    });
                    return finalVal + '\n';
                };
                var csvFile = 'StreamStats Output Report\n\n' + 'State/Region ID,' + this.studyAreaService.selectedStudyArea.RegionID.toUpperCase();
                if (this.studyAreaService.selectedStudyArea.Pourpoint.length == 1) {
                    csvFile += '\nWorkspace ID,' + this.studyAreaService.selectedStudyArea.WorkspaceID + '\nLatitude,' + this.studyAreaService.selectedStudyArea.Pourpoint[0].Latitude.toFixed(5) + '\nLongitude,' + this.studyAreaService.selectedStudyArea.Pourpoint[0].Longitude.toFixed(5);
                }
                else {
                    this.studyAreaService.selectedStudyArea.LinePoints.forEach(function (element, i) {
                        csvFile += '\nDelineation Line Point ' + (i + 1).toString() + ' Latitude,' + element.Latitude.toFixed(5);
                        csvFile += '\nDelineation Line Point ' + (i + 1).toString() + ' Longitude,' + element.Longitude.toFixed(5);
                    });
                }
                csvFile += '\nTime,' + this.studyAreaService.selectedStudyArea.Date.toLocaleString() + '\n';
                if (this.studyAreaService.selectedStudyArea.NHDStream) {
                    if (this.studyAreaService.selectedStudyArea.NHDStream.GNIS_ID) {
                        csvFile += '\nNHD Stream GNIS ID,' + this.studyAreaService.selectedStudyArea.NHDStream.GNIS_ID;
                    }
                    if (this.studyAreaService.selectedStudyArea.NHDStream.GNIS_NAME) {
                        csvFile += '\nNHD Stream GNIS Name,' + this.studyAreaService.selectedStudyArea.NHDStream.GNIS_NAME;
                    }
                }
                if (this.studyAreaService.selectedStudyArea.WBDHUC8) {
                    if (this.studyAreaService.selectedStudyArea.WBDHUC8.huc8) {
                        csvFile += '\nHUC 8,' + this.studyAreaService.selectedStudyArea.WBDHUC8.huc8;
                    }
                    if (this.studyAreaService.selectedStudyArea.WBDHUC8.name) {
                        csvFile += ' (' + this.studyAreaService.selectedStudyArea.WBDHUC8.name + ')';
                    }
                }
                csvFile += processMainParameterTable(this.studyAreaService.studyAreaParameterList);
                this.nssService.selectedStatisticsGroupList.forEach(function (statGroup) {
                    csvFile += processScenarioParamTable(statGroup);
                    if (statGroup.disclaimers && (statGroup.disclaimers.Warnings || statGroup.disclaimers.Errors))
                        csvFile += processDisclaimers(statGroup);
                    csvFile += processScenarioFlowTable(statGroup);
                });
                this.isExceedanceTableOpen = true;
                this.isFlowTableOpen = true;
                this.isEstimatedFlowFLATableOpen = true;
                var self = this;
                setTimeout(function () {
                    var extVal = '';
                    if (self.extensions) {
                        for (var _i = 0, _a = self.extensions; _i < _a.length; _i++) {
                            var sc = _a[_i];
                            if (sc.code == 'QPPQ') {
                                extVal += sc.name += ' (FDCTM)' + '\n';
                                extVal += "Regression Region:, " + self.selectedFDCTMTabName + '\n';
                                for (var _b = 0, _c = sc.parameters; _b < _c.length; _b++) {
                                    var p = _c[_b];
                                    if (['sdate', 'edate'].indexOf(p.code) > -1) {
                                        var date = new Date(p.value);
                                        extVal += p.name + ':, ' + date.toLocaleDateString() + '\n';
                                    }
                                }
                                extVal += '\n';
                                extVal += self.tableToCSV($('#ReferenceGage'));
                                extVal += '\n\nExceedance Probabilities\n';
                                extVal += self.tableToCSV($('#exceedanceTable'));
                                extVal += '\n\nEstimated Flows\n';
                                extVal += self.tableToCSV($('#flowTable'));
                                extVal += '\n\n';
                            }
                        }
                    }
                    if (self.applications) {
                        if (self.applications.indexOf('FLA') != -1) {
                            extVal += 'Flow Anywhere Method';
                            extVal += '\n\n';
                            extVal += self.tableToCSV($('#flowAnywhereReferenceGage'));
                            extVal += '\n\n';
                            extVal += self.tableToCSV($('#flowAnywhereModelParameters'));
                            extVal += '\n\nEstimated Flows\n';
                            extVal += self.tableToCSV($('#estimatedFlowFLATable'));
                            extVal += '\n\n';
                        }
                        var isChannelWidthWeighting = self.applications.indexOf('ChannelWidthWeighting') != -1;
                        var isPFS = false;
                        self.nssService.selectedStatisticsGroupList.forEach(function (s) {
                            if (s.name == "Peak-Flow Statistics") {
                                isPFS = true;
                            }
                        });
                        if (isChannelWidthWeighting && isPFS) {
                            extVal += 'Channel-width Methods Weighting\n';
                            if (document.getElementById("channelWidthWeightingTable")) {
                                extVal += 'PIL: Lower 90% Prediction Interval, PIU: Upper 90% Prediction Interval, ASEp: Average Standard Error of Prediction\n';
                                if (self.nssService.equationWeightingDisclaimers && self.nssService.equationWeightingDisclaimers.length > 0) {
                                    extVal += 'Warning messages:,';
                                    self.nssService.equationWeightingDisclaimers.forEach(function (message) {
                                        extVal += message + ". ";
                                    });
                                    extVal += '\n';
                                }
                                extVal += self.tableToCSV($('#channelWidthWeightingTable'));
                            }
                            else {
                                extVal += 'No method weighting results returned.';
                            }
                            extVal += '\n\n';
                        }
                    }
                    csvFile += extVal;
                    if (self.applications) {
                        var isHydrologicFeatures = self.applications.indexOf('HydrologicFeatures') != -1;
                        var isLineDelineation = self.studyAreaService.selectedStudyArea.Pourpoint.length > 1;
                        if (isHydrologicFeatures && !isLineDelineation) {
                            extVal += 'National Hydrography Dataset (NHD) Hydrologic Features\n';
                            extVal += 'Intersecting NHD Streams\n';
                            if (self.studyAreaService.selectedStudyArea.NHDStreamIntersections.length > 0) {
                                extVal += self.tableToCSV($('#hydrologicFeaturesTable'));
                            }
                            else if (!self.studyAreaService.selectedStudyArea.NHDStreamIntersections) {
                                extVal += 'There was error querying NHD Streams.';
                            }
                            else if (self.studyAreaService.selectedStudyArea.NHDStreamIntersections.length == 0) {
                                extVal += 'No NHD streams intersect the delineated basin.';
                            }
                            csvFile += extVal + '\n\n';
                        }
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
                    this.isEstimatedFlowFLATableOpen = false;
                }, 300);
            };
            ReportController.prototype.downloadGeoJSON = function () {
                var _this = this;
                gtag('event', 'Download', { 'Category': 'Report', "Type": 'Geojson' });
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
                gtag('event', 'Download', { 'Category': 'Report', "Type": 'KML' });
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
                gtag('event', 'Download', { 'Category': 'Report', "Type": 'Shapefile' });
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
            ReportController.prototype.collapseSection = function (e, type, group) {
                var content = e.currentTarget.nextElementSibling;
                if (content.style.display === "none") {
                    content.style.display = "block";
                    if (type === "stats")
                        this.sectionCollapsed[group] = false;
                    if (type === "basin")
                        this.basinCharCollapsed = false;
                }
                else {
                    content.style.display = "none";
                    if (type === "stats")
                        this.sectionCollapsed[group] = true;
                    if (type === "basin")
                        this.basinCharCollapsed = true;
                }
            };
            ReportController.prototype.expandAll = function (expandOrCollapse) {
                var _this = this;
                var content = document.querySelectorAll(".collapsible-content");
                if (expandOrCollapse === "expand") {
                    content.forEach(function (element) {
                        element.style.display = "block";
                    });
                    this.basinCharCollapsed = false;
                    this.nssService.statisticsGroupList.forEach(function (group) {
                        _this.sectionCollapsed[group.name] = false;
                    });
                    this.collapsed = false;
                }
                else {
                    content.forEach(function (element) {
                        element.style.display = "none";
                    });
                    this.basinCharCollapsed = true;
                    this.nssService.statisticsGroupList.forEach(function (group) {
                        _this.sectionCollapsed[group.name] = true;
                    });
                    this.collapsed = true;
                }
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
                                    left: 100
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
                                    text: "Flow Duration Curve Transfer Method (FDCTM) Model Estimated Exceedance Probabilities"
                                }
                            }
                        }
                    },
                    flow: {
                        data: [
                            { key: "Observed", values: this.processData(result.referanceGage.discharge.observations) },
                            { key: "Estimated", values: this.processData(result.estimatedFlow.observations) }
                        ],
                        options: {
                            chart: {
                                type: 'lineChart',
                                height: 450,
                                margin: {
                                    top: 20,
                                    right: 30,
                                    bottom: 60,
                                    left: 100
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
                                        return d != null ? d.toUSGSvalue() : d;
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
                result.exceedanceProbabilitiesArray = [];
                angular.forEach(result.exceedanceProbabilities, function (value, key) {
                    result.exceedanceProbabilitiesArray.push({
                        exceedance: key,
                        flowExceeded: value
                    });
                });
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
            ReportController.prototype.showFeatures = function (featureArray) {
                var _this = this;
                if (!this.studyAreaService.selectedStudyArea)
                    return;
                this.overlays = {};
                featureArray.forEach(function (item) {
                    _this.addGeoJSON(item.id, item);
                });
                if (this.studyAreaService.selectedGage && this.studyAreaService.selectedGage.hasOwnProperty('Latitude_DD') && this.studyAreaService.selectedGage.hasOwnProperty('Longitude_DD')) {
                    var gagePoint = {
                        type: "Feature",
                        geometry: {
                            coordinates: [
                                this.studyAreaService.selectedGage.Latitude_DD,
                                this.studyAreaService.selectedGage.Longitude_DD
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
                else if (LayerName.includes('globalwatershedpoint')) {
                    this.layers.overlays[LayerName] = {
                        name: /\d/.test(LayerName) ? "Subbasin Delineation Point " + LayerName.replace(/[^0-9]/g, '') : "Basin Clicked Point",
                        type: 'geoJSONShape',
                        data: feature,
                        visible: true,
                    };
                }
                else if (LayerName.includes('globalwatershed')) {
                    this.layers.overlays[LayerName] = {
                        name: 'Subbasin Boundary ' + LayerName.replace(/[^0-9]/g, ''),
                        type: 'geoJSONShape',
                        data: feature,
                        visible: false,
                    };
                }
                else if (LayerName == 'referenceGage') {
                    this.geojson[LayerName] = {
                        data: feature,
                        style: {
                            displayName: 'Index Gage'
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
                                "layerName": "Index Gage",
                                "legend": [{
                                        "contentType": "image/png",
                                        "imageData": "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAaJJREFUOI3dzz1IW1EYxvF/TMqpFQsJCF4QOuhUpTpEVCw6RSsdQhFB6hfiF0IDFqkoOCqKEhxEqm0H20YUgpQoqOBWOkgjpQgXowREEC5SuVBE6QtFHXQwYjSJmXzgDO85hx/PayPJsd0TcD6sqM6ZBFqAk7uD4dCyqu3dkLnhRmD6bqB/ q5DwZrl4hv6rb2MWEfEDR4mD + q9ZSl + mAC75 + HOGxvwuYDAx8MNaK / +Os3mUfj5nP + tSSlsUMbKAvfhA / dSKb3qEqvrLtwUS0CeVW + sWkbfxgcsr4zx12rFe + ZJu75PMPK / jcKfQNM1gbKBPz2Az2EzJi + ten / B1LdUse9AGxAhu//ZTXPkwanurrRd3RyeBqRrAfzM48b2IvwfPcWRG9QC76nnvlMDUY2ABkOjgbshHxWvrTRqAYPGo/s9uGWh6A3ivBR3epTZTpeWQmnabB6CkqqFOjbbvi0gG8CcSXF1NMZdCw7zqjAW7iKWOT+sVqtX5TkR6IkGXqx4IMub5EYeIQAlQrmlarmEY+uWVv1ycRDJgGAaRDZOUpINnJ5KDtx5X6hkAAAAASUVORK5CYII=",
                                        "label": "Index Gage"
                                    }]
                            }]
                    };
                }
                else if (LayerName == 'regulatedwatershed') {
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
                else if (LayerName.includes('longestflowpath')) {
                    this.layers.overlays[LayerName] = {
                        name: LayerName,
                        type: 'geoJSONShape',
                        data: feature,
                        visible: false,
                        layerOptions: {
                            style: {
                                fillColor: "blue",
                                color: 'blue'
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
                if (flow && flow.hasOwnProperty('value')) {
                    if (typeof (flow.value) == 'number')
                        return flow.value.toUSGSvalue();
                    else
                        return flow.value;
                }
                else
                    return 'N/A';
            };
            ReportController.prototype.processData = function (data) {
                var returnData = [];
                var startDate = new Date(Math.min.apply(null, data.map(function (e) { return new Date(e.date); })));
                var endDate = new Date(Math.max.apply(null, data.map(function (e) { return new Date(e.date); })));
                for (var d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
                    var obs = data.filter(function (item) { return new Date(item.date).getTime() == d.getTime(); })[0];
                    if (obs == undefined)
                        returnData.push({ x: d.getTime(), y: null });
                    else
                        returnData.push({ x: d.getTime(), y: obs.hasOwnProperty('value') ? typeof obs.value == 'number' ? obs.value.toUSGSvalue() : obs.value : null });
                }
                return returnData;
            };
            ReportController.$inject = ['$scope', '$modalInstance', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'leafletData', 'StreamStats.Services.RegionService', 'StreamStats.Services.ModalService', 'WiM.Event.EventManager'];
            return ReportController;
        }());
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.ReportController', ReportController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
