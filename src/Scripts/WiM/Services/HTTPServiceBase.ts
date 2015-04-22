//------------------------------------------------------------------------------
//----- HTTPServiceBase ---------------------------------------------------------------
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
//https://docs.angularjs.org/api/ng/service/$http

//Comments
//03.26.2015 jkn - Created

//Import
///<reference path="../../typings/angularjs/angular.d.ts" />
///<reference path="./Helpers/RequestInfo.ts" />

module WiM.Services{
    'use strict';

    export interface IHTTPServiceBase {
        Execute(request: Helpers.RequestInfo):ng.IPromise<any>        
    }

    export class HTTPServiceBase implements IHTTPServiceBase {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private baseURL: string;
        public $http: ng.IHttpService

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor(http: ng.IHttpService, baseURL:string) {
            this.baseURL = baseURL;
            this.$http = http;
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public Execute<T>(request: Helpers.RequestInfo): ng.IPromise<T> {
            request.url = this.baseURL + request.url;
            return this.$http(request);
        }

        //HelperMethods
        //-+-+-+-+-+-+-+-+-+-+-+-
    }//end class
}//end module 