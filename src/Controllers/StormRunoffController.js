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
        var StormRunoffController = (function (_super) {
            __extends(StormRunoffController, _super);
            function StormRunoffController($scope, $http, studyAreaService, modal, $timeout) {
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
            StormRunoffController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            StormRunoffController.prototype.init = function () {
            };
            return StormRunoffController;
        }(WiM.Services.HTTPServiceBase)); //end wimLayerControlController class    
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        StormRunoffController.$inject = ['$scope', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance', '$timeout'];
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.StormRunoffController', StormRunoffController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=StormRunoffController.js.map