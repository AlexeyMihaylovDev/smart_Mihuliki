import React from 'react';
import { useHAStore } from '../../store/useStore';
import { Activity, X, Home, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SensorListWidgetProps {
    id: string;
    entityIds: string[];
    title?: string;
    onRemove: () => void;
    isEditMode: boolean;
}

export const SensorListWidget: React.FC<SensorListWidgetProps> = ({
    id: _id,
    entityIds,
    title = 'Binary Sensors',
    onRemove,
    isEditMode,
}) => {
    const { entities } = useHAStore();

    if (!entities) return null;

    const sensorEntities = entityIds
        .map((eid) => ({ id: eid, ...(entities[eid] as any) }))
        .filter((e) => e.state !== undefined);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative flex flex-col h-full w-full bg-neutral-900/60 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden transition-all duration-700 shadow-2xl border border-white/5 group"
        >
            {/* HEADER */}
            <div className="relative z-10 p-5 pb-3 flex items-start justify-between border-b border-white/5 drag-handle cursor-move">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white/5 text-neutral-400 backdrop-blur-md">
                        <Activity size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">
                            Binary Sensors
                        </span>
                        <span className="text-sm font-medium text-neutral-100">{title}</span>
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

            {/* LIST AREA */}
            <div className="flex-grow overflow-y-auto p-3 space-y-1">
                {sensorEntities.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-neutral-600 text-sm">
                        No sensors found
                    </div>
                ) : (
                    sensorEntities.map((entity, idx) => {
                        const { state, attributes } = entity;
                        const name = attributes?.friendly_name || entity.id;
                        const deviceClass = attributes?.device_class || 'motion';

                        const isDetected = state === 'on';
                        const isUnavailable = state === 'unavailable' || state === 'unknown';

                        const IconComponent = deviceClass === 'occupancy' ? Home : Activity;

                        let statusText = 'Clear';
                        let statusStyles = 'text-neutral-500';
                        let iconStyles = 'text-neutral-500 bg-neutral-800/50';

                        if (isUnavailable) {
                            statusText = 'Unavailable';
                            statusStyles = 'text-neutral-600';
                            iconStyles = 'text-neutral-700 bg-transparent';
                        } else if (isDetected) {
                            statusText = 'Detected';
                            statusStyles = 'text-rose-400 font-bold';
                            iconStyles =
                                'text-rose-400 bg-rose-500/15 shadow-[0_0_15px_rgba(244,63,94,0.3)] border border-rose-500/20';
                        }

                        return (
                            <motion.div
                                key={entity.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`flex items-center justify-between p-3 px-4 rounded-2xl transition-all duration-300 ${isUnavailable ? 'opacity-60 grayscale' : 'hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className={`relative p-2.5 rounded-xl transition-all duration-500 ${iconStyles}`}>
                                        {isUnavailable ? (
                                            <AlertCircle size={18} />
                                        ) : (
                                            <IconComponent size={18} />
                                        )}

                                        {/* Пульсация при обнаружении */}
                                        {isDetected && (
                                            <motion.div
                                                className="absolute inset-0 rounded-xl border-2 border-rose-400"
                                                animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                                            />
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-neutral-300 truncate max-w-[180px]">
                                        {name}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`text-sm tracking-wide ${statusStyles}`}>
                                        {statusText}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
};
