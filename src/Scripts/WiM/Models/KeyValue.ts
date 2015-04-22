module StreamStats.Models{
    export interface IKeyValue {
        Key: any;
        Value: any;
    }
        // Class
    class KeyValue<S,T> implements IKeyValue {
        //Properties
        public Key: S;
        public Value: T;
    
            // Constructor
        constructor(public k: S, public v: T) {
            this.Key = k;
            this.Value = v;
        }

    }
}