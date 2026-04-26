import type { FastifyReply, FastifyRequest } from "fastify";

import { getHealthStatus } from "../services/health.service.js";

export async function getHealthController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const health = await getHealthStatus();

  return reply.status(health.httpStatus).send(health.payload);
}