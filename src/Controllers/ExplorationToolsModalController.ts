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
        private studyAreaService: Services.IStudyAreaService;
        public sce: any;
        public angulartics: any;
        public print: any;
        public selectedLimit: any;
        public selectedDirection: any;
        public selectedQuerySourceList: any;
        public DEMresolutionList: any;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$analytics', '$sce', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.ExplorationService', 'StreamStats.Services.StudyAreaService'];
        constructor($scope: IExplorationToolsModalControllerScope, $analytics, $sce: any, modal: ng.ui.bootstrap.IModalServiceInstance, modalservice: Services.IModalService, exploration: Services.IExplorationService, studyArea: Services.IStudyAreaService) {
            $scope.vm = this;
            this.sce = $sce;
            this.angulartics = $analytics;
            this.modalInstance = modal;
            this.explorationService = exploration;
            this.studyAreaService = studyArea;
            this.DEMresolutionList = ['FINEST','10m','30m','90m','1000m'];

            //init required values
            if (this.explorationService.selectedMethod.navigationInfo.configuration) {
                this.selectExclusiveOption('downstream', 'Direction');
                this.selectOption('flowline', 'Query Source');
                this.checkWorkspaceID();
            }
            
            this.print = function () {
                window.print();
            };
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public close(): void {
            this.explorationService.showElevationChart = false;
            this.explorationService.setMethod(0, {});
            this.modalInstance.dismiss('cancel');
        }

        public convertUnsafe(x: string) {
            return this.sce.trustAsHtml(x);
        }

        public selectElevationPoints() {
            this.modalInstance.dismiss('cancel');
            this.explorationService.selectElevationPoints = true;
        }

        public addExplorationPointFromPourpoint(lat, lng, crs) {
            this.explorationService.selectedMethod.addLocation(new WiM.Models.Point(lat, lng, crs));
        }

        private downloadCSV() {

            //ga event
            this.angulartics.eventTrack('Download', { category: 'ElevationProfile', label: 'CSV' });

            var filename = 'elevation-profile.csv';


            //main file header with site information
            var csvFile = 'long,lat,elevation(feet),distance(mi)\r\n';

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
                    //console.log('limit object:',limitObject)
                    this.explorationService.selectedMethod.navigationConfiguration.push(limitObject)
                }
            });
        }

        public selectExclusiveOption(option, configName) {

            //init selected direction
            this.selectedDirection = option;

            this.deleteConfig(configName);

            this.explorationService.selectedMethod.navigationInfo.configuration.forEach((item, key) => {
                if (item.name == configName) {
                    var configObject = JSON.parse(JSON.stringify(item));
                    configObject.value = option;
                    //console.log('adding selectExclusiveOption config object:', configObject)
                    this.explorationService.selectedMethod.navigationConfiguration.push(configObject)
                }
            });
        }

        public selectOption(option, configName) {

            //init list if it doesn't exist
            if (!this.selectedQuerySourceList) this.selectedQuerySourceList = [];

            var index = this.selectedQuerySourceList.indexOf(option);
            (index > -1) ? this.selectedQuerySourceList.splice(index,1) : this.selectedQuerySourceList.push(option)

            this.deleteConfig(configName);

            this.explorationService.selectedMethod.navigationInfo.configuration.forEach((item, key) => {
                if (item.name == configName) {
                    var configObject = JSON.parse(JSON.stringify(item));
                    configObject.value = this.selectedQuerySourceList;
                    //console.log('adding selectOption config object:', configObject)
                    this.explorationService.selectedMethod.navigationConfiguration.push(configObject)
                }
            });
        }

        public checkWorkspaceID() {

            if (this.studyAreaService.selectedStudyArea && this.studyAreaService.selectedStudyArea.WorkspaceID !== '') {

                //console.log('in exploration service we have a workspace:', this.studyAreaService.selectedStudyArea.WorkspaceID, this.explorationService.selectedMethod.navigationInfo.configuration);

                this.explorationService.selectedMethod.navigationInfo.configuration.forEach((item, key) => {
                    if (item.name == 'Limit') {
                        item.value.forEach((limit, key) => {
                            if (limit.name == 'Polygon geometry') {

                                //reset limit polygon with delineated basin
                                //console.log('in here', this.studyAreaService.selectedStudyArea, this.studyAreaService.selectedStudyArea.Features[1].feature.features[0].geometry)
                                limit.name = 'Polygon geometry from delineated watershed';
                                limit.value = this.studyAreaService.selectedStudyArea.Features[1].feature.features[0].geometry;
                            }
                        });
                    }
                });

                //if ((<Models.FlowPath>this.explorationService.selectedMethod).workspaceID !== '') (<Models.FlowPath>this.explorationService.selectedMethod).workspaceID = ''
                //else {
                //    (<Models.FlowPath>this.explorationService.selectedMethod).workspaceID = this.studyAreaService.selectedStudyArea.WorkspaceID;
                //    //this.toaster.pop("info", "Information", "Ensure your selected point resides within the basin", 5000);
                //}
            }    
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
                    //console.log('deleting:', item.name)
                    this.explorationService.selectedMethod.navigationConfiguration.splice(key, 1)
                }
            });
        }

    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.ExplorationToolsModalController', ExplorationToolsModalController);
}//end module 