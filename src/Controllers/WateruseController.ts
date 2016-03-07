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
declare var Highcharts: any;
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
        public highchartConfig: any;
        public result: any;
        public SelectedTab: WaterUseTabType;
        public SelectedWaterUseType: WaterUseType; 
        public GraphData: Array<any>;
        public TableData: Array<any>;

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
            //var url = configuration.queryparams['Wateruse'].format(this.StudyArea.RegionID, this.StudyArea.WorkspaceID, this.StartYear, this.EndYear);
            var url = "wateruse.js";
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url,true);

            this.Execute(request).then(
                (response: any) => {                   
                    //sm when complete
                    this.result = response.data;
                    this.GraphData = this.GetGraphData();
                    this.TableData = this.GetTableData();
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
        
        public GetGraphData(): Array<any> {
            if (!this.result.hasOwnProperty("DailyMonthlyAveWithdrawalsByCode")) return;
            var results: Array<any> = this.result.DailyMonthlyAveWithdrawalsByCode.map((elem) => {
                return {
                    "key": elem[0].name.slice(-2),
                    "values": elem.map(function (values) {

                        return {
                            "label": values.name.substring(6, 9),
                            "stack":values.type,
                            "value": values.value
                        }

                    })
                };
            });

            return results;
        }
        public GetTableData(): any {
            var tableFields: Array<string> = [];
            tableFields.push("Month");

            var monthlyValues: Array<Array<any>> = [];
            for (var i = 0; i < 12; i++) {
                monthlyValues[i] = [this.getMonth(i)];
            }


            if (this.result.hasOwnProperty("MonthlyWaterUseCoeff")) {
                var avereturn = this.result.AveReturns.value;
                var monthlyReturns: Array<any> = [];
                tableFields.push("Returns");
                var index = 0;
                (<Array<any>>this.result.MonthlyWaterUseCoeff).forEach((item) => {
                    if (item.name === "Total Returns" && item.unit === "MGD") {
                        monthlyValues[index].push(item);
                        index++;
                    }
                });//next

            }//end if

            if (this.result.hasOwnProperty("DailyMonthlyAveWithdrawalsByCode")) {
                tableFields.push("Total");
                this.result.DailyMonthlyAveWithdrawalsByCode.forEach((item) => {
                    tableFields.push(item[0].name.slice(-2))
                    monthlyValues[0].push(item[0]);
                    monthlyValues[1].push(item[1]);
                    monthlyValues[2].push(item[2]);
                    monthlyValues[3].push(item[3]);
                    monthlyValues[4].push(item[4]);
                    monthlyValues[5].push(item[5]);
                    monthlyValues[6].push(item[6]);
                    monthlyValues[7].push(item[7]);
                    monthlyValues[8].push(item[8]);
                    monthlyValues[9].push(item[9]);
                    monthlyValues[10].push(item[10]);
                    monthlyValues[11].push(item[11]);
                });//next item  
            }
            return {
                "values": monthlyValues,
                "Fields":tableFields
            };
        
        }
        public Reduce(array: Array<any>) {
            return array.reduce((a, b) =>
                Number(a) + Number(b.value)
                , 0);
        }
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            this._startYear = 2005;
            this._endYear = 2012;
            this._yearRange = { floor: 2005, draggableRange: true, noSwitching: true, showTicks: false, ceil: 2012 };
            this.CanContiue = true;
            this.showResults = false;
            this.SelectedTab = WaterUseTabType.Graph;
            this.SelectedWaterUseType = WaterUseType.Annual;
            //http://stackoverflow.com/questions/31740108/angular-nvd3-multibar-chart-with-dual-y-axis-to-showup-only-line-using-json-data
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
                    x: function (d) { return d.label; },
                    y: function (d) { return d.value; },
                    showValues: false,
                    valueFormat: function (d) {
                        return d3.format(',.4f')(d);
                    },
                    
                    xAxis: {
                        showMaxMin: false
                    },
                    yAxis: {
                        axisLabel: 'Values',
                        tickFormat: function (d) {
                            return d3.format(',.3f')(d);
                        }
                    }
                    

                },title: {
                        enable: true,
                        text: "Average Water Use By Month",
                        
                    }
            };
          
        }
        private getMonth(index: number): string {
            switch (index) {
                case 0: return "Jan";
                case 1: return "Feb";
                case 2: return "Mar";
                case 3: return "Apr";
                case 4: return "May";
                case 5: return "Jun";
                case 6: return "Jul";
                case 7: return "Aug";
                case 8: return "Sep";
                case 9: return "Oct";
                case 10: return "Nov";
                case 11: return "Dec";
            }

        }        
    }//end wimLayerControlController class
    enum WaterUseType {
        Annual = 1,
        Monthly =2
    }
    enum WaterUseTabType {
        Graph = 1,
        Table = 2
    }

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.WateruseController', WateruseController);
}//end module 