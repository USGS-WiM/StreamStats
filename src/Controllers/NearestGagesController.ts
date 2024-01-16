//------------------------------------------------------------------------------
//----- NearestGages ---------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2021 WiM - USGS

//    authors:  Katrin E. Jacobsen USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:

//Import

module StreamStats.Controllers {
    'use strict';

    interface INearestGagesControllerScope extends ng.IScope {
        vm: INearestGagesController;
    }

    interface IModal {
        Close():void
    }
    
    interface INearestGagesController extends IModal {
    }

    class GageInfo {
        code: string;
        name: string;
        lat: number;
        lng: number;
        stationType: StationType;
        isRegulated: boolean;
        agency: Agency;
        characteristics: Array<GageCharacteristic>;
        statisticsgroups: Array<GageStatisticGroup>;
        citations: Array<Citation>;
        statistics: Array<GageStatistic>;
        constructor(sid: string) {
            this.code = sid;
        }
    }

    class GageCharacteristic {
        id: number;
        value: string;
        unitType: UnitType;
        comments: string;
        citationID: number;
        citation: Citation;
        variableTypeID: number;
        variableType: VariableType;
    }

    class UnitType {
        id: number;
        name: string;
        abbreviation: string;
        unitSystemTypeID: number;
    }

    class VariableType {
        id: number;
        name: string;
        code: string;
        description: string;
    }

    class Citation {
        id: number;
        title: string;
        author: string; 
        citationURL: string; 
    }

    class GageStatisticGroup {
        id: number;
        name: string;
        code: string;
    }

    class GageStatistic {
        comments: string;
        id: number;
        isPreferred: boolean;
        regressionType: RegressionType;
        regressionTypeID: number;
        statisticErrors: Array<any>;
        statisticGroupTypeID: number;
        statisticGroupType: GageStatisticGroup;
        unitTypeID: number;
        unitType: UnitType;
        value: string;
        citationID: number;
        citation: Citation;
        yearsofRecord: number;
        predictionInterval: PredictionInterval
    }

    class PredictionInterval {
        id: number;
        variance: number;
        lowerConfidenceInterval: number;
        upperConfidenceInterval: number;
    }

    class StationType {
        id: number;
        code: string;
        description: string;
        name: string;
    }
    
    class Agency {
        id: number;
        code: string;
        description: string;
        name: string;
    }

    class RegressionType {
        id: number;
        code: string;
        name: string;
        description: string;
    }

    class NearestGagesController extends WiM.Services.HTTPServiceBase implements INearestGagesController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public sce: any;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        private modalService: Services.IModalService;
        private studyAreaService: Services.IStudyAreaService;
        public AppVersion: string;
        public gage: GageInfo;
        public selectedStatisticGroups;
        public showPreferred = false;
        public multiselectOptions = {
            displayProp: 'name'
        }
        public NWISlat: string;
        public NWISlng: string;
        public queryBy = 'Nearest';
        public distance = 10;
        public toaster: any;
        public nearbyGages = [];

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', 'toaster', '$http', 'StreamStats.Services.ModalService', '$modalInstance', 'StreamStats.Services.StudyAreaService'];
        constructor($scope: INearestGagesControllerScope, toaster, $http: ng.IHttpService, modalService: Services.IModalService, modal:ng.ui.bootstrap.IModalServiceInstance, studyArea: Services.IStudyAreaService) {
            super($http, configuration.baseurls.StreamStats);
            $scope.vm = this;
            this.modalInstance = modal;
            this.modalService = modalService;
            this.init();  
            this.selectedStatisticGroups = [];
            this.showPreferred = false;
            this.studyAreaService = studyArea;
            this.toaster = toaster;
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-

        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }

        public getNearestGages() {
            this.toaster.pop("wait", "Searching for gages", "Please wait...", 0);
            var headers = {
                "X-Is-Streamstats": true
            };
            var lat = this.studyAreaService.selectedStudyArea.Pourpoint[0].Latitude.toString();
            var long = this.studyAreaService.selectedStudyArea.Pourpoint[0].Longitude.toString();
            var url = configuration.baseurls.GageStatsServices;
            if (this.queryBy == 'Nearest') url += configuration.queryparams.GageStatsServicesNearest.format(lat, long, this.distance);
            if (this.queryBy == 'Network') url += configuration.queryparams.GageStatsServicesNetwork.format(lat, long, this.distance);

            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
            this.nearbyGages = []; // reset nearby gages
            this.Execute(request).then(
                (response: any) => {
                    this.toaster.clear();
                    if (typeof response.data == 'string') {
                        this.toaster.pop("warning", "Warning", response.data, 0);
                    } else if (response.data.hasOwnProperty('features') && response.data.features.length == 0) {
                        this.toaster.pop("warning", "Warning", "No stations located within search distance")
                    } else if (response.data.hasOwnProperty('features') && response.data.features.length > 0) {
                        response.data.features.forEach(feat => {
                            if (feat.properties.hasOwnProperty('Statistics')) {
                                var hasFlowDurationStats = false;
                                feat.properties.Statistics.forEach(stat => {
                                    if (stat['statisticGroupType'].code == 'FDS') hasFlowDurationStats = true;
                                })
                                feat.properties['HasFlowDurationStats'] = hasFlowDurationStats;
                            }
                            if (feat.properties.hasOwnProperty('Characteristics')) {
                                feat.properties.Characteristics.forEach(char => {
                                    if (char['variableType'].code == 'DRNAREA') feat.properties['DrainageArea'] = char['value'];
                                })
                            }
                        });
                        this.nearbyGages = response.data.features;

                    }

                    if (response.headers()['x-usgswim-messages']) {
                        var headerMsgs = JSON.parse(response.headers()['x-usgswim-messages']);
                        Object.keys(headerMsgs).forEach(key => {
                            headerMsgs[key].forEach(element => {
                                this.toaster.pop(key, key, element);
                            });
                        })
                    }
                }, (error) => {
                    //sm when complete
                    this.toaster.clear();
                    console.log(error);
                    if (error.headers()['x-usgswim-messages']) {
                        var headerMsgs = JSON.parse(error.headers()['x-usgswim-messages']);
                        Object.keys(headerMsgs).forEach(key => {
                            headerMsgs[key].forEach(element => {
                                this.toaster.pop(key, key, element);
                            });
                        })
                    } else {
                        this.toaster.pop('error', "There was an error finding nearby gages.", "Please retry", 0);
                    }
                });
        }

        public selectGage(gage) {
            if (this.studyAreaService.doSelectNearestGage) {
                this.Close()
                this.studyAreaService.selectGage(gage);
            }
        }

        public openGagePage(siteid: string): void {
            console.log('gage page id:', siteid)
            this.modalService.openModal(Services.SSModalType.e_gagepage, { 'siteid':siteid });
        }
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            this.AppVersion = configuration.version;

        }


      
    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.NearestGagesController', NearestGagesController);
}//end module 