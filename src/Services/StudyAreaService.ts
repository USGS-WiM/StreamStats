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
    export interface IStudyAreaService { }
    class StudyAreaService implements IStudyAreaService {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public RegionList: Array<Models.IRegion>;
        public SelectedRegion: Models.IRegion;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor(private streamStatsService:ISessionService) {
       
        }
        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
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

        //public SetSelectedStudy(sa: Models.IStudyArea) {
        //    var saIndex: number = this.StudyAreaList.indexOf(sa);
        //    if (saIndex <= 0) throw new Error("Study area not in collection");

        //    this.SelectedStudyArea = this.StudyAreaList[this.StudyAreaList.indexOf(sa)]
        //}


    }//end class

    factory.$inject = ['StreamStats.Services.StreamStatsService'];
    function factory(streamStatsService:ISessionService) {
        return new StudyAreaService(streamStatsService)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.StudyAreaService', factory)
}//end module