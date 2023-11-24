import { useGamePack } from '../connector/containers/GamePack';
import { v4 as uuidv4 } from 'uuid';
import { LinkContainer } from '../connector/enum/CommonEnum';
import { GameType, OutType } from './interface/GameOrderHistory';
import { GatewayRequest } from '../connector/interface/Gateway';
import { logger } from "../connector/libs/Logger";
import { useModelConnector } from '../connector/models';
import { useGRMQ } from '../connector/mq/GameMQ';
import { Game, OrderPosition, OrderStatus, Order_EventName, Order_Memo, ReciveEventName, RedisKey, SendEventName } from "./enum/GameEnum";
import { Order } from './interface/Order';
import {
  GRExitRequest,
  GRMyOrderRequest,
  GRTickRequest, OrderRequest
} from "./interface/request";
import { GameResult } from "./interface/result";
import { initModel, useModel } from "./model";
import { useStore } from "./store";

export class GalaxyRush {

  constructor() {
    initModel(useModelConnector());
  }

  public async message(ev: string, payload: any): Promise<GameResult> {
    try {
      let grResult:GameResult;
      switch (ev) {
        case ReciveEventName.SEED_GENERATOR_TICK:
          return this.tick({ price: payload.price });
        case ReciveEventName.SEED_GENERATOR_SEED_CHANGE:
          grResult = await this.init()
          if (grResult && grResult.success && grResult.bulk) {
            useGamePack().request(LinkContainer.GATEWAY, 'updateOrders', {
              keys: [RedisKey.EXIT]
            })
          }
          return grResult
        default:
          return {
            success: false,
            type: 'unknown',
          }
        }
      
    } catch (e) {
      console.error(e);
      return {
        success: false,
        type: 'error',
      }
    }
  }

  public async request(ev: string, payload: any): Promise<GameResult | void> {
    try {
      switch (ev) {
        case ReciveEventName.GATEWAY_USER_ENTER:
          return this.enter(payload);
        case ReciveEventName.GATEWAY_USER_EXIT:
          return this.exit(payload);
        case ReciveEventName.EMIT_USER_BET_LIST:
          return this.getMyOrder(payload);
        default:
          return;
      }
    } catch (e) {
      console.error(e);
    }
  }

  private calcCurrentAmount(order: Order, gamePrice: number) {
    try {
      let price: number = 0;
      switch (order.position) {
        case OrderPosition.ORDER_UP:
          price = gamePrice - order.entryPrice;
          break;
        case OrderPosition.ORDER_DOWN:
          price = order.entryPrice - gamePrice;
          break;
        default:
          break;
      }

      const currentAmount = order.amount + (order.amount * (price) / order.entryPrice) * order.leverage;

      return currentAmount < 0 ? 0 : currentAmount;
    } catch (e) {
      console.error(e);

      return order.amount;
    }
  }

  private calcBustPrice(position: OrderPosition, nowPrice: number, leverage: number) {
    try {
      switch (position) {
        case OrderPosition.ORDER_UP:
          return nowPrice - nowPrice / leverage;
        case OrderPosition.ORDER_DOWN:
          return nowPrice + nowPrice / leverage;
        default:
          throw new Error('Calculating price for position Error');
      }
    } catch (e) {
      console.error(e);
      
      throw e;
    }
    
  }

  private async wait (delay:number = 1100):Promise<void> {
    return new Promise<void>((resolve, reject) =>{
      setTimeout(() => {
        resolve();
      }, delay)  
    });
}

  private isEnterValid(request: OrderRequest): string {
    if ( ! request.userId) {
      return 'Invalid Value';
    } 

    if (! request.amount || request.amount <= 99) {
      return 'Min. amount to enter a position is 100';
    }
    
    if (! request.leverage || request.leverage < 1) {
      return 'Max leverage cannot exceed x1,000';
    }

    if (isNaN(request.leverage)) {
      return 'Invalid leverage'
    }

    if (! request.position || ! Object.values(OrderPosition).includes(request.position)) {
      return 'Invalid Value';
    }

    return 'success';
  }

  private isLimit(request: OrderRequest): boolean {
    try {
      if (Number(request.amount) * Number(request.leverage) > 2000000) {
        return true;
      }
    } catch(e) {
      console.error(e);
      return true;
    }

    return false;
  }

  private async sendEnterMQ(request: OrderRequest, order: Order): Promise<void> {
    try {
      useGRMQ().publish(String(process.env.MQ_QUEUE_PLAYGROUND_ORDER_ENTER), {
        id: order.id,
        userId: request.userId,
        order: {...order, game: Game.LABEL},
      })
    } catch (e) {
      console.error(e);
    }
  }

