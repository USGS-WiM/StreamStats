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
            function nssService($http, $q, toaster) {
                _super.call(this, $http, configuration.baseurls['NSS']);
                this.$q = $q;
                this.toaster = toaster;
                this._onselectedStatisticsGroupChanged = new WiM.Event.Delegate();
                this.statisticsGroupList = [];
                this.selectedStatisticsGroupParameterList = [];
                this.selectedStatisticsGroupScenarioResults = [];
                this.canUpdate = true;
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
                this.toaster.pop('info', "Loading Available Scenarios", "Please wait...", 999999);
                console.log('in load StatisticsGroups', rcode);
                if (!rcode && !regressionregion)
                    return;
                var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupLookup'].format(rcode, regressionregion);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.statisticsGroupList = [];
                this.loadingStatisticsGroup = true;
                this.Execute(request).then(function (response) {
                    console.log(response.data);
                    if (response.data.length > 0) {
                        _this.loadingStatisticsGroup = false;
                        var statisticsGroupList = _this.statisticsGroupList;
                        angular.forEach(response.data, function (value, key) {
                            statisticsGroupList.push(value);
                        });
                    }
                    //console.log(statisticsGroupList);
                    //sm when complete
                }, function (error) {
                    //sm when complete
                }).finally(function () {
                    _this.toaster.clear();
                    _this.loadingStatisticsGroup = false;
                });
            };
            nssService.prototype.loadParametersByStatisticsGroup = function (rcode, statisticsGroupID, regressionregion) {
                var _this = this;
                this.toaster.pop('info', "Load Parameters by Scenario", "Please wait...", 999999);
                //var deferred = ng.IQService.defer();
                console.log('in load StatisticsGroup parameters', rcode, statisticsGroupID, regressionregion);
                if (!rcode && !statisticsGroupID && !regressionregion)
                    return;
                var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupParameterLookup'].format(rcode, statisticsGroupID, regressionregion);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.selectedStatisticsGroupParameterList = [];
                this.Execute(request).then(function (response) {
                    if (response.data[0].RegressionRegions[0].Parameters && response.data[0].RegressionRegions[0].Parameters.length > 0) {
                        _this.selectedStatisticsGroupScenario = response.data;
                        response.data[0].RegressionRegions[0].Parameters.map(function (item) {
                            try {
                                //console.log(item);
                                _this.selectedStatisticsGroupParameterList.push(item);
                            }
                            catch (e) {
                                alert(e);
                            }
                        });
                    }
                    //sm when complete
                }, function (error) {
                    //sm when complete
                }).finally(function () {
                    _this.toaster.clear();
                });
            };
            nssService.prototype.estimateFlows = function (studyAreaParameterList, rcode, statisticsGroupID, regressionregion) {
                var _this = this;
                this.toaster.pop('info', "Estimating Flows", "Please wait...", 999999);
                this.canUpdate = false;
                if (!studyAreaParameterList && !rcode && !statisticsGroupID && !regressionregion)
                    return;
                console.log('in estimate flows method');
                //swap out computed values in object
                this.selectedStatisticsGroupScenario[0].RegressionRegions[0].Parameters.map(function (val) {
                    angular.forEach(studyAreaParameterList, function (value, index) {
                        if (val.Code.toLowerCase() == value.code.toLowerCase()) {
                            console.log('updating parameter in scenario object for: ', val.Code, ' from: ', val.Value, ' to: ', value.value);
                            val.Value = value.value;
                        }
                    });
                });
                var updatedScenarioObject = JSON.stringify(this.selectedStatisticsGroupScenario, null);
                console.log('updated scenario object: ', updatedScenarioObject);
                //do request
                var url = configuration.baseurls['NSS'] + configuration.queryparams['estimateFlows'].format(rcode, statisticsGroupID, regressionregion);
                var request = new WiM.Services.Helpers.RequestInfo(url, true, 1, 'json', updatedScenarioObject);
                this.selectedStatisticsGroupScenarioResults = [];
                this.Execute(request).then(function (response) {
                    if (response.data[0].RegressionRegions[0].Results && response.data[0].RegressionRegions[0].Results.length > 0) {
                        response.data[0].RegressionRegions[0].Results.map(function (item) {
                            try {
                                _this.selectedStatisticsGroupScenarioResults.push(item);
                            }
                            catch (e) {
                                alert(e);
                            }
                        });
                    }
                    //sm when complete
                }, function (error) {
                    //sm when complete
                }).finally(function () {
                    _this.toaster.clear();
                    _this.canUpdate = true;
                });
            };
            return nssService;
        })(WiM.Services.HTTPServiceBase); //end class
        factory.$inject = ['$http', '$q', 'toaster'];
        function factory($http, $q, toaster) {
            return new nssService($http, $q, toaster);
        }
        angular.module('StreamStats.Services').factory('StreamStats.Services.nssService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {})); //end module  
//# sourceMappingURL=nssService.js.map