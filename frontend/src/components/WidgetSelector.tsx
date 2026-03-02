import React, { useState } from 'react';
import { useHAStore, useDashboardStore } from '../store/useStore';
import { Search, X, Plus, Lightbulb, ToggleLeft, Activity, Box, Thermometer, ShieldAlert, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WidgetSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WidgetSelector: React.FC<WidgetSelectorProps> = ({ isOpen, onClose }) => {
    const { entities } = useHAStore();
    const { addWidget, addSensorListWidget } = useDashboardStore();
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<'devices' | 'lists'>('devices');

    if (!entities) return null;

    // All binary sensors (motion + presence + others)
    const allBinarySensors = Object.values(entities).filter((entity: any) => {
        const domain = entity.entity_id.split('.')[0];
        return domain === 'binary_sensor';
    });

    // Motion / presence sensors for list tab
    const motionSensors = allBinarySensors.filter((entity: any) =>
        entity.entity_id.includes('motion') || entity.entity_id.includes('presence')
    );

    const filteredEntities = Object.values(entities).filter((entity: any) => {
        const domain = entity.entity_id.split('.')[0];
        const isSelectedType = ['switch', 'light', 'climate'].includes(domain) ||
            (domain === 'binary_sensor' && (entity.entity_id.includes('motion') || entity.entity_id.includes('presence')));

        const matchesSearch = entity.entity_id.toLowerCase().includes(search.toLowerCase()) ||
            (entity.attributes.friendly_name || '').toLowerCase().includes(search.toLowerCase());

        return isSelectedType && matchesSearch;
    }).slice(0, 70);

    const getEntityType = (entityId: string): 'light' | 'switch' | 'sensor' | 'generic' => {
        if (entityId.startsWith('light.')) return 'light';
        if (entityId.startsWith('switch.')) return 'switch';
        if (entityId.startsWith('climate.')) return 'sensor';
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

    const handleAddSensorList = (sensors: any[], title: string) => {
        addSensorListWidget(sensors.map((e: any) => e.entity_id), title);
        onClose();
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

                        {/* Tabs */}
                        <div className="flex border-b border-gray-700 bg-gray-800/30">
                            <button
                                onClick={() => setTab('devices')}
                                className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${tab === 'devices' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Devices
                            </button>
                            <button
                                onClick={() => setTab('lists')}
                                className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${tab === 'lists' ? 'text-rose-400 border-b-2 border-rose-400' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <span className="flex items-center justify-center gap-2"><ListFilter size={14} /> Sensor Lists</span>
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto bg-gray-900/10">
                            {tab === 'devices' && (
                                <>
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
                                    <div className="p-4 space-y-2">
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
                                </>
                            )}

                            {tab === 'lists' && (
                                <div className="p-4 space-y-3">
                                    {/* All Motion / Presence sensors as a group */}
                                    {motionSensors.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center justify-between p-4 bg-gray-800/40 border border-rose-500/10 hover:border-rose-500/30 rounded-2xl hover:bg-gray-800/80 transition-all cursor-pointer group"
                                            onClick={() => handleAddSensorList(motionSensors, 'Motion Sensors')}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 group-hover:scale-110 transition-all">
                                                    <ShieldAlert size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                                                        All Motion Sensors
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                                                        {motionSensors.length} sensors — motion & presence
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-2 bg-rose-500/0 group-hover:bg-rose-500/10 rounded-lg text-gray-500 group-hover:text-rose-400 transition-all">
                                                <Plus size={20} />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* All binary sensors as a group */}
                                    {allBinarySensors.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 }}
                                            className="flex items-center justify-between p-4 bg-gray-800/40 border border-purple-500/10 hover:border-purple-500/30 rounded-2xl hover:bg-gray-800/80 transition-all cursor-pointer group"
                                            onClick={() => handleAddSensorList(allBinarySensors, 'All Binary Sensors')}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 group-hover:scale-110 transition-all">
                                                    <Activity size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                                                        All Binary Sensors
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                                                        {allBinarySensors.length} sensors — all types
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-2 bg-purple-500/0 group-hover:bg-purple-500/10 rounded-lg text-gray-500 group-hover:text-purple-400 transition-all">
                                                <Plus size={20} />
                                            </div>
                                        </motion.div>
                                    )}

                                    {motionSensors.length === 0 && allBinarySensors.length === 0 && (
                                        <div className="text-center text-gray-600 text-sm py-8">
                                            No binary sensors found in Home Assistant
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
