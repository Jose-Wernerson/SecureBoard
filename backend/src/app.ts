import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { router } from "./routes/index.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_request, response) => {
  response.status(200).json({
    name: "SecureBoard API",
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", router);