import React from 'react';
import { useHAStore } from '../../store/useStore';
import { Power, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SwitchWidgetProps {
    id: string;
    entityId: string;
    onRemove: () => void;
}

export const SwitchWidget: React.FC<SwitchWidgetProps> = ({ id, entityId, onRemove }) => {
    const { entities, connection } = useHAStore();
    const entity = entities ? (entities[entityId] as any) : null;

    if (!entity) return null;

    const state = entity.state;
    const name = entity.attributes.friendly_name || entityId;
    const isOn = state === 'on';

    const toggle = async () => {
        if (!connection) return;
        // Добавляем небольшую тактильную вибрацию на мобильных устройствах
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50);
        }
        connection.sendMessagePromise({
            type: 'call_service',
            domain: 'switch',
            service: isOn ? 'turn_off' : 'turn_on',
            target: { entity_id: entityId }
        });
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`relative flex flex-col h-full w-full bg-neutral-900/60 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden transition-all duration-700 group ${isOn ? 'shadow-[0_8px_32px_-10px_rgba(16,185,129,0.25)] border-emerald-500/30' : 'shadow-2xl border-white/5'
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
                        className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* HEADER */}
            <div className="relative z-10 p-5 flex items-start justify-between drag-handle cursor-move">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{
                            backgroundColor: isOn ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            color: isOn ? '#10b981' : '#a3a3a3'
                        }}
                        className="p-2.5 rounded-2xl backdrop-blur-md"
                    >
                        <Zap size={18} />
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">Switch</span>
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

            {/* MAIN TOGGLE AREA */}
            <div className="relative z-10 flex-grow flex flex-col items-center justify-center pb-6">
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
                                className="absolute inset-0 rounded-full bg-emerald-500/30"
                            />
                        )}
                    </AnimatePresence>

                    <motion.button
                        layoutId={`toggle-${id}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={toggle}
                        className={`relative z-10 flex items-center justify-center w-20 h-20 rounded-full transition-all duration-500 cursor-pointer ${isOn
                            ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_0_40px_rgba(16,185,129,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]'
                            : 'bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700/50 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5),0_2px_10px_rgba(0,0,0,0.5)]'
                            }`}
                    >
                        <motion.div
                            animate={{
                                scale: isOn ? 1.1 : 1,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <Power
                                className={`transition-colors duration-500 ${isOn ? 'text-white drop-shadow-md' : 'text-neutral-500'}`}
                                size={28}
                                strokeWidth={isOn ? 3 : 2}
                            />
                        </motion.div>
                    </motion.button>
                </div>

                {/* STATUS TEXT */}
                <motion.div
                    className="mt-6 flex items-center gap-2"
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        animate={{
                            backgroundColor: isOn ? '#10b981' : '#525252',
                            boxShadow: isOn ? '0 0 10px #10b981' : 'none'
                        }}
                        className="w-1.5 h-1.5 rounded-full"
                    />
                    <motion.span
                        animate={{ color: isOn ? '#10b981' : '#737373' }}
                        className="text-[11px] font-bold uppercase tracking-[0.2em]"
                    >
                        {isOn ? 'Active' : 'Standby'}
                    </motion.span>
                </motion.div>
            </div>
        </motion.div>
    );
};
