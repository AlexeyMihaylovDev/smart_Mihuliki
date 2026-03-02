import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getHASettings = async () => {
    return await prisma.hASettings.findUnique({
        where: { id: 1 }
    });
};

export const saveHASettings = async (haUrl: string, haToken: string) => {
    return await prisma.hASettings.upsert({
        where: { id: 1 },
        update: { haUrl, haToken },
        create: { id: 1, haUrl, haToken }
    });
};

export const validateUser = async (username: string, password: string) => {
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
