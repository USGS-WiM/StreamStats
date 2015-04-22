//------------------------------------------------------------------------------
//----- AuthenticationBase -----------------------------------------------------
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
//https://www.sitepen.com/blog/2014/08/22/advanced-typescript-concepts-classes-types/
//http://blog.oio.de/2014/01/31/an-introduction-to-typescript-module-system/

//Comments
//03.26.2015 jkn - Created

//Import
declare var configuration: any;
///<reference path="../Scripts/typings/angularjs/angular.d.ts" />

module WiM.Services {
    'use strict';
    export interface IAuthenticationBase{
        SetTokenAuthentication(uri: string, password:string): void;
        SetBasicAuthentication(uri: string, password:string): void;
    }
    export interface IUser {
        username: string;
        role: string;
    }
    
    export class AuthenticationServiceAgent extends HTTPServiceBase implements IAuthenticationBase {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private User: IUser;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, $q:ng.IQService, baseURL:string, u: IUser) {
            super($http, baseURL);
            this.User = u;
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public SetBasicAuthentication(uri: string, password: string) {

            var request: Helpers.RequestInfo;
            request = new Helpers.RequestInfo(uri);
            var authdata: string;
            try {
                authdata = btoa(this.User.username + ":" + password);
            }
            catch(e){
                authdata = this.encode(this.User.username + ":" + password);
            }
            //set default Authorization header
            this.$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;

            //makes a request to verify authentication
            return this.Execute(request)
                .then((response: ng.IHttpPromiseCallbackArg<string>) => {

            })
        }
        public SetTokenAuthentication(uri:string, password:string) {
            try {
               var request = new Helpers.RequestInfo(uri);

                return this.Execute(request)
                    .then((response: ng.IHttpPromiseCallbackArg<string>) => {
                    //set default Authorization header
                    this.$http.defaults.headers.common['Authorization'] = 'token ' + response.data;
                });
            }
            catch (e) {

            }

        }

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private encode(input: string): string {
            //http://plnkr.co/edit/H4SVl6?p=preview
            var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            try {
                var output = "";
                var chr1: number=NaN;
                var chr2: number =NaN;
                var chr3:number =NaN;
                var enc1: number = NaN;
                var enc2: number = NaN;
                var enc3: number = NaN;
                var enc4: number = NaN;

                var i:number = 0;

                do {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }

                    output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                    chr1 = chr2 = chr3 = NaN;
                    enc1 = enc2 = enc3 = enc4 = NaN;
                } while (i < input.length);

                return output;
            }
            catch (e) {

            }

        }
    }//end class
}//end module