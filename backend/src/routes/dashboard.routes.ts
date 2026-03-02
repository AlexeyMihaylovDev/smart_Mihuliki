import { Router } from 'express';
import * as dashboardService from '../services/dashboard.service';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const config = await dashboardService.getDashboardConfig();
        res.json(config || { widgets: '[]', layout: '[]' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard config' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { widgets, layout } = req.body;
        const config = await dashboardService.saveDashboardConfig(
            JSON.stringify(widgets),
            JSON.stringify(layout)
        );
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save dashboard config' });
    }
});

export default router;
