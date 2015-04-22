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
        constructor(private streamStatsService:IStreamStatsService) {
       
        }
        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public SetRegion(location: WiM.Models.IPoint):void {
            //query point to determine regions
            this.streamStatsService.getRegionList(location).then(
                (response: ng.IHttpPromiseCallbackArg<Array<Models.IRegion>>) => {
                    this.RegionList = response.data.map((item) => { return null });
                });
        }
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-


    }//end class

    factory.$inject = ['StreamStats.Services.StreamStatsService'];
    function factory(streamStatsService:IStreamStatsService) {
        return new StudyAreaService(streamStatsService)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.StudyAreaService', factory)
}//end module