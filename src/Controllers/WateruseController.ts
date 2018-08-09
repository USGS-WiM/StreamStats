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
        public includePermits: boolean;
        public includeReturns: boolean;
        public computeDomesticWU: boolean;

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
            super($http, configuration.baseurls.WaterUseServices);
            $scope.vm = this;
            this.modalInstance = modal;
            this.StudyArea = studyAreaService.selectedStudyArea;
            this.init();              
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public GetWaterUse() {
            this.CanContiue = false;
            var headers = {
                "Content-Type": "application/json"
            };
            var url = configuration.queryparams['Wateruse'].format(this.StartYear, this.EndYear, this.includePermits, this.includeReturns, this.computeDomesticWU);
            var studyAreaGeom = this.StudyArea.FeatureCollection.features.filter(f => { return (<string>(f.id)).toLowerCase() == "globalwatershed" })[0].geometry;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, false, WiM.Services.Helpers.methodType.POST, "json", angular.toJson(studyAreaGeom));

            this.Execute(request).then(
                (response: any) => {  
                    this.showResults = true;                 
                    //sm when complete
                    this.result = response.data;
                    if (this.result.Messages === 'Wateruse not available at specified site.' || (!response.data.hasOwnProperty("withdrawal") && !response.data.hasOwnProperty("return"))) alert('Wateruse not available at specified site.');
                    this.ReportData.Monthly.Graph= this.loadGraphData(WaterUseType.Monthly);
                    this.ReportData.Annual.Graph=this.loadGraphData(WaterUseType.Annual);

                    this.ReportData.Monthly.Table = this.GetTableData(WaterUseType.Monthly);                    
                    this.ReportData.Annual.Table = this.GetTableData(WaterUseType.Annual);
                }, (error) => {
                    var x = error;
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
        
        private loadGraphData(useType: WaterUseType): { returns: any, withdrawals: any } {
            try {
                var results: { returns: any, withdrawals: any } = {returns:[], withdrawals:[]};
                    switch (useType) {               
                        case WaterUseType.Monthly:
                            //init table
                            var inittable = [];
                            var testx = new Array(12);

                            if (this.result.hasOwnProperty("withdrawal") && this.result.withdrawal.hasOwnProperty("monthly")) {
                                for (var month in this.result.withdrawal.monthly) {
                                    var montlyCodes = this.result.withdrawal.monthly[month]["code"];
                                    for (var code in montlyCodes) {
                                        //var itemindex = results.withdrawals.findIndex((elem) => { return elem == montlyCodes[code].name });
                                        //findIndex doesn't work for IE... so...
                                        var itemindex = -1;
                                        for (var i = 0; i < results.withdrawals.length; i++) {
                                            var elem = results.withdrawals[i];
                                            if (elem.key == montlyCodes[code].name) {
                                                itemindex = i;
                                                break;
                                            }//end if
                                        }//next i

                                        if (itemindex < 0) {
                                            var initArray = [];
                                            for (var i = 1; i <= 12; i++) {
                                                initArray.push({ "label": this.getMonth(i), "stack": "withdrawal", value: 0 });
                                            }

                                            itemindex = results.withdrawals.push(
                                                {
                                                    "key": montlyCodes[code].name,
                                                    "values": initArray,
                                                    "color": this.generateColorShade(190, 350)
                                                }) - 1;                                               
                                        }//end if
                                        results.withdrawals[itemindex].values[+month-1].value = montlyCodes[code].value;
                                    }//next code       
                                }//next month
                            }//end if
                              
                            if (this.result.hasOwnProperty("return")) {
                                var values = [];
                                for (var month in this.result.return.monthly) {                                       
                                    
                                    values.push({
                                        "label": this.getMonth(+month),
                                        "stack": "withdrawal",
                                        "value": this.Sum(this.result.return.monthly[month]["month"],"value")
                                    });       
                                }//next month

                                results.returns.push(
                                    {
                                        "key": "returns",
                                        "color": this.generateColorShade(0,170) ,
                                        "values": values
                                    });
                            }//end if                              

                            return results;

                        case WaterUseType.Annual:
                            if (this.result.hasOwnProperty("withdrawal") && this.result.withdrawal.hasOwnProperty("annual")) {
                                for (var annkey in this.result.withdrawal.annual) {
                                    var annItem = this.result.withdrawal.annual[annkey];
                                    results.withdrawals.push({
                                        name: annItem.name, value: annItem.value,
                                        color: this.generateColorShade(190, 350) });
                                }//next annItem
                            }//end if
                            if (this.result.hasOwnProperty("return") && this.result.withdrawal.hasOwnProperty("annual")) {
                                for (var annkey in this.result.return.annual) {
                                    var annItem = this.result.return.annual[annkey];
                                    results.returns.push({ name: annItem.name, value: annItem.value, color: this.generateColorShade(0, 170)});
                                }//next annItem
                            }//end if
                            return results;
                    }//end switch
            } catch (e) {
                var x = e;
            }
        }
        private GetTableData(useType: WaterUseType): any {
            var tableFields: any =[];
            var tableValues: Array<any> = [];
            try {
                switch (useType) {
                    case WaterUseType.Monthly:           
                        //init table
                        for (var i = 1; i <= 12; i++) {
                            tableValues.push({ "month": this.getMonth(i), "returns": { "name": "return", "SW": "---", "GW": "---" }, "withdrawals": { "SW": "---", "GW": "---","code": []} });
                        }
                        //returns
                        if (this.result.hasOwnProperty("return") && this.result.withdrawal.hasOwnProperty("monthly")) {
                            for (var item in this.result.return.monthly) {
                                tableValues[+item - 1].returns.GW = this.result.return.monthly[item].month.hasOwnProperty("GW") ? this.result.return.monthly[item].month.GW.value.toFixed(3) : "---";
                                tableValues[+item - 1].returns.SW = this.result.return.monthly[item].month.hasOwnProperty("SW") ? this.result.return.monthly[item].month.SW.value.toFixed(3) : "---";
                            }//next item
                        }//end if

                        //withdrawals
                        if (this.result.hasOwnProperty("withdrawal") && this.result.withdrawal.hasOwnProperty("monthly")) {
                            for (var mkey in this.result.withdrawal.monthly) {
                                tableValues[+mkey - 1].withdrawals.GW = this.result.withdrawal.monthly[mkey].month.hasOwnProperty("GW") ? this.result.withdrawal.monthly[mkey].month.GW.value.toFixed(3) : "---";
                                tableValues[+mkey - 1].withdrawals.SW = this.result.withdrawal.monthly[mkey].month.hasOwnProperty("SW") ? this.result.withdrawal.monthly[mkey].month.SW.value.toFixed(3) : "---";
                                if (this.result.withdrawal.monthly[mkey].hasOwnProperty("code")) {
                                    var monthlycode = this.result.withdrawal.monthly[mkey].code
                                    for (var cKey in monthlycode) {
                                        //var itemindex = tableFields.findIndex((elem) => { return elem == monthlycode[cKey].name });
                                        //findIndex doesn't work for IE... so...
                                        var itemindex = -1;
                                        for (var i = 0; i < tableFields.length; i++) {
                                            var elem = tableFields[i];
                                            if (elem == monthlycode[cKey].name) {
                                                itemindex = i;
                                                break;
                                            }//end if
                                        }//next i


                                        if (itemindex < 0) {
                                            itemindex = tableFields.push(monthlycode[cKey].name)-1
                                            tableValues.forEach((ele) => { ele.withdrawals.code.push({ "name": monthlycode[cKey].name, "value": "---" }) });                                        
                                        }//end if
                                        tableValues[+mkey - 1].withdrawals.code[itemindex].value = monthlycode[cKey].value.toFixed(3);
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
                        tableValues.push(
                            {
                                name: "Total",
                                aveReturn: (isNaN(+sw.aveReturn) && isNaN(+gw.aveReturn)) ? "---" : ((isNaN(+sw.aveReturn) ? 0 : +sw.aveReturn) + (isNaN(+gw.aveReturn) ? 0 : +gw.aveReturn)).toFixed(3),
                                aveWithdrawal: (isNaN(+sw.aveWithdrawal) && isNaN(+gw.aveWithdrawal)) ? "---" : ((isNaN(+sw.aveWithdrawal) ? 0 : +sw.aveWithdrawal) + (isNaN(+gw.aveWithdrawal) ? 0 : +gw.aveWithdrawal)).toFixed(3) 
                            });

                        tableValues.push({ name: "", aveReturn: "", aveWithdrawal: "" });
                        if (this.result.hasOwnProperty("TotalTempStats")) {
                            tableValues.push({ name: "Temporary water use registrations (surface water)[permit]", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[2].value.toFixed(3), unit: "MGD" });
                            tableValues.push({ name: "Temporary water use registrations (groundwater[permit])", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[1].value.toFixed(3), unit: "MGD" });
                            tableValues.push({ name: "Temporary water use registrations (total)[permit]", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[0].value.toFixed(3), unit: "MGD" });
                            tableValues.push({ name: "", aveReturn: "", aveWithdrawal: "" });
                            tableValues.push({ name: "Water use index (dimensionless) without temporary registrations:[totalnet/lowflowstat]", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[4].value.toFixed(3), unit: "Dimensionless" });
                            tableValues.push({ name: "Water use index (dimensionless) with temporary registrations:[permit w/ totalnet/lowflow stat]", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[3].value.toFixed(3), unit: "Dimensionless" });
                        }//end if

                        break;
                }//end switch

                return {
                    "values": tableValues,
                    "Fields":tableFields
                };
            } catch (e) {
                return {
                    "values": [],
                    "Fields": []
                };
            }        
        }
        public Reduce(array: Array<any>) {
            return array.reduce((a, b) =>
                (isNaN(+a) && isNaN(+b)) ? "---" : ((isNaN(+a) ? 0 : +a) + (isNaN(+b) ? 0 : +b)).toFixed(3)                
                , 0);
        }
        public Sum(objectsToSum: any, propertyname):number {
            var sum = 0;
            for (var item in objectsToSum) {
                sum += objectsToSum[item][propertyname];
            }//next item
            return sum;
        }
        public Add(a:string, b:string): string {            
            return (isNaN(+a) && isNaN(+b)) ? "---" : ((isNaN(+a) ? 0 : +a) + (isNaN(+b) ? 0 : +b)).toFixed(3);
        }
        public DownloadCSV() {
            
            var filename = 'wateruseSummary.csv';
            var processAnnualWateruseTable = () => {

                var finalVal = this.StartYear + "-" + this.EndYear +' Average Annual Water Use reported in million gallons/day\n';
                finalVal += this.tableToCSV($('#AnnualWaterUseTable'));
                return finalVal + '\r\n';
            };
            var ProcessMonthlyWateruseTable = () => {

                var finalVal = this.StartYear + "-" + this.EndYear +' Average Water Use by Month reported in million gallons/day\n';
                finalVal += this.tableToCSV($('#MonthlyWaterUseTable'));
                return finalVal + '\r\n';
            };

            

            //main file header with site information
            var csvFile = 'StreamStats Water Use Report' +
                '\nState/Region ID,' + this.StudyArea.RegionID.toUpperCase() +
                '\nWorkspace ID,' + this.StudyArea.WorkspaceID +
                '\nLatitude,' + this.StudyArea.Pourpoint.Latitude.toFixed(5) +
                '\nLongitude,' + this.StudyArea.Pourpoint.Longitude.toFixed(5) +
                '\nTime:,' + this.result.processDate.toLocaleString() +
                '\nStart Year:,' + this.StartYear +
                '\nEnd Year:,' + this.EndYear +
                '\r\n'

            //first write main parameter table
            csvFile += processAnnualWateruseTable();

            csvFile += ProcessMonthlyWateruseTable();

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
        public DownloadCSVBySource() {
            var headers = {
                "Accept": "text/csv",
                "Authorization": "Basic dGVzdE1hbmFnZXI6RG9nMQ=="
            };
            var url = configuration.queryparams['WateruseSourceCSV'].format(this.StartYear, this.EndYear, this.includePermits, this.includeReturns, this.computeDomesticWU);
            var studyAreaGeom = this.StudyArea.FeatureCollection.features.filter(f => { return (<string>(f.id)).toLowerCase() == "globalwatershed" })[0].geometry;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, false, WiM.Services.Helpers.methodType.POST, "json", angular.toJson(studyAreaGeom),headers);

            this.Execute(request).then(
                (response: any) => {
                    var filename = 'wateruseSummaryBySource.csv';

                    var blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
                    if (navigator.msSaveBlob) { // IE 10+
                        navigator.msSaveBlob(request, filename);
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
                }, (error) => {
                    var x = error;
                    //sm when error                    
                }).finally(() => {
                    this.CanContiue = true;
                });


        }
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            var url = configuration.queryparams['WateruseConfig'].format(this.StudyArea.RegionID);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url);
            this.Execute(request).then(
                (response: any) => {
                    var result = response.data;
                    this.spanYear = result.minYear != result.maxYear;
                    this._startYear = result.minYear;
                    this._endYear = result.maxYear;
                    this.includePermits = result.hasPermits;
                    this.includeReturns = result.hasReturns;
                    this.computeDomesticWU = false;
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
                            },
                            resize: () => {
                                console.log("resize");
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
                        height: 400,
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
            $(window).resize(() => {
                this.$timeout(() => {
                    this.loadGraphLabels(0);
                }, 500); 
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
            var svg = d3.selectAll('.nv-multibarHorizontal .nv-group')
            // subtract 2 in order to account for returns
            var lastBarID = svg.map((items: Array<any>) => { return items.length-2; });
            var lastBars = svg.filter(
                function (d, i) {
                    return i == lastBarID[0];
                });

            svg.each(function (group, i) {
            var g = d3.select(this);
            // Remove previous labels if there is any
            g.selectAll('text').remove();                
            g.selectAll('.nv-bar').each(function (bar) {
                var b = d3.select(this);
                var barWidth = b.node().getBBox()['width'];
                var barHeight = b.node().getBBox()['height'];                   

                g.append('text')
                    // Transforms shift the origin point then the x and y of the bar
                    // is altered by this transform. In order to align the labels
                    // we need to apply this transform to those.
                    .attr('transform', b.attr('transform'))
                    .text(function () {
                        // Two decimals format
                        if(i >= lastBarID[0])
                            return d3.format(',.3f')((Number(bar.y) + Number(bar.y0)).toFixed(3));
                    })
                    .attr("dy", "1.5em")
                    //.attr('y', function () {
                    //    // Center label vertically
                    //    var height = b.node().getBBox().height;
                    //    return parseFloat(b.attr('y')) - 10; // 10 is the label's margin from the bar
                    //})
                    .attr('x', function () {
                        var width = this.getBBox().width;
                        return barWidth - width/2;
                    })
                    .attr('class', 'bar-values');
            });
        });
            
        }  
        private generateColorShade(minhue: number, maxhue:number):string {
            try {
                var h = this.rand(minhue, minhue);
                var s = this.rand(30, 100);
                var l = this.rand(30, 70);

                return 'hsla(' + h + ',' + s + '%,' + l + '%,1)';                               
                
            } catch (e) {
                return null
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
        }//end tableToCSV
        private HSLtoRGB(h, s, l): any {
            // hsl in set of 0-1
            var r, g, b;

            if (s == 0) {
                r = g = b = l; // achromatic
            } else {
                var hue2rgb = function hue2rgb(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                }

                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            return {r: Math.round(r * 255),g: Math.round(g * 255), b: Math.round(b * 255) };
        }
        private RGBtoHEX(r, g, b): string {

            var red = this.ToHex(r);
            var green = this.ToHex(g);
            var blue = this.ToHex(b);
            return red+green+blue;

        }
        private ToHex(item) {
            var hex = Number(item).toString(16);
            if (hex.length < 2) {
                hex = "0" + hex;
            }
            return hex;
        }
        private rand(min:number, max:number): any {
            return parseInt(<any>(Math.random() * (max - min + 1)), 10) + min;
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