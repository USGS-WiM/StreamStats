//------------------------------------------------------------------------------
//----- AuthenticationAgent ---------------------------------------------------------------
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
//             the ViewModel.
//          
//discussion:
//
//https://www.sitepen.com/blog/2014/08/22/advanced-typescript-concepts-classes-types/
//http://blog.oio.de/2014/01/31/an-introduction-to-typescript-module-system/

//Comments
//03.26.2015 jkn - Created

//Import
declare var configuration: any;

module StreamStats.ServiceAgent {
    'use strict';


    class FDCTMAgent extends ServiceAgentBase  implements IFDCTMAgent, IScenarioAgent {
        // Properties
        public canInit: boolean;
        public canLoad: boolean;
        public canRun: boolean;


        // Constructor
        constructor($http: ng.IHttpService) {
            super($http, configuration.appSettings['RegressionService']);
            
        }

        //Methods
        public Init(): ng.IPromise<Models.IScenario> {
            try {
                return null;
            }
            catch (e) {

            }
        }
        public Load(scenarioByRef: Models.IScenario): boolean {
            try {
                //javascript passes objects by reference
                
                return false;
            }
            catch (e) {

            }
        }
        public Run( scenarioByRef: Models.IScenario): boolean {
            try {
                //javascript passes objects by reference

            }
            catch (e) {

                return false;
            }
        }        
        //Helper Methods

    }//end class
    
    //factory injections
    factory.$inject = ['$http'];
    function factory($http: ng.IHttpService): IFDCTMAgent {
        return new FDCTMAgent($http);
    }
    //angular module service registration call
    angular
        .module('StreamStats.ServiceAgent')
        .factory('StreamStats.ServiceAgent.FDCTMAgent', factory);
}//end module