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
    interface IStormRunoffControllerScope extends ng.IScope {
        vm: IStormRunoffController;
    }

    interface IModal {
        Close():void
    }

    interface IReportable {
        Graph: any;
        Table: any;
    }

    interface IStormRunoffReportable {
        TimeSeries: IReportable;
    }

    class StormRunoffReportable implements IStormRunoffReportable {
        public TimeSeries: IReportable;
        public constructor() {
            this.TimeSeries = { Graph: {}, Table: {} };
        }

    }

    interface IStormRunoffController extends IModal {
    }

    class StormRunoffController extends WiM.Services.HTTPServiceBase implements IStormRunoffController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        public showResults: boolean;
        private parameterloadedEventHandler: WiM.Event.EventHandler<Services.StudyAreaEventArgs>;
        private regionParameters: Array<Services.IParameter> = [];

        private studyAreaService: Services.IStudyAreaService;

        public PrecipOptions: Array<Services.IParameter> = [];
        public SelectedPrecip: Services.IParameter;
        public SelectedParameterList: Array<Services.IParameter> = [];
        
        public CanContinue: boolean;
        private parametersLoaded: boolean;
        public ReportOptions: any;
        public result: any;

        private _selectedTab: StormRunoffType; 
        public get SelectedTab(): StormRunoffType {
            return this._selectedTab;
        }
        public set SelectedTab(val: StormRunoffType) {
            if (this._selectedTab != val) {
                this._selectedTab = val;
                this.selectRunoffType();
            }//end if           
        }
        public ReportData: IStormRunoffReportable;

      //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.RegionService', '$modalInstance', '$timeout', 'WiM.Event.EventManager'];
        constructor($scope: IStormRunoffControllerScope, $http: ng.IHttpService, studyAreaService: StreamStats.Services.IStudyAreaService, region: StreamStats.Services.IRegionService, modal: ng.ui.bootstrap.IModalServiceInstance, public $timeout: ng.ITimeoutService, private EventManager: WiM.Event.IEventManager) {
            super($http, configuration.baseurls.StormRunoffServices);
            $scope.vm = this;
            this.modalInstance = modal;
            this.studyAreaService = studyAreaService;
            this.regionParameters = region.parameterList; 

            this.parameterloadedEventHandler = new WiM.Event.EventHandler<Services.StudyAreaEventArgs>((sender: any, e: Services.StudyAreaEventArgs) => {
                if (e.parameterLoaded) this.loadParameters()
            })
        
            this.init();              
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public GetStormRunoffResults() {
            this.CanContinue = false;
            var equation = "";

            var headers = {
                "Content-Type": "application/json"
            };
            if (this.SelectedTab == 1) {
                let equation = StormRunoffType.TR55;
                //var url = configuration.queryparams['StormRunoffTR55B'].format(this.selectedSRParameterList[0], this.selectedSRParameterList[1], this.selectedSRParameterList[2], this.selectedSRParameterList[3]);
            }
            else if (this.SelectedTab == 2) {
                let equation = StormRunoffType.RationalMethod;
                //var url = configuration.queryparams['StormRunoffRationalMethod'].format(this.selectedSRParameterList[0], this.selectedSRParameterList[1], this.selectedSRParameterList[2], this.selectedSRParameterList[3]);
            }
            
            var request: WiM.Services.Helpers.RequestInfo = null; //new WiM.Services.Helpers.RequestInfo(url, false, WiM.Services.Helpers.methodType.POST, "json", angular.toJson(this.StudyArea.Features[1].feature.features[0].geometry));

            this.Execute(request).then(
                (response: any) => {
                    this.showResults = true;
                    //sm when complete
                    this.result = response.data; 
                    if (this.SelectedTab == 1) {
                        //this.ReportData.TimeSeries.Graph = this.loadGraphData(StormRunoffType.TR55);
                        //this.ReportData.TimeSeries.Table = this.GetTableData(StormRunoffType.TR55);
                    }
                    else if (this.SelectedTab == 2) {
                        //this.ReportData.TimeSeries.Table = this.GetTableData(StormRunoffType.RationalMethod);
                    }

                }, (error) => {
                    var x = error;
                    //sm when error                    
                }).finally(() => {
                    this.CanContinue = true;
                });
        }
        public CalculateParameters()
        {
            try {
                this.EventManager.SubscribeToEvent(Services.onSelectedStudyParametersLoaded, this.parameterloadedEventHandler);
            //add to studyareaservice if not already there
                for (var i = 0; i < this.SelectedParameterList.length; i++) {
                    let param = this.SelectedParameterList[i];
                    if (this.checkArrayForObj(this.studyAreaService.studyAreaParameterList, param) == -1){
                        this.studyAreaService.studyAreaParameterList.push(param);
                    }//end if
                }//next i

                if (this.SelectedPrecip != null && this.checkArrayForObj(this.studyAreaService.studyAreaParameterList, this.SelectedPrecip) == -1)
                    this.studyAreaService.studyAreaParameterList.push(this.SelectedPrecip);

                this.studyAreaService.loadParameters();
            } catch (e) {
                console.log("oops CalculateParams failed to load ",e)
            }
        }
        
        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }
        public Reset(): void {
            this.init();
        }
        public Print(): void {
            window.print();
        }
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        
        private init(): void {            
            this.SelectedTab = StormRunoffType.TR55;
            this.SelectedPrecip = this.PrecipOptions[0];

            //for testing
            this.CalculateParameters();
        }
        private loadParameters(): void{
            //unsubscribe first
            this.EventManager.UnSubscribeToEvent(Services.onSelectedStudyParametersLoaded, this.parameterloadedEventHandler);
            alert("Parameters loaded");
        }
        private selectRunoffType() {
            switch (this._selectedTab) {
                case StormRunoffType.TR55:
                    this.PrecipOptions = this.regionParameters.filter(f => { return ["I6H100Y", "I24H100Y", "I24H2Y", "I6H2Y", "PRECIP"].indexOf(f.code) != -1 })
                    this.SelectedParameterList = this.regionParameters.filter(f => { return ["RCN", "DRNAREA", "RUNCO_CO"].indexOf(f.code) != -1 })
                    break;
                default: //case StormRunoffType.RationalMethod:

                    break;
            }
        }
        private checkArrayForObj(arr, obj):number {
            for (var i = 0; i < arr.length; i++) {
                if (angular.equals(arr[i], obj)) {
                    return i;
                }
            };
            return -1;
        }
    }//end wimLayerControlController class    
    enum StormRunoffType {
        TR55 = 1,
        RationalMethod = 2
    }

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.StormRunoffController', StormRunoffController);
}//end module 