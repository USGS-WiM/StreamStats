var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use string';
        var AboutController = (function (_super) {
            __extends(AboutController, _super);
            function AboutController($scope, $http, $sce, modalService, region, studyAreaService, modal) {
                var _this = _super.call(this, $http, configuration.baseurls.StreamStats) || this;
                $scope.vm = _this;
                _this.sce = $sce;
                _this.modalInstance = modal;
                _this.modalService = modalService;
                _this.StudyArea = studyAreaService.selectedStudyArea;
                _this.StudyAreaService = studyAreaService;
                _this.regionService = region;
                _this.selectedAboutTabName = "about";
                _this.selectedRegion = null;
                _this.init();
                return _this;
            }
            AboutController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            AboutController.prototype.selectAboutTab = function (tabname) {
                if (this.selectedAboutTabName == tabname)
                    return;
                this.selectedAboutTabName = tabname;
            };
            AboutController.prototype.getRegionHelpArticle = function () {
                var _this = this;
                var regionID;
                if (this.modalService.modalOptions) {
                    if (this.modalService.modalOptions.tabName)
                        this.selectAboutTab(this.modalService.modalOptions.tabName);
                    regionID = this.modalService.modalOptions.regionID;
                }
                if (this.regionService.selectedRegion)
                    regionID = this.regionService.selectedRegion.Name;
                if (!regionID)
                    return;
                configuration.regions.forEach(function (value) {
                    if (value.Name === regionID) {
                        _this.selectedRegion = value;
                    }
                });
            };
            AboutController.prototype.openSubmitSupport = function (e) {
                this.Close();
                e.stopPropagation();
                e.preventDefault();
                this.modalService.openModal(StreamStats.Services.SSModalType.e_help, { "tabName": "submitTicket" });
            };
            AboutController.prototype.init = function () {
                this.AppVersion = configuration.version;
                this.getRegionHelpArticle();
            };
            AboutController.$inject = ['$scope', '$http', '$sce', 'StreamStats.Services.ModalService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', '$modalInstance'];
            return AboutController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.AboutController', AboutController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
