import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useStore';
import { X, Server, Key, Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsPageProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ isOpen, onClose }) => {
    const { haUrl: _haUrl, haToken: _haToken, fetchSettings, updateSettings } = useSettingsStore();
    const [url, setUrl] = useState('');
    const [token, setToken] = useState('');
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (isOpen) {
            fetchSettings().then(() => {
                const current = useSettingsStore.getState();
                setUrl(current.haUrl);
                setToken(current.haToken);
            });
        }
    }, [isOpen, fetchSettings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('saving');
        try {
            await updateSettings(url, token);
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (e) {
            setStatus('error');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative z-10 bg-neutral-900 border border-white/5 rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">System Settings</h2>
                                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Configure Hub Infrastructure</p>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full text-neutral-500 transition">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8">
                            <form onSubmit={handleSave} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                                                <Server size={14} />
                                            </div>
                                            <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">HA Instance URL</label>
                                        </div>
                                        <input
                                            type="url"
                                            required
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className="block w-full px-5 py-4 bg-neutral-950 border border-white/5 rounded-2xl text-white placeholder-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
                                            placeholder="http://192.168.1.100:8123"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                                                <Key size={14} />
                                            </div>
                                            <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Long-Lived Access Token</label>
                                        </div>
                                        <textarea
                                            required
                                            rows={4}
                                            value={token}
                                            onChange={(e) => setToken(e.target.value)}
                                            className="block w-full px-5 py-4 bg-neutral-950 border border-white/5 rounded-2xl text-white placeholder-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-mono text-xs leading-relaxed custom-scrollbar"
                                            placeholder="Paste your HA Long-Lived Access Token here..."
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-4 pt-4">
                                    <div className="flex-grow">
                                        <AnimatePresence mode="wait">
                                            {status === 'success' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="flex items-center gap-2 text-emerald-400 text-sm font-bold"
                                                >
                                                    <CheckCircle2 size={16} />
                                                    Settings Saved
                                                </motion.div>
                                            )}
                                            {status === 'error' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="flex items-center gap-2 text-rose-400 text-sm font-bold"
                                                >
                                                    <AlertCircle size={16} />
                                                    Failed to Save
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'saving'}
                                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${status === 'saving'
                                            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                                            : 'bg-white text-neutral-950 hover:bg-blue-500 hover:text-white shadow-xl hover:shadow-blue-500/20'
                                            }`}
                                    >
                                        {status === 'saving' ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                        {status === 'saving' ? 'Saving...' : 'Save Config'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 bg-rose-500/5 border-t border-white/5">
                            <p className="text-[10px] text-rose-400/60 font-medium leading-relaxed">
                                WARNING: These settings control the core connection to your home infrastructure.
                                Incorrect values will cause the dashboard to lose connectivity to all devices.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
