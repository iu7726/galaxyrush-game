import { OrderStatus } from "../enum/GameEnum";
import { OrderPosition } from "../enum/GameEnum";
import { AccessToken, FulfilledOrder } from "../../connector/interface/Order";

export interface Order extends AccessToken, FulfilledOrder {

  position: OrderPosition,
  status: OrderStatus;

  entryPrice: number;
  bustPrice: number;
  exitPrice?: number;
  leverage: number;
  currentAmount?: number;

  eventName: string;
}