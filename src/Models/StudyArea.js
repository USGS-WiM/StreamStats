//------------------------------------------------------------------------------
//----- Point ------------------------------------------------------------------
//------------------------------------------------------------------------------
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2014 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:
//
//Comments
//08.20.2014 jkn - Created
//Imports"
// Interface\
var StreamStats;
(function (StreamStats) {
    var Models;
    (function (Models) {
        var StudyArea = /** @class */ (function () {
            function StudyArea(region, point) {
                this.RegionID = region;
                this.Pourpoint = point;
                this.CoordinatedReach = null;
                this.ActiveExtension = [];
            }
            return StudyArea;
        }()); //end class
        Models.StudyArea = StudyArea;
    })(Models = StreamStats.Models || (StreamStats.Models = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=StudyArea.js.map