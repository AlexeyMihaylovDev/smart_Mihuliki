"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const llm_service_1 = require("../services/llm.service");
const ha_service_1 = require("../services/ha.service");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const llmService = new llm_service_1.LLMService();
router.post('/command', async (req, res) => {
    const { command } = req.body;
    const haUrl = req.headers['x-ha-url'];
    const haToken = req.headers['x-ha-token'];
    if (!command) {
        return res.status(400).json({ error: 'Command text is required' });
    }
    if (!haUrl || !haToken) {
        return res.status(401).json({ error: 'Missing Home Assistant credentials in headers (x-ha-url, x-ha-token)' });
    }
    const haService = new ha_service_1.HomeAssistantService(haUrl, haToken);
    try {
        // 1. Check Semantic Cache
        const normalizedCommand = command.trim().toLowerCase();
        const cacheEntry = await prisma.semanticCache.findUnique({
            where: { command: normalizedCommand },
        });
        let payloadString = '';
        let cacheHit = false;
        if (cacheEntry) {
            // CACHE HIT
            console.log(`[Cache HIT] Command: "${normalizedCommand}"`);
            await prisma.semanticCache.update({
                where: { id: cacheEntry.id },
                data: { hitCount: { increment: 1 } },
            });
            payloadString = cacheEntry.payload;
            cacheHit = true;
        }
        else {
            // CACHE MISS -> Call LLM
            console.log(`[Cache MISS] Sending to LLM: "${normalizedCommand}"`);
            const parsedCommand = await llmService.parseCommand(normalizedCommand);
            if (!parsedCommand) {
                return res.status(400).json({ error: 'Failed to understand the command via LLM' });
            }
            payloadString = JSON.stringify(parsedCommand);
            // Save to Cache for future
            await prisma.semanticCache.create({
                data: {
                    command: normalizedCommand,
                    payload: payloadString,
                    hitCount: 1,
                },
            });
            cacheHit = false;
        }
        // 2. Execute against Home Assistant
        const payload = JSON.parse(payloadString);
        const result = await haService.callService(payload.domain, payload.service, {
            entity_id: payload.entity_id
        });
        // 3. Save Chat History
        await prisma.chatHistory.create({
            data: { role: 'user', content: command }
        });
        const assistantReply = `Executed ${payload.service} on ${payload.entity_id}`;
        await prisma.chatHistory.create({
            data: { role: 'assistant', content: assistantReply }
        });
        res.json({
            success: true,
            cacheHit,
            action: payload,
            haResponse: result,
            reply: assistantReply
        });
    }
    catch (error) {
        console.error('Command Endpoint Error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/chat-history', async (req, res) => {
    try {
        const history = await prisma.chatHistory.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(history.reverse());
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
