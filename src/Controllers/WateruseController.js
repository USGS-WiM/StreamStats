//------------------------------------------------------------------------------
//----- WaterUse ---------------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use strict';
        var WaterUseReportable = (function () {
            function WaterUseReportable() {
                this.Annual = { Graph: {}, Table: {} };
                this.Monthly = { Graph: { withdrawals: null, returns: null }, Table: {} };
            }
            return WaterUseReportable;
        })();
        var WateruseController = (function (_super) {
            __extends(WateruseController, _super);
            function WateruseController($scope, $http, studyAreaService, modal, $timeout) {
                _super.call(this, $http, 'http://ssdev.cr.usgs.gov');
                this.$timeout = $timeout;
                $scope.vm = this;
                this.modalInstance = modal;
                this.StudyArea = studyAreaService.selectedStudyArea;
                this.init();
            }
            Object.defineProperty(WateruseController.prototype, "StartYear", {
                get: function () {
                    return this._startYear;
                },
                set: function (val) {
                    if (val <= this.EndYear && val >= this.YearRange.floor)
                        this._startYear = val;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(WateruseController.prototype, "EndYear", {
                get: function () {
                    return this._endYear;
                },
                set: function (val) {
                    if (val >= this.StartYear && val <= this.YearRange.ceil)
                        this._endYear = val;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(WateruseController.prototype, "YearRange", {
                get: function () {
                    return this._yearRange;
                },
                enumerable: true,
                configurable: true
            });
            //Methods  
            //-+-+-+-+-+-+-+-+-+-+-+-
            WateruseController.prototype.GetWaterUse = function () {
                var _this = this;
                this.CanContiue = false;
                //http://ssdev.cr.usgs.gov/streamstatsservices/wateruse.json?rcode=OH&workspaceID=OH20160217071851546000&startyear=2005&endyear=2009
                var url = configuration.queryparams['Wateruse'].format(this.StudyArea.RegionID, this.StudyArea.WorkspaceID, this.StartYear, this.EndYear);
                //var url = "wateruse.js";
                var request = new WiM.Services.Helpers.RequestInfo(url);
                this.Execute(request).then(function (response) {
                    _this.showResults = true;
                    //sm when complete
                    _this.result = response.data;
                    _this.GetGraphData(WaterUseType.Monthly);
                    _this.GetGraphData(WaterUseType.Annual);
                    _this.ReportData.Monthly.Table = _this.GetTableData(WaterUseType.Monthly);
                    _this.ReportData.Annual.Table = _this.GetTableData(WaterUseType.Annual);
                }, function (error) {
                    //sm when error                    
                }).finally(function () {
                    _this.CanContiue = true;
                });
            };
            WateruseController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            WateruseController.prototype.Reset = function () {
                this.init();
            };
            WateruseController.prototype.Print = function () {
                window.print();
            };
            WateruseController.prototype.GetGraphData = function (useType) {
                switch (useType) {
                    case WaterUseType.Monthly:
                        this.ReportData.Monthly.Graph.withdrawals = [];
                        if (!this.result.hasOwnProperty("DailyMonthlyAveWithdrawalsByCode"))
                            return;
                        this.ReportData.Monthly.Graph.withdrawals = this.result.DailyMonthlyAveWithdrawalsByCode.map(function (elem) {
                            return {
                                "key": elem[0].name.slice(-2),
                                "values": elem.map(function (values) {
                                    return {
                                        "label": values.name.substring(6, 9),
                                        "stack": values.type,
                                        "value": values.value
                                    };
                                })
                            };
                        });
                        this.ReportData.Monthly.Graph.returns = [];
                        var values = [];
                        if (this.result.hasOwnProperty("MonthlyWaterUseCoeff")) {
                            this.result.MonthlyWaterUseCoeff.forEach(function (item) {
                                if (item.name === "Total Returns" && item.unit === "MGD") {
                                    values.push({ "label": item.type, "stack": item.name, "value": item.value });
                                }
                            }); //next
                            this.ReportData.Monthly.Graph.returns.push({
                                "key": "Returns",
                                "values": values,
                                "color": "#ff7f0e"
                            });
                        } //end if
                        break;
                    case WaterUseType.Annual:
                        this.ReportData.Annual.Graph = [];
                        if (this.result.hasOwnProperty("AveGWWithdrawals"))
                            this.ReportData.Annual.Graph.push({ name: "Groundwater withdrawal", value: this.result.AveGWWithdrawals.value });
                        if (this.result.hasOwnProperty("AveSWWithdrawals"))
                            this.ReportData.Annual.Graph.push({ name: "Surface water withdrawal", value: this.result.AveSWWithdrawals.value });
                        if (this.result.hasOwnProperty("AveReturns"))
                            ;
                        this.ReportData.Annual.Graph.push({ name: "Surface water return", value: this.result.AveReturns.value });
                        break;
                } //end switch
            };
            WateruseController.prototype.GetTableData = function (useType) {
                var tableFields = [];
                var tableValues = [];
                switch (useType) {
                    case WaterUseType.Monthly:
                        //init table
                        for (var i = 0; i < 12; i++) {
                            tableValues.push({ "month": this.getMonth(i), "returns": {}, "withdrawals": [] });
                        }
                        if (this.result.hasOwnProperty("MonthlyWaterUseCoeff")) {
                            var avereturn = this.result.AveReturns.value;
                            var index = 0;
                            this.result.MonthlyWaterUseCoeff.forEach(function (item) {
                                if (item.name === "Total Returns" && item.unit === "MGD") {
                                    tableValues[index].returns = item;
                                    index++;
                                }
                            }); //next
                        } //end if
                        if (this.result.hasOwnProperty("DailyMonthlyAveWithdrawalsByCode")) {
                            this.result.DailyMonthlyAveWithdrawalsByCode.forEach(function (item) {
                                tableFields.push(item[0].name.slice(-2));
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
                            }); //next item  
                        }
                        break;
                    case WaterUseType.Annual:
                        tableFields = ["", "Average Return", "Average Withdrawal"];
                        if (this.result.hasOwnProperty("AveSWWithdrawals"))
                            tableValues.push({ name: "Surface Water", aveReturn: "---", aveWithdrawal: this.result.AveSWWithdrawals.value.toFixed(3), unit: "MGD" });
                        if (this.result.hasOwnProperty("AveGWWithdrawals"))
                            tableValues.push({ name: "Groundwater", aveReturn: "---", aveWithdrawal: this.result.AveGWWithdrawals.value.toFixed(3), unit: "MGD" });
                        if (this.result.hasOwnProperty("AveReturns"))
                            tableValues.push({ name: "Total", aveReturn: this.result.AveReturns.value.toFixed(3), aveWithdrawal: (this.result.AveSWWithdrawals.value + this.result.AveGWWithdrawals.value).toFixed(3), unit: "MGD" });
                        tableValues.push({ name: "", aveReturn: "", aveWithdrawal: "" });
                        if (this.result.hasOwnProperty("TotalTempStats")) {
                            tableValues.push({ name: "Temporary water-use registrations (surface water)", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[2].value.toFixed(3), unit: "MGD" });
                            tableValues.push({ name: "Temporary water-use registrations (groundwater)", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[1].value.toFixed(3), unit: "MGD" });
                            tableValues.push({ name: "Temporary water-use registrations (total)", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[0].value.toFixed(3), unit: "MGD" });
                            tableValues.push({ name: "", aveReturn: "", aveWithdrawal: "" });
                            tableValues.push({ name: "Water-use index (dimensionless) without temporary registrations:", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[4].value.toFixed(3), unit: "Dimensionless" });
                            tableValues.push({ name: "Water-use index (dimensionless) with temporary registrations:", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[3].value.toFixed(3), unit: "Dimensionless" });
                        } //end if
                        break;
                } //end switch
                return {
                    "values": tableValues,
                    "Fields": tableFields
                };
            };
            WateruseController.prototype.Reduce = function (array) {
                return array.reduce(function (a, b) {
                    return Number(a) + Number(b.value);
                }, 0);
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            WateruseController.prototype.init = function () {
                var _this = this;
                //http://ssdev.cr.usgs.gov/streamstatsservices/wateruse.json?rcode=OH&workspaceID=OH20160217071851546000&startyear=2005&endyear=2009
                var url = configuration.queryparams['Wateruse'].format(this.StudyArea.RegionID);
                //var url = "wateruse.js";
                var request = new WiM.Services.Helpers.RequestInfo(url);
                this.Execute(request).then(function (response) {
                    _this.showResults = true;
                    //sm when complete
                    _this.result = response.data;
                    _this.GetGraphData(WaterUseType.Monthly);
                    _this.GetGraphData(WaterUseType.Annual);
                    _this.ReportData.Monthly.Table = _this.GetTableData(WaterUseType.Monthly);
                    _this.ReportData.Annual.Table = _this.GetTableData(WaterUseType.Annual);
                }, function (error) {
                    //sm when error                    
                }).finally(function () {
                    _this.CanContiue = true;
                });
                this._startYear = 2005;
                this._endYear = 2012;
                this._yearRange = { floor: 2005, draggableRange: true, noSwitching: true, showTicks: false, ceil: 2012 };
                this.CanContiue = false;
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
                            stateChange: function () {
                                console.log("StateChange");
                                //must wrap in timer or method executes prematurely
                                _this.$timeout(function () {
                                    _this.loadGraphLabels(1);
                                }, 500);
                            },
                            renderEnd: function () {
                                console.log("renderend");
                                //must wrap in timer or method executes prematurely
                                _this.$timeout(function () {
                                    _this.loadGraphLabels(1);
                                }, 500);
                            }
                        },
                        showValues: true,
                        valueFormat: function (d) {
                            return d3.format(',.4f')(d);
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
                    },
                    title: {
                        enable: true,
                        text: this.StartYear + " - " + this.EndYear + " Average Water-Use Withdrawals By Month",
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
                        xAxis: {
                            showMaxMin: false
                        },
                        yAxis: {
                            axisLabel: 'Values in million gallons/day',
                            tickFormat: function (d) {
                                return d3.format(',.3f')(d);
                            }
                        }
                    },
                    title: {
                        enable: true,
                        text: this.StartYear + " - " + this.EndYear + " Average Water-Use Returns By Month",
                    }
                };
                this.AnnualReportOptions = {
                    chart: {
                        type: 'pieChart',
                        height: 500,
                        x: function (d) { return d.name; },
                        y: function (d) { return d.value; },
                        showLabels: true,
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
                    },
                    title: {
                        enable: true,
                        text: this.StartYear + " - " + this.EndYear + " Average Water-Use By Source",
                    },
                    subtitle: {
                        enable: true,
                        text: "reported in million gallons/day",
                    }
                };
            };
            WateruseController.prototype.getMonth = function (index) {
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
            };
            WateruseController.prototype.loadGraphLabels = function (id) {
                var svg = d3.selectAll("g.nv-multibarHorizontal");
                var lastBarID = svg.selectAll("g.nv-group").map(function (items) { return items.length; });
                var lastBars = svg.selectAll("g.nv-group").filter(function (d, i) {
                    return i == lastBarID[id] - 1;
                }).selectAll("g.positive");
                var groupLabels = svg.select("g.nv-barsWrap");
                lastBars.each(function (d, index) {
                    var text = d3.select(this).selectAll("text");
                    text.text(d3.format(',.3f')(d.y1.toFixed(3)));
                    text.attr("dy", "1.32em");
                });
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            WateruseController.$inject = ['$scope', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance', '$timeout'];
            return WateruseController;
        })(WiM.Services.HTTPServiceBase); //end wimLayerControlController class
        var WaterUseType;
        (function (WaterUseType) {
            WaterUseType[WaterUseType["Annual"] = 1] = "Annual";
            WaterUseType[WaterUseType["Monthly"] = 2] = "Monthly";
        })(WaterUseType || (WaterUseType = {}));
        var WaterUseTabType;
        (function (WaterUseTabType) {
            WaterUseTabType[WaterUseTabType["Graph"] = 1] = "Graph";
            WaterUseTabType[WaterUseTabType["Table"] = 2] = "Table";
        })(WaterUseTabType || (WaterUseTabType = {}));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.WateruseController', WateruseController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=WateruseController.js.map