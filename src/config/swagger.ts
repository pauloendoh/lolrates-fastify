import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform } from "fastify-type-provider-zod";
import { MyServer } from "..";

export const configSwagger = async (app: MyServer) => {
  await app.register(fastifySwagger, {
    swagger: {
      info: {
        title: "Flight Schedule",
        version: "0.1.0",
      },
    },
    transform: jsonSchemaTransform,
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/swagger",
  });
};
