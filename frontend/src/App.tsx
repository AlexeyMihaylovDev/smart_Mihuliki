import { useEffect } from 'react';
import { useAuthStore, useHAStore } from './store/useStore';
import { LoginPage } from './pages/LoginPage';
import { connectHA } from './services/haConnection';
import { Dashboard } from './components/Dashboard';
import { AIChat } from './components/AIChat';

function App() {
    const { isAuthenticated } = useAuthStore();
    const { connection } = useHAStore();

    useEffect(() => {
        if (isAuthenticated && !connection) {
            connectHA().catch(console.error);
        }
    }, [isAuthenticated, connection]);

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 relative">
            <header className="mb-8 flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                    Smart Home Dashboard
                </h1>
                <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-2 text-sm">
                        <span className={`w-3 h-3 rounded-full ${connection ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                        <span className="text-gray-400">{connection ? 'Connected to HA' : 'Connecting HA...'}</span>
                    </span>
                    <button
                        onClick={() => useAuthStore.getState().logout()}
                        className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main>
                <Dashboard />
            </main>

            <AIChat />
        </div>
    );
}

export default App;
