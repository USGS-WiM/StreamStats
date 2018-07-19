//------------------------------------------------------------------------------
//----- Prosper ----------------------------------------------------------------
//------------------------------------------------------------------------------
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2018 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:
//Comments
//07.17.2018 jkn - Created
//Import
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use strict';
        var ProsperController = (function () {
            function ProsperController($scope, modal, pservices) {
                $scope.vm = this;
                this.modalInstance = modal;
                this.init();
                this.prosperServices = pservices;
            }
            //Methods  
            //-+-+-+-+-+-+-+-+-+-+-+-
            ProsperController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            ProsperController.prototype.Reset = function () {
                this.init();
            };
            ProsperController.prototype.Print = function () {
                window.print();
            };
            ProsperController.prototype.DownloadCSV = function () {
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ProsperController.prototype.init = function () {
            };
            return ProsperController;
        }()); //end Controller class
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        ProsperController.$inject = ['$scope', '$modalInstance', 'StreamStats.Services.ProsperService'];
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.ProsperController', ProsperController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=ProsperController.js.map