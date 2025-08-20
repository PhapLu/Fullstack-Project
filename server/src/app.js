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
import configureSocket from "./configs/socket.config.js";
import SocketServices from "./services/socket.service.js";
// import sanitizeInputs from './middlewares/sanitize.middleware.js';
// import { globalLimiter, blockChecker } from './configs/rateLimit.config.js';

const app = express();

import router from "./routes/index.js";
import myLogger from "./loggers/mylogger.log.js";

app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:3001"],
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());
app.use("", router);

// Healthcheck
app.get("/healthz", (req, res) => res.json({ ok: true }));

/* ---------- Request ID + Logging ---------- */
app.use((req, _res, next) => {
    req.requestId = req.headers["x-request-id"] || uuidv4();
    next();
});

app.use((req, _res, next) => {
    myLogger.log(`input-params ::${req.method}::`, [
        req.path,
        { requestId: req.requestId },
        req.method === "POST" || req.method === "PATCH" ? req.body : req.query,
    ]);
    next();
});

// 404 handler (đặt sau cùng)
app.use((req, res) => {
    res.status(404).json({
        status: "error",
        code: 404,
        message: "Not Found Route",
    });
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

export default app;
