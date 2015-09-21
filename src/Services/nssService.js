//------------------------------------------------------------------------------
//----- nssService -----------------------------------------------------
//------------------------------------------------------------------------------
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2015 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  The service agent is responsible for initiating service calls, 
//             capturing the data that's returned and forwarding the data back to 
//             the Controller.
//          
//discussion:
//
//https://docs.angularjs.org/api/ng/service/$http
//Comments
//06.16.2015 mjs - Created
//Import
var StreamStats;
(function (StreamStats) {
    var Services;
    (function (Services) {
        'use strict';
        var StatisticsGroup = (function () {
            function StatisticsGroup() {
            }
            return StatisticsGroup;
        })();
        Services.StatisticsGroup = StatisticsGroup; //end class
        var nssService = (function (_super) {
            __extends(nssService, _super);
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function nssService($http, $q) {
                _super.call(this, $http, configuration.baseurls['NSS']);
                this.$q = $q;
                this._onselectedStatisticsGroupChanged = new WiM.Event.Delegate();
                this.statisticsGroupList = [];
                this.selectedStatisticsGroupParameterList = [];
            }
            Object.defineProperty(nssService.prototype, "onselectedStatisticsGroupChanged", {
                get: function () {
                    return this._onselectedStatisticsGroupChanged;
                },
                enumerable: true,
                configurable: true
            });
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            nssService.prototype.loadStatisticsGroupTypes = function (rcode, regressionregion) {
                var _this = this;
                console.log('in load StatisticsGroups', rcode);
                if (!rcode)
                    return;
                var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupLookup'].format(rcode, regressionregion);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    //console.log(response.data);
                    var statisticsGroupList = _this.statisticsGroupList;
                    angular.forEach(response.data, function (value, key) {
                        statisticsGroupList.push(value);
                    });
                    //console.log(statisticsGroupList);
                    //sm when complete
                }, function (error) {
                    //sm when complete
                }).finally(function () {
                });
            };
            nssService.prototype.loadParametersByStatisticsGroup = function (rcode, statisticsGroupID, regressionregion) {
                var _this = this;
                //var deferred = ng.IQService.defer();
                console.log('in load StatisticsGroup parameters', rcode, statisticsGroupID, regressionregion);
                if (!rcode && !statisticsGroupID && !regressionregion)
                    return;
                var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupParameterLookup'].format(rcode, statisticsGroupID, regressionregion);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.selectedStatisticsGroupParameterList = [];
                this.Execute(request).then(function (response) {
                    console.log('here', response);
                    if (response.data[0].RegressionRegions[0].Parameters && response.data[0].RegressionRegions[0].Parameters.length > 0) {
                        console.log('test1');
                        response.data[0].RegressionRegions[0].Parameters.map(function (item) {
                            try {
                                //console.log(item);
                                _this.selectedStatisticsGroupParameterList.push(item);
                            }
                            catch (e) {
                                alert(e);
                            }
                            //return this.selectedStatisticsGroupParameterList;
                        });
                    }
                    /*
                        angular.forEach(response.data.Parameters, function (value, key) {
                            value.selected = true;
                            this.selectedStatisticsGroupParameterList.push(value);
                        });
                        */
                    //sm when complete
                }, function (error) {
                    //sm when complete
                }).finally(function () {
                });
            };
            return nssService;
        })(WiM.Services.HTTPServiceBase); //end class
        factory.$inject = ['$http', '$q'];
        function factory($http, $q) {
            return new nssService($http, $q);
        }
        angular.module('StreamStats.Services').factory('StreamStats.Services.nssService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {})); //end module  
//# sourceMappingURL=nssService.js.map