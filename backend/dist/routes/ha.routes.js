"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ha_service_1 = require("../services/ha.service");
const router = (0, express_1.Router)();
// Middleware to initialize HA service per request using headers
router.use((req, res, next) => {
    const haUrl = req.headers['x-ha-url'];
    const haToken = req.headers['x-ha-token'];
    if (!haUrl || !haToken) {
        return res.status(401).json({ error: 'Missing Home Assistant credentials in headers (x-ha-url, x-ha-token)' });
    }
    req.haService = new ha_service_1.HomeAssistantService(haUrl, haToken);
    next();
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
