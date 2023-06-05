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
        public stationCodes = [];
        public peakData = [];
        public estPeakData = [];
        public drainageData = [];
        public sce: any;
        private _results: Services.IProsperPredictionResults;
        public get Location() {
            return this._results.point;
        }
        public get Date() {
            return this._results.date;
        }
        private _table: any
        public get Table(): any {
            return this._table
        }
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        //private _prosperServices: Services.IProsperService;
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
        static $inject = ['$scope', '$http', '$modalInstance', '$sce', 'StreamStats.Services.ProsperService'];
        constructor($scope: IEnvelopeCurveScope, $http: ng.IHttpService, modal: ng.ui.bootstrap.IModalServiceInstance, $sce: any, pservices: StreamStats.Services.IProsperService) {
            super($http, configuration.baseurls.StreamStats);
            $scope.vm = this;
            this.sce = $sce;
            this.modalInstance = modal;
            this.init();
        }

        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-

        //Query Gages With Bounding Box
        public getStationIDs() {
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
                        console.log('peaks', this.peakData)
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
                console.log(url)
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
                                            x: index.value,
                                            y: peakElement.peak_va,
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
            console.log('plot data', formattedPlotData);
        }

        private init(): void {
            this.getStationIDs();
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