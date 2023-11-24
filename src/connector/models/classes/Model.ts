import { RedisClientType, RedisClusterType } from "redis";
import ConnectionPool from "libs-connection-pool";
import SQL from "sql-template-strings";

export default class Model {
  constructor(
    protected readonly connection: ConnectionPool, 
    protected readonly redisCluster:RedisClusterType | RedisClientType
  ) {
  }
}
