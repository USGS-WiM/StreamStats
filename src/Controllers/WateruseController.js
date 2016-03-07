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
        'use string';
        var WateruseController = (function (_super) {
            __extends(WateruseController, _super);
            function WateruseController($scope, $http, studyAreaService, modal) {
                _super.call(this, $http, 'http://ssdev.cr.usgs.gov');
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
                //var url = configuration.queryparams['Wateruse'].format(this.StudyArea.RegionID, this.StudyArea.WorkspaceID, this.StartYear, this.EndYear);
                var url = "wateruse.js";
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    //sm when complete
                    _this.result = response.data;
                    _this.GraphData = _this.GetGraphData();
                    _this.TableData = _this.GetTableData();
                    _this.showResults = true;
                }, function (error) {
                    //sm when error                    
                }).finally(function () {
                    _this.CanContiue = true;
                });
            };
            WateruseController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            WateruseController.prototype.GetGraphData = function () {
                if (!this.result.hasOwnProperty("DailyMonthlyAveWithdrawalsByCode"))
                    return;
                var results = this.result.DailyMonthlyAveWithdrawalsByCode.map(function (elem) {
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
                return results;
            };
            WateruseController.prototype.GetTableData = function () {
                var tableFields = [];
                tableFields.push("Month");
                var monthlyValues = [];
                for (var i = 0; i < 12; i++) {
                    monthlyValues[i] = [this.getMonth(i)];
                }
                if (this.result.hasOwnProperty("MonthlyWaterUseCoeff")) {
                    var avereturn = this.result.AveReturns.value;
                    var monthlyReturns = [];
                    tableFields.push("Returns");
                    var index = 0;
                    this.result.MonthlyWaterUseCoeff.forEach(function (item) {
                        if (item.name === "Total Returns" && item.unit === "MGD") {
                            monthlyValues[index].push(item);
                            index++;
                        }
                    }); //next
                } //end if
                if (this.result.hasOwnProperty("DailyMonthlyAveWithdrawalsByCode")) {
                    tableFields.push("Total");
                    this.result.DailyMonthlyAveWithdrawalsByCode.forEach(function (item) {
                        tableFields.push(item[0].name.slice(-2));
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
                    }); //next item  
                }
                return {
                    "values": monthlyValues,
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
                    }, title: {
                        enable: true,
                        text: "Average Water Use By Month",
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
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            WateruseController.$inject = ['$scope', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance'];
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