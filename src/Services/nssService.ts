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
        onselectedStatisticsGroupChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        statisticsGroupList: Array<IStatisticsGroup>;
        selectedStatisticsGroupParameterList: Array<IParameter>;
        selectedStatisticsGroup: IStatisticsGroup;
        loadStatisticsGroupTypes(rcode: string, regressionregion: string);
        loadParametersByStatisticsGroup(rcode: string, statisticsGroupID: string, regressionregion: string);
    }
    export interface IStatisticsGroup {
        ID: string;
        Name: string;
        Code: string;
    }

    export class StatisticsGroup implements IStatisticsGroup {
        //properties
        public ID: string;
        public Name: string;
        public Code: string;

    }//end class


    class nssService extends WiM.Services.HTTPServiceBase {       
        //Events
        private _onselectedStatisticsGroupChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        public get onselectedStatisticsGroupChanged(): WiM.Event.Delegate<WiM.Event.EventArgs> {
            return this._onselectedStatisticsGroupChanged;
        }

        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public statisticsGroupList: Array<IStatisticsGroup>;
        public selectedStatisticsGroupParameterList: Array<IParameter>;
        public selectedStatisticsGroup: IStatisticsGroup;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService) {
            super($http, configuration.baseurls['NSS']);
            this._onselectedStatisticsGroupChanged = new WiM.Event.Delegate<WiM.Event.EventArgs>();
            this.statisticsGroupList = [];
            this.selectedStatisticsGroupParameterList = [];
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public loadStatisticsGroupTypes(rcode: string, regressionregion: string) {
            console.log('in load StatisticsGroups', rcode);
            if (!rcode) return;

            var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupLookup'].format(rcode, regressionregion);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {
                    //console.log(response.data);
                    var statisticsGroupList = this.statisticsGroupList;
                    angular.forEach(response.data, function (value, key) {
                        statisticsGroupList.push(value);
                    });
                    //console.log(statisticsGroupList);
                    //sm when complete
                },(error) => {
                    //sm when complete
                }).finally(() => { });
        }

        public loadParametersByStatisticsGroup(rcode: string, statisticsGroupID: string, regressionregion: string) {
            //var deferred = ng.IQService.defer();
            console.log('in load StatisticsGroup parameters', rcode, statisticsGroupID,regressionregion);
            if (!rcode && !statisticsGroupID && !regressionregion) return;

            var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupParameterLookup'].format(rcode,statisticsGroupID,regressionregion);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.selectedStatisticsGroupParameterList = [];
            this.Execute(request).then(
                (response: any) => {
                    console.log('here', response);
                    if (response.data[0].RegressionRegions[0].Parameters && response.data[0].RegressionRegions[0].Parameters.length > 0) {
                        console.log('test1');
                        response.data[0].RegressionRegions[0].Parameters.map((item) => {
                            try {
                                //console.log(item);
                                this.selectedStatisticsGroupParameterList.push(item);
                            }
                            catch (e) {
                                alert(e);
                            }
                            
                            //return this.selectedStatisticsGroupParameterList;
                        });
                        //console.log(this.selectedStatisticsGroupParameterList);
                    }

                       
                    /*
                        angular.forEach(response.data.Parameters, function (value, key) {
                            value.selected = true;
                            this.selectedStatisticsGroupParameterList.push(value);
                        });
                        */
                      
                    //sm when complete
                },(error) => {
                    //sm when complete
                }).finally(() => {  });
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