import React from 'react';
import { useHAStore } from '../../store/useStore';
import { Lightbulb, Sun, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LightWidgetProps {
    id: string;
    entityId: string;
    onRemove: () => void;
}

export const LightWidget: React.FC<LightWidgetProps> = ({ id, entityId, onRemove }) => {
    const { entities, connection } = useHAStore();
    const entity = entities ? (entities[entityId] as any) : null;

    if (!entity) return null;

    const state = entity.state;
    const brightness = entity.attributes.brightness ? Math.round((entity.attributes.brightness / 255) * 100) : 0;
    const name = entity.attributes.friendly_name || entityId;
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`relative flex flex-col h-full w-full bg-neutral-900/60 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden transition-all duration-700 group ${isOn ? 'shadow-[0_8px_32px_-10px_rgba(251,191,36,0.25)] border-amber-500/30' : 'shadow-2xl border-white/5'
                } border`}
        >
            {/* Фоновое мягкое свечение при активном состоянии */}
            <AnimatePresence>
                {isOn && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* HEADER */}
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
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">Light</span>
                        <span className="text-sm font-medium text-neutral-100 truncate max-w-[110px] leading-tight">{name}</span>
                    </div>
                </div>

                {/* Кнопка удаления */}
                <button
                    onClick={onRemove}
                    className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Remove widget"
                >
                    <X size={16} strokeWidth={2.5} />
                </button>
            </div>

            {/* MAIN TOGGLE & INFO AREA */}
            <div className="relative z-10 flex-grow flex flex-col items-center justify-center pb-2">
                <div className="relative">
                    {/* Пульсирующие кольца при On */}
                    <AnimatePresence>
                        {isOn && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 0, scale: 1.8 }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeOut"
                                }}
                                className="absolute inset-0 rounded-full bg-amber-500/30"
                            />
                        )}
                    </AnimatePresence>

                    <motion.button
                        layoutId={`toggle-light-${id}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={toggle}
                        className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full transition-all duration-500 cursor-pointer ${isOn
                            ? 'bg-gradient-to-b from-amber-400 to-amber-500 shadow-[0_0_40px_rgba(251,191,36,0.4),inset_0_2px_0_rgba(255,255,255,0.4)]'
                            : 'bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700/50 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5),0_2px_10px_rgba(0,0,0,0.5)]'
                            }`}
                    >
                        <motion.div
                            animate={{ scale: isOn ? 1.1 : 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <Sun
                                className={`transition-colors duration-500 ${isOn ? 'text-neutral-900 drop-shadow-md' : 'text-neutral-500'}`}
                                size={26}
                                strokeWidth={isOn ? 2.5 : 2}
                            />
                        </motion.div>
                    </motion.button>
                </div>

                {/* STATUS TEXT */}
                <motion.div
                    className="mt-4 flex flex-col items-center"
                    animate={{ opacity: 1 }}
                >
                    <motion.span
                        animate={{ color: isOn ? '#fbbf24' : '#737373' }}
                        className="text-2xl font-black tracking-tight"
                    >
                        {isOn ? `${brightness}%` : 'OFF'}
                    </motion.span>
                </motion.div>
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
