import { create } from 'zustand';
import { HassEntities } from 'home-assistant-js-websocket';
import { Layout } from 'react-grid-layout';

const getApiUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:3001/api';
    const hostname = window.location.hostname;
    return `http://${hostname}:3001/api`;
};

const API_URL = (import.meta as any).env?.VITE_BACKEND_URL || getApiUrl();

interface AuthState {
    user: { id: number, username: string } | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
}

interface SettingsState {
    haUrl: string;
    haToken: string;
    fetchSettings: () => Promise<void>;
    updateSettings: (url: string, token: string) => Promise<void>;
}

interface HAState {
    entities: HassEntities | null;
    setEntities: (entities: HassEntities) => void;
    connection: any | null;
    setConnection: (conn: any) => void;
}

export interface DashboardWidget {
    id: string;
    entityId: string;
    entityIds?: string[];
    title?: string;
    type: 'light' | 'sensor' | 'switch' | 'generic' | 'sensor_list' | 'cover';
}

export interface DashboardPage {
    id: string;
    name: string;
    widgets: DashboardWidget[];
    layout: Layout[];
}

interface DashboardState {
    pages: DashboardPage[];
    activePageId: string;
    setActivePage: (id: string) => void;
    addPage: (name: string) => void;
    removePage: (id: string) => void;
    renamePage: (id: string, name: string) => void;
    addWidget: (entityId: string, type: DashboardWidget['type']) => void;
    addSensorListWidget: (entityIds: string[], title?: string) => void;
    addMultipleWidgets: (widgetsToAdd: { entityId: string, type: DashboardWidget['type'] }[]) => void;
    removeWidget: (id: string) => void;
    updateLayout: (newLayout: Layout[]) => void;
    fetchConfig: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    isAuthenticated: !!localStorage.getItem('user'),
    login: async (username, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                set({ user: data.user, isAuthenticated: true });
                return true;
            }
            return false;
        } catch (e) {
            console.error('Login failed', e);
            return false;
        }
    },
    logout: () => {
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
    }
}));

export const useSettingsStore = create<SettingsState>((set) => ({
    haUrl: '',
    haToken: '',
    fetchSettings: async () => {
        try {
            const res = await fetch(`${API_URL}/settings/ha`);
            const data = await res.json();
            if (data) {
                set({ haUrl: data.haUrl || '', haToken: data.haToken || '' });
            }
        } catch (e) {
            console.error('Failed to fetch settings', e);
        }
    },
    updateSettings: async (url, token) => {
        try {
            await fetch(`${API_URL}/settings/ha`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ haUrl: url, haToken: token })
            });
            set({ haUrl: url, haToken: token });
        } catch (e) {
            console.error('Failed to update settings', e);
        }
    }
}));

