//------------------------------------------------------------------------------
//----- ReportrController ------------------------------------------------------
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
    interface IReportControllerScope extends ng.IScope {
        vm: ReportController;
    }
    interface IReportController {
    }

    class ReportController implements IReportController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public close: any;
        public print: any;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$modalInstance'];
        constructor($scope: IReportControllerScope, $modalInstance: ng.ui.bootstrap.IModalServiceInstance) {
            $scope.vm = this;

            
            this.close = function () {
                $modalInstance.dismiss('cancel');
            };

            this.print = function () {
                window.print();
            };
            

        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-


        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-


    }//end class
    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.ReportController', ReportController)

}//end module
   