import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../schema";
import { myEnvs } from "../myEnvs";

const client = postgres(myEnvs.DATABASE_URL);
export const db = drizzle(client, { schema });
