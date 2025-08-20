import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import configureSocket from './configs/socket.config.js';
import SocketServices from './services/socket.service.js';
// import sanitizeInputs from './middlewares/sanitize.middleware.js';
// import { globalLimiter, blockChecker } from './configs/rateLimit.config.js';

const app = express();

import router from './routes/index.js';

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3001'], credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Healthcheck
app.get('/healthz', (req, res) => res.json({ ok: true }));
app.use('', router)
// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', code: 404, message: 'Not Found Route' });
});

export default app;