import { Order } from "./Order";

interface Emit {
  target: string;
  order: Order;
}

export interface GameResult {
  success: boolean
  type: string
  emit?: {

  },
  emitTo?: {

  }
  bulk?: boolean
  msg?: string
}