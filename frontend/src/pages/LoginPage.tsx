import React, { useState } from 'react';
import { useAuthStore } from '../store/useStore';
import { Home, Server, Key } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const [url, setUrl] = useState(useAuthStore.getState().haUrl || 'http://homeassistant.local:8123');
    const [token, setToken] = useState(useAuthStore.getState().haToken || '');
    const { setAuth } = useAuthStore();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (url && token) {
            setAuth(url, token);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 text-white">
            <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-full">
                            <Home className="w-10 h-10 text-blue-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-2">Connect Home Assistant</h2>
                    <p className="text-gray-400 text-center mb-8 text-sm">Enter your instance URL and Long-Lived Access Token to continue.</p>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Instance URL</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Server className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="url"
                                    required
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="http://homeassistant.local:8123"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Access Token</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Key className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors"
                        >
                            Connect
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
