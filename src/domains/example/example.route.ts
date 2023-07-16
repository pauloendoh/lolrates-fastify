import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { database } from "~/database";
import aircraftService from "~/domain/aircraft/services/aircraft.service";
import { GetFlightsResponseV1 } from "~/responses";
import { RouteGroup, WebError } from "~/types";
import { decimalToString } from "~/utils/decimal-to-string";
import { requireAuth } from "~/utils/require-auth";
import { postAssignFlightV1 } from "./handlers/assign";
import { postCancelFlight } from "./handlers/cancel";
import { postCreateFlightV1 } from "./handlers/create";
import { postFinishFlightRouteV1 } from "./handlers/finish";
import { getFlightPaginatedV1 } from "./handlers/get-paginated";
import { postStartFlightV1 } from "./handlers/start";
import { updateFlightTrackV1 } from "./handlers/update-track";

export const flightRoutesV1: RouteGroup = (fastify, _, done) => {
  fastify.get<{
    Reply: GetFlightsResponseV1 | WebError;
    Params: { flightId: number };
  }>(
    "/api/v1/flight/:flightId",
    {
      onRequest: requireAuth(fastify),
      schema: {
        params: z.object({ flightId: z.number({ coerce: true }) }),
        description: "Get Flight",
        tags: ["Flight"],
        summary: "Get Flight",
      },
    },
    async (request, reply) => {
      const { flightId } = request.params;

      const flight = await database.flight.findUnique({
        select: {
          id: true,
          status: true,
          payment: true,
          aircraft: {
            select: {
              register: true,
              aircraftModel: {
                select: {
                  typeDesignator: true,
                },
              },
              aircraftPayload: {
                select: {
                  payload: {
                    select: {
                      payment: true,
                      weightInPounds: true,
                      isPassenger: true,
                    },
                  },
                },
              },
            },
          },
          departure: {
            select: {
              icao: true,
            },
          },
          destination: {
            select: {
              icao: true,
            },
          },
        },
        where: { id: flightId },
      });

      if (!flight) {
        return reply.status(StatusCodes.NOT_FOUND).send({
          message: `Flight (id: ${flightId}) not found`,
        });
      }

      const { passengers, payloadWeightInPounds } =
        aircraftService.getPayloadSummary(flight.aircraft.aircraftPayload);

      const formattedFlight = {
        ...flight,
        aircraft: {
          ...flight.aircraft,
          aircraftPayload: undefined,
        },
        payloadWeightInPounds,
        passengers,
        payment: flight.payment.toFixed(2),
      };

      return reply
        .status(StatusCodes.OK)
        .send(decimalToString(formattedFlight));
    }
  );

  postFinishFlightRouteV1(fastify);
  getFlightPaginatedV1(fastify);
  postStartFlightV1(fastify);
  postAssignFlightV1(fastify);
  postCreateFlightV1(fastify);
  updateFlightTrackV1(fastify);
  postCancelFlight(fastify);

  done();
};
