var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use string';
        var WarningMessageController = (function (_super) {
            __extends(WarningMessageController, _super);
            function WarningMessageController($scope, $http, modal) {
                var _this = _super.call(this, $http, '') || this;
                $scope.vm = _this;
                _this.modalInstance = modal;
                _this.init();
                return _this;
            }
            WarningMessageController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            WarningMessageController.prototype.init = function () {
                this.warningMessage = configuration.warningModalMessage;
            };
            WarningMessageController.$inject = ['$scope', '$http', '$modalInstance'];
            return WarningMessageController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.WarningMessageController', WarningMessageController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
