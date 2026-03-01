import React from 'react';
import { useHAStore } from '../../store/useStore';
import { Activity, Zap, Droplets, Wind } from 'lucide-react';
import { motion } from 'framer-motion';

interface SensorWidgetProps {
    id: string;
    entityId: string;
    onRemove: () => void;
}

export const SensorWidget: React.FC<SensorWidgetProps> = ({ id: _id, entityId, onRemove }) => {
    const { entities } = useHAStore();
    const entity = entities ? (entities[entityId] as any) : null;

    if (!entity) return null;

    const state = entity.state;
    const unit = entity.attributes.unit_of_measurement || '';
    const name = entity.attributes.friendly_name || entityId;
    const deviceClass = entity.attributes.device_class;

    const getIcon = () => {
        switch (deviceClass) {
            case 'power': return <Zap className="text-yellow-400" size={20} />;
            case 'humidity': return <Droplets className="text-blue-400" size={20} />;
            case 'temperature': return <Activity className="text-red-400" size={20} />;
            case 'pressure': return <Wind className="text-emerald-400" size={20} />;
            default: return <Activity className="text-blue-400" size={20} />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl group transition-all duration-500 hover:border-blue-500/30">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-900/50 rounded-2xl">
                        {getIcon()}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sensor</span>
                        <span className="text-sm font-semibold text-white truncate max-w-[120px]">{name}</span>
                    </div>
                </div>
                <button onClick={onRemove} className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Activity size={14} className="rotate-45" />
                </button>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center p-4">
                <div className="relative">
                    <motion.div
                        key={state}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl font-black text-white text-center"
                    >
                        {state}
                        <span className="text-lg text-gray-500 ml-1 font-medium">{unit}</span>
                    </motion.div>
                </div>

                {/* Visual placeholder for a sparkline/history */}
                <div className="w-full mt-6 h-12 flex items-end justify-between space-x-1 px-4 opacity-30">
                    {[40, 70, 45, 90, 65, 80, 50, 60].map((h, i) => (
                        <div key={i} className="flex-grow bg-blue-500/50 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                </div>
            </div>
        </div>
    );
};
