import React from 'react';
import { useHAStore } from '../../store/useStore';
import { Eye, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MotionWidgetProps {
    id: string;
    entityId: string;
    onRemove: () => void;
}

export const MotionWidget: React.FC<MotionWidgetProps> = ({ id, entityId, onRemove }) => {
    const { entities } = useHAStore();
    const entity = entities ? (entities[entityId] as any) : null;

    if (!entity) return null;

    const state = entity.state;
    const name = entity.attributes.friendly_name || entityId;
    const isDetected = state === 'on' || state === 'detected';

    return (
        <div className={`flex flex-col h-full backdrop-blur-xl border rounded-3xl overflow-hidden shadow-2xl group transition-all duration-700 ${isDetected
                ? 'bg-red-500/20 border-red-500/50 animate-pulse-slow'
                : 'bg-gray-800/40 border-gray-700/50 hover:border-blue-500/30'
            }`}>
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-2xl transition-colors duration-500 ${isDetected ? 'bg-red-500/30' : 'bg-gray-900/50'}`}>
                        <Eye className={isDetected ? 'text-red-400' : 'text-gray-500'} size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Security</span>
                        <span className="text-sm font-semibold text-white truncate max-w-[120px]">{name}</span>
                    </div>
                </div>
                <button onClick={onRemove} className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <ShieldAlert size={14} className="rotate-45" />
                </button>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center p-4">
                <AnimatePresence mode="wait">
                    {isDetected ? (
                        <motion.div
                            key="detected"
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            className="bg-red-500 p-6 rounded-full shadow-[0_0_50px_rgba(239,68,68,0.5)]"
                        >
                            <ShieldAlert className="text-white" size={40} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="clear"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-gray-600 flex flex-col items-center"
                        >
                            <Eye size={40} className="opacity-20 mb-2" />
                            <span className="text-xs font-bold uppercase tracking-widest">Clear</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-6 text-center">
                    <span className={`text-lg font-black uppercase transition-colors duration-500 ${isDetected ? 'text-red-400' : 'text-gray-500'}`}>
                        {isDetected ? 'MOTION DETECTED' : 'NO MOTION'}
                    </span>
                </div>
            </div>
        </div>
    );
};
