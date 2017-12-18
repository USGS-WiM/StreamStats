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
        PeakQ: any;
        Infiltration: any;
        ExcessPrecip: any;
    }

    interface IStormRunoffReportable {
        TR55: IReportable;
        RationalMethod: IReportable;
    }

    class StormRunoffReportable implements IStormRunoffReportable {
        public TR55: IReportable;
        public RationalMethod: IReportable;
        public constructor() {
            this.TR55 = { Graph: {}, Table: {}, PeakQ: {}, Infiltration: {}, ExcessPrecip: {} };
            this.RationalMethod = { Graph: {}, Table: {}, PeakQ: {}, Infiltration: {}, ExcessPrecip: {} };
        }
    }

    interface IStormRunoffController extends IModal {
    }

    class StormRunoffController extends WiM.Services.HTTPServiceBase implements IStormRunoffController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public StudyArea: StreamStats.Models.IStudyArea;
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
            this.StudyArea = studyAreaService.selectedStudyArea;
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
                var url = configuration.queryparams['StormRunoffTR55B'].format(this.SelectedParameterList[0].value, this.SelectedParameterList[1].value, this.SelectedParameterList[2].value, this.SelectedParameterList[3]);
            }
            else if (this.SelectedTab == 2) {
                let equation = StormRunoffType.RationalMethod;
                var url = configuration.queryparams['StormRunoffRationalMethod'].format(this.SelectedParameterList[0].value, this.SelectedParameterList[1].value, this.SelectedParameterList[2].value, this.SelectedParameterList[3]);
            }
            
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, false, WiM.Services.Helpers.methodType.POST, "json", angular.toJson(this.StudyArea.Features[1].feature.features[0].geometry));

            this.Execute(request).then(
                (response: any) => {
                    this.showResults = true;
                    //sm when complete
                    this.result = response.data; 
                    if (this.SelectedTab == 1) {
                        this.ReportData.TR55.Graph = this.loadGraphData();
                        this.ReportData.TR55.Table = this.GetTableData();
                        this.ReportData.TR55.PeakQ = this.getPeakQ();
                    }
                    else if (this.SelectedTab == 2) {
                        this.ReportData.RationalMethod.PeakQ = this.getPeakQ();
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

        public RadioButtonCtrl($scope) {
            $scope.poptions = [{
                "pfreq": "I6H2Y",
                "name": "6 Hour 2 Year Precipitation"
            }, {
                "pfreq": "I6H100Y",
                "name": "6 Hour 100 Year Precipitation"
            }, {
                "pfreq": "I24H2Y",
                "name": "24 Hour 2 Year Precipitation"
            }, {
                "pfreq": "I24H100Y",
                "name": "24 Hour 100 Year Precipitation"
            }];
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

        private loadGraphData() {
            try {
                var results = [];
                
                for (var i = 0; i <= 100; i++) {
                    if (this.result[i] != "undefined") {
                        var dur = this.result[i].duration;
                        var time = new Date(null);
                        time = this.computeTime(this.result[i], dur);
                        results.push({ "x": time, "y": this.result[i].Q });
                    }
                }
                return results;
            } catch(e) {
                var x = e;
            }
        }

        private GetTableData(): any {
            var tableFields: any = [];
            tableFields.push("time");
            tableFields.push(Object.keys(this.result));
            var tableValues: Array<any> = [];
            try {
                for (var i = 0; i <= 100; i++) {
                    if (this.result[i] != "undefined") {
                        var dur = this.result[i].duration;
                        var time = new Date(null);
                        time = this.computeTime(this.result[i], dur);
                        tableValues.push({ time })
                        var tempArray: any = [];
                        for (var k in this.result[i]) {
                            if (this.result[i].hasOwnProperty(k)) {
                                tempArray.push(this.result[i][k]);
                            }
                        }
                        tempArray.unshift(time);
                        tableValues.push({ tempArray });           
                    }
                }

            } catch(e) {
                var x = e;
            } 
        }

        private getPeakQ(): any {
            try {
                var Q = 0;

                for (var i = 0; i <= 100; i++) {
                    if (this.result[i] != "undefined") {
                        if (this.result[i].Q > Q) {
                            Q = this.result[i].Q;
                        }
                    }
                }
                return Q;

            } catch (e) {
                var x = e;
            } 
        }
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        
        private init(): void {            
            this.SelectedTab = StormRunoffType.TR55;
            this.showResults = false;
            this.CanContinue = true;
            this.ReportData = new StormRunoffReportable();
            this.ReportOptions = {
                chart: {
                    type: 'lineChart',
                    height: 450,
                    visible: true,
                    stacked: true,
                    showControls: false,
                    margin: {
                        top: 20,
                        right: 30,
                        bottom: 60,
                        left: 55
                    },
                    x: function (d) { return d.label; },
                    y: function (d) { return d.value; },
                    dispatch: {
                        stateChange: () => {
                            //console.log("StateChange");
                            //must wrap in timer or method executes prematurely
                            this.$timeout(() => {
                                //this.loadGraphLabels(0);
                            }, 500);
                        },
                        renderEnd: () => {
                            //console.log("renderend");
                            //must wrap in timer or method executes prematurely
                            this.$timeout(() => {
                                //this.loadGraphLabels(0);
                            }, 500);
                        }
                    },
                    showValues: true,
                    valueFormat: function (d) {
                        return d3.format(',.4f')(d);
                    },
                    tooltip: {
                        valueFormatter: function (d) { return d3.format(',.4f')(d) + " cubic feet/second"; }
                    },

                    xAxis: {
                        showMaxMin: false
                    },
                    yAxis: {
                        axisLabel: 'Time interval',
                        tickFormat: function (d) {
                            return d3.format(',.3f')(d);
                        }
                    },
                    refreshDataOnly: true
                }
            };

            //for testing
            //this.CalculateParameters();
        }
        private loadParameters(): void{
            //unsubscribe first
            this.EventManager.UnSubscribeToEvent(Services.onSelectedStudyParametersLoaded, this.parameterloadedEventHandler);
            alert("Parameters loaded");
        }
        private selectRunoffType() {
            switch (this._selectedTab) {
                case StormRunoffType.TR55:
                    this.PrecipOptions = this.regionParameters.filter(f => { return ["I6H2Y", "I6H100Y", "I24H2Y", "I24H100Y"].indexOf(f.code) != -1 })
                    this.SelectedParameterList = this.regionParameters.filter(f => { return ["DRNAREA", "I6H2Y", "RCN", "RUNCO_CO"].indexOf(f.code) != -1 })
                    this.SelectedPrecip = this.PrecipOptions[0];
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
        private computeTime(time, dur): Date {
            time.setMinutes(time * 0.01 * dur * 60); // specify value for MINUTES here
            time.toISOString().substr(11, 8).replace(/^[0:]+/, "");

            return time;
        }
    }//end wimLayerControlController class    
    enum StormRunoffType {
        TR55 = 1,
        RationalMethod = 2
    }

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.StormRunoffController', StormRunoffController);

}//end module 