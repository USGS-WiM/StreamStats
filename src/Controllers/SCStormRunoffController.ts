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
        private nssService: Services.InssService;
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
            console.log(this._selectedAEP);
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

        

        public BrowserIE: boolean;
        public BrowserChrome: boolean;
        public angulartics: any;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$analytics', 'toaster', '$http', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'StreamStats.Services.RegionService', '$modalInstance', '$timeout', 'WiM.Event.EventManager'];
        constructor($scope: ISCStormRunoffControllerScope, $analytics, toaster, $http: ng.IHttpService, studyAreaService: StreamStats.Services.IStudyAreaService, StatisticsGroup: Services.InssService, region: StreamStats.Services.IRegionService, modal: ng.ui.bootstrap.IModalServiceInstance, public $timeout: ng.ITimeoutService, private EventManager: WiM.Event.IEventManager) {
            super($http, configuration.baseurls.StormRunoffServices);
            $scope.vm = this;
            this.angulartics = $analytics;
            this.toaster = toaster;
            this.modalInstance = modal;
            this.StudyArea = studyAreaService.selectedStudyArea;
            this.nssService = StatisticsGroup;
            this.studyAreaService = studyAreaService;
        
            this.init();  

            this.print = function () {
                window.print();
            };
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public GetStormRunoffResults() {
            console.log("calc results")
        }

        public CalculateParameters() {
            try {
                this.CanContinue = false;
                
                var url: string = configuration.baseurls['ScienceBase'] + configuration.queryparams['SSURGOexCOMS'] + configuration.queryparams['SSURGOexCO'].format(this.studyAreaService.selectedStudyArea.FeatureCollection.bbox);
                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);
                
                this.Execute(request).then(
                    (response: any) => {
                        console.log(response)
                    }, (error) => {
                        var x = error;
                        //sm when error                    
                    }).finally(() => {
                        this.CanContinue = true;
                        this.hideAlerts = true;
                    }
                );

                
            } catch (e) {
                console.log("oops CalculateParams failed to load ",e)
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
            //this.PIntensity = null;
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

        private loadParameters(): void{

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