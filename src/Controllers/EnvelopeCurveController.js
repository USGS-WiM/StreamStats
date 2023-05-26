var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use strict';
        var EnvelopeCurveController = (function () {
            function EnvelopeCurveController($scope, modal, $sce, pservices) {
                $scope.vm = this;
                this.sce = $sce;
                this.modalInstance = modal;
                this.init();
            }
            Object.defineProperty(EnvelopeCurveController.prototype, "Location", {
                get: function () {
                    return this._results.point;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(EnvelopeCurveController.prototype, "Date", {
                get: function () {
                    return this._results.date;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(EnvelopeCurveController.prototype, "Table", {
                get: function () {
                    return this._table;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(EnvelopeCurveController.prototype, "ResultsAvailable", {
                get: function () {
                    return this._resultsAvailable;
                },
                enumerable: false,
                configurable: true
            });
            EnvelopeCurveController.prototype.convertUnsafe = function (x) {
                return this.sce.trustAsHtml(x);
            };
            ;
            Object.defineProperty(EnvelopeCurveController.prototype, "Description", {
                get: function () {
                    var desc = "The PRObability of Streamflow PERmanence (PROSPER) model provides annual (2004-2016)" +
                        " streamflow permanence probabilities (SPPs; probabilistic predictions) and streamflow permanence" +
                        " classes (SPCs; categorical wet/ dry with an associated confidence level). Probabilities are of a stream" +
                        " channel having year- round flow at a 30- m spatial resolution. Model methods, output, and appropriate" +
                        " uses are detailed in Jaeger et al. (2018). Interpretation of a pixel as wet or dry will be based on" +
                        " combined consideration of the SPP, the sign of the SPC (negative for dry, positive for wet), and the" +
                        " associated confidence (1 - 5 representing 50% - 95 %). For example, predictions with a negative" +
                        " (positive) sign, high confidence level indicated by an SPC of - 5(5), and an SPP of less than (greater" +
                        " than) 0.5 will be the most reliable." +
                        "<a href = 'https://doi.org/10.1016/j.hydroa.2018.100005' target = '_blank' > Click here for more information.</a><br><br><b>Contact " +
                        "information:</b><br>Roy Sando<br>U.S. Geological Survey, Wyoming-Montana Water Science Center<br>Email: <a href='mailto:tsando@usgs.gov' target='_blank'>tsando@usgs.gov</a> <br>Phone: 406-457-5953";
                    return this.sce.trustAsHtml(desc);
                },
                enumerable: false,
                configurable: true
            });
            EnvelopeCurveController.prototype.init = function () {
            };
            EnvelopeCurveController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            EnvelopeCurveController.$inject = ['$scope', '$modalInstance', '$sce', 'StreamStats.Services.ProsperService'];
            return EnvelopeCurveController;
        }());
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.EnvelopeCurveController', EnvelopeCurveController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
