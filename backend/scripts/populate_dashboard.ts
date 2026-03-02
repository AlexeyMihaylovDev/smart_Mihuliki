
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const haUrl = "http://192.168.3.72:8123";
    const haToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI0ZTgzYTZkM2JmNzQ0YWY2YjU3YTQwNWMwOWMzNGJiZCIsImlhdCI6MTc3MjM5MzY3MiwiZXhwIjoyMDg3NzUzNjcyfQ.pT8s2YcQXfq8-7kT_Njy_EoiikEeQjk71_lCz4erU84";

    // 1. Update Settings
    await prisma.hASettings.upsert({
        where: { id: 1 },
        update: { haUrl, haToken },
        create: { id: 1, haUrl, haToken }
    });

    // 2. Define Entities from Curl Output
    const switches = [
        { id: "switch.vr_khdr_hvrym_switch_1", name: "Parents Room Light" },
        { id: "switch.vr_khdr_bnvt_switch_1", name: "Girls Room Light" },
        { id: "switch.vr_khdr_mmd_switch_1", name: "MMD Room Light" },
        { id: "switch.msdrvn_switch_1", name: "Corridor Light" }
    ];

    const sensors = [
        "sensor.khyyshn_nvkkhvt_khdr_bnvt_battery",
        "sensor.khyshn_nvkkhvt_khdr_gl_d_battery",
        "sensor.khyyshn_nvkkhvt_khdr_hvrym_battery"
    ];

    const scenes = [
        { id: "scene.kybvy_klly_shl_kl_hbyt", name: "All Off" },
        { id: "scene.kybvy_mtbkh", name: "Kitchen Off" },
        { id: "scene.hdlq_mtbkh", name: "Kitchen On" },
        { id: "scene.sgyrt_vylvnvt", name: "Close Curtains" },
        { id: "scene.60_ptykhh", name: "60% Open" }
    ];

    // 3. Generate Pages
    const pages = [
        {
            id: "main",
            name: "Main",
            widgets: switches.map((s, i) => ({
                id: `w-main-${i}`,
                entityId: s.id,
                title: s.name,
                type: "switch"
            })),
            layout: switches.map((s, i) => ({
                i: `w-main-${i}`,
                x: (i % 3) * 4,
                y: Math.floor(i / 3) * 3,
                w: 4,
                h: 3
            }))
        },
        {
            id: "system",
            name: "System",
            widgets: [
                {
                    id: "w-sys-battery",
                    entityId: "__list__",
                    entityIds: sensors,
                    title: "Battery Status",
                    type: "sensor_list"
                }
            ],
            layout: [
                { i: "w-sys-battery", x: 0, y: 0, w: 6, h: Math.min(sensors.length + 2, 8) }
            ]
        },
        {
            id: "scenes",
            name: "Scenes",
            widgets: scenes.map((s, i) => ({
                id: `w-scene-${i}`,
                entityId: s.id,
                title: s.name,
                type: "generic"
            })),
            layout: scenes.map((s, i) => ({
                i: `w-scene-${i}`,
                x: (i % 4) * 3,
                y: Math.floor(i / 4) * 3,
                w: 3,
                h: 3
            }))
        }
    ];

    // 4. Save Config
    await prisma.dashboardConfig.upsert({
        where: { id: 1 },
        update: {
            pages: JSON.stringify(pages),
            activePageId: "main"
        },
        create: {
            id: 1,
            pages: JSON.stringify(pages),
            activePageId: "main"
        }
    });

    console.log("Dashboard populated successfully.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
