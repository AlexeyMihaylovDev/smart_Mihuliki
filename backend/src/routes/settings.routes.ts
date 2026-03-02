import { Router } from 'express';
import * as authService from '../services/auth.service';

const router = Router();

router.get('/ha', async (req, res) => {
    try {
        const settings = await authService.getHASettings();
        res.json(settings || { haUrl: '', haToken: '' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/ha', async (req, res) => {
    const { haUrl, haToken } = req.body;
    try {
        const settings = await authService.saveHASettings(haUrl, haToken);
        res.json(settings);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
