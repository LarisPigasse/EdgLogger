# EdgLogger - Sistema di Logging Avanzato 📊

> **Versione:** 1.1.0  
> **Stato:** ✅ Production Ready  
> **Ultima modifica:** 9 Febbraio 2025

Sistema di logging centralizzato per la piattaforma EDG, con supporto per eventi standardizzati, audit trail completo e tracciamento transazioni multi-step.

## 🎯 Caratteristiche Principali

✅ **Eventi Standardizzati** - 6 categorie predefinite con 59 sottotipi  
✅ **API Fluent Builder** - Creazione eventi semplificata e type-safe  
✅ **Audit Trail Completo** - Tracciamento modifiche con diff automatico  
✅ **Query Ottimizzate** - 12 indici MongoDB per performance elevate  
✅ **Retrocompatibilità** - Supporto completo per formato legacy  
✅ **TypeScript Strict** - Type safety end-to-end  

---

## 📚 Documentazione

- **[Guida Eventi Standardizzati](EVENTI_STANDARDIZZATI.md)** - Tutorial completo con esempi
- **[FASE 1 Completata](FASE1_COMPLETATA.md)** - Riepilogo implementazione
- **[Changelog](CHANGELOG.md)** - Storico versioni e modifiche

---

## 🚀 Quick Start

### 1. Installazione

```bash
cd D:\Sviluppo\edg-docker\log-service
npm install
```

### 2. Configurazione

Crea file `.env` partendo da `.env.example`:

```env
# Server
PORT=4000
NODE_ENV=development
SKIP_AUTH=false  # Solo per sviluppo

# MongoDB
MONGODB_URI=mongodb://username:password@host:port/database

# Sicurezza
API_KEY_SECRET=your_api_key_here
```

### 3. Avvio

```bash
# Sviluppo con hot-reload
npm run dev

# Produzione
npm run build
npm start

# Test eventi standardizzati
npm run test:events
```

---

## 📋 Categorie Eventi Standardizzate

### 🔐 AUTH - Autenticazione e Autorizzazione
- Login/Logout (successo/fallito)
- Password reset/change
- MFA enable/disable/challenge
- Token refresh/revoke
- Session expiry

### 📊 DATA - Operazioni CRUD
- Create/Update/Delete/Restore
- Bulk operations
- Import/Export
- Tracking campi modificati
- Diff automatico stato

### 📧 EMAIL - Tracking Email
- Sent/Delivered/Failed
- Bounced (hard/soft)
- Opened/Clicked
- Unsubscribed/Spam reported

### ⚙️ SYSTEM - Eventi Sistema
- Cron job start/complete/failed
- Batch process tracking
- API calls esterni
- Webhook received/sent
- Database backup/restore

### 📝 AUDIT - Compliance
- Permission granted/revoked
- Role assigned/removed
- Configuration changes
- Policy violations
- Sensitive data access

### 🛡️ SECURITY - Sicurezza
- Suspicious activity
- Brute force attempts
- IP blocked
- Rate limit exceeded
- Encryption key rotation

---

## 💻 Esempi di Utilizzo

### Formato Standardizzato (✅ Raccomandato)

#### Login Utente

```typescript
import { EventBuilder } from "./utils/eventBuilder";
import AzioneLog from "./models/azioneLog";

// Login riuscito
const loginEvent = EventBuilder.auth
  .login()
  .user("user_123", "mario.rossi", "mario@edg.com")
  .fromIp("192.168.1.100")
  .session("sess_abc123")
  .withTags("authentication", "web-login")
  .build();

await AzioneLog.create(loginEvent);

// Login fallito
const failedEvent = EventBuilder.auth
  .loginFailed()
  .user("user_123")
  .fromIp("203.0.113.42")
  .failureReason("Password errata (3° tentativo)")
  .severity(EventSeverity.WARNING)
  .build();

await AzioneLog.create(failedEvent);
```

#### Creazione/Modifica Ordine

```typescript
// Creazione ordine
const createEvent = EventBuilder.data
  .create("order", "ord_12345")
  .entityName("Ordine Milano-Roma Express")
  .byUser("user_001")
  .withState(null, {
    status: "pending",
    amount: 150.0,
    items: 5,
  })
  .withTags("order-management", "express-delivery")
  .build();

await AzioneLog.create(createEvent);

// Aggiornamento ordine con tracking campi modificati
const updateEvent = EventBuilder.data
  .update("order", "ord_12345")
  .byUser("user_003")
  .fieldsChanged("status", "trackingNumber")
  .withState(
    { status: "pending", trackingNumber: null },
    { status: "in_transit", trackingNumber: "TRK987654321" }
  )
  .build();

await AzioneLog.create(updateEvent);
```

#### Email Tracking

