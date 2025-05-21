// src/server.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/database";
import logRoutes from "./routes/logRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rotta di base
app.use("/api/log", logRoutes);
app.get("/", (req, res) => {
  res.json({ message: "EdgLogger API" });
});

// Healthcheck con verifica MongoDB
app.get("/health", async (req, res) => {
  try {
    // Controlla se MongoDB è connesso
    if (mongoose.connection.readyState === 1) {
      res.status(200).json({
        status: "ok",
        mongo: "connected",
        environment: process.env.NODE_ENV,
      });
    } else {
      res.status(503).json({
        status: "error",
        mongo: "disconnected",
        environment: process.env.NODE_ENV,
      });
    }
  } catch (error: any) {
    console.error("Health check fallito", error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Collegamento al database e avvio del server
const startServer = async () => {
  try {
    // Connessione al database
    await connectDB();

    // Avvio server
    app.listen(PORT, () => {
      console.log(`Server logger in esecuzione sulla porta ${PORT}`);
      console.log(`Ambiente: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error: any) {
    console.error(`Errore nell'avvio del server logger: ${error.message}`);
    process.exit(1);
  }
};

// Avvia il server
startServer();
