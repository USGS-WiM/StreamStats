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
    'use strict';
    interface IWateruseControllerScope extends ng.IScope {
        vm: IWateruseController;
    }

    interface IModal {
        Close():void
    }
    interface IReportable {
        Graph: any;
        Table: any;
    }
    interface IWaterUseReportable {
        Annual: IReportable;
        Monthly: IReportable;
    }
    
    class WaterUseReportable implements IWaterUseReportable{
        public Annual: IReportable;
        public Monthly: IReportable;
        public constructor() {
            this.Annual = { Graph: {}, Table: {}};
            this.Monthly = { Graph: { withdrawals: null, returns: null}, Table: {} };
        }

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
        public spanYear: boolean;
        private _startYear: number; 
        public get StartYear(): number {
            return this._startYear;
        } 
        public set StartYear(val: number) {
            if (!this.spanYear) this.EndYear = val;
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
        public MonthlyReportOptions: any;
        public MonthlyReturnReportOptions: any;
        public AnnualReportOptions: any;
        public result: any;
        public SelectedTab: WaterUseTabType;
        public SelectedWaterUseType: WaterUseType; 
        public ReportData: IWaterUseReportable;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance', '$timeout'];
        constructor($scope: IWateruseControllerScope, $http: ng.IHttpService, studyAreaService: StreamStats.Services.IStudyAreaService, modal:ng.ui.bootstrap.IModalServiceInstance, public $timeout:ng.ITimeoutService) {
            super($http, configuration.baseurls.StreamStatsServices);
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
            var url = configuration.queryparams['Wateruse'].format(this.StudyArea.RegionID, this.StudyArea.WorkspaceID, this.StartYear, this.EndYear);
            //var url = "wateruse.js";
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url);

            this.Execute(request).then(
                (response: any) => {  
                    this.showResults = true;                 
                    //sm when complete
                    this.result = response.data;
                    if (this.result.Messages === 'Wateruse not available at specified site.') alert(this.result.Messages);
                    this.GetGraphData(WaterUseType.Monthly);
                    this.GetGraphData(WaterUseType.Annual);

                    this.ReportData.Monthly.Table = this.GetTableData(WaterUseType.Monthly);                    
                    this.ReportData.Annual.Table = this.GetTableData(WaterUseType.Annual);

                    
                }, (error) => {
                    //sm when error                    
                }).finally(() => {  
                   this.CanContiue = true;        
                });
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
        
        private GetGraphData(useType: WaterUseType): void {
            
            switch (useType) {               
                case WaterUseType.Monthly:
                    this.ReportData.Monthly.Graph.withdrawals = [];
                    if (this.result.hasOwnProperty("DailyMonthlyAveWithdrawalsByCode")) {
                    this.ReportData.Monthly.Graph.withdrawals = this.result.DailyMonthlyAveWithdrawalsByCode.map((elem) => {
                        return {
                                "key": this.getWUText(elem[0].name.slice(-2)),
                            "values": elem.map(function (values) {

                                return {
                                    "label": values.name.substring(6, 9),
                                    "stack": values.type,
                                    "value": values.value
                                }

                            })
                        };
                    });
                    }//end if


                    this.ReportData.Monthly.Graph.returns = [];
                    var values = [];
                    if (this.result.hasOwnProperty("MonthlyWaterUseCoeff")) {
                        (<Array<any>>this.result.MonthlyWaterUseCoeff).forEach((item) => {
                            if (item.name === "Total Returns" && item.unit === "MGD") {
                                values.push({ "label": item.type, "stack": item.name, "value": item.value });
                            }
                        });//next
                    }//end if
                    else if (this.result.hasOwnProperty("DailyMonthlyAveDischarges")){
                        values = this.result.DailyMonthlyAveDischarges.map((elem) => {
                            return {
                                "label": elem.name.substring(6, 9),
                                "stack": elem.type,
                                "value": elem.value
                            };
                        });
                    }//end if

                        this.ReportData.Monthly.Graph.returns.push({
                            "key": "Returns",
                            "values": values,
                            "color": "#ff7f0e"
                        });
                        
                    break;
                case WaterUseType.Annual:
                    this.ReportData.Annual.Graph = [];
                    if (this.result.hasOwnProperty("AveGWWithdrawals"))
                        this.ReportData.Annual.Graph.push({ name: "Groundwater withdrawal", value: this.result.AveGWWithdrawals.value });
                    else if (this.result.hasOwnProperty("DailyAnnualAveGWWithdrawal"))
                        this.ReportData.Annual.Graph.push({ name: "Groundwater withdrawal", value: this.result.DailyAnnualAveGWWithdrawal.value });

                    if (this.result.hasOwnProperty("AveSWWithdrawals"))
                        this.ReportData.Annual.Graph.push({ name: "Surface water withdrawal", value: this.result.AveSWWithdrawals.value });
                    else if (this.result.hasOwnProperty("DailyAnnualAveSWWithdrawal"))
                        this.ReportData.Annual.Graph.push({ name: "Surface water withdrawal", value: this.result.DailyAnnualAveSWWithdrawal.value });

                   break;

            }//end switch
            
        }
        private GetTableData(useType: WaterUseType): any {
            var tableFields: Array<string> = [];
            var tableValues: Array<any> = [];
            switch (useType) {
                case WaterUseType.Monthly:           
                    //init table
                    for (var i = 0; i < 12; i++) {
                        tableValues.push({ "month": this.getMonth(i), "returns": {}, "withdrawals": [] });
                    }

                    if (this.result.hasOwnProperty("MonthlyWaterUseCoeff")) {
                        var index = 0;
                        (<Array<any>>this.result.MonthlyWaterUseCoeff).forEach((item) => {
                            if (item.name === "Total Returns" && item.unit === "MGD") {
                                tableValues[index].returns = item;
                                index++;
                            }
                        });//next
                    }
                    else if (this.result.hasOwnProperty("DailyMonthlyAveDischarges")){
                        var index = 0;
                        (<Array<any>>this.result.DailyMonthlyAveDischarges).forEach((item) => {
                            if (item.type === "Discharge" && item.unit === "MGD") {
                                tableValues[index].returns = item;
                                index++;
                            }
                        });//next

                    }//end if

                    if (this.result.hasOwnProperty("DailyMonthlyAveWithdrawalsByCode")) {

                        this.result.DailyMonthlyAveWithdrawalsByCode.forEach((item) => {
                            tableFields.push(this.getWUText(item[0].name.slice(-2)));
                            tableValues[0].withdrawals.push(item[0]);
                            tableValues[1].withdrawals.push(item[1]);
                            tableValues[2].withdrawals.push(item[2]);
                            tableValues[3].withdrawals.push(item[3]);
                            tableValues[4].withdrawals.push(item[4]);
                            tableValues[5].withdrawals.push(item[5]);
                            tableValues[6].withdrawals.push(item[6]);
                            tableValues[7].withdrawals.push(item[7]);
                            tableValues[8].withdrawals.push(item[8]);
                            tableValues[9].withdrawals.push(item[9]);
                            tableValues[10].withdrawals.push(item[10]);
                            tableValues[11].withdrawals.push(item[11]);
                        });//next item  
                    }
                    break;


                case WaterUseType.Annual:
                    tableFields =["","Average Return", "Average Withdrawal"];
                    if (this.result.hasOwnProperty("AveSWWithdrawals"))
                        tableValues.push({ name: "Surface Water", aveReturn: "---", aveWithdrawal: this.result.AveSWWithdrawals.value.toFixed(3), unit: "MGD" });
                    else if (this.result.hasOwnProperty("DailyAnnualAveSWWithdrawal"))
                        tableValues.push({ name: "Surface Water", aveReturn: "---", aveWithdrawal: this.result.DailyAnnualAveSWWithdrawal.value.toFixed(3), unit: "MGD" });

                    if (this.result.hasOwnProperty("AveGWWithdrawals"))
                        tableValues.push({ name: "Groundwater", aveReturn: "---", aveWithdrawal: this.result.AveGWWithdrawals.value.toFixed(3), unit: "MGD" });
                    else if (this.result.hasOwnProperty("DailyAnnualAveSWWithdrawal"))
                        tableValues.push({ name: "Groundwater", aveReturn: "---", aveWithdrawal: this.result.DailyAnnualAveGWWithdrawal.value.toFixed(3), unit: "MGD" });

                    if (this.result.hasOwnProperty("AveReturns"))
                        tableValues.push({ name: "Total", aveReturn: this.result.AveReturns.value.toFixed(3), aveWithdrawal: (this.result.AveSWWithdrawals.value + this.result.AveGWWithdrawals.value).toFixed(3), unit: "MGD" });
                    else if (this.result.hasOwnProperty("DailyAnnualAveDischarge"))
                        tableValues.push({ name: "Total", aveReturn: this.result.DailyAnnualAveDischarge.value.toFixed(3), aveWithdrawal: (this.result.DailyAnnualAveGWWithdrawal.value + this.result.DailyAnnualAveSWWithdrawal.value).toFixed(3), unit: "MGD" });


                    tableValues.push({ name: "", aveReturn: "", aveWithdrawal: "" });
                    if (this.result.hasOwnProperty("TotalTempStats")) {
                        tableValues.push({ name: "Temporary water use registrations (surface water)", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[2].value.toFixed(3), unit: "MGD" });
                        tableValues.push({ name: "Temporary water use registrations (groundwater)", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[1].value.toFixed(3), unit: "MGD" });
                        tableValues.push({ name: "Temporary water use registrations (total)", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[0].value.toFixed(3), unit: "MGD" });
                        tableValues.push({ name: "", aveReturn: "", aveWithdrawal: "" });
                        tableValues.push({ name: "Water use index (dimensionless) without temporary registrations:", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[4].value.toFixed(3), unit: "Dimensionless" });
                        tableValues.push({ name: "Water use index (dimensionless) with temporary registrations:", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[3].value.toFixed(3), unit: "Dimensionless" });
                    }//end if

                    break;
            }//end switch

            return {
                "values": tableValues,
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
            //http://ssdev.cr.usgs.gov/streamstatsservices/wateruse.json?rcode=OH
            var url = configuration.queryparams['WateruseConfig'].format(this.StudyArea.RegionID);
            //var url = "wateruse.js";
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url);
            this.Execute(request).then(
                (response: any) => {
                    var result = response.data;
                    this.spanYear = result.yearspan;
                    this._startYear = result.syear;
                    this._endYear = (this.spanYear)? result.eyear:result.syear;
                    this._yearRange = { floor: result.syear, draggableRange: true, noSwitching: true, showTicks: false, ceil: result.eyear };



                }, (error) => {;
            this._startYear = 2005;
            this._endYear = 2012;
            this._yearRange = { floor: 2005, draggableRange: true, noSwitching: true, showTicks: false, ceil: 2012 };
                    //sm when error                    
                }).finally(() => {
                    this.CanContiue = true;
            this.showResults = false;
            this.SelectedTab = WaterUseTabType.Graph;
            this.SelectedWaterUseType = WaterUseType.Annual;
            this.ReportData = new WaterUseReportable();
            this.MonthlyReportOptions = {
                chart: {
                    type: 'multiBarHorizontalChart',
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
                                this.loadGraphLabels(0);
                            }, 500);
                        },
                        renderEnd: () => {
                            //console.log("renderend");
                            //must wrap in timer or method executes prematurely
                            this.$timeout(() => {
                                this.loadGraphLabels(0);
                            }, 500);
                        }
                    },
                    showValues: true,
                    valueFormat: function (d) {
                        return d3.format(',.4f')(d);
                    },
                    tooltip: {
                        valueFormatter: function (d) { return d3.format(',.4f')(d) + " million gal/day"; }
                    },
                    
                    xAxis: {
                        showMaxMin: false
                    },
                    yAxis: {
                        axisLabel: 'Values in million gallons/day',
                        tickFormat: function (d) {
                            return d3.format(',.3f')(d);
                        }
                },
                            refreshDataOnly: true
                }
            };
            this.MonthlyReturnReportOptions = {
                chart: {
                    type: 'multiBarHorizontalChart',
                    height: 450,
                    visible: true,
                    stacked: false,
                    showControls: false,
                    margin: {
                        top: 20,
                        right: 30,
                        bottom: 60,
                        left: 55
                    },
                    x: function (d) { return d.label; },
                    y: function (d) { return d.value; },
                    showValues: true,
                    valueFormat: function (d) {
                        return d3.format(',.3f')(d);
                    },
                    tooltip: {
                        valueFormatter: function (d) {
                            return d3.format(',.4f')(d) +" million gal/day"; }
                    },

                    xAxis: {
                        showMaxMin: false
                    },
                    yAxis: {
                        axisLabel: 'Values in million gallons/day',
                        tickFormat: function (d) {
                            return d3.format(',.3f')(d);
                        }
                    }


                }

            };
            this.AnnualReportOptions = {               
                chart: {
                    type: 'pieChart',
                    height: 500,
                    x: (d) => { return d.name; },
                    y: (d) => { return d.value; },
                    showLabels: true,
                    tooltip: {
                        valueFormatter: function (d) { return d3.format(',.4f')(d) + " million gal/day"; }
                    },
                    duration: 500,
                    labelThreshold: 0.01,
                    labelSunbeamLayout: false,
                    legend: {
                        margin: {
                            top: 5,
                            right: 35,
                            bottom: 5,
                            left: 0
                        }
                    }
                }
            };
               
                });

            
            
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
        private getWUText(wtype: string): string {
            switch (wtype.toUpperCase()) {
                case "AQ": return "Aquaculture";
                case "CO": return "Commercial";
                case "DO": return "Domestic";
                case "PH": return "Hydro Electric";
                case "IN": return "Industrial";
                case "IR": return "Irrigation";
                case "LV": return "Livestock";
                case "MI": return "Mining";
                case "RM": return "Remediation";
                case "TE": return "Thermoelectric";
                case "ST": return "Waste Water Treatment";
                case "WS": return "Public Supply";
                case "MF": return "Hydrofracturing"
                case "CW": return "Wetland augmentation";
                case "PC": return "Thermoelectric (closed cycle)";
                case "PO": return "Thermoelectric (once through)";
            
            }//End Switch

            return wtype.toUpperCase();
        }  
        private loadGraphLabels(id): void {
            var svg = d3.selectAll("g.nv-multibarHorizontal");
            var lastBarID = svg.selectAll("g.nv-group").map((items: Array<any>) => { return items.length; });
            var lastBars = svg.selectAll("g.nv-group").filter(
                function (d, i) {
                    return i == lastBarID[id] - 1;
                }).selectAll("g.positive");

            var groupLabels = svg.select("g.nv-barsWrap")
            lastBars.each(
                function (d, index) {
                    var text = d3.select(this).selectAll("text");
                    text.text(d3.format(',.3f')(d.y1.toFixed(3)));
                    text.attr("dy", "1.32em");                
                });
            
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