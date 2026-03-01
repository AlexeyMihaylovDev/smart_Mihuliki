import axios from 'axios';

export class HomeAssistantService {
    private baseUrl: string;
    private token: string;

    constructor(baseUrl: string, token: string) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.token = token;
    }

    private get headers() {
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

    async getHistory(entityId?: string) {
        const url = entityId ? `/api/history/period?filter_entity_id=${entityId}` : '/api/history/period';
        return this.request(url);
    }

    async callService(domain: string, service: string, serviceData: any = {}) {
        return this.request(`/api/services/${domain}/${service}`, 'POST', serviceData);
    }

    private async request(endpoint: string, method: string = 'GET', data?: any) {
        try {
            const response = await axios({
                url: `${this.baseUrl}${endpoint}`,
                method,
                headers: this.headers,
                data,
            });
            return response.data;
        } catch (error: any) {
            console.error(`HA API Error [${method} ${endpoint}]:`, error.message);
            throw new Error(`Home Assistant API error: ${error.message}`);
        }
    }
}