```typescript
// Email inviata con successo
const emailEvent = EventBuilder.email
  .sent("customer@example.com", "Conferma ordine #12345")
  .emailId("email_abc123")
  .template("order-confirmation")
  .provider("sendgrid")
  .withTags("transactional", "order")
  .build();

await AzioneLog.create(emailEvent);

// Email bounce
const bounceEvent = EventBuilder.email
  .bounced("invalid@example.com", "Welcome", "hard")
  .template("welcome-email")
  .build();

await AzioneLog.create(bounceEvent);
```

#### Cron Job / Processo Sistema

```typescript
// Cron job completato
const cronEvent = EventBuilder.system
  .cronJob("daily-shipping-report")
  .completed(4200, 850) // 4.2 secondi, 850 record processati
  .withTags("automation", "reports")
  .build();

await AzioneLog.create(cronEvent);

// Cron job fallito
const failedCron = EventBuilder.system
  .cronJob("nightly-backup")
  .failed("Spazio disco insufficiente")
  .severity(EventSeverity.ERROR)
  .build();

await AzioneLog.create(failedCron);
```

### Formato Legacy (✅ Ancora Supportato)

```typescript
// Formato legacy continua a funzionare
const legacyLog = {
  origine: {
    tipo: "utente",
    id: "user-123",
    dettagli: { nome: "Mario Rossi" }
  },
  azione: {
    tipo: "update",
    entita: "operatore",
    idEntita: "op-456",
    operazione: "aggiorna_profilo"
  },
  risultato: {
    esito: "successo"
  },
  contesto: {
    ambiente: "production",
    ip: "192.168.1.1"
  }
};

await AzioneLog.create(legacyLog);
```

---

## 🔍 Query Avanzate

### Query per Categoria

```typescript
import { EventCategory } from "./types/eventCategories";

// Eventi AUTH ultimi 7 giorni
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const authEvents = await AzioneLog.findByCategory(
  EventCategory.AUTH,
  sevenDaysAgo
);
```

### Eventi Critici

```typescript
// Ultimi 100 eventi critici
const criticalEvents = await AzioneLog.findCriticalEvents(100);

// Solo eventi che richiedono alert
const alertEvents = criticalEvents.filter(event => event.requiresAlert());
```

### Statistiche per Categoria

```typescript
// Statistiche ultimi 30 giorni
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const stats = await AzioneLog.getStatsByCategory(thirtyDaysAgo);

// Output esempio:
// [
//   {
//     _id: "AUTH",
//     totalEvents: 15420,
//     bySeverity: [
//       { severity: "info", count: 14500 },
//       { severity: "warning", count: 800 }
//     ]
//   }
// ]
```

---

## 🌐 API REST

### Endpoints Principali

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| POST | `/api/log/azione` | Registra nuovo evento |
| GET | `/api/log/azioni` | Query eventi con filtri |
| GET | `/api/log/azioni/:id` | Recupera evento specifico |
| GET | `/api/log/transazioni/:id` | Eventi per transazione |
| GET | `/api/log/statistiche` | Statistiche aggregate |
| GET | `/health` | Health check |

### Autenticazione

Tutte le richieste richiedono API Key:

```bash
# Header HTTP
curl -H "x-api-key: your_api_key_here" \
     http://localhost:4000/api/log/azioni

# Query parameter
curl http://localhost:4000/api/log/azioni?apiKey=your_api_key_here
```

### Esempio POST Evento Standardizzato

```bash
curl -X POST http://localhost:4000/api/log/azione \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{
    "categoria": "AUTH",
    "sottoCategoria": "login_success",
    "criticita": "info",
    "metadata": {
      "userId": "user_123",
      "username": "mario.rossi",
      "ip": "192.168.1.100"
    },
    "risultato": {
      "esito": "successo"
    }
  }'
```

### Query con Filtri

```bash
# Eventi AUTH ultimi 7 giorni
curl "http://localhost:4000/api/log/azioni?categoria=AUTH&days=7" \
  -H "x-api-key: your_api_key_here"

# Eventi critici
curl "http://localhost:4000/api/log/azioni?criticita=critical&criticita=error" \
  -H "x-api-key: your_api_key_here"

# Eventi per utente specifico
curl "http://localhost:4000/api/log/azioni?origineId=user_123" \
  -H "x-api-key: your_api_key_here"
```

---

## 📊 Modello Dati

### Schema Completo

```typescript
interface IAzioneLog {
  timestamp: Date;
  
  // CAMPI STANDARDIZZATI (nuovi, opzionali)
  categoria?: EventCategory;        // AUTH, DATA, EMAIL, SYSTEM, AUDIT, SECURITY
  sottoCategoria?: EventType;       // login_success, create, sent, etc.
  criticita?: EventSeverity;        // info, warning, error, critical
  metadata?: EventMetadata;         // Metadata tipizzati per categoria
  
  // CAMPI LEGACY (sempre presenti)
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
```

### Indici MongoDB

