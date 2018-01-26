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
        public selectedLimit: any;
        public selectedDirection: any;
        public selectedQuerySourceList: any;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$analytics', '$sce', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.ExplorationService'];
        constructor($scope: IExplorationToolsModalControllerScope, $analytics, $sce: any, modal: ng.ui.bootstrap.IModalServiceInstance, modalservice: Services.IModalService, exploration: Services.IExplorationService) {
            $scope.vm = this;
            this.sce = $sce;
            this.angulartics = $analytics;
            this.modalInstance = modal;
            this.explorationService = exploration;

            //init required values
            this.selectedDirection = 'downstream';
            this.selectedQuerySourceList = ['flowline'];
            this.selectExclusiveOption(this.selectedDirection, 'Direction');
            this.selectOption(this.selectedQuerySourceList[0], 'Query Source');
            
            this.print = function () {
                window.print();
            };
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public close(): void {
            this.explorationService.showElevationChart = false;
            this.modalInstance.dismiss('cancel');
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

        public addLimit(item) {
            
            this.selectedLimit = item;

            this.deleteConfig('Limit');

            //add limit object
            this.explorationService.selectedMethod.navigationInfo.configuration.forEach((item, key) => {
                if (item.name == 'Limit') {

                    var limitObject = JSON.parse(JSON.stringify(item));
                    limitObject.value = this.selectedLimit;
                    console.log('limit object:',limitObject)
                    this.explorationService.selectedMethod.navigationConfiguration.push(limitObject)
                }
            });
        }

        public selectExclusiveOption(option, configName) {

            this.selectedDirection = option;

            this.deleteConfig(configName);

            this.explorationService.selectedMethod.navigationInfo.configuration.forEach((item, key) => {
                if (item.name == configName) {

                    var configObject = JSON.parse(JSON.stringify(item));
                    configObject.value = option;
                    console.log('adding selectExclusiveOption config object:', configObject)
                    this.explorationService.selectedMethod.navigationConfiguration.push(configObject)
                }
            });
        }

        public selectOption(option, configName) {

            console.log('in selection option', option, configName, this.selectedQuerySourceList)

            var index = this.selectedQuerySourceList.indexOf(option);
            if (index > -1) {
                this.selectedQuerySourceList.splice(index,1)
            }
            else this.selectedQuerySourceList.push(option)

            this.deleteConfig(configName);

            this.explorationService.selectedMethod.navigationInfo.configuration.forEach((item, key) => {
                if (item.name == configName) {

                    var configObject = JSON.parse(JSON.stringify(item));
                    configObject.value = option;
                    console.log('adding selectOption config object:', configObject)
                    this.explorationService.selectedMethod.navigationConfiguration.push(configObject)
                }
            });
        }

        public ExecuteNav(): void {

            //validate request
            if (this.explorationService.selectedMethod.navigationPointCount != this.explorationService.selectedMethod.minLocations) {
                //this.toaster.pop("warning", "Warning", "You must select at least " + this.explorationService.selectedMethod.minLocations + " points.", 10000);
                return;
            }
            var isOK: boolean = false;

            this.explorationService.explorationMethodBusy = true;

            this.explorationService.ExecuteSelectedModel();
        }
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-

        public deleteConfig(name) {

            //delete existing limit object
            this.explorationService.selectedMethod.navigationConfiguration.forEach((item, key) => {

                if (item.name == name) {
                    console.log('deleting:', item.name)
                    this.explorationService.selectedMethod.navigationConfiguration.splice(key, 1)
                }
            });
        }

        public checkLimit(name, config) {
            

            config.forEach((item, key) => {
                console.log('checking1', item.name, item.value.name, name)
                if (item.name == 'Limit' && item.value.name == name) {
                    console.log('FOUND:', item.name, name)
                    return true;
                }
            });

            return false;
        }

        public configExists(name, config) {
            console.log('checking1',name,config)
            for (var i = 0; i < config.length; i++) {
                if (config[i].name === name) {
                    console.log('checking:', config[i].name, name)
                    return true;
                }
            }

            return false;
        }

    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.ExplorationToolsModalController', ExplorationToolsModalController);
}//end module 