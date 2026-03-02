import React from 'react';
import { Blinds, ChevronUp, ChevronDown, Square, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cleanEntityName } from '../../utils/naming';
import { useHAStore } from '../../store/useStore';

interface CoverWidgetProps {
    id: string;
    entityId: string;
    onRemove: () => void;
    isEditMode: boolean;
}

export const CoverWidget: React.FC<CoverWidgetProps> = ({ id: _id, entityId, onRemove, isEditMode }) => {
    const { entities, connection } = useHAStore();
    const entity = entities ? (entities[entityId] as any) : null;

    if (!entity) return null;

    const state = entity.state;
    // Позиция от 0 (закрыто) до 100 (открыто)
    const position = entity.attributes.current_position !== undefined
        ? entity.attributes.current_position
        : (state === 'open' ? 100 : 0);
    const name = cleanEntityName(entity.attributes.friendly_name, entityId);

    // Считаем открытым, если позиция больше 0 или статус 'open'
    const isOpen = position > 0 || state === 'open';

    const sendCoverCommand = async (service: string, data = {}) => {
        if (!connection) return;
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(40);
        connection.sendMessagePromise({
            type: 'call_service',
            domain: 'cover',
            service: service,
            ...data,
            target: { entity_id: entityId }
        });
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`relative flex flex-col h-full w-full bg-neutral-900/60 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden transition-all duration-700 group ${isOpen ? 'shadow-[0_8px_32px_-10px_rgba(99,102,241,0.25)] border-indigo-500/30' : 'shadow-2xl border-white/5'
                } border`}
        >
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* HEADER */}
            <div className="relative z-10 p-5 flex items-start justify-between drag-handle cursor-move">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{
                            backgroundColor: isOpen ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            color: isOpen ? '#818cf8' : '#a3a3a3'
                        }}
                        className="p-2.5 rounded-2xl backdrop-blur-md"
                    >
                        <Blinds size={18} />
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">Cover</span>
                        <span className="text-sm font-medium text-neutral-100 truncate max-w-[120px] leading-tight">{name}</span>
                    </div>
                </div>

                {isEditMode && (
                    <button
                        onClick={onRemove}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                        <X size={16} strokeWidth={2.5} />
                    </button>
                )}
            </div>

            {/* MAIN CONTENT */}
            <div className="relative z-10 flex-grow flex flex-col items-center justify-center pb-2">
                <motion.div className="flex flex-col items-center" animate={{ opacity: 1 }}>
                    <motion.span animate={{ color: isOpen ? '#818cf8' : '#737373' }} className="text-4xl font-black tracking-tighter tabular-nums">
                        {position}%
                    </motion.span>
                    <motion.span animate={{ color: isOpen ? '#a5b4fc' : '#525252' }} className="text-xs font-bold uppercase tracking-widest mt-1">
                        {isOpen ? 'Открыто' : 'Закрыто'}
                    </motion.span>
                </motion.div>

                {/* Кнопки управления (Вверх, Стоп, Вниз) */}
                <div className="flex items-center gap-3 mt-5 bg-neutral-950/40 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => sendCoverCommand('open_cover')}
                        className={`p-3 rounded-full transition-colors ${position === 100 ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:text-white'}`}
                    >
                        <ChevronUp size={20} strokeWidth={2.5} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => sendCoverCommand('stop_cover')}
                        className="p-3 rounded-full text-neutral-400 hover:text-white transition-colors"
                    >
                        <Square size={14} fill="currentColor" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => sendCoverCommand('close_cover')}
                        className={`p-3 rounded-full transition-colors ${position === 0 ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:text-white'}`}
                    >
                        <ChevronDown size={20} strokeWidth={2.5} />
                    </motion.button>
                </div>
            </div>

            {/* Слайдер точной позиции */}
            <div className="px-6 pb-6 w-full relative z-20 mt-2">
                <div className="relative w-full h-12 bg-neutral-950/50 rounded-2xl overflow-hidden border border-white/5 shadow-inner backdrop-blur-sm group/slider">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600/80 to-indigo-400/80 border-r border-white/20"
                        animate={{ width: `${position}%` }}
                        transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                    />

                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={position}
                        onChange={(e) => sendCoverCommand('set_cover_position', { position: parseInt(e.target.value) })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    <div className="absolute inset-0 pointer-events-none flex justify-between items-center px-4 text-[10px] font-bold text-white/50 mix-blend-overlay">
                        <span>Закрыть</span>
                        <span>Открыть</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
