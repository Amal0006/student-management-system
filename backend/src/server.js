import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

mongoose.set('bufferCommands', false);
const port = Number(process.env.PORT) || 5000;
const uri = process.env.MONGODB_URI;
let server;

async function start() {
  if (!uri) {
    console.error('MONGODB_URI is required. Copy backend/.env.example to backend/.env and configure it.');
    process.exitCode = 1;
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    app.locals.databaseReady = true;
    mongoose.connection.on('disconnected', () => { app.locals.databaseReady = false; console.error('MongoDB disconnected. Student API requests will return 503 until it reconnects.'); });
    mongoose.connection.on('connected', () => { app.locals.databaseReady = true; console.log('MongoDB connected.'); });
    server = app.listen(port, () => console.log(`Student API listening on http://localhost:${port}`));
  } catch (error) {
    console.error(`Could not connect to MongoDB: ${error.message}`);
    process.exitCode = 1;
  }
}

async function shutdown(signal) {
  console.log(`${signal} received; shutting down.`);
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
start();
