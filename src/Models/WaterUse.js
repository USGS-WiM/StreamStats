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
var StreamStats;
(function (StreamStats) {
    var Models;
    (function (Models) {
        var MonthlyWU = (function () {
            function MonthlyWU() {
                this.Fields = [];
                this.WaterUse = [];
                for (var i = 0; i < 12; i++) {
                    this.WaterUse[i] = [];
                }
            }
            return MonthlyWU;
        })();
        var WaterUse = (function () {
            function WaterUse() {
            }
            WaterUse.FromJson = function (json) {
                var newWU = new WaterUse();
                newWU.Withdrawals = Withdrawals.FromJson(json);
                newWU.Returns = null;
                return newWU;
            };
            return WaterUse;
        })();
        Models.WaterUse = WaterUse; //end class
        var Withdrawals = (function () {
            function Withdrawals() {
            }
            Withdrawals.FromJson = function (json) {
                var newWithdrwl = new Withdrawals();
                newWithdrwl.Annual = json.hasOwnProperty("AveWithdrawals") ? json["AveWithdrawals"] : null;
                newWithdrwl.AnnualSW = json.hasOwnProperty("AveSWWithdrawals") ? json["AveSWWithdrawals"] : null;
                newWithdrwl.AnnualGW = json.hasOwnProperty("AveGWWithdrawals") ? json["AveGWWithdrawals"] : null;
                if (json.hasOwnProperty("DailyMonthlyAveWithdrawalsByCode"))
                    newWithdrwl.loadWithdrawalsByCode(json["DailyMonthlyAveWithdrawalsByCode"]);
                return newWithdrwl;
            };
            Withdrawals.prototype.loadWithdrawalsByCode = function (Withdrawal) {
                var _this = this;
                this.Monthly = new MonthlyWU();
                Withdrawal.forEach(function (item) {
                    _this.Monthly.Fields.push(item[0].name.slice(-2));
                    _this.Monthly.WaterUse[0].push(item[0]);
                    _this.Monthly.WaterUse[1].push(item[1]);
                    _this.Monthly.WaterUse[2].push(item[2]);
                    _this.Monthly.WaterUse[3].push(item[3]);
                    _this.Monthly.WaterUse[4].push(item[4]);
                    _this.Monthly.WaterUse[5].push(item[5]);
                    _this.Monthly.WaterUse[6].push(item[6]);
                    _this.Monthly.WaterUse[7].push(item[7]);
                    _this.Monthly.WaterUse[8].push(item[8]);
                    _this.Monthly.WaterUse[9].push(item[9]);
                    _this.Monthly.WaterUse[10].push(item[10]);
                    _this.Monthly.WaterUse[11].push(item[11]);
                }); //next item  
            };
            return Withdrawals;
        })();
        Models.Withdrawals = Withdrawals; //end class
    })(Models = StreamStats.Models || (StreamStats.Models = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=WaterUse.js.map