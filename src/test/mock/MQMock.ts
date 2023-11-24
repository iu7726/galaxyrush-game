export class MQMock {
  isLog: boolean;

  constructor() {
    this.isLog = false;
  }

  public setExchange(routeKey: string, payload: any) {
    if (this.isLog) 
      console.log(routeKey, payload)
  }

  public publish(queName: string, payload: any) {
    if (this.isLog)
      console.log(queName, payload)
  }

  setIsLog(isLog: boolean) {
    this.isLog = isLog
  }
}