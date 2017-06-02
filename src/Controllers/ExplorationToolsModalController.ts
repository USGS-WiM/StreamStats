//------------------------------------------------------------------------------
//----- ExplorationToolsModalController ----------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2016 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  Example of Modal Controller
//          
//discussion:


//Comments
//04.24.2017 mjs - Created

//Import

module StreamStats.Controllers {
    'use string';
    interface IExplorationToolsModalControllerScope extends ng.IScope {
        vm: IExplorationToolsModalController;
    }
    interface IModal {
        close(): void
    }
    interface IExplorationToolsModalController extends IModal {
    }
    class ExplorationToolsModalController implements IExplorationToolsModalController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        private explorationService: Services.IExplorationService;
        public sce: any;
        public angulartics: any;
        public print: any;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$analytics', '$sce', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.ExplorationService'];
        constructor($scope: IExplorationToolsModalControllerScope, $analytics, $sce: any, modal: ng.ui.bootstrap.IModalServiceInstance, modalservice: Services.IModalService, exploration: Services.IExplorationService) {
            $scope.vm = this;
            this.sce = $sce;
            this.angulartics = $analytics;
            this.modalInstance = modal;
            this.explorationService = exploration;

            this.print = function () {
                window.print();
            };
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public close(): void {
            this.explorationService.showElevationChart = false;
            this.modalInstance.dismiss('cancel')
        }

        public convertUnsafe(x: string) {
            return this.sce.trustAsHtml(x);
        }

        private downloadCSV() {

            //ga event
            this.angulartics.eventTrack('Download', { category: 'ElevationProfile', label: 'CSV' });

            var filename = 'elevation-profile.csv';


            //main file header with site information
            var csvFile = 'long,lat,elevation(feet),distance(feet)\r\n';

            //write out values
            this.explorationService.coordinateList.forEach((value) => {
                csvFile += value.join(',') + '\r\n';
            });
            

            //download
            var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
            if (navigator.msSaveBlob) { // IE 10+
                navigator.msSaveBlob(blob, filename);
            } else {
                var link = <any>document.createElement("a");
                var url = URL.createObjectURL(blob);
                if (link.download !== undefined) { // feature detection
                    // Browsers that support HTML5 download attribute
                    link.setAttribute("href", url);
                    link.setAttribute("download", filename);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                else {
                    window.open(url);
                }
            }

        }
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-

    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.ExplorationToolsModalController', ExplorationToolsModalController);
}//end module 