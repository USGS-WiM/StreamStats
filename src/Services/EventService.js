//------------------------------------------------------------------------------
//----- EventService -----------------------------------------------------
//------------------------------------------------------------------------------
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2016 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  The service agent is responsible for initiating service calls, 
//             capturing the data that's returned and forwarding the data back to 
//             the requester.
//          
//discussion:
//
//https://docs.angularjs.org/api/ng/service/$http
//Comments
//01.28.2016 jkn - Created
//Import
var WiM;
(function (WiM) {
    var Services;
    (function (Services) {
        'use strict';
        var Event = (function () {
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function Event(delegate) {
                this._onChanged = delegate;
            }
            Object.defineProperty(Event.prototype, "onChanged", {
                get: function () {
                    return this._onChanged;
                },
                enumerable: true,
                configurable: true
            });
            return Event;
        })(); //end Event
        var EventService = (function () {
            //Properties
            //-+-+-+-+-+-+-+-+-+-+-+-
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function EventService() {
                this._eventList = {};
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            EventService.prototype.AddEvent = function (EventName, EventDelegate) {
                if (!this._eventList.hasOwnProperty(EventName))
                    this._eventList[EventName] = new Event(EventDelegate);
            };
            EventService.prototype.SubscribeToEvent = function (EventName, handler) {
                if (!this._eventList.hasOwnProperty(EventName))
                    return;
                this._eventList[EventName].onChanged.subscribe(handler);
            };
            EventService.prototype.RaiseEvent = function (EventName, sender, args) {
                if (sender === void 0) { sender = null; }
                if (args === void 0) { args = WiM.Event.EventArgs.Empty; }
                if (!this._eventList.hasOwnProperty(EventName))
                    return;
                this._eventList[EventName].onChanged.raise(null, args);
            };
            return EventService;
        })(); //end class
        factory.$inject = [];
        function factory() {
            return new EventService();
        }
        angular.module('WiM.Services').factory('WiM.Services.EventService', factory);
    })(Services = WiM.Services || (WiM.Services = {}));
})(WiM || (WiM = {})); //end module 
//# sourceMappingURL=EventService.js.map