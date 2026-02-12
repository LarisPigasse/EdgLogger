// src/routes/logRoutes.ts
import express from "express";
import { apiKeyAuth } from "../middleware/authMiddleware";
import * as logController from "../controllers/logController";

const router = express.Router();

// Endpoint per i log
router.post("/azione", apiKeyAuth, logController.creaLog);
router.get("/azioni", logController.cercaLogs); // Rimosso apiKeyAuth per dashboard
router.get("/azioni/:id", logController.getLog); // Rimosso apiKeyAuth per dashboard
router.get("/transazioni/:transazioneId", apiKeyAuth, logController.getTransazione);
router.get("/statistiche", logController.getStatistiche); // Rimosso apiKeyAuth per dashboard

export default router;
