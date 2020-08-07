//------------------------------------------------------------------------------
//----- ExplorationToolsModalController ----------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2019 WiM - USGS

//    authors:  Jeremy K. Newson USGS Web Informatics and Mapping
//             
// 
//   purpose:  Example of Modal Controller
//          
//discussion:


//Comments
//07.24.2019 jkn - Created

//Import

module StreamStats.Controllers {
    'use string';
    interface IExtensionModalControllerScope extends ng.IScope {
        vm: IExtensionModalController;
    }
    interface IModal {
        close(): void
    }
    interface IExtensionModalController extends IModal {
    }
    interface IDateRange {
        dates: {
            startDate: Date;
            endDate: Date;
        }
        minDate?: Date;
        maxDate?: Date;
    }
    class ExtensionModalController implements IExtensionModalController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        private explorationService: Services.IExplorationService;
        private studyAreaService: Services.IStudyAreaService;

        public angulartics: any;
        public title: string;
        public isBusy: boolean = false;
        
        //QPPQ
        public dateRange: IDateRange = null;
        public dateRangeOptions;
        public selectedReferenceGage: StreamStats.Models.IReferenceGage = null;
        public referenceGageList: Array<StreamStats.Models.IReferenceGage>
        
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$analytics', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.StudyAreaService'];
        constructor($scope: IExtensionModalControllerScope, $analytics, modal: ng.ui.bootstrap.IModalServiceInstance, modalservice: Services.IModalService, studyArea: Services.IStudyAreaService) {
            $scope.vm = this;
            this.angulartics = $analytics;
            this.modalInstance = modal;
            this.studyAreaService = studyArea; 
            this.dateRangeOptions = {
                locale: { format: 'MMMM D, YYYY' },
                eventHandlers: { 'hide.daterangepicker': (e) => this.SetExtensionDate(e) }
            };

            this.init();
            this.load();            
        }
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public close(): void {
            this.modalInstance.dismiss('cancel');
        }
        public ok(): void {
            //validate info
            if (this.verifyExtensionCanContinue()) {
                this.close();
            }
            
        }
        public setReferenceGageFromMap(name) {
            this.isBusy = true;
            this.studyAreaService.doQueryNWIS = true;
            this.modalInstance.dismiss('cancel');
        }
        public setBestCorrelatedReferenceGage() {
            //subscribe
            this.isBusy = true;
            this.studyAreaService.onStudyAreaServiceBusyChanged.subscribe( new WiM.Event.EventHandler<WiM.Event.EventArgs>(() => {
                this.onStudyServiceBusyChanged();
            }));
            this.studyAreaService.GetKriggedReferenceGages();
        }
        public SetExtensionDate(event) {
            //set selected dates to 
            var dates: Array<any> = this.getExtensionParameters(['sdate', 'edate']);
            dates.forEach(dt => {
                if (dt.code === "sdate") dt.value = this.dateRange.dates.startDate;
                if (dt.code === "edate") dt.value = this.dateRange.dates.endDate;
            });
        }
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            //default
            
            this.selectedReferenceGage = null;

            //load from services
            if (this.studyAreaService.selectedStudyAreaExtensions == null) return;
            this.title = this.studyAreaService.selectedStudyAreaExtensions.map(c => c.name).join(", ");
            let parameters = this.getExtensionParameters();
            let pcodes =parameters.map(p => p.code)

            if (['sid'].some(r => pcodes.indexOf(r) > -1)) {
                this.selectedReferenceGage = new Models.ReferenceGage("", ""); 
            }//endif
            if (['sdate', 'edate'].every(elem => pcodes.indexOf(elem) > -1))
            {
                this.dateRange = { dates: { startDate: this.addDay(new Date(), -30), endDate: this.addDay(new Date(), -1) }, minDate: new Date(1900, 1, 1), maxDate: this.addDay(new Date(), -1) };
                //set start date
                parameters[pcodes.indexOf('sdate')].value = this.dateRange.dates.startDate;
                parameters[pcodes.indexOf('edate')].value = this.dateRange.dates.endDate;

            }//endif

        }
        private load(): void {
            let parameters:Array<any> = this.getExtensionParameters();

            do {
                let f = parameters.pop();
                if (typeof f.value === 'string') continue;

                if (this.selectedReferenceGage && ['sid'].indexOf(f.code) > -1) {
                    this.selectedReferenceGage = f.value;
                    this.referenceGageList = f.options;
                }
                if (this.dateRange && ['sdate', 'edate'].indexOf(f.code) > -1) {
                    if (f.code == "sdate") this.dateRange.dates.startDate = f.value;
                    if (f.code == "edate") this.dateRange.dates.endDate = f.value;
                }
            } while (parameters.length > 0);
           
        }
        private verifyExtensionCanContinue(): boolean {

            //check dates
            if (this.dateRange) {
                if (!((this.dateRange.dates.startDate <= this.dateRange.maxDate || this.dateRange.dates.endDate <= this.dateRange.maxDate) &&
                    (this.dateRange.dates.startDate >= this.dateRange.minDate || this.dateRange.dates.endDate >= this.dateRange.minDate) &&
                    (this.dateRange.dates.startDate <= this.dateRange.dates.endDate))) {

                    return false;
                }
            }

            if (this.selectedReferenceGage) {
                if (this.selectedReferenceGage.StationID == "")
                {
                    return false;
                }
            }
            //load service
            this.studyAreaService.selectedStudyAreaExtensions.forEach(ext => {
                ext.parameters.forEach(p => {
                    if (p.code == "sid") { p.value = this.selectedReferenceGage.StationID };
                })
            });

            return true;
        }
        private addDay(d: Date, days: number): Date {
            try {
                var dayAsTime: number = 1000 * 60 * 60 * 24;
                return new Date(d.getTime() + days * dayAsTime);
            }
            catch (e) {
                return d;
            }
        }
        private getExtensionParameters(codes: Array<string> = null): Array<any> {

            var parameters = this.studyAreaService.selectedStudyAreaExtensions.reduce((acc, val) => acc.concat(val.parameters), []);
            if (codes) {
                parameters = parameters.filter(f => { return (codes.indexOf(<string>(f.code)) > -1) });
            }

            return parameters;
        }
        private onStudyServiceBusyChanged() {
            this.studyAreaService.onStudyAreaServiceBusyChanged.unsubscribe(new WiM.Event.EventHandler<WiM.Event.EventArgs>(() => {
                this.onStudyServiceBusyChanged();
            }));

            this.load();
            this.isBusy = false;
        }
    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.ExtensionModalController', ExtensionModalController);
}//end module 