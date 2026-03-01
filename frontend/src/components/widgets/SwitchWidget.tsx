import React from 'react';
import { useHAStore } from '../../store/useStore';
import { Power, ToggleRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
        connection.sendMessagePromise({
            type: 'call_service',
            domain: 'switch',
            service: isOn ? 'turn_off' : 'turn_on',
            target: { entity_id: entityId }
        });
    };

    return (
        <div className="flex flex-col h-full bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl group transition-all duration-500 hover:border-emerald-500/50">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <motion.div
                        animate={{
                            backgroundColor: isOn ? 'rgba(16, 185, 129, 0.2)' : 'rgba(31, 41, 55, 0.5)',
                        }}
                        className="p-2 rounded-2xl"
                    >
                        <ToggleRight className={isOn ? 'text-emerald-400' : 'text-gray-500'} size={20} />
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Switch</span>
                        <span className="text-sm font-semibold text-white truncate max-w-[120px]">{name}</span>
                    </div>
                </div>
                <button onClick={onRemove} className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Power size={14} className="rotate-45" />
                </button>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center p-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggle}
                    className={`w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-500 ${isOn
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_20px_40px_rgba(16,185,129,0.3)]'
                            : 'bg-gray-700 shadow-inner'
                        }`}
                >
                    <Power className={isOn ? 'text-white' : 'text-gray-500'} size={32} />
                </motion.button>
                <motion.span
                    animate={{ color: isOn ? '#10b981' : '#6b7280' }}
                    className="mt-4 text-xs font-black uppercase tracking-[0.2em]"
                >
                    {isOn ? 'Active' : 'Standby'}
                </motion.span>
            </div>
        </div>
    );
};
