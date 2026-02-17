// src/routes/logRoutes.ts
import express from "express";
import { apiKeyAuth } from "../middleware/authMiddleware";
import * as logController from "../controllers/logController";

const router = express.Router();

// Endpoint per i log
router.post("/azione", apiKeyAuth, logController.creaLog);
router.get("/azioni", logController.cercaLogs);
router.get("/azioni/:id", logController.getLog);
router.get("/transazioni/:transazioneId", apiKeyAuth, logController.getTransazione);
router.get("/statistiche", logController.getStatistiche);
router.get("/utenti", logController.getUtenti); // Utenti distinti presenti nei log

export default router;
