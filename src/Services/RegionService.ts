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
        clearSelectedParameters();
        regionMapLayerList: any;
        nationalMapLayerList: any;
        streamStatsAvailable: boolean;
        regionMapLayerListLoaded: boolean;
        resetView: boolean;
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
        loaded: boolean;

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
        public loaded: boolean;

    }//end class
    export var onSelectedRegionChanged: string = "onSelectedRegionChanged";

    class RegionService extends WiM.Services.HTTPServiceBase {
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
                this.eventManager.RaiseEvent(onSelectedRegionChanged, this, WiM.Event.EventArgs.Empty);
            }
        }
        public regionMapLayerList: any;
        public nationalMapLayerList: any;
        public streamStatsAvailable: boolean;
        public regionMapLayerListLoaded: boolean;
        public resetView: boolean;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService, toaster, private eventManager:WiM.Event.IEventManager) {
            super($http, configuration.baseurls['StreamStatsServices']);
            this.toaster = toaster;
            this.regionList = [];
            this.parameterList = [];
            this.masterRegionList = configuration.regions;
            this.loadNationalMapLayers();
            this.streamStatsAvailable = false;
            this.eventManager.AddEvent<WiM.Event.EventArgs>(onSelectedRegionChanged);
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
            this.resetView = false;
        }

        public clearSelectedParameters() {
            this.parameterList.forEach((parameter) => {
                parameter.checked = false;
                delete parameter.value;
            });
        }        

        //intersect method modified from
        //https://stackoverflow.com/questions/2752349/fast-rectangle-to-rectangle-intersection
        public intersect(a, b) {
            return Math.max(a.left, b.left) < Math.min(a.right, b.right) && Math.min(a.top, b.top) > Math.max(a.bottom, b.bottom);
        }

        public loadRegionListByExtent(xmin: number, xmax: number, ymin: number, ymax: number, sr: number = 4326) {
            this.regionList = [];
            var a = { "top": ymax, "bottom": ymin, "left": xmax, "right": xmin }

            configuration.regions.forEach((value, key) => {
                var b = { "top": value.Bounds[1][0], "bottom": value.Bounds[0][0], "left": value.Bounds[0][1], "right": value.Bounds[1][1] }
                if (this.intersect(a, b)) {
                    this.regionList.push(value);
                }
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

            var url = configuration.baseurls['StreamStatsMapServices'] + configuration.queryparams['SSNationalLayers'] + "?f=pjson";
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

            //CLOUD
            if (configuration.cloud) {
                var url:any = configuration.baseurls['StreamStatsMapServices'] + configuration.queryparams['SSStateLayers'] + '?f=pjson';
                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.regionMapLayerList = [];

                this.Execute(request).then(
                    (response: any) => {
                        if (!response.data.layers) {
                            this.toaster.pop('warning', "No map layers available", "", 5000);
                            return;
                        }

                        //console.log('layers:', response.data.layers);

                        //set initial visibility array
                        response.data.layers.forEach((value, key) => {
                            var visible = false;

                            if (value.name == regionid) {
                                //console.log('MATCH FOUND:', value.subLayerIds)

                                value.subLayerIds.forEach((sublayer, sublayerkey) => {
                                    //console.log('here',sublayer,sublayerkey)
                                    this.regionMapLayerList.push([response.data.layers[sublayer].name, response.data.layers[sublayer].id, visible]);
                                });
                            }

                            //if (value.name.toLowerCase() == 'stream grid' || value.name.toLowerCase() == 'area of limited functionality') {
                            //    visible = true
                            //};

                            //this.regionMapLayerList.push([value.name, value.id, visible]);
                        });
                        this.regionMapLayerListLoaded = true;
                    }, (error) => {
                        console.log('No region map layers found');
                        return this.$q.reject(error.data)
                    }).finally(() => {

                    });
            }
            //NOT CLOUD
            else {
                var url = configuration.baseurls['StreamStatsMapServices'] + configuration.queryparams['SSStateLayers'].format(regionid.toLowerCase());
                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.regionMapLayerList = [];

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
                    }, (error) => {
                        console.log('No region map layers found');
                        return this.$q.reject(error.data)
                    }).finally(() => {

                    });
            }


        }
        public loadParametersByRegion() {
            //console.log('in load parameters', this.selectedRegion);
            if (!this.selectedRegion) return;

            //CLOUD CHECK
            if (configuration.cloud) {
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSAvailableParams'].format(this.selectedRegion.RegionID);
            }
            else {
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSAvailableParams'].format(this.selectedRegion.RegionID);
            }
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {     
                    //console.log(response);

                    if (response.data.parameters && response.data.parameters.length > 0) {
                        this.streamStatsAvailable = true;

                        response.data.parameters.forEach((parameter) => {

                            try {
                                ////dont add an always selected param twice
                                //configuration.alwaysSelectedParameters.forEach((alwaysSelectedParam) => {
                                //    if (alwaysSelectedParam.name == parameter.code) {
                                //        parameter.checked = true;
                                //        parameter.toggleable = false;
                                //    }
                                //    else {
                                //        parameter.checked = false;
                                //        parameter.toggleable = true;
                                //    }
                                //});

                                parameter.checked = false;
                                parameter.toggleable = true;

                                this.parameterList.push(parameter);
                            }
                            catch (e) {
                                alert(e);
                            }
                        });

                        //sort the list by code
                        this.parameterList.sort(function (a, b) { return (a.code > b.code) ? 1 : ((b.code > a.code) ? -1 : 0); }); 
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

    factory.$inject = ['$http', '$q', 'toaster','WiM.Event.EventManager'];
    function factory($http: ng.IHttpService, $q: ng.IQService, toaster: any, eventManager:WiM.Event.IEventManager) {
        return new RegionService($http, $q, toaster, eventManager)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.RegionService', factory)
}//end module 