import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Play, Check, X } from 'lucide-react';
import { useHAStore } from '../../store/useStore';

interface SceneWidgetProps {
    id: string;
    entityId: string;
    onRemove?: () => void;
    isEditMode?: boolean;
}

export const SceneWidget: React.FC<SceneWidgetProps> = ({ entityId, onRemove, isEditMode }) => {
    const { entities, connection } = useHAStore();
    const entity = entities?.[entityId];
    const [isActivating, setIsActivating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const activateScene = async () => {
        if (!connection || isActivating) return;

        setIsActivating(true);
        try {
            await connection.sendMessagePromise({
                type: 'call_service',
                domain: 'scene',
                service: 'turn_on',
                service_data: { entity_id: entityId }
            });
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2000);
        } catch (err) {
            console.error('Failed to activate scene:', err);
        } finally {
            setIsActivating(false);
        }
    };

    const friendlyName = entity?.attributes?.friendly_name || entityId.split('.')[1].replace(/_/g, ' ');

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={activateScene}
            className={`relative h-full w-full rounded-[2.5rem] p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 group overflow-hidden ${isSuccess
                    ? 'bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 shadow-xl'
                }`}
        >
            {/* Background Glow */}
            <div className={`absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-40 ${isSuccess ? 'bg-emerald-400 blur-3xl' : 'bg-purple-500 blur-3xl'
                }`} />

            {isEditMode && onRemove && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="absolute top-4 right-4 z-50 p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                    <X size={14} />
                </button>
            )}

            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className={`p-5 rounded-[2rem] transition-all duration-500 ${isSuccess
                        ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/50'
                        : 'bg-white/5 text-purple-400 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-purple-500/30'
                    }`}>
                    {isActivating ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        >
                            <Sparkles size={28} />
                        </motion.div>
                    ) : isSuccess ? (
                        <Check size={28} />
                    ) : (
                        <Play size={28} fill="currentColor" />
                    )}
                </div>

                <div className="text-center">
                    <h3 className="text-sm font-black text-white italic uppercase tracking-tighter leading-tight">
                        {friendlyName}
                    </h3>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 transition-colors ${isSuccess ? 'text-emerald-400' : 'text-neutral-500 group-hover:text-neutral-300'
                        }`}>
                        {isActivating ? 'Activating...' : isSuccess ? 'Applied' : 'Tap to Scene'}
                    </p>
                </div>
            </div>

            {/* Particle Effects (Decorative) */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none"
                    >
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0, x: 0, y: 0 }}
                                animate={{
                                    scale: [0, 1, 0],
                                    x: (Math.random() - 0.5) * 100,
                                    y: (Math.random() - 0.5) * 100
                                }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                className="absolute top-1/2 left-1/2 w-1 h-1 bg-emerald-400 rounded-full"
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
