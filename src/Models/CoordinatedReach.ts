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
        readonly streamID: string;
        readonly streamName: string;
        readonly basinName: string;
        readonly eqID: string;
        readonly FlowCoefficients: { [code: string]: ICoordReachCoeff; }; 
        readonly label: string;
        AddFlowCoefficient(code: string, aCoeff: number, bCoeff: number): void
        Execute(parameters: Array<Services.IParameter>): Services.IRegressionRegion
    }
    export class CoordinatedReach implements ICoordinatedReach {
        //properties
        private _flowCoefficients:{ [code: string]: ICoordReachCoeff; };
        public get FlowCoefficients(): { [code: string]: ICoordReachCoeff; } {
            return this._flowCoefficients;
        }
        private _basinName: string;
        public get basinName(): string {
            return this._basinName;
        }
        private _eqID: string
        public get eqID(): string {
            return this._eqID;
        }

        private _streamID: string
        public get streamID(): string {
            return this._streamID;
        }

        private _streamName: string
        public get streamName(): string {
            return this._streamName;
        }

        private _label: string
        public get label(): string {
            return this._label;
        }
 
        constructor(basinName: string, eqID: string, streamName: string, streamID: string) {
            this._label = "Coordinated Reach - Stream ID: " + streamID + ", Stream Name: " + streamName + ", Basin Name: " + basinName
            this._basinName = basinName;
            this._eqID = eqID;
            this._streamName = streamName;
            this._streamID = streamID;
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
                    code: parameters[0].code,
                    value: parameters[0].value,
                    name: parameters[0].name,
                    unitType: { abbr: parameters[0].unit, unit: parameters[0].unit }
                });

                //http://www.in.gov/dnr/water/4898.htm
                for (var key in this.FlowCoefficients) {
                    params.push({
                        code: key + "CoeffA",
                        value: Number(this.FlowCoefficients[key].CoefficientA).toFixed(3),
                        name: key + " CoefficientA",
                        unitType: { abbr: "dim", unit: "dimensionless" }
                    })
                    params.push({
                        code: key + "CoeffB",
                        value: Number(this.FlowCoefficients[key].CoefficientB).toFixed(3),
                        name: key + " CoefficientB",
                        unitType: { abbr: "dim", unit: "dimensionless" }
                    })
                }//next key
              

                var ssg: Services.IRegressionRegion = {
                    id: 0,
                    name: this.label,
                    code: this.eqID,
                    parameters: params, 
                    results:result
                }

                return ssg;
            } catch (e) {
                console.log(e)
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
                if (item.CoefficientA || item.CoefficientA === 0 || item.CoefficientB || item.CoefficientB === 0 || drnArea) {
                    return item.CoefficientA * drnArea ** item.CoefficientB; //** is equivalent to Math.pow
                } else {
                    return null 
                }
            } catch (e) {
                return null;
            }
        }
 
    }//end class
}//end module 