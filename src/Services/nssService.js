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
        var Scenario = (function () {
            function Scenario() {
            }
            return Scenario;
        })();
        Services.Scenario = Scenario; //end class
        var nssService = (function (_super) {
            __extends(nssService, _super);
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function nssService($http, $q) {
                _super.call(this, $http, configuration.baseurls['NSS']);
                this.$q = $q;
                this._onSelectedScenarioChanged = new WiM.Event.Delegate();
                this.scenarioList = [];
                this.selectedScenarioParameterList = [];
            }
            Object.defineProperty(nssService.prototype, "onSelectedScenarioChanged", {
                get: function () {
                    return this._onSelectedScenarioChanged;
                },
                enumerable: true,
                configurable: true
            });
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            nssService.prototype.loadScenariosByRegion = function (regionid) {
                var _this = this;
                console.log('in load scenarios', regionid);
                if (!regionid)
                    return;
                var url = configuration.baseurls['NSS'] + configuration.queryparams['scenarioLookup'].format(regionid);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    //console.log(response.data);
                    var scenarioList = _this.scenarioList;
                    angular.forEach(response.data, function (value, key) {
                        scenarioList.push(value);
                    });
                    //console.log(scenarioList);
                    //sm when complete
                }, function (error) {
                    //sm when complete
                }).finally(function () {
                });
            };
            nssService.prototype.loadParametersByScenario = function (modeltype, regionid) {
                var _this = this;
                //var deferred = ng.IQService.defer();
                console.log('in load scenario parameters', regionid);
                if (!regionid && !modeltype)
                    return;
                var url = configuration.baseurls['NSS'] + configuration.queryparams['scenarioService'].format(modeltype, regionid);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.selectedScenarioParameterList = [];
                this.Execute(request).then(function (response) {
                    if (response.data.Parameters && response.data.Parameters.length > 0) {
                        response.data.Parameters.map(function (item) {
                            try {
                                //console.log(item);
                                _this.selectedScenarioParameterList.push(item);
                            }
                            catch (e) {
                                alert(e);
                            }
                            //return this.selectedScenarioParameterList;
                        });
                    }
                    /*
                        angular.forEach(response.data.Parameters, function (value, key) {
                            value.selected = true;
                            this.selectedScenarioParameterList.push(value);
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