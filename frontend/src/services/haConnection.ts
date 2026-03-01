import {
    createConnection,
    createLongLivedTokenAuth,
    subscribeEntities,
    Connection,
} from 'home-assistant-js-websocket';
import { useAuthStore, useHAStore } from '../store/useStore';

let connectionPromise: Promise<Connection> | null = null;

export const connectHA = async () => {
    const { haUrl, haToken, logout } = useAuthStore.getState();

    if (!haUrl || !haToken) {
        throw new Error("Missing HA credentials");
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    try {
        const auth = createLongLivedTokenAuth(haUrl, haToken);

        connectionPromise = createConnection({ auth });
        const connection = await connectionPromise;

        useHAStore.getState().setConnection(connection);

        // Subscribe to entity state changes
        subscribeEntities(connection, (entities) => {
            useHAStore.getState().setEntities(entities);
        });

        connection.addEventListener('disconnected', () => {
            console.log('HA WS Disconnected');
        });

        connection.addEventListener('ready', () => {
            console.log('HA WS Ready');
        });

        return connection;
    } catch (err) {
        console.error("Failed to connect to HA", err);
        connectionPromise = null;
        logout(); // Clear bad credentials
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
