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
        onSelectedStatisticsGroupChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        selectedStatisticsGroupList: Array<IStatisticsGroup>;
        loadStatisticsGroupTypes(rcode: string, regressionregion: string);
        loadParametersByStatisticsGroup(rcode: string, statisticsGroupID: string, regressionregion: string, percentWeights: any);
        estimateFlows(studyAreaParameterList: any, rcode: string, regressionregion: string)
        showBasinCharacteristicsTable: boolean;
        showFlowsTable: boolean;
        clearNSSdata();
        queriedRegions: boolean;
    }
    export interface IStatisticsGroup {
        ID: string;
        Name: string;
        Code: string;
        RegressionRegions: Array<any>;
        Results: Array<any>;
        Citations: any;
    }

    export class StatisticsGroup implements IStatisticsGroup {
        //properties
        public ID: string;
        public Name: string;
        public Code: string;
        public RegressionRegions: Array<any>;
        public Results: Array<any>;
        public Citations: any;

    }//end class


    class nssService extends WiM.Services.HTTPServiceBase {       
        //Events
        private _onSelectedStatisticsGroupChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        public get onSelectedStatisticsGroupChanged(): WiM.Event.Delegate<WiM.Event.EventArgs> {
            return this._onSelectedStatisticsGroupChanged;
        }

        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public statisticsGroupList: Array<IStatisticsGroup>;
        public loadingStatisticsGroup: boolean;
        public selectedStatisticsGroupList: Array<IStatisticsGroup>;
        public canUpdate: boolean;
        public toaster: any;
        public showBasinCharacteristicsTable: boolean;
        public showFlowsTable: boolean;
        public queriedRegions: boolean;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService, toaster) {
            super($http, configuration.baseurls['NSS']);
            this.toaster = toaster
            this._onSelectedStatisticsGroupChanged = new WiM.Event.Delegate<WiM.Event.EventArgs>();
            this.clearNSSdata();
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public clearNSSdata() {
            //console.log('in clear nss data');
            this.selectedStatisticsGroupList = [];
            this.statisticsGroupList = [];
            this.canUpdate = true;
            this.queriedRegions = false;
        }

        public loadStatisticsGroupTypes(rcode: string, regressionregions: string) {

            this.toaster.pop('info', "Loading Available Scenarios", "Please wait...", 0);
            //console.log('in load StatisticsGroups', rcode, regressionregions);
            if (!rcode && !regressionregions) return;

            var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupLookup'].format(rcode, regressionregions);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.loadingStatisticsGroup = true;

            this.Execute(request).then(
                (response: any) => {
                    //console.log(response.data);
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

        public checkArrayForObj(arr, obj) {
            for (var i = 0; i < arr.length; i++) {
                if (angular.equals(arr[i], obj)) {
                    return i;
                }
            };
            return -1;
        }

        public loadParametersByStatisticsGroup(rcode: string, statisticsGroupID: string, regressionregions: string, percentWeights:any) {

            this.toaster.pop('info', "Load Parameters by Scenario", "Please wait...", 0);

            //console.log('in load StatisticsGroup parameters', rcode, statisticsGroupID,regressionregions);
            if (!rcode && !statisticsGroupID && !regressionregions) return;

            var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupParameterLookup'].format(rcode,statisticsGroupID,regressionregions);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {
                    //console.log('loadParametersByStatisticsGroup response: ', response);
                    if (response.data[0].RegressionRegions[0].Parameters && response.data[0].RegressionRegions[0].Parameters.length > 0) {

                        //add Regression Regions to StatisticsGroupList and add percent weights
                        this.selectedStatisticsGroupList.forEach((statGroup) => {
                            if (response.data[0].StatisticGroupName == statGroup.Name) {

                                statGroup['StatisticGroupName'] = statGroup.Name;
                                statGroup['StatisticGroupID'] = statGroup.ID;
                                
                                response.data[0].RegressionRegions.forEach((regressionRegion) => {
                                    percentWeights.forEach((regressionRegionPercentWeight) => {
                                        if (regressionRegion.Name == regressionRegionPercentWeight.name) regressionRegion["PercentWeight"] = regressionRegionPercentWeight.percent;
                                    })
                                });

                                statGroup.RegressionRegions = response.data[0].RegressionRegions;

                                this._onSelectedStatisticsGroupChanged.raise(null, WiM.Event.EventArgs.Empty);
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

        public estimateFlows(studyAreaParameterList: any, rcode: string, regressionregion: string) {
      
            this.canUpdate = false;
            
            //loop over all selected StatisticsGroups
            this.selectedStatisticsGroupList.forEach((statGroup) => {

                this.toaster.pop('info', "Estimating Flows for " + statGroup.Name, "Please wait...", 0);
                //console.log('in estimate flows method for ', statGroup.Name, statGroup);

                statGroup.RegressionRegions[0].Parameters.forEach((regressionParam) => {
                    studyAreaParameterList.forEach((param) => {
                        //console.log('search for matching params ', regressionParam.Code.toLowerCase(), param.code.toLowerCase());
                        if (regressionParam.Code.toLowerCase() == param.code.toLowerCase()) {
                            //console.log('updating parameter in scenario object for: ', regressionParam.Code, ' from: ', regressionParam.Value, ' to: ', param.value);
                            regressionParam.Value = param.value;
                        }
                    });
                });

                var updatedScenarioObject = angular.toJson([statGroup], null);

                //do request
                var url = configuration.baseurls['NSS'] + configuration.queryparams['estimateFlows'].format(rcode, statGroup.ID, regressionregion);
                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, 1, 'json', updatedScenarioObject);

                statGroup.Results = [];
                statGroup.Citations = [];
                this.Execute(request).then(
                    (response: any) => {
                        if (response.data[0].RegressionRegions[0].Results && response.data[0].RegressionRegions[0].Results.length > 0) {

                            //get flows
                            response.data[0].RegressionRegions[0].Results.map((item) => {
                                try {
                                    statGroup.Results.push(item);
                                }
                                catch (e) {
                                    alert(e);
                                }
                            });

                            //nested requests for citations
                            var citationUrl = response.data[0].Links[0].Href;
                            var citationResults = this.getSelectedCitations(citationUrl, statGroup);

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
            });
        }

        private getSelectedCitations(citationUrl: string, statGroup: any): any {

            //nested requests for citations
            this.toaster.pop('info', "Requesting selected citations, Please wait...", 5000);
            var url = citationUrl;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, 0, 'json');

            this.Execute(request).then(
                (response: any) => {            

                    if (response.data[0] && response.data[0].ID) {
                        statGroup.Citations.push(response.data[0]);

                    }
                    //sm when complete
                },(error) => {
                    //sm when error
                    this.toaster.clear();
                    this.toaster.pop('error', "There was an error getting selected Citations", "Please retry", 5000);
                }).finally(() => {
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