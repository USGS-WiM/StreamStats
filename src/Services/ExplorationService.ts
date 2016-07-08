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
        allowStreamgageQuery: boolean;
        selectedMethod: Models.INetworkNav;
        setMethod(methodtype: ExplorationMethodType)
        GetToolName(methodID: number): String
        ExecuteSelectedModel():void


        
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
        public allowStreamgageQuery: boolean;
        public _selectedMethod: Models.INetworkNav
        public get selectedMethod(): Models.INetworkNav {
            return this._selectedMethod;
        }
        

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService, toaster, private eventManager: WiM.Event.IEventManager, private regionservice:Services.IRegionService) {
            super($http, configuration.baseurls['StreamStats'])

            this.toaster = toaster;
            this.drawElevationProfile = false;
            this.drawMeasurement = false;
            this.showElevationChart = false;
            this.allowStreamgageQuery = false;
            this.measurementData = '';
            this._selectedMethod = null;
            eventManager.AddEvent<StudyAreaEventArgs>(onSelectedStudyAreaChanged);

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
                    //console.log('elevation profile response: ', response.data);
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
        public setMethod(methodtype: ExplorationMethodType) {
            if (this._selectedMethod != null && methodtype === this._selectedMethod.ModelType) methodtype = ExplorationMethodType.undefined;
            switch (methodtype) {
                case ExplorationMethodType.FINDPATH2OUTLET:
                    this._selectedMethod = new Models.Path2Outlet();
                    break;
                case ExplorationMethodType.FINDPATHBETWEENPOINTS:                
                    this._selectedMethod = new Models.PathBetweenPoints();
                    break;
                case ExplorationMethodType.GETNETWORKREPORT:
                    this._selectedMethod = new Models.NetworkReport();
                    break
                default:
                    this._selectedMethod = null;
                    break;
            }//end switch
        }
        public GetToolName(methodID: ExplorationMethodType): String {
            switch (methodID) {
                case ExplorationMethodType.FINDPATHBETWEENPOINTS:
                    return "Find path between two points";
                case ExplorationMethodType.FINDPATH2OUTLET:
                    return "Find path to outlet";
                case ExplorationMethodType.GETNETWORKREPORT:
                    return "Get network report";
                default:
                    return "";

            }//end switch

        }
        public ExecuteSelectedModel(): void {
            //build url
            //streamstatsservices/navigation / { 0}.geojson ? rcode = { 1}& startpoint={ 2}& endpoint={ 3 }&crs={ 4 }&workspaceID={ 5 }&direction={ 6 }&layers={ 7 }
            var urlParams: Array<string> = [];
            urlParams.push("startpoint=" + JSON.stringify(new Array(this.selectedMethod.locations[0].Longitude, this.selectedMethod.locations[0].Latitude)));
            if (this.selectedMethod.locations.length > 1) urlParams.push("endpoint=" + JSON.stringify(new Array(this.selectedMethod.locations[1].Longitude, this.selectedMethod.locations[1].Latitude)));
            urlParams.push("crs="+this.selectedMethod.locations[0].crs);
            if ("workspaceID" in this.selectedMethod && (<any>this.selectedMethod).workspaceID !== '') urlParams.push("workspaceID=" +(<any>this.selectedMethod).workspaceID);
            if (this.selectedMethod.hasOwnProperty("selectedDirectionType")) urlParams.push("direction="+(<any>this.selectedMethod).selectedDirectionType);
            if (this.selectedMethod.hasOwnProperty("layerOptions")) {
                var itemstring = (<any>this.selectedMethod).layerOptions.map((elem) => {
                    if (elem.selected)
                        return elem.name;
                }).join(";");

                    urlParams.push("layers=" + itemstring)
            }//endif

            var url: string = configuration.baseurls['StreamStatsServices']+configuration.queryparams['SSNavigationServices']
                .format(this.selectedMethod.ModelType, this.regionservice.selectedRegion.RegionID)+urlParams.join("&");
            
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url,true);

            this.Execute(request).then(
                (response: any) => {
                    var results = response.data;
                    var evtarg = new ExplorationServiceEventArgs();
                    evtarg.features = results.hasOwnProperty("featurecollection")? results["featurecollection"]: null;
                    evtarg.report = results.hasOwnProperty("Report") ? results["Report"] : null;

                    this.eventManager.RaiseEvent(onSelectedMethodExecuteComplete, this, evtarg);

                    //sm when complete
                }, (error) => {
                    //sm when error                    
                    this.toaster.pop("error", "Error processing request, please try again", 0);
                    this.eventManager.RaiseEvent(onSelectedMethodExecuteComplete, this, ExplorationServiceEventArgs.Empty);

                }).finally(() => {
                    //busy
                });

            
        }
    }//end class
    export enum ExplorationMethodType {
        undefined =0,
        FINDPATHBETWEENPOINTS = 1,
        FINDPATH2OUTLET =2,
        GETNETWORKREPORT = 3
    }
    factory.$inject = ['$http', '$q', 'toaster', 'WiM.Event.EventManager', 'StreamStats.Services.RegionService'];
    function factory($http: ng.IHttpService, $q: ng.IQService, toaster: any,eventmngr, regionservice) {
        return new ExplorationService($http, $q, toaster,eventmngr,regionservice)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.ExplorationService', factory)
}//end module 