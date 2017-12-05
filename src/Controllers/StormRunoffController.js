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
                this.TimeSeries = { Graph: {}, Table: {} };
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
                    //var url = configuration.queryparams['StormRunoffTR55B'].format(this.selectedSRParameterList[0], this.selectedSRParameterList[1], this.selectedSRParameterList[2], this.selectedSRParameterList[3]);
                }
                else if (this.SelectedTab == 2) {
                    var equation_2 = StormRunoffType.RationalMethod;
                    //var url = configuration.queryparams['StormRunoffRationalMethod'].format(this.selectedSRParameterList[0], this.selectedSRParameterList[1], this.selectedSRParameterList[2], this.selectedSRParameterList[3]);
                }
                var request = null; //new WiM.Services.Helpers.RequestInfo(url, false, WiM.Services.Helpers.methodType.POST, "json", angular.toJson(this.StudyArea.Features[1].feature.features[0].geometry));
                this.Execute(request).then(function (response) {
                    _this.showResults = true;
                    //sm when complete
                    _this.result = response.data;
                    if (_this.SelectedTab == 1) {
                        //this.ReportData.TimeSeries.Graph = this.loadGraphData(StormRunoffType.TR55);
                        //this.ReportData.TimeSeries.Table = this.GetTableData(StormRunoffType.TR55);
                    }
                    else if (_this.SelectedTab == 2) {
                        //this.ReportData.TimeSeries.Table = this.GetTableData(StormRunoffType.RationalMethod);
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
            StormRunoffController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            StormRunoffController.prototype.Reset = function () {
                this.init();
            };
            StormRunoffController.prototype.Print = function () {
                window.print();
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            StormRunoffController.prototype.init = function () {
                this.SelectedTab = StormRunoffType.TR55;
                this.SelectedPrecip = this.PrecipOptions[0];
                //for testing
                this.CalculateParameters();
            };
            StormRunoffController.prototype.loadParameters = function () {
                //unsubscribe first
                this.EventManager.UnSubscribeToEvent(StreamStats.Services.onSelectedStudyParametersLoaded, this.parameterloadedEventHandler);
                alert("Parameters loaded");
            };
            StormRunoffController.prototype.selectRunoffType = function () {
                switch (this._selectedTab) {
                    case StormRunoffType.TR55:
                        this.PrecipOptions = this.regionParameters.filter(function (f) { return ["I6H100Y", "I24H100Y", "I24H2Y", "I6H2Y", "PRECIP"].indexOf(f.code) != -1; });
                        this.SelectedParameterList = this.regionParameters.filter(function (f) { return ["RCN", "DRNAREA", "RUNCO_CO"].indexOf(f.code) != -1; });
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