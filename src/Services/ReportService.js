//------------------------------------------------------------------------------
//----- reportService -----------------------------------------------------
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
        var reportService = (function () {
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function reportService($modal) {
                this.modal = $modal;
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            reportService.prototype.openReport = function () {
                console.log('in report open function');
                var modalInstance = this.modal.open({
                    templateUrl: 'Views/reportview.html',
                    controller: 'StreamStats.Controllers.ReportController',
                    size: 'lg',
                    backdropClass: 'backdropZ',
                    windowClass: 'windowZ'
                });
            };
            return reportService;
        })(); //end class
        factory.$inject = ['$modal'];
        function factory($modal) {
            return new reportService($modal);
        }
        angular.module('StreamStats.Services').factory('StreamStats.Services.ReportService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {})); //end module  
//# sourceMappingURL=ReportService.js.map