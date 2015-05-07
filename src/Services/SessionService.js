//------------------------------------------------------------------------------
//----- DelineationService -----------------------------------------------------
//------------------------------------------------------------------------------
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2015 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  The service agent is responsible for initiating service calls, 
//             capturing the data that's returned and forwarding the data back to 
//             the ViewModel.
//          
//discussion:
//
//https://docs.angularjs.org/api/ng/service/$http
//Comments
//03.26.2015 jkn - Created
//Import
var StreamStats;
(function (StreamStats) {
    var Services;
    (function (Services) {
        'use strict';
        var SessionService = (function () {
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function SessionService() {
                this._onSelectedAreaOfInterestChanged = new WiM.Event.Delegate();
            }
            Object.defineProperty(SessionService.prototype, "onSelectedAreaOfInterestChanged", {
                get: function () {
                    return this._onSelectedAreaOfInterestChanged;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SessionService.prototype, "selectedAreaOfInterest", {
                get: function () {
                    return this._selectedAreaOfInterest;
                },
                set: function (val) {
                    if (this._selectedAreaOfInterest !== val) {
                        this._selectedAreaOfInterest = val;
                        this._onSelectedAreaOfInterestChanged.raise(null, WiM.Event.EventArgs.Empty);
                    }
                },
                enumerable: true,
                configurable: true
            });
            return SessionService;
        })(); //end class
        factory.$inject = [];
        function factory() {
            return new SessionService();
        }
        angular.module('StreamStats.Services').factory('StreamStats.Services.SessionService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {})); //end module
//# sourceMappingURL=SessionService.js.map