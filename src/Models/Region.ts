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
///<reference path="../Scripts/WiM/Models/Point.ts" />
// Interface
module StreamStats.Models {
    export interface IRegion {
        RegionID: string;
        Name: string;
    }

    export class Region implements IRegion {
        //properties
        public RegionID: string;
        public Name: string;

        constructor(id: string, name: string) {
            this.RegionID = id;
            this.Name = name;
        }

    }//end class
}//end module 