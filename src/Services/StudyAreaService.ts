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
    export interface IStudyAreaService {
        loadStudyBoundary(sa: Models.IStudyArea);
    }
    class StudyAreaService extends WiM.Services.HTTPServiceBase implements IStudyAreaService {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-


        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService) {
            super($http, configuration['StreamStats'])
        }
        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public loadStudyBoundary(sa: Models.IStudyArea) {

            var url = configuration.requests['SSdelineation'].format(sa.RegionID, sa.Pourpoint.Longitude.toString(),
                sa.Pourpoint.Latitude.toString(), sa.Pourpoint.crs.toString(), false)
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url);

            this.Execute(request).then(
                (response) => {
                    sa.Basin = response.hasOwnProperty("delineatedbasin") ? response["delineatedbasin"].features[0] : null;
                    sa.WorkspaceID = response.hasOwnProperty("workspaceID") ? response["workspaceID"] : null;
                    //sm when complete
                },(error) => {
                    //sm when complete
                });
        }
        public loadParameters(sa: Models.IStudyArea, params:Array<WiM.Models.IParameter>=[]) {
            if (!sa.WorkspaceID || !sa.RegionID) return;//sm study area is incomplete
            var paramsToCalc: Array<WiM.Models.IParameter> = params.length < 1 ? sa.Parameters : params;
            if (paramsToCalc.length < 1) return;

            var url = configuration.requests['SSparams'].format(sa.RegionID, sa.WorkspaceID,
                paramsToCalc.map((param: WiM.Models.IParameter) => { param.code }).join(';'));

            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url);

            this.Execute(request).then(
                (response) => {
                    var msg: string;
                    response.hasOwnProperty("parameters") ? this.loadParameterResults(response["parameters"],sa) : [];
                   //sm when complete
                },(error) => {
                    //sm when complete
                });
        }

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-       
        private loadParameterResults(results:Array<WiM.Models.IParameter>, sa: Models.IStudyArea) {
            for (var i: number = 0; i < results.length; i++) {
                for (var j: number = 0; j < sa.Parameters.length; j++) {
                    if (results[i].code.toUpperCase().trim() === sa.Parameters[j].code.toUpperCase().trim()) {
                        sa.Parameters[j].value = results[i].value;
                        break;//exit loop
                    }//endif
                }//next sa Parameter
            }//next result
        }

    }//end class

    factory.$inject = ['$http', '$q'];
    function factory($http: ng.IHttpService, $q: ng.IQService) {
        return new StudyAreaService($http,$q)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.StudyAreaService', factory)
}//end module