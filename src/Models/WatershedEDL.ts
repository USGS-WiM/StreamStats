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
// Interface
module StreamStats.Models {
    export interface IEditDecisionList {
        append: Array<any>;
        remove: Array<any>;
    }

    export class WatershedEditDecisionList implements IEditDecisionList {
        //properties
        public append: Array<any>;
        public remove: Array<any>;

        constructor() {
            this.append = [];
            this.remove = [];
        }

    }//end class
}//end module 