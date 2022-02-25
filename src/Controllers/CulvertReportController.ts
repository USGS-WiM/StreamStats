//------------------------------------------------------------------------------
//----- ReportrController ------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2014 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping


//   purpose:  

//discussion:   Controllers are typically built to reflect a View. 
//              and should only contailn business logic needed for a single view. For example, if a View 
//              contains a ListBox of objects, a Selected object, and a Save button, the Controller 
//              will have an ObservableCollection ObectList, 
//              Model SelectedObject, and SaveCommand.

//Comments
//04.14.2015 jkn - Created

//Imports"
module StreamStats.Controllers {

    declare var jsPDF;
    declare var shpwrite;
    declare var saveSvgAsPng;
    declare var tokml;
    'use strict';
    interface ICulvertReportControllerScope extends ng.IScope {
        vm: CulvertReportController;
    }
    interface ILeafletData {
        getMap(mapID: any): ng.IPromise<any>;
        getLayers(mapID: any): ng.IPromise<any>;
    }
    interface ICulvertReportController {
    }
    interface ICenter {
        lat: number;
        lng: number;
        zoom: number;
    }
    interface IMapLayers {
        baselayers: Object;
        overlays: Object;
    }
    interface ILayer {
        name: string;
        url: string;
        type: string;
        visible: boolean;
        layerOptions: Object;
    }
    class Center implements ICenter {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public lat: number;
        public lng: number;
        public zoom: number;
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor(lt: number, lg: number, zm: number) {
            this.lat = lt;
            this.lng = lg;
            this.zoom = zm;
        }
    }

    class CulvertReportController implements ICulvertReportController  {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private disclaimer = "USGS Data Disclaimer: Unless otherwise stated, all data, metadata and related materials are considered to satisfy the quality standards relative to the purpose for which the data were collected. Although these data and associated metadata have been reviewed for accuracy and completeness and approved for release by the U.S. Geological Survey (USGS), no warranty expressed or implied is made regarding the display or utility of the data for other purposes, nor on all computer systems, nor shall the act of distribution constitute any such warranty." + '\n' +
        "USGS Software Disclaimer: This software has been approved for release by the U.S. Geological Survey (USGS). Although the software has been subjected to rigorous review, the USGS reserves the right to update the software as needed pursuant to further analysis and review. No warranty, expressed or implied, is made by the USGS or the U.S. Government as to the functionality of the software and related material nor shall the fact of release constitute any such warranty. Furthermore, the software is released on condition that neither the USGS nor the U.S. Government shall be held liable for any damages resulting from its authorized or unauthorized use." + '\n' +
        "USGS Product Names Disclaimer: Any use of trade, firm, or product names is for descriptive purposes only and does not imply endorsement by the U.S. Government." + '\n\n';

        public close: any;
        public print: any;
        private studyAreaService: Services.IStudyAreaService;
        private nssService: Services.InssService;
        public markers: Object = null;
        public overlays: Object = null;
        public center: ICenter = null;
        public bounds: any;
        public layers: IMapLayers = null;
        public extensions;

        public geojson: Object = null;

        private leafletData: ILeafletData;
        public defaults: any;
        public reportTitle: string;
        public reportComments: string;
        public angulartics: any;
        public AppVersion: string;
        public isExceedanceTableOpen = false;
        public isFlowTableOpen = false;
        private environment: string;
        public NSSServicesVersion: string;
        public SSServicesVersion = '1.2.22'; // TODO: This needs to pull from the services when ready
        public selectedTabName: string;