  private async sendExitMQ(request: GRExitRequest, order: Order): Promise<void> {
    try {
      useGRMQ().publish(String(process.env.MQ_QUEUE_PLAYGROUND_ORDER_EXIT), {
        id: order.id,
        userId: request.userId,
        order: {...order, game: Game.LABEL},
      })
    } catch (e) {
      console.error(e);
    }
  }

  private async enter(request: OrderRequest): Promise<GameResult> {
    try {
      
      const validTxt = this.isEnterValid(request);
      if ( validTxt != 'success') {
        throw new Error(validTxt);
      }

      if (this.isLimit(request)) {
        throw new Error('Cap is 2,000,000 (amount X leverage)');
      }

      await this.wait(500);

      const nowPrice = useStore().getEnterPrice(request.position);
      
      let bustPrice: number = this.calcBustPrice(request.position, nowPrice, request.leverage);
      
      const order: Order = {
        id: uuidv4(),
        amount: Math.floor(request.amount),
        eventName: Order_EventName.CREATE_ORDER,
        entryPrice: nowPrice,
        bustPrice: bustPrice,
        leverage: request.leverage,
        userId: request.userId,
        position: request.position,
        status: OrderStatus.LIVE,
        orderedAt: new Date().getTime(),
        accessToken: request.accessToken,
        updatedAt: new Date().getTime(),
        game: Game.SYMBOL,
        type: request.type,
        payment: request.payment
      }

      useModel().redis.updateBetFromRedis(order.id, order, false)

      useGamePack().emit(SendEventName.CLIENT_SUCCESS_EVENT, order);
      let { userId, ...publicOrder } = order;
      useGamePack().emit(SendEventName.CLIENT_SUCCESS_EVENT, {...publicOrder, ...{eventName: 'public'}});


      // mq
      this.sendEnterMQ(request, order);

      return {
        type: 'Enter',
        success: true
      };
    } catch (err: any) {
      logger.error("[Enter]", err);
      useGamePack().emit(SendEventName.CLIENT_FAIL_EVENT, {
        eventName: Order_EventName.CREATE_ORDER,
        userId: request.userId,
        error: {
          errorCode: -301,
          errorMsg: err.message
        }
      })
      
      useGamePack().request(
        LinkContainer.GATEWAY,
        SendEventName.UPDATE_ORDER_SEND_GATEWAY,
        this.convertGatewayFailRequest(request.userId, request.amount)
      )
      return {
        type: 'Bet',
        success: false,
        msg: err.message
      };
    }
  }

  private async exit(request: GRExitRequest): Promise<GameResult> {
    try {
      if ( ! request.id) throw new Error("Invalid id")
      
      await this.wait(1000);

      const order = await useModel().redis.getBetFromRedisByBetId(request.id);

      if (!order) throw new Error('Not Exist Bet')

      if (request.userId != order.userId) throw new Error('Not match bet in user')

      order.currentAmount = this.calcCurrentAmount(order, useStore().getGamePrice(order.position));
      order.eventName = Order_EventName.EXIT_ORDER;
      order.memo = `${Order_Memo.EXIT}:${order.id}`;
      order.status = OrderStatus.EXIT;
      order.exitPrice = useStore().getNowPrice();
      order.updatedAt = new Date().getTime();
      order.closed = true;

      useModel().redis.updateBetFromRedis(order.id, order, false)

      useGamePack().request(
        LinkContainer.GATEWAY,
        SendEventName.UPDATE_ORDER_SEND_GATEWAY,
        this.convertGatewayRequest(order)
      )

      useModel().history.createGROrderHistory({
        id: order.id,
        userId: order.userId,
        gameType: GameType.GR,
        amount: order.amount,
        entryPrice: order.entryPrice,
        exitPrice: order.exitPrice,
        outType: OutType.EXIT,
        raw: order
      })

      // mq
      this.sendExitMQ(request, order);

      return {
        success: true,
        type: "Exit"
      };
    } catch (err: any) {
      logger.error("[Join Job]", err);

      useGamePack().emit(SendEventName.CLIENT_FAIL_EVENT, {
        eventName: Order_EventName.EXIT_ORDER,
        userId: request.userId,
        error: {
          errorCode: -302,
          errorMsg: err.message
        }
      })



      return {
        type: "Exit",
        success: false,
        msg: err.message
      };
    }
  }

