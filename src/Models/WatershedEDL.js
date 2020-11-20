//------------------------------------------------------------------------------
//----- Point ------------------------------------------------------------------
//------------------------------------------------------------------------------
var StreamStats;
(function (StreamStats) {
    var Models;
    (function (Models) {
        var WatershedEditDecisionList = (function () {
            function WatershedEditDecisionList() {
                this.append = [];
                this.remove = [];
            }
            return WatershedEditDecisionList;
        })();
        Models.WatershedEditDecisionList = WatershedEditDecisionList;
    })(Models = StreamStats.Models || (StreamStats.Models = {}));
})(StreamStats || (StreamStats = {}));
