//------------------------------------------------------------------------------
//----- reportService -----------------------------------------------------
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
//06.16.2015 mjs - Created

//Import
module StreamStats.Services {
    'use strict'
    export interface IreportService {
        openReport();
    }

    class reportService implements IreportService{       
        //Events
        //-+-+-+-+-+-+-+-+-+-+-+-


        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public modal: ng.ui.bootstrap.IModalService;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($modal: ng.ui.bootstrap.IModalService) {
            this.modal = $modal;
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public openReport() {
            console.log('in report open function');

            var modalInstance = this.modal.open({
                templateUrl: 'Views/reportview.html',
                controller: 'StreamStats.Controllers.ReportController',
                size: 'lg',
                backdropClass: 'backdropZ',
                windowClass: 'windowZ'
            });
        }  


        //HelperMethods
        //-+-+-+-+-+-+-+-+-+-+-+-

    }//end class

    factory.$inject = ['$modal'];
    function factory($modal: ng.ui.bootstrap.IModalService) {
        return new reportService($modal)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.ReportService', factory)
}//end module  