import { RedisClientType, RedisClusterType } from "redis";
import ConnectionPool from "libs-connection-pool";
import { ModelConnectorManager } from "../../connector/models";
import RedisModel from "./RedisModel";
import HistoryModel from "./HistoryModel";


export class ModelManager {
  redis:RedisModel
  history: HistoryModel

  constructor(protected readonly conn: ModelConnectorManager) {
   this.redis = new RedisModel(conn.connection, conn.redisObject)
   this.history = new HistoryModel(conn.connection, conn.redisObject)
  }
}

let modelManager: ModelManager;

export const initModel = (conn:ModelConnectorManager) => {
  modelManager = new ModelManager(conn);
  return modelManager;
};


export const useModel = () => {
  return modelManager;
};
