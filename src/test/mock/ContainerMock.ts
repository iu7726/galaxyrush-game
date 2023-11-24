export class ContainerMock {
  container: any;
  isLog: boolean;

  constructor() {
    this.isLog = false;
  }

  useContainer() {
    return this.container;
  }

  public setIsLog(value: boolean) {
    this.isLog = value;
  }

  public request(name: string, ev: string, payload: any): void {
    if (this.isLog)
      console.log('socket request:', name, ev, payload);
  }

  public emit(ev:string, payload: any): void{
    if (this.isLog)
      console.log('socket emit:', ev, payload);
  }
}