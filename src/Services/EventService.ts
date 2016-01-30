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

module WiM.Services {
    'use strict'
    interface EventDictionary {
        [name: string]: IEvent;
    }
    interface IEvent {
        onChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
    }
    export interface IEventService {
        AddEvent<T extends WiM.Event.EventArgs>(EventName: string, EventDelegate: WiM.Event.Delegate<T>);
        SubscribeToEvent<T extends WiM.Event.EventArgs>(EventName: string, handler: WiM.Event.EventHandler<T>);
        RaiseEvent(EventName: string, sender: any, args: WiM.Event.EventArgs);
    }

    class Event implements IEvent {
        private _onChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        public get onChanged(): WiM.Event.Delegate<WiM.Event.EventArgs> {
            return this._onChanged;
        }
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor(delegate: WiM.Event.Delegate<WiM.Event.EventArgs>) {
            this._onChanged = delegate;
        }    

    }//end Event
  
    class EventService implements IEventService {
        //Event dictionary
        private _eventList: EventDictionary;
       
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor() {
            this._eventList = {};
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public AddEvent<T extends WiM.Event.EventArgs>(EventName: string, EventDelegate: WiM.Event.Delegate<T>) {
            if (!this._eventList.hasOwnProperty(EventName))
                this._eventList[EventName] = new Event(EventDelegate);            
        }
        public SubscribeToEvent<T extends WiM.Event.EventArgs>(EventName: string, handler: WiM.Event.EventHandler<T>) {
            if (!this._eventList.hasOwnProperty(EventName)) return;

            this._eventList[EventName].onChanged.subscribe(handler);
        }
        public RaiseEvent(EventName: string, sender:any = null, args: WiM.Event.EventArgs = WiM.Event.EventArgs.Empty) {
            if (!this._eventList.hasOwnProperty(EventName)) return;
            this._eventList[EventName].onChanged.raise(null, args);
        }
        
        //HelperMethods
        //-+-+-+-+-+-+-+-+-+-+-+-
       

    }//end class

    factory.$inject = [];
    function factory() {
        return new EventService()
    }
    angular.module('WiM.Services')
        .factory('WiM.Services.EventService', factory)
}//end module 