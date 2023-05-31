//Controller for Envelope Curve Plots
        //Import
        module StreamStats.Controllers {
            'use strict';
            interface IEnvelopeCurveScope extends ng.IScope {
                vm: IEnvelopeCurveController;
            }

            interface IModal {
                Close():void
            }
            
            interface IEnvelopeCurveController  extends IModal {
            }
            class EnvelopeCurveController extends WiM.Services.HTTPServiceBase implements IEnvelopeCurveController{
                //Properties
                //-+-+-+-+-+-+-+-+-+-+-+-

                // Plot properties
                public stationCodes = [];
                public sce: any;
                private _results: Services.IProsperPredictionResults;
                public get Location() {
                    return this._results.point;
                }
                public get Date() {
                    return this._results.date;
                }
                private _table:any
                public get Table(): any {
                    return this._table
                }
                private modalInstance: ng.ui.bootstrap.IModalServiceInstance;    
                //private _prosperServices: Services.IProsperService;
                private _resultsAvailable: boolean;
                public get ResultsAvailable():boolean {
                    return this._resultsAvailable;
                }
                public convertUnsafe(x: string) {
                    return this.sce.trustAsHtml(x);
                };
                public get Description():string {
                    var desc = "Envelope Curve Plot";
                    return this.sce.trustAsHtml(desc);
                }
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', '$modalInstance', '$sce','StreamStats.Services.ProsperService'];
        constructor($scope: IEnvelopeCurveScope, $http: ng.IHttpService, modal: ng.ui.bootstrap.IModalServiceInstance, $sce: any, pservices:StreamStats.Services.IProsperService) {
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
            console.log('here', url)
            this.Execute(request).then(
                (response: any) => {
                let data = response;
                const stations = [];
                console.log(data.data.features)
                data.data.features.forEach(row => {
                    let site = row.properties.Code
                    stations.push(site);
                })
                console.log(stations)
                this.stationCodes = stations;
                }, (error) => {
                }).finally(() => {
                    this.getStationStats;
                });
        } 

        public getStationStats() {
            this.stationCodes.forEach(station => {
                const url = 'https://nwis.waterdata.usgs.gov/usa/nwis/peak/?format=rdb&site_no=' + station

            })
            // const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            // this.Execute(request).then(
            //     (response: any) => {
            //     let data = response;
            //     const stations = [];
            //     console.log(data.data.features)
            //     data.data.features.forEach(row => {
            //         let site = row.properties.Code
            //         stations.push(site);
            //     })
            //     console.log(stations)
            //     this.stationCodes = stations;
            //     }, (error) => {
            //     }).finally(() => {
            //         this.getStationStats;
            //     });
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