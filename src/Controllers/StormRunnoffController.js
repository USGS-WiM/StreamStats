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
        var StormRunnoffController = (function (_super) {
            __extends(StormRunnoffController, _super);
            function StormRunnoffController($scope, $http, studyAreaService, modal, $timeout) {
                var _this = _super.call(this, $http, configuration.baseurls.WaterUseServices) || this;
                _this.$timeout = $timeout;
                $scope.vm = _this;
                _this.modalInstance = modal;
                _this.StudyArea = studyAreaService.selectedStudyArea;
                _this.init();
                return _this;
            }
            //Methods  
            //-+-+-+-+-+-+-+-+-+-+-+-
            StormRunnoffController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            StormRunnoffController.prototype.init = function () {
            };
            return StormRunnoffController;
        }(WiM.Services.HTTPServiceBase)); //end wimLayerControlController class    
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        StormRunnoffController.$inject = ['$scope', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance', '$timeout'];
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.StormRunnoffController', StormRunnoffController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=StormRunnoffController.js.map