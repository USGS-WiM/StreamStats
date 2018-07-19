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
            Object.defineProperty(ProsperController.prototype, "description", {
                get: function () {
                    return "The U.S. Geological Survey (USGS) has developed the PRObability of Streamflow PERmanence (PROSPER) model, a GIS raster-based empirical model that provides streamflow permanence probabilities (probabilistic predictions) of a stream channel having year-round flow for any unregulated and minimally-impaired stream channel in the Pacific Northwest region, U.S. The model provides annual predictions for 2004-2016 at a 30-m spatial resolution based on monthly or annually updated values of climatic conditions and static physiographic variables associated with the upstream basin (Raw streamflow permanence probability rasters). Predictions correspond to pixels on the channel network consistent with the medium resolution National Hydrography Dataset channel network stream grid. Probabilities were converted to wet and dry streamflow permanence classes (Categorical wet/dry rasters) with an associated confidence (Threshold and confidence interval rasters).";
                },
                enumerable: true,
                configurable: true
            });
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