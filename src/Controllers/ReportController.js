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
        var Center = /** @class */ (function () {
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function Center(lt, lg, zm) {
                this.lat = lt;
                this.lng = lg;
                this.zoom = zm;
            }
            return Center;
        }());
        var ReportController = /** @class */ (function () {
            function ReportController($scope, $analytics, $modalInstance, studyArea, StatisticsGroup, leafletData, regionService) {
                var _this = this;
                this.regionService = regionService;
                //Properties
                //-+-+-+-+-+-+-+-+-+-+-+-
                this.disclaimer = "USGS Data Disclaimer: Unless otherwise stated, all data, metadata and related materials are considered to satisfy the quality standards relative to the purpose for which the data were collected. Although these data and associated metadata have been reviewed for accuracy and completeness and approved for release by the U.S. Geological Survey (USGS), no warranty expressed or implied is made regarding the display or utility of the data for other purposes, nor on all computer systems, nor shall the act of distribution constitute any such warranty." + '\n' +
                    "USGS Software Disclaimer: This software has been approved for release by the U.S. Geological Survey (USGS). Although the software has been subjected to rigorous review, the USGS reserves the right to update the software as needed pursuant to further analysis and review. No warranty, expressed or implied, is made by the USGS or the U.S. Government as to the functionality of the software and related material nor shall the fact of release constitute any such warranty. Furthermore, the software is released on condition that neither the USGS nor the U.S. Government shall be held liable for any damages resulting from its authorized or unauthorized use." + '\n' +
                    "USGS Product Names Disclaimer: Any use of trade, firm, or product names is for descriptive purposes only and does not imply endorsement by the U.S. Government." + '\n\n';
                this.markers = null;
                this.overlays = null;
                this.center = null;
                this.layers = null;
                this.geojson = null;
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
            Object.defineProperty(ReportController.prototype, "canShowDisclaimers", {
                get: function () {
                    if (this.studyAreaService.selectedStudyArea.Disclaimers == null)
                        return false;
                    var canshow = Object.keys(this.studyAreaService.selectedStudyArea.Disclaimers).length > 0;
                    return canshow;
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
            Object.defineProperty(ReportController.prototype, "ActiveExtensions", {
                get: function () {
                    if (this.studyAreaService.selectedStudyArea.NSS_Extensions && this.studyAreaService.selectedStudyArea.NSS_Extensions.length > 0)
                        return this.studyAreaService.selectedStudyArea.NSS_Extensions;
                    else
                        return null;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ReportController.prototype, "GraphData", {
                get: function () {
                    return this._graphData;
                },
                enumerable: true,
                configurable: true
            });
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ReportController.prototype.downloadCSV = function () {
                var _this = this;
                //ga event
                this.angulartics.eventTrack('Download', { category: 'Report', label: 'CSV' });
                var filename = 'data.csv';
                var processMainParameterTable = function (data) {
                    var finalVal = 'Basin Characteristics\n';
                    finalVal += _this.tableToCSV($('#mainParamTable'));
                    return finalVal + '\r\n';
                };
                var processScenarioParamTable = function (statGroup) {
                    var finalVal = '';
                    statGroup.regressionRegions.forEach(function (regressionRegion) {
                        //bail if in Area-Averaged section
                        if (regressionRegion.name == 'Area-Averaged')
                            return;
                        //table header
                        var regionPercent = '';
                        if (regressionRegion.percentWeight)
                            regionPercent = regressionRegion.percentWeight.toFixed(0) + ' Percent ';
                        finalVal += '\r\n' + statGroup.name + ' Parameters,' + regionPercent + regressionRegion.name.split("_").join(" ") + '\r\n';
                        //get this table by ID --need to use this type of selected because jquery doesn't like the possibility of colons in div id
                        finalVal += _this.tableToCSV($(document.getElementById(_this.camelize(statGroup.name + regressionRegion.name + 'ScenarioParamTable')))) + '\r\n';
                    });
                    return finalVal + '\r\n';
                };
                var processDisclaimers = function (statGroup) {
                    //console.log('Process disclaimers statGroup: ', statGroup);
                    var finalVal = '*** ' + statGroup.name + ' Disclaimers ***\r\n';
                    angular.forEach(statGroup.disclaimer, function (i, v) {
                        finalVal += v + ',' + i + '\r\n';
                    });
                    return finalVal + '\r\n';
                };
                var processScenarioFlowTable = function (statGroup) {
                    //console.log('ScenarioFlowTable statGroup: ', statGroup);
                    var finalVal = '';
                    statGroup.regressionRegions.forEach(function (regressionRegion) {
                        //console.log('ScenarioFlowTable regressionRegion: ', regressionRegion);
                        if (regressionRegion.results) {
                            //table header
                            var regionPercent = '';
                            if (regressionRegion.percentWeight)
                                regionPercent = regressionRegion.percentWeight.toFixed(0) + ' Percent ';
                            finalVal += statGroup.name + ' Flow Report,' + regionPercent + regressionRegion.name.split("_").join(" ") + '\r\n';
                            //add explanatory row if needed
                            if (regressionRegion.results[0].intervalBounds && regressionRegion.results[0].errors && regressionRegion.results[0].errors.length > 0)
                                finalVal +=
                                    '"PIl: Prediction Interval- Lower, PIu: Prediction Interval- Upper, SEp: Standard Error of Prediction, SE: Standard Error (other-- see report)"\r\n';
                            //get this table by ID --need to use this type of selected because jquery doesn't like the possibility of colons in div id
                            finalVal += _this.tableToCSV($(document.getElementById(_this.camelize(statGroup.name + regressionRegion.name + 'ScenarioFlowTable')))) + '\r\n\r\n';
                        }
                    });
                    return finalVal + '\r\n';
                };
                //main file header with site information
                var csvFile = 'StreamStats Output Report\n\n' + 'State/Region ID,' + this.studyAreaService.selectedStudyArea.RegionID.toUpperCase() + '\nWorkspace ID,' + this.studyAreaService.selectedStudyArea.WorkspaceID + '\nLatitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toFixed(5) + '\nLongitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toFixed(5) + '\nTime,' + this.studyAreaService.selectedStudyArea.Date.toLocaleString() + '\n\n';
                //first write main parameter table
                if (this.nssService.selectedStatisticsGroupList.length > 1 || (this.extensions && this.extensions[0].code != 'QPPQ')) {
                    csvFile += processMainParameterTable(this.studyAreaService.studyAreaParameterList);
                }
                //next loop over stat groups
                this.nssService.selectedStatisticsGroupList.forEach(function (statGroup) {
                    csvFile += processScenarioParamTable(statGroup);
                    if (statGroup.disclaimers && (statGroup.disclaimers.Warnings || statGroup.disclaimers.Errors))
                        csvFile += processDisclaimers(statGroup);
                    csvFile += processScenarioFlowTable(statGroup);
                });
                // add in QPPQ section
                var extVal = '\r\n';
                for (var _i = 0, _a = this.extensions; _i < _a.length; _i++) {
                    var sc = _a[_i];
                    if (sc.code == 'QPPQ') {
                        extVal += sc.name += ' (' + sc.code + ')' + '\r\n';
                        for (var _b = 0, _c = sc.parameters; _b < _c.length; _b++) {
                            var p = _c[_b];
                            if (['sdate', 'edate'].indexOf(p.code) > -1) {
                                var date = new Date(p.value);
                                extVal += p.name + ':, ' + date.toLocaleDateString() + '\r\n'; // .toLocaleString()?
                            }
                        }
                        // TODO: add links to station IDs?
                        // TODO: clean up? don't need all these lines
                        extVal += '\r\nReference gage\r\nStation ID:,' + sc.result.referanceGage.stationID + '\r\n';
                        extVal += 'Name:,"' + sc.result.referanceGage.name + '"\r\nLatitude:,' + sc.result.referanceGage.latitude_DD + ' Decimal degrees\r\n';
                        extVal += 'Longitude:,' + sc.result.referanceGage.longitude_DD + ' Decimal Degrees\r\nDrainage Area:,' + sc.result.referanceGage.drainageArea_sqMI + ' square miles\r\n';
                        extVal += '\r\nExceedance Probabilities\r\n';
                        extVal += 'Exceedance,FlowExceeded\r\n';
                        Object.keys(sc.result.exceedanceProbabilities).forEach(function (key, value) {
                            if (value) {
                                value = value.toUSGSvalue();
                            }
                            extVal += key + ',' + value + '\r\n';
                        });
                        extVal += '\r\nEstimated Flows\r\n';
                        extVal += ',Discharge (cfs)\r\nDate,Estimated,"' + sc.result.referanceGage.name + '"\r\n';
                        for (var _d = 0, _e = sc.result.estimatedFlow.observations; _d < _e.length; _d++) {
                            var obs = _e[_d];
                            var idx = sc.result.estimatedFlow.observations.indexOf(obs);
                            if (obs.value) {
                                obs.value = obs.value.toUSGSvalue();
                            }
                            var dischargeValue = sc.result.referanceGage.discharge.observations[idx].value;
                            if (dischargeValue) {
                                dischargeValue = dischargeValue.toUSGSvalue();
                            }
                            extVal += obs.date.split('T')[0] + ',' + obs.value + ',' + dischargeValue + '\r\n';
                        }
                        // for now just having a file download window pop up for each graph, maybe zip the files?
                        var svg;
                        var svg2;
                        var children = document.getElementById('exceedancegraph').children;
                        for (var i = 0; i < children.length; i++) {
                            if (children[i].tagName === 'svg') {
                                svg = children[i];
                            }
                        }
                        saveSvgAsPng(svg, "exceedancegraph.png");
                        var svg2 = d3.select('#flowgraph')[0];
                        var children2 = document.getElementById('flowgraph').children;
                        for (var i = 0; i < children2.length; i++) {
                            if (children2[i].tagName === 'svg') {
                                svg2 = children2[i];
                            }
                        }
                        saveSvgAsPng(svg2, "flowgraph.png");
                    }
                }
                csvFile += extVal + '\r\n\r\n';
                //disclaimer
                csvFile += this.disclaimer + 'Application Version: ' + this.AppVersion;
                //download
                var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
                if (navigator.msSaveBlob) { // IE 10+
                    navigator.msSaveBlob(blob, filename);
                }
                else {
                    var link = document.createElement("a");
                    var url = URL.createObjectURL(blob);
                    if (link.download !== undefined) { // feature detection
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
                    } //endif
                });
                var GeoJSON = angular.toJson(fc);
                var filename = 'data.geojson';
                var blob = new Blob([GeoJSON], { type: 'text/csv;charset=utf-8;' });
                if (navigator.msSaveBlob) { // IE 10+
                    navigator.msSaveBlob(blob, filename);
                }
                else {
                    var link = document.createElement("a");
                    var url = URL.createObjectURL(blob);
                    if (link.download !== undefined) { // feature detection
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
            ReportController.prototype.downloadShapeFile = function () {
                try {
                    var flowTable = null;
                    if (this.nssService.showFlowsTable)
                        flowTable = this.nssService.getflattenNSSTable(this.studyAreaService.selectedStudyArea.WorkspaceID);
                    var fc = this.studyAreaService.getflattenStudyArea();
                    //this will output a zip file
                    shpwrite.download(fc, flowTable, this.disclaimer + 'Application Version: ' + this.AppVersion);
                }
                catch (e) {
                    console.log(e);
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
                            { key: result.referanceGage.name, values: result.referanceGage.discharge.observations.map(function (obs) { return { x: new Date(obs.date).getTime(), y: obs.value.toUSGSvalue() }; }) },
                            { key: "Estimated", values: result.estimatedFlow.observations.map(function (obs) { return { x: new Date(obs.date).getTime(), y: obs.value.toUSGSvalue() }; }) }
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
                                interactive: false,
                                tooltips: true,
                                xAxis: {
                                    tickFormat: function (d) {
                                        return d3.time.format('%x')(new Date(d));
                                    },
                                    rotateLabels: 30,
                                    showMaxMin: false
                                },
                                yAxis: {
                                    axisLabel: 'Estimated Discharge (cfs)',
                                    tickFormat: function (d) {
                                        return d3.format('.02f')(d);
                                    },
                                    showMaxMin: false
                                },
                                zoom: {
                                    enabled: false,
                                    scaleExtent: [1, 10],
                                    useFixedDomain: false,
                                    useNiceScale: false,
                                    horizontalOff: false,
                                    verticalOff: false,
                                    unzoomEventType: 'dblclick.zoom'
                                }
                            }
                        }
                    }
                };
                for (var key in result.exceedanceProbabilities) {
                    result.graphdata.exceedance.data[0].values.push({ label: key, value: result.exceedanceProbabilities[key] });
                } //next key
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
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
                            header = '{0} Percent ({1} square miles) {2}'.format(regressionregion.percentWeight.toFixed(0), rr.area.toUSGSvalue(), header);
                            break;
                        } //endif
                    } //next i
                }
                return '[' + header + ']';
            };
            ReportController.prototype.showFeatures = function () {
                var _this = this;
                if (!this.studyAreaService.selectedStudyArea)
                    return;
                this.overlays = {};
                this.studyAreaService.selectedStudyArea.FeatureCollection.features.forEach(function (item) {
                    //console.log('in each loop', JSON.stringify(item));
                    _this.addGeoJSON(item.id, item);
                });
                var bbox = this.studyAreaService.selectedStudyArea.FeatureCollection.bbox;
                this.leafletData.getMap("reportMap").then(function (map) {
                    //method to reset the map for modal weirdness
                    map.invalidateSize();
                    //console.log('in getmap: ', bbox);
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
                //additional features get generic styling for now
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
                var $headers = $table.find('tr:has(th)'), $rows = $table.find('tr:has(td)')
                // Temporary delimiter characters unlikely to be typed by keyboard
                // This is to avoid accidentally splitting the actual contents
                , tmpColDelim = String.fromCharCode(11) // vertical tab character
                , tmpRowDelim = String.fromCharCode(0) // null character
                // actual delimiter characters for CSV format
                , colDelim = '","', rowDelim = '"\r\n"';
                // Grab text from table into CSV formatted string
                var csv = '"';
                csv += formatRows($headers.map(grabRow));
                csv += rowDelim;
                csv += formatRows($rows.map(grabRow)) + '"';
                return csv;
                //------------------------------------------------------------
                // Helper Functions 
                //------------------------------------------------------------
                // Format the output so it has the appropriate delimiters
                function formatRows(rows) {
                    return rows.get().join(tmpRowDelim)
                        .split(tmpRowDelim).join(rowDelim)
                        .split(tmpColDelim).join(colDelim);
                }
                // Grab and format a row from the table
                function grabRow(i, row) {
                    var $row = $(row);
                    //for some reason $cols = $row.find('td') || $row.find('th') won't work...
                    var $cols = $row.find('td');
                    if (!$cols.length)
                        $cols = $row.find('th');
                    return $cols.map(grabCol)
                        .get().join(tmpColDelim);
                }
                // Grab and format a column from the table 
                function grabCol(j, col) {
                    var $col = $(col), $text = $col.text();
                    return $text.replace('"', '""'); // escape double quotes
                }
            };
            ReportController.prototype.camelize = function (str) {
                return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
                    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
                }).replace(/\s+/g, '');
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