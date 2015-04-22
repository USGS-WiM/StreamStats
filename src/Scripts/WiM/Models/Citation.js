//------------------------------------------------------------------------------
//----- Table ---------------------------------------------------------------
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
// Interface
var WiM;
(function (WiM) {
    var Models;
    (function (Models) {
        var Citation = (function () {
            // Constructor
            function Citation(title, author, imageSrc, url) {
                this.Title = title;
                this.Author = author;
                this.imgSrc = imageSrc;
                this.src = url;
            } //end constructor
            Citation.FromJSON = function (obj) {
                var Title = obj.hasOwnProperty("title") ? obj["title"] : "--";
                var Author = obj.hasOwnProperty("author") ? obj["author"] : "";
                var imgSrc = obj.hasOwnProperty("imgeSrc") ? obj["imgeSrc"] : "";
                var src = obj.hasOwnProperty("src") ? obj["src"] : "";
                return new Citation(Title, Author, imgSrc, src);
            }; //end FromJSON
            return Citation;
        })(); //end class
    })(Models = WiM.Models || (WiM.Models = {}));
})(WiM || (WiM = {})); //end module
//# sourceMappingURL=Citation.js.map