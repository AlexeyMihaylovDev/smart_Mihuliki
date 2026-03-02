import React, { useState } from 'react';
import { useHAStore, useDashboardStore } from '../store/useStore';
import { Search, X, Plus, Lightbulb, ToggleLeft, Activity, Box, Thermometer, ShieldAlert, ListFilter, Blinds, CheckCircle2, Circle, Fan, SignalLow, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WidgetSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WidgetSelector: React.FC<WidgetSelectorProps> = ({ isOpen, onClose }) => {
    const { entities, connection } = useHAStore();
    const { addWidget, addSensorListWidget, addMultipleWidgets } = useDashboardStore();
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<'devices' | 'lists'>('devices');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Compute entities only if they exist
    const allBinarySensors = entities ? Object.values(entities).filter((entity: any) => {
        const domain = entity.entity_id.split('.')[0];
        return domain === 'binary_sensor';
    }) : [];

    const motionSensors = allBinarySensors.filter((entity: any) =>
        entity.entity_id.includes('motion') || entity.entity_id.includes('presence')
    );

    const filteredEntities = entities ? Object.values(entities).filter((entity: any) => {
        const domain = entity.entity_id.split('.')[0];
        const isSelectedType = ['switch', 'light', 'climate', 'cover'].includes(domain) ||
            domain.includes('vacuum') ||
            (domain === 'binary_sensor' && (entity.entity_id.includes('motion') || entity.entity_id.includes('presence')));

        const matchesSearch = entity.entity_id.toLowerCase().includes(search.toLowerCase()) ||
            (entity.attributes.friendly_name || '').toLowerCase().includes(search.toLowerCase());

        return isSelectedType && matchesSearch;
    }).slice(0, 500) : [];

    const getEntityType = (entityId: string): any => {
        if (entityId.startsWith('light.')) return 'light';
        if (entityId.startsWith('switch.')) return 'switch';
        if (entityId.startsWith('cover.')) return 'cover';
        if (entityId.startsWith('climate.')) return 'generic';
        if (entityId.includes('vacuum.')) return 'generic';
        if (entityId.startsWith('sensor.') || entityId.startsWith('binary_sensor.')) return 'sensor';
        return 'generic';
    };

    const getIcon = (entityId: string) => {
        const domain = entityId.split('.')[0];
        if (domain === 'light') return <Lightbulb size={18} />;
        if (domain === 'switch') return <ToggleLeft size={18} />;
        if (domain === 'cover') return <Blinds size={18} />;
        if (domain === 'climate') return <Thermometer size={18} />;
        if (domain.includes('vacuum')) return <Fan size={18} />;
        if (domain === 'binary_sensor' && (entityId.includes('motion') || entityId.includes('presence'))) return <ShieldAlert size={18} />;
        if (domain === 'sensor') return <Activity size={18} />;
        return <Box size={18} />;
    };

    const handleAddSensorList = (sensors: any[], title: string) => {
        addSensorListWidget(sensors.map((e: any) => e.entity_id), title);
        onClose();
    };

    const toggleSelection = (entityId: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(entityId)) {
            newSelected.delete(entityId);
        } else {
            newSelected.add(entityId);
        }
        setSelectedIds(newSelected);
    };

    const selectAll = () => {
        setSelectedIds(new Set(filteredEntities.map((e: any) => e.entity_id)));
    };

    const deselectAll = () => {
        setSelectedIds(new Set());
    };

    const handleAddSelected = () => {
        const widgetsToAdd = Array.from(selectedIds).map(eid => ({
            entityId: eid,
            type: getEntityType(eid)
        }));
        addMultipleWidgets(widgetsToAdd);
        onClose();
        setSelectedIds(new Set());
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative z-10 bg-neutral-900 border border-white/10 rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                            <div>
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Add Widgets</h2>
                                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Populate your dashboard</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {selectedIds.size > 0 && (
                                    <motion.button
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={handleAddSelected}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 flex items-center gap-2"
                                    >
                                        <Plus size={16} />
                                        Add {selectedIds.size} widgets
                                    </motion.button>
                                )}
                                <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-neutral-400 transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {!entities ? (
                            <div className="flex-grow flex flex-col items-center justify-center p-20 text-center gap-6">
                                <motion.div
                                    animate={{ rotate: connection ? 360 : 0 }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    className={`p-10 rounded-[3rem] border border-white/5 ${connection ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'}`}
                                >
                                    {connection ? <RefreshCw size={64} strokeWidth={1} /> : <SignalLow size={64} strokeWidth={1} />}
                                </motion.div>
                                <div>
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
                                        {connection ? 'Synchronizing Nodes...' : 'Hub Offline'}
                                    </h3>
                                    <p className="text-sm text-neutral-500 max-w-xs mt-2 font-bold uppercase tracking-widest leading-relaxed">
                                        {connection
                                            ? 'Fetching active entities from Home Assistant. This usually takes a few seconds.'
                                            : 'Unable to establish connection with Home Assistant. Please check your network settings.'}
                                    </p>
                                </div>
                                {!connection && (
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="mt-4 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all text-neutral-400 hover:text-white"
                                    >
                                        Reconnect Hub
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex border-b border-white/5 bg-black/10">
                                    <button
                                        onClick={() => setTab('devices')}
                                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'devices' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5' : 'text-neutral-500 hover:text-white'}`}
                                    >
                                        Devices
                                    </button>
                                    <button
                                        onClick={() => setTab('lists')}
                                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'lists' ? 'text-rose-400 border-b-2 border-rose-400 bg-rose-500/5' : 'text-neutral-500 hover:text-white'}`}
                                    >
                                        <span className="flex items-center justify-center gap-2"><ListFilter size={14} /> Sensor Lists</span>
                                    </button>
                                </div>

                                <div className="flex-grow overflow-y-auto custom-scrollbar no-scrollbar">
                                    {tab === 'devices' && (
                                        <>
                                            <div className="p-6 bg-black/5 space-y-4">
                                                <div className="relative">
                                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                                    <input
                                                        type="text"
                                                        placeholder="Search devices..."
                                                        value={search}
                                                        onChange={(e) => setSearch(e.target.value)}
                                                        className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between px-2">
                                                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                                                        {filteredEntities.length} Devices Available
                                                    </span>
                                                    <div className="flex gap-4">
                                                        <button onClick={selectAll} className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest">Select All</button>
                                                        <button onClick={deselectAll} className="text-[10px] font-black text-neutral-500 hover:text-neutral-400 uppercase tracking-widest">Clear</button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 pt-0 space-y-2">
                                                {filteredEntities.map((entity: any) => {
                                                    const type = getEntityType(entity.entity_id);
                                                    const isSelected = selectedIds.has(entity.entity_id);
                                                    return (
                                                        <motion.div
                                                            layout
                                                            key={entity.entity_id}
                                                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${isSelected ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10'
                                                                }`}
                                                            onClick={() => toggleSelection(entity.entity_id)}
                                                        >
                                                            <div className="flex items-center space-x-4">
                                                                <div className={`p-1 transition-colors ${isSelected ? 'text-blue-400' : 'text-neutral-700'}`}>
                                                                    {isSelected ? <CheckCircle2 size={24} fill="currentColor" className="text-blue-500/20" /> : <Circle size={24} />}
                                                                </div>
                                                                <div className={`p-3 rounded-xl transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg' : 'bg-neutral-800 text-neutral-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white'}`}>
                                                                    {getIcon(entity.entity_id)}
                                                                </div>
                                                                <div>
                                                                    <div className={`text-sm font-bold transition-colors ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                                                                        {entity.attributes.friendly_name || entity.entity_id}
                                                                    </div>
                                                                    <div className="text-[10px] text-neutral-500 font-black tracking-widest uppercase mt-0.5">{entity.entity_id.split('.')[0]}</div>
                                                                </div>
                                                            </div>

                                                            {!isSelected && (
                                                                <button
                                                                    className="p-3 bg-white/5 hover:bg-blue-600 rounded-xl text-neutral-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        addWidget(entity.entity_id, type);
                                                                        onClose();
                                                                    }}
                                                                >
                                                                    <Plus size={20} />
                                                                </button>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}

                                    {tab === 'lists' && (
                                        <div className="p-8 space-y-4">
                                            {motionSensors.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center justify-between p-6 bg-white/5 border border-rose-500/10 hover:border-rose-500/40 rounded-3xl hover:bg-rose-500/5 transition-all cursor-pointer group"
                                                    onClick={() => handleAddSensorList(motionSensors, 'Motion Sensors')}
                                                >
                                                    <div className="flex items-center gap-5">
                                                        <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-400 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-xl">
                                                            <ShieldAlert size={24} />
                                                        </div>
                                                        <div>
                                                            <div className="text-lg font-black text-white group-hover:text-rose-400 transition-colors italic uppercase tracking-tighter">
                                                                Security Cluster
                                                            </div>
                                                            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">
                                                                {motionSensors.length} Motion & Presence Nodes
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-white/5 group-hover:bg-rose-600 rounded-2xl text-neutral-600 group-hover:text-white transition-all shadow-xl">
                                                        <Plus size={24} />
                                                    </div>
                                                </motion.div>
                                            )}

                                            {allBinarySensors.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                    className="flex items-center justify-between p-6 bg-white/5 border border-blue-500/10 hover:border-blue-500/40 rounded-3xl hover:bg-blue-500/5 transition-all cursor-pointer group"
                                                    onClick={() => handleAddSensorList(allBinarySensors, 'Binary Matrix')}
                                                >
                                                    <div className="flex items-center gap-5">
                                                        <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-xl">
                                                            <Activity size={24} />
                                                        </div>
                                                        <div>
                                                            <div className="text-lg font-black text-white group-hover:text-blue-400 transition-colors italic uppercase tracking-tighter">
                                                                Binary Matrix
                                                            </div>
                                                            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">
                                                                {allBinarySensors.length} System Sensors
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-white/5 group-hover:bg-blue-600 rounded-2xl text-neutral-600 group-hover:text-white transition-all shadow-xl">
                                                        <Plus size={24} />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
