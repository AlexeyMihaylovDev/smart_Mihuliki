"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeAssistantService = void 0;
const axios_1 = __importDefault(require("axios"));
class HomeAssistantService {
    baseUrl;
    token;
    constructor(baseUrl, token) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.token = token;
    }
    get headers() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
        };
    }
    async getConfig() {
        return this.request('/api/config');
    }
    async getStates() {
        return this.request('/api/states');
    }
    async getEvents() {
        return this.request('/api/events');
    }
    async getHistory(entityId) {
        const url = entityId ? `/api/history/period?filter_entity_id=${entityId}` : '/api/history/period';
        return this.request(url);
    }
    async callService(domain, service, serviceData = {}) {
        return this.request(`/api/services/${domain}/${service}`, 'POST', serviceData);
    }
    async request(endpoint, method = 'GET', data) {
        try {
            const response = await (0, axios_1.default)({
                url: `${this.baseUrl}${endpoint}`,
                method,
                headers: this.headers,
                data,
            });
            return response.data;
        }
        catch (error) {
            console.error(`HA API Error [${method} ${endpoint}]:`, error.message);
            throw new Error(`Home Assistant API error: ${error.message}`);
        }
    }
}
exports.HomeAssistantService = HomeAssistantService;
