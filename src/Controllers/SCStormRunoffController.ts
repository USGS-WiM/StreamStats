//------------------------------------------------------------------------------
//----- SC Storm runoff controller------------------------------------------------
//------------------------------------------------------------------------------

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
        WeightedRunoff: any;
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
            this.SyntheticUrbanHydrograph = { Graph: {}, WeightedRunoff : null  };
            this.BohmanRural1989 = { Graph: {}, WeightedRunoff : null  };
            this.BohmanUrban1992 = { Graph: {}, WeightedRunoff : null  };
        }
    }

    interface ISCStormRunoffController extends IModal {
    }

    class SCStormRunoffController extends WiM.Services.HTTPServiceBase implements ISCStormRunoffController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public AppVersion: string;
        public print: any;
        public StudyArea: StreamStats.Models.IStudyArea;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        public showResults: boolean;
        public hideAlerts: boolean;
        public toaster: any;
        private studyAreaService: Services.IStudyAreaService;
        public canContinue: boolean;
        public ReportData: ISCStormRunoffReportable;
        public drainageArea: number;
        public mainChannelLength: number;
        public mainChannelSlope: number;
        public totalImperviousArea: number;
        public parameters;
        public ReportOptions: any;
        public regressionRegions;
        public reportData;
        public angulartics: any;
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

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$analytics', 'toaster', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance', '$timeout', 'WiM.Event.EventManager'];
        constructor($scope: ISCStormRunoffControllerScope, $analytics, toaster, $http: ng.IHttpService, studyAreaService: StreamStats.Services.IStudyAreaService, modal: ng.ui.bootstrap.IModalServiceInstance, public $timeout: ng.ITimeoutService, private EventManager: WiM.Event.IEventManager) {
            super($http, configuration.baseurls.StormRunoffServices);
            $scope.vm = this;
            this.AppVersion = configuration.version;
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
        public estimateFlows(statisticGroup) {
            // Bohman Urban (1992)            
            var data = [{  // Urban Peak Flow Statistics for Bohman Urban (1992)
                "id": 31,
                "name": "Urban Peak-Flow Statistics",
                "code": "UPFS",
                "defType": "FS",
                "statisticGroupName": "Urban Peak-Flow Statistics",
                "statisticGroupID": "31", 
                "regressionRegions" : statisticGroup[0].regressionRegions
            }];
            
            var url = configuration.baseurls['NSS'] + configuration.queryparams['estimateFlows'].format('SC');
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, 1, 'json', JSON.stringify(data));
            this.Execute(request).then((response: any) => {
                    //make sure there are some results
                    if (response.data[0].regressionRegions.length > 0 && response.data[0].regressionRegions[0].results && response.data[0].regressionRegions[0].results.length > 0) {
                        var region3Percent = 0;
                        var region4Percent = 0;
                        var region3AEP = 0;
                        var region4AEP = 0;

                        response.data[0].regressionRegions.forEach(regressionregion => {
                            if (regressionregion.code == 'GC1585') {
                                region3Percent = regressionregion.percentWeight;
                                regressionregion.results.forEach(result => {
                                    if (result.name.indexOf(this.SelectedAEP.value) !== -1){
                                        region3AEP = result.value;
                                    }
                                })
                            } else if (regressionregion.code == 'GC1586') {
                                region4Percent = regressionregion.percentWeight;
                                regressionregion.results.forEach(result => {
                                    if (result.name.indexOf(this.SelectedAEP.value) !== -1){
                                        region4AEP = result.value;
                                    }
                                })
                            }
                        });

                        // set up data for request 
                        var data = {
                            "lat": this.studyAreaService.selectedStudyArea.Pourpoint.Latitude,
                            "lon": this.studyAreaService.selectedStudyArea.Pourpoint.Longitude,
                            "region3PercentArea": region3Percent,
                            "region4PercentArea": region4Percent, 
                            "region3Qp": region3AEP, 
                            "region4Qp": region4AEP, 
                            "A": this.drainageArea,
                            "L": this.mainChannelLength, 
                            "S": this.mainChannelSlope, 
                            "TIA": this.totalImperviousArea
                        };

                        this.getStormRunoffResults(data);
                    }
                    else {
                        this.toaster.clear();
                        this.toaster.pop('error', "There was an error Estimating Flows", "No results were returned", 0);
                    }
                },(error) => {
                    //sm when error
                    this.toaster.clear();
                    this.toaster.pop('error', "There was an error Estimating Flows", "HTTP request error", 0);
                }).finally(() => {    
            });
            
            // Bohman Rural (1989)
            // Synthetic Urban Hydrograph Method

        }


        public getStormRunoffResults(data){
            var url = configuration.baseurls['SCStormRunoffServices'] + configuration.queryparams['SCStormRunoffBohman1992']
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', JSON.stringify(data));
            this.Execute(request).then((response: any) => {
                    this.reportData = response.data;
                    this.ReportData.BohmanUrban1992.Graph = this.loadGraphData();
                    this.ReportData.BohmanUrban1992.WeightedRunoff = this.reportData.weighted_runoff_volume;
                    this.setGraphOptions();
                    this.showResults = true;
                },(error) => {

                }).finally(() => { 
                    this.canContinue = true;   
            });

        }

        public addParameterValues(statisticGroup) { // get other parameter values related to equations in estimate endpoint 
            var parameterList = [];
            statisticGroup[0].regressionRegions.forEach((regressionRegion) => {                    
                regressionRegion.parameters.forEach((regressionParam) => {   
                    parameterList.push(regressionParam.code);            
                });
            });

            parameterList = parameterList.filter((element, i) => i === parameterList.indexOf(element));

            try {
                var workspaceID = this.studyAreaService.selectedStudyArea.WorkspaceID;
                var regionID = this.studyAreaService.selectedStudyArea.RegionID;
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
                            this.estimateFlows(statisticGroup)
                        }
                    },(error) => {
                        //sm when error
                        this.toaster.clear();
                        this.toaster.pop("error", "There was an HTTP error calculating parameters", "Please retry", 0);
                    }).finally(() => {
                        this.canContinue = true;
                        this.hideAlerts = true;
                    });
            } catch (e) {
                this.toaster.pop('error', "There was an error calculating parameters", "", 0);                 
            }
        }

        public loadParametersByStatisticsGroup(regressionregions: string, percentWeights: any) {
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
            this.canContinue = false;
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

        public calculateParameters(parameters) {
            try {
                this.toaster.pop("wait", "Calculating Missing Parameters", "Please wait...", 0);
                this.parameters = parameters;
                this.canContinue = false;
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
                        }
                    },(error) => {
                        //sm when error
                        this.toaster.clear();
                        this.toaster.pop("error", "There was an HTTP error calculating parameters", "Please retry", 0);
                    }).finally(() => {
                        this.canContinue = true;
                        this.hideAlerts = true;
                    });
            } catch (e) {
                this.toaster.pop('error', "There was an error calculating parameters", "", 0);                 
            }
        }

        private loadGraphData(): any {
            var results = []; 
            var hydrograph = [];
            hydrograph = this.reportData.time_coordinates.map((v, i) => [v, this.reportData.discharge_coordinates[i]]).map(([x, y]) => ({x, y}));
            results.push({ values: hydrograph, key: "Discharge (ft³/s)", color: " #009900", type: "line", yAxis: 1 });   
            return results;
        }

        private setGraphOptions(): void {
            this.ReportOptions = {
                chart: {
                    type: 'multiChart',
                    height: 275,
                    width: 650,
                    margin: {
                        top: 10,
                        right: 80,
                        bottom: 80,
                        left: 90
                    },
                    xAxis: {
                        axisLabel: 'Time, in hours',
                        tickFormat: function (d) {
                            return d.toFixed(0)
                        }
                    },
                    yAxis1: {
                        axisLabel: 'Discharge (Q), in ft³/s'
                    }
                },
                title: {
                    enable: true,
                    text: 'Bohman Urban (1992) using ' + this.SelectedAEP.name + ' AEP',
                    css: {
                        'font-size': '10pt',
                        'font-weight': 'bold'
                    }
                }
                
            };
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

        public clearResults() {
            this.drainageArea = null;
            this.mainChannelLength = null;
            this.mainChannelSlope = null;
            this.totalImperviousArea = null;
            this.SelectedAEP = {"name": "50%", "value": 50};
            this.showResults = false;
        }

        public Close(): void {
            this.modalInstance.dismiss('cancel');
        }

        public Reset(): void {
            this.init();
        }

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-        
        private init(): void { 
            this.ReportData = new SCStormRunoffReportable();           
            this.SelectedTab = SCStormRunoffType.BohmanRural1989;
            this.showResults = false;
            this.hideAlerts = false;
            this.canContinue = true;
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
        BohmanRural1989 = 1,
        BohmanUrban1992 = 2,
        SyntheticUrbanHydrograph = 3
    }

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.SCStormRunoffController', SCStormRunoffController);

}//end module 