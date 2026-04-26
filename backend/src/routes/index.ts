import { Router } from "express";

export const router = Router();

router.get("/v1", (_request, response) => {
  response.status(200).json({
    message: "SecureBoard backend is running",
  });
});