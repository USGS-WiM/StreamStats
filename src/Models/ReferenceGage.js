//------------------------------------------------------------------------------
//----- ReferenceGage ----------------------------------------------------------
//------------------------------------------------------------------------------
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2019 WiM - USGS
//    authors:  Jeremy K. Newson USGS Web Informatics and Mapping
//             
// 
//   purpose:  
//          
//discussion:
//
//Comments
//07.25.2019 jkn - Created
//Imports"
// Interface\
var StreamStats;
(function (StreamStats) {
    var Models;
    (function (Models) {
        var ReferenceGage = /** @class */ (function () {
            // Constructor
            function ReferenceGage(id, name) {
                this.StationID = id;
                this.Name = name;
            } //end constructor 
            return ReferenceGage;
        }()); //end class
        Models.ReferenceGage = ReferenceGage;
    })(Models = StreamStats.Models || (StreamStats.Models = {}));
})(StreamStats || (StreamStats = {}));
//# sourceMappingURL=ReferenceGage.js.map