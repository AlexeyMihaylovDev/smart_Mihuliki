import client from 'prom-client';

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
    app: 'smart-home-backend'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Custom Metrics
export const semanticCacheHitRatio = new client.Gauge({
    name: 'semantic_cache_hit_ratio',
    help: 'Percentage of commands answered by the semantic cache',
});
register.registerMetric(semanticCacheHitRatio);

export const llmResponseTime = new client.Histogram({
    name: 'llm_response_time_ms',
    help: 'Duration of LLM requests in ms',
    buckets: [100, 500, 1000, 2000, 5000, 10000]
});
register.registerMetric(llmResponseTime);

export const commandCounter = new client.Counter({
    name: 'command_requests_total',
    help: 'Total number of commands received'
});
register.registerMetric(commandCounter);

export const cacheHitsCounter = new client.Counter({
    name: 'command_cache_hits_total',
    help: 'Total number of commands that hit the cache'
});
register.registerMetric(cacheHitsCounter);

export { register };
