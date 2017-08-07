//------------------------------------------------------------------------------
//----- WaterUse ---------------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use strict';
        var WaterUseReportable = (function () {
            function WaterUseReportable() {
                this.Annual = { Graph: {}, Table: {} };
                this.Monthly = { Graph: { withdrawals: null, returns: null }, Table: {} };
            }
            return WaterUseReportable;
        }());
        var WateruseController = (function (_super) {
            __extends(WateruseController, _super);
            function WateruseController($scope, $http, studyAreaService, modal, $timeout) {
                var _this = _super.call(this, $http, configuration.baseurls.WaterUseServices) || this;
                _this.$timeout = $timeout;
                _this.body = '{"type":"Polygon","coordinates":[[[-75.414964503513744,40.052992191460348],[-75.414068968961445,40.051890623877505],[-75.4083393724269,40.05148979066724],[-75.405938537336425,40.049903313868064],[-75.404298580462665,40.049865862504276],[-75.403850917888008,40.049315036863973],[-75.4007195573264,40.048432549167543],[-75.398343441178653,40.046215768452733],[-75.394102184943549,40.046749275026137],[-75.390172152092575,40.045307567605313],[-75.386055034495143,40.04566342479783],[-75.380446781659145,40.045173859326376],[-75.3792508683386,40.045776984938406],[-75.3774868601255,40.04591648391753],[-75.3765638828088,40.045534773536893],[-75.373514955753166,40.045554434301557],[-75.371079892747616,40.044867411284322],[-75.37109752455963,40.044417314560341],[-75.369695506995271,40.044294764557485],[-75.36671784409333,40.045487205359407],[-75.364151581148164,40.045157395905171],[-75.360566877549758,40.0468762011013],[-75.358238399560847,40.046461681183089],[-75.355700517648046,40.045411529862427],[-75.352112033671858,40.047220086979742],[-75.3507668521583,40.045657004700665],[-75.351249585159692,40.045307853438452],[-75.351178645794292,40.044134879387492],[-75.3490774627431,40.043905669948067],[-75.34822911756099,40.044606686158126],[-75.344722397029713,40.044344582744841],[-75.344012505844759,40.044508193499652],[-75.3432741019001,40.045391947500384],[-75.339973072499518,40.045855322671954],[-75.338958166461467,40.044840436173111],[-75.339370222833779,40.043318353089006],[-75.338607460962777,40.041858855427705],[-75.33972222985642,40.040353228742511],[-75.342625295376038,40.041051884023695],[-75.344619929781771,40.041008419652215],[-75.345596068799665,40.040040109544471],[-75.344598973601876,40.038575176745582],[-75.344865259680134,40.037770482320887],[-75.343392633632973,40.036474625301956],[-75.341171037476428,40.036332548910678],[-75.339045810524226,40.033759922996872],[-75.337519823820742,40.033814269786248],[-75.336058144441083,40.032248257785639],[-75.335097111936747,40.029883047900981],[-75.329692520657346,40.030206638285868],[-75.326063585639531,40.027147871330236],[-75.32565383250828,40.022723168565612],[-75.323990792826493,40.020341309941763],[-75.320953771664563,40.020089504198218],[-75.321643343035845,40.017492764797382],[-75.324712533376655,40.016934381137091],[-75.326781733222973,40.015000828451576],[-75.326597763873,40.013735047447653],[-75.327940463448613,40.009441672225108],[-75.325879881136359,40.008221815734359],[-75.325787913376018,40.007588922622041],[-75.323801434864379,40.007452018311483],[-75.325888293301546,40.005068374593343],[-75.327091127204966,40.004285759896383],[-75.326080628397747,40.003180719091127],[-75.325999419381176,40.002277765533954],[-75.324641400332311,40.001074420490255],[-75.324450336436769,39.999988667258044],[-75.325103711288861,39.998292080818175],[-75.324111269439442,39.996736919837026],[-75.3240587892413,39.995113802640113],[-75.320619391390863,39.993230589459429],[-75.3206588949925,39.992240370067343],[-75.321677747958233,39.99019200299476],[-75.321373322541177,39.989013457632041],[-75.322051791742354,39.986686738433043],[-75.32094256846797,39.985128780349612],[-75.320706401745966,39.98223984336655],[-75.3222433992364,39.978942220706372],[-75.3228657135706,39.975082372610913],[-75.320302354807041,39.97475156212942],[-75.319070724943245,39.970397405749793],[-75.318605861155078,39.9644394365422],[-75.3162517335489,39.964744209142687],[-75.313231652199974,39.964132106172777],[-75.31148953839147,39.96084701778684],[-75.312373215182944,39.959246037152283],[-75.312277840995819,39.958703139481379],[-75.309765614457916,39.957111791813958],[-75.3057776681856,39.957287486539215],[-75.3049465738462,39.954654650795483],[-75.302060768546326,39.950711463484858],[-75.302082451588262,39.950171336381544],[-75.3000096876801,39.949311060974367],[-75.3001700438607,39.948233590119877],[-75.299621422019058,39.947319459439214],[-75.297490862870134,39.947899476833413],[-75.295166202521827,39.947483645347639],[-75.293748221314175,39.947810258257242],[-75.290978375749262,39.949726516092056],[-75.286026050522821,39.950599337154323],[-75.285039442270659,39.951837238084444],[-75.284206142896721,39.952177724458025],[-75.283391029917382,39.9520681021285],[-75.281691183708432,39.95067577102467],[-75.276413097402283,39.948026160105734],[-75.2738144839218,39.948594500311387],[-75.271895654453232,39.949719779630442],[-75.270616409031376,39.949508794101128],[-75.269286050913138,39.947674614976904],[-75.269432266222154,39.946957267939666],[-75.26899736816209,39.946135824040276],[-75.2693373408203,39.943530863839925],[-75.267835300570425,39.943044154360095],[-75.267426065828516,39.94159255963816],[-75.268178961298034,39.940349173169174],[-75.2681168993255,39.938996048217533],[-75.26898669331274,39.937755471223781],[-75.269279084060258,39.936320770526066],[-75.266165957958023,39.932280983782455],[-75.269056376390182,39.930278109846242],[-75.271299893490635,39.929791454508255],[-75.272030667951924,39.92908816218663],[-75.273086635192158,39.929023447865532],[-75.279056719556266,39.92610313435123],[-75.280288204099946,39.927484306997172],[-75.281234497785661,39.927236669811485],[-75.2863674888074,39.924746453650293],[-75.2867836324108,39.923134452502794],[-75.28848578213713,39.921553205991287],[-75.289874206546529,39.921946831184528],[-75.292833262775545,39.921116422825477],[-75.294049471664977,39.919974037475335],[-75.295441517131508,39.920277572575145],[-75.297608528069944,39.921680863695606],[-75.299480330913866,39.92460892323151],[-75.3009677310181,39.925455307204196],[-75.301735583182534,39.926735093941048],[-75.302649281303161,39.927297477941394],[-75.303832943625267,39.926965191484378],[-75.304714180766126,39.928337758873276],[-75.305752066084352,39.928722851662755],[-75.306194514854781,39.929364117159373],[-75.3066998007821,39.931358491602651],[-75.307971604168969,39.931749116638969],[-75.312301621683289,39.931761700582548],[-75.3133953733893,39.933679872458548],[-75.313972847637714,39.933873764439596],[-75.315503775225793,39.933639686617674],[-75.318533280553552,39.933981670962872],[-75.31945592217167,39.931390366460427],[-75.320661100991529,39.930517768337424],[-75.321222080270729,39.928188225864993],[-75.3225476868706,39.927228346324071],[-75.323310154551592,39.925714516765922],[-75.3284367659167,39.926285936747654],[-75.329354257229056,39.926758082703316],[-75.333336760658582,39.926671580209792],[-75.3344016117196,39.932283249993226],[-75.339929488940712,39.931602069181473],[-75.34106319408852,39.932529720915213],[-75.341176001666639,39.93559599004741],[-75.343333786791888,39.937268465912858],[-75.345109237390872,39.936769397344605],[-75.346111942438128,39.938054350339279],[-75.347142808162033,39.941592604785157],[-75.346699567976231,39.94392499551256],[-75.348191541397568,39.944680729332347],[-75.348361521875347,39.946306608431968],[-75.349180221256091,39.946325741553991],[-75.350767943575121,39.947624310292042],[-75.353209912438956,39.948041731458204],[-75.354889914300145,39.949973129944681],[-75.354797790804639,39.952313723191722],[-75.357232874840207,39.952911102324286],[-75.358572812355462,39.954564199288136],[-75.360759923594159,39.955516146443635],[-75.361660710354542,39.959411609612829],[-75.359484316760927,39.96116308136304],[-75.3593640354489,39.9642238448791],[-75.360523604492087,39.967494588325046],[-75.364030800907074,39.973613095256468],[-75.365534220147367,39.974098523930436],[-75.367122914614455,39.97539684640121],[-75.374528858515717,39.983677729899235],[-75.379897886938991,39.984162199507487],[-75.382759083559591,39.982876657586843],[-75.384755469643153,39.982742465252173],[-75.389064292515158,39.983382277036618],[-75.390206544680822,39.98412936827571],[-75.393025617857759,39.983923838980708],[-75.3953032724672,39.985597974776745],[-75.395591526598267,39.987226436070557],[-75.396747872727161,39.987613370162521],[-75.397872846149212,39.988810495279516],[-75.4007095109386,39.98815466298047],[-75.401071056586233,39.987892633639845],[-75.400885761978486,39.986626957215108],[-75.408045410824187,39.986250047100967],[-75.4082343128574,39.987425689170443],[-75.408795158126125,39.988069207783681],[-75.408346804495451,39.990581832055085],[-75.409798846707346,39.992417011247163],[-75.408903163673287,39.994378814467389],[-75.40710233651204,39.995509024955879],[-75.408175512925368,39.998056380022405],[-75.408202233694524,40.000399634200569],[-75.410636064180025,40.0010858760043],[-75.411758039582125,40.0023728782124],[-75.411847340603458,40.003095725304981],[-75.413210429874781,40.004208003552534],[-75.414143447173842,40.004319356566185],[-75.416628740609511,40.006718558074049],[-75.4186978450438,40.00775672381134],[-75.422805555650385,40.007579722880983],[-75.424182730633589,40.008331777319171],[-75.424279079699389,40.008874567670418],[-75.425467028325428,40.008451003057253],[-75.426279605826892,40.008649624435179],[-75.427278037825218,40.010113861450549],[-75.428768940229148,40.010958534118089],[-75.42885843574237,40.011681364905314],[-75.429646940772443,40.0125101192311],[-75.431933363881953,40.01400345270558],[-75.434436727307045,40.012888730087546],[-75.437095124958745,40.013849758207122],[-75.437766675918922,40.01467581304712],[-75.441137973586,40.015382524659195],[-75.442133399988634,40.016936647955383],[-75.443387042052208,40.017865874465166],[-75.447602123865934,40.0179606813325],[-75.449413937886874,40.01962317820449],[-75.4508053306725,40.020014814563119],[-75.451239512382188,40.020925553797106],[-75.452751450289767,40.021229770851761],[-75.45501373267129,40.020289391942264],[-75.460521697282,40.023385950702519],[-75.463442292139959,40.023631409843],[-75.463484557718559,40.025614530691243],[-75.464845559474824,40.026816200267355],[-75.46291749342916,40.028214733432279],[-75.4628630540549,40.029655098166252],[-75.463869398660066,40.03093895252028],[-75.463746947760868,40.034179768721636],[-75.464867093872115,40.035556249888018],[-75.466021272637647,40.036032492235975],[-75.466394597310256,40.038563572162246],[-75.467070153333637,40.039299421781614],[-75.468689515405813,40.039876102766357],[-75.468759108183392,40.041139027168839],[-75.464477923342983,40.042755430078046],[-75.459417499559237,40.043273074258991],[-75.455018820692047,40.044886500044676],[-75.452332538783125,40.047709446330295],[-75.450582311966585,40.047489992836873],[-75.445976273714535,40.0483776360105],[-75.44561115099367,40.048729822348463],[-75.445807739625721,40.049725324695949],[-75.445408338910369,40.050977724034496],[-75.441766606012465,40.051166089001946],[-75.440223137851987,40.051671920664369],[-75.438838022306612,40.051100118128467],[-75.435768221675318,40.051661575729767],[-75.431444233931458,40.051293620571691],[-75.427767936185944,40.05238174591139],[-75.423206200659465,40.05209819451072],[-75.414964503513744,40.052992191460348]]]}';
                $scope.vm = _this;
                _this.modalInstance = modal;
                _this.StudyArea = {}; //studyAreaService.selectedStudyArea;
                _this.init();
                return _this;
            }
            Object.defineProperty(WateruseController.prototype, "StartYear", {
                get: function () {
                    return this._startYear;
                },
                set: function (val) {
                    if (!this.spanYear)
                        this.EndYear = val;
                    if (val <= this.EndYear && val >= this.YearRange.floor)
                        this._startYear = val;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(WateruseController.prototype, "EndYear", {
                get: function () {
                    return this._endYear;
                },
                set: function (val) {
                    if (val >= this.StartYear && val <= this.YearRange.ceil)
                        this._endYear = val;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(WateruseController.prototype, "YearRange", {
                get: function () {
                    return this._yearRange;
                },
                enumerable: true,
                configurable: true
            });
            //Methods  
            //-+-+-+-+-+-+-+-+-+-+-+-
            WateruseController.prototype.GetWaterUse = function () {
                var _this = this;
                this.CanContiue = false;
                //summary?year={0}&endyear={1}&includePermits={2}&includereturns={3}&computeDomestic={4}
                var headers = {
                    "Content-Type": "application/json"
                };
                var url = configuration.queryparams['Wateruse'].format(this.StartYear, this.EndYear, this.includePermits, this.includeReturns, this.computeDomesticWU);
                var request = new WiM.Services.Helpers.RequestInfo(url, false, WiM.Services.Helpers.methodType.POST, "json", this.body);
                this.Execute(request).then(function (response) {
                    _this.showResults = true;
                    //sm when complete
                    _this.result = response.data;
                    if (_this.result.Messages === 'Wateruse not available at specified site.')
                        alert(_this.result.Messages);
                    _this.loadGraphData(WaterUseType.Monthly);
                    _this.loadGraphData(WaterUseType.Annual);
                    _this.ReportData.Monthly.Table = _this.GetTableData(WaterUseType.Monthly);
                    _this.ReportData.Annual.Table = _this.GetTableData(WaterUseType.Annual);
                }, function (error) {
                    var x = error;
                    //sm when error                    
                }).finally(function () {
                    _this.CanContiue = true;
                });
            };
            WateruseController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            WateruseController.prototype.Reset = function () {
                this.init();
            };
            WateruseController.prototype.Print = function () {
                window.print();
            };
            WateruseController.prototype.loadGraphData = function (useType) {
                try {
                    switch (useType) {
                        case WaterUseType.Monthly:
                            //init table
                            var inittable = [];
                            var testx = new Array(12);
                            this.ReportData.Monthly.Graph.withdrawals = [];
                            if (this.result.hasOwnProperty("withdrawal") && this.result.withdrawal.hasOwnProperty("monthly")) {
                                for (var month in this.result.withdrawal.monthly) {
                                    var montlyCodes = this.result.withdrawal.monthly[month]["code"];
                                    for (var code in montlyCodes) {
                                        var itemindex = this.ReportData.Monthly.Graph.withdrawals.findIndex(function (elem) { return elem.key == montlyCodes[code].name; });
                                        if (itemindex < 0) {
                                            var initArray = [];
                                            for (var i = 1; i <= 12; i++) {
                                                initArray.push({ "label": this.getMonth(i), "stack": "withdrawal", value: 0 });
                                            }
                                            itemindex = this.ReportData.Monthly.Graph.withdrawals.push({
                                                "key": montlyCodes[code].name,
                                                "values": initArray
                                            }) - 1;
                                        } //end if
                                        this.ReportData.Monthly.Graph.withdrawals[itemindex].values[+month - 1].value = montlyCodes[code].value;
                                    } //next code       
                                } //next month
                            } //end if
                            this.ReportData.Monthly.Graph.returns = [];
                            if (this.result.hasOwnProperty("return")) {
                                var values = [];
                                for (var month in this.result.return.monthly) {
                                    values.push({
                                        "label": this.getMonth(+month),
                                        "stack": "withdrawal",
                                        "value": this.Sum(this.result.return.monthly[month]["month"], "value")
                                    });
                                } //next month
                                this.ReportData.Monthly.Graph.returns.push({
                                    "key": "returns",
                                    "color": "#ff7f0e",
                                    "values": values
                                });
                            } //end if                              
                            break;
                        case WaterUseType.Annual:
                            this.ReportData.Annual.Graph = [];
                            if (this.result.hasOwnProperty("withdrawal") && this.result.withdrawal.hasOwnProperty("annual")) {
                                for (var annkey in this.result.withdrawal.annual) {
                                    var annItem = this.result.withdrawal.annual[annkey];
                                    this.ReportData.Annual.Graph.push({ name: annItem.name, value: annItem.value });
                                } //next annItem
                            } //end if
                            break;
                    } //end switch
                }
                catch (e) {
                    var x = e;
                }
            };
            WateruseController.prototype.GetTableData = function (useType) {
                var tableFields = [];
                var tableValues = [];
                try {
                    switch (useType) {
                        case WaterUseType.Monthly:
                            //init table
                            for (var i = 1; i <= 12; i++) {
                                tableValues.push({ "month": this.getMonth(i), "returns": { "name": "return", "value": 0 }, "withdrawals": [] });
                            }
                            //returns
                            if (this.result.hasOwnProperty("return") && this.result.withdrawal.hasOwnProperty("monthly")) {
                                for (var item in this.result.return.monthly) {
                                    tableValues[+item - 1].returns.value = this.Sum(this.result.return.monthly[item].month, "value");
                                } //next item
                            } //end if
                            //withdrawals
                            if (this.result.hasOwnProperty("withdrawal") && this.result.withdrawal.hasOwnProperty("monthly")) {
                                for (var mkey in this.result.withdrawal.monthly) {
                                    if (this.result.withdrawal.monthly[mkey].hasOwnProperty("code")) {
                                        var monthlycode = this.result.withdrawal.monthly[mkey].code;
                                        for (var cKey in monthlycode) {
                                            var itemindex = tableFields.findIndex(function (elem) { return elem == monthlycode[cKey].name; });
                                            if (itemindex < 0) {
                                                itemindex = tableFields.push(monthlycode[cKey].name) - 1;
                                                tableValues.forEach(function (ele) { ele.withdrawals.push({ "name": monthlycode[cKey].name, "value": 0 }); });
                                            } //end if
                                            tableValues[+mkey - 1].withdrawals[itemindex].value = monthlycode[cKey].value;
                                        }
                                    } //end if
                                } //next item
                            }
                            break;
                        case WaterUseType.Annual:
                            tableFields = ["", "Average Return", "Average Withdrawal"];
                            var sw = { name: "Surface Water", aveReturn: "---", aveWithdrawal: "---", unit: "MGD" };
                            var gw = { name: "Groundwater", aveReturn: "---", aveWithdrawal: "---", unit: "MGD" };
                            if (this.result.hasOwnProperty("withdrawal") && this.result.withdrawal.hasOwnProperty("annual")) {
                                var annWith = this.result.withdrawal.annual;
                                if (annWith.hasOwnProperty("SW"))
                                    sw.aveWithdrawal = annWith.SW.value.toFixed(3);
                                if (annWith.hasOwnProperty("GW"))
                                    gw.aveWithdrawal = annWith.GW.value.toFixed(3);
                            }
                            if (this.result.hasOwnProperty("return") && this.result.withdrawal.hasOwnProperty("annual")) {
                                var annreturn = this.result.return.annual;
                                if (annreturn.hasOwnProperty("SW"))
                                    sw.aveReturn = annreturn.SW.value.toFixed(3);
                                if (annreturn.hasOwnProperty("GW"))
                                    gw.aveReturn = annreturn.GW.value.toFixed(3);
                            }
                            tableValues.push(sw);
                            tableValues.push(gw);
                            tableValues.push({
                                name: "Total",
                                aveReturn: (isNaN(+sw.aveReturn) && isNaN(+gw.aveReturn)) ? "---" : (isNaN(+sw.aveReturn) ? 0 : +sw.aveReturn) + (isNaN(+gw.aveReturn) ? 0 : +gw.aveReturn),
                                aveWithdrawal: (isNaN(+sw.aveWithdrawal) && isNaN(+gw.aveWithdrawal)) ? "---" : (isNaN(+sw.aveWithdrawal) ? 0 : +sw.aveWithdrawal) + (isNaN(+gw.aveWithdrawal) ? 0 : +gw.aveWithdrawal)
                            });
                            tableValues.push({ name: "", aveReturn: "", aveWithdrawal: "" });
                            if (this.result.hasOwnProperty("TotalTempStats")) {
                                tableValues.push({ name: "Temporary water use registrations (surface water)[permit]", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[2].value.toFixed(3), unit: "MGD" });
                                tableValues.push({ name: "Temporary water use registrations (groundwater[permit])", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[1].value.toFixed(3), unit: "MGD" });
                                tableValues.push({ name: "Temporary water use registrations (total)[permit]", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[0].value.toFixed(3), unit: "MGD" });
                                tableValues.push({ name: "", aveReturn: "", aveWithdrawal: "" });
                                tableValues.push({ name: "Water use index (dimensionless) without temporary registrations:[totalnet/lowflowstat]", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[4].value.toFixed(3), unit: "Dimensionless" });
                                tableValues.push({ name: "Water use index (dimensionless) with temporary registrations:[permit w/ totalnet/lowflow stat]", aveReturn: "", aveWithdrawal: this.result.TotalTempStats[3].value.toFixed(3), unit: "Dimensionless" });
                            } //end if
                            break;
                    } //end switch
                    return {
                        "values": tableValues,
                        "Fields": tableFields
                    };
                }
                catch (e) {
                    return {
                        "values": [],
                        "Fields": []
                    };
                }
            };
            WateruseController.prototype.Reduce = function (array) {
                return array.reduce(function (a, b) {
                    return Number(a) + Number(b.value);
                }, 0);
            };
            WateruseController.prototype.Sum = function (objectsToSum, propertyname) {
                var sum = 0;
                for (var item in objectsToSum) {
                    sum += objectsToSum[item][propertyname];
                } //next item
                return sum;
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            WateruseController.prototype.init = function () {
                var _this = this;
                var url = configuration.queryparams['WateruseConfig'].format('DRB'); //this.StudyArea.RegionID);
                var request = new WiM.Services.Helpers.RequestInfo(url);
                this.Execute(request).then(function (response) {
                    var result = response.data;
                    _this.spanYear = result.minYear != result.maxYear;
                    _this._startYear = result.minYear;
                    _this._endYear = result.maxYear;
                    _this.includePermits = result.hasPermits;
                    _this.includeReturns = result.hasReturns;
                    _this.computeDomesticWU = false;
                    _this._yearRange = { floor: result.minYear, draggableRange: true, noSwitching: true, showTicks: false, ceil: result.maxYear };
                }, function (error) {
                    ;
                    _this._startYear = 2005;
                    _this._endYear = 2012;
                    _this._yearRange = { floor: 2005, draggableRange: true, noSwitching: true, showTicks: false, ceil: 2012 };
                    //sm when error                    
                }).finally(function () {
                    _this.CanContiue = true;
                    _this.showResults = false;
                    _this.SelectedTab = WaterUseTabType.Graph;
                    _this.SelectedWaterUseType = WaterUseType.Annual;
                    _this.ReportData = new WaterUseReportable();
                    _this.MonthlyReportOptions = {
                        chart: {
                            type: 'multiBarHorizontalChart',
                            height: 450,
                            visible: true,
                            stacked: true,
                            showControls: false,
                            margin: {
                                top: 20,
                                right: 30,
                                bottom: 60,
                                left: 55
                            },
                            x: function (d) { return d.label; },
                            y: function (d) { return d.value; },
                            dispatch: {
                                stateChange: function () {
                                    //console.log("StateChange");
                                    //must wrap in timer or method executes prematurely
                                    _this.$timeout(function () {
                                        _this.loadGraphLabels(0);
                                    }, 500);
                                },
                                renderEnd: function () {
                                    //console.log("renderend");
                                    //must wrap in timer or method executes prematurely
                                    _this.$timeout(function () {
                                        _this.loadGraphLabels(0);
                                    }, 500);
                                }
                            },
                            showValues: true,
                            valueFormat: function (d) {
                                return d3.format(',.4f')(d);
                            },
                            tooltip: {
                                valueFormatter: function (d) { return d3.format(',.4f')(d) + " million gal/day"; }
                            },
                            xAxis: {
                                showMaxMin: false
                            },
                            yAxis: {
                                axisLabel: 'Values in million gallons/day',
                                tickFormat: function (d) {
                                    return d3.format(',.3f')(d);
                                }
                            },
                            refreshDataOnly: true
                        }
                    };
                    _this.MonthlyReturnReportOptions = {
                        chart: {
                            type: 'multiBarHorizontalChart',
                            height: 450,
                            visible: true,
                            stacked: false,
                            showControls: false,
                            margin: {
                                top: 20,
                                right: 30,
                                bottom: 60,
                                left: 55
                            },
                            x: function (d) { return d.label; },
                            y: function (d) { return d.value; },
                            showValues: true,
                            valueFormat: function (d) {
                                return d3.format(',.3f')(d);
                            },
                            tooltip: {
                                valueFormatter: function (d) {
                                    return d3.format(',.4f')(d) + " million gal/day";
                                }
                            },
                            xAxis: {
                                showMaxMin: false
                            },
                            yAxis: {
                                axisLabel: 'Values in million gallons/day',
                                tickFormat: function (d) {
                                    return d3.format(',.3f')(d);
                                }
                            }
                        }
                    };
                    _this.AnnualReportOptions = {
                        chart: {
                            type: 'pieChart',
                            height: 500,
                            x: function (d) { return d.name; },
                            y: function (d) { return d.value; },
                            showLabels: true,
                            tooltip: {
                                valueFormatter: function (d) { return d3.format(',.4f')(d) + " million gal/day"; }
                            },
                            duration: 500,
                            labelThreshold: 0.01,
                            labelSunbeamLayout: false,
                            legend: {
                                margin: {
                                    top: 5,
                                    right: 35,
                                    bottom: 5,
                                    left: 0
                                }
                            }
                        }
                    };
                });
            };
            WateruseController.prototype.getMonth = function (index) {
                switch (index) {
                    case 1: return "Jan";
                    case 2: return "Feb";
                    case 3: return "Mar";
                    case 4: return "Apr";
                    case 5: return "May";
                    case 6: return "Jun";
                    case 7: return "Jul";
                    case 8: return "Aug";
                    case 9: return "Sep";
                    case 10: return "Oct";
                    case 11: return "Nov";
                    case 12: return "Dec";
                }
            };
            WateruseController.prototype.getWUText = function (wtype) {
                switch (wtype.toUpperCase()) {
                    case "AQ": return "Aquaculture";
                    case "CO": return "Commercial";
                    case "DO": return "Domestic";
                    case "PH": return "Hydro Electric";
                    case "IN": return "Industrial";
                    case "IR": return "Irrigation";
                    case "LV": return "Livestock";
                    case "MI": return "Mining";
                    case "RM": return "Remediation";
                    case "TE": return "Thermoelectric";
                    case "ST": return "Waste Water Treatment";
                    case "WS": return "Public Supply";
                    case "MF": return "Hydrofracturing";
                    case "CW": return "Wetland augmentation";
                    case "PC": return "Thermoelectric (closed cycle)";
                    case "PO": return "Thermoelectric (once through)";
                } //End Switch
                return wtype.toUpperCase();
            };
            WateruseController.prototype.loadGraphLabels = function (id) {
                var svg = d3.selectAll("g.nv-multibarHorizontal");
                var lastBarID = svg.selectAll("g.nv-group").map(function (items) { return items.length; });
                var lastBars = svg.selectAll("g.nv-group").filter(function (d, i) {
                    return i == lastBarID[id] - 1;
                }).selectAll("g.positive");
                var groupLabels = svg.select("g.nv-barsWrap");
                lastBars.each(function (d, index) {
                    var text = d3.select(this).selectAll("text");
                    text.text(d3.format(',.3f')(d.y1.toFixed(3)));
                    text.attr("dy", "1.32em");
                });
            };
            return WateruseController;
        }(WiM.Services.HTTPServiceBase)); //end wimLayerControlController class
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        WateruseController.$inject = ['$scope', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance', '$timeout'];
        var WaterUseType;
        (function (WaterUseType) {
            WaterUseType[WaterUseType["Annual"] = 1] = "Annual";
            WaterUseType[WaterUseType["Monthly"] = 2] = "Monthly";
        })(WaterUseType || (WaterUseType = {}));
        var WaterUseTabType;
        (function (WaterUseTabType) {
            WaterUseTabType[WaterUseTabType["Graph"] = 1] = "Graph";
            WaterUseTabType[WaterUseTabType["Table"] = 2] = "Table";
        })(WaterUseTabType || (WaterUseTabType = {}));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.WateruseController', WateruseController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=WateruseController.js.map