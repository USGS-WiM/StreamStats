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
        RegionList: Array<Models.IRegion>;
        LoadRegions(xmin: number, xmax: number, ymin: number, ymax: number, sr?: number);
    }

    class RegionService extends WiM.Services.HTTPServiceBase {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public RegionList: Array<Models.IRegion>;
        
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService) {
            super($http, configuration.baseurls['StreamStats']);
            this.RegionList = [];
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public LoadRegions(xmin:number,xmax:number,ymin:number,ymax:number, sr:number=4326) {
        //    clear List
            this.RegionList.length =0;//clear array
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
                        this.RegionList.push(new Models.Region(item.attributes.st_abbr, item.value));
                    });
                },(error) => {
                    return this.$q.reject(error.data)
                });
        }

        //HelperMethods
        //-+-+-+-+-+-+-+-+-+-+-+-

    }//end class

    factory.$inject = ['$http', '$q'];
    function factory($http: ng.IHttpService, $q: ng.IQService) {
        return new RegionService($http, $q)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.RegionService', factory)
}//end module 