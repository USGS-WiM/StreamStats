//------------------------------------------------------------------------------
//----- StudyAreaService -------------------------------------------------------
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
//Comments
//04.15.2015 jkn - Created
//Import
var StreamStats;
(function (StreamStats) {
    var Services;
    (function (Services) {
        'use strict';
        var StudyAreaService = (function () {
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function StudyAreaService(streamStatsService) {
                this.streamStatsService = streamStatsService;
            }
            return StudyAreaService;
        })(); //end class
        factory.$inject = ['StreamStats.Services.StreamStatsService'];
        function factory(streamStatsService) {
            return new StudyAreaService(streamStatsService);
        }
        angular.module('StreamStats.Services').factory('StreamStats.Services.StudyAreaService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {})); //end module
//# sourceMappingURL=StudyAreaService.js.map