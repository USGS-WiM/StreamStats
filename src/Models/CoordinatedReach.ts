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
    export interface ICoordReachCoeff {       
        // 03353700
        CoefficientA: number
        CoefficientB: number
    }
    export interface ICoordinatedReach {
        readonly Name: string;
        readonly ID: string;
        readonly FlowCoefficients: { [code: string]: ICoordReachCoeff; }; 
        AddFlowCoefficient(code: string, aCoeff: number, bCoeff: number): void
        Execute(parameters: Array<Services.IParameter>): Services.IRegressionRegion
    }
    export class CoordinatedReach implements ICoordinatedReach {
        //properties
        private _flowCoefficients:{ [code: string]: ICoordReachCoeff; };
        public get FlowCoefficients(): { [code: string]: ICoordReachCoeff; } {
            return this._flowCoefficients;
    }
        private _name: string;
        public get Name(): string {
            return this._name;
        }
        private _id: string
        public get ID(): string {
            return this._id;
        }
 
        constructor(name: string, id: string) {
            this._name = "Coordinated Reach: " +name;
            this._id = id;
            this._flowCoefficients = {};
        }

        public AddFlowCoefficient(code: string, aCoeff:number, bCoeff:number) {
            if (this._flowCoefficients[code] === null) return;

            this._flowCoefficients[code] = {CoefficientA:aCoeff, CoefficientB:bCoeff}
        }

        public Execute(parameters: Array<Services.IParameter>): Services.IRegressionRegion {
            try {

                var result: Array<Services.IRegressionResult> =[];

                for (var key in this.FlowCoefficients) {
                    if (this.FlowCoefficients.hasOwnProperty(key)){
                        var item = this.FlowCoefficients[key];

                        result.push({
                            code: key,
                            description: this.getDescription(key),
                            name: this.getName(key),
                            unit: { unit: "cubic feet per second", abbr: "ft^3/s" },
                            value: this.getValue(item,parameters[0].value)
                        });
                    }//end if
                }//next item

                var params = []
                params.push({
                    Code: parameters[0].code,
                    Value: parameters[0].value,
                    Name: parameters[0].name,
                    UnitType: { Abbr: parameters[0].unit, Unit: parameters[0].unit }
                });

                //http://www.in.gov/dnr/water/4898.htm
                for (var key in this.FlowCoefficients) {
                    params.push({
                        Code: key + "CoeffA",
                        Value: this.FlowCoefficients[key].CoefficientA.toFixed(3),
                        Name: key + " CoefficientA",
                        UnitType: { Abbr: "dim", Unit: "dimensionless" }
                    })
                    params.push({
                        Code: key + "CoeffB",
                        Value: this.FlowCoefficients[key].CoefficientB.toFixed(3),
                        Name: key + " CoefficientB",
                        UnitType: { Abbr: "dim", Unit: "dimensionless" }
                    })
                }//next key
              

                var ssg: Services.IRegressionRegion = {
                    id: 0,
                    name: this.Name,
                    code: this.ID,
                    parameters: params, 
                    results:result
                }

                return ssg;
            } catch (e) {
                return null;
            }
        }
        private getDescription(key: string): string {
            var result:string=""
            switch (key) {
                case "PK10": result = "10"; break;
                case "PK25": result = "25"; break;
                case "PK50": result = "50"; break;
                case "PK100": result = "100"; break;
                case "PK200": result = "200"; break;
                case "PK500": result = "500"; break;
                default: result = "undefined" 
            }
            return "Maximum instantaneous flow that occurs on average once in {0} years".format(result);
        }
        private getName(key: string): string {
            var result: string = ""
            switch (key) {
                case "PK10": result = "10"; break;
                case "PK25": result = "25"; break;
                case "PK50": result = "50"; break;
                case "PK100": result = "100"; break;
                case "PK200": result = "200"; break;
                case "PK500": result = "500"; break;
                default: result = "undefined"
            }
            return "{0} year Peak Flood".format(result);
        }
        private getValue(item: ICoordReachCoeff, drnArea: number): number {
             //compute flow = acoeff*DRNArea^bcoeff
            try {
                if (!item.CoefficientA || !item.CoefficientB || !drnArea) return null;
                return item.CoefficientA * drnArea ** item.CoefficientB; //** is equivalent to Math.pow
            } catch (e) {
                return null;
            }
        }
 
    }//end class
}//end module 