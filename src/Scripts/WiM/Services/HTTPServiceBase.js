//------------------------------------------------------------------------------
//----- HTTPServiceBase ---------------------------------------------------------------
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
///<reference path="../../typings/angularjs/angular.d.ts" />
///<reference path="./Helpers/RequestInfo.ts" />
var WiM;
(function (WiM) {
    var Services;
    (function (Services) {
        'use strict';
        var HTTPServiceBase = (function () {
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function HTTPServiceBase(http, baseURL) {
                this.baseURL = baseURL;
                this.$http = http;
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            HTTPServiceBase.prototype.Execute = function (request) {
                request.url = this.baseURL + request.url;
                return this.$http(request);
            };
            return HTTPServiceBase;
        })();
        Services.HTTPServiceBase = HTTPServiceBase; //end class
    })(Services = WiM.Services || (WiM.Services = {}));
})(WiM || (WiM = {})); //end module 
//# sourceMappingURL=HTTPServiceBase.js.map