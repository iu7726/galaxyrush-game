import { AMQModule } from 'amqmodule';

let mq: AMQModule<any>;

export const initGameMQ = (mqInstance: AMQModule<any>) => {
  mq =  mqInstance;
  mq.setExchange(String(process.env.MQ_EXCHANGE))
  return mq;
}

export const useGRMQ = () => {
  return mq;
}