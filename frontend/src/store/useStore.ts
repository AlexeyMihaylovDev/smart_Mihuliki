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
    entityId: string;
    type: 'light' | 'sensor' | 'switch' | 'generic';
}

interface DashboardState {
    widgets: DashboardWidget[];
    layout: Layout[];
    addWidget: (entityId: string, type: DashboardWidget['type']) => void;
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
    layout: JSON.parse(localStorage.getItem('dashboardLayout') || '[]'),
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

        const newLayout = [...state.layout, { i: id, x: 0, y: Infinity, w, h, minW: 1, minH: 1 }];
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
