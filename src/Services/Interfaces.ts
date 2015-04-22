module StreamStats.ServiceAgent {
    'use strict';
    export interface IScenarioAgent {
        canInit: boolean;
        canLoad: boolean;
        canRun: boolean;

        Init(): Models.IScenario;
        Load(scenario: Models.IScenario): boolean;
        Run(scenario: Models.IScenario): boolean;
    }

    export interface IFDCTMAgent {

    }
}//end module