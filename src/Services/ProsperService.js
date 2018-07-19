//------------------------------------------------------------------------------
//----- ProsperService -------------------------------------------------------
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
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2018 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  The service agent is responsible for initiating service calls, 
//             capturing the data that's returned and forwarding the data back to 
//             the ViewModel.
//          
//discussion:
// using https://gis.usgs.gov/sciencebase2/rest/services/Catalog/5b416046e4b060350a125fe4/MapServer/legend?f=pjson
//Comments
//07.17.2018 jkn - Created
//Import
var StreamStats;
(function (StreamStats) {
    var Services;
    (function (Services) {
        'use strict';
        Services.onSelectedMethodExecuteComplete = "onProsperPredictionValues";
        var ProsperServiceEventArgs = (function (_super) {
            __extends(ProsperServiceEventArgs, _super);
            //properties            
            function ProsperServiceEventArgs() {
                return _super.call(this) || this;
            }
            return ProsperServiceEventArgs;
        }(WiM.Event.EventArgs));
        Services.ProsperServiceEventArgs = ProsperServiceEventArgs;
        var ProsperService = (function (_super) {
            __extends(ProsperService, _super);
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function ProsperService($http, $q, toaster, eventManager) {
                var _this = _super.call(this, $http, configuration.baseurls['ScienceBase']) || this;
                _this.$q = $q;
                _this.eventManager = eventManager;
                _this.toaster = toaster;
                _this.init();
                return _this;
            }
            Object.defineProperty(ProsperService.prototype, "selectedPredictions", {
                get: function () {
                    return this.availablePredictions.filter(function (f) { return f.selected; });
                },
                enumerable: true,
                configurable: true
            });
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ProsperService.prototype.ResetSelectedPredictions = function () {
                if (this.availablePredictions.length < 1)
                    return;
                this.availablePredictions.forEach(function (ap) { return ap.selected = false; });
            };
            ProsperService.prototype.GetPredictionValues = function () {
                //do something and raise event when done
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ProsperService.prototype.init = function () {
                this.loadAvailablePredictions();
            };
            ProsperService.prototype.loadAvailablePredictions = function () {
                var _this = this;
                try {
                    this.toaster.pop('wait', "Loading Available Prosper Predictions", "Please wait...", 0);
                    var url = configuration.queryparams['ProsperPredictions'] + "/legend?f=pjson";
                    var request = new WiM.Services.Helpers.RequestInfo(url);
                    this.Execute(request).then(function (response) {
                        if (response.data.error) {
                            //console.log('query error');
                            _this.toaster.pop('error', "There was an error querying prosper predictions", response.data.error.message, 0);
                            return;
                        }
                        var layers = response.data.layers;
                        if (layers.length > 0) {
                            _this.availablePredictions = layers.map(function (l) { return { id: l.layerId, name: l.layerName.replace(/\.[^/.]+$/, ""), selected: false }; });
                            _this.toaster.pop('success', "Selected reach is a coordinated reach", "Please continue", 5000);
                        }
                    }, function (error) {
                        //sm when complete
                        _this.toaster.pop('error', "There was an HTTP error querying coordinated reach", "Please retry", 0);
                    });
                }
                catch (e) {
                    console.log("There was an error requesting available prosper predictions." + e);
                }
            };
            return ProsperService;
        }(WiM.Services.HTTPServiceBase)); //end class
        factory.$inject = ['$http', '$q', 'toaster', 'WiM.Event.EventManager'];
        function factory($http, $q, toaster, eventmngr) {
            return new ProsperService($http, $q, toaster, eventmngr);
        }
        angular.module('StreamStats.Services')
            .factory('StreamStats.Services.ProsperService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=ProsperService.js.map