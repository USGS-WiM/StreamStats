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
        public get showReport(): boolean {
            if (!this.studyAreaService.studyAreaParameterList) return false;
            for (var i = 0; i < this.studyAreaService.studyAreaParameterList.length; i++) {
                var param = this.studyAreaService.studyAreaParameterList[i];
                if (param.value && param.value >= 0) return true;
            }
            return false;
        }
        public DRNAREA: any;
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

            this.studyAreaService.studyAreaParameterList.forEach((parameter) => {
                if (parameter.code == 'DRNAREA') {
                    this.DRNAREA = parameter;
                }
            });

        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private initMap(): void {
            this.center = new Center(39, -96, 4);
            this.layers = {
                baselayers: this.studyAreaService.baseMap,
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

        private showFeatures(): void { 

            if (!this.studyAreaService.selectedStudyArea) return;
            this.overlays = {};
            this.studyAreaService.selectedStudyArea.Features.forEach((item) => {

                //console.log('in each loop', item.name);

                if (item.name == 'globalwatershed') {
                    this.layers.overlays[item.name] = {
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
                    }

                    var bbox = this.layers.overlays[item.name].data.features[0].bbox;
                    this.leafletData.getMap("reportMap").then((map: any) => {
                        //method to reset the map for modal weirdness
                        map.invalidateSize();
                        //console.log('in getmap: ', bbox);
                        map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
                    });
                }
                if (item.name == 'globalwatershedpoint') {
                    this.layers.overlays[item.name] = {
                        name: 'Basin Clicked Point',
                        type: 'geoJSONShape',
                        data: item.feature,
                        visible: true,
                    }
                }

                if (item.name == 'regulatedWatershed') {
                    //console.log('showing regulated watershed');
                    this.layers.overlays["globalwatershedregulated"] = {
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
                    }
                }
            });
        }

        private downloadCSV() {

            //ga event
            this.angulartics.eventTrack('Download', { category: 'Report', label: 'CSV' });

            var filename = 'data.csv';

            var processParameterTable = (data) => {
                var finalVal = '\n\nParameters\n';
                if (this.studyAreaService.selectedStudyArea.Disclaimers['isRegulated']) finalVal += 'Name,Value,Reglated Value, Unregulated Value, Unit\n';
                else finalVal += 'Name,Value,Unit\n';

                data.forEach((item) => {
                    if (this.studyAreaService.selectedStudyArea.Disclaimers['isRegulated']) finalVal += item.name + ',' + item.value + ',' + item.unRegulatedValue.toFixed(2) + ',' + item.regulatedValue.toFixed(2) + ',' + item.unit + '\n';
                    else finalVal += item.name + ',' + item.value + ',' + item.unit + '\n';                   
                });
                return finalVal + '\n';
            };

            var processScenarioParamTable = (statGroup) => {
                var finalVal = '';
     
                statGroup.RegressionRegions.forEach((regressionRegion) => {
                    console.log('regression regions loop: ', regressionRegion)

                    //bail if in Area-Averaged section
                    if (regressionRegion.Name == 'Area-Averaged') return;

                    var regionPercent = 'n/a';
                    if (regressionRegion.PercentWeight) regionPercent = regressionRegion.PercentWeight.toFixed(0) + ' Percent ';
                    finalVal += statGroup.Name + ' Parameters, ' + regionPercent + regressionRegion.Name.split("_").join(" ") + '\n';
                    finalVal += 'Name,Value,Min Limit, Max Limit\n';

                    if (regressionRegion.Parameters) {
                        regressionRegion.Parameters.forEach((item) => {
                            console.log('here', item)
                            var limitMin = 'n/a';
                            var limitMax = 'n/a';
                            if (item.Limits) {
                                limitMin = item.Limits.Min.toFixed(2)
                                limitMax = item.Limits.Max.toFixed(2)
                            }
                            finalVal += item.Name + ',' + item.Value + ',' + limitMin + ',' + limitMax + '\n';
                        });
                    }
                });
                return finalVal + '\n';
            };

            var processDisclaimers = (statGroup) => {
                //console.log('Process disclaimers statGroup: ', statGroup);
                var finalVal = '*** ' + statGroup.Name + ' Disclaimers ***\n';

                angular.forEach(statGroup.Disclaimers, (i, v) => {
                    finalVal += v + ',' + i + '\n';
                });

                return finalVal + '\n';
            };

            var processScenarioFlowTable = (statGroup) => {
                //console.log('ScenarioFlowTable statGroup: ', statGroup);
                var finalVal = '';

                statGroup.RegressionRegions.forEach((regressionRegion) => {
                    console.log('ScenarioFlowTable regressionRegion: ', regressionRegion);

                    if (regressionRegion.Results) {
                        var regionPercent = 'n/a';
                        if (regressionRegion.PercentWeight) regionPercent = regressionRegion.PercentWeight.toFixed(0) + ' Percent ';
                        finalVal += statGroup.Name + ' Flow Report, ' + regionPercent + regressionRegion.Name.split("_").join(" ") + '\n';

                        var errorName = 'Error';
                        if (regressionRegion.Results[0].Errors) errorName = regressionRegion.Results[0].Errors[0].Name;
                        finalVal += 'Statistic,Value,Unit,' + errorName + ',Lower Prediction Interval,Upper Prediction Interval\n';

                        regressionRegion.Results.forEach((item) => {
                            //console.log('ScenarioFlowTable regressionRegion item: ', item);
                            var unit = '';
                            if (item.Unit) unit = item.Unit.Abbr;
                            var errors = '--';
                            if (item.Errors) errors = item.Errors[0].Value;
                            var lowerPredictionInterval = '--';
                            if (item.IntervalBounds && item.IntervalBounds.Lower) lowerPredictionInterval = item.IntervalBounds.Lower.toUSGSvalue();
                            var upperPredictionInterval = '--';
                            if (item.IntervalBounds && item.IntervalBounds.Upper) upperPredictionInterval = item.IntervalBounds.Upper.toUSGSvalue();

                            finalVal += item.Name + ',' + item.Value.toUSGSvalue() + ',' + unit + ',' + errors + ',' + lowerPredictionInterval + ',' + upperPredictionInterval + '\n';
                        });
                    }
                });
                return finalVal + '\n';
            };

            var csvFile = 'StreamStats Output Report\n\n' + 'State/Region ID,' + this.studyAreaService.selectedStudyArea.RegionID.toUpperCase() + '\nWorkspace ID,' + this.studyAreaService.selectedStudyArea.WorkspaceID + '\nLatitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toFixed(5) + '\nLongitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toFixed(5) + '\nTime,' + this.studyAreaService.selectedStudyArea.Date.toLocaleString();


            //process parametertable
            csvFile += processParameterTable(this.studyAreaService.studyAreaParameterList);

            this.nssService.selectedStatisticsGroupList.forEach((statGroup) => {
                csvFile += processScenarioParamTable(statGroup);
                if (statGroup.Disclaimers.Warnings || statGroup.Disclaimers.Errors) csvFile += processDisclaimers(statGroup);
                csvFile += processScenarioFlowTable(statGroup);
            });


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

        private downloadGeoJSON() {

            var GeoJSON = angular.toJson(this.studyAreaService.selectedStudyArea.Features[1].feature);

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


    }//end class
    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.ReportController', ReportController)
        //.controller('StreamStats.Controllers.MapController', MapController)

}//end module
   