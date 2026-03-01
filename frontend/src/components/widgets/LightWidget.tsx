import React from 'react';
import { useHAStore } from '../../store/useStore';
import { Lightbulb, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <div className="flex flex-col h-full bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl group transition-all duration-500 hover:border-blue-500/50">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <motion.div
                        animate={{
                            backgroundColor: isOn ? 'rgba(59, 130, 246, 0.2)' : 'rgba(31, 41, 55, 0.5)',
                            scale: isOn ? 1.1 : 1
                        }}
                        className="p-2 rounded-2xl"
                    >
                        <Lightbulb className={isOn ? 'text-blue-400 fill-blue-400' : 'text-gray-500'} size={20} />
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Light</span>
                        <span className="text-sm font-semibold text-white truncate max-w-[120px]">{name}</span>
                    </div>
                </div>
                <button onClick={onRemove} className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Sun size={14} className="rotate-45" />
                </button>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center p-4 space-y-4">
                <motion.div
                    whileTap={{ scale: 0.95 }}
                    onClick={toggle}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-700 ${isOn ? 'bg-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.6)]' : 'bg-gray-700 shadow-inner'
                        }`}
                >
                    <Sun className={isOn ? 'text-white' : 'text-gray-500'} size={32} />
                    {isOn && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="absolute inset-0 rounded-full bg-blue-400/20"
                        />
                    )}
                </motion.div>

                <div className="text-center">
                    <span className="text-2xl font-black text-white">{isOn ? `${brightness}%` : 'OFF'}</span>
                </div>
            </div>

            {isOn && (
                <div className="px-6 pb-6">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={brightness}
                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
            )}
        </div>
    );
};
