var StreamStats;
(function (StreamStats) {
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
                template: '<ui-view/>',
                views: {
                    'map': {
                        templateUrl: "Views/mapview.html",
                        controller: "StreamStats.Controllers.MapController"
                    },
                    'sidebar': {
                        templateUrl: "Views/sidebarview.html",
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
            });
            this.$urlRouterProvider.otherwise('/');
            this.$locationProvider.html5Mode(true);
            this.$logProvider.debugEnabled(false);
            if (configuration.environment == "production")
                this.$compilerProvider.debugInfoEnabled(false);
        }
        config.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$logProvider', '$compileProvider'];
        return config;
    }());
    angular.module('StreamStats', [
        'ui.router', 'ui.bootstrap', 'ui.checkbox',
        'mobile-angular-ui',
        'angulartics', 'angulartics.google.analytics',
        'toaster', 'ngFileUpload',
        'leaflet-directive',
        'StreamStats.Services',
        'StreamStats.Controllers',
        'WiM.Services', 'WiM.Event', 'wim_angular', 'rzModule', 'nvd3', 'daterangepicker'
    ])
        .config(config);
})(StreamStats || (StreamStats = {}));
