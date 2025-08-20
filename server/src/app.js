import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import router from "./routes/index.js";
import configureSocket from "./configs/socket.config.js";
import SocketServices from "./services/socket.service.js";
import myLogger from "./loggers/mylogger.log.js";
// import sanitizeInputs from './middlewares/sanitize.middleware.js';
// import { globalLimiter, blockChecker } from './configs/rateLimit.config.js';

const app = express();

// Trust proxy
app.set("trust proxy", 1);

// Rate Limit
// app.use(blockChecker);
// app.use(globalLimiter);

// Init middlewares
const allowedOrigins = [
  process.env.CLIENT_LOCAL_ORIGIN, // Local Development
  process.env.CLIENT_ORIGIN, // Production Frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy does not allow access from ${origin}`));
      }
    },
    methods: "GET, HEAD, OPTIONS, PUT, PATCH, POST, DELETE", // Added OPTIONS for preflight requests
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

app.use(compression());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(sanitizeInputs);

/* ---------- Request ID + Logging ---------- */
app.use((req, _res, next) => {
  req.requestId = req.headers["x-request-id"] || uuidv4();
  next();
});
morgan.token("rid", (req) => req.requestId);
app.use(morgan(":method :url :status :response-time ms rid=:rid"));

app.use((req, _res, next) => {
  myLogger.log(`input-params ::${req.method}::`, [
    req.path,
    { requestId: req.requestId },
    req.method === "POST" || req.method === "PATCH" ? req.body : req.query,
  ]);
  next();
});

// Init db
import "./db/init.mongodb.js";

// Init routes
app.use("", router);

// Error handling
app.use((req, res, next) => {
  const error = new Error("Not Found Route");
  error.status = 404;
  next(error);
});

app.use((error, req, res, _next) => {
  const statusCode = error.status || 500;

  myLogger.error("handler-error", [
    req.path,
    { requestId: req.requestId },
    { status: statusCode, message: error.message },
  ]);

  // Avoid leaking internals in prod
  const message =
    statusCode === 404
      ? "Not Found"
      : process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : error.message || "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message,
  });
});

// Create HTTP server
const server = http.createServer(app);
const wss = configureSocket(server);

wss.on("connection", SocketServices.connection);

process.on("SIGINT", async () => {
  console.log("Received SIGINT. Closing WebSocket and HTTP connections...");

  wss.clients.forEach((ws) => ws.close());
  await mongoose.connection.close();
  server.close(() => {
    console.log("All services closed.");
    process.exit(0);
  });
});

export default server;
