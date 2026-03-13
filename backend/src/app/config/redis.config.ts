/* eslint-disable no-console */
import { createClient } from "redis";
import envVars from "./env.js";

export const redisClient = createClient({
  username: envVars.REDIS.USERNAME,
  password: envVars.REDIS.PASSWORD,
  socket: {
    host: envVars.REDIS.HOST,
    port: envVars.REDIS.PORT,
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected");
  }
};
