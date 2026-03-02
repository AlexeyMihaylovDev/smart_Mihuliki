import React from 'react';
import { useHAStore } from '../../store/useStore';
import { Eye, ShieldAlert, X, Battery, BatteryLow, BatteryMedium, BatteryWarning, Home, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MotionWidgetProps {
    id: string;
    entityId: string;
    onRemove: () => void;
}

export const MotionWidget: React.FC<MotionWidgetProps> = ({ id: _id, entityId, onRemove }) => {
    const { entities } = useHAStore();
    const entity = entities ? (entities[entityId] as any) : null;

    if (!entity) return null;

    const state = entity.state;
    const name = entity.attributes.friendly_name || entityId;
    const deviceClass = entity.attributes.device_class || 'motion';
    const batteryLevel = entity.attributes.battery_level || entity.attributes.battery;

    const isDetected = state === 'on' || state === 'detected';
    const isUnavailable = state === 'unavailable' || state === 'unknown';

    // Icons from the provided code snippet
    const IconComponent = deviceClass === 'occupancy' ? Home : Eye;

    const getBatteryIcon = () => {
        if (batteryLevel === undefined) return null;
        if (batteryLevel <= 10) return <BatteryWarning size={14} className="text-red-500 animate-pulse" />;
        if (batteryLevel <= 30) return <BatteryLow size={14} className="text-orange-400" />;
        if (batteryLevel <= 70) return <BatteryMedium size={14} className="text-yellow-400" />;
        return <Battery size={14} className="text-emerald-400" />;
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`relative flex flex-col h-full w-full bg-neutral-900/60 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden transition-all duration-700 group border h-full ${isDetected ? 'border-rose-500/30' : 'border-white/5'
                } shadow-2xl`}
        >
            <AnimatePresence>
                {isDetected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="relative z-10 p-5 flex items-start justify-between drag-handle cursor-move">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl backdrop-blur-md bg-white/5 ${isDetected ? 'text-rose-400' : 'text-neutral-500'}`}>
                        {isUnavailable ? <AlertCircle size={18} /> : (isDetected ? <ShieldAlert size={18} /> : <IconComponent size={18} />)}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">Security</span>
                        <span className="text-sm font-medium text-neutral-100 truncate max-w-[110px] leading-tight">{name}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {batteryLevel !== undefined && (
                        <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                            {getBatteryIcon()}
                            <span className="text-[10px] font-bold text-neutral-400">{batteryLevel}%</span>
                        </div>
                    )}
                    <button
                        onClick={onRemove}
                        className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Animation Area */}
            <div className="relative z-10 flex-grow flex flex-col items-center justify-center pb-6">
                <div className="relative">
                    <AnimatePresence>
                        {isDetected && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 0, scale: 2 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                    className="absolute inset-0 rounded-full bg-rose-500/30"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 0, scale: 1.5 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                                    className="absolute inset-0 rounded-full bg-rose-500/20"
                                />
                            </>
                        )}
                    </AnimatePresence>

                    <div className={`relative z-10 flex items-center justify-center w-20 h-20 rounded-full transition-all duration-500 ${isDetected
                        ? 'bg-gradient-to-b from-rose-400 to-rose-600 shadow-[0_0_40px_rgba(244,63,94,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]'
                        : 'bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700/50 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5),0_2px_10px_rgba(0,0,0,0.5)]'
                        }`}>
                        <motion.div
                            animate={isDetected ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            {isUnavailable ? (
                                <AlertCircle size={32} className="text-neutral-600" />
                            ) : (
                                <ShieldAlert className={isDetected ? 'text-white' : 'text-neutral-500'} size={32} />
                            )}
                        </motion.div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <div className={`text-xs font-black uppercase tracking-[0.3em] transition-colors duration-500 ${isDetected ? 'text-rose-400' : 'text-neutral-600'}`}>
                        {isUnavailable ? 'UNAVAILABLE' : (isDetected ? 'MOTION DETECTED' : 'SYSTEM CLEAR')}
                    </div>
                </div>
            </div>

            {/* Glow */}
            {isDetected && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-12 bg-rose-500 blur-[60px] pointer-events-none opacity-20" />
            )}
        </motion.div>
    );
};
