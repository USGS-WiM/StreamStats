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
    export interface INSSResultTable {
        Name?: string;
        Region?: string;
        Statistic?: string;
        Value?: Number;
        Unit?: string;
        CitationUrl?: string;
        Disclaimers: string;
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
        public defaults: any;
        private leafletData: ILeafletData;
        public reportTitle: string;
        public reportComments: string;
        public angulartics: any;
        public AppVersion: string;
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
        public areaSQMI: any
        public get showRegulation(): boolean {
            if (this.regionService.selectedRegion.Applications.indexOf("RegulationFlows") > -1) return true;
            else return false;                
        }

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$analytics', '$modalInstance', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'leafletData', 'StreamStats.Services.RegionService'];
        constructor($scope: IReportControllerScope, $analytics, $modalInstance: ng.ui.bootstrap.IModalServiceInstance, studyArea: Services.IStudyAreaService, StatisticsGroup: Services.InssService, leafletData: ILeafletData, private regionService:Services.IRegionService) {
            $scope.vm = this;

            this.angulartics = $analytics;
            this.studyAreaService = studyArea;
            this.nssService = StatisticsGroup;
            this.leafletData = leafletData;
            this.reportTitle = 'StreamStats Report';
            this.reportComments = 'Some comments here';
            this.AppVersion = configuration.version;
            this.initMap();
            

            $scope.$on('leafletDirectiveMap.reportMap.load',(event, args) => {
                //console.log('report map load');
                this.showFeatures();
            });

            this.close = function () {
                $modalInstance.dismiss('cancel');
            };

            this.print = function () {
                window.print();
            };

            this.getPercentWeights()

        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public downloadCSV() {

            //ga event
            this.angulartics.eventTrack('Download', { category: 'Report', label: 'CSV' });

            var filename = 'data.csv';

            var processMainParameterTable = (data) => {
                var finalVal = 'Basin Characteristics\n';
                finalVal += this.tableToCSV($('#mainParamTable'));
                return finalVal + '\r\n';
            };

            var processScenarioParamTable = (statGroup) => {
                var finalVal = '';
     
                statGroup.RegressionRegions.forEach((regressionRegion) => {

                    //bail if in Area-Averaged section
                    if (regressionRegion.Name == 'Area-Averaged') return;
  
                    //table header
                    var regionPercent = '';
                    if (regressionRegion.PercentWeight) regionPercent = regressionRegion.PercentWeight.toFixed(0) + ' Percent ';
                    finalVal += '\r\n' + statGroup.Name + ' Parameters,' + regionPercent + regressionRegion.Name.split("_").join(" ") + '\r\n';

                    //get this table by ID --need to use this type of selected because jquery doesn't like the possibility of colons in div id
                    finalVal += this.tableToCSV($(document.getElementById(this.camelize(statGroup.Name + regressionRegion.Name + 'ScenarioParamTable')))) + '\r\n';
                    
                });
                return finalVal + '\r\n';
            };

            var processDisclaimers = (statGroup) => {
                //console.log('Process disclaimers statGroup: ', statGroup);
                var finalVal = '*** ' + statGroup.Name + ' Disclaimers ***\r\n';

                angular.forEach(statGroup.Disclaimers, (i, v) => {
                    finalVal += v + ',' + i + '\r\n';
                });

                return finalVal + '\r\n';
            };

            var processScenarioFlowTable = (statGroup) => {
                //console.log('ScenarioFlowTable statGroup: ', statGroup);
                var finalVal = '';

                statGroup.RegressionRegions.forEach((regressionRegion) => {
                    //console.log('ScenarioFlowTable regressionRegion: ', regressionRegion);

                    if (regressionRegion.Results) {

                        //table header
                        var regionPercent = '';
                        if (regressionRegion.PercentWeight) regionPercent = regressionRegion.PercentWeight.toFixed(0) + ' Percent ';
                        finalVal += statGroup.Name + ' Flow Report,' + regionPercent + regressionRegion.Name.split("_").join(" ") + '\r\n';

                        //add explanatory row if needed
                        if (regressionRegion.Results[0].IntervalBounds && regressionRegion.Results[0].Errors && regressionRegion.Results[0].Errors.length > 0) finalVal +=
                         '"PIl: Prediction Interval- Lower, PIu: Prediction Interval- Upper, SEp: Standard Error of Prediction, SE: Standard Error (other-- see report)"\r\n'

                        //get this table by ID --need to use this type of selected because jquery doesn't like the possibility of colons in div id
                        finalVal += this.tableToCSV($(document.getElementById(this.camelize(statGroup.Name + regressionRegion.Name + 'ScenarioFlowTable')))) + '\r\n\r\n';
                    }
                });
                return finalVal + '\r\n';
            };

            //main file header with site information
            var csvFile = 'StreamStats Output Report\n\n' + 'State/Region ID,' + this.studyAreaService.selectedStudyArea.RegionID.toUpperCase() + '\nWorkspace ID,' + this.studyAreaService.selectedStudyArea.WorkspaceID + '\nLatitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toFixed(5) + '\nLongitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toFixed(5) + '\nTime,' + this.studyAreaService.selectedStudyArea.Date.toLocaleString() + '\n\n';

            //first write main parameter table
            csvFile += processMainParameterTable(this.studyAreaService.studyAreaParameterList);

            //next loop over stat groups
            this.nssService.selectedStatisticsGroupList.forEach((statGroup) => {
                csvFile += processScenarioParamTable(statGroup);
                if (statGroup.Disclaimers && (statGroup.Disclaimers.Warnings || statGroup.Disclaimers.Errors)) csvFile += processDisclaimers(statGroup);
                csvFile += processScenarioFlowTable(statGroup);
            });

            //disclaimer
            csvFile += this.disclaimer + 'Application Version: ' +this.AppVersion;

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

        public downloadShapeFile() {
            //https://github.com/mapbox/shp-write
            //https://www.npmjs.com/package/jszip
            //https://stackoverflow.com/questions/34663546/empty-zip-file-when-using-jszip-and-jsziputils-with-angularjs-to-zip-multiple-im
            var flowTable: Array<INSSResultTable> = null;

            if (this.nssService.showFlowsTable)
                flowTable = this.flattenNSSTable();

            var fc:GeoJSON.FeatureCollection = this.studyAreaService.selectedStudyArea.FeatureCollection
            fc.features.forEach(f => {
                f.properties["Name"] = this.studyAreaService.selectedStudyArea.WorkspaceID;
                if (f.id && f.id == "globalwatershed") {
                    f.properties = [f.properties, this.studyAreaService.studyAreaParameterList.reduce((dict, param) => { dict[param.code] = param.value; return dict; }, {})].reduce(function (r, o) {
                        Object.keys(o).forEach(function (k) { r[k] = o[k]; });
                        return r;
                    }, {});
                }//endif

            });
            //this will output a zip file
            shpwrite.download(fc, flowTable, this.disclaimer + 'Application Version: ' + this.AppVersion);    
        }

        private downloadPDF() {
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

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private initMap(): void {
            this.center = new Center(39, -96, 4);
            this.layers = {
                baselayers: configuration.basemaps,
                overlays: {}
            }
            L.Icon.Default.imagePath = 'images';
            this.defaults = {
                scrollWheelZoom: false,
                touchZoom: false,
                doubleClickZoom: false,
                boxZoom: false,
                keyboard: false
            }
        }
        private getPercentWeights() {

            this.nssService.selectedStatisticsGroupList.forEach((statGroup) => {
                //console.log('here1', statGroup)
                statGroup.RegressionRegions.forEach((regRegion) => {
                    //console.log('here2', regRegion)
                    this.studyAreaService.selectedStudyArea.RegressionRegions.forEach((percentOverlay) => {
                        //console.log('here3', percentOverlay)
                        if (regRegion.Code != null && percentOverlay.code.indexOf(regRegion.Code.toUpperCase()) > -1) {
                            this.areaSQMI = percentOverlay.maskareasqmeter * 0.000000386102159;
                        }
                    });
                });
            });
        }
        private showFeatures(): void {

            if (!this.studyAreaService.selectedStudyArea) return;
            this.overlays = {};
            this.studyAreaService.selectedStudyArea.FeatureCollection.features.forEach((item) => {

                //console.log('in each loop', JSON.stringify(item));

                if (item.id == 'globalwatershed') {
                    this.layers.overlays[item.id] = {
                        name: 'Basin Boundary',
                        type: 'geoJSONShape',
                        data: item,
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
                    }                 
                }
                else if (item.id == 'globalwatershedpoint') {
                    this.layers.overlays[item.id] = {
                        name: 'Basin Clicked Point',
                        type: 'geoJSONShape',
                        data: item,
                        visible: true,
                    }
                }

                else if (item.id == 'regulatedWatershed') {
                    //console.log('showing regulated watershed');
                    this.layers.overlays["globalwatershedregulated"] = {
                        name: 'Basin Boundary (Regulated Area)',
                        type: 'geoJSONShape',
                        data: item,
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
                    this.layers.overlays[item.id] = {
                        name: item.id,
                        type: 'geoJSONShape',
                        data: item,
                        visible: false,
                        layerOptions: {
                            style: {
                                fillColor: "red",
                                color: 'red'
                            }
                        }
                    }
                }
            });

            var bbox = this.studyAreaService.selectedStudyArea.FeatureCollection.bbox;
            this.leafletData.getMap("reportMap").then((map: any) => {
                //method to reset the map for modal weirdness
                map.invalidateSize();
                //console.log('in getmap: ', bbox);
                map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
            });
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
        private flattenNSSTable(): Array<INSSResultTable>
        {
            var nm = this.studyAreaService.selectedStudyArea.WorkspaceID;
            var result = [];
            try {
                this.nssService.selectedStatisticsGroupList.forEach(sgroup => {
                    sgroup.RegressionRegions.forEach(regRegion => {
                        regRegion.Results.forEach(regResult => {
                            result.push(
                                {
                                    Name: nm,
                                    Region: regRegion.PercentWeight ? regRegion.PercentWeight.toFixed(0) + "% " + regRegion.Name : regRegion.Name,
                                    Statistic: regResult.Name,
                                    Code: regResult.code,
                                    Value: regResult.Value.toUSGSvalue(),
                                    Unit: regResult.Unit.Unit,
                                    Disclaimers: regRegion.Disclaimer ? regRegion.Disclaimer : undefined,
                                    Errors: (regResult.Errors && regResult.Errors.length > 0) ? regResult.Errors.map(err => err.Name + " : " + err.Value).join(', ') : undefined,
                                    MaxLimit: regResult.IntervalBounds && regResult.IntervalBounds.Upper > 0 ? regResult.IntervalBounds.Upper.toUSGSvalue() : undefined,
                                    MinLimit: regResult.IntervalBounds && regResult.IntervalBounds.Lower > 0 ? regResult.IntervalBounds.Lower.toUSGSvalue() : undefined,
                                    EquivYears: regResult.EquivalentYears ? regResult.EquivalentYears:undefined
                                });
                        });//next regResult
                    });//next regRegion
                });//next sgroup
            }
            catch (e)
            {
                result.push({ Disclaimers: "Failed to output flowstats to table. " });                
            }
            return result;
        }


    }//end class
    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.ReportController', ReportController)

}//end module
   