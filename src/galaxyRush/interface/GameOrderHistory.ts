import { Order } from "./Order";


export enum GameType {
  GR = 'GR'
}

export enum OutType {
  EXIT = 'EXIT',
  BUST = 'BUST'
}

export interface GameOrderHistoryDTO {
  id: string;
  userId: number;
  gameType: GameType;
  amount: number;
  entryPrice: number;
  exitPrice: number; 
  outType: OutType;
  raw: Order;
}