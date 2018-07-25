//------------------------------------------------------------------------------
//----- ProsperService -------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2018 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  The service agent is responsible for initiating service calls, 
//             capturing the data that's returned and forwarding the data back to 
//             the ViewModel.
//          
//discussion:
// using https://gis.usgs.gov/sciencebase2/rest/services/Catalog/5b416046e4b060350a125fe4/MapServer/legend?f=pjson

//Comments
//07.17.2018 jkn - Created

//Import
module StreamStats.Services {
    'use strict'
    export interface IProsperService {
        projectExtent: Array<Array<number>>;
        CanQuery: boolean;
        AvailablePredictions: Array<IProsperPrediction>
        SelectedPredictions: Array<IProsperPrediction>
        DisplayedPrediction: IProsperPrediction;        
        Result: IProsperPredictionResults;

        ResetSelectedPredictions(): void 
        RestResults(): void
        GetPredictionValues(latlng:any, bounds:any): void
    }
    export interface IProsperPredictionResults {
        point: any
        date: Date;
        data: Array<any>;
    }
    export interface IProsperPrediction {
        id: number;
        name: string; 
        selected: boolean;
    }
    class ProsperService extends WiM.Services.HTTPServiceBase implements IProsperService {
        //Events
        
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public projectExtent: Array<Array<number>> = [[41.96765920367816, -125.48583984375], [49.603590524348704, -110.54443359375]]
        private toaster: any;
        private modalservices: Services.IModalService;
        public AvailablePredictions:Array<IProsperPrediction>
        public get SelectedPredictions(): Array<IProsperPrediction> {
            return this.AvailablePredictions.filter(f => { return f.selected; });
        }
        private _result: IProsperPredictionResults;
        public get Result(): IProsperPredictionResults {
            return this._result;
        }
        public DisplayedPrediction: IProsperPrediction;
        public CanQuery: boolean;        

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService, toaster, modal: Services.IModalService) {
            super($http, configuration.baseurls['ScienceBase'])

            this.toaster = toaster;
            this.modalservices = modal;
            this.init();
        }
        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public ResetSelectedPredictions(): void {
            this.RestResults();
            if (this.AvailablePredictions.length < 1) return;
            this.AvailablePredictions.forEach(ap => ap.selected = false);

        }
        public RestResults(): void {
            this._result = null;
        }
        public GetPredictionValues(evnt: any, bounds: any): void {
            this.toaster.pop('wait', "Querying prosper grids", "Please wait...", 0);
            this._result = null;

            var ppt = this.getPointArray(evnt.latlng).join();
            var imgdsplay = this.getDisplayImageArray(evnt.originalEvent.srcElement).join();
            var extent = this.boundsToExtentArray(bounds).join();
            var layers = this.SelectedPredictions.map(r => { return r.id }).join();
            //imageDisplay={0}mapExtent={1}&geometry={2}&sr={3}
            var url = configuration.queryparams['ProsperPredictions']+configuration.queryparams['ProsperIdentify']
                .format(layers,imgdsplay,extent,ppt, 4326);

            var request: WiM.Services.Helpers.RequestInfo =
                new WiM.Services.Helpers.RequestInfo(url);

            this.Execute(request).then(
                (response: any) => {
                    this.toaster.clear();
                    if (response.data.error) {
                        //console.log('query error');
                        this.toaster.pop('error', "There was an error querying prosper grids", response.data.error.message, 0);
                        return;
                    }

                    if (response.data.results.length > 0) {
                        this._result = { 
                            date: new Date(),
                            point: evnt.latlng,
                            data: response.data.results.map((r) => {
                                    return {
                                        "name": this.getCleanLabel(r.layerName),
                                        "value": r["attributes"]["Pixel Value"]
                                    };
                                })
                        };
                       
                        
                        this.toaster.pop('success', "Finished", "See results report.", 5000);                        
                        //open modal
                        this.modalservices.openModal(SSModalType.e_prosper)
                    }

                }, (error) => {
                    //sm when complete
                    //console.log('Regression query failed, HTTP Error');
                    this.toaster.clear();
                    this.toaster.pop('error', "There was an error querying prosper grids", "Please retry", 0);
                });
        }
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            this.CanQuery = false;
            this._result = null;
            this.AvailablePredictions = [];
            this.loadAvailablePredictions();

        }
        private loadAvailablePredictions():void {
            try {
            this.toaster.pop('wait', "Loading Available Prosper Predictions", "Please wait...", 0);
            var url = configuration.queryparams['ProsperPredictions'] +"/legend?f=pjson";

            var request: WiM.Services.Helpers.RequestInfo =
                new WiM.Services.Helpers.RequestInfo(url);

            this.Execute(request).then(
                (response: any) => {
                    if (response.data.error) {
                        //console.log('query error');
                        this.toaster.pop('error', "There was an error querying prosper predictions", response.data.error.message, 0);
                        return;
                    }
                    this.AvailablePredictions.length = 0;
                    var layers: Array<any> = response.data.layers;
                    if (layers.length > 0) {
                        layers.map(l => { return { id: l.layerId, name: this.getCleanLabel(l.layerName), selected: false } }).forEach(p =>
                            this.AvailablePredictions.push(p));
                        
                        this.DisplayedPrediction = this.AvailablePredictions[0];
                    }

                    this.toaster.clear();

                }, (error) => {
                    //sm when complete
                    this.toaster.pop('error', "There was an HTTP error querying coordinated reach", "Please retry", 0);
                });


            } catch (e) {
                console.log("There was an error requesting available prosper predictions." + e)
            }
        }
        private boundsToExtentArray(bounds: any):Array<number> {
            return [
                bounds.southWest.lng,
                bounds.southWest.lat,
                bounds.northEast.lng,
                bounds.northEast.lat
            ];
        }
        private getDisplayImageArray(srcElem: any): Array<number> {
            return [
                srcElem.width,
                srcElem.height,
                96
            ];
        }
        private getPointArray(latlng: any): Array<number> {
            return [
                latlng.lng,
                latlng.lat
            ];
        }
        private getCleanLabel(label: string): string {
            return label.replace(/\.[^/.]+$/, "")
        }
    }//end class
    factory.$inject = ['$http', '$q', 'toaster', 'StreamStats.Services.ModalService'];
    function factory($http: ng.IHttpService, $q: ng.IQService, toaster: any, modalService:Services.IModalService) {
        return new ProsperService($http, $q, toaster, modalService)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.ProsperService', factory)
}//end module 