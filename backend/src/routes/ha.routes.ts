import { Router } from 'express';
import { HomeAssistantService } from '../services/ha.service';

const router = Router();

// Middleware to initialize HA service per request using headers
router.use((req, res, next) => {
    const haUrl = req.headers['x-ha-url'] as string;
    const haToken = req.headers['x-ha-token'] as string;

    if (!haUrl || !haToken) {
        return res.status(401).json({ error: 'Missing Home Assistant credentials in headers (x-ha-url, x-ha-token)' });
    }

    (req as any).haService = new HomeAssistantService(haUrl, haToken);
    next();
});

router.get('/config', async (req, res) => {
    try {
        const data = await (req as any).haService.getConfig();
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/states', async (req, res) => {
    try {
        const data = await (req as any).haService.getStates();
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/events', async (req, res) => {
    try {
        const data = await (req as any).haService.getEvents();
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/history', async (req, res) => {
    try {
        const { entity_id } = req.query;
        const data = await (req as any).haService.getHistory(entity_id as string);
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/services/:domain/:service', async (req, res) => {
    try {
        const { domain, service } = req.params;
        const data = await (req as any).haService.callService(domain, service, req.body);
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
