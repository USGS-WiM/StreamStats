var WiM;
(function (WiM) {
    var Services;
    (function (Services) {
        'use strict';
        var StateWatcherService = (function () {
            function StateWatcherService($rootScope) {
                this.$rootScope = $rootScope;
                $rootScope.$on('$stateChangeStart', this.stateChangeStart);
                $rootScope.$on('$stateChangeSuccess', this.stateChangeSuccess);
                $rootScope.$on('$stateChangeError', this.stateChangeError);
                $rootScope.$on('$stateNotFound', this.stateNotFound);
            }
            StateWatcherService.prototype.stateChangeStart = function (event, toState, toParams, fromState, fromParams) {
                console.log('state change start', event, toState, toParams, fromState, fromParams);
            };
            StateWatcherService.prototype.stateChangeSuccess = function (event, toState, toParams, fromState, fromParams) {
                console.log('state change success', event, toState, toParams, fromState, fromParams);
            };
            StateWatcherService.prototype.stateChangeError = function (event, toState, toParams, fromState, fromParams, error) {
                console.log('state change error', event, toState, toParams, fromState, fromParams, error);
            };
            StateWatcherService.prototype.stateNotFound = function (event, unfoundState, toParams, fromState, fromParams) {
                console.log('state not found', event, unfoundState, toParams, fromState, fromParams);
            };
            return StateWatcherService;
        })(); //end class
        factory.$inject = ['$rootScope'];
        function factory($rootScope) {
            return new StateWatcherService($rootScope);
        }
        angular.module('WiM.Services').factory('WiM.Services.StateWatcherService', factory);
    })(Services = WiM.Services || (WiM.Services = {}));
})(WiM || (WiM = {})); //end module
//# sourceMappingURL=StateWatcherService.js.map