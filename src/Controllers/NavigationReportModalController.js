var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use string';
        var NavigationReportModalController = (function () {
            function NavigationReportModalController($scope, $sce, modal, modalservice) {
                $scope.vm = this;
                this.sce = $sce;
                this.modalInstance = modal;
                this.pagecontent = modalservice.modalOptions.placeholder;
            }
            NavigationReportModalController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            NavigationReportModalController.prototype.convertUnsafe = function (x) {
                console.log('converting...');
                return this.sce.trustAsHtml(x);
            };
            NavigationReportModalController.prototype.replaceAll = function (str, find, replace) {
                return str.replace(new RegExp(find, 'g'), replace);
            };
            NavigationReportModalController.prototype.getOldGWWpage = function () {
                this.pagecontent = '';
            };
            NavigationReportModalController.$inject = ['$scope', '$sce', '$modalInstance', 'StreamStats.Services.ModalService'];
            return NavigationReportModalController;
        }());
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.NavigationReportModalController', NavigationReportModalController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
