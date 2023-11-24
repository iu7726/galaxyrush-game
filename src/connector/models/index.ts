import ConnectionPool from "libs-connection-pool";
import { RedisClientType, RedisClusterType } from "redis";

export class ModelConnectorManager {
  connection: ConnectionPool
  redisObject: RedisClusterType | RedisClientType

  constructor(connection: ConnectionPool, redisObject: RedisClusterType | RedisClientType) {
    this.connection = connection;
    this.redisObject = redisObject;
  }
}

let modelManager: ModelConnectorManager;

export const initModelConnector = (connection: ConnectionPool, redisObject: RedisClusterType | RedisClientType) => {
  redisObject.connect()
  modelManager = new ModelConnectorManager(connection, redisObject);
  return modelManager;
};


export const useModelConnector = () => {
  return modelManager;
};
