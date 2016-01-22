//------------------------------------------------------------------------------
//----- RegionService -----------------------------------------------------
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
//             the Controller.
//          
//discussion:
//
//https://docs.angularjs.org/api/ng/service/$http

//Comments
//03.26.2015 jkn - Created

//Import
module StreamStats.Services {
    'use strict'
    export interface IRegionService {
        onSelectedRegionChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        regionList: Array<IRegion>;
        masterRegionList: Array<IRegion>;
        parameterList: Array<IParameter>;
        selectedRegion: IRegion;
        loadRegionListByExtent(xmin: number, xmax: number, ymin: number, ymax: number, sr?: number):boolean;
        loadRegionListByRegion(region: string): boolean;
        loadMapLayersByRegion(region: string): boolean;
        loadParametersByRegion();
        clearRegion();
        regionMapLayerList: any;
        nationalMapLayerList: any;
        allowStreamgageQuery: boolean;
        streamStatsAvailable: boolean;
        regionMapLayerListLoaded: boolean;
    }
    export interface IRegion {
        RegionID: string;
        Name: string;
        Bounds: Array<Array<number>>;
        Layers: Array<any>;
        Applications: Array<string>;
        ScenariosAvailable: boolean;
    }
    export interface IParameter {
        code: string;
        description: string;
        name: string;
        unit: string;
        value: number;
        regulatedValue: number;
        unRegulatedValue: number;
        checked: boolean;
        toggleable: boolean;

    }

    export class Region implements IRegion {
        //properties
        public RegionID: string;
        public Name: string;
        public Bounds: Array<Array<number>>;
        public Layers: Array<any>;
        public Applications: Array<string>;
        public ScenariosAvailable: boolean;

    }//end class

    export class Parameter implements IParameter {
        //properties
        public code: string;
        public description: string;
        public name: string;
        public unit: string;
        public value: number;
        public regulatedValue: number;
        public unRegulatedValue: number;
        public checked: boolean;
        public toggleable: boolean;

    }//end class

