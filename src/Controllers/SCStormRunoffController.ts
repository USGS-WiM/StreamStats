//------------------------------------------------------------------------------
//----- Storm runnoff controller------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2016 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping,
//              Tara A. Gross USGS Colorado Water Science Center
// 
//   purpose:  
//          
//discussion:


//Comments
//02.17.2016 jkn - Created

//Import
declare var d3: any;
module StreamStats.Controllers {
    'use strict';
    interface ISCStormRunoffControllerScope extends ng.IScope {
        vm: ISCStormRunoffController;
    }

    interface IModal {
        Close():void
    }

    interface IReportable {
        Graph: any;
        Table: any;
        PeakQ: any;
        Infiltration: any;
        ExcessPrecip: any;
    }

    interface ISCStormRunoffReportable {
        SyntheticUrbanHydrograph: IReportable;
        BohmanRural1989: IReportable;
        BohmanUrban1992: IReportable;
    }

    class SCStormRunoffReportable implements ISCStormRunoffReportable {
        public SyntheticUrbanHydrograph: IReportable;
        public BohmanRural1989: IReportable;
        public BohmanUrban1992: IReportable;

        public constructor() {
            this.SyntheticUrbanHydrograph = { Graph: {}, Table: {}, PeakQ: {}, Infiltration: {}, ExcessPrecip: {} };
            this.BohmanRural1989 = { Graph: {}, Table: {}, PeakQ: {}, Infiltration: {}, ExcessPrecip: {} };
            this.BohmanUrban1992 = { Graph: {}, Table: {}, PeakQ: {}, Infiltration: {}, ExcessPrecip: {} };
        }
    }

    interface ISCStormRunoffController extends IModal {
    }

    class SCStormRunoffController extends WiM.Services.HTTPServiceBase implements ISCStormRunoffController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public print: any;
        public StudyArea: StreamStats.Models.IStudyArea;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        public showResults: boolean;
        public hideAlerts: boolean;
        public toaster: any;
        private studyAreaService: Services.IStudyAreaService;
        public CanContinue: boolean;

        public AEPOptions = [{
            "name": "50%",
            "value": 50
          }, {
            "name": "20%",
            "value": 20
          }, {
            "name": "10%",
            "value": 10
        }, {
            "name": "4%",
            "value": 4
        }, {
            "name": "2%",
            "value": 2
        }, {
            "name": "1%",
            "value": 1
        }, {
            "name": ".5%",
            "value": 0.5
        }, {
            "name": ".2%",
            "value": 0.2
        }];
        

        private _selectedAEP;

        public get SelectedAEP() {
            return this._selectedAEP;
        }

        public set SelectedAEP(val) {
            this._selectedAEP = val;
        }
        public drainageArea: number;
        public mainChannelLength: number;
        public mainChannelSlope: number;
        public totalImperviousArea: number;

        private _selectedTab: SCStormRunoffType;
        public get SelectedTab(): SCStormRunoffType {
            return this._selectedTab;
        }
        public set SelectedTab(val: SCStormRunoffType) {
            if (this._selectedTab != val) {
                this._selectedTab = val;
                this.selectRunoffType();
            }//end if           
        }

        public parameters;
        public parameterResults;
        
        public regressionRegions;

