//------------------------------------------------------------------------------
//----- modalService -----------------------------------------------------
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
    export interface IModalService {
        openModal(mType: SSModalType, options?: IModalOptions);
        modalOptions: IModalOptions;
    }

    export interface IModalOptions {
        tabName: string;
        regionID: string;
    }

    class ModalService implements IModalService{       
        //Events
        //-+-+-+-+-+-+-+-+-+-+-+-


        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public modal: ng.ui.bootstrap.IModalService;
        public modalOptions: IModalOptions;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($modal: ng.ui.bootstrap.IModalService) {
            this.modal = $modal;
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public openModal(mType: SSModalType, options: IModalOptions = null) {
            
            if (options) {
                this.modalOptions = options
                console.log('in modal open function', this.modalOptions);
            }
            this.modal.open(this.getModalSettings(mType));
        }  


        //HelperMethods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private getModalSettings(mType: SSModalType): ng.ui.bootstrap.IModalSettings {
            //console.log('in canUpdateProcedure');
            //Project flow:
            var msg: string;
            try {
                switch (mType) {
                    case SSModalType.e_report:
                        return {
                            templateUrl: 'Views/reportview.html',
                            controller: 'StreamStats.Controllers.ReportController',
                            size: 'lg',
                            backdropClass: 'backdropZ',
                            windowClass: 'windowZ',

                        };
                    case SSModalType.e_wateruse:
                        return {
                            templateUrl: 'Views/wateruse.html',
                            controller: 'StreamStats.Controllers.WateruseController',
                            size: 'lg',
                            backdropClass: 'backdropZ',
                            backdrop:'static',
                            windowClass: 'windowZ'
                        };
                    case SSModalType.e_about:
                        return {
                            templateUrl: 'Views/about.html',
                            controller: 'StreamStats.Controllers.AboutController',
                            size: 'lg',
                            backdropClass: 'backdropZ',
                            backdrop: 'static',
                            windowClass: 'windowZ'
                        };
                    case SSModalType.e_help:
                        return {
                            templateUrl: 'Views/help.html',
                            controller: 'StreamStats.Controllers.HelpController',
                            size: 'lg',
                            backdropClass: 'backdropZ',
                            backdrop: 'static',
                            windowClass: 'windowZ'
                        };
     
                    default:
                        return false;
                }//end switch          
            }
            catch (e) {
                //this.sm(new MSG.NotificationArgs(e.message, MSG.NotificationType.INFORMATION, 1.5));
                return false;
            }
        }

    }//end class
    export enum SSModalType {
        e_report = 1,
        e_wateruse = 2,
        e_about = 3,
        e_help =4
        
    }

    factory.$inject = ['$modal'];
    function factory($modal: ng.ui.bootstrap.IModalService) {
        return new ModalService($modal)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.ModalService', factory)
}//end module  