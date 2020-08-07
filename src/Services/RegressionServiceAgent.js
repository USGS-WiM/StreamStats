//------------------------------------------------------------------------------
//----- AuthenticationAgent ---------------------------------------------------------------
//------------------------------------------------------------------------------
var StreamStats;
(function (StreamStats) {
    var ServiceAgent;
    (function (ServiceAgent) {
        'use strict';
        var FDCTMAgent = /** @class */ (function () {
            // Constructor
            function FDCTMAgent($http) {
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
        }()); //end class
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