        public get showReport(): boolean {
            if (!this.studyAreaService.studyAreaParameterList) return false;
            for (var i = 0; i < this.studyAreaService.studyAreaParameterList.length; i++) {
                var param = this.studyAreaService.studyAreaParameterList[i];
                if (param.value && param.value >= 0) return true;
            }
            return false;
        }
        // public get canShowDisclaimers(): boolean {
        //     if (this.studyAreaService.selectedStudyArea.Disclaimers == null) return false;
        //     var canshow = Object.keys(this.studyAreaService.selectedStudyArea.Disclaimers).length > 0;            
        //     return canshow;            
        // }
        // public get showRegulation(): boolean {
        //     if (this.regionService.selectedRegion.Applications.indexOf("RegulationFlows") > -1) return true;
        //     else return false;                
        // }
        // public get ActiveExtensions(): Array<any> {
        //     if (this.studyAreaService.selectedStudyArea.NSS_Extensions && this.studyAreaService.selectedStudyArea.NSS_Extensions.length > 0)
        //         return this.studyAreaService.selectedStudyArea.NSS_Extensions
        //     else return null;
        // }
        private _graphData: any = {
            data: {},
            options: {}
        };
        public get GraphData():any {
            return this._graphData;
        }
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$analytics', '$modalInstance', 'StreamStats.Services.StudyAreaService', 'leafletData', 'StreamStats.Services.nssService', 'StreamStats.Services.RegionService', 'StreamStats.Services.ModalService'];
        constructor($scope: ICulvertReportControllerScope, $analytics, $modalInstance: ng.ui.bootstrap.IModalServiceInstance, studyArea: Services.IStudyAreaService, StatisticsGroup: Services.InssService, leafletData: ILeafletData, private regionService:Services.IRegionService, private modal: Services.IModalService) {
            $scope.vm = this;

            this.angulartics = $analytics;
            this.studyAreaService = studyArea;
            this.nssService = StatisticsGroup;
            this.leafletData = leafletData;
            this.reportTitle = 'StreamStats Report';
            this.reportComments = 'Some comments here';
            this.AppVersion = configuration.version;
            this.environment = configuration.environment;
            this.initMap();

            $scope.$on('leafletDirectiveMap.reportMap.load',(event, args) => {
                //console.log('report map load');
                this.showFeatures();
            });

            this.close = function () {
                $modalInstance.dismiss('cancel');
            };

            this.print = function () {
                window.print();
            };

            this.NSSServicesVersion = this.studyAreaService.NSSServicesVersion;
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public selectCulvertTab(tabname: string): void {
            if (this.selectedTabName == tabname) return;
            this.selectedTabName = tabname;
            //console.log('selected tab: '+tabname);
        }

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private initMap(): void {
            this.center = new Center(39, -96, 4);
            this.layers = {
                baselayers: configuration.basemaps,
                overlays: {}
            }
            this.geojson= { };
            L.Icon.Default.imagePath = 'images';
            this.defaults = {
                scrollWheelZoom: false,
                touchZoom: false,
                doubleClickZoom: false,
                boxZoom: false,
                keyboard: false
            }
        }
        private showFeatures(): void {

            if (!this.studyAreaService.selectedStudyArea) return;
            this.overlays = {};
            this.studyAreaService.selectedStudyArea.FeatureCollection.features.forEach((item) => {
                this.addGeoJSON(item.id, item);
            });

            // add reference gage to report map
            if (this.studyAreaService.selectedGage && this.studyAreaService.selectedGage.hasOwnProperty('Latitude_DD') && this.studyAreaService.selectedGage.hasOwnProperty('Longitude_DD')) {
                var gagePoint = {
                    type: "Feature",
                    geometry: {
                        coordinates: [
                            this.studyAreaService.selectedGage["Latitude_DD"],
                            this.studyAreaService.selectedGage["Longitude_DD"]
                        ],
                        type: "Point"
                    }
                }
                this.addGeoJSON('referenceGage', gagePoint)
            }

            var bbox = this.studyAreaService.selectedStudyArea.FeatureCollection.bbox;
            this.leafletData.getMap("reportMap").then((map: any) => {
                //method to reset the map for modal weirdness
                map.invalidateSize();
                //console.log('in getmap: ', bbox);
                map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
            });
        }
        private addGeoJSON(LayerName: string|number, feature: any) {

                this.layers.overlays[LayerName] = {
                    name: LayerName,
                    type: 'geoJSONShape',
                    data: feature,
                    visible: false,
                    layerOptions: {
                        style: {
                            fillColor: "red",
                            color: 'red'
                        }
                    }
                }
        }
        
    }//end class
    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.CulvertReportController', CulvertReportController)

}//end module
   