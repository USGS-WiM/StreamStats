//------------------------------------------------------------------------------
//----- DelineationService -----------------------------------------------------
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
///<reference path="../Scripts/typings/angularjs/angular.d.ts" />
///<reference path="../Scripts/WiM/Models/Point.ts" />
///<reference path="../Scripts/WiM/Services/HTTPServiceBase.ts" />
///<reference path="../Scripts/WiM/Services/Helpers/RequestInfo.ts" />
module StreamStats.Services {
    'use strict'
    export interface IStreamStatsService{
        getRegionList(point: WiM.Models.IPoint):ng.IPromise<Array<Models.IRegion>>;
    }

    class StreamStatsService extends WiM.Services.HTTPServiceBase {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q:ng.IQService) {
            super($http, configuration.requests['StreamStats']);
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public getRegionList(point: WiM.Models.IPoint): ng.IPromise<Array<string>> {
            return this.Execute(null);
        }
        //public AddStudyBoundary() {
        //    var sa: Models.IStudyArea = this.SelectedStudyArea;

        //    var url = configuration.requests['SSdelineation'].format(sa.RegionID, sa.Pourpoint.Longitude.toString(),
        //        sa.Pourpoint.Latitude.toString(), sa.Pourpoint.crs.toString(), false)
        //    var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url);
        
        //    this.Execute(request).then(
        //        (response) => {
        //            sa.Basin = response.hasOwnProperty("delineatedbasin") ? response["delineatedbasin"].features[0] : null;
        //            sa.WorkspaceID = response.hasOwnProperty("workspaceID") ? response["workspaceID"] : null;
        //        },(error) => {
        //            return this.$q.reject(error.data)
        //        });

        //    this.SetSelectedStudy(sa);
        //}

        //public SetSelectedStudy(sa:Models.IStudyArea) {
        //    var saIndex: number = this.StudyAreaList.indexOf(sa);
        //    if (saIndex <= 0) throw new Error("Study area not in collection");

        //    this.SelectedStudyArea = this.StudyAreaList[this.StudyAreaList.indexOf(sa)]
        //}

        //HelperMethods
        //-+-+-+-+-+-+-+-+-+-+-+-

    }//end class

    factory.$inject = ['$http','$q'];
    function factory($http: ng.IHttpService, $q:ng.IQService) {
        return new StreamStatsService($http, $q)
    }
    angular.module('StreamStats.Services ')
        .factory('StreamStats.Services.StreamStatsService', factory)
}//end module