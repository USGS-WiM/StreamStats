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
        onQ10Loaded: WiM.Event.Delegate<WiM.Event.EventArgs>;
        statisticsGroupList: Array<IStatisticsGroup>;
        selectedStatisticsGroupList: Array<IStatisticsGroup>;
        equationWeightingResults: Array<IEquationWeightingResults>;
        equationWeightingDisclaimers: Array<string>;
        loadStatisticsGroupTypes(rcode: string, regressionregion: string):Array<any>;
        loadParametersByStatisticsGroup(rcode: string, statisticsGroupID: string, regressionregion: string, percentWeights: any, regressionTypes?: string);
        estimateFlows(studyAreaParameterList: Array<IParameter>, paramValueField: string, rcode: string, append?: boolean, regressionTypes?:string, showReport?:boolean)
        showBasinCharacteristicsTable: boolean;
        showFlowsTable: boolean;
        clearNSSdata();
        queriedRegions: boolean;
        getflattenNSSTable(name: string): Array<INSSResultTable>
        reportGenerated: boolean;  
        getRegionList(): ng.IPromise<any>;
        getFlowStatsList(rcode: string): ng.IPromise<any>;
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

    export interface IEquationWeightingResults {
        RR: string;
        Results: Array<IEquationWeightingResultsValues>
    }
    export interface IEquationWeightingResultsValues {
        Name: string;
        Z: number;
        Unit: IUnit;
        PIl: number;
        PIu: number;
        SEPZ: number;
    }
    export interface IEquationWeightingInputs {
        name: string,
        inUse: boolean,
        percentWeight: number,
        RegressionRegionName: string,
        code: string;
        values: Array<IEquationWeightingInputValues>
    }
    export interface IEquationWeightingInputValues {
        value: number,
        SEP: number,
        code: string
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
        public regressionRegionName: string

        constructor(extensions = null, results = null, regressionRegionName = null) {
            super();
            this.extensions = extensions;
            this.results = results;
            this.regressionRegionName = regressionRegionName;
        }

    }

    class nssService extends WiM.Services.HTTPServiceBase implements InssService {       
        //Events
        private _onSelectedStatisticsGroupChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        public get onSelectedStatisticsGroupChanged(): WiM.Event.Delegate<WiM.Event.EventArgs> {
            return this._onSelectedStatisticsGroupChanged;
        }

        private _onQ10Loaded: WiM.Event.Delegate<WiM.Event.EventArgs>;
        public get onQ10Loaded(): WiM.Event.Delegate<WiM.Event.EventArgs> {
            return this._onQ10Loaded;
        }

        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-loadingParametersByStatisticsGroupCounter
        public statisticsGroupList: Array<IStatisticsGroup>;
        public loadingStatisticsGroup: boolean;
        public selectedStatisticsGroupList: Array<IStatisticsGroup>;
        public equationWeightingResults: Array<IEquationWeightingResults> = [];
        public equationWeightingDisclaimers: Array<string> = [];
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
            this._onQ10Loaded = new WiM.Event.Delegate<WiM.Event.EventArgs>();         

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
                                val.name = "Flow-Duration Curve Transfer Method";
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
            if (regressionTypes != undefined) {
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

                        //only for OH Water Use when user doesn't select a scenario
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

                statGroup.regressionRegions.forEach((regressionRegion) => {  
                    if (regressionRegion.disclaimer) { // resets regression region diclaimers if values are edited and report is opened a second time
                        regressionRegion.disclaimer = null; 
                    }                  
                    regressionRegion.parameters.forEach((regressionParam) => {                        
                        studyAreaParameterList.forEach((param) => {
                            //console.log('search for matching params ', regressionParam.code.toLowerCase(), param.code.toLowerCase());
                            if (regressionParam.code.toLowerCase() == param.code.toLowerCase()) {
                                //console.log('updating parameter in scenario object for: ', regressionParam.code, ' from: ', regressionParam.value, ' to: ', param.value);
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
                            if (e.parameters) e.parameters.forEach(p => { if (p.options) delete p.options})
                        });
                        

                });
                updatedScenarioObject = angular.toJson([updatedScenarioObject], null);

                //do request
                var url = configuration.baseurls['NSS'] + configuration.queryparams['estimateFlows'].format(rcode);
                if (this.regionservice.selectedRegion.Applications.indexOf("FDCTM") > -1 && typeof statGroup.id == "string" && statGroup.id.indexOf("_fdctm") > -1) {
                    
                    url = url + "&extensions=QPPQ";
                }

                if (regressionTypes != "" && regressionTypes != undefined) {
                    url += "&regressiontypes=" + regressionTypes;
                }

                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, 1, 'json', updatedScenarioObject);

                statGroup.citations = [];
                this.Execute(request).then(
                    (response: any) => {

                        //console.log('estimate flows: ', response);

                        //nested requests for citations
                        var citationUrl = response.data[0].links[0].href;
                        var regregionCheck = citationUrl.split("regressionregions=")[1];
                        if(!append && regregionCheck && regregionCheck.length > 0) this.getSelectedCitations(citationUrl, statGroup);

                        //get header values
                        if (response.headers()['x-usgswim-messages']) {
                            var headerMsgs = response.headers()['x-usgswim-messages'].split(';');
                            statGroup.disclaimers = {};

                            headerMsgs.forEach((item) => {
                                var headerMsg = item.split(':');
                                if (headerMsg[0] == 'warning') statGroup.disclaimers['Warnings'] = headerMsg[1].trim();
                                if (headerMsg[0] == 'error') statGroup.disclaimers['Error'] = headerMsg[1].trim();
                            });
                        }

                        //if (append) console.log('in estimate flows for regulated basins: ', response);
                        //make sure there are some results
                        if (response.data[0].regressionRegions.length > 0 && response.data[0].regressionRegions[0].results && response.data[0].regressionRegions[0].results.length > 0) {
                            if (!append) {
                                response.data[0].regressionRegions.forEach((rr) => {
                                    if (rr.extensions) {
                                        // update parameter options (gets removed during computation)
                                        rr.extensions.forEach(e => {
                                            var extension = statGroup.regressionRegions.filter(r => r.name == rr.name)[0].extensions.filter(ext => ext.code == e.code)[0];
                                            e.parameters.forEach(p => {
                                                p.options = extension.parameters.filter(param => param.code == p.code)[0].options;
                                            })
                                        })
                                        this.eventManager.RaiseEvent(Services.onScenarioExtensionResultsChanged, this, new NSSEventArgs(null, rr.extensions, rr.name));
                                    }//end if
                                });
                                statGroup.regressionRegions = [];
                                statGroup.regressionRegions = response.data[0].regressionRegions;
                                
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
                        //Equation Weighting 
                        if (this.regionservice.selectedRegion.Applications.indexOf('ChannelWidthWeighting') != -1 ) {
                            if (statGroup.name == "Peak-Flow Statistics") {
                                this.queryEquationWeighting();
                            }
                        }

                        //if success and counter is zero, clear toast
                        this.estimateFlowsCounter--;
                        if (this.estimateFlowsCounter < 1) {
                            this.toaster.clear();
                            this.estimateFlowsCounter = 0;
                            //move to nssService
                            if (showReport && this.regionservice.selectedRegion.Applications.indexOf('ChannelWidthWeighting') != -1 ) {
                                setTimeout(() => { // gives time for equation weighting to finish
                                    this.canUpdate = true;
                                    this.modalService.openModal(Services.SSModalType.e_report);
                                    this.reportGenerated = true;
                                }, 1000);
                            } else if (showReport) {
                                this.canUpdate = true;
                                this.modalService.openModal(Services.SSModalType.e_report);
                                this.reportGenerated = true;
                            }
                        }//end if 
                        //for OH WU only     
                        //this.studyareaservice.selectedStudyArea.wateruseQ10 = this.selectedStatisticsGroupList[0].regressionRegions[0].results[0].value;
                        this._onQ10Loaded.raise(null, WiM.Event.EventArgs.Empty);                 
                    });
            });

        }

        public queryEquationWeighting() {
            var units = null;
            var inputs: Array<IEquationWeightingInputs> = [];
            this.equationWeightingResults = [];
            this.equationWeightingDisclaimers = [];
            this.selectedStatisticsGroupList.forEach(statGroup => { 
                if (statGroup.name == "Peak-Flow Statistics") { // Only need to equation weight in peakflow statgroup
                    statGroup.regressionRegions.forEach((regressionRegion, rindex) => {
                        if (regressionRegion.name != "Area-Averaged" && regressionRegion.results) { //Nothing to do for area weighted region
                            inputs[rindex] = { "name":null,"inUse":false, "percentWeight":null, "RegressionRegionName": null, "code": null, "values":[] };
                            regressionRegion.results.forEach((result, index) => {
                                if (result.code.includes("ACPK")) {
                                    inputs[rindex].name ="ACPK";
                                    inputs[rindex].RegressionRegionName = regressionRegion.name.substring(0, regressionRegion.name.indexOf('Region') + 'Region'.length);
                                    inputs[rindex].percentWeight = regressionRegion.percentWeight;
                                    if (result.value > 0) { 
                                        inputs[rindex].code = regressionRegion.code;
                                        inputs[rindex].inUse = true;
                                        inputs[rindex].values[index] = {
                                            value: result.value,
                                            SEP: (result.sep) ? result.sep : null,
                                            code: result.code
                                        };
                                    } else {
                                        inputs[rindex].code = null;
                                        inputs[rindex].inUse = false;
                                        inputs[rindex].values[index] = {
                                            value: null,
                                            SEP: null,
                                            code: result.code
                                        };
                                    }                                 
                                } else if (result.code.includes("BWPK")) {
                                    inputs[rindex].name ="BFPK";
                                    inputs[rindex].RegressionRegionName = regressionRegion.name.substring(0, regressionRegion.name.indexOf('Region') + 'Region'.length);
                                    inputs[rindex].percentWeight = regressionRegion.percentWeight;
                                    if (result.value > 0) {
                                        inputs[rindex].code = regressionRegion.code;
                                        inputs[rindex].inUse = true;
                                        inputs[rindex].values[index] = {
                                            value: result.value,
                                            SEP: (result.sep) ? result.sep : null,
                                            code: result.code
                                        };
                                    } else {
                                        inputs[rindex].code = null;
                                        inputs[rindex].inUse = false;
                                        inputs[rindex].values[index] = {
                                            value: null,
                                            SEP: null,
                                            code: result.code
                                        };
                                    }  
                                } else if (result.code.includes("RSPK")) {
                                    inputs[rindex].name ="RSPK";
                                    inputs[rindex].RegressionRegionName = regressionRegion.name.substring(0, regressionRegion.name.indexOf('Region') + 'Region'.length);
                                    inputs[rindex].percentWeight = regressionRegion.percentWeight;
                                    if (result.value > 0) { 
                                        inputs[rindex].code = regressionRegion.code;
                                        inputs[rindex].inUse = true;
                                        inputs[rindex].values[index] = {
                                            value: result.value,
                                            SEP: (result.sep) ? result.sep : null,
                                            code: result.code
                                        };
                                    } else {
                                        inputs[rindex].code = null;
                                        inputs[rindex].inUse = false;
                                        inputs[rindex].values[index] = {
                                            value: null,
                                            SEP: null,
                                            code: result.code
                                        };
                                    }  
                                } else {
                                    inputs[rindex].name ="BCPK";
                                    inputs[rindex].RegressionRegionName = regressionRegion.name.substring(0, regressionRegion.name.indexOf('Region') + 'Region'.length);
                                    inputs[rindex].percentWeight = regressionRegion.percentWeight;
                                    if (result.value > 0) {
                                        units = result.unit;
                                        inputs[rindex].inUse = true;
                                        inputs[rindex].values[index] = {
                                            value: result.value,
                                            SEP: (result.sep) ? result.sep : null,
                                            code: result.code
                                        };
                                    } else {
                                        inputs[rindex].inUse = false;
                                        inputs[rindex].values[index] = {
                                            value: null,
                                            SEP: null,
                                            code: result.code
                                        };
                                    }  
                                }
                            })
                        }
                    });
                }
            });

            var rrCount = inputs.filter(function(el) { return el.name == "BCPK"; }); //get number of regression regions in delinated basin
            var temp = inputs.filter(function (obj) { return obj.inUse == true; }); //get only parameters being used in weighting
            var weightCount = temp.length/rrCount.length; //get number of values to be weighted 

            //Sort values alphabetically for input
            inputs.sort(function(a, b) { return a.name.localeCompare(b.name) });
            for (var i = 0; i < inputs.length; i++) { inputs[i].values.sort(function(a, b) {  return a.code.localeCompare(b.code) }); }

            if (weightCount >= 2) { //If there are two or more values we can send to the weighting service
                //set up URL and counter
                var url = configuration.baseurls['WeightingServices'] +  '/weightest/'; 
                var headers = {
                    "accept": "application/json",
                    "Content-Type": "application/json",
                };
                let rrCounter = 0;

                while (rrCounter < rrCount.length) { 
                    this.equationWeightingResults[rrCounter] = { "RR": inputs[rrCounter].RegressionRegionName,"Results":[] };
                    let lastIndex = inputs[0].values.length - 1;
                    this.recursiveAreaWeightSubscription(inputs[0].values, lastIndex, inputs, url, headers, units, rrCount, rrCounter);
                    rrCounter++;
                }
            } else { //Not enough values to weight
                this.toaster.pop('error', 'Cannot Weight Channel-width Methods, not enough values');
            }
        }

        public recursiveAreaWeightSubscription(parentLevelIdArray, lastIndex, inputs, url, headers, units, rrCount, rrCounter) {
            if (lastIndex >= 0) {
                var input = {};
                var code; 

                //get regression region code to use for service call
                if (inputs[0 * rrCount.length + rrCounter].code) code = inputs[0 * rrCount.length + rrCounter].code;
                if (inputs[1 * rrCount.length + rrCounter].code) code = inputs[1 * rrCount.length + rrCounter].code;
                if (inputs[2 * rrCount.length + rrCounter].code) code = inputs[2 * rrCount.length + rrCounter].code;
                if (inputs[3 * rrCount.length + rrCounter].code) code = inputs[3 * rrCount.length + rrCounter].code;

                //Send combined inputs to weighting service
                input = {
                    "x1": inputs[0 * rrCount.length + rrCounter].values[lastIndex].value,
                    "x2": inputs[1 * rrCount.length + rrCounter].values[lastIndex].value,
                    "x3": inputs[2 * rrCount.length + rrCounter].values[lastIndex].value,
                    "x4": inputs[3 * rrCount.length + rrCounter].values[lastIndex].value,
                    "sep1": inputs[0 * rrCount.length + rrCounter].values[lastIndex].SEP,
                    "sep2": inputs[1 * rrCount.length + rrCounter].values[lastIndex].SEP,
                    "sep3": inputs[2 * rrCount.length + rrCounter].values[lastIndex].SEP,
                    "sep4": inputs[3 * rrCount.length + rrCounter].values[lastIndex].SEP,
                    "regressionRegionCode": code,
                    "code1": inputs[0 * rrCount.length + rrCounter].values[lastIndex].code,
                    "code2": inputs[1 * rrCount.length + rrCounter].values[lastIndex].code,
                    "code3": inputs[2 * rrCount.length + rrCounter].values[lastIndex].code,
                    "code4": inputs[3 * rrCount.length + rrCounter].values[lastIndex].code
                };

                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', JSON.stringify(input), headers);
                this.Execute(request).then((response: any) => {
                    this.equationWeightingResults[rrCounter].Results[lastIndex] = {
                        Name: inputs[1 * rrCount.length + rrCounter].values[lastIndex].code,      
                        Z: response.data.Z,
                        Unit: units,
                        PIl: response.data.PIL,
                        PIu: response.data.PIU,
                        SEPZ: response.data.SEPZ
                    };
                    // Get warnings
                    if (response.headers('x-usgswim-messages')) {
                        var headerMsgs = JSON.parse(response.headers()['x-usgswim-messages']);
                        Object.keys(headerMsgs).forEach(key => {
                            let arr = headerMsgs[key].split('. ');
                            arr.forEach(i => {
                                this.equationWeightingDisclaimers.push(i);
                            })
                        })
                    }
                    this.equationWeightingDisclaimers = this.equationWeightingDisclaimers.filter((c, index) => {
                        return this.equationWeightingDisclaimers.indexOf(c) === index;
                    });
                    this.equationWeightingDisclaimers = this.equationWeightingDisclaimers.filter(Boolean)
                },(error) => {
                    this.toaster.clear();
                    if (error.data && error.data.detail) { this.toaster.pop('error', "Cannot Weight Channel-width Methods: " + error.data.detail, "HTTP request error", 0); }
                    else { this.toaster.pop('error', 'Cannot Weight Channel-width Methods'); }
                }).finally(() => {
                    lastIndex = lastIndex - 1;
                    this.recursiveAreaWeightSubscription(parentLevelIdArray, lastIndex, inputs, url, headers, units, rrCount, rrCounter); // recursively call function 
                });  
            } else {
                if (rrCount.length == rrCounter + 1) { //Checks if we are done weighting all regression regions
                    this.equationWeightingResults = this.equationWeightingResults.filter(function (obj) { return obj.Results.length > 0; }); // remove results if they failed and returned nothing
                    
                    if (rrCount.length > 1 && this.equationWeightingResults.length > 0) { //need to area weight results
                        setTimeout(() => {
                            this.equationWeightingResults[rrCounter + 1] = { "RR": "Area-Averaged","Results":[] };
                            var PIltotal = new Array(inputs[0].values.length); 
                            var PIutotal = new Array(inputs[0].values.length);
                            var SEPZtotal = new Array(inputs[0].values.length);
                            var Ztotal = new Array(inputs[0].values.length); 
                            for (let i=0; i<inputs[0].values.length; ++i) { Ztotal[i] = 0; SEPZtotal[i] = 0; PIutotal[i] = 0; PIltotal[i] = 0; }

                            for (var i = 0; i < this.equationWeightingResults.length - 1; i++) { // area weighting calculations
                                var Z = []; var PIl = []; var PIu = []; var SEPZ = [];
                                for (let j=0; j<this.equationWeightingResults[i].Results.length; j++) {
                                    Z.push(this.equationWeightingResults[i].Results[j].Z);
                                    PIl.push(this.equationWeightingResults[i].Results[j].PIl);
                                    PIu.push(this.equationWeightingResults[i].Results[j].PIu);
                                    SEPZ.push(this.equationWeightingResults[i].Results[j].SEPZ);
                                }
                                Z = Z.map(function(item) { return item*(inputs[i].percentWeight/100) });
                                PIl = PIl.map(function(item) { return item*(inputs[i].percentWeight/100) });
                                PIu = PIu.map(function(item) { return item*(inputs[i].percentWeight/100) });
                                SEPZ = SEPZ.map(function(item) { return item*(inputs[i].percentWeight/100) });

                                Ztotal = Ztotal.map(function (num, idx) { return num + Z[idx]; });
                                PIltotal = PIltotal.map(function (num, idx) { return num + PIl[idx]; });
                                PIutotal = PIutotal.map(function (num, idx) { return num + PIu[idx]; });
                                SEPZtotal = SEPZtotal.map(function (num, idx) { return num + SEPZ[idx]; });
                            }

                            for (let i=0; i<inputs[0].values.length; ++i) {
                                this.equationWeightingResults[this.equationWeightingResults.length - 1].Results[i] = {
                                    Name: inputs[1 * rrCount.length + rrCounter].values[i].code,      
                                    Z: Ztotal[i],
                                    Unit: units,
                                    PIl: PIltotal[i],
                                    PIu: PIutotal[i],
                                    SEPZ: SEPZtotal[i]
                                };
                            }
                        }, 75);
                    } // else no area weighting 
                }
            }
        }

        public getSelectedCitations(citationUrl: string, statGroup: any): any {

            ////nested requests for citations
            //console.log('citations: ', citationUrl, statGroup);

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

        // get region list form nssservices/regions
        // referenced getFreshDeskArticles from HelpControllers
        // keys to success: use ng.Ipromise<any> and return this.Execute 
        public getRegionList(): ng.IPromise<any> {

            var url = configuration.baseurls['NSS'] + configuration.queryparams['NSSRegions'];
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);
            
            return this.Execute(request).then(
                (response: any) => {
                    // create array to return
                    var regions = response.data;

                    /* uncomment to implement filter
                    var regionsRaw = response.data; 

                    // add filter for unwanted values, additional values can be added with &&
                    function filterRegions(element, index, array) {
                        return element.name !== "Undefined";
                    }

                    var regions = regionsRaw.filter(filterRegions); */
                    
                    // console.log("regionList_nssServices", regions);

                    return regions;
                }, (error) => {
                    this.toaster.pop('error', "There was an HTTP error returning the regions list.", "Please retry", 0);
                }).finally(() => {
                });
        }

        // get flowstats list for region and nation
        public getFlowStatsList(rcode: string): ng.IPromise<any> {
            
            if (!rcode) return;
            var url = configuration.baseurls['NSS'] + configuration.queryparams['NSSRegionScenarios'].format(rcode);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            console.log(request)
            return this.Execute(request).then(
                (response: any) => {
                    // create array to return
                    var flowStats = response.data;

                    console.log("flowStatsList_nssServices", flowStats);

                    return flowStats;
                }, (error) => {
                    this.toaster.pop('error', "There was an HTTP error returning the flow statistics list.", "Please retry", 0);
                }).finally(() => {
                });
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