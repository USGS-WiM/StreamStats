//------------------------------------------------------------------------------
//----- AuthenticationAgent ---------------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var StreamStats;
(function (StreamStats) {
    var ServiceAgent;
    (function (ServiceAgent) {
        'use strict';
        var FDCTMAgent = /** @class */ (function (_super) {
            __extends(FDCTMAgent, _super);
            // Constructor
            function FDCTMAgent($http) {
                return _super.call(this, $http, configuration.appSettings['RegressionService']) || this;
            }
            //Methods
            FDCTMAgent.prototype.Init = function () {
                try {
                    return null;
                }
                catch (e) {
                }
            };
            FDCTMAgent.prototype.Load = function (scenarioByRef) {
                try {
                    //javascript passes objects by reference
                    return false;
                }
                catch (e) {
                }
            };
            FDCTMAgent.prototype.Run = function (scenarioByRef) {
                try {
                    //javascript passes objects by reference
                }
                catch (e) {
                    return false;
                }
            };
            return FDCTMAgent;
        }(ServiceAgentBase)); //end class
        //factory injections
        factory.$inject = ['$http'];
        function factory($http) {
            return new FDCTMAgent($http);
        }
        //angular module service registration call
        angular
            .module('StreamStats.ServiceAgent')
            .factory('StreamStats.ServiceAgent.FDCTMAgent', factory);
    })(ServiceAgent = StreamStats.ServiceAgent || (StreamStats.ServiceAgent = {}));
})(StreamStats || (StreamStats = {})); //end module
//# sourceMappingURL=RegressionServiceAgent.js.map