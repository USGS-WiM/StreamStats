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

        // SYNTHETIC TAB
        public drainageAreaSynthetic: number;
        public timeOfConcentrationMin: number;
        public peakRateFactor: number;
        public standardCurveNumber: number;
        public watershedRetention: number;
        public initialAbstraction: number;
        public lagTimeLength: number;
        public lagTimeSlope: number;
        public showResultsSynthetic: boolean;
        public warningMessagesSynthetic: any;
        public syntheticResponseData: any;
        public ReportOptionsSynthetic: any;
        public canContinueSynthetic: boolean;
        public stormHydrographOrdinatesAccordionOpen: boolean;

        public mainChannelLength: number;
        public mainChannelSlope: number;
        public totalImperviousArea: number;
        public warningMessages: any;
        public parameters;
        public ReportOptions: any;
        public regressionRegions;
        public reportData;
        public angulartics: any;

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

        // Synthetic UH
        private _selectedAEPSynthetic;
        private _selectedStandardCurve;
        private _selectedCNModification;
        private _selectedTimeOfConcentration;
        private _selectedRainfallDistribution;
        public AEPOptionsSynthetic = [{
            "name": "10% AEP / 10 Year Return Period",
            "value": 10
        }, {
            "name": "4% AEP / 25 Year Return Period",
            "value": 4
        }, {
            "name": "2% AEP / 50 Year Return Period",
            "value": 2
        }, {
            "name": "1% AEP / 100 Year Return Period",
            "value": 1
        }]
        public StandardCurveOptions = [{
            "name": "Area-Weighted Curve Number",
            "value": 1,
            "endpointValue": "area"
        }, {
            "name": "Runoff-Weighted Curve Number",
            "value": 2,
            "endpointValue": "runoff"
        }]
        public CNModificationOptions = [{
            "name": "McCuen",
            "value": 1
        }, {
            "name": "Merkel",
            "value": 2
        }]
        public TimeOfConcentrationOptions = [{
            "name": "Travel Time Method",
            "value": 1,
            "endpointValue": "traveltime"
        }, {
            "name": "Lag Time Equation",
            "value": 2,
            "endpointValue": "lagtime"
        }]
        public RainfallDistributionOptions = [{
            "name": "Type II",
            "value": 2,
        }, {
            "name": "Type III",
            "value": 3,
        }, {
            "name": "NOAA A",
            "value": 4,
        }, {
            "name": "NOAA B",
            "value": 5,
        }, {
            "name": "NOAA C",
            "value": 6,
        }, {
            "name": "NOAA D",
            "value": 7,
        }]
        public get SelectedAEPSynthetic() {
            return this._selectedAEPSynthetic;
        }
        public set SelectedAEPSynthetic(val) {
            this._selectedAEPSynthetic = val;
        }
        public get SelectedStandardCurve() {
            return this._selectedStandardCurve;
        }
        public set SelectedStandardCurve(val) {
            this._selectedStandardCurve = val;
        }
        public get SelectedCNModification() {
            return this._selectedCNModification;
        } 
        public set SelectedCNModification(val) {
            this._selectedCNModification = val;
        }
        public get SelectedTimeOfConcentration() {
            return this._selectedTimeOfConcentration
        }
        public set SelectedTimeOfConcentration(val) {
            this._selectedTimeOfConcentration = val;
        }
        public get SelectedRainfallDistribution() {
            return this._selectedRainfallDistribution;
        }
        public set SelectedRainfallDistribution(val) {
            this._selectedRainfallDistribution = val;
        }

        private greaterThanZero = /^([0-9]*[1-9][0-9]*(\.[0-9]+)?|[0]+\.[0-9]*[1-9][0-9]*)$/;
        private gTZInvalidMessage = "Value must be greater than 0"
        private greaterThanOrEqualToZero = /0+|^([0-9]*[1-9][0-9]*(\.[0-9]+)?|[0]+\.[0-9]*[1-9][0-9]*)$/;
        private gTOETZInvalidMessage = "Value must be greater than or equal to 0"
        private betweenZeroOneHundred = /^(\d{0,2}(\.\d{1,2})?|100(\.00?)?)$/;

        private _defaultFlowTypes = [
            {
                id: "sheetFlow",
                displayName: "Sheet Flow",
                accordionOpen: false,
                questions: [
                    {
                        id: "surface",
                        label: "Surface",
                        type: "select",
                        value: null,
                        options: {
                            "Smooth asphalt": 0.011,
                            "Smooth concrete": 0.012,
                            "Fallow (no residue)": 0.050,
                            "Short grass prairie": 0.150,
                            "Dense grasses": 0.240,
                            "Bermuda grass": 0.410,
                            "Light underbrush": 0.400,
                            "Dense underbrush": 0.800,
                            "Cultivated Soil with Residue cover <=20%": 0.060,
                            "Cultivated Soil with Residue cover >=20%": 0.170,
                            "Natural Range": 0.130
                        }
                    },
                    {
                        id: "length",
                        label: "Length (ft)",
                        type: "number",
                        value: null,
                        pattern: "greaterThanZero",
                        invalidMessage: this.gTZInvalidMessage
                    },
                    {
                        id: "overland",
                        label: "Overland Slope (%)",
                        type: "number",
                        value: null,
                        pattern: "greaterThanOrEqualToZero",
                        invalidMessage: this.gTOETZInvalidMessage
                    }
                ],
            },
            {
                id: "excessSheetFlow",
                displayName: "Excess Sheet Flow",
                accordionOpen: false,
                questions: [
                    {
                        id: "surface",
                        label: "Surface",
                        type: "select",
                        value: null,
                        /// place holder value of "1, 2, 3..." because the actual values are JSON objects. Link the two when building the hydrograph
                        options: {
                            "Pavement and small upland gullies": 1,
                            "Grassed waterways": 2,
                            "Nearly bare and untilled (overland flow)": 3,
                            "Cultivated straight row crops": 4,
                            "Short-grass pasture": 5,
                            "Minimum cultivation, contour or strip-cropped, and woodlands": 6,
                            "Forest with heavy ground litter and hay meadows": 7
                        }
                    },
                    {
                        id: "slope",
                        label: "Slope (%)",
                        type:"number",
                        value: null,
                        pattern: "greaterThanOrEqualToZero",
                        invalidMessage: this.gTOETZInvalidMessage
                    }
                ]
            },
            {
                id: "shallowConcentratedFlow",
                displayName: "Shallow Concentrated Flow",
                accordionOpen: false,
                questions: [
                    {
                        id: "shallowFlowType",
                        label: "Shallow Flow Type",
                        type: "select",
                        value: null,
                        /// place holder value of "1, 2, 3..." because the actual values are JSON objects. Link the two when building the hydrograph
                        options: {
                            "Pavement and small upland gullies": 1,
                            "Grassed waterways": 2,
                            "Nearly bare and untilled (overland flow)": 3,
                            "Cultivated straight row crops": 4,
                            "Short-grass pasture": 5,
                            "Minimum cultivation, contour or strip-cropped, and woodlands": 6,
                            "Forest with heavy ground litter and hay meadows": 7
                        }
                    },
                    {
                        id: "length",
                        label: "Length (ft)",
                        type: "number",
                        value: null,
                        pattern: "greaterThanZero",
                        invalidMessage: this.gTZInvalidMessage
                    },
                    {
                        id: "slope",
                        label: "Slope (%)",
                        type:"number",
                        value: null,
                        pattern: "greaterThanOrEqualToZero",
                        invalidMessage: this.gTOETZInvalidMessage
                    },
                ]
            },
            {
                id: "channelizedFlowOpen",
                displayName: "Channelized Flow - Open Channel",
                accordionOpen: false,
                questions: [
                    {
                        id: "baseWidth",
                        label: "Base Width",
                        type: "number",
                        value: null,
                        pattern: "greaterThanZero",
                        invalidMessage: this.gTZInvalidMessage
                    },
                    {
                        id: "frontSlope",
                        label: "Front Slope (Z hor:1 vert)",
                        type: "number",
                        value: null,
                        pattern: "greaterThanZero",
                        invalidMessage: this.gTZInvalidMessage
                    },
                    {
                        id: "backSlope",
                        label: "Back Slope (Z hor:1 vert)",
                        type: "number",
                        value: null,
                        pattern: "greaterThanZero",
                        invalidMessage: this.gTZInvalidMessage
                    },
                    {
                        id: "channelDepth",
                        label: "Channel Depth (ft)",
                        type: "number",
                        value: null,
                        pattern: "greaterThanZero",
                        invalidMessage: this.gTZInvalidMessage
                    },
                    {
                        id: "length",
                        label: "Length (ft)",
                        type: "number",
                        value: null,
                        pattern: "greaterThanZero",
                        invalidMessage: this.gTZInvalidMessage
                    },
                    {
                        id: "channelBedSlope",
                        label: "Channel Bed Slope (%)",
                        type: "number",
                        value: null,
                        pattern: "greaterThanZero",
                        invalidMessage: this.gTZInvalidMessage
                    },
                    {
                        id: "manningNValue",
                        label: "Manning n-value",
                        type: "number",
                        value: null,
                        pattern: "greaterThanZero",
                        invalidMessage: this.gTZInvalidMessage
                    },
                ]
            },
            {
                id: "channelizedFlowStorm",
                displayName: "Channelized Flow - Storm Sewer",
                accordionOpen: false,
                questions: [
                    {
                        id: "pipeMaterial",
                        label: "Pipe Material",
                        type: "select",
                        value: null,
                        /// place holder value of "1, 2, 3..." because the actual values are JSON objects. Link the two when building the hydrograph
                        options: {
                            "Aluminum": 1,
                            "CMP": 2,
                            "Concrete": 3,
                            "Corrugated HDPE": 4,
                            "PVC": 5,
                            "Steel": 6
                        }
                    },
                    {
                        id: "diameter",
                        label: "Diameter (in)",
                        type: "number",
                        value: null,
                        pattern: "greaterThanZero",
                        invalidMessage: this.gTZInvalidMessage
                    },
                    {
                        id: "length",
                        label: "Length (ft)",
                        type: "number",
                        value: null,
                        pattern: "greaterThanZero",
                        invalidMessage: this.gTZInvalidMessage
                    },
                    {
                        id: "slope",
                        label: "Slope (%)",
                        type:"number",
                        value: null,
                        pattern: "greaterThanOrEqualToZero",
                        invalidMessage: this.gTOETZInvalidMessage
                    }
                ]
            },
            {
                id: "channelizedFlowUserInput",
                displayName: "Channelized Flow - User Input",
                accordionOpen: false,
                questions: [
                    {
                        id: "length",
                        label: "Length (ft)",
                        type: "number",
                        value: null,
                        pattern: "greaterThanZero",
                        invalidMessage: this.gTZInvalidMessage
                    },
                    {
                        id: "velocity",
                        label: "Velocity (fps)",
                        type: "number",
                        value: null,
                        pattern: "greaterThanZero",
                        invalidMessage: this.gTZInvalidMessage
                    },
                ]
            },
        ]

        // for the flow segments that have json objects as values of the drop down options, use this table to link when building the hydrograph
        private linkableFlowSegmentOptions: {
            excessSheetFlow: {
                "Pavement and small upland gullies": 
                    {
                        "Depth": 0.2,
                        "Manning's N": 0.025,
                        "Velocity Constant": 20.328
                    },
                "Grassed waterways": 
                    {
                        "Depth": 0.4,
                        "Manning's N": 0.05,
                        "Velocity Constant": 16.135 
                    },
                "Nearly bare and untilled (overland flow)": 
                    {
                        "Depth": 0.2,
                        "Manning's N": 0.051,
                        "Velocity Constant": 9.965 
                    },
                "Cultivated straight row crops": 
                    {
                        "Depth": 0.2,
                        "Manning's N": 0.058,
                        "Velocity Constant": 8.762
                    },
                "Short-grass pasture": 
                    {
                        "Depth": 0.2,
                        "Manning's N": 0.073,
                        "Velocity Constant": 6.962
                    },
                "Minimum cultivation, contour or strip-cropped, and woodlands": 
                    {
                        "Depth": 0.2,
                        "Manning's N": 0.101,
                        "Velocity Constant": 5.032 
                    },
                "Forest with heavy ground litter and hay meadows": 
                    {
                        "Depth": 0.2,
                        "Manning's N": 0.202,
                        "Velocity Constant": 2.516
                    }
            },
            shallowConcentratedFlow: {
                "Pavement and small upland gullies": 
                    {
                        "Depth": 0.2,
                        "Manning's N": 0.025,
                        "Velocity Constant": 20.328
                    },
                "Grassed waterways": 
                    {
                        "Depth": 0.4,
                        "Manning's N": 0.05,
                        "Velocity Constant": 16.135 
                    },
                "Nearly bare and untilled (overland flow)": 
                    {
                        "Depth": 0.2,
                        "Manning's N": 0.051,
                        "Velocity Constant": 9.965 
                    },
                "Cultivated straight row crops": 
                    {
                        "Depth": 0.2,
                        "Manning's N": 0.058,
                        "Velocity Constant": 8.762
                    },
                "Short-grass pasture": 
                    {
                        "Depth": 0.2,
                        "Manning's N": 0.073,
                        "Velocity Constant": 6.962
                    },
                "Minimum cultivation, contour or strip-cropped, and woodlands": 
                    {
                        "Depth": 0.2,
                        "Manning's N": 0.101,
                        "Velocity Constant": 5.032 
                    },
                "Forest with heavy ground litter and hay meadows": 
                    {
                        "Depth": 0.2,
                        "Manning's N": 0.202,
                        "Velocity Constant": 2.516
                    }
            },
            channelizedFlowStorm: {
                "Aluminum": 0.024,
                "CMP": 0.024,
                "Concrete": 0.013,
                "Corrugated HDPE": 0.02,
                "PVC": 0.01,
                "Steel": 0.013
            }
        }

        // base keys match with ids from the object above ^^^^
        private _defaultFlowSegments = {
            sheetFlow: [

            ],
            excessSheetFlow: [

            ],
            shallowConcentratedFlow: [

            ],
            channelizedFlowOpen: [

            ],
            channelizedFlowStorm: [

            ],
            channelizedFlowUserInput: [

            ]

        }

        public TravelTimeFlowTypes = this._defaultFlowTypes.slice();
        public TravelTimeFlowSegments = JSON.parse(JSON.stringify(this._defaultFlowSegments));

        public addFlowSegmentOpen = false;
        private _chosenFlowTypeIndex : number;
        public get chosenFlowTypeIndex() {
            return this._chosenFlowTypeIndex;
        } 

        // for synthetic graph options 
        public DHourStormOptions = [{
            "name": "1-Hour",
            "value": 1,
            "maxTimeMinutes": 500
        },
        {
            "name": "2-Hour",
            "value": 2,
            "maxTimeMinutes": 500
        },
        {
            "name": "3-Hour",
            "value": 3,
            "maxTimeMinutes": 600
        },
        {
            "name": "6-Hour",
            "value": 6,
            "maxTimeMinutes": 800
        },
        {
            "name": "12-Hour",
            "value": 12,
            "maxTimeMinutes": 1000
        },
        {
            "name": "24-Hour",
            "value": 24,
            "maxTimeMinutes": 1800
        }]
        private _selectedDHourStorm = {
            "name": "1-Hour",
            "value": 1,
            "maxTimeMinutes": 500
        }
        public get SelectedDHourStorm() {
            return this._selectedDHourStorm;
        }
        public set SelectedDHourStorm(val) {
            this._selectedDHourStorm = val;
        }

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$analytics', 'toaster', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance', '$timeout', 'WiM.Event.EventManager'];
        constructor($scope: ISCStormRunoffControllerScope, $analytics, toaster, $http: ng.IHttpService, studyAreaService: StreamStats.Services.IStudyAreaService, modal: ng.ui.bootstrap.IModalServiceInstance, public $timeout: ng.ITimeoutService, private EventManager: WiM.Event.IEventManager) {
            super($http, configuration.baseurls.StormRunoffServices);
            $scope.vm = this;
            $scope.greaterThanZero = this.greaterThanZero;
            $scope.greaterThanOrEqualToZero = this.greaterThanOrEqualToZero;
            $scope.betweenZeroOneHundred = this.betweenZeroOneHundred; 
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
            
            
            var headers = {
                "Content-Type": "application/json",
                "X-warning": true
            };
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', JSON.stringify(data), headers);
            this.Execute(request).then((response: any) => {
                    this.reportData = response.data;
                    this.ReportData.BohmanUrban1992.Graph = this.loadGraphData();
                    this.ReportData.BohmanUrban1992.WeightedRunoff = this.reportData.weighted_runoff_volume;
                    this.setGraphOptions();
                    this.showResults = true;
                    if (response.headers()['x-warning']) {
                        this.warningMessages = response.headers()['x-warning'];
                    }
                },(error) => {
                    this.toaster.pop('error', "Error", error["data"]["detail"], 0);
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
                            return d.toUSGSvalue();
                        }
                    },
                    yAxis1: {
                        axisLabel: 'Discharge (Q), in ft³/s',
                        tickFormat: function (d) {
                            return d.toUSGSvalue();
                        }
                    }
                },
                title: {
                    enable: true,
                    text: 'USGS SC Flood Hydrograph for Urban Watersheds using ' + this.SelectedAEP.name + ' AEP',
                    css: {
                        'font-size': '10pt',
                        'font-weight': 'bold'
                    }
                }
                
            };
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

        /**
         * Returns JSON object of properly formatted flow segments for api calls
         */ 
        public getFormattedFlowSegments() {
            let formattedSegments = {
                sheetFlow: [],
                excessSheetFlow: [],
                shallowConcentratedFlow: [],
                channelizedFlowOpen: [],
                channelizedFlowStorm: [],
                channelizedFlowUserInput: []
            };
            let flowKeys = Object.keys(this.TravelTimeFlowSegments);
            for(let flowSegment of flowKeys) {
                let allSegmentsOfType = [];
                for(let segment of this.TravelTimeFlowSegments[flowSegment]) {
                    // inside a flow type's individual flow segments
                    let segmentData = {};
                    for(let question of segment) {
                        // inside a singular question of a segment
                        let value = question.value;
                        if(question.options) {
                            let optionKeys = Object.keys(question.options);
                            for(let key of optionKeys) {
                                if(value == question.options[key]) {
                                    value = key;
                                    break;
                                }
                            }
                        }
                        let label = question.label.split(" (")[0];
                        segmentData[label] = value;
                    }
                    allSegmentsOfType.push(segmentData);
                }
                formattedSegments[flowSegment] = allSegmentsOfType;
            }
            return formattedSegments;
        }

        public queryRegressionRegionsSynthetic() {
            this.canContinueSynthetic = false;
            var headers = {
                "Content-Type": "application/json",
                "X-Is-StreamStats": true
            };
            var url = configuration.baseurls['SCStormRunoffServices'] + configuration.queryparams['SCStormRunoffSyntheticUnitComputerGraphResults'];
            // var studyArea = this.studyAreaService.simplify(angular.fromJson(angular.toJson(this.studyAreaService.selectedStudyArea.FeatureCollection.features.filter(f => { return (<string>(f.id)).toLowerCase() == "globalwatershed" })[0])));
            // var studyAreaGeom = studyArea.geometry; 
            let data = {
                "lat": this.studyAreaService.selectedStudyArea.Pourpoint.Latitude,
                "lon": this.studyAreaService.selectedStudyArea.Pourpoint.Longitude,
                "AEP": this._selectedAEPSynthetic.value,
                "CNModificationMethod": this._selectedCNModification.name,
                "Area": this.drainageAreaSynthetic,
                "Tc": this.timeOfConcentrationMin,
                "RainfallDistributionCurve": this._selectedRainfallDistribution.name.split(" ")[1],
                "PRF": this.peakRateFactor,
                "CN": this.standardCurveNumber,
                "S": this.watershedRetention,
                "Ia": this.initialAbstraction
            };
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, "json", angular.toJson(data), headers);     

            this.Execute(request).then(
                (response: any) => {
                    if(!response.data) {
                        this.toaster.pop('error', "There was an HTTP error querying Regression regions", "Please retry", 0);
                        return;
                    }
                    console.log(response);
                        // hydrograph_ordinates_table:
                        // runoff_results_table:
                        // unit_hydrograph_data:
                        // watershed_data:
                    if(!response.data.hydrograph_ordinates_table || !response.data.runoff_results_table || !response.data.unit_hydrograph_data || !response.data.watershed_data) {
                        this.toaster.pop('error', "One or more of the expected data responses came back null.", "Please retry", 0);
                        return;
                    }
                    this.syntheticResponseData = response.data;
                    // basically initializes a bunch of stuff
                    this.DHourStormChange();
                    this.showResultsSynthetic = true;
                    this.canContinueSynthetic = true;
                },(error) => {
                    this.toaster.pop('error', "There was an HTTP error querying Regression regions", "Please retry", 0);
                }).finally(() => {
            });
        }

        private loadSyntheticGraphData(): any {
            var results = []; 
            var hydrograph = [];
            var flowHour = "flow_" + this._selectedDHourStorm.value + "_hour";  
            var timeArray = [];
            for(let time of this.syntheticResponseData.hydrograph_ordinates_table.time) {
                timeArray.push(time);
                // at the boundary for the time limit
                if(Math.abs(time - this._selectedDHourStorm.maxTimeMinutes) < 6) {
                    break;
                }
            }
            hydrograph = timeArray.map((v, i) => [v, this.syntheticResponseData.hydrograph_ordinates_table[flowHour][i]]).map(([x, y]) => ({x, y}));
            results.push({ values: hydrograph, key: "Flow (ft³/s)", color: " #009900", type: "line", yAxis: 1 });   
            return results;
        }

        private setSyntheticGraphOptions(): void {
            this.ReportOptionsSynthetic = {
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
                        axisLabel: 'Time, in minutes',
                        tickFormat: function (d) {
                            return d.toUSGSvalue();
                        }
                    },
                    yAxis1: {
                        axisLabel: 'Flow, ft³/s',
                        tickFormat: function (d) {
                            return d.toUSGSvalue();
                        }
                    }
                },
                title: {
                    enable: true,
                    text: '' + this._selectedDHourStorm.value + " Hour Storm Hydrograph",
                    css: {
                        'font-size': '10pt',
                        'font-weight': 'bold'
                    }
                }
                
            };
        }

        public DHourStormChange() {
            this.ReportData.SyntheticUrbanHydrograph.Graph = this.loadSyntheticGraphData();
            this.ReportData.SyntheticUrbanHydrograph.WeightedRunoff = this.syntheticResponseData.runoff_results_table;
            this.setSyntheticGraphOptions();
        }

        public isMaxRunoffVolume(index: number) {
            let max_runoff_volume_storm_duration = this.syntheticResponseData.runoff_results_table.max_runoff_volume_storm_duration;
            if(this.DHourStormOptions[index].value == max_runoff_volume_storm_duration) {
                return true;
            }
            return false;
        }

        public isMaxPeakRunoff(index: number) {
            let max_peak_runoff_storm_duration = this.syntheticResponseData.runoff_results_table.max_peak_runoff_storm_duration;
            if(this.DHourStormOptions[index].value == max_peak_runoff_storm_duration) {
                return true;
            }
            return false;
        }

        // similar to 'calculateParameters', but need to use SC-Runoff api endpoints as well
        public calculateSyntheticParameters(parameters) {
            try {
                this.toaster.pop("wait", "Calculating Missing Parameters", "Please wait...", 0);
                this.parameters = parameters;
                this.canContinueSynthetic = false;
                var workspaceID = this.studyAreaService.selectedStudyArea.WorkspaceID;
                var regionID = this.studyAreaService.selectedStudyArea.RegionID
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(regionID, workspaceID, parameters);
                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);
                request.withCredentials = true;
                this.Execute(request).then(
                    (response: any) => {
                        if (response.data.parameters && response.data.parameters.length > 0) {
                            // check each returned parameter for issues
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
                            // if there is an issue, pop open 
                            if (paramErrors) {
                                this.toaster.pop('error', "Error", "Parameter failed to compute", 0);
                            }
                            response.data.parameters.forEach(param => {
                                if (param.code.toLowerCase() == 'drnarea' && !this.drainageAreaSynthetic) this.drainageAreaSynthetic = param.value;
                                if (param.code.toLowerCase() == 'csl10_85fm' && this._selectedTimeOfConcentration?.value == 2 && !this.lagTimeLength) this.lagTimeLength = param.value;
                                if (param.code.toLowerCase() == 'lfplength' && this._selectedTimeOfConcentration?.value == 2 && !this.lagTimeSlope) this.lagTimeSlope =  param.value;
                            });

                            // Other SCStormModelingServices data
                            var data = {};
                            var url = ""; 
                            var headers = {
                                "Content-Type": "application/json",
                                "X-warning": true
                            };
                            let formattedSegments = this.getFormattedFlowSegments();
                            // master data endpoing
                            data = {
                                "lat": this.studyAreaService.selectedStudyArea.Pourpoint.Latitude,
                                "lon": this.studyAreaService.selectedStudyArea.Pourpoint.Longitude,
                                "AEP": this._selectedAEPSynthetic?.value,
                                "curveNumberMethod": this._selectedStandardCurve?.endpointValue,
                                "TcMethod": this._selectedTimeOfConcentration.endpointValue,
                                "length": this._selectedTimeOfConcentration?.value == 2 ? this.lagTimeLength : null,
                                "slope": this._selectedTimeOfConcentration?.value == 2 ? this.lagTimeSlope : null,
                                "dataSheetFlow": this._selectedTimeOfConcentration?.value == 1 ? formattedSegments.sheetFlow : null,
                                "dataExcessSheetFlow": this._selectedTimeOfConcentration?.value == 1 ? formattedSegments.excessSheetFlow : null, 
                                "dataShallowConcentratedFlow": this._selectedTimeOfConcentration?.value == 1 ? formattedSegments.shallowConcentratedFlow : null,
                                "dataChannelizedFlowOpenChannel": this._selectedTimeOfConcentration?.value == 1 ? formattedSegments.channelizedFlowOpen : null,
                                "dataChannelizedFlowStormSewer": this._selectedTimeOfConcentration?.value == 1 ? formattedSegments.channelizedFlowStorm : null, 
                                "dataChannelizedFlowStormSewerOrOpenChannelUserInputVelocity": this._selectedTimeOfConcentration?.value == 1 ? formattedSegments.channelizedFlowUserInput : null
                            };

                            url = configuration.baseurls['SCStormRunoffServices'] + configuration.queryparams['SCStormRunoffSyntheticUnitHydrograph']
                            
                            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', JSON.stringify(data), headers);
                            this.Execute(request).then((response: any) => {                     
                                let data = response.data;
                                let keys = Object.keys(data);
                                for(let key of keys) {
                                    if(key == "Ia" && !this.initialAbstraction) this.initialAbstraction = response.data.Ia.toUSGSvalue()
                                    if(key == "S" && !this.watershedRetention) this.watershedRetention = response.data.S.toUSGSvalue()
                                    if(key == "curve_number" && !this.standardCurveNumber) this.standardCurveNumber = response.data.curve_number.toUSGSvalue()
                                    if(key == "peak_rate_factor" && !this.peakRateFactor) this.peakRateFactor = response.data.peak_rate_factor.toUSGSvalue()
                                    if(key == "rainfall_distribution_curve_letter" && !this._selectedRainfallDistribution) {
                                        for(let option of this.RainfallDistributionOptions) {
                                            if(option.name.indexOf(response.data.rainfall_distribution_curve_letter) != -1) { // same as includes
                                                this._selectedRainfallDistribution = option;
                                                break;
                                            }
                                        }
                                    }
                                    if(key == "time_of_concentration" && !this.timeOfConcentrationMin) this.timeOfConcentrationMin = response.data.time_of_concentration.value.toUSGSvalue()
                                }
                                var paramErrors = false;
                                var failedToCompute = [];
                                if(!this.initialAbstraction) {
                                    paramErrors = true;
                                    failedToCompute.push("Initial Abstraction")
                                }
                                if(!this.watershedRetention) {
                                    paramErrors = true;
                                    failedToCompute.push("Watershed Retention")
                                }
                                if(!this.standardCurveNumber) {
                                    paramErrors = true;
                                    failedToCompute.push("Standard Curve Number")
                                }
                                if(!this.peakRateFactor) {
                                    paramErrors = true;
                                    failedToCompute.push("Peak Rate Factor")
                                }
                                if(!this._selectedRainfallDistribution) {
                                    paramErrors = true;
                                    failedToCompute.push("Rainfall Distribution")
                                }
                                if(!this.timeOfConcentrationMin) {
                                    paramErrors = true;
                                    failedToCompute.push("Time of Concentration")
                                }
                                if (paramErrors) {
                                    this.toaster.clear();
                                    this.toaster.pop('error', "Error", "Parameter(s) failed to compute: " + failedToCompute.join(", "), 0);
                                }
                                else {
                                    this.toaster.clear();
                                }
                            }).catch(error => {
                                this.toaster.clear();
                                this.toaster.pop("error", "There was an HTTP error calculating parameters", "Please retry", 0);
                            })
                        }
                    },(error) => {
                        //sm when error
                        this.toaster.clear();
                        this.toaster.pop("error", "There was an HTTP error calculating parameters", "Please retry", 0);
                    }).finally(() => {
                        this.canContinueSynthetic = true;
                        this.hideAlerts = true;
                    });
            } catch (e) {
                this.toaster.pop('error', "There was an error calculating parameters", "", 0);                 
            }          
        }

        public openAddFlowSegment(indexOfFlow : number) {
            this.addFlowSegmentOpen = true;
            this._chosenFlowTypeIndex = indexOfFlow;
        }

        public closeAddFlowSegment() {
            this.addFlowSegmentOpen = false;
            this._chosenFlowTypeIndex = null;
            /// reset the options
            this.TravelTimeFlowTypes = this._defaultFlowTypes.slice();
        }

        public addFlowSegment() {
            let questionSet = this.TravelTimeFlowTypes[this._chosenFlowTypeIndex].questions;
            let newSegment = [];
            for(let question of questionSet) {
                newSegment.push(JSON.parse(JSON.stringify(question)));
                question.value = null;
            }

            this.TravelTimeFlowSegments[this.TravelTimeFlowTypes[this._chosenFlowTypeIndex].id].push(newSegment);
            this._chosenFlowTypeIndex = null;
            this.addFlowSegmentOpen = false;
        }

        public removeFlowSegment(flowTypeID, indexOfRemoval : number) {
            let flowType = this.TravelTimeFlowSegments[flowTypeID];
            if(!flowType) {
                console.error("Unable to remove flow segment: improper flow type ID. This is a bug!");
                return;
            }
            // remove the element from the array
            flowType.splice(indexOfRemoval, 1);
        }

        /**
         * 
         * @returns 1 if missing fields, 2 if travel time and missing fields, 3 if travel
         * time and missing fields and flow segments, 4 if travel time and missing flow segments
         */
        public calculateSyntheticParamsDisabled() {
            // travel time selected
            if(this._selectedTimeOfConcentration?.value == 1) {
                let completedAllFlowSegments = this.completedFlowSegments();
                if(!this._selectedAEPSynthetic || !this._selectedStandardCurve) {
                    // just missing fields
                    if(completedAllFlowSegments) {
                        return 2;
                    }
                    // missing fields and flow segments
                    return 3;
                }
                if(!completedAllFlowSegments) {
                    // missing just flow segments
                    return 4;
                }
            }
            // if there's missing params altogether
            if(!this._selectedAEPSynthetic || !this._selectedStandardCurve || !this._selectedTimeOfConcentration) {
                return 1;
            }
            return 0;
        }

        private completedFlowSegments() {
            if(this._selectedTimeOfConcentration?.value == 1) {
                let keys = Object.keys(this.TravelTimeFlowSegments);
                for(let segmentName of keys) {
                    if(!this.TravelTimeFlowSegments[segmentName].length) {
                        return false;
                    }
                }
            }
            return true;
        }

        public validateForm(mainForm) {
            // if on synthetic tab, check if Travel Time was checked, and make sure there's at least one flow segment
            if(mainForm.$name == "SyntheticUrbanHydrograph") {
                if(this._selectedTimeOfConcentration?.value == 1) {
                    let atLeastOneSegment = false;
                    let keys = Object.keys(this.TravelTimeFlowSegments);
                    for(let key of keys) {
                        if(this.TravelTimeFlowSegments[key].length) {
                            atLeastOneSegment = true;
                            break;
                        }
                    }
                    if(!atLeastOneSegment) {
                        this.showResults = false;
                        this.hideAlerts = false;
                        return false;
                    }
                }
            }
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
            this.drainageAreaSynthetic = null;
            this.timeOfConcentrationMin = null;
            this.peakRateFactor = null;
            this.standardCurveNumber = null;
            this.watershedRetention = null;
            this.initialAbstraction = null;
            this.lagTimeLength = null;
            this.lagTimeSlope = null;
            this._chosenFlowTypeIndex = null;
            this.mainChannelLength = null;
            this.mainChannelSlope = null;
            this.totalImperviousArea = null;
            this.SelectedAEP = null;
            this.SelectedAEPSynthetic = null;
            this.showResults = false;
            this.warningMessages = null;
        }

        public clearSyntheticResults() {
            this._selectedAEPSynthetic = null;
            this._selectedStandardCurve = null;
            this._selectedCNModification = null;
            this._selectedTimeOfConcentration = null;
            this._selectedRainfallDistribution = null;
            this.TravelTimeFlowTypes = this._defaultFlowTypes.slice();
            this.TravelTimeFlowSegments = JSON.parse(JSON.stringify(this._defaultFlowSegments));
            this.drainageAreaSynthetic = null;
            this.timeOfConcentrationMin = null;
            this.peakRateFactor = null;
            this.standardCurveNumber = null;
            this.watershedRetention = null;
            this.initialAbstraction = null;
            this.lagTimeLength = null;
            this.lagTimeSlope = null;
            this._selectedCNModification = null;
            this.showResultsSynthetic = false;
            this.stormHydrographOrdinatesAccordionOpen = false;
            this.warningMessagesSynthetic = null;
            this._selectedDHourStorm = {
                "name": "1-Hour",
                "value": 1,
                "maxTimeMinutes": 500
            }
        }

        public Close(): void {
            this.modalInstance.dismiss('cancel');
        }

        public Reset(): void {
            this.init();
        }

        private downloadCSV() {
            //ga event
            this.angulartics.eventTrack('Download', { category: 'Report', label: 'CSV' });

            var filename = 'data.csv';

            var BohmanRural1989 = () => {

            };

            var BohmanUrban1992 = () => {
                var finalVal = 'USGS SC Flood Hydrograph for Urban Watersheds using ' + this.SelectedAEP.name + ' AEP\n';
                finalVal += '\n' + "Warning Messages:," + this.warningMessages + '\n';
                finalVal += this.tableToCSV($('#BohmanUrbanParameterTable'));
                finalVal += '\n' + this.tableToCSV($('#BohmanUrbanSummaryTable'));
                finalVal += '\n\n' + this.tableToCSV($('#BohmanUrbanHydrograph'));
                return  finalVal + '\r\n';
            };

            var SyntheticUrbanHydrograph = () => {
                let warning = this.warningMessagesSynthetic ? this.warningMessagesSynthetic : "None!,"
                var finalVal = 'USGS SC Synthetic Unit Hydrograph using ' + this.SelectedAEPSynthetic.name + '\n';
                finalVal += '\n' + "Warning Messages:," + warning + '\n';
                finalVal += this.tableToCSV($('#WatershedDataTable'));
                finalVal += '\n' + this.tableToCSV($('#UnitHydrographTable'));
                finalVal += '\n\n' + this.tableToCSV($('#SyntheticUnitHydrographRunoffTable'));
                finalVal += '\n\n' + this.tableToCSV($('#SyntheticUnitHydrographCriticalDurationsTable'));
                finalVal += '\n\n' + this.tableToCSV($('#SyntheticUnitHydrographDataTable'));
                return finalVal + '\r\n';
            };

            //main file header with site information
            var csvFile = 'StreamStats Output Report\n\n' + 'State/Region ID,' + this.studyAreaService.selectedStudyArea.RegionID.toUpperCase() + '\nWorkspace ID,' + this.studyAreaService.selectedStudyArea.WorkspaceID + '\nLatitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toFixed(5) + '\nLongitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toFixed(5) + '\nTime,' + this.studyAreaService.selectedStudyArea.Date.toLocaleString() + '\n\n';

            //first write main parameter table
            if (this.SelectedTab == 1) {
                csvFile += BohmanRural1989();
            } else if (this.SelectedTab == 2) {
                csvFile += BohmanUrban1992();
            } else if (this.SelectedTab == 3) {
                csvFile += SyntheticUrbanHydrograph();
            }

            //download
            var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });

            if (navigator.msSaveBlob) { // IE 10+
                navigator.msSaveBlob(blob, filename);
            } else {
                var link = <any>document.createElement("a");
                var url = URL.createObjectURL(blob);
                if (link.download !== undefined) { // feature detection
                    // Browsers that support HTML5 download attribute
                    link.setAttribute("href", url);
                    link.setAttribute("download", filename);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                else {
                    window.open(url);
                }
            }
        }

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-        
        private init(): void { 
            this.ReportData = new SCStormRunoffReportable();           
            this.SelectedTab = SCStormRunoffType.BohmanRural1989;
            this.showResults = false;
            this.hideAlerts = false;
            this.canContinue = true;
            this.canContinueSynthetic = true;
            this._chosenFlowTypeIndex = null;
            this.stormHydrographOrdinatesAccordionOpen = false;
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
            var $headers = $table.find('tr:has(th)')
                , $rows = $table.find('tr:has(td)')

                // Temporary delimiter characters unlikely to be typed by keyboard
                // This is to avoid accidentally splitting the actual contents
                , tmpColDelim = String.fromCharCode(11) // vertical tab character
                , tmpRowDelim = String.fromCharCode(0) // null character

                // actual delimiter characters for CSV format
                , colDelim = '","'
                , rowDelim = '"\r\n"';

            // Grab text from table into CSV formatted string
            var csv = '"';
            csv += formatRows($headers.map(grabRow));
            csv += rowDelim;
            csv += formatRows($rows.map(grabRow)) + '"';
            return csv

            //------------------------------------------------------------
            // Helper Functions 
            //------------------------------------------------------------
            // Format the output so it has the appropriate delimiters
            function formatRows(rows) {
                return rows.get().join(tmpRowDelim)
                    .split(tmpRowDelim).join(rowDelim)
                    .split(tmpColDelim).join(colDelim);
            }

            // Grab and format a row from the table
            function grabRow(i, row) {

                var $row = $(row);
                //for some reason $cols = $row.find('td') || $row.find('th') won't work...
                var $cols = $row.find('td');
                if (!$cols.length) $cols = $row.find('th');

                return $cols.map(grabCol)
                    .get().join(tmpColDelim);
            }

            // Grab and format a column from the table 
            function grabCol(j, col) {
                var $col = $(col),
                    $text = $col.text();

                return $text.replace('"', '""'); // escape double quotes

            }
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