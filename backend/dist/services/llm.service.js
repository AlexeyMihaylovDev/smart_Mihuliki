"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMService = void 0;
const axios_1 = __importDefault(require("axios"));
class LLMService {
    ollamaUrl;
    model;
    constructor(ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434', model = process.env.OLLAMA_MODEL || 'llama3') {
        this.ollamaUrl = ollamaUrl.replace(/\/$/, '');
        this.model = model;
    }
    async parseCommand(text) {
        const prompt = `
You are a smart home assistant. The user will give you a command in natural language.
You must map this command to a Home Assistant service call.
Respond strictly in JSON format with exactly three keys: "domain", "service", and "entity_id".
Do not include any other text, markdown formatting, or explanation.
Example 1:
User: Turn on the living room lights
Assistant: {"domain": "light", "service": "turn_on", "entity_id": "light.living_room"}
Example 2:
User: Set the thermostat to 22 degrees
Assistant: {"domain": "climate", "service": "set_temperature", "entity_id": "climate.living_room"}

Command to process: "${text}"
    `;
        try {
            const response = await axios_1.default.post(`${this.ollamaUrl}/api/generate`, {
                model: this.model,
                prompt: prompt,
                stream: false,
                format: "json"
            });
            const responseText = response.data.response;
            console.log('LLM Raw Response:', responseText);
            const parsed = JSON.parse(responseText);
            if (parsed.domain && parsed.service && parsed.entity_id) {
                return parsed;
            }
            return null;
        }
        catch (error) {
            console.error('LLM parsing error:', error.message);
            return null;
        }
    }
}
exports.LLMService = LLMService;
