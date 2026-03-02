"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ha_service_1 = require("../services/ha.service");
const authService = __importStar(require("../services/auth.service"));
const router = (0, express_1.Router)();
// Middleware to initialize HA service per request
router.use(async (req, res, next) => {
    try {
        // Try headers first for backward compatibility
        let haUrl = req.headers['x-ha-url'];
        let haToken = req.headers['x-ha-token'];
        // If not in headers, get from DB
        if (!haUrl || !haToken) {
            const settings = await authService.getHASettings();
            if (settings?.haUrl && settings?.haToken) {
                haUrl = settings.haUrl;
                haToken = settings.haToken;
            }
        }
        if (!haUrl || haToken === undefined) {
            return res.status(401).json({ error: 'Home Assistant not configured. Please set URL and Token in Settings.' });
        }
        req.haService = new ha_service_1.HomeAssistantService(haUrl, haToken);
        next();
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
router.get('/config', async (req, res) => {
    try {
        const data = await req.haService.getConfig();
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
router.get('/states', async (req, res) => {
    try {
        const data = await req.haService.getStates();
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
router.get('/events', async (req, res) => {
    try {
        const data = await req.haService.getEvents();
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
router.get('/history', async (req, res) => {
    try {
        const { entity_id } = req.query;
        const data = await req.haService.getHistory(entity_id);
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
router.post('/services/:domain/:service', async (req, res) => {
    try {
        const { domain, service } = req.params;
        const data = await req.haService.callService(domain, service, req.body);
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.default = router;
