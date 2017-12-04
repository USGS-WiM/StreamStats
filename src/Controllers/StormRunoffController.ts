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
        private StudyArea: StreamStats.Models.IStudyArea;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        public showResults: boolean;

        private selectedSRParameterList: Array<StreamStats.Services.IParameter>;

        private studyAreaService: Services.IStudyAreaService;
        public PrecipOptions: Array<Services.IParameter>;
        public AvailableParameters: Array <Services.IParameter>;
        public CanContinue: boolean;
        public ReportOptions: any;
        public result: any;
        public SelectedTab: StormRunoffTabType;
        public ReportData: IStormRunoffReportable;

        private parameterList;

      //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.RegionService', '$modalInstance', '$timeout'];
        constructor($scope: IStormRunoffControllerScope, $http: ng.IHttpService, studyAreaService: StreamStats.Services.IStudyAreaService, region: StreamStats.Services.IRegionService, modal:ng.ui.bootstrap.IModalServiceInstance, public $timeout:ng.ITimeoutService) {
            super($http, configuration.baseurls.StormRunoffServices);
            $scope.vm = this;
            this.modalInstance = modal;
            this.StudyArea = studyAreaService.selectedStudyArea;
            this.AvailableParameters = region.parameterList; 
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
                var url = configuration.queryparams['StormRunoffTR55B'].format(this.selectedSRParameterList[0], this.selectedSRParameterList[1], this.selectedSRParameterList[2], this.selectedSRParameterList[3]);
            }
            else if (this.SelectedTab == 2) {
                let equation = StormRunoffType.RationalMethod;
                var url = configuration.queryparams['StormRunoffRationalMethod'].format(this.selectedSRParameterList[0], this.selectedSRParameterList[1], this.selectedSRParameterList[2], this.selectedSRParameterList[3]);
            }
            
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, false, WiM.Services.Helpers.methodType.POST, "json", angular.toJson(this.StudyArea.Features[1].feature.features[0].geometry));

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
        public CalculateStreamStatsBCs()
        {
            var pintensity = $("input:radio[name=pintensity]:checked").val();

            if (this.SelectedTab == 1) {
                this.parameterList[1] = pintensity;
                this.selectedSRParameterList = this.AvailableParameters.filter(p => { return this.parameterList.indexOf(p.code) })
                this.studyAreaService.loadParameters();
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
            
            this.parameterList = <any>["RCN", "I6H100Y", "DRNAREA", "RUNCO_CO"];
            this.selectedSRParameterList = this.AvailableParameters.filter(p => {return this.parameterList.indexOf(p.code) })

        }
        
    }//end wimLayerControlController class    
    enum StormRunoffType {
        TR55 = 1,
        RationalMethod = 2
    }
    enum StormRunoffTabType {
        TR55 = 1,
        RationalMethod = 2
    }

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.StormRunoffController', StormRunoffController);
}//end module 