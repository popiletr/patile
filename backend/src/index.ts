import express from 'express';
import cors from 'cors';
import { initDatabase } from './database';
import { apiRouter } from './routes/api';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'B!Pop Backend Server', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRouter);

// Start Server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\x1b[32m[B!Pop Server]\x1b[0m 🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
  });