const syncConfig = async (pages: DashboardPage[], activePageId: string) => {
    try {
        await fetch(`${API_URL}/dashboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pages, activePageId })
        });
    } catch (e) {
        console.error('Failed to sync with server', e);
    }
};

let layoutSyncTimeout: any = null;

export const useDashboardStore = create<DashboardState>((set, get) => ({
    pages: [{ id: 'home', name: 'Home', widgets: [], layout: [] }],
    activePageId: 'home',

    setActivePage: (id) => {
        set({ activePageId: id });
        syncConfig(get().pages, id);
    },

    addPage: (name) => {
        const id = `page-${Date.now()}`;
        const newPage = { id, name, widgets: [], layout: [] };
        set((state) => ({ pages: [...state.pages, newPage], activePageId: id }));
        syncConfig(get().pages, get().activePageId);
    },

    removePage: (id) => {
        set((state) => {
            const filtered = state.pages.filter(p => p.id !== id);
            if (filtered.length === 0) {
                filtered.push({ id: 'home', name: 'Home', widgets: [], layout: [] });
            }
            const newActive = id === state.activePageId ? filtered[0].id : state.activePageId;
            return { pages: filtered, activePageId: newActive };
        });
        syncConfig(get().pages, get().activePageId);
    },

    renamePage: (id, name) => {
        set((state) => ({
            pages: state.pages.map(p => p.id === id ? { ...p, name } : p)
        }));
        syncConfig(get().pages, get().activePageId);
    },

    addWidget: (entityId, type) => {
        const id = `widget-${Date.now()}`;
        const newWidget: DashboardWidget = { id, entityId, type };

        let w = 2, h = 3;
        if (type === 'switch') { w = 2; h = 3; }
        else if (type === 'light') { w = 2; h = 4; }
        else if (entityId.startsWith('climate.')) { w = 4; h = 5; }
        else if (entityId.startsWith('vacuum.')) { w = 4; h = 6; }
        else if (entityId.includes('motion') || entityId.includes('presence')) { w = 2; h = 3; }
        else if (type === 'sensor') { w = 2; h = 3; }
        else if (type === 'cover') { w = 2; h = 4; }

        const newLayoutItem = { i: id, x: 0, y: 1000, w, h, minW: 1, minH: 1 };

        set((state) => ({
            pages: state.pages.map(p => p.id === state.activePageId ? {
                ...p,
                widgets: [...p.widgets, newWidget],
                layout: [...p.layout, newLayoutItem]
            } : p)
        }));

        syncConfig(get().pages, get().activePageId);
    },

    addSensorListWidget: (entityIds, title = 'Sensors') => {
        const id = `widget-${Date.now()}`;
        const newWidget: DashboardWidget = {
            id,
            entityId: '__list__',
            entityIds,
            title,
            type: 'sensor_list',
        };
        const h = Math.min(Math.max(3, entityIds.length + 2), 8);
        const newLayoutItem = { i: id, x: 0, y: 1000, w: 3, h, minW: 1, minH: 1 };

        set((state) => ({
            pages: state.pages.map(p => p.id === state.activePageId ? {
                ...p,
                widgets: [...p.widgets, newWidget],
                layout: [...p.layout, newLayoutItem]
            } : p)
        }));

        syncConfig(get().pages, get().activePageId);
    },

    addMultipleWidgets: (widgetsToAdd) => {
        const timestamp = Date.now();
        const newWidgetEntries: DashboardWidget[] = widgetsToAdd.map((w, index) => ({
            id: `widget-${timestamp}-${index}`,
            entityId: w.entityId,
            type: w.type
        }));

        const newLayoutItems = newWidgetEntries.map((w, index) => {
            let width = 2, height = 3;
            if (w.type === 'switch') { width = 2; height = 3; }
            else if (w.type === 'light') { width = 2; height = 4; }
            else if (w.entityId.startsWith('climate.')) { width = 4; height = 5; }
            else if (w.entityId.startsWith('vacuum.')) { width = 4; height = 6; }
            else if (w.entityId.includes('motion') || w.entityId.includes('presence')) { width = 2; height = 3; }
            else if (w.type === 'sensor') { width = 2; height = 3; }
            else if (w.type === 'cover') { width = 2; height = 4; }

            return { i: w.id, x: 0, y: 1000 + index, w: width, h: height, minW: 1, minH: 1 };
        });

        set((state) => ({
            pages: state.pages.map(p => p.id === state.activePageId ? {
                ...p,
                widgets: [...p.widgets, ...newWidgetEntries],
                layout: [...p.layout, ...newLayoutItems]
            } : p)
        }));

        syncConfig(get().pages, get().activePageId);
    },

    removeWidget: (id) => {
        set((state) => ({
            pages: state.pages.map(p => p.id === state.activePageId ? {
                ...p,
                widgets: p.widgets.filter((w) => w.id !== id),
                layout: p.layout.filter((l) => l.i !== id)
            } : p)
        }));

        syncConfig(get().pages, get().activePageId);
    },

    updateLayout: (newLayout) => {
        set((state) => ({
            pages: state.pages.map(p => p.id === state.activePageId ? { ...p, layout: newLayout } : p)
        }));

        if (layoutSyncTimeout) clearTimeout(layoutSyncTimeout);
        layoutSyncTimeout = setTimeout(() => {
            syncConfig(get().pages, get().activePageId);
        }, 1000);
    },

    fetchConfig: async () => {
        try {
            const response = await fetch(`${API_URL}/dashboard`);
            const config = await response.json();
            if (config && config.pages) {
                set({
                    pages: config.pages || [{ id: 'home', name: 'Home', widgets: [], layout: [] }],
                    activePageId: config.activePageId || 'home'
                });
            }
        } catch (error) {
            console.error('Failed to fetch dashboard config from server', error);
        }
    }
}));

export const useHAStore = create<HAState>((set) => ({
    entities: null,
    setEntities: (entities) => set({ entities }),
    connection: null,
    setConnection: (conn) => set({ connection: conn })
}));
