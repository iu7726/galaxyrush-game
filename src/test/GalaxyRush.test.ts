import { initModelConnector, useModelConnector } from '../connector/models';
import { initGameMQ } from '../connector/mq/GameMQ';
import { GalaxyRush } from '../galaxyRush';
import { Game, OrderPosition, Socket_Order_Type } from '../galaxyRush/enum/GameEnum';
import { OrderRequest } from '../galaxyRush/interface/request';
import { GameResult } from '../galaxyRush/interface/result';
import { useStore } from '../galaxyRush/store';
import { DBMock } from './mock/DBMock';
import { MQMock } from './mock/MQMock';
import { RedisMock } from './mock/RedisMock';
import { ReciveEventName } from '../galaxyRush/enum/GameEnum'
import { useModel } from '../galaxyRush/model'
import { initGamePack } from '../connector/containers/GamePack';
import { ContainerMock } from './mock/ContainerMock';

let gr: GalaxyRush;
let orderRequest: OrderRequest;
let users: number[] = [1, 2, 3, 4]

beforeEach(() => {
  const dbMock = new DBMock();
  const redisMock = new RedisMock();
  const mqMock = new MQMock();
  const containerMock = new ContainerMock();
  initModelConnector(dbMock as any, redisMock as any)
  initGameMQ(mqMock as any);
  // container.setIsLog(true)
  initGamePack(containerMock as any)
  gr = new GalaxyRush()
  // price set
  useStore().setNowPrice(10000)

  //request set
  orderRequest = {
    game: Game.SYMBOL,
    userId: users[0],
    type: Socket_Order_Type.GATEWAY_ORDER_ENTER,
    amount: 100,
    leverage: 3,
    position: OrderPosition.ORDER_UP,
    payment: 'crystal',
    accessToken: ''
  }
});

describe('GalaxyRush', () => {
  describe('order', () => {
    it('should be fail, because amount less then 100', async () => {
      orderRequest.amount = 99
      
      const result = await gr.request(ReciveEventName.GATEWAY_USER_ENTER, orderRequest)
    
      await expect(result?.success).toEqual(false)
      await expect(result?.msg).toEqual('Min. amount to enter a position is 100')
    })

    it('should be fail, because leverage less then 1', async () => {
      orderRequest.leverage = 0.9
      const result = await gr.request(ReciveEventName.GATEWAY_USER_ENTER, orderRequest)

      await expect(result?.success).toEqual(false)
      await expect(result?.msg).toEqual('Max leverage cannot exceed x1,000')
    })

    it('should be success bet', async () => {
      const result: GameResult | void = await gr.request(ReciveEventName.GATEWAY_USER_ENTER, orderRequest)
      await expect(result?.success).toEqual(true);
    })
  })

  describe('getMyOrder', () => {
    it('should be success get my order info', async () => {
      // bet
      await gr.request(ReciveEventName.GATEWAY_USER_ENTER, orderRequest)

      // get
      const orderList: any = await useModel().redis.getOrders();

      const userId = orderList[0].userId

      await expect(userId).toEqual(orderRequest.userId);
    })
  })

  describe('tick', () => {
    it('should be success tick, user crystal gain', async () => {
      // bet
      await gr.request(ReciveEventName.GATEWAY_USER_ENTER, orderRequest)
      const orderList: any = await useModel().redis.getOrders()

      // next tick
      const result: GameResult = await gr.message(ReciveEventName.SEED_GENERATOR_TICK, { price: 15000 })
      const afterOrder = await useModel().redis.getBetFromRedisByBetId(orderList[0].id)

      // console.log(beforeOrder.currentAmount, afterOrder.currentAmount)
      await expect(result.success).toEqual(true);
      await expect(afterOrder?.currentAmount).toBeGreaterThan(0)
    })

    it('should be success tick, user bust', async () => {
      // bet
      await gr.request(ReciveEventName.GATEWAY_USER_ENTER, orderRequest)
      const orderList: any = await useModel().redis.getOrders()

      const result: GameResult = await gr.message(ReciveEventName.SEED_GENERATOR_TICK, { price: 500 })
      await expect(result.success).toEqual(true);
      const afterOrder = await useModel().redis.getBetFromRedisByBetId(orderList[0].id)

      await expect(afterOrder).toEqual(undefined);
    })
  })

  describe('exit', () => {
    it('should be fail, because Invalid id', async () => {
      const result: GameResult| void = await gr.request(ReciveEventName.GATEWAY_USER_EXIT, { userId: users[0] })

      await expect(result?.success).toEqual(false);
      await expect(result?.msg).toEqual('Invalid id')
    })

    it('should be fail, because Not Exist Bet', async () => {
      const result: GameResult | void = await gr.request(ReciveEventName.GATEWAY_USER_EXIT, { id: 'fadsfawefsd', userId: users[0] })

      await expect(result?.success).toEqual(false);
      await expect(result?.msg).toEqual('Not Exist Bet')
    })

    it('should be fail, because Not match bet in user', async () => {
      // bet
      orderRequest.position = OrderPosition.ORDER_DOWN;
      await gr.request(ReciveEventName.GATEWAY_USER_ENTER, orderRequest)
      const orderList: any = await useModel().redis.getOrders()

      // tick
      await gr.message(ReciveEventName.SEED_GENERATOR_TICK, { price: 500 })

      const result: GameResult | void = await gr.request(ReciveEventName.GATEWAY_USER_EXIT, { id: orderList[0].id, userId: users[1] })

      await expect(result?.success).toEqual(false);
      await expect(result?.msg).toEqual('Not match bet in user')
    })

    it('should be success exit', async () => {
      // order
      await gr.request(ReciveEventName.GATEWAY_USER_ENTER, orderRequest)
      const orderList: any = await useModel().redis.getOrders()

      // next tick
      await gr.message(ReciveEventName.SEED_GENERATOR_TICK, { price: 15000 })
      const result: GameResult | void = await gr.request(ReciveEventName.GATEWAY_USER_EXIT, { id: orderList[0].id, userId: users[0] })


      await expect(result?.success).toEqual(true);
    })
  })

  describe('init', () => {
    it('should be success, empty order', async () => {
      const result: GameResult = await gr.message(ReciveEventName.SEED_GENERATOR_SEED_CHANGE, {});

      await expect(result.success).toEqual(true);
    })

    it('should be success, filled order', async () => {
      // order
      await gr.request(ReciveEventName.GATEWAY_USER_ENTER, orderRequest)

      const result: GameResult = await gr.message(ReciveEventName.SEED_GENERATOR_SEED_CHANGE, {});

      await expect(result.success).toEqual(true);
    })
  })
})
