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
    export interface IStudyArea {
        RegionID: string;
        Pourpoint: WiM.Models.IPoint;
        Description: string;
        Basin: Object;
        Features: Array<any>;
        RegressionRegions: Array<any>;
        WorkspaceID: string;
        Server: string;
        Date: Date;
        Parameters: Array<WiM.Models.IParameter>;
        Disclaimers: Object;
    }

    export class StudyArea implements IStudyArea {
        //properties
        public RegionID: string;
        public Pourpoint: WiM.Models.IPoint;
        public Description: string;
        public Basin: Object;
        public Features: Array<any>;
        public RegressionRegions: Array<any>;
        public WorkspaceID: string;
        public Server: string
        public Date: Date;
        public Parameters: Array<WiM.Models.IParameter>;
        public Disclaimers: Object;
        //public Scenarios: Array<WiM.Models.IScenario>;

        constructor(region: string, point: WiM.Models.IPoint) {
            this.RegionID = region;
            this.Pourpoint = point;
        }

    }//end class
}//end module 