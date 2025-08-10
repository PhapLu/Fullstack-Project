import dotenv from 'dotenv';
dotenv.config();

import { WebSocketServer } from 'ws';
import url from 'url';

export default function configureSocket(server) {
	const allowedOrigins = [
		process.env.CLIENT_LOCAL_ORIGIN,
		process.env.CLIENT_ORIGIN,
	];

	const wss = new WebSocketServer({
		server,
		verifyClient: (info, done) => {
			const origin = info.origin;
			if (!origin || allowedOrigins.includes(origin)) {
				done(true);
			} else {
				console.warn(`WebSocket connection rejected from origin: ${origin}`);
				done(false, 403, 'Forbidden');
			}
		},
	});

	// Global access
	global._wss = wss;

	return wss;
}
