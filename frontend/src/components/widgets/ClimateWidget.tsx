import React from 'react';
import { useHAStore } from '../../store/useStore';
import { Thermometer, Fan, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClimateWidgetProps {
    id: string;
    entityId: string;
    onRemove: () => void;
}

export const ClimateWidget: React.FC<ClimateWidgetProps> = ({ id, entityId, onRemove }) => {
    const { entities, connection } = useHAStore();
    const entity = entities ? (entities[entityId] as any) : null;

    if (!entity) return null;

    const currentTemp = entity.attributes.current_temperature;
    const targetTemp = entity.attributes.temperature;
    const mode = entity.state;
    const name = entity.attributes.friendly_name || entityId;
    const hvacAction = entity.attributes.hvac_action; // e.g., heating, cooling, idle

    const setTemp = async (offset: number) => {
        if (!connection) return;
        connection.sendMessagePromise({
            type: 'call_service',
            domain: 'climate',
            service: 'set_temperature',
            service_data: { temperature: targetTemp + offset },
            target: { entity_id: entityId }
        });
    };

    const getActionColor = () => {
        if (hvacAction === 'heating') return 'text-orange-400';
        if (hvacAction === 'cooling') return 'text-blue-400';
        return 'text-gray-500';
    };

    return (
        <div className="flex flex-col h-full bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl group transition-all duration-500 hover:border-orange-500/50">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-900/50 rounded-2xl">
                        <Fan className={getActionColor() + (mode !== 'off' ? ' animate-spin-slow' : '')} size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Climate</span>
                        <span className="text-sm font-semibold text-white truncate max-w-[120px]">{name}</span>
                    </div>
                </div>
                <button onClick={onRemove} className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Thermometer size={14} className="rotate-45" />
                </button>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center p-4">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-700/50" />
                        <circle
                            cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="6" fill="transparent"
                            strokeDasharray="364" strokeDashoffset={364 - (targetTemp / 40) * 364}
                            strokeLinecap="round"
                            className={getActionColor() + " transition-all duration-1000"}
                        />
                    </svg>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-white">{targetTemp}°</span>
                        <span className="text-xs text-gray-500 font-bold">Current: {currentTemp}°</span>
                    </div>
                </div>

                <div className="flex items-center space-x-6 mt-4">
                    <button onClick={() => setTemp(-0.5)} className="p-3 bg-gray-700/50 rounded-2xl text-gray-400 hover:text-white hover:bg-gray-600 transition">
                        <ArrowDown size={20} />
                    </button>
                    <button onClick={() => setTemp(0.5)} className="p-3 bg-gray-700/50 rounded-2xl text-gray-400 hover:text-white hover:bg-gray-600 transition">
                        <ArrowUp size={20} />
                    </button>
                </div>
            </div>

            <div className="p-3 bg-gray-900/30 flex justify-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{mode}</span>
                {hvacAction && <span className={`text-[10px] font-black uppercase tracking-widest ${getActionColor()}`}>{hvacAction}</span>}
            </div>
        </div>
    );
};
