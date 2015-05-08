///<reference path="../typings/angular-ui-router/angular-ui-router.d.ts" />
//http://lgorithms.blogspot.com/2013/07/angularui-router-as-infrastructure-of.html
//http://www.funnyant.com/angularjs-ui-router/
var StreamStats;
(function (StreamStats) {
    'use strinct';
    var config = (function () {
        function config($stateProvider, $urlRouterProvider) {
            this.$stateProvider = $stateProvider;
            this.$urlRouterProvider = $urlRouterProvider;
            this.$stateProvider.state("main", {
                url: '/?region',
                reloadOnSearch: false,
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
                        templateUrl: "Views/navigationview.html"
                    }
                }
            }); //end main state 
            this.$urlRouterProvider.when('', '/');
        } //end constructor
        config.$inject = ['$stateProvider', '$urlRouterProvider'];
        return config;
    })(); //end class
    angular.module('StreamStats', [
        "ui.router",
        'ui.bootstrap',
        "ngAnimate",
        "leaflet-directive",
        "StreamStats.Services",
        "StreamStats.Controllers",
        'WiM.Services'
    ]).config(config);
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=config.js.map