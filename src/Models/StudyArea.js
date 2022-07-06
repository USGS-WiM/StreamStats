var StreamStats;
(function (StreamStats) {
    var Models;
    (function (Models) {
        var StudyArea = (function () {
            function StudyArea(region, point) {
                this.RegionID = region;
                this.Pourpoint = point;
                this.CoordinatedReach = null;
                this.NHDStream = null;
                this.ActiveExtension = [];
                this.NSS_Extensions = [];
            }
            return StudyArea;
        }());
        Models.StudyArea = StudyArea;
    })(Models = StreamStats.Models || (StreamStats.Models = {}));
})(StreamStats || (StreamStats = {}));
