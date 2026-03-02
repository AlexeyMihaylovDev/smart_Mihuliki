import {
    createConnection,
    createLongLivedTokenAuth,
    subscribeEntities,
    Connection,
} from 'home-assistant-js-websocket';
import { useHAStore, useSettingsStore } from '../store/useStore';

let connectionPromise: Promise<Connection> | null = null;

export const connectHA = async () => {
    const { haUrl, haToken, fetchSettings } = useSettingsStore.getState();

    // Ensure settings are loaded
    if (!haUrl || !haToken) {
        await fetchSettings();
        const updated = useSettingsStore.getState();
        if (!updated.haUrl || !updated.haToken) {
            throw new Error("Home Assistant not configured");
        }
    }

    const currentUrl = useSettingsStore.getState().haUrl;
    const currentToken = useSettingsStore.getState().haToken;

    if (connectionPromise) {
        return connectionPromise;
    }

    try {
        const auth = createLongLivedTokenAuth(currentUrl, currentToken);
        connectionPromise = createConnection({ auth });
        const connection = await connectionPromise;

        useHAStore.getState().setConnection(connection);

        subscribeEntities(connection, (entities) => {
            useHAStore.getState().setEntities(entities);
        });

        connection.addEventListener('disconnected', () => {
            console.log('HA WS Disconnected');
            connectionPromise = null;
        });

        return connection;
    } catch (err) {
        console.error("Failed to connect to HA", err);
        connectionPromise = null;
        throw err;
    }
};

export const disconnectHA = () => {
    const conn = useHAStore.getState().connection;
    if (conn) {
        conn.close();
        useHAStore.getState().setConnection(null);
    }
    connectionPromise = null;
};
