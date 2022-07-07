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
module StreamStats.Controllers {

    declare var jsPDF;
    declare var shpwrite;
    declare var saveSvgAsPng;
    declare var tokml;
    'use strinct';
    interface IReportControllerScope extends ng.IScope {
        vm: ReportController;
    }
    interface ILeafletData {
        getMap(mapID: any): ng.IPromise<any>;
        getLayers(mapID: any): ng.IPromise<any>;
    }
    interface IReportController {
    }
    interface ICenter {
        lat: number;
        lng: number;
        zoom: number;
    }
    interface IMapLayers {
        baselayers: Object;
        overlays: Object;
    }
    interface ILayer {
        name: string;
        url: string;
        type: string;
        visible: boolean;
        layerOptions: Object;
    }
    class Center implements ICenter {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public lat: number;
        public lng: number;
        public zoom: number;
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor(lt: number, lg: number, zm: number) {
            this.lat = lt;
            this.lng = lg;
            this.zoom = zm;
        }
    }

    class ReportController implements IReportController  {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private disclaimer = "USGS Data Disclaimer: Unless otherwise stated, all data, metadata and related materials are considered to satisfy the quality standards relative to the purpose for which the data were collected. Although these data and associated metadata have been reviewed for accuracy and completeness and approved for release by the U.S. Geological Survey (USGS), no warranty expressed or implied is made regarding the display or utility of the data for other purposes, nor on all computer systems, nor shall the act of distribution constitute any such warranty." + '\n' +
        "USGS Software Disclaimer: This software has been approved for release by the U.S. Geological Survey (USGS). Although the software has been subjected to rigorous review, the USGS reserves the right to update the software as needed pursuant to further analysis and review. No warranty, expressed or implied, is made by the USGS or the U.S. Government as to the functionality of the software and related material nor shall the fact of release constitute any such warranty. Furthermore, the software is released on condition that neither the USGS nor the U.S. Government shall be held liable for any damages resulting from its authorized or unauthorized use." + '\n' +
        "USGS Product Names Disclaimer: Any use of trade, firm, or product names is for descriptive purposes only and does not imply endorsement by the U.S. Government." + '\n\n';

        public close: any;
        public print: any;
        private studyAreaService: Services.IStudyAreaService;
        private nssService: Services.InssService;
        public markers: Object = null;
        public overlays: Object = null;
        public center: ICenter = null;
        public bounds: any;
        public layers: IMapLayers = null;
        public extensions;
        public applications;

        public geojson: Object = null;
        private eventManager: WiM.Event.IEventManager;

        public defaults: any;
        private leafletData: ILeafletData;
        public reportTitle: string;
        public reportComments: string;
        public angulartics: any;
        public AppVersion: string;
        public isExceedanceTableOpen = false;
        public isFlowTableOpen = false;
        private environment: string;
        public NSSServicesVersion: string;
        public SSServicesVersion = '1.2.22'; // TODO: This needs to pull from the services when ready
        public selectedFDCTMTabName: string;

        public sectionCollapsed: Array<any>;
        public basinCharCollapsed;
        public collapsed;

