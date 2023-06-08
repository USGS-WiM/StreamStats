//Controller for Envelope Curve Plots
//Import
module StreamStats.Controllers {
    'use strict';
    interface IEnvelopeCurveScope extends ng.IScope {
        vm: IEnvelopeCurveController;
    }

    interface IModal {
        Close(): void
    }

    interface IEnvelopeCurveController extends IModal {
    }
    class EnvelopeCurveController extends WiM.Services.HTTPServiceBase implements IEnvelopeCurveController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-

        // Plot properties
        public regionCodesList = [];
        public stationCodes = [];
        public peakData = [];
        public estPeakData = [];
        public drainageData = [];
        public formattedPlotData = [];
        public selectedRegion;
        public sce: any;
        private _table: any
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        private modalService: Services.IModalService;
        private _resultsAvailable: boolean;
        public get ResultsAvailable(): boolean {
            return this._resultsAvailable;
        }
        public convertUnsafe(x: string) {
            return this.sce.trustAsHtml(x);
        };
        public get Description(): string {
            var desc = "Envelope Curve Plot";
            return this.sce.trustAsHtml(desc);
        }
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.ModalService', '$modalInstance'];
        envelopeChartConfig: {  chart: {height: number, width: number, zooming: {type: string}},
                        title: { text: string, align: string},
                        subtitle: { text: string, align: string}, 
                        xAxis: { title: {text: string}},
                        yAxis: { title: {text: string}},
                        series: { name: string; tooltip: { headerFormat: string, pointFormatter: Function}, turboThreshold: number; type: string, color: string, 
                                data: number[], marker: {symbol: string, radius: number}, showInLegend: boolean; }[]; };
        constructor($scope: IEnvelopeCurveScope, $http: ng.IHttpService, modalService: Services.IModalService, modal: ng.ui.bootstrap.IModalServiceInstance, $sce: any) {
            super($http, configuration.baseurls.StreamStats);
            $scope.vm = this;
            this.sce = $sce;
            this.selectedRegion = [];
            this.modalInstance = modal;
            this.modalService = modalService;
            this.init();
        }

        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-

        //Pull in Regional Codes for dropdown
        public chooseRegionalCode () {
            const url = 'https://streamstats.usgs.gov/gagestatsservices/regions'
            const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            this.Execute(request).then(
                (response: any) => {
                    this.regionCodesList = response.data;
                    //let regions = response.data
                    //let  regionCodeList = [];
                    // regions.forEach(region => {
                    //     let regionCodes = region.code;
                    //     regionCodeList.push(regionCodes);
                    // })
                    //this.regionCodesList = regionCodeList;
                    //console.log('codes', this.regionCodesList);
                })
                if (this.selectedRegion.name === this.selectedRegion.name && this.selectedRegion.name !== undefined) {
                    this.getStationIDs();
                }
        }

        //Query Gages With Bounding Box
        public getStationIDs() {
            console.log(this.selectedRegion.code)

            //URL for stations by REGION
            const regionalUrl = 'https://streamstats.usgs.gov/gagestatsservices/stations?regions=' + this.selectedRegion.code + '&pageCount=3000';
            console.log(regionalUrl)
            //URL for stations by BOUNDS
            const url = 'https://streamstats.usgs.gov/gagestatsservices/stations/Bounds?xmin=-81.21485781740073&ymin=33.97528059290039&xmax=-81.03042363540376&ymax=34.10508178764378&geojson=true&includeStats=false'
            const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            //console.log('here', url)
            this.Execute(request).then(
                (response: any) => {
                    //console.log(response)
                    const stations = [];

                    //DATA from REGION
                    // let data = response.data;
                    // data.forEach(station => {
                    //     let site = station.code;
                    //     stations.push(site);
                    // })

                    //DATA from BOUNDS
                    let data = response;
                    data.data.features.forEach(row => {
                        let site = row.properties.Code
                        stations.push(site);
                    })
                    this.stationCodes = stations;

                }, (error) => {
                }).finally(() => {
                    this.getStationStats();
                });
        }        

