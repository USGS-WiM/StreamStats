//------------------------------------------------------------------------------
//----- About ---------------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2016 WiM - USGS
//    authors:  Martyn J. Smith USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:
//Comments
//03.07.2016 mjs - Created
//Import
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use string';
        var AboutController = (function (_super) {
            __extends(AboutController, _super);
            function AboutController($scope, $http, modalService, region, studyAreaService, modal) {
                _super.call(this, $http, 'http://ssdev.cr.usgs.gov');
                $scope.vm = this;
                this.modalInstance = modal;
                this.modalService = modalService;
                this.StudyArea = studyAreaService.selectedStudyArea;
                this.regionService = region;
                this.selectedAboutTabName = "about";
                this.init();
            }
            //Methods  
            //-+-+-+-+-+-+-+-+-+-+-+-
            AboutController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            AboutController.prototype.selectAboutTab = function (tabname) {
                if (this.selectedAboutTabName == tabname)
                    return;
                this.selectedAboutTabName = tabname;
                //console.log('selected tab: '+tabname);
            };
            AboutController.prototype.getRegionHelpArticle = function () {
                $('#supportContent').html('<h3>No State or Region Selected</h3>');
                var regionID;
                if (this.modalService.modalOptions) {
                    if (this.modalService.modalOptions.tabName)
                        this.selectAboutTab(this.modalService.modalOptions.tabName);
                    regionID = this.modalService.modalOptions.regionID;
                }
                if (this.regionService.selectedRegion)
                    regionID = this.regionService.selectedRegion.Name;
                if (!regionID)
                    return;
                console.log("Trying to open help page for: ", regionID);
                var headers = {
                    "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
                };
                var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.RegionInfo;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                this.Execute(request).then(function (response) {
                    console.log('Successfully retrieved support desk request: ', response);
                    response.data.folder.articles.forEach(function (article) {
                        if (article.title == regionID) {
                            console.log("Help article found for : ", regionID);
                            $('#supportContent').html('<h3>StreamStats for ' + regionID + '</h3>' + article.description);
                            return;
                        }
                        else {
                            console.log("No help article found");
                            $('#supportContent').html('<h3>No help article found for ' + regionID + '</h3>');
                        }
                    });
                }, function (error) {
                    //sm when error
                }).finally(function () {
                });
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            AboutController.prototype.init = function () {
                //console.log("in about controller");
                this.getRegionHelpArticle();
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            AboutController.$inject = ['$scope', '$http', 'StreamStats.Services.ModalService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', '$modalInstance'];
            return AboutController;
        })(WiM.Services.HTTPServiceBase); //end  class
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.AboutController', AboutController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=AboutController.js.map