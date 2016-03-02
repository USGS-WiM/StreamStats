//------------------------------------------------------------------------------
//----- WaterUse ---------------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
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
                var url = configuration.queryparams['Wateruse'].format(this.StudyArea.RegionID, this.StudyArea.WorkspaceID, this.StartYear, this.EndYear);
                var request = new WiM.Services.Helpers.RequestInfo(url);
                this.Execute(request).then(function (response) {
                    //sm when complete
                    _this.result = StreamStats.Models.WaterUse.FromJson(response.data);
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
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            WateruseController.prototype.init = function () {
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
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            WateruseController.$inject = ['$scope', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance'];
            return WateruseController;
        })(WiM.Services.HTTPServiceBase); //end wimLayerControlController class
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.WateruseController', WateruseController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=WateruseController.js.map