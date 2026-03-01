"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.cacheHitsCounter = exports.commandCounter = exports.llmResponseTime = exports.semanticCacheHitRatio = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
// Create a Registry which registers the metrics
const register = new prom_client_1.default.Registry();
exports.register = register;
// Add a default label which is added to all metrics
register.setDefaultLabels({
    app: 'smart-home-backend'
});
// Enable the collection of default metrics
prom_client_1.default.collectDefaultMetrics({ register });
// Custom Metrics
exports.semanticCacheHitRatio = new prom_client_1.default.Gauge({
    name: 'semantic_cache_hit_ratio',
    help: 'Percentage of commands answered by the semantic cache',
});
register.registerMetric(exports.semanticCacheHitRatio);
exports.llmResponseTime = new prom_client_1.default.Histogram({
    name: 'llm_response_time_ms',
    help: 'Duration of LLM requests in ms',
    buckets: [100, 500, 1000, 2000, 5000, 10000]
});
register.registerMetric(exports.llmResponseTime);
exports.commandCounter = new prom_client_1.default.Counter({
    name: 'command_requests_total',
    help: 'Total number of commands received'
});
register.registerMetric(exports.commandCounter);
exports.cacheHitsCounter = new prom_client_1.default.Counter({
    name: 'command_cache_hits_total',
    help: 'Total number of commands that hit the cache'
});
register.registerMetric(exports.cacheHitsCounter);
