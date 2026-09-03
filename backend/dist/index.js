"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./database");
const api_1 = require("./routes/api");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
// Health Check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'B!Pop Backend Server', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api', api_1.apiRouter);
// Start Server
(0, database_1.initDatabase)()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`\x1b[32m[B!Pop Server]\x1b[0m 🚀 Server running at http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error('Failed to initialize database:', err);
});
