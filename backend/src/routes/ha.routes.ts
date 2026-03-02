import { Router } from 'express';
import { HomeAssistantService } from '../services/ha.service';
import * as authService from '../services/auth.service';

const router = Router();

// Middleware to initialize HA service per request
router.use(async (req, res, next) => {
    try {
        // Try headers first for backward compatibility
        let haUrl = req.headers['x-ha-url'] as string;
        let haToken = req.headers['x-ha-token'] as string;

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

        (req as any).haService = new HomeAssistantService(haUrl, haToken);
        next();
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
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
