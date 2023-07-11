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
            this.selectedRegion = [];
            this.sce = $sce;
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
                })
        }

        public loadPlot() {
            this.getStationIDs();
        }


        //Query Gages With Bounding Box
        public getStationIDs() {
            if (this.selectedRegion.length !== 0) {
                //URL for stations by REGION
                const regionalUrl = 'https://streamstats.usgs.gov/gagestatsservices/stations?regions=' + this.selectedRegion.code + '&pageCount=1000&includeStats=false&geojson=true';
                const regionalRequest: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(regionalUrl, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(regionalRequest).then(
                    (response: any) => {
                        const stations = [];
                        //DATA from REGION
                        let data = response.data.features;
                        data.forEach(station => {
                            let site = station.properties.Code;
                            stations.push(site);
                        })
                        this.stationCodes = stations;
                        
                        //console.log('stationCodes', this.stationCodes.toString())
                        //console.log('stationString commas', (stationString.match(/,/g) || []).length);
                        //console.log('should return 3', ("str1,str2,str3,str4".match(/,/g) || []).length);
                    }, (error) => {
                    }).finally(() => {
                        this.getStationStats();
                    });
            } else {

            const url = 'https://streamstats.usgs.gov/gagestatsservices/stations/Bounds?xmin=-81.21485781740073&ymin=33.97528059290039&xmax=-81.03042363540376&ymax=34.10508178764378&geojson=true&includeStats=false'
            const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            //console.log('here', url)
            this.Execute(request).then(
                (response: any) => {
                    let data = response;
                    const stations = [];
                    data.data.features.forEach(row => {
                        let site = row.properties.Code
                        stations.push(site);
                    })
                    this.stationCodes = stations;
                    console.log('station codes', this.stationCodes);
                }, (error) => {
                }).finally(() => {
                    //this.getStationStats();
                });
        }
    }


        public getStationStats() {
            console.log('getStationStats');
            let peakData = [];
            let estPeakData = [];
            //this.stationCodes.forEach(station => {
                let stationString = this.stationCodes.toString();
                let numberOfGroups = Math.ceil(this.stationCodes.length / 50);
                let arrayLength = this.stationCodes.length;
                console.log(this.stationCodes.length, numberOfGroups );
                for (let counter = 50; counter < (arrayLength +50) ; counter+=50 ) {
                    let arraySegment = this.stationCodes.slice(counter - 50, counter);
                    //console.log(arraySegment);
                    //console.log(counter)
                    const url = 'https://nwis.waterdata.usgs.gov/usa/nwis/peak/?format=rdb&site_no=' + arraySegment.toString();
                    //console.log(url);
                    const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                    this.Execute(request).then(
                        (response: any) => {
                            const data = response.data.split('\n').filter(r => { return (!r.startsWith("#") && r != "") });
                            data.shift().split('\t');
                            data.shift();

                            console.log(data);
                        })                    
                }
                const slicedArray = this.stationCodes.slice(0, 50);
                //console.log(slicedArray);
                const url = 'https://nwis.waterdata.usgs.gov/usa/nwis/peak/?format=rdb&site_no=' + slicedArray.toString();
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
                        this.estPeakData = estPeakData;
                    }, (error) => {
                    }).finally(() => {
                        this.getDrainageArea();
                });
            //})
        }

        public getDrainageArea() {
            console.log('getDrainageArea');

            let formattedPlotData = [];
            let completedStationCodes = [];
            const slicedArray = this.stationCodes.slice(0, 50);
            slicedArray.forEach((station, index) => {
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + station;
                //console.log(url)
                const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(
                    (response: any) => {
                        let characteristics = response.data.characteristics;
                        characteristics.forEach(index => {
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
                            }
                        })
                        completedStationCodes.push(response.data.code)
                        this.formattedPlotData = formattedPlotData;
                
                
                }, (error) => {
                }).finally(() => {
                    if (slicedArray.length-1 === index) {
                    this.createEnvelopeCurvePlot();
                    }
            });
        })

        
        }
        
        public createEnvelopeCurvePlot(): void {
            console.log('createEnvelopeCurvePlot');

            console.log('inside plot function', this.formattedPlotData);
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
                    text: this.selectedRegion.name, 
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
                            return '</b><br>Value: <b>' + this.y + ' ft³/s</b><br>Site Number: <b>' + this.stationCode + '</b><br>Drainage Area: <b>' + this.x + ' mi²</b><br>'
                            }
                        }
                    }, 
                    turboThreshold: 0,
                    type: 'scatter', 
                    color: 'rgba(83, 223, 83, .5)', 
                    //opacity: 0.5,
                    data: this.formattedPlotData,
                    marker: {symbol: 'circle', radius: 3}, 
                    showInLegend: true
                }]
            }
        }

        private init(): void {
            //this.getStationIDs();
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