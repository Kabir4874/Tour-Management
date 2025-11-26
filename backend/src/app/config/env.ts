import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: string;
  DB_URL: string;
  NODE_ENV: "development" | "production";
}

const loadEnvVarialbes = (): EnvConfig => {
  const requiredEnvVarialbes: string[] = ["PORT", "DB_URL", "NODE_ENV"];
  requiredEnvVarialbes.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment varialbe ${key}`);
    }
  });
  return {
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    PORT: process.env.PORT as string,
    DB_URL: process.env.DB_URL as string,
  };
};

const envVars = loadEnvVarialbes();

export default envVars;
