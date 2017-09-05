//https://lgorithms.blogspot.com/2013/07/angularui-router-as-infrastructure-of.html
//https://www.funnyant.com/angularjs-ui-router/
var StreamStats;
(function (StreamStats) {
    //'use strict';
    var config = (function () {
        function config($stateProvider, $urlRouterProvider, $locationProvider, $logProvider, $compilerProvider) {
            this.$stateProvider = $stateProvider;
            this.$urlRouterProvider = $urlRouterProvider;
            this.$locationProvider = $locationProvider;
            this.$logProvider = $logProvider;
            this.$compilerProvider = $compilerProvider;
            this.$stateProvider
                .state("main", {
                url: '/?rcode&workspaceID',
                //reloadOnSearch:true,
                template: '<ui-view/>',
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
                        templateUrl: "Views/navigationview.html",
                        controller: "StreamStats.Controllers.NavbarController"
                    },
                    'report': {
                        templateUrl: "Views/reportview.html",
                        controller: "StreamStats.Controllers.ReportController"
                    }
                }
            }); //end main state 
            this.$urlRouterProvider.otherwise('/');
            this.$locationProvider.html5Mode(true);
            //turns of angular-leaflet console spam
            this.$logProvider.debugEnabled(false);
            //flag for production => remove debug info
            if (configuration.environment == "production")
                this.$compilerProvider.debugInfoEnabled(false);
        } //end constructor
        config.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$logProvider', '$compileProvider'];
        return config;
    }()); //end class
    angular.module('StreamStats', [
        'ui.router', 'ui.bootstrap', 'ui.checkbox',
        'mobile-angular-ui',
        'angulartics', 'angulartics.google.analytics',
        'toaster', 'ngFileUpload',
        'leaflet-directive',
        'StreamStats.Services',
        'StreamStats.Controllers',
        'WiM.Services', 'WiM.Event', 'wim_angular', 'rzModule', 'nvd3'
    ])
        .config(config);
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=config.js.map