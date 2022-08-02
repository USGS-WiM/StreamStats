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
        siteid?: string;
        tabName?: string;
        regionID?: string;
        placeholder?:any
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
                    case SSModalType.e_exploration:
                        return {
                            templateUrl: 'Views/explorationview.html',
                            controller: 'StreamStats.Controllers.ExplorationToolsModalController',
                            size: 'sm',
                            backdropClass: 'backdropZ',
                            backdrop: 'static',
                            windowClass: 'windowZ',

                        };
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
                    case SSModalType.e_stormrunnoff:
                        return {
                            templateUrl: 'Views/stormrunoff.html',
                            controller: 'StreamStats.Controllers.StormRunoffController',
                            size: 'lg',
                            backdropClass: 'backdropZ',
                            backdrop: 'static',
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
                    case SSModalType.e_navreport:
                        return {
                            templateUrl: 'Views/navreportmodal.html',
                            controller: 'StreamStats.Controllers.NavigationReportModalController',
                            size: 'lg',
                            backdropClass: 'backdropZ',
                            backdrop: 'static',
                            windowClass: 'windowZ'
                        };
                    case SSModalType.e_prosper:
                        return {
                            templateUrl: 'Views/prosperview.html',
                            controller: 'StreamStats.Controllers.ProsperController',
                            size: 'sm',
                            backdropClass: 'backdropZ',
                            backdrop: 'static',
                            windowClass: 'windowZ',

                        };
                    case SSModalType.e_extensionsupport:
                        return {
                            templateUrl: 'Views/extensionview.html',
                            controller: 'StreamStats.Controllers.ExtensionModalController',
                            size: 'sm',
                            backdropClass: 'backdropZ',
                            backdrop: 'static',
                            windowClass: 'windowZ',
                        };
                    case SSModalType.e_gagepage:
                        return {
                            templateUrl: 'Views/gagepage.html',
                            controller: 'StreamStats.Controllers.GagePageController',
                            size: 'lg',
                            backdropClass: 'backdropZ',
                            backdrop: 'static',
                            windowClass: 'windowZ modal-xl',
                        };

                    case SSModalType.e_nearestgages:
                        return {
                            templateUrl: 'Views/nearestgages.html',
                            controller: 'StreamStats.Controllers.NearestGagesController',
                            size: 'lg',
                            backdropClass: 'backdropZ',
                            backdrop: 'static',
                            windowClass: 'windowZ modal-xl',
                        };                    
                    case SSModalType.e_flowanywhere:
                        return {
                            templateUrl: 'Views/flowanywhere.html',
                            controller: 'StreamStats.Controllers.FlowAnywhereController',
                            size: 'sm',
                            backdropClass: 'backdropZ',
                            backdrop: 'static',
                            windowClass: 'windowZ',
                        };
     
                    default:
                        return null;
                }//end switch          
            }
            catch (e) {
                //this.sm(new MSG.NotificationArgs(e.message, MSG.NotificationType.INFORMATION, 1.5));
                return null;
            }
        }

    }//end class
export enum SSModalType {
        e_report = 1,
        e_wateruse = 2,
        e_about = 3,
        e_help = 4,
        e_navreport = 5,
        e_exploration = 6,
        e_stormrunnoff = 7,
        e_prosper = 8,
        e_extensionsupport = 9,
        e_gagepage = 10,
        e_nearestgages = 11,        
        e_flowanywhere = 12
        
        
    }

    factory.$inject = ['$modal'];
    function factory($modal: ng.ui.bootstrap.IModalService) {
        return new ModalService($modal)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.ModalService', factory)
}//end module  