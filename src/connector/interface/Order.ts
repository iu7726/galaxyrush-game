import { Payment } from "../enum/CommonEnum";

export interface AccessToken {
  accessToken: string;
}

export interface Order {
  game: string;
  userId: number;
  amount: number;
  type: string,
  payment: Payment.CRYSTAL | string;
}

export interface FulfilledOrder extends Order {
  id: string;
  memo?: string;
  closed?: boolean;
  orderedAt: number;
  updatedAt: number;
}