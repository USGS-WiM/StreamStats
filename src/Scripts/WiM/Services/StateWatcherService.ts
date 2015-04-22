module WiM.Services {
    'use strict'
  
    class StateWatcherService {
        constructor(private $rootScope: ng.IRootScopeService) {
            $rootScope.$on('$stateChangeStart', this.stateChangeStart);
            $rootScope.$on('$stateChangeSuccess', this.stateChangeSuccess);
            $rootScope.$on('$stateChangeError', this.stateChangeError);
            $rootScope.$on('$stateNotFound', this.stateNotFound);
        }

        private stateChangeStart(event, toState, toParams, fromState, fromParams) {
            console.log('state change start',event, toState,toParams,fromState,fromParams);
        }
        private stateChangeSuccess(event, toState, toParams, fromState, fromParams) {
            console.log('state change success', event, toState, toParams, fromState, fromParams);
        }
        private stateChangeError(event, toState, toParams, fromState, fromParams, error) {
            console.log('state change error', event, toState, toParams, fromState, fromParams, error);
        }
        private stateNotFound(event, unfoundState, toParams, fromState, fromParams) {
            console.log('state not found', event, unfoundState, toParams, fromState, fromParams);
        }

    }//end class

    factory.$inject = ['$rootScope'];
    function factory($rootScope:ng.IRootScopeService) {
        return new StateWatcherService($rootScope)
    }
    angular.module('WiM.Services')
        .factory('WiM.Services.StateWatcherService',factory)
}//end module