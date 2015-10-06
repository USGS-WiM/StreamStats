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
    'use strinct';
    interface IReportControllerScope extends ng.IScope {
        vm: ReportController;
    }
    interface ILeafletData {
        getMap(): ng.IPromise<any>;
    }
    interface IReportController {
    }
    interface ICenter {
        lat: number;
        lng: number;
        zoom: number;
    }
    interface IMapLayers {
        baselayers: Object;
        geojson: Object;
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

    class ReportController implements IReportController  {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public close: any;
        public print: any;
        private studyAreaService: Services.IStudyAreaService;
        private nssService: Services.InssService;
        public markers: Object = null;
        public geojson: Object = null;
        public center: ICenter = null;
        public bounds: any;
        public layers: IMapLayers = null;
        private leafletData: ILeafletData;
        public reportTitle: string;
        public reportComments: string;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$modalInstance', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'leafletData'];
        constructor($scope: IReportControllerScope, $modalInstance: ng.ui.bootstrap.IModalServiceInstance, studyArea: Services.IStudyAreaService, StatisticsGroup: Services.InssService, leafletData: ILeafletData) {
            $scope.vm = this;
            this.studyAreaService = studyArea;
            this.nssService = StatisticsGroup;
            this.leafletData = leafletData;
            this.reportTitle = 'Report Title';
            this.reportComments = 'Some comments here';

            this.initMap();
            console.log('testtest');

            $scope.$on('leafletDirectiveMap.load',(event, args) => {
                console.log('report map load');
                this.showFeatures();
            });

            this.close = function () {
                $modalInstance.dismiss('cancel');
            };

            this.print = function () {
                window.print();
            };

        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private initMap(): void {
            this.center = new Center(39, -96, 4);
            this.layers = {
                baselayers: configuration.basemaps,
                geojson: this.geojson
            }
            this.geojson = {};
            L.Icon.Default.imagePath = 'images';
        } 

        private showFeatures(): void { 

            if (!this.studyAreaService.selectedStudyArea) return;
            this.geojson = {};
            this.studyAreaService.selectedStudyArea.Features.forEach((item) => {

                console.log('in each loop', item.name);

                if (item.name == 'globalwatershed') {
                    this.geojson[item.name] = {
                        data: item.feature,
                        style: {
                            fillColor: "yellow",
                            weight: 2,
                            opacity: 1,
                            color: 'white',
                            fillOpacity: 0.5
                        }
                    }

                    var bbox = this.geojson['globalwatershed'].data.features[0].bbox;
                    this.leafletData.getMap().then((map: any) => {
                        //method to reset the map for modal weirdness
                        map.invalidateSize();
                        console.log('in getmap: ', bbox);
                        map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);

                        //map.dragging.disable();
                        map.touchZoom.disable();
                        map.doubleClickZoom.disable();
                        map.scrollWheelZoom.disable();
                        map.boxZoom.disable();
                        map.keyboard.disable();
                        if (map.tap) map.tap.disable();
                        document.getElementById('map').style.cursor = 'default';

                    });
                }
                if (item.name == 'globalwatershedpoint') {
                    this.geojson[item.name] = {
                        data: item.feature
                    }
                }

                if (item.name == 'regulatedWatershed') {
                    console.log('showing regulated watershed');
                    this.geojson[item.name] = {
                        data: item.feature,
                        style: {
                            fillColor: "red",
                            weight: 2,
                            opacity: 1,
                            color: 'white',
                            fillOpacity: 0.5
                        }
                    }
                }
            });
        }

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-


    }//end class
    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.ReportController', ReportController)
        //.controller('StreamStats.Controllers.MapController', MapController)

}//end module
   