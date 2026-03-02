import { useEffect, useState } from 'react';
import { useAuthStore, useHAStore, useSettingsStore } from './store/useStore';
import { LoginPage } from './pages/LoginPage';
import { SettingsPage } from './pages/SettingsPage';
import { connectHA } from './services/haConnection';
import { Dashboard } from './components/Dashboard';
import { AIChat } from './components/AIChat';
import { Layout, LogOut, Settings, Signal, SignalLow } from 'lucide-react';

function App() {
    const { isAuthenticated, logout, user } = useAuthStore();
    const { connection } = useHAStore();
    const { fetchSettings } = useSettingsStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchSettings().then(() => {
                if (!connection) {
                    connectHA().catch(console.error);
                }
            });
        }
    }, [isAuthenticated, connection, fetchSettings]);

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-6 relative selection:bg-blue-500/30">
            <header className="mb-8 flex justify-between items-center bg-neutral-900/50 backdrop-blur-2xl p-5 rounded-[2.5rem] border border-white/5 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
                        <Layout className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight leading-tight">
                            Smart Hub
                        </h1>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em]">Operating System</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${connection ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/5 border-rose-500/20 text-rose-400 animate-pulse'
                        }`}>
                        {connection ? <Signal size={14} /> : <SignalLow size={14} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {connection ? 'Online' : 'Offline'}
                        </span>
                    </div>

                    <div className="w-[1px] h-6 bg-white/5 mx-1" />

                    <div className="flex items-center gap-2 mr-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <span className="text-[10px] font-black text-blue-400 capitalize">{user?.username[0]}</span>
                        </div>
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest hidden sm:block">{user?.username}</span>
                    </div>

                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-neutral-400 hover:text-white transition-all group"
                        title="Settings"
                    >
                        <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                    </button>

                    <button
                        onClick={logout}
                        className="p-3 bg-rose-500/5 hover:bg-rose-500/15 rounded-2xl text-rose-500 transition-all"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto">
                <Dashboard />
            </main>

            <SettingsPage isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <AIChat />
        </div>
    );
}

export default App;
