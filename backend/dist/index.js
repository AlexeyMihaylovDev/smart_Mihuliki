"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const ha_routes_1 = __importDefault(require("./routes/ha.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const metrics_service_1 = require("./services/metrics.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Expose Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', metrics_service_1.register.contentType);
    res.send(await metrics_service_1.register.metrics());
});
app.use('/api/ha', ha_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.listen(port, () => {
    console.log(`Backend server is running on port ${port}`);
});
