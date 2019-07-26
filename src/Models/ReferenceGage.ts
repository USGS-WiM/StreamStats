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
module StreamStats.Models {
    export interface IReferenceGage {
        StationID: string;
        Name: string;
        DrainageArea_sqMI: number;
        Latitude_DD: number;
        Longitude_DD: number;
        URL: string;
    }

    export class ReferenceGage implements IReferenceGage {
        //Properties
        public StationID: string;
        public Name: string;
        public DrainageArea_sqMI: number;
        public Latitude_DD: number;
        public Longitude_DD: number;
        public URL: string;
        public correlation: number;

        // Constructor
        constructor(id: string, name: string) {
            this.StationID = id;
            this.Name = name;
        }//end constructor 
    }//end class
}