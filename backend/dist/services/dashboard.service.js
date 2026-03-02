"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardConfig = exports.saveDashboardConfig = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const saveDashboardConfig = async (pages, activePageId) => {
    return await prisma.dashboardConfig.upsert({
        where: { id: 1 },
        update: {
            pages: JSON.stringify(pages),
            activePageId
        },
        create: {
            id: 1,
            pages: JSON.stringify(pages),
            activePageId
        },
    });
};
exports.saveDashboardConfig = saveDashboardConfig;
const getDashboardConfig = async () => {
    let config = await prisma.dashboardConfig.findUnique({
        where: { id: 1 }
    });
    if (!config) {
        // Initialize with default page if not found
        const defaultPages = [{ id: 'home', name: 'Home', widgets: [], layout: [] }];
        config = await (0, exports.saveDashboardConfig)(defaultPages, 'home');
    }
    return {
        pages: JSON.parse(config.pages),
        activePageId: config.activePageId
    };
};
exports.getDashboardConfig = getDashboardConfig;
