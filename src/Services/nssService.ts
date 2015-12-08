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
        selectedStatisticsGroupScenario: any;
        selectedStatisticsGroupScenarioResults: any;
        loadStatisticsGroupTypes(rcode: string, regressionregion: string);
        loadParametersByStatisticsGroup(rcode: string, statisticsGroupID: string, regressionregion: string);
        estimateFlows(studyAreaParameterList: any, rcode: string, statisticsGroupID: string, regressionregion: string)
        showBasinCharacteristicsTable: boolean;
        showFlowsTable: boolean;
        clearNSSdata();
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
        public loadingStatisticsGroup: boolean;
        public selectedStatisticsGroupParameterList: Array<IParameter>;
        public selectedStatisticsGroup: IStatisticsGroup;
        public selectedStatisticsGroupScenario: any;
        public selectedStatisticsGroupScenarioResults: any;
        public canUpdate: boolean;
        public toaster: any;
        public showBasinCharacteristicsTable: boolean;
        public showFlowsTable: boolean;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService, toaster) {
            super($http, configuration.baseurls['NSS']);
            this.toaster = toaster
            this._onselectedStatisticsGroupChanged = new WiM.Event.Delegate<WiM.Event.EventArgs>();
            this.clearNSSdata();
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public clearNSSdata() {
            console.log('in clear nss data');
            this.statisticsGroupList = [];
            this.selectedStatisticsGroup = null;
            this.selectedStatisticsGroupParameterList = [];
            this.selectedStatisticsGroupScenario = [];
            this.selectedStatisticsGroupScenarioResults = [];
            this.canUpdate = true;
        }

        public loadStatisticsGroupTypes(rcode: string, regressionregion: string) {

            this.toaster.pop('info', "Loading Available Scenarios", "Please wait...", 0);
            console.log('in load StatisticsGroups', rcode);
            if (!rcode && !regressionregion) return;

            var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupLookup'].format(rcode, regressionregion);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.statisticsGroupList = [];
            this.loadingStatisticsGroup = true;

            this.Execute(request).then(
                (response: any) => {
                    console.log(response.data);
                    if (response.data.length > 0) {
                        this.loadingStatisticsGroup = false;
                        
                        var statisticsGroupList = this.statisticsGroupList;
                        angular.forEach(response.data, function (value, key) {
                            statisticsGroupList.push(value);
                        });
                    }
                    this.toaster.clear();
                },(error) => {
                    //sm when complete
                    this.toaster.clear();
                    this.toaster.pop('error', "There was an error Loading Available Scenarios", "Please retry", 5000);
                }).finally(() => {
                    this.loadingStatisticsGroup = false;
                });
        }

        public loadParametersByStatisticsGroup(rcode: string, statisticsGroupID: string, regressionregion: string) {

            this.toaster.pop('info', "Load Parameters by Scenario", "Please wait...", 0);

            //var deferred = ng.IQService.defer();
            console.log('in load StatisticsGroup parameters', rcode, statisticsGroupID,regressionregion);
            if (!rcode && !statisticsGroupID && !regressionregion) return;

            var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupParameterLookup'].format(rcode,statisticsGroupID,regressionregion);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.selectedStatisticsGroupParameterList = [];
            this.Execute(request).then(
                (response: any) => {
                    if (response.data[0].RegressionRegions[0].Parameters && response.data[0].RegressionRegions[0].Parameters.length > 0) {
                        this.selectedStatisticsGroupScenario = response.data;
                        response.data[0].RegressionRegions[0].Parameters.map((item) => {
                            try {
                                //console.log(item);
                                this.selectedStatisticsGroupParameterList.push(item);
                            }
                            catch (e) {
                                alert(e);
                            }
                        });
                    }
                    this.toaster.clear();
                    //sm when complete
                },(error) => {
                    //sm when error
                    this.toaster.clear();
                    this.toaster.pop('error', "There was an error Loading Parameters by Statistics Group", "Please retry", 5000);
                }).finally(() => {

                });
        }

        public estimateFlows(studyAreaParameterList: any, rcode: string, statisticsGroupID: string, regressionregion: string) {

            this.toaster.pop('info', "Estimating Flows", "Please wait...", 0);
            this.canUpdate = false;
            if (!studyAreaParameterList && !rcode && !statisticsGroupID && !regressionregion) return;
            console.log('in estimate flows method');

            //swap out computed values in object
            this.selectedStatisticsGroupScenario[0].RegressionRegions[0].Parameters.map(function (val) {
                angular.forEach(studyAreaParameterList, function (value, index) {
                    if (val.Code.toLowerCase() == value.code.toLowerCase()) {
                        console.log('updating parameter in scenario object for: ', val.Code, ' from: ', val.Value, ' to: ', value.value);
                        val.Value = value.value;
                    }
                });
            });

            var updatedScenarioObject = JSON.stringify(this.selectedStatisticsGroupScenario, null);
            console.log('updated scenario object: ', updatedScenarioObject);

            //do request
            var url = configuration.baseurls['NSS'] + configuration.queryparams['estimateFlows'].format(rcode, statisticsGroupID, regressionregion);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, 1, 'json', updatedScenarioObject);

            this.selectedStatisticsGroupScenarioResults = [];
            this.Execute(request).then(
                (response: any) => {    
                    console.log(response);
                    if (response.data[0].RegressionRegions[0].Results && response.data[0].RegressionRegions[0].Results.length > 0) {
                        response.data[0].RegressionRegions[0].Results.map((item) => {
                            try {
                                this.selectedStatisticsGroupScenarioResults.push(item);
                            }
                            catch (e) {
                                alert(e);
                            }
                        });
                        
                    }
                    this.toaster.clear();
                    //sm when complete
                },(error) => {
                    //sm when error
                    this.toaster.clear();
                    this.toaster.pop('error', "There was an error Estimating Flows", "Please retry", 5000);
                }).finally(() => {
                    this.canUpdate = true;
            });

        }


        //HelperMethods
        //-+-+-+-+-+-+-+-+-+-+-+-

    }//end class

    factory.$inject = ['$http', '$q', 'toaster'];
    function factory($http: ng.IHttpService, $q: ng.IQService, toaster:any) {
        return new nssService($http, $q, toaster)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.nssService', factory)
}//end module  