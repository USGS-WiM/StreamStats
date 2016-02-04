//------------------------------------------------------------------------------
//----- StudyAreaService -------------------------------------------------------
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
//             the ViewModel.
//          
//discussion:
//

//Comments
//04.15.2015 jkn - Created

//Import
module StreamStats.Services {
    'use strict'
    export interface IExplorationService {
        elevationProfile(any);
        drawElevationProfile: boolean;
        drawMeasurement: boolean;
        elevationProfileGeoJSON: any;
        showElevationChart: boolean;
        measurementData: string;
        
    }
    class ExplorationService extends WiM.Services.HTTPServiceBase implements IExplorationService {
        //Events

        
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public toaster: any;
        public drawElevationProfile: boolean;
        public drawMeasurement: boolean;
        public elevationProfileGeoJSON: any;
        public showElevationChart: boolean;
        public measurementData: string;
        

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService, toaster) {
            super($http, configuration.baseurls['StreamStats'])

            this.toaster = toaster;
            this.drawElevationProfile = false;
            this.drawMeasurement = false;
            this.showElevationChart = false;
            this.measurementData = '';

        }
        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public elevationProfile(esriJSON) {

            var url = 'http://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer/Profile/execute';

            var request: WiM.Services.Helpers.RequestInfo =
                new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST,
                    'json', { InputLineFeatures: esriJSON, returnZ: true, f: 'json'},
                    { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    WiM.Services.Helpers.paramsTransform);
						
            //do ajax call for future precip layer, needs to happen even if only runoff value is needed for this region
            this.Execute(request).then(
                (response: any) => {
                    console.log('elevation profile response: ', response.data);
                    var coords = response.data.results[0].value.features[0].geometry.paths[0];

                    if (coords.length > 0) {

                        this.elevationProfileGeoJSON = {
                            "name": "NewFeatureType", "type": "FeatureCollection"
                            , "features": [
                                { "type": "Feature", "geometry": { "type": "LineString", "coordinates": coords }, "properties": "" }
                            ]
                        };
                    }
                    //sm when complete
                },(error) => {
                    //sm when error

                }).finally(() => {

            });
        }

    }//end class

    factory.$inject = ['$http', '$q', 'toaster'];
    function factory($http: ng.IHttpService, $q: ng.IQService, toaster: any) {
        return new ExplorationService($http, $q, toaster)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.ExplorationService', factory)
}//end module 