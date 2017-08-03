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
            this.StudyArea = <any>{};//studyAreaService.selectedStudyArea;
            this.init();              
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public GetWaterUse() {
            this.CanContiue = false;
            //https://ssdev.cr.usgs.gov/streamstatsservices/wateruse.json?rcode=OH&workspaceID=OH20160217071851546000&startyear=2005&endyear=2009
            //var url = configuration.queryparams['Wateruse'].format(this.StudyArea.RegionID, this.StudyArea.WorkspaceID, this.StartYear, this.EndYear);
            var url = "wateruse.js";
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url,true);

            this.Execute(request).then(
                (response: any) => {  
                    this.showResults = true;                 
                    //sm when complete
                    this.result = response.data;
                    if (this.result.Messages === 'Wateruse not available at specified site.') alert(this.result.Messages);
                    this.loadGraphData(WaterUseType.Monthly);
                    this.loadGraphData(WaterUseType.Annual);

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
        
        private loadGraphData(useType: WaterUseType): void {
            try {

                    switch (useType) {               
                        case WaterUseType.Monthly:
                            this.ReportData.Monthly.Graph.withdrawals = [];
                            if (this.result.hasOwnProperty("withdrawal") && this.result.withdrawal.hasOwnProperty("monthly")) {
                                for (var month in this.result.withdrawal.monthly) {
                                    var montlyCodes = this.result.withdrawal.monthly[month]["code"];
                                    for (var code in montlyCodes) {
                                        var itemindex = this.ReportData.Monthly.Graph.withdrawals.findIndex((elem) => { return elem.key == montlyCodes[code].name });

                                        if (itemindex < 0) {
                                            itemindex = this.ReportData.Monthly.Graph.withdrawals.push(
                                                {
                                                    "key": montlyCodes[code].name,
                                                    "values": []
                                                })-1;
                                        }//end if
                                        this.ReportData.Monthly.Graph.withdrawals[itemindex].values.push({
                                            "label": this.getMonth(+month),
                                            "stack": "withdrawal",
                                            "value": montlyCodes[code].value
                                            })
                                    }//next code       
                                }//next month
                            }//end if

                            this.ReportData.Monthly.Graph.returns = [];
                            if (this.result.hasOwnProperty("return")) {
                                var values = [];
                                for (var month in this.result.return.monthly) {                                       
                                    
                                    values.push({
                                        "label": this.getMonth(+month),
                                        "stack": "withdrawal",
                                        "value": this.Sum(this.result.return.monthly[month]["month"],"value")
                                    });       
                                }//next month

                                this.ReportData.Monthly.Graph.returns.push(
                                    {
                                        "key": "returns",
                                        "color": "#ff7f0e",
                                        "values": values
                                    });

                            }//end if                               
                        
                            break;
                        case WaterUseType.Annual:
                            this.ReportData.Annual.Graph = [];
                            if (this.result.hasOwnProperty("withdrawal") && this.result.withdrawal.hasOwnProperty("annual")) {
                                for (var annkey in this.result.withdrawal.annual) {
                                    var annItem = this.result.withdrawal.annual[annkey];
                                    this.ReportData.Annual.Graph.push({ name: annItem.name, value: annItem.value });
                                }//next annItem
                            }//end if
                           break;

                    }//end switch
            } catch (e) {
                var x = e;
            }
        }
        private GetTableData(useType: WaterUseType): any {
            var tableFields: any =[];
            var tableValues: Array<any> = [];
            switch (useType) {
                case WaterUseType.Monthly:           
                    //init table
                    for (var i = 1; i <= 12; i++) {
                        tableValues.push({ "month": this.getMonth(i), "returns": { "name": "return", "value":0}, "withdrawals": [] });
                    }
                    //returns
                    if (this.result.hasOwnProperty("return") && this.result.withdrawal.hasOwnProperty("monthly")) {
                        for (var item in this.result.return.monthly) {
                            tableValues[+item - 1].returns.value = this.Sum(this.result.return.monthly[item].month, "value");
                        }//next item
                    }//end if

                    //withdrawals
                    if (this.result.hasOwnProperty("withdrawal") && this.result.withdrawal.hasOwnProperty("monthly")) {
                        for (var mkey in this.result.withdrawal.monthly) {
                            if (this.result.withdrawal.monthly[mkey].hasOwnProperty("code")) {
                                var monthlycode = this.result.withdrawal.monthly[mkey].code
                                for (var cKey in monthlycode) {
                                    var itemindex = tableFields.findIndex((elem) => { return elem == monthlycode[cKey].name });
                                    if (itemindex < 0) {
                                        itemindex = tableFields.push(monthlycode[cKey].name)-1
                                        tableValues.forEach((ele) => { ele.withdrawals.push({ "name": monthlycode[cKey].name, "value": 0 }) });                                        
                                    }//end if
                                    tableValues[+mkey - 1].withdrawals[itemindex].value = monthlycode[cKey].value;
                                }
                            }//end if
                        }//next item
                    }
                    break;


                case WaterUseType.Annual:
                    tableFields = ["", "Average Return", "Average Withdrawal"];
                    var sw = { name: "Surface Water", aveReturn: "---", aveWithdrawal: "---", unit: "MGD" };
                    var gw = { name: "Groundwater", aveReturn: "---", aveWithdrawal: "---", unit: "MGD" };
                    
                    if (this.result.hasOwnProperty("withdrawal") && this.result.withdrawal.hasOwnProperty("annual")) {                       
                        var annWith = this.result.withdrawal.annual;
                        if (annWith.hasOwnProperty("SW")) sw.aveWithdrawal = annWith.SW.value.toFixed(3);
                        if (annWith.hasOwnProperty("GW")) gw.aveWithdrawal = annWith.GW.value.toFixed(3);
                    }
                    if (this.result.hasOwnProperty("return") && this.result.withdrawal.hasOwnProperty("annual")) {
                        var annreturn = this.result.return.annual;
                        if (annreturn.hasOwnProperty("SW")) sw.aveReturn = annreturn.SW.value.toFixed(3);
                        if (annreturn.hasOwnProperty("GW")) gw.aveReturn = annreturn.GW.value.toFixed(3);
                    }
                    tableValues.push(sw);
                    tableValues.push(gw);
                    
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
        public Sum(objectsToSum: any, propertyname):number {
            var sum = 0;
            for (var item in objectsToSum) {
                sum += objectsToSum[item][propertyname];
            }//next item
            return sum;
        }
     
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            //https://ssdev.cr.usgs.gov/streamstatsservices/wateruse.json?rcode=OH
            //var url = configuration.queryparams['WateruseConfig'].format(this.StudyArea.RegionID);
            var url = "wateruseconfig.js";
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url,true);
            this.Execute(request).then(
                (response: any) => {
                    var result = response.data;
                    this.spanYear = result.minYear != result.maxYear;
                    this._startYear = result.minYear;
                    this._endYear = result.maxYear;
                    this._yearRange = { floor: result.minYear, draggableRange: true, noSwitching: true, showTicks: false, ceil: result.maxYear };



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
                case 1: return "Jan";
                case 2: return "Feb";
                case 3: return "Mar";
                case 4: return "Apr";
                case 5: return "May";
                case 6: return "Jun";
                case 7: return "Jul";
                case 8: return "Aug";
                case 9: return "Sep";
                case 10: return "Oct";
                case 11: return "Nov";
                case 12: return "Dec";
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