import React from 'react';
import { useHAStore } from '../../store/useStore';
import { Activity, Zap, Droplets, Wind, X, Battery, BatteryLow, BatteryMedium, BatteryWarning } from 'lucide-react';
import { motion } from 'framer-motion';
import { cleanEntityName } from '../../utils/naming';

interface SensorWidgetProps {
    id: string;
    entityId: string;
    onRemove: () => void;
    isEditMode: boolean;
}

export const SensorWidget: React.FC<SensorWidgetProps> = ({ id: _id, entityId, onRemove, isEditMode }) => {
    const { entities } = useHAStore();
    const entity = entities ? (entities[entityId] as any) : null;

    if (!entity) return null;

    const state = entity.state;
    const unit = entity.attributes.unit_of_measurement || '';
    const name = cleanEntityName(entity.attributes.friendly_name, entityId);
    const deviceClass = entity.attributes.device_class;
    const batteryLevel = entity.attributes.battery_level || entity.attributes.battery;

    const getIcon = () => {
        switch (deviceClass) {
            case 'power': return <Zap size={18} />;
            case 'humidity': return <Droplets size={18} />;
            case 'temperature': return <Activity size={18} />;
            case 'pressure': return <Wind size={18} />;
            default: return <Activity size={18} />;
        }
    };

    const getColor = () => {
        switch (deviceClass) {
            case 'power': return '#fbbf24'; // yellow-400
            case 'humidity': return '#60a5fa'; // blue-400
            case 'temperature': return '#f87171'; // red-400
            case 'pressure': return '#34d399'; // emerald-400
            default: return '#60a5fa';
        }
    };

    const getBatteryIcon = () => {
        if (batteryLevel === undefined) return null;
        if (batteryLevel <= 10) return <BatteryWarning size={14} className="text-red-500 animate-pulse" />;
        if (batteryLevel <= 30) return <BatteryLow size={14} className="text-orange-400" />;
        if (batteryLevel <= 70) return <BatteryMedium size={14} className="text-yellow-400" />;
        return <Battery size={14} className="text-emerald-400" />;
    };

    const color = getColor();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative flex flex-col h-full w-full bg-neutral-900/60 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden transition-all duration-700 group border border-white/5 shadow-2xl"
        >
            {/* Header */}
            <div className="relative z-10 p-5 flex items-start justify-between drag-handle cursor-move">
                <div className="flex items-center gap-3">
                    <div
                        className="p-2.5 rounded-2xl backdrop-blur-md bg-white/5"
                        style={{ color: color }}
                    >
                        {getIcon()}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">Sensor</span>
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
            </div>

            {/* Value Area */}
            <div className="relative z-10 flex-grow flex flex-col items-center justify-center pb-8">
                <div className="flex items-baseline">
                    <motion.span
                        key={state}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-black text-white tracking-tighter"
                    >
                        {state}
                    </motion.span>
                    {unit && (
                        <span className="ml-1 text-xl font-bold text-neutral-500">{unit}</span>
                    )}
                </div>

                {/* Animated Sparkline Placeholder */}
                <div className="w-full max-w-[140px] mt-6 h-10 flex items-end justify-between gap-1 px-2">
                    {[40, 70, 45, 90, 65, 80, 50, 60, 75, 55].map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.05, duration: 0.5 }}
                            className="flex-grow rounded-t-full"
                            style={{ backgroundColor: `${color}40` }}
                        />
                    ))}
                </div>
            </div>

            {/* Subtle bottom glow */}
            <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-12 blur-[60px] pointer-events-none opacity-20"
                style={{ backgroundColor: color }}
            />
        </motion.div>
    );
};