  private async init(): Promise<GameResult> {
    try {
      console.time("Init Job") 
      const orderList = await useModel().redis.getOrders();
      let bulk = false;
      
      orderList.forEach(order => {
        if (order.status != OrderStatus.LIVE) return;

        order.currentAmount = this.calcCurrentAmount(order, useStore().getNowPrice());
        order.status = OrderStatus.EXIT;
        order.eventName = Order_EventName.EXIT_ORDER;
        order.memo = `${Order_Memo.INIT_EXIT}:${order.id}`;
        order.exitPrice = useStore().getNowPrice();
        order.updatedAt = new Date().getTime();
        order.closed = true;

        useModel().redis.updateBetFromRedis(order.id, order, true);

        useModel().history.createGROrderHistory({
          id: order.id,
          userId: order.userId,
          gameType: GameType.GR,
          amount: order.amount,
          entryPrice: order.entryPrice,
          exitPrice: order.exitPrice,
          outType: OutType.EXIT,
          raw: order
        })

        bulk = true;
        // useGamePack().request(
        //   GR_Socket.GATEWAY,
        //   GR_SendEventName.UPDATE_ORDER_SEND_GATEWAY,
        //   this.convertGatewayRequest(order)
        // )
      })
      await this.wait(500);
      console.timeEnd("Init Job")
      return {
        type: "Init",
        success: true,
        bulk
      };
    } catch (err: any) {
      logger.error("[Init Job]", err);

      return {
        type: "Init",
        success: false,
        msg: err.message
      };
    }
  }

  private async tick(request: GRTickRequest): Promise<GameResult> {
    try {
      // console.time("Tick Job")

      useStore().setNowPrice(request.price)

      const orderList = await useModel().redis.getOrders()
      const nowPrice = useStore().getNowPrice()

      let bulk = false;
      orderList.forEach(order => {
        if (order.status != OrderStatus.LIVE) return;

        order.currentAmount = this.calcCurrentAmount(order, useStore().getNowPrice());
        order.updatedAt = new Date().getTime();

        if (
          (order.position == OrderPosition.ORDER_UP && nowPrice <= order.bustPrice) ||
          (order.position == OrderPosition.ORDER_DOWN && nowPrice >= order.bustPrice)
        ) {
          order.status = OrderStatus.BUST;
          order.eventName = Order_EventName.BUST_ORDER;
          order.memo = `${Order_Memo.BUST}:${order.id}`;
          order.exitPrice = useStore().getNowPrice();
          order.closed = true;
          
          useModel().redis.updateBetFromRedis(order.id, order, false);

          useModel().history.createGROrderHistory({
            id: order.id,
            userId: order.userId,
            gameType: GameType.GR,
            amount: order.amount,
            entryPrice: order.entryPrice,
            exitPrice: order.exitPrice,
            outType: OutType.BUST,
            raw: order
          })

          useGamePack().request(
            LinkContainer.GATEWAY,
            SendEventName.UPDATE_ORDER_SEND_GATEWAY,
            this.convertGatewayRequest(order)
          )
          bulk = true;
          return;
        }

        order.eventName = Order_EventName.UPDATE_CURRENT;
        order.memo = Order_Memo.CURRENT_UPDATE;
        // console.log('Tick bet', nowPrice, bet)
        useModel().redis.updateBetFromRedis(order.id, order, false)
        useGamePack().emit(SendEventName.CLIENT_SUCCESS_EVENT, order)

        return;

      })

      // console.log(useStore().getBettings())
      // console.timeEnd("Tick Job")
      return {
        type: 'Tick',
        success: true,
        bulk
      };
    } catch (err: any) {
      logger.error("[Tick Job]", err);
      return {
        type: 'Tick',
        success: false,
        msg: err.message
      };
    }
  }

  private convertGatewayRequest(order: Order): GatewayRequest {
    const currentAmount = order.currentAmount ?? 0

    useGamePack().emit(SendEventName.CLIENT_SUCCESS_EVENT, order);

    return {
      id: order.id,
      userId: order.userId,
      amount: order.amount,
      status: order.status,
      currentAmount: currentAmount <= 0 ? 0 : currentAmount,
      memo: order.memo ?? '',
      closed: order.closed ?? false
    }
  }

  private convertGatewayFailRequest(userId: number, amount: number) { 

    return {
      id: uuidv4(),
      userId: userId,
      amount: amount,
      currentAmount: amount,
      memo: 'ERROR',
      closed: true
    }
  }

  private async getMyOrder(request: GRMyOrderRequest): Promise<void> {
    try {
      const list = await useModel().redis.getOrders();
      const result: Order[] = [];

      list.map(order => {
        if (order.userId == request.userId) {
          result.push(order);
        }
      })

      useGamePack().emit(SendEventName.CLIENT_SUCCESS_EVENT, {
        userId: request.userId,
        eventName: SendEventName.MY_ORDER_SEND_CLIENT,
        game: Game.SYMBOL,
        list: result
      });
    } catch (err: any) {
      console.error(err);
      useGamePack().emit(SendEventName.CLIENT_FAIL_EVENT, {
        sucess: false,
        eventName: SendEventName.MY_ORDER_SEND_CLIENT,
        userId: request.userId,
        error: {
          errorCode: -303,
          errorMsg: err.message
        }
      });
    }
  }
}