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
            function StormRunoffController($scope, $http, studyAreaService, region, modal, $timeout) {
                var _this = _super.call(this, $http, configuration.baseurls.StormRunoffServices) || this;
                _this.$timeout = $timeout;
                $scope.vm = _this;
                _this.modalInstance = modal;
                _this.StudyArea = studyAreaService.selectedStudyArea;
                _this.AvailableParameters = region.parameterList;
                _this.init();
                return _this;
            }
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
                    var url = configuration.queryparams['StormRunoffTR55B'].format(this.selectedSRParameterList[0], this.selectedSRParameterList[1], this.selectedSRParameterList[2], this.selectedSRParameterList[3]);
                }
                else if (this.SelectedTab == 2) {
                    var equation_2 = StormRunoffType.RationalMethod;
                    var url = configuration.queryparams['StormRunoffRationalMethod'].format(this.selectedSRParameterList[0], this.selectedSRParameterList[1], this.selectedSRParameterList[2], this.selectedSRParameterList[3]);
                }
                var request = new WiM.Services.Helpers.RequestInfo(url, false, WiM.Services.Helpers.methodType.POST, "json", angular.toJson(this.StudyArea.Features[1].feature.features[0].geometry));
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
            StormRunoffController.prototype.CalculateStreamStatsBCs = function () {
                var _this = this;
                var pintensity = $("input:radio[name=pintensity]:checked").val();
                if (this.SelectedTab == 1) {
                    this.parameterList[1] = pintensity;
                    this.selectedSRParameterList = this.AvailableParameters.filter(function (p) { return _this.parameterList.indexOf(p.code); });
                    this.studyAreaService.loadParameters();
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
                var _this = this;
                this.parameterList = ["RCN", "I6H100Y", "DRNAREA", "RUNCO_CO"];
                this.selectedSRParameterList = this.AvailableParameters.filter(function (p) { return _this.parameterList.indexOf(p.code); });
            };
            return StormRunoffController;
        }(WiM.Services.HTTPServiceBase)); //end wimLayerControlController class    
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        StormRunoffController.$inject = ['$scope', '$http', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.RegionService', '$modalInstance', '$timeout'];
        var StormRunoffType;
        (function (StormRunoffType) {
            StormRunoffType[StormRunoffType["TR55"] = 1] = "TR55";
            StormRunoffType[StormRunoffType["RationalMethod"] = 2] = "RationalMethod";
        })(StormRunoffType || (StormRunoffType = {}));
        var StormRunoffTabType;
        (function (StormRunoffTabType) {
            StormRunoffTabType[StormRunoffTabType["TR55"] = 1] = "TR55";
            StormRunoffTabType[StormRunoffTabType["RationalMethod"] = 2] = "RationalMethod";
        })(StormRunoffTabType || (StormRunoffTabType = {}));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.StormRunoffController', StormRunoffController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=StormRunoffController.js.map