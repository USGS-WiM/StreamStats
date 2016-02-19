//------------------------------------------------------------------------------
//----- WaterUse ---------------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
                    _this.result = response.data;
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
                this.StartYear = new Date().getFullYear();
                this.EndYear = new Date().getFullYear();
                this._yearRange = { floor: 1980, draggableRange: true, noSwitching: true, showTicks: true, ceil: 2016 };
                this.CanContiue = true;
                this.showResults = false;
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