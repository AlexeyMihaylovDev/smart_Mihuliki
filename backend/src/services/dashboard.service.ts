import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardConfig = async () => {
    return await prisma.dashboardConfig.findUnique({
        where: { id: 1 }
    });
};

export const saveDashboardConfig = async (widgets: string, layout: string) => {
    return await prisma.dashboardConfig.upsert({
        where: { id: 1 },
        update: { widgets, layout },
        create: { id: 1, widgets, layout }
    });
};
