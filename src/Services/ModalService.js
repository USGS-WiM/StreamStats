//------------------------------------------------------------------------------
//----- reportService -----------------------------------------------------
//------------------------------------------------------------------------------
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2015 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  The service agent is responsible for initiating service calls, 
//             capturing the data that's returned and forwarding the data back to 
//             the Controller.
//          
//discussion:
//
//https://docs.angularjs.org/api/ng/service/$http
//Comments
//06.16.2015 mjs - Created
//Import
var StreamStats;
(function (StreamStats) {
    var Services;
    (function (Services) {
        'use strict';
        var ModalService = (function () {
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function ModalService($modal) {
                this.modal = $modal;
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ModalService.prototype.openReport = function (mType) {
                //console.log('in report open function');
                this.modal.open(this.getModalSettings(mType));
            };
            //HelperMethods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ModalService.prototype.getModalSettings = function (mType) {
                //console.log('in canUpdateProcedure');
                //Project flow:
                var msg;
                try {
                    switch (mType) {
                        case SSModalType.e_report:
                            return {
                                templateUrl: 'Views/reportview.html',
                                controller: 'StreamStats.Controllers.ReportController',
                                size: 'lg',
                                backdropClass: 'backdropZ',
                                windowClass: 'windowZ',
                            };
                        case SSModalType.e_wateruse:
                            return {
                                templateUrl: 'Views/wateruse.html',
                                controller: 'StreamStats.Controllers.WateruseController',
                                size: 'lg',
                                backdropClass: 'backdropZ',
                                backdrop: 'static',
                                windowClass: 'windowZ'
                            };
                        default:
                            return false;
                    } //end switch          
                }
                catch (e) {
                    //this.sm(new MSG.NotificationArgs(e.message, MSG.NotificationType.INFORMATION, 1.5));
                    return false;
                }
            };
            return ModalService;
        })(); //end class
        (function (SSModalType) {
            SSModalType[SSModalType["e_report"] = 1] = "e_report";
            SSModalType[SSModalType["e_wateruse"] = 2] = "e_wateruse";
            SSModalType[SSModalType["e_about"] = 3] = "e_about";
            SSModalType[SSModalType["e_help"] = 4] = "e_help";
        })(Services.SSModalType || (Services.SSModalType = {}));
        var SSModalType = Services.SSModalType;
        factory.$inject = ['$modal'];
        function factory($modal) {
            return new ModalService($modal);
        }
        angular.module('StreamStats.Services')
            .factory('StreamStats.Services.ModalService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {})); //end module  
//# sourceMappingURL=ModalService.js.map