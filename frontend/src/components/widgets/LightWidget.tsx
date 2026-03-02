import React from 'react';
import { useHAStore } from '../../store/useStore';
import { Lightbulb, Sun, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cleanEntityName } from '../../utils/naming';

interface LightWidgetProps {
    id: string;
    entityId: string;
    onRemove: () => void;
    isEditMode: boolean;
}

export const LightWidget: React.FC<LightWidgetProps> = ({ entityId, onRemove, isEditMode }) => {
    const { entities, connection } = useHAStore();
    const entity = entities ? (entities[entityId] as any) : null;

    if (!entity) return null;

    const state = entity.state;
    const brightness = entity.attributes.brightness ? Math.round((entity.attributes.brightness / 255) * 100) : 0;
    const name = cleanEntityName(entity.attributes.friendly_name, entityId);
    const isOn = state === 'on';

    const toggle = async () => {
        if (!connection) return;
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
        connection.sendMessagePromise({
            type: 'call_service',
            domain: 'light',
            service: isOn ? 'turn_off' : 'turn_on',
            target: { entity_id: entityId }
        });
    };

    const setBrightness = async (val: number) => {
        if (!connection) return;
        const bri255 = Math.round((val / 100) * 255);
        connection.sendMessagePromise({
            type: 'call_service',
            domain: 'light',
            service: 'turn_on',
            service_data: { brightness: bri255 },
            target: { entity_id: entityId }
        });
    };

    return (
        <motion.div
            layout
            className={`relative flex flex-col h-full w-full bg-neutral-900/60 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden transition-all duration-700 group ${isOn ? 'shadow-[0_8px_32px_-10px_rgba(251,191,36,0.25)] border-amber-500/30' : 'shadow-2xl border-white/5'
                } border`}
        >
            <AnimatePresence>
                {isOn && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none"
                    />
                )}
            </AnimatePresence>

            <div className="relative z-10 p-5 flex items-start justify-between drag-handle cursor-move">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{
                            backgroundColor: isOn ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            color: isOn ? '#fbbf24' : '#a3a3a3'
                        }}
                        className="p-2.5 rounded-2xl backdrop-blur-md"
                    >
                        <Lightbulb size={18} />
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-0.5">Photon Node</span>
                        <span className="text-sm font-black text-neutral-100 italic uppercase tracking-tighter truncate max-w-[110px] leading-tight">{name}</span>
                    </div>
                </div>

                {isEditMode && (
                    <button onClick={onRemove} className="p-2 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
                )}
            </div>

            <div className="relative z-10 flex-grow flex items-center justify-between px-6 pb-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={toggle}
                    className={`flex items-center justify-center w-14 h-14 rounded-full ${isOn ? 'bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]' : 'bg-neutral-800'}`}
                >
                    <Sun className={isOn ? 'text-neutral-900' : 'text-neutral-500'} size={24} />
                </motion.button>
                <div className="flex-grow ml-6 flex flex-col items-end">
                    <span className="text-2xl font-black text-white tracking-tighter italic">{isOn ? `${brightness}%` : 'OFF'}</span>
                    <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Luminance</span>
                </div>
            </div>

            {/* CUSTOM SLIDER */}
            <AnimatePresence>
                {isOn && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: 10, height: 0 }}
                        className="px-6 pb-6 w-full relative z-20"
                    >
                        <div className="relative w-full h-12 bg-neutral-950/50 rounded-2xl overflow-hidden border border-white/5 shadow-inner backdrop-blur-sm group/slider">
                            {/* Слой заливки ползунка */}
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600/90 to-amber-400/90 border-r border-white/20"
                                animate={{ width: `${brightness}%` }}
                                transition={{ type: "spring", bounce: 0, duration: 0.1 }}
                            />

                            {/* Невидимый настоящий range input для управления */}
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={brightness}
                                onChange={(e) => setBrightness(parseInt(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />

                            {/* Декоративные метки */}
                            <div className="absolute inset-0 pointer-events-none flex justify-between items-center px-4 text-[10px] font-bold text-white/50 mix-blend-overlay">
                                <span>0%</span>
                                <span>100%</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