        public get showReport(): boolean {
            if (!this.studyAreaService.studyAreaParameterList) return false;
            for (var i = 0; i < this.studyAreaService.studyAreaParameterList.length; i++) {
                var param = this.studyAreaService.studyAreaParameterList[i];
                if (param.value && param.value >= 0) return true;
            }
            return false;
        }
        public get canShowDisclaimers(): boolean {
            if (this.studyAreaService.selectedStudyArea.Disclaimers == null) return false;
            var canshow = Object.keys(this.studyAreaService.selectedStudyArea.Disclaimers).length > 0;            
            return canshow;            
        }
        public get showRegulation(): boolean {
            if (this.regionService.selectedRegion.Applications.indexOf("RegulationFlows") > -1) return true;
            else return false;                
        }
        public get ActiveApplications(): Array<any> {
            if (this.regionService.selectedRegion.Applications && this.regionService.selectedRegion.Applications.length > 0)
                return this.regionService.selectedRegion.Applications
            else return null;                
        }
        public get ActiveExtensions(): Array<any> {
            if (this.studyAreaService.selectedStudyArea.NSS_Extensions && this.studyAreaService.selectedStudyArea.NSS_Extensions.length > 0)
                return this.studyAreaService.selectedStudyArea.NSS_Extensions
            else return null;
        }
        private _graphData: any = {
            data: {},
            options: {}
        };
        public get GraphData():any {
            return this._graphData;
        }

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$analytics', '$modalInstance', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'leafletData', 'StreamStats.Services.RegionService', 'StreamStats.Services.ModalService', 'WiM.Event.EventManager'];
        constructor($scope: IReportControllerScope, $analytics, $modalInstance: ng.ui.bootstrap.IModalServiceInstance, studyArea: Services.IStudyAreaService, StatisticsGroup: Services.InssService, leafletData: ILeafletData, private regionService:Services.IRegionService, private modal: Services.IModalService, eventManager: WiM.Event.IEventManager) {
            $scope.vm = this;

            this.angulartics = $analytics;
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

            // If we add QPPQ to additional states we might need to add an if statement here to limit to IN and IL
            // Handles states where there is more than one regression region in the same place
            if (this.extensions && this.extensions[0].result  && this.extensions[0].result.length > 1) {

                // Select default tab
                this.extensions[0].result.forEach(r => {
                    if (r.name.toLowerCase().includes("multivar")) {
                        this.selectedFDCTMTabName = r.name;
                    }
                });
                
                // Remove duplicate Regression Regions
                var names = this.extensions[0].result.map(r => r.name)
                this.extensions[0].result = this.extensions[0].result.filter(({name}, index) => !names.includes(name, index + 1));
            }
            this.initMap();
            
            //subscribe to Events
            this.eventManager.SubscribeToEvent(Services.onAdditionalFeaturesLoaded, new WiM.Event.EventHandler<Services.StudyAreaEventArgs>(() => {
                var additionalFeatures = this.studyAreaService.selectedStudyArea.FeatureCollection.features.filter(object => {
                    return object.id !== 'globalwatershed';
                });
                this.showFeatures(additionalFeatures);
            }));

            $scope.$on('leafletDirectiveMap.reportMap.load',(event, args) => {
                //console.log('report map load');
                this.showFeatures(this.studyAreaService.selectedStudyArea.FeatureCollection.features);
            });

            this.close = function () {
                $modalInstance.dismiss('cancel');
            };

            this.print = function () {
                window.print();
            };

            this.NSSServicesVersion = this.studyAreaService.NSSServicesVersion;
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public selectFDCTMTab(tabname: string): void {
            if (this.selectedFDCTMTabName == tabname) return;
            this.selectedFDCTMTabName = tabname;
        }

        public downloadCSV() {

            //ga event
            this.angulartics.eventTrack('Download', { category: 'Report', label: 'CSV' });

            var filename = 'data.csv';

            var processMainParameterTable = (data) => {
                var finalVal = '\nBasin Characteristics\n';
                finalVal += this.tableToCSV($('#mainParamTable'));
                return finalVal + '\n\n';
            };

            var processScenarioParamTable = (statGroup) => {
                var finalVal = '\n';
     
                statGroup.regressionRegions.forEach((regressionRegion) => {

                    //bail if in Area-Averaged section
                    if (regressionRegion.name == 'Area-Averaged') return;
  
                    //table header
                    var regionPercent = '';
                    if (regressionRegion.percentWeight) regionPercent = regressionRegion.percentWeight.toFixed(1) + ' Percent ';
                    finalVal += statGroup.name + ' Parameters,' + regionPercent + regressionRegion.name.split("_").join(" ") + '\r\n';

                    //get this table by ID --need to use this type of selected because jquery doesn't like the possibility of colons in div id
                    finalVal += this.tableToCSV($(document.getElementById(this.camelize(statGroup.name + regressionRegion.name + 'ScenarioParamTable')))) + '\n';
                    
                });
                return finalVal + '\n';
            };

            var processDisclaimers = (statGroup) => {
                //console.log('Process disclaimers statGroup: ', statGroup);
                var finalVal = '*** ' + statGroup.name + ' Disclaimers ***\r\n';

                angular.forEach(statGroup.disclaimer, (i, v) => {
                    finalVal += v + ',' + i + '\r\n';
                });

                return finalVal + '\r\n';
            };

            var processScenarioFlowTable = (statGroup) => {
                //console.log('ScenarioFlowTable statGroup: ', statGroup);
                var finalVal = '';

                statGroup.regressionRegions.forEach((regressionRegion) => {
                    //console.log('ScenarioFlowTable regressionRegion: ', regressionRegion);

                    if (regressionRegion.results) {

                        //table header
                        var regionPercent = '';
                        if (regressionRegion.percentWeight) regionPercent = regressionRegion.percentWeight.toFixed(1) + ' Percent ';
                        finalVal += statGroup.name + ' Flow Report,' + regionPercent + regressionRegion.name.split("_").join(" ") + '\r\n';

                        //add explanatory row if needed
                        if (regressionRegion.results[0].intervalBounds && regressionRegion.results[0].errors && regressionRegion.results[0].errors.length > 0) finalVal +=
                         '"PIl: Prediction Interval- Lower, PIu: Prediction Interval- Upper, ASEp: Average Standard Error of Prediction, SE: Standard Error (other-- see report)"\r\n'

                        //get this table by ID --need to use this type of selected because jquery doesn't like the possibility of colons in div id
                        finalVal += this.tableToCSV($(document.getElementById(this.camelize(statGroup.name + regressionRegion.name + 'ScenarioFlowTable')))) + '\n';
                    }
                });
                return finalVal + '\n';
            };

            //main file header with site information
            var csvFile = 'StreamStats Output Report\n\n' + 'State/Region ID,' + this.studyAreaService.selectedStudyArea.RegionID.toUpperCase() + '\nWorkspace ID,' + this.studyAreaService.selectedStudyArea.WorkspaceID + '\nLatitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toFixed(5) + '\nLongitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toFixed(5);
            if (this.studyAreaService.selectedStudyArea.NHDStream) {
                csvFile += '\nStream GNIS ID,' + this.studyAreaService.selectedStudyArea.NHDStream.GNIS_ID;
                csvFile += '\nStream GNIS Name,' + this.studyAreaService.selectedStudyArea.NHDStream.GNIS_NAME;
            }
            if (this.studyAreaService.selectedStudyArea.WBDHUC8) {
                csvFile += '\nHUC8 ID,' + this.studyAreaService.selectedStudyArea.WBDHUC8.huc8;
                csvFile += '\nHUC8 Name,' + this.studyAreaService.selectedStudyArea.WBDHUC8.name;
            }
            csvFile += '\nTime,' + this.studyAreaService.selectedStudyArea.Date.toLocaleString() + '\n';

            //first write main parameter table
            csvFile += processMainParameterTable(this.studyAreaService.studyAreaParameterList);

            //next loop over stat groups
            this.nssService.selectedStatisticsGroupList.forEach((statGroup) => {
                csvFile += processScenarioParamTable(statGroup);
                if (statGroup.disclaimers && (statGroup.disclaimers.Warnings || statGroup.disclaimers.Errors)) csvFile += processDisclaimers(statGroup);
                csvFile += processScenarioFlowTable(statGroup);
            });


            // add in QPPQ section, need tables open to add to csv
            this.isExceedanceTableOpen = true; this.isFlowTableOpen = true;
            
            var self = this;
            // timeout here to give the tables time to open in view
            setTimeout(function() {
                var extVal = '';
                if (self.extensions) {
                    for (var sc of self.extensions) {
                        if (sc.code == 'QPPQ') {
                            extVal += sc.name += ' (FDCTM)' + '\n';
                            extVal += "Regression Region:, " + self.selectedFDCTMTabName + '\n';
                            for (var p of sc.parameters) {
                                if (['sdate','edate'].indexOf(p.code) >-1) {
                                    var date = new Date(p.value);
                                    extVal += p.name + ':, ' + date.toLocaleDateString() + '\n';
                                }
                            }
                        
                            // add reference gage table TODO: getting random quotation marks without \n, double new lines with \n after 'Reference gage'
                            extVal += '\n';
                            extVal += self.tableToCSV($('#ReferenceGage'))
    
                            // add exceedance table
                            extVal += '\n\nExceedance Probabilities\n';
                            extVal += self.tableToCSV($('#exceedanceTable'));
    
                            // add flow table
                            extVal += '\n\nEstimated Flows\n';
                            extVal += self.tableToCSV($('#flowTable'));
                        }
                    }
                    csvFile += extVal + '\n\n';
                }

                // add Channel-width Methods Weighting content to CSV
                if (self.applications) {
                    var isChannelWidthWeighting = self.applications.indexOf('ChannelWidthWeighting') != -1;
                    var isPFS = false;
                    self.nssService.selectedStatisticsGroupList.forEach(s => {
                        if (s.name == "Peak-Flow Statistics") {
                            isPFS = true
                        }
                    });
                    if (isChannelWidthWeighting && isPFS) {
                        extVal += 'Channel-width Methods Weighting\n';
                        if (document.getElementById("channelWidthWeightingTable")){
                            extVal += 'PIl: Prediction Interval-Lower, PIu: Prediction Interval-Upper, ASEp: Average Standard Error of Prediction\n';
                            if (self.nssService.equationWeightingDisclaimers && self.nssService.equationWeightingDisclaimers.length > 0) {
                                extVal += 'Warning messages:,';
                                self.nssService.equationWeightingDisclaimers.forEach(message => {
                                    extVal += message + ". ";
                                });
                                extVal += '\n';
                            }
                            extVal += self.tableToCSV($('#channelWidthWeightingTable'));
                        } else {
                            extVal += 'No method weighting results returned.'
                        }
                        csvFile += extVal + '\n\n';
                    }
                }

                //disclaimer
                csvFile += self.disclaimer + 'Application Version: ' + self.AppVersion;

                if (self.SSServicesVersion) csvFile += '\nStreamStats Services Version: ' + self.SSServicesVersion;
                if (self.NSSServicesVersion) csvFile += '\nNSS Services Version: ' + self.NSSServicesVersion;

                //download
                var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
                if (navigator.msSaveBlob) { // IE 10+
                    navigator.msSaveBlob(blob, filename);
                } else {
                    var link = <any>document.createElement("a");
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
                this.isExceedanceTableOpen = false; this.isFlowTableOpen = false; // TODO: not working
            }, 300);

        }

        public downloadGeoJSON() {

            var fc: GeoJSON.FeatureCollection = this.studyAreaService.selectedStudyArea.FeatureCollection
            fc.features.forEach(f => {
                f.properties["Name"] = this.studyAreaService.selectedStudyArea.WorkspaceID;
                if (f.id && f.id == "globalwatershed") {
                    f.properties = [f.properties, this.studyAreaService.studyAreaParameterList.reduce((dict, param) => { dict[param.code] = param.value; return dict; }, {})].reduce(function (r, o) {
                        Object.keys(o).forEach(function (k) { r[k] = o[k]; });
                        return r;
                    }, {});
                    f.properties["FlowStatistics"] = this.nssService.selectedStatisticsGroupList;  
                }//endif
            });

            var GeoJSON = angular.toJson(fc);
            
            var filename = 'data.geojson';

            var blob = new Blob([GeoJSON], { type: 'text/csv;charset=utf-8;' });
            if (navigator.msSaveBlob) { // IE 10+
                navigator.msSaveBlob(blob, filename);
            } else {
                var link = <any>document.createElement("a");
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
        }

        public downloadKML() {

            var fc: GeoJSON.FeatureCollection = this.studyAreaService.selectedStudyArea.FeatureCollection
            fc.features.forEach(f => {
                f.properties["Name"] = this.studyAreaService.selectedStudyArea.WorkspaceID;
                if (f.id && f.id == "globalwatershed") {
                    f.properties = [f.properties, this.studyAreaService.studyAreaParameterList.reduce((dict, param) => { dict[param.code] = param.value; return dict; }, {})].reduce(function (r, o) {
                        Object.keys(o).forEach(function (k) { r[k] = o[k]; });
                        return r;
                    }, {});
                    f.properties["FlowStatistics"] = this.nssService.selectedStatisticsGroupList;  
                }//endif
            });

            var GeoJSON = JSON.parse(angular.toJson(fc));
            
            var filename = 'data.geojson';

            var kml = tokml(GeoJSON);
            var blob = new Blob([kml], { type: 'text/csv;charset=utf-8;' });
            var filename = 'data.kml';
            if (navigator.msSaveBlob) { // IE 10+
                navigator.msSaveBlob(blob, filename);
            } else {
                var link = <any>document.createElement("a");
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
        }

        public downloadShapeFile() {
            try {
                var flowTable: Array<Services.INSSResultTable> = null;

                if (this.nssService.showFlowsTable)
                    flowTable = this.nssService.getflattenNSSTable(this.studyAreaService.selectedStudyArea.WorkspaceID);

                var fc: GeoJSON.FeatureCollection = this.studyAreaService.getflattenStudyArea();
                
                var versionText = 'Application Version: ' + this.AppVersion;
                if (this.SSServicesVersion) versionText += '\nStreamStats Services Version: ' + this.SSServicesVersion;
                if (this.NSSServicesVersion) versionText += '\nNSS Services Version: ' + this.NSSServicesVersion;
                //this will output a zip file
                shpwrite.download(fc, flowTable, this.disclaimer + versionText);    

            } catch (e) {
                console.log(e)
            }
        }

        public downloadPNG(graph) {
            var svg;
            var children = document.getElementById(graph).children;

            for (var i = 0; i < children.length; i++) {
                if (children[i].tagName === 'svg') {
                    svg = children[i];
                }
            }
            saveSvgAsPng(svg, graph + ".png");
        }

        public downloadPDF() {
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
                    return true
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
            pdf.fromHTML(
                source, // HTML string or DOM elem ref.
                margins.left, // x coord
                margins.top, { // y coord
                    'width': margins.width, // max width of content on PDF
                    'elementHandlers': specialElementHandlers
                },

                function (dispose) {
                    // dispose: object with X, Y of the last line add to the PDF 
                    //          this allow the insertion of new lines after html
                    pdf.save('Test.pdf');
                }, margins);
        }

        public collapseSection(e, type, group: "") {
            var content = e.currentTarget.nextElementSibling;
            if (content.style.display === "none") {
                content.style.display = "block";
                if(type === "stats") this.sectionCollapsed[group] = false;
                if(type === "basin") this.basinCharCollapsed = false;
            } else {
                content.style.display = "none";
                if(type === "stats") this.sectionCollapsed[group] = true;
                if(type === "basin") this.basinCharCollapsed = true;
            }
        }

        public expandAll(expandOrCollapse) {
            let content = document.querySelectorAll<HTMLElement>(".collapsible-content")
            if(expandOrCollapse === "expand"){
                content.forEach((element) => {
                    element.style.display = "block";
                });
                this.basinCharCollapsed = false;
                this.nssService.statisticsGroupList.forEach((group) => {
                    this.sectionCollapsed[group.name] = false;
                })
                this.collapsed = false;
            }else{
                content.forEach((element) => {
                    element.style.display = "none";
                });
                this.basinCharCollapsed = true;
                this.nssService.statisticsGroupList.forEach((group) => {
                    this.sectionCollapsed[group.name] = true;
                })
                this.collapsed = true;
            }
        }

        public ActivateGraphs(result: any) {
            // TODO: fix flow graph yaxis label - gets overlapped with tick labels sometimes
            
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
                                text: "Flow Duration Curve Transfer Method (FDCTM) Model Estimated Exceedance Probabilities"
                            }
                        }
                    }
                },
                flow: {
                    data: [
                        { key: result.referanceGage.name, values: this.processData(result.referanceGage.discharge.observations)},
                        { key: "Estimated (at clicked point)", values: this.processData(result.estimatedFlow.observations) }
                    ],
                    options: {
                        chart: {
                            type: 'lineChart',
                            height: 450,
                            margin: {
                                top: 20,
                                right: 0,
                                bottom: 50,
                                left: 0
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
                result.graphdata.exceedance.data[0].values.push({ label: key, value: result.exceedanceProbabilities[key] })
            }//next key

            // Convert exceedance probabilities to an array so it can be sorted in the report
            result.exceedanceProbabilitiesArray = [];
            angular.forEach(result.exceedanceProbabilities, function(value, key) {
                result.exceedanceProbabilitiesArray.push({
                    exceedance: key,
                    flowExceeded: value
                });
            });
            
        }
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private initMap(): void {
            this.center = new Center(39, -96, 4);
            this.layers = {
                baselayers: configuration.basemaps,
                overlays: {}
            }
            this.geojson= { };
            L.Icon.Default.imagePath = 'images';
            this.defaults = {
                scrollWheelZoom: false,
                touchZoom: false,
                doubleClickZoom: false,
                boxZoom: false,
                keyboard: false
            }
        }
        public GetRegressionRegionHeader(regressionregion: any): any {

            let header = regressionregion.name.split('_').join(' ');
            if (regressionregion.percentWeight && regressionregion.percentWeight < 100) {
                for (var i = 0; i < this.studyAreaService.selectedStudyArea.RegressionRegions.length; i++) {
                    let rr = this.studyAreaService.selectedStudyArea.RegressionRegions[i]
                    if (regressionregion.code != null && rr.code.indexOf(regressionregion.code.toUpperCase())>-1) {
                        header = '{0} Percent ({1} square miles) {2}'.format( regressionregion.percentWeight.toFixed(1), rr.area.toUSGSvalue(),header);
                        break;
                    }//endif
                }//next i
            }
            return '['+header+']';                        
        }
        private showFeatures(featureArray): void {

            if (!this.studyAreaService.selectedStudyArea) return;
            this.overlays = {};
            featureArray.forEach((item) => {
                this.addGeoJSON(item.id, item);
            });

            // add reference gage to report map
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
                }
                this.addGeoJSON('referenceGage', gagePoint)
            }

            var bbox = this.studyAreaService.selectedStudyArea.FeatureCollection.bbox;
            this.leafletData.getMap("reportMap").then((map: any) => {
                //method to reset the map for modal weirdness
                map.invalidateSize();
                //console.log('in getmap: ', bbox);
                map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
            });
        }
        private addGeoJSON(LayerName: string|number, feature: any) {
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
                }
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
                        })
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
                    // TODO: can't figure out how to get this in the legend!
                }
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
                }
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
                }
            }
        }
        private tableToCSV($table) {

            var $headers = $table.find('tr:has(th)')
                , $rows = $table.find('tr:has(td)')

                // Temporary delimiter characters unlikely to be typed by keyboard
                // This is to avoid accidentally splitting the actual contents
                , tmpColDelim = String.fromCharCode(11) // vertical tab character
                , tmpRowDelim = String.fromCharCode(0) // null character

                // actual delimiter characters for CSV format
                , colDelim = '","'
                , rowDelim = '"\r\n"';
            
            // Grab text from table into CSV formatted string
            var csv = '"';
            csv += formatRows($headers.map(grabRow));
            csv += rowDelim;
            csv += formatRows($rows.map(grabRow)) + '"';
            return csv

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
                if (!$cols.length) $cols = $row.find('th');

                return $cols.map(grabCol)
                    .get().join(tmpColDelim);
            }
            // Grab and format a column from the table 
            function grabCol(j, col) {
                var $col = $(col),
                    $text = $col.text();

                return $text.replace('"', '""'); // escape double quotes

            }
        }
        private camelize(str) {
            return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
                return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
            }).replace(/\s+/g, '');
        }

        public openGagePage(siteid: string): void {
            console.log('gage page id:', siteid)
            this.modal.openModal(Services.SSModalType.e_gagepage, { 'siteid':siteid });
        }

        public getEstimatedFlow(discharge, estimatedFlows) {
            var flow = estimatedFlows.filter(f => f.date == discharge.date)[0];
            if (flow && flow.hasOwnProperty('value')) {
                if (typeof(flow.value) == 'number') return flow.value.toUSGSvalue();
                else return flow.value;
            }
            else return 'N/A';
        }

        private processData(data) {
            var returnData = [];
            // get earliest and latest date in array (might not be the same as the start/end date coming from QPPQ)
            var startDate = new Date(Math.min.apply(null, data.map(function(e) {return new Date(e.date)})));
            var endDate = new Date(Math.max.apply(null, data.map(function(e) {return new Date(e.date)})));
            
            // parse through data and add null values where dates are missing to show gap in timeseries
            for (var d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
                var obs = data.filter(item => new Date(item.date).getTime() == d.getTime())[0];
                if (obs == undefined) returnData.push({x: d.getTime(), y: null});
                else returnData.push({x: d.getTime(), y: obs.hasOwnProperty('value') ? typeof obs.value == 'number' ? obs.value.toUSGSvalue() : obs.value : null})
            }
            return returnData;
        }
    }//end class
    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.ReportController', ReportController)

}//end module
   