import { OrderStatus, RedisKey } from "../enum/GameEnum";
import { Order } from "../interface/Order";
import Model from "../../connector/models/classes/Model";

export interface Amount {
  inOrder: number;
  total: number;
  balance: number;
  time: number;
}
export default class RedisModel extends Model {

  async getBetFromRedisByBetId(orderId: string): Promise<Order | undefined> {
    try {
      const jsonOrder = await this.redisCluster.HGET(RedisKey.ORDER, orderId);
      if (!jsonOrder) throw new Error('Not Exist Order');

      const order = JSON.parse(jsonOrder) as Order
      if (!order) throw new Error('Convert Error');

      return order;

    } catch (e) {
      console.error(e);
      return undefined;
    }
  }


  async updateBetFromRedis(betId: string, order: Order, save: boolean): Promise<void> {
    try {
      switch (order.status) {
        case OrderStatus.LIVE:
          await this.redisCluster.HSET(RedisKey.ORDER, betId, JSON.stringify(order));
          break;
        case OrderStatus.BUST:
        case OrderStatus.EXIT:
          this.redisCluster.HDEL(RedisKey.ORDER, betId);
          if (save) {
            this.setBetFromRedisByBetStatus(order.status, JSON.stringify(order))
          }
          break;
      }
    } catch (e) {
      console.error(e);
    }
  }

  async getAmountByUserIdFromRedis(userId: number): Promise<Amount | undefined> {
    try {
      const jsonAmount = await this.redisCluster.HGET("$user:amount$", String(userId));

      if (!jsonAmount) throw new Error('Not Exist User Amount');

      const amount = JSON.parse(jsonAmount) as Amount;
      amount.time = new Date().getTime();

      return amount;
    } catch (e) {
      console.error(e);
    }
    return undefined;
  }

  async setBetFromRedisByBetStatus(type: OrderStatus, data: string) {
    if (type == OrderStatus.BUST) {
      this.redisCluster.LPUSH(RedisKey.BUST, data);
    } else if (type == OrderStatus.EXIT) {
      this.redisCluster.LPUSH(RedisKey.EXIT, data);
    }
  }

  async getOrders(): Promise<Order[]> {
    const listMap = await this.redisCluster.HGETALL(RedisKey.ORDER);

    if ( ! listMap) return [];

    return Object.entries(listMap).map(value => JSON.parse(value[1]));
  }

  async deleteEXITOrderKey() {
    try {
      const result = await this.redisCluster.del(RedisKey.EXIT);
      console.log("Delete key Result : ", result);
    } catch (error) {
      console.log(error);
    }
  }
}
