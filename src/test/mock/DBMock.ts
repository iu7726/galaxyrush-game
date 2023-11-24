export class DBMock {
  store: any
  isLog: boolean

  constructor() {
    this.store = {}
    this.isLog = false;
  }

  public async writerQuery(sql: any) {
    if (this.isLog)
      console.log('db write:', sql);
  }

  public setIsLog(isLog: boolean) {
    this.isLog = isLog;
  }
}