//Controller for Envelope Curve Plots
        //Import
        module StreamStats.Controllers {
            'use strict';
            interface IEnvelopeCurveScope extends ng.IScope {
                vm: IEnvelopeCurveController;
            }

            interface IModal {
                Close():void
            }
            
            interface IEnvelopeCurveController extends IModal {
            }
            class EnvelopeCurveController implements IEnvelopeCurveController{
                //Properties
                //-+-+-+-+-+-+-+-+-+-+-+-
                public sce: any;
                private _results: Services.IProsperPredictionResults;
                public get Location() {
                    return this._results.point;
                }
                public get Date() {
                    return this._results.date;
                }
                private _table:any
                public get Table(): any {
                    return this._table
                }
                private modalInstance: ng.ui.bootstrap.IModalServiceInstance;    
                //private _prosperServices: Services.IProsperService;
                private _resultsAvailable: boolean;
                public get ResultsAvailable():boolean {
                    return this._resultsAvailable;
                }
                public convertUnsafe(x: string) {
                    return this.sce.trustAsHtml(x);
                };
                public get Description():string {
                    var desc = "The PRObability of Streamflow PERmanence (PROSPER) model provides annual (2004-2016)" +
                        " streamflow permanence probabilities (SPPs; probabilistic predictions) and streamflow permanence" +
                        " classes (SPCs; categorical wet/ dry with an associated confidence level). Probabilities are of a stream" +
                        " channel having year- round flow at a 30- m spatial resolution. Model methods, output, and appropriate" +
                        " uses are detailed in Jaeger et al. (2018). Interpretation of a pixel as wet or dry will be based on" +
                        " combined consideration of the SPP, the sign of the SPC (negative for dry, positive for wet), and the" +
                        " associated confidence (1 - 5 representing 50% - 95 %). For example, predictions with a negative" +
                        " (positive) sign, high confidence level indicated by an SPC of - 5(5), and an SPP of less than (greater" +
                        " than) 0.5 will be the most reliable." +
                        "<a href = 'https://doi.org/10.1016/j.hydroa.2018.100005' target = '_blank' > Click here for more information.</a><br><br><b>Contact " +
                        "information:</b><br>Roy Sando<br>U.S. Geological Survey, Wyoming-Montana Water Science Center<br>Email: <a href='mailto:tsando@usgs.gov' target='_blank'>tsando@usgs.gov</a> <br>Phone: 406-457-5953";
                    return this.sce.trustAsHtml(desc);
                }
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$modalInstance', '$sce','StreamStats.Services.ProsperService'];
        constructor($scope: IEnvelopeCurveScope, modal: ng.ui.bootstrap.IModalServiceInstance, $sce: any, pservices:StreamStats.Services.IProsperService) {
            $scope.vm = this;
            this.sce = $sce;
            this.modalInstance = modal;           
            this.init();   
        }

        private init(): void {   
        }
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-

        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }
    }
    
    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.EnvelopeCurveController', EnvelopeCurveController);
}//end module 