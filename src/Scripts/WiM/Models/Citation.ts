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
module WiM.Models {
    export interface ICitation {
        Title: string;
        Author: string;
        imgSrc: string;
        src: string;
    }

    class Citation implements ICitation {
        //Properties
        Title: string;
        Author: string;
        imgSrc: string;
        src: string;

        // Constructor
        constructor(title: string, author: string, imageSrc: string, url: string) {
            this.Title = title;
            this.Author = author;
            this.imgSrc = imageSrc;
            this.src = url;
        }//end constructor

        public static FromJSON(obj: Object): Citation {
            var Title: string = obj.hasOwnProperty("title") ? obj["title"] : "--";
            var Author: string = obj.hasOwnProperty("author") ? obj["author"] : "";
            var imgSrc: string = obj.hasOwnProperty("imgeSrc") ? obj["imgeSrc"] : "";
            var src: string = obj.hasOwnProperty("src") ? obj["src"] : "";

            return new Citation(Title, Author, imgSrc, src);
        }//end FromJSON

    }//end class
}//end module