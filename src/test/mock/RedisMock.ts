export class RedisMock {
  store: Map<string, any>

  constructor() {
    this.store = new Map<string, any>()
  }

  public async connect() {

  }

  public async HGET(key: string, field: string) {
    return this.store.get(key)[field] ?? undefined;
  }

  public async HGETALL(key: string): Promise<any> {
    return this.store.get(key) ?? undefined;
  }

  public async HSET(key: string, field: string, value: any) {
    await this.existMapByKey(key, value);
    const item = this.store.get(key);
    item[field] = value;
  }

  public async HDEL(key: string, field: string) {
    delete this.store.get(key)[field];
  }

  public async LPUSH(key: string, value: any) {
    // await this.existMapByKey(key, value);
    if ( ! this.store.get(key)) {
      this.store.set(key, []);
    }
    
    this.store.get(key).unshift(value);
  }

  private async existMapByKey(key: string, value: any) {
    const existValue = this.store.get(key)

    if (existValue) return false;

    if (Array.isArray(value)) {
      this.store.set(key, [])
    } else if (typeof value == 'object') {
      this.store.set(key, {})
    } else if (typeof value == 'string') {
      try {
        JSON.parse(value)
        this.store.set(key, new Map<string, any>())
      } catch (e) {}
    }
  }

}