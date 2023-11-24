import { OrderPosition, Socket_Order_Type } from "../enum/GameEnum";
import { AccessToken, Order } from "../../connector/interface/Order";

export interface OrderRequest extends Order, AccessToken {
  leverage: number,
  position: OrderPosition
}

export interface GRExitRequest {
  id?: string,
  ids?: string[],
  userId: number
}

export interface GRTickRequest {
  price: number
}

export interface GRMyOrderRequest {
  userId: number
}