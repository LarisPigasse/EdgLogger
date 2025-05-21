// src/models/AzioneLog.ts
import mongoose, { Document, Schema } from "mongoose";

// Definizione dell'interfaccia per il documento MongoDB
export interface IAzioneLog extends Document {
  timestamp: Date;
  origine: {
    tipo: "utente" | "sistema";
    id: string;
    dettagli: Record<string, any>;
  };
  azione: {
    tipo: "create" | "update" | "delete" | "custom";
    entita: string;
    idEntita: string;
    operazione: string;
    dettagli: Record<string, any>;
  };
  risultato: {
    esito: "successo" | "fallito" | "parziale";
    messaggio?: string;
  };
  contesto: {
    transazioneId?: string;
    causalita?: string[];
    sessione?: string;
    ip?: string;
    userAgent?: string;
    ambiente: string;
  };
  stato: {
    precedente: Record<string, any> | null;
    nuovo: Record<string, any> | null;
    diff: Record<string, any> | null;
  };
  tags: string[];
}

// Schema MongoDB
const AzioneLogSchema = new Schema<IAzioneLog>({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  origine: {
    tipo: {
      type: String,
      enum: ["utente", "sistema"],
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    dettagli: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  azione: {
    tipo: {
      type: String,
      enum: ["create", "update", "delete", "custom"],
      required: true,
    },
    entita: {
      type: String,
      required: true,
    },
    idEntita: {
      type: String,
      required: true,
    },
    operazione: {
      type: String,
      required: true,
    },
    dettagli: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  risultato: {
    esito: {
      type: String,
      enum: ["successo", "fallito", "parziale"],
      required: true,
    },
    messaggio: String,
  },
  contesto: {
    transazioneId: { type: String, index: true },
    causalita: [{ type: String }],
    sessione: String,
    ip: String,
    userAgent: String,
    ambiente: { type: String, required: true, default: "development" },
  },
  stato: {
    precedente: { type: Schema.Types.Mixed, default: null },
    nuovo: { type: Schema.Types.Mixed, default: null },
    diff: { type: Schema.Types.Mixed, default: null },
  },
  tags: [
    {
      type: String,
    },
  ],
});

// Creazione del modello
const AzioneLog = mongoose.model<IAzioneLog>("AzioneLog", AzioneLogSchema);

// Crea un indice composto per le transazioni
AzioneLogSchema.index({ "contesto.transazioneId": 1, timestamp: 1 });

export default AzioneLog;
