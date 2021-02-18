var StreamStats;
(function (StreamStats) {
    var Models;
    (function (Models) {
        var ReferenceGage = (function () {
            function ReferenceGage(id, name) {
                this.StationID = id;
                this.Name = name;
            }
            return ReferenceGage;
        }());
        Models.ReferenceGage = ReferenceGage;
    })(Models = StreamStats.Models || (StreamStats.Models = {}));
})(StreamStats || (StreamStats = {}));
