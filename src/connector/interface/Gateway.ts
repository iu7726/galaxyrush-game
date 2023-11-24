import { OrderStatus } from "src/galaxyRush/enum/GameEnum"

export interface GatewayRequest {
  id: string
  userId: number
  amount: number
  currentAmount: number
  status: OrderStatus
  memo: string
  closed: boolean
}