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
                this._onSelectedStatisticsGroupChanged = new WiM.Event.Delegate();
                this.clearNSSdata();
            }
            Object.defineProperty(nssService.prototype, "onSelectedStatisticsGroupChanged", {
                get: function () {
                    return this._onSelectedStatisticsGroupChanged;
                },
                enumerable: true,
                configurable: true
            });
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            nssService.prototype.clearNSSdata = function () {
                //console.log('in clear nss data');
                this.selectedStatisticsGroupList = [];
                this.statisticsGroupList = [];
                this.canUpdate = true;
                this.queriedRegions = false;
            };
            nssService.prototype.loadStatisticsGroupTypes = function (rcode, regressionregions) {
                var _this = this;
                this.toaster.pop('info', "Loading Available Scenarios", "Please wait...", 0);
                //console.log('in load StatisticsGroups', rcode, regressionregions);
                if (!rcode && !regressionregions)
                    return;
                var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupLookup'].format(rcode, regressionregions);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.loadingStatisticsGroup = true;
                this.Execute(request).then(function (response) {
                    //console.log(response.data);
                    if (response.data.length > 0) {
                        _this.loadingStatisticsGroup = false;
                        var statisticsGroupList = _this.statisticsGroupList;
                        angular.forEach(response.data, function (value, key) {
                            statisticsGroupList.push(value);
                        });
                    }
                    _this.toaster.clear();
                }, function (error) {
                    //sm when complete
                    _this.toaster.clear();
                    _this.toaster.pop('error', "There was an error Loading Available Scenarios", "Please retry", 5000);
                }).finally(function () {
                    _this.loadingStatisticsGroup = false;
                });
            };
            nssService.prototype.checkArrayForObj = function (arr, obj) {
                for (var i = 0; i < arr.length; i++) {
                    if (angular.equals(arr[i], obj)) {
                        return i;
                    }
                }
                ;
                return -1;
            };
            nssService.prototype.loadParametersByStatisticsGroup = function (rcode, statisticsGroupID, regressionregions, percentWeights) {
                var _this = this;
                this.toaster.pop('info', "Load Parameters by Scenario", "Please wait...", 0);
                //console.log('in load StatisticsGroup parameters', rcode, statisticsGroupID,regressionregions);
                if (!rcode && !statisticsGroupID && !regressionregions)
                    return;
                var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupParameterLookup'].format(rcode, statisticsGroupID, regressionregions);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    //console.log('loadParametersByStatisticsGroup response: ', response);
                    if (response.data[0].RegressionRegions[0].Parameters && response.data[0].RegressionRegions[0].Parameters.length > 0) {
                        //add Regression Regions to StatisticsGroupList and add percent weights
                        _this.selectedStatisticsGroupList.forEach(function (statGroup) {
                            if (response.data[0].StatisticGroupName == statGroup.Name) {
                                statGroup['StatisticGroupName'] = statGroup.Name;
                                statGroup['StatisticGroupID'] = statGroup.ID;
                                response.data[0].RegressionRegions.forEach(function (regressionRegion) {
                                    percentWeights.forEach(function (regressionRegionPercentWeight) {
                                        if (regressionRegion.Name == regressionRegionPercentWeight.name)
                                            regressionRegion["PercentWeight"] = regressionRegionPercentWeight.percent;
                                    });
                                });
                                statGroup.RegressionRegions = response.data[0].RegressionRegions;
                                _this._onSelectedStatisticsGroupChanged.raise(null, WiM.Event.EventArgs.Empty);
                            }
                        });
                    }
                    _this.toaster.clear();
                    //sm when complete
                }, function (error) {
                    //sm when error
                    _this.toaster.clear();
                    _this.toaster.pop('error', "There was an error Loading Parameters by Statistics Group", "Please retry", 5000);
                }).finally(function () {
                });
            };
            nssService.prototype.estimateFlows = function (studyAreaParameterList, rcode, regressionregion) {
                var _this = this;
                this.canUpdate = false;
                //loop over all selected StatisticsGroups
                this.selectedStatisticsGroupList.forEach(function (statGroup) {
                    _this.toaster.pop('info', "Estimating Flows for " + statGroup.Name, "Please wait...", 0);
                    //console.log('in estimate flows method for ', statGroup.Name, statGroup);
                    statGroup.RegressionRegions[0].Parameters.forEach(function (regressionParam) {
                        studyAreaParameterList.forEach(function (param) {
                            //console.log('search for matching params ', regressionParam.Code.toLowerCase(), param.code.toLowerCase());
                            if (regressionParam.Code.toLowerCase() == param.code.toLowerCase()) {
                                //console.log('updating parameter in scenario object for: ', regressionParam.Code, ' from: ', regressionParam.Value, ' to: ', param.value);
                                regressionParam.Value = param.value;
                            }
                        });
                    });
                    var updatedScenarioObject = angular.toJson([statGroup], null);
                    //do request
                    var url = configuration.baseurls['NSS'] + configuration.queryparams['estimateFlows'].format(rcode, statGroup.ID, regressionregion);
                    var request = new WiM.Services.Helpers.RequestInfo(url, true, 1, 'json', updatedScenarioObject);
                    statGroup.Results = [];
                    statGroup.Citations = [];
                    _this.Execute(request).then(function (response) {
                        if (response.data[0].RegressionRegions[0].Results && response.data[0].RegressionRegions[0].Results.length > 0) {
                            console.log('flows headers response: ', response, response.headers());
                            statGroup.ResultsHeaders = {};
                            if (response.headers()['usgswim-messages']) {
                                var headerMsgs = response.headers()['usgswim-messages'].split(';');
                                headerMsgs.forEach(function (item) {
                                    var headerMsg = item.split(':');
                                    if (headerMsg[0] == 'warning')
                                        statGroup.ResultsHeaders['Warnings'] = headerMsg[1].trim();
                                    if (headerMsg[0] == 'error')
                                        statGroup.ResultsHeaders['Error'] = headerMsg[1].trim();
                                    //comment out for not, not useful
                                    //if (headerMsg[0] == 'info') statGroup.ResultsHeaders['Info'] = headerMsg[1].trim();
                                });
                                console.log('headerMsgs: ', statGroup.Name, statGroup.ResultsHeaders);
                            }
                            console.log('flow response: ', response.data);
                            //get flows
                            response.data[0].RegressionRegions[0].Results.map(function (item) {
                                try {
                                    statGroup.Results.push(item);
                                }
                                catch (e) {
                                    alert(e);
                                }
                            });
                            //nested requests for citations
                            var citationUrl = response.data[0].Links[0].Href;
                            var citationResults = _this.getSelectedCitations(citationUrl, statGroup);
                        }
                        _this.toaster.clear();
                        //sm when complete
                    }, function (error) {
                        //sm when error
                        _this.toaster.clear();
                        _this.toaster.pop('error', "There was an error Estimating Flows", "Please retry", 5000);
                    }).finally(function () {
                        _this.canUpdate = true;
                    });
                });
            };
            nssService.prototype.getSelectedCitations = function (citationUrl, statGroup) {
                var _this = this;
                //nested requests for citations
                this.toaster.pop('info', "Requesting selected citations, Please wait...", 5000);
                var url = citationUrl;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, 0, 'json');
                this.Execute(request).then(function (response) {
                    if (response.data[0] && response.data[0].ID) {
                        statGroup.Citations.push(response.data[0]);
                    }
                    //sm when complete
                }, function (error) {
                    //sm when error
                    _this.toaster.clear();
                    _this.toaster.pop('error', "There was an error getting selected Citations", "Please retry", 5000);
                }).finally(function () {
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