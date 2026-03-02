"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = exports.saveHASettings = exports.getHASettings = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getHASettings = async () => {
    return await prisma.hASettings.findUnique({
        where: { id: 1 }
    });
};
exports.getHASettings = getHASettings;
const saveHASettings = async (haUrl, haToken) => {
    return await prisma.hASettings.upsert({
        where: { id: 1 },
        update: { haUrl, haToken },
        create: { id: 1, haUrl, haToken }
    });
};
exports.saveHASettings = saveHASettings;
const validateUser = async (username, password) => {
    // Simple admin/admin check as requested, could be expanded to real DB check
    if (username === 'admin' && password === 'admin') {
        let user = await prisma.user.findUnique({ where: { username: 'admin' } });
        if (!user) {
            user = await prisma.user.create({
                data: { username: 'admin', password: 'admin' } // In prod, hash this!
            });
        }
        return user;
    }
    return null;
};
exports.validateUser = validateUser;
