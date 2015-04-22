//http://txpub.usgs.gov/DSS/search_api/1.0/dataService/dataService.ashx/search?term=05454500&state=%25&topN=100&LATmin=-90&LATmax=90&LONmin=-180&LONmax=180&includeGNIS=true&includeState=true&includeUsgsSiteSW=true&includeUsgsSiteGW=true&includeUsgsSiteSP=false&includeUsgsSiteAT=false&includeUsgsSiteOT=false&includeZIPcodes=true&includeAREAcodes=true&useCommonGnisClasses=false
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

module WiM.Services {
    'use strict'
    export interface ISearchAPIOutput extends Models.IPoint{
        Name: string; //name
        Category: string; //category
        State: string; //state
        County: string; //county
        Elevation: number;  //elev in feet
        Id: string; //GNIS feature ID
        Source: string; //Database source
    }
    export interface ISearchAPIService {
        getLocations(searchTerm: string): ng.IPromise<Array<ISearchAPIOutput>>;
    }
    export class SearchLocation implements ISearchAPIOutput {
        public Name: string; //name
        public Category: string; //category
        public State: string; //state
        public County: string; //county
        public Longitude: number;  //longitude geographic dd;
        public Latitude: number;  //latitude geographic decimal degrees;
        public crs: string;
        public Elevation: number;  //elev in feet
        public Id: string; //GNIS feature ID
        public Source: string; //Database source
        
        constructor(nm:string, ct:string, st:string, lat:number, long:number) {
            this.Name = nm;
            this.Category = ct;
            this.State = st;
            this.Latitude = lat;
            this.Longitude = long;
            this.crs = "4326";
        }
    }
    class SearchAPIService extends HTTPServiceBase implements ISearchAPIService {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public LATmin: number;
        public LATmax: number;
        public LONmin: number;
        public LONmax: number;
        public includeGNIS: boolean;
        public useCommonGnisClasses: boolean;
        public includeUsgsSiteSW: boolean;
        public includeUsgsSiteGW: boolean;
        public includeUsgsSiteSP: boolean;
        public includeUsgsSiteAT: boolean;
        public includeUsgsSiteOT: boolean;
        public includeZIPcodes: boolean;
        public includeAREAcodes: boolean;
        public includeState: boolean;
        public topN: number;
        public debug: boolean;

        
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService) {
            super($http, configuration.baseurls['SearchAPI']);
            this.init();
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public getLocations(searchTerm: string):ng.IPromise<Array<ISearchAPIOutput>> {

            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo("/search");
            request.params = {
                term: searchTerm,
                includeGNIS: this.includeGNIS,
                useCommonGnisClasses : this.useCommonGnisClasses,
                includeUsgsSiteSW : this.includeUsgsSiteSW,
                includeUsgsSiteGW : this.includeUsgsSiteGW,
                includeUsgsSiteSP : this.includeUsgsSiteSP,
                includeUsgsSiteAT : this.includeUsgsSiteAT,
                includeUsgsSiteOT : this.includeUsgsSiteOT,
                includeZIPcodes : this.includeZIPcodes,
                includeAREAcodes : this.includeAREAcodes,
                includeState : this.includeState,
                topN : this.topN,
                debug : this.debug
            }

            return this.Execute<Array<ISearchAPIOutput>>(request).then(
                (response: any) => {                    
                    return response.data.map((item) => {
                        return new SearchLocation(item.nm, item.ct, item.st, item.y,item.x)});
                },(error) => {
                    return this.$q.reject(error.data)
                });
        }


        //HelperMethods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init() {
            this.includeGNIS = true;
            this.useCommonGnisClasses = true;
            this.includeUsgsSiteSW = true;
            this.includeUsgsSiteGW = true;
            this.includeUsgsSiteSP = true;
            this.includeUsgsSiteAT = true;
            this.includeUsgsSiteOT = true;
            this.includeZIPcodes = true;
            this.includeAREAcodes = true;
            this.includeState = true;
            this.topN = 100;
            this.debug = false;
        }

    }//end class

    factory.$inject = ['$http', '$q'];
    function factory($http: ng.IHttpService, $q: ng.IQService) {
        return new SearchAPIService($http, $q)
    }
    angular.module('WiM.Services')
        .factory('WiM.Services.SearchAPIService', factory)
}//end module 