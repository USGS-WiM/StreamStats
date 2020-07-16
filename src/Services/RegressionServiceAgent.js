var StreamStats;
(function (StreamStats) {
    var ServiceAgent;
    (function (ServiceAgent) {
        'use strict';
        var FDCTMAgent = (function () {
            function FDCTMAgent($http) {
            }
            FDCTMAgent.prototype.Init = function () {
                try {
                    return null;
                }
                catch (e) {
                }
            };
            FDCTMAgent.prototype.Load = function (scenarioByRef) {
                try {
                    return false;
                }
                catch (e) {
                }
            };
            FDCTMAgent.prototype.Run = function (scenarioByRef) {
                try {
                }
                catch (e) {
                    return false;
                }
            };
            return FDCTMAgent;
        }());
        factory.$inject = ['$http'];
        function factory($http) {
            return new FDCTMAgent($http);
        }
        angular
            .module('StreamStats.ServiceAgent')
            .factory('StreamStats.ServiceAgent.FDCTMAgent', factory);
    })(ServiceAgent = StreamStats.ServiceAgent || (StreamStats.ServiceAgent = {}));
})(StreamStats || (StreamStats = {}));
