//------------------------------------------------------------------------------
//----- NavbarController ------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2014 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping


//   purpose:  

//discussion:   Controllers are typically built to reflect a View. 
//              and should only contailn business logic needed for a single view. For example, if a View 
//              contains a ListBox of objects, a Selected object, and a Save button, the Controller 
//              will have an ObservableCollection ObectList, 
//              Model SelectedObject, and SaveCommand.

//Comments
//04.14.2015 jkn - Created

//Imports"
module StreamStats.Controllers {
    'use strinct';
    interface INavbarControllerScope extends ng.IScope {
        vm: NavbarController;
    }
    interface INavbarController {
    }

    class NavbarController implements INavbarController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public open: any;


        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$modal', 'StreamStats.Services.StudyAreaService'];
        constructor($scope: INavbarControllerScope, $modal: ng.ui.bootstrap.IModalService, studyArea: Services.IStudyAreaService) {
            $scope.vm = this;

            console.log('sa1', studyArea);
  
            this.open = function () {

                this.modalInstance = $modal.open({
                    templateUrl: 'Views/reportview.html',
                    controller: 'StreamStats.Controllers.ReportController',
                    size: 'lg',
                    backdropClass: 'backdropZ',
                    windowClass: 'windowZ'
                });
            }           
            
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-


        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-


    }//end class
    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.NavbarController', NavbarController)

}//end module
  