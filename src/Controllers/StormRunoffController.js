//------------------------------------------------------------------------------
//----- Storm runnoff controller------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use strict';
        var StormRunoffReportable = (function () {
            function StormRunoffReportable() {
                this.TR55 = { Graph: {}, Table: {}, PeakQ: {}, Infiltration: {}, ExcessPrecip: {} };
                this.RationalMethod = { Graph: {}, Table: {}, PeakQ: {}, Infiltration: {}, ExcessPrecip: {} };
            }
            return StormRunoffReportable;
        }());
        var StormRunoffController = (function (_super) {
            __extends(StormRunoffController, _super);
            function StormRunoffController($scope, $http, studyAreaService, region, modal, $timeout, EventManager) {
                var _this = _super.call(this, $http, configuration.baseurls.StormRunoffServices) || this;
                _this.$timeout = $timeout;
                _this.EventManager = EventManager;
                _this.regionParameters = [];
                _this.PrecipOptions = [];
                _this.SelectedParameterList = [];
                $scope.vm = _this;
                _this.modalInstance = modal;
                _this.StudyArea = studyAreaService.selectedStudyArea;
                _this.studyAreaService = studyAreaService;
                _this.regionParameters = region.parameterList;
                _this.parameterloadedEventHandler = new WiM.Event.EventHandler(function (sender, e) {
                    if (e.parameterLoaded)
                        _this.loadParameters();
                });
                _this.init();
                return _this;
            }
            Object.defineProperty(StormRunoffController.prototype, "SelectedTab", {
                get: function () {
                    return this._selectedTab;
                },
                set: function (val) {
                    if (this._selectedTab != val) {
                        this._selectedTab = val;
                        this.selectRunoffType();
                    } //end if           
                },
                enumerable: true,
                configurable: true
            });
            //Methods  
            //-+-+-+-+-+-+-+-+-+-+-+-
            StormRunoffController.prototype.GetStormRunoffResults = function () {
                var _this = this;
                this.CanContinue = false;
                var equation = "";
                var headers = {
                    "Content-Type": "application/json"
                };
                if (this.SelectedTab == 1) {
                    var equation_1 = StormRunoffType.TR55;
                    var url = configuration.queryparams['StormRunoffTR55B'].format(this.SelectedParameterList[0].value, this.SelectedParameterList[1].value, this.SelectedParameterList[2].value, this.SelectedParameterList[3]);
                }
                else if (this.SelectedTab == 2) {
                    var equation_2 = StormRunoffType.RationalMethod;
                    var url = configuration.queryparams['StormRunoffRationalMethod'].format(this.SelectedParameterList[0].value, this.SelectedParameterList[1].value, this.SelectedParameterList[2].value, this.SelectedParameterList[3]);
                }
                var request = new WiM.Services.Helpers.RequestInfo(url, false, WiM.Services.Helpers.methodType.POST, "json", angular.toJson(this.StudyArea.Features[1].feature.features[0].geometry));
                this.Execute(request).then(function (response) {
                    _this.showResults = true;
                    //sm when complete
                    _this.result = response.data;
                    if (_this.SelectedTab == 1) {
                        _this.ReportData.TR55.Graph = _this.loadGraphData();
                        _this.ReportData.TR55.Table = _this.GetTableData();
                        _this.ReportData.TR55.PeakQ = _this.getPeakQ();
                    }
                    else if (_this.SelectedTab == 2) {
                        _this.ReportData.RationalMethod.PeakQ = _this.getPeakQ();
                    }
                }, function (error) {
                    var x = error;
                    //sm when error                    
                }).finally(function () {
                    _this.CanContinue = true;
                });
            };
            StormRunoffController.prototype.CalculateParameters = function () {
                try {
                    this.EventManager.SubscribeToEvent(StreamStats.Services.onSelectedStudyParametersLoaded, this.parameterloadedEventHandler);
                    //add to studyareaservice if not already there
                    for (var i = 0; i < this.SelectedParameterList.length; i++) {
                        var param = this.SelectedParameterList[i];
                        if (this.checkArrayForObj(this.studyAreaService.studyAreaParameterList, param) == -1) {
                            this.studyAreaService.studyAreaParameterList.push(param);
                        } //end if
                    } //next i
                    if (this.SelectedPrecip != null && this.checkArrayForObj(this.studyAreaService.studyAreaParameterList, this.SelectedPrecip) == -1)
                        this.studyAreaService.studyAreaParameterList.push(this.SelectedPrecip);
                    this.studyAreaService.loadParameters();
                }
                catch (e) {
                    console.log("oops CalculateParams failed to load ", e);
                }
            };
            StormRunoffController.prototype.RadioButtonCtrl = function ($scope) {
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
            };
            StormRunoffController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            StormRunoffController.prototype.Reset = function () {
                this.init();
            };
            StormRunoffController.prototype.Print = function () {
                window.print();
            };
            StormRunoffController.prototype.loadGraphData = function () {
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
                }
                catch (e) {
                    var x = e;
                }
            };
            StormRunoffController.prototype.GetTableData = function () {
                var tableFields = [];
                tableFields.push("time");
                tableFields.push(Object.keys(this.result));
                var tableValues = [];
                try {
                    for (var i = 0; i <= 100; i++) {
                        if (this.result[i] != "undefined") {
                            var dur = this.result[i].duration;
                            var time = new Date(null);
                            time = this.computeTime(this.result[i], dur);
                            tableValues.push({ time: time });
                            var tempArray = [];
                            for (var k in this.result[i]) {
                                if (this.result[i].hasOwnProperty(k)) {
                                    tempArray.push(this.result[i][k]);
                                }
                            }
                            tempArray.unshift(time);
                            tableValues.push({ tempArray: tempArray });
                        }
                    }
                }
                catch (e) {
                    var x = e;
                }
            };
            StormRunoffController.prototype.getPeakQ = function () {
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
                }
                catch (e) {
                    var x = e;
                }
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            StormRunoffController.prototype.init = function () {
                var _this = this;
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
                            stateChange: function () {
                                //console.log("StateChange");
                                //must wrap in timer or method executes prematurely
                                _this.$timeout(function () {
                                    //this.loadGraphLabels(0);
                                }, 500);
                            },
                            renderEnd: function () {
                                //console.log("renderend");
                                //must wrap in timer or method executes prematurely
                                _this.$timeout(function () {
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
            };
            StormRunoffController.prototype.loadParameters = function () {
                //unsubscribe first
                this.EventManager.UnSubscribeToEvent(StreamStats.Services.onSelectedStudyParametersLoaded, this.parameterloadedEventHandler);
                alert("Parameters loaded");
            };
            StormRunoffController.prototype.selectRunoffType = function () {
                switch (this._selectedTab) {
                    case StormRunoffType.TR55:
                        this.PrecipOptions = this.regionParameters.filter(function (f) { return ["I6H2Y", "I6H100Y", "I24H2Y", "I24H100Y"].indexOf(f.code) != -1; });
                        this.SelectedParameterList = this.regionParameters.filter(function (f) { return ["DRNAREA", "I6H2Y", "RCN", "RUNCO_CO"].indexOf(f.code) != -1; });
                        this.SelectedPrecip = this.PrecipOptions[0];
                        break;
                    default:
                        break;
                }
            };
            StormRunoffController.prototype.checkArrayForObj = function (arr, obj) {
                for (var i = 0; i < arr.length; i++) {
                    if (angular.equals(arr[i], obj)) {
                        return i;
                    }
                }
                ;
                return -1;
            };
            StormRunoffController.prototype.computeTime = function (time, dur) {
                time.setMinutes(time * 0.01 * dur * 60); // specify value for MINUTES here
                time.toISOString().substr(11, 8).replace(/^[0:]+/, "");
                return time;
            };
            return StormRunoffController;
        }(WiM.Services.HTTPServiceBase)); //end wimLayerControlController class    
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        StormRunoffController.$inject = ['$scope', '$http', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.RegionService', '$modalInstance', '$timeout', 'WiM.Event.EventManager'];
        var StormRunoffType;
        (function (StormRunoffType) {
            StormRunoffType[StormRunoffType["TR55"] = 1] = "TR55";
            StormRunoffType[StormRunoffType["RationalMethod"] = 2] = "RationalMethod";
        })(StormRunoffType || (StormRunoffType = {}));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.StormRunoffController', StormRunoffController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=StormRunoffController.js.map