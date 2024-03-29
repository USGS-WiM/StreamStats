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
        var TicketData = (function () {
            function TicketData() {
            }
            return TicketData;
        }());
        var HelpController = (function (_super) {
            __extends(HelpController, _super);
            function HelpController($scope, $http, $sce, studyAreaService, modal, Upload, modalService) {
                var _this = _super.call(this, $http, '') || this;
                _this.currentDate = new Date();
                $scope.vm = _this;
                _this.StudyArea = studyAreaService.selectedStudyArea;
                _this.Upload = Upload;
                _this.http = $http;
                _this.sce = $sce;
                _this.modalService = modalService;
                _this.modalInstance = modal;
                _this.StudyAreaService = studyAreaService;
                _this.StudyArea = studyAreaService.selectedStudyArea;
                _this.ticketData = new TicketData();
                _this.selectedHelpTabName = "help";
                _this.showSuccessAlert = false;
                _this.submittingSupportTicket = false;
                _this.init();
                return _this;
            }
            HelpController.prototype.Close = function () {
                this.showSuccessAlert = false;
                this.modalInstance.dismiss('cancel');
            };
            HelpController.prototype.convertUnsafe = function (x) {
                return this.sce.trustAsHtml(x);
            };
            ;
            HelpController.prototype.selectHelpTab = function (tabname) {
                if (this.selectedHelpTabName == tabname)
                    return;
                this.selectedHelpTabName = tabname;
            };
            HelpController.prototype.init = function () {
                this.AppVersion = configuration.version;
                if (this.StudyArea && this.StudyArea.WorkspaceID)
                    this.WorkspaceID = this.StudyArea.WorkspaceID;
                else
                    this.WorkspaceID = 'None';
                if (this.StudyArea && this.StudyArea.RegionID)
                    this.RegionID = this.StudyArea.RegionID;
                else
                    this.RegionID = 'None';
                if (this.StudyArea && this.StudyArea.Server)
                    this.Server = this.StudyArea.Server;
                else
                    this.Server = 'NA';
                if (this.modalService.modalOptions) {
                    if (this.modalService.modalOptions.tabName)
                        this.selectHelpTab(this.modalService.modalOptions.tabName);
                }
            };
            HelpController.$inject = ['$scope', '$http', '$sce', 'StreamStats.Services.StudyAreaService', '$modalInstance', 'Upload', 'StreamStats.Services.ModalService'];
            return HelpController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.HelpController', HelpController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
