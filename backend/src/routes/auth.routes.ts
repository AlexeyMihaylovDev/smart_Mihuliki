import { Router } from 'express';
import * as authService from '../services/auth.service';

const router = Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await authService.validateUser(username, password);
        if (user) {
            res.json({ success: true, user: { id: user.id, username: user.username } });
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
