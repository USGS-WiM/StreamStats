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

// Class
module WiM.Models {
    export interface IParameter {
        name: string;
        code: string;
        unit: string;
        value: number;
    }
    class Parameter implements IParameter {
        //Properties
        public name: string;
        public value: number;
        public description: string;
        public unit: string;
        public code: string;
        public limits: Limit

        // Constructor
        constructor(n: string, v: number, c: string, d: string, u: string, limit: Limit) {
            this.name = n;
            this.value = v;
            this.code = c;
            this.unit = u;
            this.description = d;
            this.limits = limit;
        }//end constructor

        public static FromJSON(obj: Object): Parameter {
            var name: string = obj.hasOwnProperty("name") ? obj["name"] : "---";
            var descr: string = obj.hasOwnProperty("description") ? obj["description"] : "---";
            var code: string = obj.hasOwnProperty("code") ? obj["code"] : "---";
            var unit: string = obj.hasOwnProperty("unit") ? obj["unit"] : "---";
            var value: number = obj.hasOwnProperty("value") ? obj["value"] : -999;

            var limit: Limit = obj.hasOwnProperty("limits") && obj["limits"] != null ? Limit.FromJSON(obj["limits"]) : null;

            return new Parameter(name, value, code, descr, unit, limit);
        }//end FromJSON

    }//end class

    // Class
    class Limit {
        //Properties
        public min: number;
        public max: number;

        // Constructor
        constructor(min: number, max: number) {
            this.min = min;
            this.max = max;
        }

        public static FromJSON(obj: Object): Limit {

            var min: number = obj.hasOwnProperty("min") ? obj["min"] : -999;
            var max: number = obj.hasOwnProperty("max") ? obj["max"] : -999;

            return new Limit(min, max);
        }//end FromJSON

    }//end class
}//end module