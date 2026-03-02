import { create } from 'zustand';
import { HassEntities } from 'home-assistant-js-websocket';
import { Layout } from 'react-grid-layout';

interface AuthState {
    haUrl: string | null;
    haToken: string | null;
    isAuthenticated: boolean;
    setAuth: (url: string, token: string) => void;
    logout: () => void;
}

interface HAState {
    entities: HassEntities | null;
    setEntities: (entities: HassEntities) => void;
    connection: any | null;
    setConnection: (conn: any) => void;
}

interface DashboardWidget {
    id: string;
    entityId: string;          // primary entity (or '__list__' for list widgets)
    entityIds?: string[];      // used by SensorListWidget
    title?: string;            // optional title for list widgets
    type: 'light' | 'sensor' | 'switch' | 'generic' | 'sensor_list' | 'cover';
}

interface DashboardState {
    widgets: DashboardWidget[];
    layout: Layout[];
    addWidget: (entityId: string, type: DashboardWidget['type']) => void;
    addSensorListWidget: (entityIds: string[], title?: string) => void;
    removeWidget: (id: string) => void;
    updateLayout: (newLayout: Layout[]) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    haUrl: localStorage.getItem('haUrl'),
    haToken: localStorage.getItem('haToken'),
    isAuthenticated: !!localStorage.getItem('haUrl') && !!localStorage.getItem('haToken'),
    setAuth: (url, token) => {
        localStorage.setItem('haUrl', url);
        localStorage.setItem('haToken', token);
        set({ haUrl: url, haToken: token, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('haUrl');
        localStorage.removeItem('haToken');
        set({ haUrl: null, haToken: null, isAuthenticated: false });
    }
}));

export const useDashboardStore = create<DashboardState>((set) => ({
    widgets: JSON.parse(localStorage.getItem('dashboardWidgets') || '[]'),
    // Migrate existing layouts: remove old hard constraints so all widgets can be freely resized
    layout: (JSON.parse(localStorage.getItem('dashboardLayout') || '[]') as Layout[]).map(
        (item) => ({ ...item, minW: 1, minH: 1 })
    ),

    addWidget: (entityId, type) => set((state) => {
        const id = `widget-${Date.now()}`;
        const newWidgets = [...state.widgets, { id, entityId, type }];

        // Define default dimensions based on type (min 1x1 for all)
        let w = 2, h = 3;
        if (type === 'switch') { w = 2; h = 3; }
        else if (type === 'light') { w = 2; h = 4; }
        else if (entityId.startsWith('climate.')) { w = 4; h = 5; }
        else if (entityId.includes('motion') || entityId.includes('presence')) { w = 2; h = 3; }
        else if (type === 'sensor') { w = 2; h = 3; }
        else if (type === 'cover') { w = 2; h = 4; }

        const newLayout = [...state.layout, { i: id, x: 0, y: 1000, w, h, minW: 1, minH: 1 }];
        localStorage.setItem('dashboardWidgets', JSON.stringify(newWidgets));
        localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
        return { widgets: newWidgets, layout: newLayout };
    }),

    addSensorListWidget: (entityIds, title = 'Motion Sensors') => set((state) => {
        const id = `widget-${Date.now()}`;
        const newWidget: DashboardWidget = {
            id,
            entityId: '__list__',
            entityIds,
            title,
            type: 'sensor_list',
        };
        const newWidgets = [...state.widgets, newWidget];
        // Tall default: 2 wide, height based on number of sensors
        const h = Math.min(Math.max(3, entityIds.length + 2), 8);
        const newLayout = [...state.layout, { i: id, x: 0, y: 1000, w: 3, h, minW: 1, minH: 1 }];
        localStorage.setItem('dashboardWidgets', JSON.stringify(newWidgets));
        localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
        return { widgets: newWidgets, layout: newLayout };
    }),

    removeWidget: (id) => set((state) => {
        const newWidgets = state.widgets.filter((w) => w.id !== id);
        const newLayout = state.layout.filter((l) => l.i !== id);
        localStorage.setItem('dashboardWidgets', JSON.stringify(newWidgets));
        localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
        return { widgets: newWidgets, layout: newLayout };
    }),
    updateLayout: (newLayout) => set(() => {
        localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
        return { layout: newLayout };
    }),
}));

export const useHAStore = create<HAState>((set) => ({
    entities: null,
    setEntities: (entities) => set({ entities }),
    connection: null,
    setConnection: (conn) => set({ connection: conn })
}));
