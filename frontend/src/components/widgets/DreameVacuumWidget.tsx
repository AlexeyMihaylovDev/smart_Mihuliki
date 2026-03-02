import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Fan, Battery, BatteryCharging, Settings2, Home, Play, Pause,
    Map, MapPin,
    Sofa, Bed, Utensils, Bath, X
} from 'lucide-react';
import { useHAStore } from '../../store/useStore';
import { cleanEntityName } from '../../utils/naming';

const RoomIcon = ({ iconName, ...props }: any) => {
    const icons: any = { Sofa, Bed, Utensils, Bath, MapPin };
    const IconComponent = icons[iconName] || MapPin;
    return <IconComponent {...props} />;
};

interface DreameVacuumWidgetProps {
    id: string;
    entityId: string;
    onRemove?: () => void;
    isEditMode?: boolean;
}

export const DreameVacuumWidget: React.FC<DreameVacuumWidgetProps> = ({ entityId, onRemove, isEditMode }) => {
    const { entities, connection } = useHAStore();
    const entity = entities?.[entityId] as any;

    // UI States
    const [activeTab, setActiveTab] = useState<'settings' | 'rooms' | null>(null);
    const [selectedRooms, setSelectedRooms] = useState<number[]>([]);

    if (!entity) return null;

    const attrs = entity.attributes;
    const isCleaning = entity.state === 'cleaning';
    const isDocked = entity.state === 'docked' || entity.state === 'idle';

    // Image for the map background
    const mapImageUrl = "https://raw.githubusercontent.com/Tasshack/dreame-vacuum/master/docs/media/map.png";

    // Controls
    const togglePlay = () => connection?.sendMessagePromise({
        type: 'call_service',
        domain: 'vacuum',
        service: isCleaning ? 'pause' : 'start',
        target: { entity_id: entityId }
    });

    const returnHome = () => connection?.sendMessagePromise({
        type: 'call_service',
        domain: 'vacuum',
        service: 'return_to_base',
        target: { entity_id: entityId }
    });

    // Settings
    const setFanSpeed = (speed: string) => connection?.sendMessagePromise({
        type: 'call_service',
        domain: 'vacuum',
        service: 'set_fan_speed',
        service_data: { fan_speed: speed },
        target: { entity_id: entityId }
    });

    // Support for custom services if available
    const callCustomService = (service: string, data: any) => connection?.sendMessagePromise({
        type: 'call_service',
        domain: 'dreame_vacuum',
        service,
        service_data: data,
        target: { entity_id: entityId }
    });

    // Room Cleaning (Segments)
    const startSegmentCleaning = () => {
        if (selectedRooms.length === 0) return;
        callCustomService('vacuum_clean_segment', { segments: selectedRooms });
        setActiveTab(null);
        setSelectedRooms([]);
    };

    const toggleRoom = (roomId: number) => {
        setSelectedRooms(prev =>
            prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
        );
    };

    const fanSpeeds = [
        { id: 'Quiet', label: 'Quiet' }, { id: 'Standard', label: 'Standard' },
        { id: 'Strong', label: 'Strong' }, { id: 'Turbo', label: 'Turbo' }
    ];

    const waterLevels = [
        { id: 'Low', label: 'Low' },
        { id: 'Medium', label: 'Medium' }, { id: 'High', label: 'High' }
    ];

    // Mock rooms if not provided by HA (for demo purposes)
    const rooms = attrs.rooms || [
        { id: 1, name: 'Living Room', icon: 'Sofa' },
        { id: 2, name: 'Bedroom', icon: 'Bed' },
        { id: 3, name: 'Kitchen', icon: 'Utensils' },
        { id: 4, name: 'Bathroom', icon: 'Bath' }
    ];

    return (
        <motion.div
            layout
            className={`relative flex flex-col h-full w-full bg-neutral-900/60 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border transition-all duration-500 group ${isCleaning ? 'border-blue-500/30 shadow-[0_8px_32px_-10px_rgba(59,130,246,0.2)]' : 'border-white/5'}`}
        >
            {/* MAP SECTION */}
            <div className="relative h-56 w-full bg-neutral-950 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30 saturate-[1.5] contrast-[1.2]"
                    style={{ backgroundImage: `url(${mapImageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-transparent to-neutral-900" />

                {isCleaning && (
                    <motion.div
                        initial={{ x: "40%", y: "40%" }}
                        animate={{
                            x: ["40%", "60%", "55%", "35%", "40%"],
                            y: ["40%", "45%", "65%", "55%", "40%"]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute z-10 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] border-2 border-white"
                    >
                        <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping" />
                    </motion.div>
                )}

                <div className="relative z-20 p-6 flex flex-col h-full justify-between">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-2xl backdrop-blur-md ${isCleaning ? 'bg-blue-500/30 text-blue-300' : 'bg-white/10 text-neutral-300'}`}>
                                <Fan size={20} className={isCleaning ? 'animate-spin' : ''} style={{ animationDuration: '3s' }} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Dreame OS v2.0</span>
                                <span className="text-sm font-black text-white italic uppercase tracking-tighter drop-shadow-lg">{cleanEntityName(attrs.friendly_name, entityId)}</span>
                            </div>
                        </div>

                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${attrs.battery_level > 20 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                            {isDocked ? <BatteryCharging size={14} /> : <Battery size={14} />} {attrs.battery_level}%
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-[10px] font-black text-white uppercase tracking-widest">
                                {entity.state.replace(/_/g, ' ')}
                            </span>
                            {isCleaning && (
                                <span className="px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                    LIVE SESSION
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {isEditMode && onRemove && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="absolute top-6 right-6 z-50 p-2 bg-red-400/20 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* CONTROL BAR */}
            <div className="p-4 bg-neutral-900/80 border-t border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center bg-black/20 p-1 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setActiveTab(activeTab === 'rooms' ? null : 'rooms')}
                        className={`p-2.5 rounded-xl transition-all ${activeTab === 'rooms' ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                        title="Room Selector"
                    >
                        <Map size={18} />
                    </button>
                    <button
                        onClick={() => setActiveTab(activeTab === 'settings' ? null : 'settings')}
                        className={`p-2.5 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                        title="Advanced Settings"
                    >
                        <Settings2 size={18} />
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={returnHome}
                        className="p-3 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-2xl transition-all border border-white/5"
                    >
                        <Home size={20} />
                    </button>
                    <button
                        onClick={togglePlay}
                        className={`p-3 rounded-2xl transition-all shadow-xl ${isCleaning ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-neutral-900 hover:bg-emerald-400 hover:scale-105'}`}
                    >
                        {isCleaning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                    </button>
                </div>
            </div>

            {/* PANELS */}
            <AnimatePresence>
                {activeTab === 'rooms' && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/40 border-t border-white/5 p-6 flex flex-col gap-4"
                    >
                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                            <MapPin size={12} /> Select Segments to Clean
                        </span>

                        <div className="grid grid-cols-2 gap-3">
                            {rooms.map((room: any) => {
                                const isSelected = selectedRooms.includes(room.id);
                                return (
                                    <button
                                        key={room.id}
                                        onClick={() => toggleRoom(room.id)}
                                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isSelected ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-transparent text-neutral-500 hover:text-neutral-300'}`}
                                    >
                                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-blue-500 text-white' : 'bg-neutral-800'}`}>
                                            <RoomIcon iconName={room.icon} size={16} />
                                        </div>
                                        <span className="text-xs font-bold truncate leading-none">{room.name}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={startSegmentCleaning}
                            disabled={selectedRooms.length === 0}
                            className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedRooms.length > 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'}`}
                        >
                            CLEAN SELECTED ARENAS ({selectedRooms.length})
                        </button>
                    </motion.div>
                )}

                {activeTab === 'settings' && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/40 border-t border-white/5 p-6 flex flex-col gap-6"
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Suction Power</span>
                                <div className="grid grid-cols-2 gap-2">
                                    {fanSpeeds.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setFanSpeed(s.id)}
                                            className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${attrs.fan_speed === s.id ? 'bg-white/10 text-white border-white/20' : 'bg-neutral-950/50 text-neutral-600 border-white/5'}`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Hydration Level</span>
                                <div className="grid grid-cols-3 gap-2">
                                    {waterLevels.map(w => (
                                        <button
                                            key={w.id}
                                            className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${attrs.water_level === w.id ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-neutral-950/50 text-neutral-600 border-white/5'}`}
                                        >
                                            {w.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 grid grid-cols-3 gap-4">
                            {[{ l: 'Brush', v: attrs.main_brush_left || 85 }, { l: 'Side', v: attrs.side_brush_left || 70 }, { l: 'Filter', v: attrs.filter_left || 92 }].map((m, i) => (
                                <div key={i} className="flex flex-col gap-1.5">
                                    <div className="flex justify-between items-center text-[8px] font-black text-neutral-500 uppercase tracking-widest italic">
                                        <span>{m.l}</span>
                                        <span className={m.v < 20 ? 'text-rose-500' : 'text-emerald-500'}>{m.v}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-black rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-1000 ${m.v < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${m.v}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
