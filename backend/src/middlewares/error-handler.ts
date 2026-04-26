import { ZodError } from "zod";
import type { FastifyInstance } from "fastify";

import { AppError } from "../utils/app-error.js";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);

    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: "Validation failed",
        errors: error.flatten(),
      });
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        message: error.message,
        code: error.code,
      });
    }

    return reply.status(500).send({
      message: "Internal server error",
    });
  });
}