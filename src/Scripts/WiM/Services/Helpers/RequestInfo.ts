module WiM.Services.Helpers {
    export class RequestInfo implements ng.IRequestConfig {
        //Properties

        public method: string;
        public url: string;
        //public headers: any;
        public dataType: string
        public params: any;

        public data: any;

        constructor(ul: string, mthd: methodType = methodType.GET, dtype:string ="json", data: any = null ) {
            this.url = ul;
            this.method = methodType[mthd];
            this.dataType = dtype;
            //Avoid setting custom header if you don't want to do a CORS preflight dance
            //this.headers = {
            //    'Content-Type': contentType
            //}

            this.data = data;
        }
    }//end class
    export enum methodType{
        GET,
        POST,
        PUT,
        DELETE
    }
}//end module