import { createJsonTypeInstance } from "amqmodule";
import Dotenv from "dotenv";
import { AppFactory } from "framework-socket-container";
import ConnectionPool from "libs-connection-pool";
import { createClient, createCluster } from "redis";
import { GamePack } from "./connector/containers/GamePack";
import { initLogger, logger } from "./connector/libs/Logger";
import { initModelConnector } from "./connector/models";
import { initGameMQ } from "./connector/mq/GameMQ";

Dotenv.config();

async function gamePackApp() {
  const app = AppFactory.create(GamePack, {
    appKey: String(process.env.APP_NAME),
    appSecret: String(process.env.APP_SECRET),
    redisHost: String(process.env.REDIS_URL),
    listen: Number(process.env.PORT),
    redisCluster: process.env.REDIS_CLUSTER == "true",
  });

  Object.keys(process.env)
    .filter((k) => k.indexOf(String(process.env.CONTAINER_PREFIX)) == 0)
    .forEach((containerCofigure) => {
      try {
        app.linkContainer(JSON.parse(String(process.env[containerCofigure])));
      } catch (e) {}
    });

  app.run();
}

async function bootstrap() {
  initLogger("OG-Game-Pack");

  initModelConnector(
    new ConnectionPool({
      host: String(process.env.DATABASE_HOST),
      writerHost: String(process.env.DATABASE_HOST),
      readerHost: String(process.env.DATABASE_RO_HOST),
      user: String(process.env.DATABASE_USER),
      password: String(process.env.DATABASE_PASS),
      database: String(process.env.DATABASE_NAME),
    }),
    process.env.REDIS_CLUSTER == "true"
      ? createCluster({ rootNodes: [{ url: process.env.REDIS_URL }], useReplicas: true })
      : createClient({ url: process.env.REDIS_URL })
  );

  initGameMQ(
    await createJsonTypeInstance({
      host: String(process.env.MQ_HOST),
      id: String(process.env.MQ_ID),
      pw: String(process.env.MQ_PW),
      port: parseInt(String(process.env.MQ_PORT)),
    })
  );
  logger.load("init model and MQ...");

  gamePackApp();
  logger.load("Game Pack Start...");
}

bootstrap();
