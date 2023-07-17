import fastify from "fastify";
import { ZodTypeProvider, validatorCompiler } from "fastify-type-provider-zod";
import { FastifySerializerCompiler } from "fastify/types/schema";
import { ZodAny, z } from "zod";
import { configSwagger } from "./config/swagger";

const server = fastify().withTypeProvider<ZodTypeProvider>();

server.setValidatorCompiler(validatorCompiler);

const serializerCompiler: FastifySerializerCompiler<
  ZodAny | { properties: ZodAny }
> =
  ({ schema: maybeSchema }) =>
  (data) => {
    return JSON.stringify(data);
  };

server.setSerializerCompiler(serializerCompiler);

server.get("/ping", async (request, reply) => {
  // const createdUser = await db
  //   .insert(users)
  //   .values({
  //     fullName: "John",
  //     phone: "123",
  //   })
  //   .returning();

  // // await db.query.users.findMany({

  // // })

  // return createdUser;
  return {
    pong: "pong",
  };
});

async function applyConfigs() {
  await configSwagger(server);
  // await migrate(db, { migrationsFolder: "drizzle" });
}

export type MyServer = typeof server;

async function run() {
  await applyConfigs();

  server.get<{
    Reply: {
      pong: string;
    };
    Params: {
      id: number;
    };
  }>(
    "/ping/:id",
    {
      schema: {
        params: z.object({
          id: z.number({ coerce: true }),
        }),
        description: "Get pong",
        response: {
          200: z.object({
            pong: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      reply.status(200);
      return { pong: `pong ${request.params.id}` };
    }
  );

  const port = Number(process.env.PORT) || 8080;
  server.listen({ port }, async (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`🚀 Server listening at ${address} 🚀`);
  });
}

run();
