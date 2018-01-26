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
        getNavigationEndPoints();
        getNavigationConfiguration(modelType:number);
        selectedMethod: Models.INetworkNav;
        setMethod(methodtype: ExplorationMethodType, configuration: any, totalPointCount: number, totalOptionsCount: number)
        GetToolName(methodID: number): String
        ExecuteSelectedModel(): void
        elevationProfileHTML: any;
        coordinateList: Array<any>;
        navigationResources: Array<any>;
        explorationMethodBusy: boolean;
    }

    export var onSelectedMethodExecuteComplete: string = "onSelectedMethodExecuteComplete";

    export class ExplorationServiceEventArgs extends WiM.Event.EventArgs {
        //properties
        public features: Array<any>
        public report: string;

        constructor() {
            super();
        }

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
        public _selectedMethod: Models.INetworkNav
        public get selectedMethod(): Models.INetworkNav {
            return this._selectedMethod;
        }
        public elevationProfileHTML: any;
        public coordinateList: Array<any>;
        public navigationResources: Array<any>;
        public explorationMethodBusy: boolean;
        

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService, toaster, private eventManager: WiM.Event.IEventManager, private regionservice:Services.IRegionService) {
            super($http, configuration.baseurls['StreamStatsServices'])

            this.toaster = toaster;
            this.drawElevationProfile = false;
            this.drawMeasurement = false;
            this.showElevationChart = false;
            this.measurementData = '';
            this._selectedMethod = null;
            eventManager.AddEvent<StudyAreaEventArgs>(onSelectedStudyAreaChanged);

        }
        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public elevationProfile(esriJSON) {

            //ESRI elevation profile tool
            //Help page: https://elevation.arcgis.com/arcgis/rest/directories/arcgisoutput/Tools/ElevationSync_GPServer/Tools_ElevationSync/Profile.htm
            var url = 'https://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer/Profile/execute';

            var request: WiM.Services.Helpers.RequestInfo =
                new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST,
                    'json', { InputLineFeatures: esriJSON, returnZ: true, DEMResolution: '30m', f: 'json'},
                    { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    WiM.Services.Helpers.paramsTransform);
						
            //do ajax call for future precip layer, needs to happen even if only runoff value is needed for this region
            this.Execute(request).then(
                (response: any) => {
                    console.log('elevation profile response: ', response.data);

                    if (response.data && response.data.results) {
                        var coords = response.data.results[0].value.features[0].geometry.paths[0];

                        if (coords.length > 0) {

                            //get copy of coordinates for elevation plugin
                            var coords_orig = angular.fromJson(angular.toJson(coords));

                            //convert elevation values if units are meters
                            var units = 'feet';
                            response.data.results[0].value.fields.forEach((field) => {
                                if (field.name == "ProfileLength" && field.alias == "Length Meters") units = 'meters';
                            });

                            if (units = 'meters') {
                                coords = coords.map((elem) => {
                                    //convert elevation value from meters to feet
                                    return [elem[0], elem[1], elem[2] * 3.28084]
                                });
                            }

                            // build table data and get distance between points
                            var totalDistance = 0;
                            //initialize list with first value and zero distance
                            this.coordinateList = [[coords[0][1].toFixed(5), coords[0][0].toFixed(5), coords[0][2].toFixed(2), totalDistance.toFixed(2)]];

                            //loop over coords and calulate distances
                            for (var i = 1; i < coords.length; i++) {
 
                                //use leaflet 'distanceTo' method (units meters)
                                var previousPoint = L.latLng(coords[i - 1][1], coords[i - 1][0]);
                                var currentPoint = L.latLng(coords[i][1], coords[i][0]);
                                totalDistance += previousPoint.distanceTo(currentPoint);

                                //console.log('total D:', totalDistance * 0.000621371, coords)
                                //convert meters to miles for total distance
                                this.coordinateList.push([coords[i][1].toFixed(5), coords[i][0].toFixed(5), coords[i][2].toFixed(2), (totalDistance * 0.000621371).toFixed(2)]) 
                                
                            }//next i    

                            this.elevationProfileGeoJSON = {
                                "name": "NewFeatureType", "type": "FeatureCollection"
                                , "features": [
                                    { "type": "Feature", "geometry": { "type": "LineString", "coordinates": coords_orig }, "properties": "" }
                                ]
                            };
                        }
                    }

                    else {
                        console.error("There was a zero length response from the elevation service");
                        this.toaster.clear();
                        this.toaster.pop("error", "Error", "No elevation results are available here", 0);
                    }
                        //sm when complete

                },(error) => {
                    //sm when error
                    console.error("There was an error requestion the elevation service");
                    this.toaster.clear();
                    this.toaster.pop("error", "Error processing request", "Please try again", 0);

                }).finally(() => {

            });
        }

        public getNavigationEndPoints() {
            console.log('get nav endpoints')

            var url: string = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSNavigationServices'];

            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {
                    var results = response.data;
                    console.log('network nav options:', results);

                    this.navigationResources = results;

                    //sm when complete
                }, (error) => {
                    //sm when error                    
                    this.toaster.pop("error", "Error processing request", "Please try again", 0);
                    this.eventManager.RaiseEvent(onSelectedMethodExecuteComplete, this, ExplorationServiceEventArgs.Empty);

                }).finally(() => {
                    //busy
                });
        }

        public getNavigationConfiguration(id) {

            var url: string = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSNavigationServices'] + '/' + id;
     
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {
                    var data = response.data;
                    console.log('navigation config:', data);

                    //get count of point location configurations
                    var totalPointCount = this.getCountByType(data.configuration, 'geojson point geometry');
                    console.log('total point count:', totalPointCount);

                    //get options count
                    var totalOptionsCount = this.getCountByType(data.configuration, 'option')
                    console.log('total options count:', totalOptionsCount);

                    this.setMethod(id, data, totalPointCount, totalOptionsCount);

                    //sm when complete
                }, (error) => {
                    //sm when error                    
                    this.toaster.pop("error", "Error processing request", "Please try again", 0);
                    this.eventManager.RaiseEvent(onSelectedMethodExecuteComplete, this, ExplorationServiceEventArgs.Empty);

                }).finally(() => {
                    //busy
                });
        }

        private getCountByType(object, text) {
            return object.filter(function (item) { return item.valueType.toLowerCase().includes(text) }).length;
        }

        public setMethod(methodtype: ExplorationMethodType, data: any, totalPointCount:number, totalOptionsCount:number) {
            console.log('HERE99', methodtype, data, totalPointCount, totalOptionsCount)

            if (this._selectedMethod != null && methodtype === this._selectedMethod.navigationID) methodtype = ExplorationMethodType.undefined;

            this._selectedMethod = new Models.NetworkNav(methodtype, data, totalPointCount, totalOptionsCount);

        }

        public GetToolName(methodID: ExplorationMethodType): String {
            switch (methodID) {
                case ExplorationMethodType.FLOWPATH:
                    return "Flow (Raindrop) Trace to outlet";
                case ExplorationMethodType.NETWORKPATH:
                    return "Find network path between two points";
                case ExplorationMethodType.NETWORKTRACE:
                    return "Configurable network trace";
                default:
                    return "";

            }//end switch

        }
        public ExecuteSelectedModel(): void {
            
            console.log('selected method:', this.selectedMethod);

            //build url
            var url: string = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSNavigationServices'] + '/' + this.selectedMethod.navigationInfo.code + '/route';

            console.log('url: ', url)
            
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST,
                'json', angular.toJson(this.selectedMethod.navigationConfiguration));

            this.Execute(request).then(
                (response: any) => {
                    var results = response.data;
                    console.log('successfull navigation request results:', results);

                    var evtarg = new ExplorationServiceEventArgs();
                    evtarg.features = results.type === "FeatureCollection" ? results : null;
                    evtarg.report = results.type == "Report" ? results : null;

                    this.eventManager.RaiseEvent(onSelectedMethodExecuteComplete, this, evtarg);

                    //sm when complete
                }, (error) => {
                    //sm when error                    
                    this.toaster.pop("error", "Error processing request", "Please try again", 0);
                    this.eventManager.RaiseEvent(onSelectedMethodExecuteComplete, this, ExplorationServiceEventArgs.Empty);

                }).finally(() => {
                    //busy
                });

            
        }
    }//end class
    export enum ExplorationMethodType {
        undefined = 0,
        FLOWPATH = 1,
        NETWORKPATH = 2,
        NETWORKTRACE = 3
    }
    factory.$inject = ['$http', '$q', 'toaster', 'WiM.Event.EventManager', 'StreamStats.Services.RegionService'];
    function factory($http: ng.IHttpService, $q: ng.IQService, toaster: any,eventmngr, regionservice) {
        return new ExplorationService($http, $q, toaster,eventmngr,regionservice)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.ExplorationService', factory)
}//end module 