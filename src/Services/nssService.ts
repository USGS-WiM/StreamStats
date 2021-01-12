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
        statisticsGroupList: Array<IStatisticsGroup>;
        selectedStatisticsGroupList: Array<IStatisticsGroup>;
        loadStatisticsGroupTypes(rcode: string, regressionregion: string):Array<any>;
        loadParametersByStatisticsGroup(rcode: string, statisticsGroupID: string, regressionregion: string, percentWeights: any, regressionTypes?: string);
        estimateFlows(studyAreaParameterList: Array<IParameter>, paramValueField: string, rcode: string, append?: boolean, regressionTypes?:string, showReport?:boolean)
        showBasinCharacteristicsTable: boolean;
        showFlowsTable: boolean;
        clearNSSdata();
        queriedRegions: boolean;
        getflattenNSSTable(name: string): Array<INSSResultTable>
        reportGenerated: boolean;  
    }
    export interface IStatisticsGroup {
        id: string;
        name: string;
        code: string;
        regressionRegions: Array<any>;
        citations: any;
        disclaimers: any;
    }
    export interface IRegressionRegion {
        id: number;
        name: string;
        code: string;
        parameters: Array<IParameter>
        results: Array<IRegressionResult>
    }
    export interface IRegressionResult {
        name: string;
        code: string;
        description: string;
        value: number;
        unit: IUnit;
    }
    export interface IUnit {
        unit: string;
        abbr: string;
    }

    export class StatisticsGroup implements IStatisticsGroup {
        //properties
        public id: string;
        public name: string;
        public code: string;
        public regressionRegions: Array<any>;
        public citations: any;
        public disclaimers: any;
    }//end class

    export interface INSSResultTable {
        name?: string;
        region?: string;
        statistic?: string;
        value?: Number;
        unit?: string;
        citationUrl?: string;
        disclaimers: string;
    }
    export var onScenarioExtensionChanged: string = "onScenarioExtensionChanged";
    export var onScenarioExtensionResultsChanged: string = "onScenarioExtensionResultsChanged";
    export class NSSEventArgs extends WiM.Event.EventArgs {
        //properties
        public extensions: Array<string>
        public results :Array<any>

        constructor(extensions = null, results= null) {
            super();
            this.extensions = extensions;
            this.results = results;
        }

    }

    class nssService extends WiM.Services.HTTPServiceBase implements InssService {       
        //Events
        private _onSelectedStatisticsGroupChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        public get onSelectedStatisticsGroupChanged(): WiM.Event.Delegate<WiM.Event.EventArgs> {
            return this._onSelectedStatisticsGroupChanged;
        }


        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-loadingParametersByStatisticsGroupCounter
        public statisticsGroupList: Array<IStatisticsGroup>;
        public loadingStatisticsGroup: boolean;
        public selectedStatisticsGroupList: Array<IStatisticsGroup>;
        public canUpdate: boolean;
        public toaster: any;
        public showBasinCharacteristicsTable: boolean;
        public showFlowsTable: boolean;
        public queriedRegions: boolean;
        public loadingParametersByStatisticsGroupCounter: number;
        public estimateFlowsCounter: number;
        public isDone: boolean;
        public reportGenerated: boolean;
        private modalService: Services.IModalService;   

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService, toaster, modal, private regionservice: Services.IRegionService, private eventManager: WiM.Event.IEventManager) {
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
            this.loadingParametersByStatisticsGroupCounter = 0;
            this.estimateFlowsCounter = 0;
            this.selectedStatisticsGroupList = [];
            this.statisticsGroupList = [];
            this.canUpdate = true;
            this.queriedRegions = false;
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
                            if (this.regionservice.selectedRegion.Applications.indexOf("FDCTM") > -1 && value.id == 5)
                            {
                                let val = JSON.parse(JSON.stringify(value));
                                val.id += "_fdctm";
                                val.name = "Flow-Duration QPPQ Method";
                                this.statisticsGroupList.push(val);
                            }

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

        public loadParametersByStatisticsGroup(rcode: string, statisticsGroupID: string, regressionregions: string, percentWeights: any, regressionTypes?: string) {

            if (this.loadingParametersByStatisticsGroupCounter == 0) {
                this.toaster.pop('wait', "Loading Parameters by Statistics Group", "Please wait...", 0); 
            }

            this.loadingParametersByStatisticsGroupCounter++;

            //console.log('in load StatisticsGroup parameters', rcode, statisticsGroupID,regressionregions);
            if (!rcode && !statisticsGroupID && !regressionregions) return;
            var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupParameterLookup'];
            if (this.regionservice.selectedRegion.Applications.indexOf("FDCTM") > -1 && statisticsGroupID.toString().indexOf("_fdctm") > -1) {
                statisticsGroupID = statisticsGroupID.replace("_fdctm", "");
                url = url + "&extensions=QPPQ";
            } 
            url = url.format(rcode, statisticsGroupID, regressionregions);
            if (regressionTypes != "") {
                url += "&regressiontypes=" + regressionTypes;
            }

            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {

                    if (response.data[0].regressionRegions[0].extensions && response.data[0].regressionRegions[0].extensions.length > 0) {
                        let ext = response.data[0].regressionRegions[0].extensions
                        this.eventManager.RaiseEvent(Services.onScenarioExtensionChanged, this, new NSSEventArgs(ext) );
                    }

                    //check to make sure there is a valid response
                    if (response.data[0].regressionRegions[0].parameters && response.data[0].regressionRegions[0].parameters.length > 0) {

                        if(this.selectedStatisticsGroupList.length == 0) {
                            this.selectedStatisticsGroupList.push({'name': "", 'id': "7", 'code': "", 'regressionRegions': [], 'citations': null, 'disclaimers': ""})
                        }

                        //add Regression Regions to StatisticsGroupList and add percent weights
                        this.selectedStatisticsGroupList.forEach((statGroup) => {
                            if ((response.data[0].statisticGroupID == statGroup.id) ||
                                (this.regionservice.selectedRegion.Applications.indexOf("FDCTM") > -1 && typeof(statGroup.id) == 'string' && statGroup.id.indexOf(response.data[0].statisticGroupID, 0) > -1)) {

                                statGroup['statisticGroupName'] = statGroup.name;
                                statGroup['statisticGroupID'] = statGroup.id.toString().replace("_fdctm", "");
                                
                                response.data[0].regressionRegions.forEach((regressionRegion) => {
                                    if(percentWeights.length > 0) {
                                        percentWeights.forEach((regressionRegionPercentWeight) => {
                                            if (regressionRegionPercentWeight.code.indexOf(regressionRegion.code.toUpperCase()) > -1) {
                                                regressionRegion["percentWeight"] = regressionRegionPercentWeight.percentWeight;                                            
                                            }
                                        })
                                    }
                                });

                                statGroup.regressionRegions = response.data[0].regressionRegions;

                                this._onSelectedStatisticsGroupChanged.raise(null, WiM.Event.EventArgs.Empty);
                            }
                        });
                    }
                    //this.toaster.clear();
                    //sm when complete
                },(error) => {
                    //sm when error
                    this.toaster.clear();
                    this.toaster.pop('error', "There was an error Loading Parameters by Statistics Group", "Please retry", 0);
                }).finally(() => {
                    this.loadingParametersByStatisticsGroupCounter--;
                    if (this.loadingParametersByStatisticsGroupCounter == 0) {
                        this.toaster.clear();
                    }
                });
        }

        public estimateFlows(studyAreaParameterList: Array<IParameter>, paramValueField:string, rcode: string, append:boolean = false, regressionTypes?:string, showReport:boolean = true) {

            if (!this.canUpdate && !append) return;           
            //loop over all selected StatisticsGroups
            this.selectedStatisticsGroupList.forEach((statGroup) => {
                this.canUpdate = false;
                if (this.estimateFlowsCounter == 0) {
                    this.toaster.pop('wait', "Estimating Flows", "Please wait...", 0);
                }
                this.estimateFlowsCounter++;
                this.cleanRegressionRegions(statGroup.regressionRegions);

                //console.log('in estimate flows method for ', statGroup.name, statGroup);
                statGroup.regressionRegions.forEach((regressionRegion) => {                    
                    regressionRegion.parameters.forEach((regressionParam) => {                        
                        studyAreaParameterList.forEach((param) => {
                            //console.log('search for matching params ', regressionParam.Code.toLowerCase(), param.code.toLowerCase());
                            if (regressionParam.code.toLowerCase() == param.code.toLowerCase()) {
                                //console.log('updating parameter in scenario object for: ', regressionParam.Code, ' from: ', regressionParam.Value, ' to: ', param.value);
                                regressionParam.value = param[paramValueField];
                            }
                        });
                    });
                });

                //Make a copy of the object and delete any existing results
                var updatedScenarioObject = angular.fromJson(angular.toJson(statGroup));
                updatedScenarioObject.regressionRegions.forEach((regressionRegion) => {
                    //delete results object if it exists
                    if (regressionRegion.results)
                        delete regressionRegion.results;
                    if (regressionRegion.extensions)
                        (<Array<any>>regressionRegion.extensions).forEach(e => {
                            if (e.result) delete e.result;
                        });
                        

                });
                updatedScenarioObject = angular.toJson([updatedScenarioObject], null);

                //do request
                var url = configuration.baseurls['NSS'] + configuration.queryparams['estimateFlows'].format(rcode);
                if (this.regionservice.selectedRegion.Applications.indexOf("FDCTM") > -1 && typeof statGroup.id == "string" && statGroup.id.indexOf("_fdctm") > -1) {
                    
                    url = url + "&extensions=QPPQ";
                }

                if (regressionTypes != "") {
                    url += "&regressiontypes=" + regressionTypes;
                }

                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, 1, 'json', updatedScenarioObject);

                statGroup.citations = [];
                this.Execute(request).then(
                    (response: any) => {

                        //console.log('estimate flows: ', response);

                        //nested requests for citations
                        var citationUrl = response.data[0].links[0].href;
                        if(!append) this.getSelectedCitations(citationUrl, statGroup);

                        //get header values
                        if (response.headers()['x-usgswim-messages']) {
                            var headerMsgs = response.headers()['x-usgswim-messages'].split(';');
                            statGroup.disclaimers = {};

                            headerMsgs.forEach((item) => {
                                var headerMsg = item.split(':');
                                if (headerMsg[0] == 'warning') statGroup.disclaimers['Warnings'] = headerMsg[1].trim();
                                if (headerMsg[0] == 'error') statGroup.disclaimers['Error'] = headerMsg[1].trim();
                                //comment out for not, not useful
                                //if (headerMsg[0] == 'info') statGroup.Disclaimers['Info'] = headerMsg[1].trim();
                            });
                            //console.log('headerMsgs: ', statGroup.name, statGroup.Disclaimers);
                        }

                        //if (append) console.log('in estimate flows for regulated basins: ', response);
                        //make sure there are some results
                        if (response.data[0].regressionRegions.length > 0 && response.data[0].regressionRegions[0].results && response.data[0].regressionRegions[0].results.length > 0) {
                            if (!append) {
                                statGroup.regressionRegions = [];
                                statGroup.regressionRegions = response.data[0].regressionRegions;
                                response.data[0].regressionRegions.forEach((rr) => {
                                    if (rr.extensions) {
                                        this.eventManager.RaiseEvent(Services.onScenarioExtensionResultsChanged, this, new NSSEventArgs(null, rr.extensions));
                                    }//end if
                                });
                            }
                            else {
                                //loop over and append params
                                statGroup.regressionRegions.forEach((rr) => {
                                    //console.log('in estimate flows for regulated basins: ', rr);
                                    rr.parameters.forEach((p) => {
                                        var responseRegions = response.data[0].regressionRegions;

                                        for (var i = 0; i < responseRegions.length; i++){
                                            if (responseRegions[i].id === rr.id) {
                                                for (var j = 0; j < responseRegions[i].parameters.length; j++) {
                                                    if (responseRegions[i].Parameters[j].code == p.code) {
                                                        p[paramValueField] = responseRegions[i].parameters[j].value;
                                                    }
                                                }//next j
                                            }//end if
                                        };//next i                                        
                                    });//end p

                                    rr.results.forEach((r) => {
                                        var responseRegions = response.data[0].regressionRegions;
                                        for (var i = 0; i < responseRegions.length; i++) {
                                            if (responseRegions[i].id === rr.id) {
                                                for (var j = 0; j < responseRegions[i].results.length; j++) {
                                                    if (responseRegions[i].results[j].code == r.code) {
                                                        r[paramValueField] = responseRegions[i].results[j].value;
                                                    }
                                                }//next j
                                            }//end if
                                        };//next i
                                    });//end r
                                });//end rr
                            }
                        }
                        else {
                            this.toaster.clear();
                            this.toaster.pop('error', "There was an error Estimating Flows for " + statGroup.name, "No results were returned", 0);
                            //this.isDone = true;
                            //console.log("Zero length flow response, check equations in NSS service");
                        }
              

                        //sm when complete
                    },(error) => {
                        //sm when error
                        this.toaster.clear();
                        this.toaster.pop('error', "There was an error Estimating Flows", "HTTP request error", 0);
                    }).finally(() => {
                        //if success and counter is zero, clear toast
                        this.estimateFlowsCounter--;
                        if (this.estimateFlowsCounter < 1) {
                            this.toaster.clear();
                            this.estimateFlowsCounter = 0;
                            this.canUpdate = true;
                            //move to nssService
                            if(showReport) {
                                this.modalService.openModal(Services.SSModalType.e_report);
                                this.reportGenerated = true;
                            }
                        }//end if                       
                        
                    });
            });
        }

        public getSelectedCitations(citationUrl: string, statGroup: any): any {

            ////nested requests for citations
            console.log('citations: ', citationUrl, statGroup);

            var url;
            if (citationUrl.indexOf('https://') == -1) url = 'https://' + citationUrl;
            else url = citationUrl;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, 0, 'json');

            this.Execute(request).then(
                (response: any) => {            

                    //console.log('get citations: ', response);

                    if (response.data[0] && response.data[0].id) {
                        angular.forEach(response.data, (value, key) => {
                            statGroup.citations.push(value);
                        })
                    }
                    //sm when complete
                },(error) => {
                    //sm when error
                    this.toaster.pop('error', "There was an error getting selected Citations for " + statGroup.name, "No results were returned", 0);
                }).finally(() => {

                });
        }

        public getflattenNSSTable(name: string): Array<INSSResultTable> {
            var result = [];
            try {
                this.selectedStatisticsGroupList.forEach(sgroup => {
                    sgroup.regressionRegions.forEach(regRegion => {
                        regRegion.results.forEach(regResult => {
                            result.push(
                                {
                                    Name: name,
                                    Region: regRegion.percentWeight ? regRegion.percentWeight.toFixed(1) + "% " + regRegion.name : regRegion.name,
                                    Statistic: regResult.name,
                                    Code: regResult.code,
                                    Value: regResult.value.toUSGSvalue(),
                                    Unit: regResult.unit.unit,
                                    Disclaimers: regRegion.disclaimer ? regRegion.disclaimer : undefined,
                                    Errors: (regResult.errors && regResult.errors.length > 0) ? regResult.errors.map(err => err.name + " : " + err.value).join(', ') : undefined,
                                    MaxLimit: regResult.intervalBounds && regResult.intervalBounds.upper > 0 ? regResult.intervalBounds.upper.toUSGSvalue() : undefined,
                                    MinLimit: regResult.intervalBounds && regResult.intervalBounds.lower > 0 ? regResult.intervalBounds.lower.toUSGSvalue() : undefined,
                                    EquivYears: regResult.equivalentYears ? regResult.equivalentYears : undefined
                                });
                        });//next regResult
                    });//next regRegion
                });//next sgroup
            }
            catch (e) {
                result.push({ Disclaimers: "Failed to output flowstats to table. " });
            }
            return result;
        }
        //HelperMethods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private cleanRegressionRegions(RegressionRegions:Array<any>): void {
            for (var i = 0; i < RegressionRegions.length; i++) {
                var regRegion = RegressionRegions[i];
                if (regRegion.name === 'Area-Averaged') {
                    RegressionRegions.splice(i, 1);
                    continue;
                }//end if

                //remove results
                RegressionRegions.forEach((regressionRegion) => {
                    //delete results object if it exists
                    if (regressionRegion.Results) delete regressionRegion.Results;
                });
            }//next i
        }
    }//end class

    factory.$inject = ['$http', '$q', 'toaster', 'StreamStats.Services.ModalService', 'StreamStats.Services.RegionService', 'WiM.Event.EventManager'];
    function factory($http: ng.IHttpService, $q: ng.IQService, toaster: any, modal: Services.IModalService, regionservice, eventManager: WiM.Event.IEventManager) {
        return new nssService($http, $q, toaster, modal, regionservice, eventManager)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.nssService', factory)
}//end module  