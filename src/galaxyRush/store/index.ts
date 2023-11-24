import { Order } from "../interface/Order";
import { OrderStatus, OrderPosition } from "../enum/GameEnum";

export class Store {
  nowPrice: number;
  prices: number[];

  constructor() {
    this.nowPrice = 0
    this.prices = [];
  }

  getNowPrice() {
    return this.nowPrice
  }

  setNowPrice(price: number) {
    this.nowPrice = Math.floor(price)
    if (this.prices.length > 3) {
      this.prices.shift()
    }
    this.prices.push(Math.floor(price));
  }

  getEnterPrice(position: string) {
    try {
      
      if (position == 'UP') {
        const descValue = (arr: number[], value: number) =>
        [...arr.filter(n => n >= value), value, ...arr.filter(n => n < value)]
        const gp = this.prices.reduce(descValue, [])
        if (gp[0] - gp[1] > gp[1] - gp[2]) {
          return gp[0]
        } else {
          return gp[1]
        }
      } else if (position == 'DOWN') {
        const ascValue = (arr: number[], value: number) =>
      [...arr.filter(n => n <= value), value, ...arr.filter(n => n > value)]
        const gp = this.prices.reduce(ascValue, [])

        if (gp[1] - gp[0] > gp[2] - gp[1]) {
          return gp[1]
        } else {
          return gp[0]
        }
        
      } 
      return this.nowPrice
    } catch (e) {
      return this.nowPrice
    }
  }

  getGamePrice(position: string) {
    try {
      
      if (position == 'UP') {
        const ascValue = (arr: number[], value: number) =>
      [...arr.filter(n => n <= value), value, ...arr.filter(n => n > value)]
        const gp = this.prices.reduce(ascValue, [])

        if (gp[1] - gp[0] > gp[2] - gp[1]) {
          return gp[1]
        } else {
          return gp[0]
        }
      } else if (position == 'DOWN') {
        const descValue = (arr: number[], value: number) =>
        [...arr.filter(n => n >= value), value, ...arr.filter(n => n < value)]
        const gp = this.prices.reduce(descValue, [])
        if (gp[0] - gp[1] > gp[1] - gp[2]) {
          return gp[0]
        } else {
          return gp[1]
        }
      } 
      return this.nowPrice
    } catch (e) {
      return this.nowPrice
    }
  }

}

let store: Store

export const useStore = () => {
  if (store == undefined) {
    store = new Store()
  }
  return store
}