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
    
    // Name: string
    // Value: number
    // Unit: string
    // PIl: number
    // PIu: number
    // SEP: number
    

    export interface IEquationWeighting {
        Execute(): string;
    }
    
    export class EquationWeighting implements IEquationWeighting {
        //properties
        
        private _unit: string;
        public get unit(): string {
            return this._unit;
        }

        private _name: string
        public get name(): string {
            return this._name;
        }

        constructor(Name: string, Unit: string) {
            this._name = Name
            this._unit = Unit;
        }

        

        public Execute(): string {
            
            return 'test';
            
        }
        
        
        
 
    }//end class
}//end module 