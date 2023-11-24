import axios from "axios";

const wait = async (delay:number):Promise<void> => {
    return new Promise<void>((resolve, reject) =>{
      setTimeout(() => {
        resolve();
      }, delay)  
    });
}

export default class DelayApiModel {
    constructor(private readonly delayTime:number = 1000){}

    protected getHeaders() {
        return { "Accept-Encoding": "gzip,deflate,compress" } 
    }

    async GET<T>(
        requestUrl:string, 
        delayTime: number = this.delayTime,
        headers: object = this.getHeaders()
    ):Promise<T|undefined>{
        const st = new Date().getTime();
        let result:T|undefined;
        try{
             const axiosResult = await axios.get(
                requestUrl,
                {
                    headers: headers
                }
            );
            result = axiosResult.data;
        }catch(e){

        }
        
        const dt = new Date().getTime() - st;
        if( delayTime > dt  ){
            await wait(delayTime -dt)
        }

        return result !== undefined ? result as T : undefined;
    }

}