        public getStationStats() {
            let peakData = [];
            let estPeakData = [];
            this.stationCodes.forEach(station => {
                const url = 'https://nwis.waterdata.usgs.gov/usa/nwis/peak/?format=rdb&site_no=' + station
                //console.log(url)
                const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(
                    (response: any) => {

                        const data = response.data.split('\n').filter(r => { return (!r.startsWith("#") && r != "") });
                        data.shift().split('\t');
                        //remove extra random line
                        data.shift();
                        do {
                            let dataRow = data.shift().split('\t');
                            const peakObj = {
                                agency_cd: dataRow[0],
                                site_no: dataRow[1],
                                peak_dt: dataRow[2],
                                peak_va: parseInt(dataRow[4]),
                                peak_stage: parseFloat(dataRow[6])
                            };
                            peakData.push(peakObj)
                            //making a new array of invalid dates (dates with month or day of '00') that will be 'estimated' (changed to '01')
                            const estPeakObj = {
                                agency_cd: dataRow[0],
                                site_no: dataRow[1],
                                peak_dt: dataRow[2].replaceAll('-00', '-01'),
                                peak_va: parseInt(dataRow[4]),
                                peak_stage: parseFloat(dataRow[6])
                            };
                            if (peakObj.peak_dt[8] + peakObj.peak_dt[9] === '00' || peakObj.peak_dt[5] + peakObj.peak_dt[6] === '00') {
                                estPeakData.push(estPeakObj) //pushing invalid dates to a new array
                            };
                        } while (data.length > 0);
                        this.peakData = peakData;
                        //console.log('peaks', this.peakData)
                        this.estPeakData = estPeakData;
                        this.getDrainageArea();

                    }
                )
            })
        }

        public getDrainageArea() {
            let formattedPlotData = [];
            let completedStationCodes = [];
            this.stationCodes.forEach(station => {
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + station;
                //console.log(url)
                const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(
                    (response: any) => {
                        let characteristics = response.data.characteristics;
                        characteristics.forEach(index => {
                            //some of these stations have multiple drainage area values -- which one to use?
                            //(index.comments === "null") on some but so do stations with only a single value
                            //console.log(index.comments === 'null', index)
                            if (index.variableTypeID === 1) {
                                this.peakData.forEach(peakElement => {
                                    if (peakElement.site_no === response.data.code && completedStationCodes.indexOf(response.data.code) == -1) {
                                        let formattedPeaksAndDrainage = {
                                            x: parseFloat(index.value),
                                            y: parseFloat(peakElement.peak_va),
                                            stationCode: peakElement.site_no,
                                            Date: peakElement.peak_dt
                                        }
                                        formattedPlotData.push(formattedPeaksAndDrainage);
                                    }
                                })
                                completedStationCodes.push(response.data.code)
                            }
                        });
                    })
            });
            //console.log('plot data', formattedPlotData);
            this.formattedPlotData = formattedPlotData;
            this.createEnvelopeCurvePlot();
        }
        
        public createEnvelopeCurvePlot(): void {
            //console.log('inside plot function', this.formattedPlotData);
            this.envelopeChartConfig = {  
                chart: {
                    height: 550, 
                    width: 800, 
                    zooming: {type: 'xy'}
                },
                title: { 
                    text: 'Envelope Curve', 
                    align: 'center'
                },
                subtitle: { 
                    text: 'example', 
                    align: 'center'
                }, 
                xAxis: {
                    title: {text: 'Drainage Area, in mi²'}
                },
                yAxis: { 
                    title: {text: 'Peak Flow, in ft³/s'}
                },
                series: [{ 
                    name: 'Peak Flow', 
                    tooltip: { 
                        headerFormat: '', 
                        pointFormatter: function() {
                            if (this.formattedPlotData !== null){
                            return '</b><br>Value: <b>' + this.x + 'ft³/s</b><br>Site Number: <b>' + this.stationCode + '<br>'
                            }
                        }
                    }, 
                    turboThreshold: 0,
                    type: 'scatter', 
                    color: 'blue', 
                    data: this.formattedPlotData,
                    marker: {symbol: 'circle', radius: 3}, 
                    showInLegend: true
                }]
            }
        }

        private init(): void {
            this.chooseRegionalCode();
        }
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-

        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }
    }

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.EnvelopeCurveController', EnvelopeCurveController);
}//end module 