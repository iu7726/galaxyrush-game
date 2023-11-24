export enum Game {
  NAME = "Galaxy Rush",
  SYMBOL = 'GR',
  LABEL = "Galaxy Rush 🛸"
}

export enum OrderStatus {
  LIVE = 'live',
  BUST = 'bust',
  EXIT = 'exit'
}

export enum OrderPosition {
  ORDER_UP = 'UP',
  ORDER_DOWN = 'DOWN'
}

export enum SendEventName {
  UPDATE_ORDER_SEND_GATEWAY = 'updateOrder',
  UPDATE_CURRENT_SEND_CLIENT = 'updateCurrent',
  MY_ORDER_SEND_CLIENT = 'myOrder',
  CLIENT_SUCCESS_EVENT = 'ok',
  CLIENT_FAIL_EVENT = 'fail'
}

export enum ReciveEventName {
  SEED_GENERATOR_TICK = 'raw',
  SEED_GENERATOR_SEED_CHANGE = 'updateSeed',
  GATEWAY_USER_ENTER = 'enter',
  GATEWAY_USER_EXIT = 'exit',
  EMIT_USER_BET_LIST = 'myOrder'
}

export enum Socket_Order_Type {
  GATEWAY_ORDER_ENTER = 'enter',
  GATEWAY_ORDER_EXIT = 'exit'
}

export enum RedisKey {
  ORDER = '$gr:order$',
  EXIT = '$gr:exit$',
  BUST = '$gr:bust$'
}

export enum Order_EventName {
  CREATE_ORDER = 'createOrder',
  EXIT_ORDER = 'exit',
  INIT_ORDER = 'initOrder',
  BUST_ORDER = 'bust',
  UPDATE_CURRENT = 'updateCurrent'
}

export enum Order_Memo {
  EXIT = 'GR:EXIT',
  INIT_EXIT = 'GR:INIT:EXIT',
  BUST = 'GR:BUST',
  CURRENT_UPDATE = 'GR:CURRENT_UPDATE'
}

export const GameEnum = {
  Game, OrderStatus, OrderPosition, SendEventName, ReciveEventName, Socket_Order_Type, RedisKey, Order_EventName, Order_Memo
}