    class RegionService extends WiM.Services.HTTPServiceBase {
        //Events
        private _onSelectedRegionChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        public get onSelectedRegionChanged(): WiM.Event.Delegate<WiM.Event.EventArgs> {
            return this._onSelectedRegionChanged;
        }
        
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public toaster: any;
        public regionList: Array<IRegion>;
        public masterRegionList: Array<IRegion>;
        public parameterList: Array<IParameter>;
        private _selectedRegion: IRegion;
        public get selectedRegion(): IRegion {
            return this._selectedRegion;
        }
        public set selectedRegion(val: IRegion) {
            if (this._selectedRegion != val) {
                this._selectedRegion = val;
                this._onSelectedRegionChanged.raise(null, WiM.Event.EventArgs.Empty);
            }
        }
        public regionMapLayerList: any;
        public nationalMapLayerList: any;
        public streamStatsAvailable: boolean;
        public regionMapLayerListLoaded: boolean;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService, toaster) {
            super($http, configuration.baseurls['StreamStats']);
            this._onSelectedRegionChanged = new WiM.Event.Delegate<WiM.Event.EventArgs>(); 
            this.toaster = toaster;
            this.regionList = [];
            this.parameterList = [];
            this.masterRegionList = configuration.regions;
            this.loadNationalMapLayers();
            this.streamStatsAvailable = false;
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public clearRegion() {
            //console.log('in clear region');
            this.regionList = [];
            this.parameterList = [];
            this.regionMapLayerList = [];
            this.selectedRegion = null;
            this.regionMapLayerListLoaded = false;
        }
        public loadRegionListByExtent(xmin:number,xmax:number,ymin:number,ymax:number, sr:number=4326) {
        //    clear List
            this.regionList.length = 0;//clear array
            var input = {
                f: 'json',
                geometry: { "xmin": xmin, "ymin": ymin, "xmax": xmax, "ymax": ymax, "spatialReference": { "wkid": sr } },
                tolerance: 2,
                returnGeometry: false,
                mapExtent: { "xmin": xmin, "ymin": ymin, "xmax": xmax, "ymax": ymax, "spatialReference": { "wkid": sr } },
                imageDisplay: "1647, 457,96",
                geometryType:"esriGeometryEnvelope",
                sr:sr,
                layers:"all: 4"
            }

            var url = configuration.baseurls['StreamStats'] + configuration.queryparams['regionService'];
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            request.params = input;

            this.Execute(request).then(
                (response: any) => {
                    //console.log(response);
                    if (response.data.results.length < 1) {
                        this.toaster.pop('warning', "No State/Regional Study Areas available here", "", 5000);
                    }
                    response.data.results.map((item) => {          
                        try {
                            var region = this.getRegion(item.attributes.st_abbr);
                            if (region != null && this.regionList.indexOf(region) == -1) this.regionList.push(region);
                        }
                        catch (e) {
                            alert(e);
                        }
                    });
                },(error) => {
                    return this.$q.reject(error.data)
                });
        }
        public loadRegionListByRegion(regionid: string): boolean{
            this.regionList.length = 0;//clear array;
            var selectedRegion = this.getRegion(regionid);
            if (selectedRegion == null) return false;

            this.regionList.push(selectedRegion);
            return true;
        }

        public loadNationalMapLayers() {

            var url = configuration.baseurls['StreamStats'] + "/arcgis/rest/services/ss_studyAreas_prod/MapServer?f=pjson";
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            this.nationalMapLayerList = [];

            this.Execute(request).then(
                (response: any) => {
                    response.data.layers.forEach((value, key) => {
                        //console.log("Adding layer: ", value);
                        this.nationalMapLayerList.push([value.name, value.id]);
                    });
                    //console.log('list of national map layers', this.nationalMapLayerList);
                    //return layerArray;
                       
                },(error) => {
                    console.log('No national map layers found');
                    return this.$q.reject(error.data)
                });
        }

        public loadMapLayersByRegion(regionid: string): any {
            //console.log('in loadMapLayersByRegion');
            this.regionMapLayerListLoaded = false;

            var url = configuration.baseurls['StreamStats'] + configuration.queryparams['SSStateLayers'].format(regionid.toLowerCase());
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            this.regionMapLayerList= [];

            this.Execute(request).then(
                (response: any) => {
                    if (!response.data.layers) {
                        this.toaster.pop('warning', "No map layers available", "", 5000);
                        return;
                    }

                    //set initial visibility array
                    response.data.layers.forEach((value, key) => {
                        var visible = false;
                        if (value.name.toLowerCase() == 'stream grid' || value.name.toLowerCase() == 'area of limited functionality') { visible = true };
 
                        this.regionMapLayerList.push([value.name, value.id, visible]);
                    });
                    this.regionMapLayerListLoaded = true;
                },(error) => {
                    console.log('No region map layers found');
                    return this.$q.reject(error.data)
                }).finally(() => {
                    
            });
        }
        public loadParametersByRegion() {
            //console.log('in load parameters', this.selectedRegion);
            if (!this.selectedRegion) return;

            var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSAvailableParams'].format(this.selectedRegion.RegionID);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {     
                    //console.log(response);

                    if (response.data.parameters && response.data.parameters.length > 0) {
                        this.streamStatsAvailable = true;

                        response.data.parameters.forEach((parameter) => {

                            try {
                                //dont add an always selected param twice
                                configuration.alwaysSelectedParameters.forEach((alwaysSelectedParam) => {
                                    if (alwaysSelectedParam.name == parameter.code) {
                                        parameter.checked = true;
                                        parameter.toggleable = false;
                                    }
                                    else {
                                        parameter.checked = false;
                                        parameter.toggleable = true;
                                    }
                                });

                                this.parameterList.push(parameter);
                            }
                            catch (e) {
                                alert(e);
                            }
                        });
                        //console.log(this.selectedStatisticsGroupParameterList);
                    }

                    else {
                        this.streamStatsAvailable = false;
                        this.toaster.pop('warning', "StreamStats not available here at this time", "", 5000);
                    }
                    //sm when complete
                },(error) => {
                    console.log('Bad response from the regression service');
                    this.streamStatsAvailable = false;
                    this.toaster.pop('warning', "StreamStats not available here at this time", "", 5000);
                    //sm when complete
                }).finally(() => { });
        }

        //HelperMethods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private getRegion(lookupID: string): IRegion {
            var regionArray: Array<IRegion> = configuration.regions;

            try {
                //search for item
                for (var i = 0; i < regionArray.length; i++){
                    if (regionArray[i].Name.toUpperCase().trim() === lookupID.toUpperCase().trim() ||
                        regionArray[i].RegionID.toUpperCase().trim() === lookupID.toUpperCase().trim())
                        return regionArray[i];
                }//next region

                return null;
            }
            catch (e) {
                return null;
            }
        }

    }//end class

    factory.$inject = ['$http', '$q', 'toaster'];
    function factory($http: ng.IHttpService, $q: ng.IQService, toaster: any) {
        return new RegionService($http, $q, toaster)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.RegionService', factory)
}//end module 