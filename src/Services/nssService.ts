//------------------------------------------------------------------------------
//----- nssService -----------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2015 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  The service agent is responsible for initiating service calls, 
//             capturing the data that's returned and forwarding the data back to 
//             the Controller.
//          
//discussion:
//
//https://docs.angularjs.org/api/ng/service/$http

//Comments
//06.16.2015 mjs - Created

//Import
module StreamStats.Services {
    'use strict'
    export interface InssService {
        onSelectedScenarioChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        scenarioList: Array<IScenario>;
        loadScenariosByRegion(regionid:string);
    }
    export interface IScenario {
        StateCode: string;
        ModelType: string;
        Description: string;
        Warnings: string;
        LINKS: any;
    }

    export class Scenario implements IScenario {
        //properties
        public StateCode: string;
        public ModelType: string;
        public Description: string;
        public Warnings: string;
        public LINKS: any;

    }//end class


    class nssService extends WiM.Services.HTTPServiceBase {       
        //Events
        private _onSelectedScenarioChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        public get onSelectedScenarioChanged(): WiM.Event.Delegate<WiM.Event.EventArgs> {
            return this._onSelectedScenarioChanged;
        }

        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public scenarioList: Array<IScenario>;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService) {
            super($http, configuration.baseurls['NSS']);
            this._onSelectedScenarioChanged = new WiM.Event.Delegate<WiM.Event.EventArgs>();
            this.scenarioList = [];
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public loadScenariosByRegion(regionid: string) {
            console.log('in load scenarios', regionid);
            if (!regionid) return;

            var url = configuration.queryparams['scenarioService'].format(regionid);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url);

            this.Execute(request).then(
                (response: any) => {
                    //console.log(response.data);
                    var scenarioList = this.scenarioList;
                    angular.forEach(response.data, function (value, key) {
                        scenarioList.push(value);
                    });
                    console.log(scenarioList);
                    //sm when complete
                },(error) => {
                    //sm when complete
                }).finally(() => { });
        }
        //HelperMethods
        //-+-+-+-+-+-+-+-+-+-+-+-


    }//end class

    factory.$inject = ['$http', '$q'];
    function factory($http: ng.IHttpService, $q: ng.IQService) {
        return new nssService($http, $q)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.nssService', factory)
}//end module  