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
        CanQuery: boolean;
        AvailablePredictions: Array<IProsperPrediction>
        SelectedPredictions: Array<IProsperPrediction>
        DisplayedPrediction: IProsperPrediction;

        ResetSelectedPredictions(): void 
        GetPredictionValues(latlng:any, bounds:any): void
    }
    export interface IProsperPrediction {
        id: number;
        name: string; 
        selected: boolean;
    }
    export var onProsperLayerChanged: string = "onProsperLayerChanged";

    export class ProsperServiceEventArgs extends WiM.Event.EventArgs {
        //properties            
        public layerID: number;
        public name: string;
        public value: number;

        constructor() {
            super();
        }

    }
    class ProsperService extends WiM.Services.HTTPServiceBase implements IProsperService {
        //Events

        
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private toaster: any;
        public AvailablePredictions:Array<IProsperPrediction>
        public get SelectedPredictions(): Array<IProsperPrediction> {
            return this.AvailablePredictions.filter(f => { return f.selected; });
        }
        public DisplayedPrediction: IProsperPrediction;
        public CanQuery: boolean;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService, toaster) {
            super($http, configuration.baseurls['ScienceBase'])

            this.toaster = toaster;
            this.init();

        }
        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public ResetSelectedPredictions():void {
            if (this.AvailablePredictions.length < 1) return;
            this.AvailablePredictions.forEach(ap => ap.selected = false);

        }
        public GetPredictionValues(evnt: any, bounds: any): void {
             this.toaster.pop('wait', "Querying prosper grids", "Please wait...", 0);

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
                    if (response.data.error) {
                        //console.log('query error');
                        this.toaster.pop('error', "There was an error querying prosper grids", response.data.error.message, 0);
                        return;
                    }

                    if (response.data.results.length > 0) {

                        var results = response.data.results.reduce((dict, r) => {
                            dict[r.layerName.replace(/\.[^/.]+$/, "")] = r["attributes"]["Pixel Value"]; return dict;
                        }, {})

                        this.toaster.pop('success', "Selected reach is a coordinated reach", "Please continue", 5000);
                    }

                }, (error) => {
                    //sm when complete
                    //console.log('Regression query failed, HTTP Error');
                    this.toaster.pop('error', "There was an error querying prosper grids", "Please retry", 0);
                });
        }
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            this.CanQuery = false;
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
                        layers.map(l => { return { id: l.layerId, name: l.layerName.replace(/\.[^/.]+$/, ""), selected: false } }).forEach(p =>
                            this.AvailablePredictions.push(p));
                        
                        this.DisplayedPrediction = this.AvailablePredictions[0];
                    }

                }, (error) => {
                    //sm when complete
                    this.toaster.pop('error', "There was an HTTP error querying coordinated reach", "Please retry", 0);
                });


            } catch (e) {
                console.log("There was an error requesting available prosper predictions." + e)
            }
            finally {
                this.toaster.clear();
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
    }//end class
    factory.$inject = ['$http', '$q', 'toaster'];
    function factory($http: ng.IHttpService, $q: ng.IQService, toaster: any) {
        return new ProsperService($http, $q, toaster)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.ProsperService', factory)
}//end module 