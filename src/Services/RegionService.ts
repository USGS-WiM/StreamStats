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
        regionList: Array<Models.IRegion>;
        loadRegionListByExtent(xmin: number, xmax: number, ymin: number, ymax: number, sr?: number):boolean;
        loadRegionListByRegion(region: string): boolean;
    }

    class RegionService extends WiM.Services.HTTPServiceBase {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public regionList: Array<Models.IRegion>;
        
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService) {
            super($http, configuration.baseurls['StreamStats']);
            this.regionList = [];
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public loadRegionListByExtent(xmin:number,xmax:number,ymin:number,ymax:number, sr:number=4326) {
        //    clear List
            this.regionList.length =0;//clear array
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

            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(configuration.queryparams['regionService'],WiM.Services.Helpers.methodType.GET,'json');
            request.params = input;

            this.Execute(request).then(
                (response: any) => {
                    response.data.results.map((item) => {
                        var region = this.getRegion(item.attributes.st_abbr);
                        if(region != null) this.regionList.push(region);
                    });
                },(error) => {
                    return this.$q.reject(error.data)
                });
        }
        public loadRegionListByRegion(c: string): boolean{
            this.regionList.length = 0;//clear array;
            var selectedRegion = this.getRegion(c);
            if (selectedRegion == null) return false;

            this.regionList.push(selectedRegion);
            return true;
        }
        //HelperMethods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private getRegion(lookupID: string): Models.IRegion {
            var regionArray: Array<Models.IRegion> = configuration.regions;

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

    factory.$inject = ['$http', '$q'];
    function factory($http: ng.IHttpService, $q: ng.IQService) {
        return new RegionService($http, $q)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.RegionService', factory)
}//end module 