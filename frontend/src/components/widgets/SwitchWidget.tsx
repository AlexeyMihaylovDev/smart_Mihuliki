import React from 'react';
import { useHAStore } from '../../store/useStore';
import { Power, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SwitchWidgetProps {
    id: string;
    entityId: string;
    onRemove: () => void;
    isEditMode: boolean;
}

export const SwitchWidget: React.FC<SwitchWidgetProps> = ({ entityId, onRemove, isEditMode }) => {
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
            className={`relative flex flex-col h-full w-full bg-neutral-900/60 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden transition-all duration-700 group ${isOn ? 'shadow-[0_8px_32px_-10px_rgba(16,185,129,0.25)] border-emerald-500/30' : 'shadow-2xl border-white/5'
                } border`}
        >
            <AnimatePresence>
                {isOn && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none"
                    />
                )}
            </AnimatePresence>

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
                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-0.5">Power Cell</span>
                        <span className="text-sm font-black text-neutral-100 italic uppercase tracking-tighter truncate max-w-[110px] leading-tight">{name}</span>
                    </div>
                </div>

                {isEditMode && (
                    <button onClick={onRemove} className="p-2 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
                )}
            </div>

            <div className="relative z-10 flex-grow flex flex-col items-center justify-center pb-6">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={toggle}
                    className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-500 ${isOn
                        ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                        : 'bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700/50'
                        }`}
                >
                    <Power className={`${isOn ? 'text-white' : 'text-neutral-500'}`} size={24} strokeWidth={isOn ? 3 : 2} />
                </motion.button>

                <div className="mt-4 flex flex-col items-center">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isOn ? 'text-emerald-400' : 'text-neutral-600'}`}>
                        {isOn ? 'Active Node' : 'Standby Mode'}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};