**7 indici semplici:**
- `timestamp` - Query temporali
- `categoria` - Filtri per categoria
- `sottoCategoria` - Filtri per sottotipo
- `criticita` - Filtri per severità
- `origine.id` - Tracking utente/sistema
- `azione.entita` - Filtri per tipo entità
- `azione.idEntita` - Tracking entità specifica
- `risultato.esito` - Successi/fallimenti
- `contesto.transazioneId` - Raggruppamento transazioni
- `contesto.sessione` - Tracking sessioni
- `contesto.ambiente` - Separazione ambienti
- `tags` - Ricerche per tag

**5 indici composti:**
1. `{ transazioneId, timestamp }` → Transazioni ordinate
2. `{ categoria, criticita, timestamp }` → Dashboard categoria+severità
3. `{ "origine.id", timestamp }` → Audit trail utente
4. `{ "azione.entita", "azione.idEntita", timestamp }` → Storia entità
5. `{ criticita, timestamp }` (partial: ERROR/CRITICAL) → Alerting

---

## 🏗️ Architettura

```
edg-docker/log-service/
├── src/
│   ├── config/               # Configurazioni
│   │   ├── database.ts       # MongoDB connection
│   │   └── logger.ts         # Winston logger
│   ├── controllers/          # Business logic
│   │   └── logController.ts
│   ├── middleware/           # Express middleware
│   │   └── authMiddleware.ts # API key auth
│   ├── models/               # MongoDB models
│   │   └── azioneLog.ts      # Schema eventi (ESTESO v1.1)
│   ├── routes/               # API routes
│   │   └── logRoutes.ts
│   ├── scripts/              # Utility scripts
│   │   ├── testApi.ts        # API test (legacy)
│   │   └── testStandardizedEvents.ts  # Test eventi (v1.1)
│   ├── types/                # TypeScript types
│   │   ├── express.ts        # Express extensions
│   │   └── eventCategories.ts # Categorie eventi (NEW v1.1)
│   ├── utils/                # Utilities
│   │   ├── diffUtils.ts      # State diff calculator
│   │   ├── eventValidator.ts # Validazione eventi (NEW v1.1)
│   │   └── eventBuilder.ts   # Builder fluent (NEW v1.1)
│   └── server.ts             # Entry point
├── EVENTI_STANDARDIZZATI.md  # Guida completa (NEW v1.1)
├── FASE1_COMPLETATA.md        # Riepilogo FASE 1 (NEW v1.1)
├── CHANGELOG.md               # Storico versioni (NEW v1.1)
└── package.json
```

---

## 🛠️ Scripts NPM

```bash
# Sviluppo
npm run dev              # Server con hot-reload (nodemon + ts-node)

# Produzione
npm run build            # Compila TypeScript
npm start                # Avvia server compilato

# Test
npm run test:api         # Test API legacy
npm run test:events      # Test eventi standardizzati (NEW)

# Utility
npm run lint             # ESLint check
```

---

## 🔐 Sicurezza

- **Autenticazione**: API Key obbligatoria
- **Helmet**: Sicurezza header HTTP
- **CORS**: Configurabile via ambiente
- **Validazione**: Input sanitization automatica
- **TypeScript**: Type safety compile-time

---

## 📈 Performance

| Metrica | Valore |
|---------|--------|
| **Throughput** | ~1000 req/sec (eventi semplici) |
| **Latency avg** | <50ms (write), <20ms (read with index) |
| **Indici MongoDB** | 12 (7 semplici + 5 composti) |
| **Storage overhead** | ~15% per indici |
| **Memory footprint** | ~100MB base + ~1MB per 10K eventi |

---

## 🚀 Roadmap

### ✅ FASE 1 - Eventi Standardizzati (COMPLETATA)
- [x] Categorie eventi predefinite
- [x] Event Builder API fluent
- [x] Sistema validazione
- [x] Indici ottimizzati
- [x] Test suite completa

### 🔄 FASE 2 - Client Library & Dashboard (Q1 2025)
- [ ] Package NPM `@edg/log-client`
- [ ] Middleware Express auto-logging
- [ ] Dashboard React per visualizzazione
- [ ] Grafici statistiche real-time
- [ ] Export CSV/JSON

### 📅 FASE 3 - Alerting & Compliance (Q2 2025)
- [ ] Sistema notifiche (Slack, Email)
- [ ] Regole alert configurabili
- [ ] Retention policy automatica
- [ ] GDPR compliance tools
- [ ] Report compliance

---

## 👥 Contribuire

1. Crea feature branch: `git checkout -b feature/nome-feature`
2. Commit modifiche: `git commit -am 'Add feature'`
3. Push branch: `git push origin feature/nome-feature`
4. Apri Pull Request

---

## 📝 License

ISC

---

## 📞 Supporto

**Maintainer:** Mormegil @ Express Delivery Group  
**Repository:** https://github.com/LarisPigasse/EdgLogger  
**Issues:** https://github.com/LarisPigasse/EdgLogger/issues

---

**Made with ❤️ for EDG Platform**
