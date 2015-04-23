///<reference path="../typings/angular-ui-router/angular-ui-router.d.ts" />

//http://lgorithms.blogspot.com/2013/07/angularui-router-as-infrastructure-of.html
//http://www.funnyant.com/angularjs-ui-router/
module StreamStats {
    'use strinct';

    class config {
        static $inject = ['$stateProvider','$urlRouterProvider'];
        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {
            this.$stateProvider
                .state("main", {
                url: '/',
                template:'<ui-view/>',
                views: {
                    'map': {
                        templateUrl: "Views/mapview.html",
                        controller: "StreamStats.Controllers.MapController"
                    },
                    'sidebar': {
                        templateUrl: "Views/sidebarview.html",
                        //abstract:true,
                        controller: "StreamStats.Controllers.SidebarController"
                    },
                    'navbar': {
                        templateUrl: "Views/navigationview.html"
                    }
                }
            })//end main state 
                //.state("main.region", {
                //url: '/{region}',
                //views: {
                //    'step1': {
                //        templateUrl: 'Views/SidebarComponents/step1view.html',
                //        controller: "StreamStats.Step1Controller"
                //        //resolve: {
                //        //    //JKN just pass back he param into the controller instead of below where it
                //        //    // calls a service to get the resource
                //        //    initialData: ['$stateParams', function ($stateParams) { return $stateParams.region}]

                //        //}
                //    }
                //}
            //})//end main.iowa state
 
            this.$urlRouterProvider.otherwise('/');                                 
        }//end constructor
    }//end class

    angular.module('StreamStats',[
        "ui.router", 'ui.bootstrap',
        "leaflet-directive",
        "StreamStats.Services",
        "StreamStats.Controllers",
        'WiM.Services'
        ])
        .config(config);
}//end module 