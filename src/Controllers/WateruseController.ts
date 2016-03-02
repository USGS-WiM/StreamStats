//------------------------------------------------------------------------------
//----- WaterUse ---------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2016 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:


//Comments
//02.17.2016 jkn - Created

//Import
declare var d3: any;

module StreamStats.Controllers {
    'use string';
    interface IWateruseControllerScope extends ng.IScope {
        vm: IWateruseController;
    }

    interface IModal {
        Close():void
    }
    
    interface IWateruseController extends IModal {
        StartYear: number;
        EndYear: number; 
    }

    class WateruseController extends WiM.Services.HTTPServiceBase implements IWateruseController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private StudyArea: StreamStats.Models.IStudyArea;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        public showResults: boolean;
        private _startYear: number; 
        public get StartYear(): number {
            return this._startYear;
        } 
        public set StartYear(val:number) {
            if (val <= this.EndYear && val >= this.YearRange.floor)
                this._startYear = val;
        }
           
        private _endYear: number;  
        public get EndYear(): number {
            return this._endYear;
        }
        public set EndYear(val: number) {
            if (val >= this.StartYear && val <= this.YearRange.ceil)
                this._endYear = val;
        }          
        private _yearRange: any;
        public get YearRange():any {
            return this._yearRange;
        }
        public CanContiue: boolean;
        public reportOptions: any;
        public result: Models.IWaterUse;
        public SelectedTab: Number;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance'];
        constructor($scope: IWateruseControllerScope, $http: ng.IHttpService, studyAreaService: StreamStats.Services.IStudyAreaService, modal:ng.ui.bootstrap.IModalServiceInstance) {
            super($http, 'http://ssdev.cr.usgs.gov');
            $scope.vm = this;
            this.modalInstance = modal;
            this.StudyArea = studyAreaService.selectedStudyArea;
            this.init();  
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public GetWaterUse() {
            this.CanContiue = false;
            //http://ssdev.cr.usgs.gov/streamstatsservices/wateruse.json?rcode=OH&workspaceID=OH20160217071851546000&startyear=2005&endyear=2009
            var url = configuration.queryparams['Wateruse'].format(this.StudyArea.RegionID, this.StudyArea.WorkspaceID,this.StartYear, this.EndYear);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url);

            this.Execute(request).then(
                (response: any) => {                   
                    //sm when complete
                    this.result = Models.WaterUse.FromJson(response.data);
                    this.showResults = true;
                }, (error) => {
                    //sm when error

                    
                }).finally(() => {  
                   this.CanContiue = true;        
                });
        }
        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }
     
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            this._startYear = 2005;
            this._endYear = 2012;
            this._yearRange = { floor: 2005, draggableRange: true, noSwitching: true, showTicks: false, ceil: 2012 };
            this.CanContiue = true;
            this.showResults = false;
            this.SelectedTab = 1;

            this.reportOptions = {
                chart: {
                    type: 'multiBarHorizontalChart',
                    height: 450,
                    visible: true,
                    stacked: true,
                    showControls: false,
                    margin: {
                        top: 20,
                        right: 20,
                        bottom: 60,
                        left: 55
                    },
                    x: function (d) { return d.name.substring(6, 9); },
                    y: function (d) { return d.value; },
                    showValues: true,
                    valueFormat: function (d) {
                        return d3.format(',.4f')(d);
                    },
                    transitionDuration: 500,
                    xAxis: {
                        showMaxMin: false
                    },
                    yAxis: {
                        axisLabel: 'Values',
                        tickFormat: function (d) {
                            return d3.format(',.3f')(d);
                        }
                    }
                }
            };
        }
        
    }//end wimLayerControlController class


    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.WateruseController', WateruseController);
}//end module 