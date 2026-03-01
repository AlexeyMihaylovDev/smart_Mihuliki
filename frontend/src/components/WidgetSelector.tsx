import React, { useState } from 'react';
import { useHAStore, useDashboardStore } from '../store/useStore';
import { Search, X, Plus, Lightbulb, ToggleLeft, Activity, Box, Thermometer, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WidgetSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WidgetSelector: React.FC<WidgetSelectorProps> = ({ isOpen, onClose }) => {
    const { entities } = useHAStore();
    const { addWidget } = useDashboardStore();
    const [search, setSearch] = useState('');

    if (!entities) return null;

    const filteredEntities = Object.values(entities).filter((entity: any) =>
        entity.entity_id.toLowerCase().includes(search.toLowerCase()) ||
        (entity.attributes.friendly_name || '').toLowerCase().includes(search.toLowerCase())
    ).slice(0, 70);

    const getEntityType = (entityId: string): 'light' | 'switch' | 'sensor' | 'generic' => {
        if (entityId.startsWith('light.')) return 'light';
        if (entityId.startsWith('switch.')) return 'switch';
        if (entityId.startsWith('climate.')) return 'sensor'; // Will be caught by climate domain in dispatcher
        if (entityId.startsWith('sensor.') || entityId.startsWith('binary_sensor.')) return 'sensor';
        return 'generic';
    };

    const getIcon = (entityId: string) => {
        const domain = entityId.split('.')[0];
        if (domain === 'light') return <Lightbulb size={18} />;
        if (domain === 'switch') return <ToggleLeft size={18} />;
        if (domain === 'climate') return <Thermometer size={18} />;
        if (domain === 'binary_sensor' && (entityId.includes('motion') || entityId.includes('presence'))) return <ShieldAlert size={18} />;
        if (domain === 'sensor') return <Activity size={18} />;
        return <Box size={18} />;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-gray-800 border border-gray-700 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                            <div>
                                <h2 className="text-xl font-bold text-white">Add Hub Widget</h2>
                                <p className="text-xs text-gray-500 mt-1">Select any device to add to your dashboard</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full text-gray-400 transition">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 bg-gray-900/30">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name or entity ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4 space-y-2 bg-gray-900/10">
                            {filteredEntities.map((entity: any) => {
                                const type = getEntityType(entity.entity_id);
                                return (
                                    <motion.div
                                        layout
                                        key={entity.entity_id}
                                        className="flex items-center justify-between p-3.5 bg-gray-800/40 border border-transparent hover:border-blue-500/30 rounded-2xl hover:bg-gray-800/80 transition-all cursor-pointer group"
                                        onClick={() => {
                                            addWidget(entity.entity_id, type);
                                            onClose();
                                        }}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2.5 bg-gray-700/50 rounded-xl text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/10 transition-all">
                                                {getIcon(entity.entity_id)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                                    {entity.attributes.friendly_name || entity.entity_id}
                                                </div>
                                                <div className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase mt-0.5">{entity.entity_id}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                                                Add to grid
                                            </span>
                                            <div className="p-2 bg-blue-500/0 group-hover:bg-blue-500/10 rounded-lg text-gray-500 group-hover:text-blue-400 transition-all">
                                                <Plus size={20} />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
