//------------------------------------------------------------------------------
//----- WaterUse ---------------------------------------------------------------
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
    export interface IWaterUse {
        Returns: Array<any>;
        Withdrawals: IWithdrawal;
    }
    export interface IWithdrawal {
        Annual: any;
        AnnualSW: any;
        AnnualGW: any;
        Monthly: any;
    }

    class MonthlyWU {
        Fields: Array<string>;
        WaterUse: Array<Array<any>>;
       
        public constructor() {
            this.Fields = [];
            this.WaterUse = [];
            for (var i = 0; i < 12; i++) {
                this.WaterUse[i] = [];
            }
            
    }

    }

    export class WaterUse implements IWaterUse {
        //properties
        public Returns: Array<any>;
        public Withdrawals: IWithdrawal;

        constructor() {
            
        }

        public static FromJson(json: any): IWaterUse {
            var newWU = new WaterUse();
            newWU.Withdrawals = Withdrawals.FromJson(json);
            newWU.Returns = null;
            return newWU;

        }

    }//end class

    export class Withdrawals implements IWithdrawal {
        //properties
        public Annual: any;
        public AnnualSW: any;
        public AnnualGW: any;
        public Monthly: MonthlyWU;

        constructor() {
        }

        public static FromJson(json: any): IWithdrawal {
            var newWithdrwl = new Withdrawals();
            newWithdrwl.Annual = json.hasOwnProperty("AveWithdrawals") ? json["AveWithdrawals"] : null;
            newWithdrwl.AnnualSW = json.hasOwnProperty("AveSWWithdrawals") ? json["AveSWWithdrawals"] : null;
            newWithdrwl.AnnualGW = json.hasOwnProperty("AveGWWithdrawals") ? json["AveGWWithdrawals"] : null;
            if(json.hasOwnProperty("DailyMonthlyAveWithdrawalsByCode")) newWithdrwl.loadWithdrawalsByCode(json["DailyMonthlyAveWithdrawalsByCode"]);

            return newWithdrwl;

        }
        public loadWithdrawalsByCode(Withdrawal: Array<any>): void {
            this.Monthly = new MonthlyWU();
            Withdrawal.forEach((item) => {
                this.Monthly.Fields.push(item[0].name.slice(-2))
                this.Monthly.WaterUse[0].push(item[0]);
                this.Monthly.WaterUse[1].push(item[1]);
                this.Monthly.WaterUse[2].push(item[2]);
                this.Monthly.WaterUse[3].push(item[3]);
                this.Monthly.WaterUse[4].push(item[4]);
                this.Monthly.WaterUse[5].push(item[5]);
                this.Monthly.WaterUse[6].push(item[6]);
                this.Monthly.WaterUse[7].push(item[7]);
                this.Monthly.WaterUse[8].push(item[8]);
                this.Monthly.WaterUse[9].push(item[9]);
                this.Monthly.WaterUse[10].push(item[10]);
                this.Monthly.WaterUse[11].push(item[11]);
            });//next item  
                                  
        }

    }//end class
}//end module 