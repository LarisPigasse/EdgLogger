// src/controllers/logController.ts
import { Request, Response } from "express";
import AzioneLog from "../models/AzioneLog";
import { computeDiff } from "../utils/diffUtils";

/**
 * Crea un nuovo log di azione
 */
export const creaLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const logData = req.body;

    // Aggiunta del timestamp se non presente
    if (!logData.timestamp) {
      logData.timestamp = new Date();
    }

    // Calcola le differenze se sono presenti entrambi gli stati
    if (logData.stato && logData.stato.precedente && logData.stato.nuovo && !logData.stato.diff) {
      logData.stato.diff = computeDiff(logData.stato.precedente, logData.stato.nuovo);
    }

    const nuovoLog = new AzioneLog(logData);
    await nuovoLog.save();

    res.status(201).json(nuovoLog);
  } catch (error: any) {
    console.error("Errore nella creazione del log:", error.message);
    res.status(500).json({
      message: "Errore interno del server",
      error: error.message,
    });
  }
};

/**
 * Recupera i log con filtri e paginazione
 */
export const cercaLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 0, limit = 50, entita, tipoAzione, esito, origineId, from, to, tags } = req.query;

    // Costruisci la query in base ai filtri
    const query: any = {};

    // Filtro per entità
    if (entita) {
      query["azione.entita"] = entita;
    }

    // Filtro per tipo di azione
    if (tipoAzione) {
      query["azione.tipo"] = tipoAzione;
    }

    // Filtro per esito
    if (esito) {
      query["risultato.esito"] = esito;
    }

    // Filtro per origine
    if (origineId) {
      query["origine.id"] = origineId;
    }

    // Filtro per intervallo di date
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from as string);
      if (to) query.timestamp.$lte = new Date(to as string);
    }

    // Filtro per tag
    if (tags) {
      const tagList = (tags as string).split(",");
      query.tags = { $in: tagList };
    }

    // Calcola skip per paginazione
    const skip = Number(page) * Number(limit);

    // Esegui la query
    const [logs, count] = await Promise.all([
      AzioneLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(Number(limit)),
      AzioneLog.countDocuments(query),
    ]);

    res.json({
      logs,
      totalCount: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / Number(limit)),
    });
  } catch (error: any) {
    console.error("Errore nel recupero dei log:", error.message);
    res.status(500).json({
      message: "Errore interno del server",
      error: error.message,
    });
  }
};

/**
 * Recupera un log specifico per ID
 */
export const getLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const log = await AzioneLog.findById(id);

    if (!log) {
      res.status(404).json({ message: "Log non trovato" });
      return;
    }

    res.json(log);
  } catch (error: any) {
    console.error(`Errore nel recupero del log ${req.params.id}:`, error.message);
    res.status(500).json({
      message: "Errore interno del server",
      error: error.message,
    });
  }
};

/**
 * Recupera i log associati a una transazione
 */
export const getTransazione = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transazioneId } = req.params;

    const logs = await AzioneLog.find({ "contesto.transazioneId": transazioneId }).sort({ timestamp: 1 });

    if (logs.length === 0) {
      res.status(404).json({ message: "Transazione non trovata" });
      return;
    }

    // Informazioni di base sulla transazione
    const firstLog = logs.find((log) => log.azione.operazione === "start" && log.azione.entita === "transaction");

    const lastLog = logs.find((log) => log.azione.operazione === "end" && log.azione.entita === "transaction");

    // Determina lo stato della transazione
    let status = "in_corso";
    if (lastLog) {
      status = lastLog.risultato.esito === "successo" ? "completed" : "failed";
    }

    res.json({
      transazioneId,
      name: firstLog?.azione.dettagli?.name || "Transazione",
      status,
      startTimestamp: firstLog?.timestamp || null,
      endTimestamp: lastLog?.timestamp || null,
      logs,
    });
  } catch (error: any) {
    console.error(`Errore nel recupero della transazione ${req.params.transazioneId}:`, error.message);
    res.status(500).json({
      message: "Errore interno del server",
      error: error.message,
    });
  }
};

/**
 * Recupera statistiche aggregate sui log
 */
export const getStatistiche = async (req: Request, res: Response): Promise<void> => {
  try {
    const { days = 7 } = req.query;

    // Calcola la data di inizio
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Statistiche per tipo di azione
    const actionStats = await AzioneLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$azione.tipo",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Statistiche per entità
    const entityStats = await AzioneLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$azione.entita",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Statistiche per esito
    const resultStats = await AzioneLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$risultato.esito",
          count: { $sum: 1 },
        },
      },
    ]);

    // Statistiche per origini più attive
    const originStats = await AzioneLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$origine.id",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    res.json({
      period: {
        days: Number(days),
        startDate,
        endDate: new Date(),
      },
      actionStats,
      entityStats,
      resultStats,
      originStats,
      summary: {
        totalLogs: await AzioneLog.countDocuments({ timestamp: { $gte: startDate } }),
        successCount: await AzioneLog.countDocuments({
          timestamp: { $gte: startDate },
          "risultato.esito": "successo",
        }),
        failedCount: await AzioneLog.countDocuments({
          timestamp: { $gte: startDate },
          "risultato.esito": "fallito",
        }),
      },
    });
  } catch (error: any) {
    console.error("Errore nel recupero delle statistiche:", error.message);
    res.status(500).json({
      message: "Errore interno del server",
      error: error.message,
    });
  }
};
