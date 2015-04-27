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
///<reference path="../../typings/angularjs/angular.d.ts" />
///<reference path="../../bower_components/wim_angular/src/Models/Point.ts" />
///<reference path="../../bower_components/wim_angular/src/Services/HTTPServiceBase.ts" />
///<reference path="../../bower_components/wim_angular/src/Services/Helpers/RequestInfo.ts" />
module StreamStats.Services {
    'use strict'

    class StreamStatsService extends WiM.Services.HTTPServiceBase {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public StudyAreaList: Array<Models.IStudyArea>;
        public SelectedStudyArea: Models.IStudyArea
        
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService) {
            super($http, configuration.requests['StreamStats']);
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public AddStudyBoundary() {
            var sa: Models.IStudyArea = this.SelectedStudyArea;

            var url = configuration.requests['SSdelineation'].format(sa.RegionID, sa.Pourpoint.Longitude.toString(),
                sa.Pourpoint.Latitude.toString(), sa.Pourpoint.crs.toString(), false)
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url);

            this.Execute(request).then(
                (response) => {
                    sa.Basin = response.hasOwnProperty("delineatedbasin") ? response["delineatedbasin"].features[0] : null;
                    sa.WorkspaceID = response.hasOwnProperty("workspaceID") ? response["workspaceID"] : null;
                },(error) => {
                    return this.$q.reject(error.data)
                });

            this.SetSelectedStudy(sa);
        }
        public AddStudyParameters() {

        }
        public SetSelectedStudy(sa: Models.IStudyArea) {
            var saIndex: number = this.StudyAreaList.indexOf(sa);
            if (saIndex <= 0) throw new Error("Study area not in collection");

            this.SelectedStudyArea = this.StudyAreaList[this.StudyAreaList.indexOf(sa)]
        }

        //HelperMethods
        //-+-+-+-+-+-+-+-+-+-+-+-

    }//end class

    factory.$inject = ['$http', '$q'];
    function factory($http: ng.IHttpService, $q: ng.IQService) {
        return new StreamStatsService($http, $q)
    }
    angular.module('WiM.Services')
        .factory('WiM.Services.DelineationService', factory)
}//end module 