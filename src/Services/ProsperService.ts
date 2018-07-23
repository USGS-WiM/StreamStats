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
        availablePredictions: Array<IProsperPrediction>
        selectedPredictions: Array<IProsperPrediction>

        ResetSelectedPredictions(): void 
        GetPredictionValues(): void
    }
    export interface IProsperPrediction {
        id: number;
        name: string; 
        selected: boolean;
    }
    export var onSelectedMethodExecuteComplete: string = "onProsperPredictionValues";

    export class ProsperServiceEventArgs extends WiM.Event.EventArgs {
        //properties            

        constructor() {
            super();
        }

    }
    class ProsperService extends WiM.Services.HTTPServiceBase implements IProsperService {
        //Events

        
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public toaster: any;
        public availablePredictions:Array<IProsperPrediction>
        public get selectedPredictions(): Array<IProsperPrediction> {
            return this.availablePredictions.filter(f => { return f.selected; });
        }

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService, toaster, private eventManager: WiM.Event.IEventManager) {
            super($http, configuration.baseurls['ScienceBase'])

            this.toaster = toaster;
            this.init();

        }
        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public ResetSelectedPredictions():void {
            if (this.availablePredictions.length < 1) return;
            this.availablePredictions.forEach(ap => ap.selected = false);

        }
        public GetPredictionValues(): void {
            //do something and raise event when done
        }
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            this.availablePredictions = [];
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
                    this.availablePredictions.length = 0;
                    var layers: Array<any> = response.data.layers;
                    if (layers.length > 0) {
                        layers.map(l => { return { id: l.layerId, name: l.layerName.replace(/\.[^/.]+$/, ""), selected: false } }).forEach(p =>
                            this.availablePredictions.push(p));
                        
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

    }//end class
    factory.$inject = ['$http', '$q', 'toaster', 'WiM.Event.EventManager'];
    function factory($http: ng.IHttpService, $q: ng.IQService, toaster: any,eventmngr) {
        return new ProsperService($http, $q, toaster,eventmngr)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.ProsperService', factory)
}//end module 