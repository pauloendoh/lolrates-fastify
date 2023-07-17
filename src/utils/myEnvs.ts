import { config } from "dotenv";
config();

export const myEnvs = {
  DATABASE_URL: envToStringOrThrow("DATABASE_URL"),
};

function envToStringOrThrow(name: string) {
  const value = process.env[name];
  if (value === undefined)
    throw new Error(`Environment variable ${name} not set`);
  return value;
}

function toStringOrThrow(value: string | undefined) {
  if (value === undefined) throw new Error("Environment variable not set");
  return value;
}
