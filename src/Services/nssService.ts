﻿//------------------------------------------------------------------------------
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
        loadStatisticsGroupTypes(rcode: string, regressionregion: string):Array<any>;
        loadParametersByStatisticsGroup(rcode: string, statisticsGroupID: string, regressionregion: string, percentWeights: any);
        estimateFlows(studyAreaParameterList: Array<IParameter>, paramValueField: string, rcode: string, regressionregion: string, append?: boolean)
        showBasinCharacteristicsTable: boolean;
        showFlowsTable: boolean;
        clearNSSdata();
        queriedRegions: boolean;
        loadingParametersByStatisticsGroup: boolean;      
        reportGenerated: boolean;  
    }
    export interface IStatisticsGroup {
        ID: string;
        Name: string;
        Code: string;
        RegressionRegions: Array<any>;
        Citations: any;
        Disclaimers: any;
    }

    export class StatisticsGroup implements IStatisticsGroup {
        //properties
        public ID: string;
        public Name: string;
        public Code: string;
        public RegressionRegions: Array<any>;
        public Citations: any;
        public Disclaimers: any;
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
        public loadingParametersByStatisticsGroup: boolean;
        public isDone: boolean;
        public reportGenerated: boolean;
        private modalService: Services.IModalService;   

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService, toaster, modal) {
            super($http, configuration.baseurls['NSS']);
            this.toaster = toaster;
            this.modalService = modal;
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
            this.loadingParametersByStatisticsGroup = false;
            this.isDone = false;
            this.reportGenerated = false;
        }

        public loadStatisticsGroupTypes(rcode: string, regressionregions: string):Array<any> {

            this.toaster.pop('wait', "Loading Available Scenarios", "Please wait...", 0);
            //console.log('in load StatisticsGroups', rcode, regressionregions);
            if (!rcode && !regressionregions) return;

            var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupLookup'].format(rcode, regressionregions);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.loadingStatisticsGroup = true;
            this.statisticsGroupList = [];

            this.Execute(request).then(
                (response: any) => {
                    //console.log(response.data);

                    //tests
                    //response.data.length = 0;

                    if (response.data.length > 0) {
                        this.loadingStatisticsGroup = false;
                        
                        angular.forEach(response.data, (value, key) =>  {
                            this.statisticsGroupList.push(value);
                        });
                    }
                    this.toaster.clear();
                },(error) => {
                    //sm when complete
                    this.toaster.clear();
                    this.toaster.pop('error', "There was an error Loading Available Scenarios", "Please retry", 0);
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

        public loadParametersByStatisticsGroup(rcode: string, statisticsGroupID: string, regressionregions: string, percentWeights: any) {

            this.toaster.pop('wait', "Loading Parameters by Statistics Group", "Please wait...", 0);
            this.loadingParametersByStatisticsGroup = true;

            //console.log('in load StatisticsGroup parameters', rcode, statisticsGroupID,regressionregions);
            if (!rcode && !statisticsGroupID && !regressionregions) return;

            var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupParameterLookup'].format(rcode,statisticsGroupID,regressionregions);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {

                    //console.log('loadParams: ', response.data[0]);
                    this.loadingParametersByStatisticsGroup = false;

                    //check to make sure there is a valid response
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
                    this.toaster.pop('error', "There was an error Loading Parameters by Statistics Group", "Please retry", 0);
                }).finally(() => {

                });
        }

        public estimateFlows(studyAreaParameterList: Array<IParameter>, paramValueField:string, rcode: string, regressionregion: string, append:boolean = false) {

            if (this.isDone) return;
            this.canUpdate = false;
            //loop over all selected StatisticsGroups
            this.selectedStatisticsGroupList.forEach((statGroup) => {

                this.toaster.pop('wait', "Estimating Flows for " + statGroup.Name, "Please wait...", 0);
                //console.log('in estimate flows method for ', statGroup.Name, statGroup);

                statGroup.RegressionRegions.forEach((regressionRegion) => {

                    regressionRegion.Parameters.forEach((regressionParam) => {
                        studyAreaParameterList.forEach((param) => {
                            //console.log('search for matching params ', regressionParam.Code.toLowerCase(), param.code.toLowerCase());
                            if (regressionParam.Code.toLowerCase() == param.code.toLowerCase()) {
                                //console.log('updating parameter in scenario object for: ', regressionParam.Code, ' from: ', regressionParam.Value, ' to: ', param.value);
                                regressionParam.Value = param[paramValueField];
                            }
                        });
                    });
                });

                //Make a copy of the object and delete any existing results
                var updatedScenarioObject = angular.fromJson(angular.toJson(statGroup));
                updatedScenarioObject.RegressionRegions.forEach((regressionRegion) => {
                    //delete results object if it exists
                    if (regressionRegion.Results) delete regressionRegion.Results;
                });
                updatedScenarioObject = angular.toJson([updatedScenarioObject], null);

                //do request
                var url = configuration.baseurls['NSS'] + configuration.queryparams['estimateFlows'].format(rcode, statGroup.ID, regressionregion);
                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, 1, 'json', updatedScenarioObject);

                statGroup.Citations = [];
                this.Execute(request).then(
                    (response: any) => {

                        //console.log('estimate flows: ', response);

                        //nested requests for citations
                        var citationUrl = response.data[0].Links[0].Href;
                        if(!append) this.getSelectedCitations(citationUrl, statGroup);

                        //get header values
                        if (response.headers()['usgswim-messages']) {
                            var headerMsgs = response.headers()['usgswim-messages'].split(';');
                            statGroup.Disclaimers = {};

                            headerMsgs.forEach((item) => {
                                var headerMsg = item.split(':');
                                if (headerMsg[0] == 'warning') statGroup.Disclaimers['Warnings'] = headerMsg[1].trim();
                                if (headerMsg[0] == 'error') statGroup.Disclaimers['Error'] = headerMsg[1].trim();
                                //comment out for not, not useful
                                //if (headerMsg[0] == 'info') statGroup.Disclaimers['Info'] = headerMsg[1].trim();
                            });
                            //console.log('headerMsgs: ', statGroup.Name, statGroup.Disclaimers);
                        }

                        //if (append) console.log('in estimate flows for regulated basins: ', response);
                        //make sure there are some results
                        if (response.data[0].RegressionRegions[0].Results && response.data[0].RegressionRegions[0].Results.length > 0) {

                            this.toaster.clear();
                            if (!append) {
                                statGroup.RegressionRegions = [];
                                statGroup.RegressionRegions = response.data[0].RegressionRegions;
                            }
                            else {
                                //loop over and append params
                                statGroup.RegressionRegions.forEach((rr) => {
                                    //console.log('in estimate flows for regulated basins: ', rr);
                                    rr.Parameters.forEach((p) => {
                                        var responseRegions = response.data[0].RegressionRegions;
                                        for (var i = 0; i < responseRegions.length; i++){
                                            if (responseRegions[i].ID === rr.ID) {
                                                for (var j = 0; j < responseRegions[i].Parameters.length; j++) {
                                                    if (responseRegions[i].Parameters[j].Code == p.Code) {
                                                        p[paramValueField] = responseRegions[i].Parameters[j].Value;
                                                    }
                                                }//next j
                                            }//end if
                                        };//next i
                                        
                                    });//end p
                                    rr.Results.forEach((r) => {
                                        var responseRegions = response.data[0].RegressionRegions;
                                        for (var i = 0; i < responseRegions.length; i++) {
                                            if (responseRegions[i].ID === rr.ID) {
                                                for (var j = 0; j < responseRegions[i].Results.length; j++) {
                                                    if (responseRegions[i].Results[j].code == r.code) {
                                                        r[paramValueField] = responseRegions[i].Results[j].Value;
                                                    }
                                                }//next j
                                            }//end if
                                        };//next i

                                    });//end r
                                });//end rr
                                //loop over and append statistic
                            }
                                                     
                            //overwrite existing Regressions Regions array with new one from request that includes results
                            

                        }
                        else {
                            this.toaster.clear();
                            this.toaster.pop('error', "There was an error Estimating Flows", "No results were returned", 0);
                            this.isDone = true;
                            //console.log("Zero length flow response, check equations in NSS service");
                        }
              

                        //sm when complete
                    },(error) => {
                        //sm when error
                        this.toaster.clear();
                        this.toaster.pop('error', "There was an error Estimating Flows", "HTTP request error", 0);
                    }).finally(() => {
                    this.canUpdate = true;
                });
            });
        }

        private getSelectedCitations(citationUrl: string, statGroup: any): any {

            //nested requests for citations
            this.toaster.pop('wait', "Requesting selected citations", "Please wait...", 5000);
            var url = citationUrl;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, 0, 'json');

            this.Execute(request).then(
                (response: any) => {            

                    //console.log('get citations: ', response);

                    if (response.data[0] && response.data[0].ID) {
                        angular.forEach(response.data, (value, key) => {
                            statGroup.Citations.push(value);
                        })
                    }
                    //sm when complete
                },(error) => {
                    //sm when error
                    this.toaster.clear();
                    this.toaster.pop('error', "There was an error getting selected Citations", "Please retry", 0);
                }).finally(() => {
            });
        }


        //HelperMethods
        //-+-+-+-+-+-+-+-+-+-+-+-

    }//end class

    factory.$inject = ['$http', '$q', 'toaster', 'StreamStats.Services.ModalService'];
    function factory($http: ng.IHttpService, $q: ng.IQService, toaster: any, modal: Services.IModalService) {
        return new nssService($http, $q, toaster, modal)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.nssService', factory)
}//end module  