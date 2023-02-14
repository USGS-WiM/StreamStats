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
        public hideAlerts: boolean;
        public toaster: any;
        private studyAreaService: Services.IStudyAreaService;
        public canContinue: boolean;
        public ReportData: ISCStormRunoffReportable;
        public drainageArea: number;
        public methodType: string;

        // BOHMAN RURAL TAB
        public GC1939 = 0;
        public GC1940 = 0;
        public GC1941 = 0;
        public GC1942 = 0;
        public GC1943 = 0;
        public showRuralResults: boolean = false;
        public isBohmanRuralOpen = false;

        // BOHMAN URBAN TAB
        public region3Percent = 0;
        public region4Percent = 0;
        public showUrbanResults: boolean = false;
        public isBohmanUrbanOpen = false;

        // SYNTHETIC TAB
        public drainageAreaSynthetic: number;
        public timeOfConcentrationMin: number;
        public peakRateFactor: number;
        public standardCurveNumber: number;
        public watershedRetention: number;
        public initialAbstraction: number;
        public lagTimeLength: number;
        public lagTimeSlope: number;
        public showResultsSynthetic: boolean = false;
        public warningMessagesSynthetic: any;
        public syntheticResponseData: any;
        public ReportOptionsSynthetic: any;
        public canContinueSynthetic: boolean;
        public stormHydrographOrdinatesAccordionOpen: boolean;
        public isSyntheticUHOpen = false;

        public mainChannelLength: number;
        public mainChannelSlope: number;
        public totalImperviousArea: number;
        public warningMessages: any;
        public parameters;
        public ReportOptions: any;
        public regressionRegions;
        public reportData;

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
        public prfForm = {
            landUse: null,
            prfValue: null,
            area: null
        }
          
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

        public prfTypes = [
            { name: "Open Space - Poor Condition (grass cover < 50%)", value: 250 },
            { name: "Open Space - Fair Condition (grass cover 50-75%)", value: 250 },
            { name: "Open Space - Good Condition (grass cover > 75%)", value: 250 },
            { name: "Impervious Areas (paved parking lots, roofs, etc.)	", value: 550 },
            { name: "Streets and Roads - Paved with curbs and storm sewers", value: 550 },
            { name: "Streets and Roads - Paved with open ditches", value: 500 },
            { name: "Streets and Roads - Gravel", value: 450 },
            { name: "Streets and Roads - Dirt", value: 350 },
            { name: "Urban Land Use - Commercial and Business", value: 550 },
            { name: "Urban Land Use - Industrial", value: 550 },
            { name: "Urban Land Use - 1/8 Acre", value: 400 },
            { name: "Urban Land Use - 1/4 Acre", value: 375 }, 
            { name: "Urban Land Use - 1/3 Acre", value: 350 },
            { name: "Urban Land Use - 1/2 Acre", value: 350 },
            { name: "Urban Land Use - 1 Acre", value: 325 },
            { name: "Urban Land Use - 2 Acre", value: 300 },
            { name: "Developing urban areas, newly graded, no grass cover", value: 400 },
            { name: "Pasture - Poor", value: 200 },
            { name: "Pasture - Fair", value: 190 },
            { name: "Pasture - Good", value: 180 },
            { name: "Woods - Poor", value: 200 },
            { name: "Woods - Fair", value: 190 },
            { name: "Woods - Good", value: 180 },
            { name: "Row Crop - Straight Row", value: 300 },
            { name: "Row Crop - Contoured", value: 275 },
            { name: "Row Crop - Contoured and Terraced", value: 250 }    
        ]

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

        public prfSegments = [];

        public addFlowSegmentOpen = false;
        private _chosenFlowType : string;
        public get chosenFlowTypeIndex() {
            return this._chosenFlowType;
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
        static $inject = ['$scope', 'toaster', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance', '$timeout', 'WiM.Event.EventManager'];
        constructor($scope: ISCStormRunoffControllerScope, toaster, $http: ng.IHttpService, studyAreaService: StreamStats.Services.IStudyAreaService, modal: ng.ui.bootstrap.IModalServiceInstance, public $timeout: ng.ITimeoutService, private EventManager: WiM.Event.IEventManager) {
            super($http, configuration.baseurls.StormRunoffServices);
            $scope.vm = this;
            $scope.greaterThanZero = this.greaterThanZero;
            $scope.greaterThanOrEqualToZero = this.greaterThanOrEqualToZero;
            $scope.betweenZeroOneHundred = this.betweenZeroOneHundred; 
            this.AppVersion = configuration.version;
            this.toaster = toaster;
            this.modalInstance = modal;
            this.StudyArea = studyAreaService.selectedStudyArea;
            this.studyAreaService = studyAreaService;
        
            this.init();  

            this.print = function () {
                if (this.SelectedTab == 3) this.isSyntheticUHOpen = true;
                if (this.SelectedTab == 2) this.isBohmanUrbanOpen = true;
                if (this.SelectedTab == 1) this.isBohmanRuralOpen = true;

                setTimeout(function() {
                    window.print();
                }, 300);
            };            
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public estimateFlows(statisticGroup) {
            if (this.methodType == 'Urban') {
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
            } else if (this.methodType == 'Rural') {
                // Bohman Rural (1989)            
                var data = [{  // Peak Flow Statistics for Bohman Rural (1989) 
                    "id": 2,
                    "name": "Peak-Flow Statistics",
                    "code": "PFS",
                    "defType": "FS",
                    "statisticGroupName": "Peak-Flow Statistics",
                    "statisticGroupID": "2", 
                    "regressionRegions" : statisticGroup[0].regressionRegions
                }];
            }
            
            var url = configuration.baseurls['NSS'] + configuration.queryparams['estimateFlows'].format('SC');
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, 1, 'json', JSON.stringify(data));
            this.Execute(request).then((response: any) => {
                    //make sure there are some results
                    if (response.data[0].regressionRegions.length > 0 && response.data[0].regressionRegions[0].results && response.data[0].regressionRegions[0].results.length > 0) {
                        var weightedAEP = 0;

                        if (this.methodType == 'Urban') {
                            response.data[0].regressionRegions.forEach(regressionregion => {
                                if (regressionregion.code == 'GC1583' || regressionregion.code == 'GC1584' || regressionregion.code == 'GC1585' || regressionregion.code == 'GC1586') {
                                    regressionregion.results.forEach(result => {
                                        if (result.name.indexOf(this.SelectedAEP.value) !== -1){
                                            weightedAEP += (result.value * (regressionregion.percentWeight / 100.0));
                                        }
                                    })
                                }
                            });
                            // set up data for request
                            var urbanData = {
                                "lat": this.studyAreaService.selectedStudyArea.Pourpoint.Latitude,
                                "lon": this.studyAreaService.selectedStudyArea.Pourpoint.Longitude,
                                "region3PercentArea": this.region3Percent,
                                "region4PercentArea": this.region4Percent,
                                "Qp": weightedAEP,
                                "A": this.drainageArea,
                                "L": this.mainChannelLength,
                                "S": this.mainChannelSlope, 
                                "TIA": this.totalImperviousArea
                            };
                            this.getUrbanStormRunoffResults(urbanData);
                        } else if (this.methodType == 'Rural') {
                            response.data[0].regressionRegions.forEach(regressionregion => {
                                if (regressionregion.citationID == 191) { //2022, Magnitude and Frequency of Floods for Rural Streams in Georgia, South Carolina, and North Carolina, 2017--Results
                                    regressionregion.results.forEach(result => {
                                        if (result.name.indexOf(this.SelectedAEP.value) !== -1){
                                            weightedAEP += (result.value * (regressionregion.percentWeight / 100.0));
                                        }
                                    })
                                }
                            });
                            // set up data for request 
                            var ruralData = {
                                "regionBlueRidgePercentArea": this.GC1943,
                                "regionPiedmontPercentArea": this.GC1942,
                                "regionUpperCoastalPlainPercentArea": this.GC1941,
                                "regionLowerCoastalPlain1PercentArea": this.GC1939,
                                "regionLowerCoastalPlain2PercentArea": this.GC1940,
                                "Qp": weightedAEP,
                                "A": this.drainageArea
                            };
                            this.getRuralStormRunoffResults(ruralData);
                        }
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


        public getUrbanStormRunoffResults(data) {
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
                    this.showUrbanResults = true;
                    if (response.headers()['x-warning']) {
                        this.warningMessages = response.headers()['x-warning'];
                    }
                },(error) => {
                    this.toaster.pop('error', "Error", error["data"]["detail"], 0);
                }).finally(() => { 
                    this.canContinue = true;   
            });

        }

        public getRuralStormRunoffResults(data) {
            var url = configuration.baseurls['SCStormRunoffServices'] + configuration.queryparams['SCStormRunoffBohman1989']
            var headers = {
                "Content-Type": "application/json",
                "X-warning": true
            };
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', JSON.stringify(data), headers);
            this.Execute(request).then((response: any) => {
                    this.reportData = response.data;
                    this.ReportData.BohmanRural1989.Graph = this.loadGraphData();
                    this.ReportData.BohmanRural1989.WeightedRunoff = this.reportData.weighted_runoff_volume;
                    this.setGraphOptions();
                    this.showRuralResults = true;
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
            if (this.methodType == 'Urban') {
                var statGroup = 31;
            } else if (this.methodType == 'Rural') {
                var statGroup = 2;
            }
            var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupParameterLookup'];
            url = url.format('SC', statGroup, regressionregions); // Urban Peak Flow Statistics for Bohman Urban (1992)
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
                    text: 'USGS SC Flood Hydrograph for ' + this.methodType + ' Watersheds using ' + this.SelectedAEP.name + ' AEP',
                    css: {
                        'font-size': '10pt',
                        'font-weight': 'bold'
                    }
                }
                
            };
        }

        public queryRegressionRegions(methodType) {
            this.methodType = methodType;
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
                        response.data.forEach(regressionRegion => {
                            if (regressionRegion.code == "GC1585") {
                                this.region3Percent = regressionRegion.percentWeight;
                            } else if (regressionRegion.code == "GC1586") {
                                this.region4Percent = regressionRegion.percentWeight;
                            } else if (regressionRegion.code == "GC1939") {
                                this.GC1939 = regressionRegion.percentWeight;
                            } else if (regressionRegion.code == "GC1940") {
                                this.GC1940 = regressionRegion.percentWeight;
                            } else if (regressionRegion.code == "GC1941") {
                                this.GC1941 = regressionRegion.percentWeight;
                            } else if (regressionRegion.code == "GC1942") {
                                this.GC1942 = regressionRegion.percentWeight;
                            } else if (regressionRegion.code == "GC1943") {
                                this.GC1943 = regressionRegion.percentWeight;
                            }
                        });  
                        this.loadParametersByStatisticsGroup(response.data.map(function (elem) {
                            return elem.code;
                        }).join(","), response.data)
                    }
                },(error) => {
                    this.toaster.pop('error', "There was an HTTP error querying Regression Regions", "Please retry", 0);
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
                                if (param.code.toLowerCase() == 'lc19imp') this.totalImperviousArea = param.value;
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

        public calculateSynthetic() {
            this.canContinueSynthetic = false;
            var headers = {
                "Content-Type": "application/json",
                "X-Is-StreamStats": true
            };
            var url = configuration.baseurls['SCStormRunoffServices'] + configuration.queryparams['SCStormRunoffSyntheticUnitComputerGraphResults'];
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
                            var studyArea = this.studyAreaService.simplify(angular.fromJson(angular.toJson(this.studyAreaService.selectedStudyArea.FeatureCollection.features.filter(f => { return (<string>(f.id)).toLowerCase() == "globalwatershed" })[0])));
                            var studyAreaGeom = studyArea.geometry; 
                            var watershedFeature = [
                                {
                                  "type": "Feature",
                                  "geometry": studyAreaGeom
                                }
                            ]
                            // master data endpoint
                            data = {
                                "lat": this.studyAreaService.selectedStudyArea.Pourpoint.Latitude,
                                "lon": this.studyAreaService.selectedStudyArea.Pourpoint.Longitude,
                                "watershedFeatures": watershedFeature,
                                "prfData": this.prfSegments,
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

        public openAddFlowSegment(chosenFlow : any) {
            this.addFlowSegmentOpen = true;
            this._chosenFlowType = chosenFlow;
        }

        public closeAddFlowSegment() {
            this.addFlowSegmentOpen = false;
            this._chosenFlowType = null;
            /// reset the options
            this.TravelTimeFlowTypes = this._defaultFlowTypes.slice();
        }

        public addFlowSegment(index) {
            if (this._chosenFlowType == 'PRF') { 
                let newSegment = {};
                newSegment = {
                    landUse: this.prfForm.landUse.name,
                    PRF: this.prfForm.prfValue,
                    Area: this.prfForm.area
                }
                this.prfSegments.push(newSegment);
                this.prfForm = { landUse: null, prfValue: null, area: null };
            } else {
                let newSegment = [];
                let questionSet = this.TravelTimeFlowTypes[index].questions;
                for(let question of questionSet) {
                    newSegment.push(JSON.parse(JSON.stringify(question)));
                    question.value = null;
                }
                this.TravelTimeFlowSegments[this.TravelTimeFlowTypes[index].id].push(newSegment);
            }

            this._chosenFlowType = null;
            this.addFlowSegmentOpen = false;
        }

        public removeFlowSegment(flowTypeID, indexOfRemoval : number) {
            var flowType = null;
            if (flowTypeID == "PRF") {
                flowType = this.prfSegments;
            } else {
                flowType = this.TravelTimeFlowSegments[flowTypeID];
            }
            if(!flowType) {
                console.error("Unable to remove flow segment: improper flow type ID. This is a bug!");
                return;
            }
            // remove the element from the array
            flowType.splice(indexOfRemoval, 1);
        }

        public setPRF(landuse) {
            this.prfForm.prfValue = landuse.value
        }

        public calculatePRF(){
            if (this.prfSegments.length == 0) {
                this.toaster.pop('error', "No PRF information was added, cannot calculate.", "", 500);
                this.peakRateFactor = 0;                 
            } else {
                var data = 
                {
                    "prfData": this.prfSegments
                };
                var url = configuration.baseurls['SCStormRunoffServices'] + configuration.queryparams['SCStormRunoffPRF']     
                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', JSON.stringify(data));
                
                this.Execute(request).then((response: any) => {     
                    this.peakRateFactor = response.data.PRF
                },(error) => {
                    //sm when error
                    this.toaster.clear();
                    this.toaster.pop("error", "There was an HTTP error calculating prf", "Please retry", 0);
                }).finally(() => {
                });  
            }
        }

        /**
         * 
         * @returns 1 if missing fields, 2 if travel time and missing fields, 3 if travel
         * time and missing fields and flow segments, 4 if travel time and missing flow segments
         */
        public calculateSyntheticParamsDisabled() {
            // travel time selected
            if(this._selectedTimeOfConcentration?.value == 1) {
                let numCompletedFlowSegments = this.completedFlowSegments();
                if(!this._selectedAEPSynthetic || !this._selectedStandardCurve) {
                    // missing fields and flow segments
                    return 2;
                }
                if (numCompletedFlowSegments < 1) {
                    // missing just flow segments
                    return 3;
                }
            }
            // if there's missing params altogether
            if (!this._selectedAEPSynthetic || !this._selectedStandardCurve || !this._selectedTimeOfConcentration || this.prfSegments.length == 0) {
                return 1;
            }
            return 0;
        }

        private completedFlowSegments() {
            var counter = 0;
            if(this._selectedTimeOfConcentration?.value == 1) {
                let keys = Object.keys(this.TravelTimeFlowSegments);
                for(let segmentName of keys) {
                    if(this.TravelTimeFlowSegments[segmentName].length) {
                        counter ++
                    }
                }
            }
            return counter;
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
                        this.showRuralResults = false;
                        this.showUrbanResults = false;
                        this.hideAlerts = false;
                        return false;
                    }
                }
            }
            if (mainForm.$valid) {
                return true;
            }
            else {
                this.showRuralResults = false;
                this.showUrbanResults = false;
                this.hideAlerts = false;
                return false;
            }
        }

        public clearResults(form) {
            if (form.$name == "BohmanUrbanForm" || form.$name == "BohmanRuralForm") {
                this.drainageArea = null;
                this.timeOfConcentrationMin = null;
                this.peakRateFactor = null;
                this.standardCurveNumber = null;
                this.watershedRetention = null;
                this.initialAbstraction = null;
                this.lagTimeLength = null;
                this.lagTimeSlope = null;
                this._chosenFlowType = null;
                this.mainChannelLength = null;
                this.mainChannelSlope = null;
                this.totalImperviousArea = null;
                this.SelectedAEP = null;
                this.SelectedAEPSynthetic = null;
                this.showUrbanResults = false;
                this.showRuralResults = false;
                this.warningMessages = null;
                this.methodType = null;
            } else if(form.$name == "SyntheticUrbanHydrograph"){
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
                this.prfSegments = []
            }
        }

        

        public Close(): void {
            this.modalInstance.dismiss('cancel');
        }

        public Reset(): void {
            this.init();
        }


        private downloadCSV() {
            if (this.SelectedTab == 3){
                this.isSyntheticUHOpen = true;
                setTimeout(() => {
                    this.formatCSV();
                }, 300);
            } else if (this.SelectedTab == 2) {
                this.isBohmanUrbanOpen = true;
                setTimeout(() => {
                    this.formatCSV();
                }, 300);
            } else if (this.SelectedTab == 1) {
                this.isBohmanRuralOpen = true;
                setTimeout(() => {
                    this.formatCSV();
                }, 300);
            }
        }

        private formatCSV() {
            var filename = 'data.csv';

            var BohmanRural1989 = () => {
                var finalVal = 'USGS SC Flood Hydrograph for Rural Watersheds using ' + this.SelectedAEP.name + ' AEP\n';
                finalVal += '\n' + 'Warning Messages:,"' + this.warningMessages + '"\n';
                finalVal += this.tableToCSV($('#BohmanRuralParameterTable'));
                finalVal += '\n' + this.tableToCSV($('#BohmanRuralSummaryTable'));
                finalVal += '\n\nTabular Hydrograph';
                finalVal += '\n' + this.tableToCSV($('#BohmanRuralHydrograph'));
                return  finalVal + '\r\n';
            };

            var BohmanUrban1992 = () => {
                var finalVal = 'USGS SC Flood Hydrograph for Urban Watersheds using ' + this.SelectedAEP.name + ' AEP\n';
                finalVal += '\n' + 'Warning Messages:,"' + this.warningMessages + '"\n';
                finalVal += this.tableToCSV($('#BohmanUrbanParameterTable'));
                finalVal += '\n' + this.tableToCSV($('#BohmanUrbanSummaryTable'));
                finalVal += '\n\nTabular Hydrograph';
                finalVal += '\n' + this.tableToCSV($('#BohmanUrbanHydrograph'));
                return  finalVal + '\r\n';
            };

            var SyntheticUrbanHydrograph = () => {
                let warning = this.warningMessagesSynthetic ? this.warningMessagesSynthetic : null
                var finalVal = 'USGS SC Synthetic Unit Hydrograph using ' + this.SelectedAEPSynthetic.name + '\n';
                if (warning) {
                    finalVal += '\n' + 'Warning Messages:,"' + warning + '"\n';
                }
                let WatershedDataTable = (this.tableToCSV($('#WatershedDataTable')).slice(3)) // Needed to splice because there are no table headers
                let UnitHydrographTable = (this.tableToCSV($('#UnitHydrographTable')).slice(3)) // Needed to splice because there are no table headers

                finalVal += '\n' + "Watershed Data" + WatershedDataTable;
                finalVal += '\n\n' + "Unit Hydrograph Data" + UnitHydrographTable;
                finalVal += '\n\n' + "Runoff Results" + '\n' + this.tableToCSV($('#SyntheticUnitHydrographRunoffTable'));
                finalVal += '\n\n' + "Critical Durations" + '\n' + this.tableToCSV($('#SyntheticUnitHydrographCriticalDurationsTable'));
                finalVal += '\n\nTabular Hydrograph';
                finalVal += '\n' + "D-Hour Storm Hydrograph Ordinates" + '\n' + this.tableToCSV($('#SyntheticUnitHydrographDataTable'));
                finalVal += '\n\n' + this.tableToCSV($('#SyntheticUnitHydrographDisclaimerReport'));
                var node = document.getElementById('SyntheticUnitHydrographDisclaimerReport');
                var string = node.textContent.replace(/\s+/g, ' ').trim();
                string = string.replace(/,/g, ' ');
                string = string.replace(/(?=\(\d\))/g, '\n');
                finalVal += '\n\n' + string;
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
            this.hideAlerts = false;
            this.canContinue = true;
            this.canContinueSynthetic = true;
            this._chosenFlowType = null;
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