        public BrowserIE: boolean;
        public BrowserChrome: boolean;
        public angulartics: any;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$analytics', 'toaster', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance', '$timeout', 'WiM.Event.EventManager'];
        constructor($scope: ISCStormRunoffControllerScope, $analytics, toaster, $http: ng.IHttpService, studyAreaService: StreamStats.Services.IStudyAreaService, modal: ng.ui.bootstrap.IModalServiceInstance, public $timeout: ng.ITimeoutService, private EventManager: WiM.Event.IEventManager) {
            super($http, configuration.baseurls.StormRunoffServices);
            $scope.vm = this;
            this.angulartics = $analytics;
            this.toaster = toaster;
            this.modalInstance = modal;
            this.StudyArea = studyAreaService.selectedStudyArea;
            this.studyAreaService = studyAreaService;
        
            this.init();  

            this.print = function () {
                window.print();
            };            
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public GetStormRunoffResults(statisticGroup) {
            console.log('in GetStormRunoffResults');
            console.log(statisticGroup);

            // // Bohman Urban (1992)            
            var data = [{  // Urban Peak Flow Statistics for Bohman Urban (1992)
                "id": 31,
                "name": "Urban Peak-Flow Statistics",
                "code": "UPFS",
                "defType": "FS",
                "statisticGroupName": "Urban Peak-Flow Statistics",
                "statisticGroupID": "31", 
                "regressionRegions" : statisticGroup[0].regressionRegions
            }]
            console.log(data)
            
            // var url = configuration.baseurls['NSS'] + configuration.queryparams['estimateFlows'].format('SC');
            // var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, 1, 'json', JSON.stringify(data));
            // this.Execute(request).then((response: any) => {
            //         console.log(response);
            //         //make sure there are some results
            //         if (response.data[0].regressionRegions.length > 0 && response.data[0].regressionRegions[0].results && response.data[0].regressionRegions[0].results.length > 0) {
                        
            //         }
            //         else {
            //             this.toaster.clear();
            //             this.toaster.pop('error', "There was an error Estimating Flows", "No results were returned", 0);
            //         }
            //     },(error) => {
            //         //sm when error
            //         this.toaster.clear();
            //         this.toaster.pop('error', "There was an error Estimating Flows", "HTTP request error", 0);
            //     }).finally(() => {    
            // });

            // Use the response to pull out the % Area from Region_3_Urban_2014_5030 (RG_Code: GC1585) and the % Area from Region_4_Urban_2014_5030 (RG_Code: GC1586)
                // regressioneRegions.percentWeight 
            // Also pull out the relevant AEP values for Region 3 and/or Region 4 (ex "UPK50AEP")
                // regressionRegions.results
            // Use the drainage point latitude, drainage point longitude, % Area in Region 3, Region 3 AEP statistic, % Area in Region 4, Region 4 AEP statistic, DRNAREA, LFPLENGTH, CSL10_85fm, and LC09IMP values and send them to the sc-runoffmodelingservice urbanhydrographbohman1992 endpoint
            



            
            // Bohman Rural (1989)
            // Use parameters and above response to do this POST request: https://streamstats.usgs.gov/nssservices/scenarios/estimate?regions=SC
            // Use the response to pull out the % Area from all the relevant regions (awaiting info/updates from Kitty about the regions that correspond to the Bohman 1989 regions)
            // Also pull out the relevant area-weighted AEP values for all the regions (this will be Qp) Urban or Peak?
            // Use the % Area in each region, the weighted AEP value of interest, and the total drainage area send them to the sc-runoffmodelingservice urbanhydrographbohman1992 endpoint
            
            // The service returns the data used to generate tables and graphs.
            this.CanContinue = true;

        }


        public addParameterValues(statisticGroup) { // get other parameter values related to equations in estimate endpoint 
            console.log('in calc additional parameters')
            var parameterList = [];
            statisticGroup[0].regressionRegions.forEach((regressionRegion) => {                    
                regressionRegion.parameters.forEach((regressionParam) => {   
                    parameterList.push(regressionParam.code);            
                });
            });

            parameterList = parameterList.filter(
                (element, i) => i === parameterList.indexOf(element)
            );

            try {
                var workspaceID = this.studyAreaService.selectedStudyArea.WorkspaceID;
                var regionID = this.studyAreaService.selectedStudyArea.RegionID
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(regionID, workspaceID, parameterList.join(','));
                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);
                request.withCredentials = true;
                
                this.Execute(request).then(
                    (response: any) => {
                        if (response.data.parameters && response.data.parameters.length > 0) {
                            this.toaster.clear();
                            //check each returned parameter for issues
                            var paramErrors = false;
                            angular.forEach(response.data.parameters, (parameter) => {
                                if (!parameter.hasOwnProperty('value') || parameter.value == -999) {
                                    paramErrors = true;
                                    console.error('Parameter failed to compute: ', parameter.code);
                                    parameter.loaded = false;
                                }
                                else {
                                    parameter.loaded = true;
                                }
                            });
                            //if there is an issue, pop open 
                            if (paramErrors) {
                                this.toaster.pop('error', "Error", "Parameter failed to compute", 0);
                            }
                            // Add parameters values 
                            statisticGroup[0].regressionRegions.forEach((regressionRegion) => {                    
                                regressionRegion.parameters.forEach((regressionParam) => {         
                                    response.data.parameters.forEach((param) => {
                                        if (regressionParam.code.toLowerCase() == param.code.toLowerCase()) {
                                            regressionParam.value = param['value'];
                                        }
                                    });
                                });
                            });

                            this.GetStormRunoffResults(statisticGroup)
                        }
                    },(error) => {
                        //sm when error
                        this.toaster.clear();
                        this.toaster.pop("error", "There was an HTTP error calculating parameters", "Please retry", 0);
                    }).finally(() => {
                        this.CanContinue = true;
                        this.hideAlerts = true;
                        console.log('done calc additional parameters')
                    });
            } catch (e) {
                this.toaster.pop('error', "There was an error calculating parameters", "", 0);                 
            }
        }

        public loadParametersByStatisticsGroup(regressionregions: string, percentWeights: any) {
            console.log('in loadParametersByStatisticsGroup');
            var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupParameterLookup'];
            url = url.format('SC', 31, regressionregions); // Urban Peak Flow Statistics for Bohman Urban (1992)
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {
                    //check to make sure there is a valid response
                    if (response.data[0].regressionRegions[0].parameters && response.data[0].regressionRegions[0].parameters.length > 0) {                        
                        // Add percent weights
                        response.data[0].regressionRegions.forEach((regressionRegion) => {
                            if(percentWeights.length > 0) {
                                percentWeights.forEach((regressionRegionPercentWeight) => {
                                    if (regressionRegionPercentWeight.code.indexOf(regressionRegion.code.toUpperCase()) > -1) {
                                        regressionRegion["percentWeight"] = regressionRegionPercentWeight.percentWeight;                                            
                                    }
                                })
                            }
                        });

                        this.addParameterValues(response.data);

                    }
                    //this.toaster.clear();
                    //sm when complete
                },(error) => {
                    //sm when error
                    this.toaster.clear();
                    this.toaster.pop('error', "There was an error Loading Parameters by Statistics Group", "Please retry", 0);
                }).finally(() => {
                });
        }


        public queryRegressionRegions() {
            this.CanContinue = false;
            console.log('in queryRegressionRegions');
            var headers = {
                "Content-Type": "application/json",
                "X-Is-StreamStats": true
            };
            var url = configuration.baseurls['NSS'] + configuration.queryparams['RegressionRegionQueryService'];
            var studyArea = this.studyAreaService.simplify(angular.fromJson(angular.toJson(this.studyAreaService.selectedStudyArea.FeatureCollection.features.filter(f => { return (<string>(f.id)).toLowerCase() == "globalwatershed" })[0])));
            var studyAreaGeom = studyArea.geometry; 
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, "json", angular.toJson(studyAreaGeom), headers);     

            this.Execute(request).then(
                (response: any) => {
                    if (response.data.error) {
                        this.toaster.pop('error', "There was an error querying regression regions", response.data.error.message, 0);
                    }
                    if (response.data.length == 0) {
                        this.toaster.pop('error', "No regression regions were returned", "Regression based scenario computation not allowed", 0);
                    }
                    if (response.data.length > 0) {
                        response.data.forEach(p => { p.code = p.code.toUpperCase().split(",") });       
                        this. loadParametersByStatisticsGroup(response.data.map(function (elem) {
                            return elem.code;
                        }).join(","), response.data)
                    }
                },(error) => {
                    this.toaster.pop('error', "There was an HTTP error querying Regression regions", "Please retry", 0);
                }).finally(() => {
            });
        }

        public CalculateParameters(parameters) {
            console.log('in CalculateParameters');
            try {
                this.toaster.pop("wait", "Calculating Missing Parameters", "Please wait...", 0);
                this.parameters = parameters;
                this.CanContinue = false;
                var workspaceID = this.studyAreaService.selectedStudyArea.WorkspaceID;
                var regionID = this.studyAreaService.selectedStudyArea.RegionID
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(regionID, workspaceID, parameters);
                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);
                request.withCredentials = true;
                
                this.Execute(request).then(
                    (response: any) => {
                        if (response.data.parameters && response.data.parameters.length > 0) {
                            this.toaster.clear();
                            //check each returned parameter for issues
                            var paramErrors = false;
                            angular.forEach(response.data.parameters, (parameter) => {
                                if (!parameter.hasOwnProperty('value') || parameter.value == -999) {
                                    paramErrors = true;
                                    console.error('Parameter failed to compute: ', parameter.code);
                                    parameter.loaded = false;
                                }
                                else {
                                    parameter.loaded = true;
                                }
                            });
                            //if there is an issue, pop open 
                            if (paramErrors) {
                                this.toaster.pop('error', "Error", "Parameter failed to compute", 0);
                            }
                            response.data.parameters.forEach(param => {
                                if (param.code.toLowerCase() == 'drnarea') this.drainageArea = param.value;
                                if (param.code.toLowerCase() == 'csl10_85fm') this.mainChannelSlope = param.value;
                                if (param.code.toLowerCase() == 'lc06imp') this.totalImperviousArea = param.value;
                                if (param.code.toLowerCase() == 'lfplength') this.mainChannelLength = param.value;
                            });
                            console.log('done calc parameters')
                        }
                    },(error) => {
                        //sm when error
                        this.toaster.clear();
                        this.toaster.pop("error", "There was an HTTP error calculating parameters", "Please retry", 0);
                    }).finally(() => {
                        this.CanContinue = true;
                        this.hideAlerts = true;
                    });
            } catch (e) {
                this.toaster.pop('error', "There was an error calculating parameters", "", 0);                 
            }
        }

        public validateForm(mainForm) {
            if (mainForm.$valid) {
                return true;
            }
            else {
                this.showResults = false;
                this.hideAlerts = false;
                return false;
            }
        }

        public ClearResults() {
            for (var i in this.studyAreaService.studyAreaParameterList) {
                this.studyAreaService.studyAreaParameterList[i].value = null;
                //this.SelectedParameterList[i].value = null;
            }

            this.SelectedAEP = this.AEPOptions[0];
            this.SelectedAEP = null;
            this.drainageArea = null;
            this.mainChannelLength = null;
            this.mainChannelSlope = null;
            this.totalImperviousArea = null;
            this.SelectedAEP = {"name": "50%", "value": 50};
            this.showResults = false;
        }

        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }

        public Reset(): void {
            this.init();
        }

        private downloadCSV() {
            
        }

        private loadGraphData(): any {
            
        }

        private GetTableData(): any {
            
        }

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-        
        private init(): void {            
            this.SelectedTab = SCStormRunoffType.BohmanRural1989;
            this.showResults = false;
            this.hideAlerts = false;
            this.CanContinue = true;
            this.SelectedAEP = {"name": "50%", "value": 50};
        }

        private selectRunoffType() {
            switch (this._selectedTab) {
                case SCStormRunoffType.BohmanRural1989:

                    break;
                case SCStormRunoffType.BohmanUrban1992:

                    break;
                default: //case SCStormRunoffType.SyntheticUrbanHydrograph

                    break;
            }
        }

        private tableToCSV($table) {
            
        }
        
    } 

    enum SCStormRunoffType {
        BohmanRural1989= 1,
        BohmanUrban1992 = 2,
        SyntheticUrbanHydrograph = 3
    }

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.SCStormRunoffController', SCStormRunoffController);

}//end module 