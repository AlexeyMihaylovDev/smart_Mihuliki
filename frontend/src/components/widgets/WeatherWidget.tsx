import React from 'react';
import { useHAStore } from '../../store/useStore';
import { CloudRain, Droplets, Wind, X, Cloud, Sun, CloudLightning, CloudSnow } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeatherWidgetProps {
    id: string;
    entityId: string;
    onRemove?: () => void;
    isEditMode?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ entityId, onRemove, isEditMode }) => {
    const { entities } = useHAStore();
    const entity = entities?.[entityId] as any;

    if (!entity) return null;

    const temperature = entity.attributes.temperature;
    const humidity = entity.attributes.humidity;
    const windSpeed = entity.attributes.wind_speed;
    const condition = entity.state;

    const getWeatherIcon = (state: string) => {
        switch (state) {
            case 'partlycloudy':
            case 'cloudy':
                return <Cloud size={48} strokeWidth={1.5} />;
            case 'rainy':
            case 'pouring':
                return <CloudRain size={48} strokeWidth={1.5} />;
            case 'sunny':
                return <Sun size={48} strokeWidth={1.5} />;
            case 'lightning':
                return <CloudLightning size={48} strokeWidth={1.5} />;
            case 'snowy':
                return <CloudSnow size={48} strokeWidth={1.5} />;
            default:
                return <CloudRain size={48} strokeWidth={1.5} />;
        }
    };

    return (
        <div className="relative flex flex-col h-full w-full bg-gradient-to-br from-blue-500/20 to-cyan-500/10 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-blue-500/20 p-6 justify-between group">
            {isEditMode && onRemove && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="absolute top-4 right-4 z-50 p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                    <X size={14} />
                </button>
            )}

            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-5xl font-black text-white tracking-tighter italic">{temperature}°</span>
                    <span className="text-sm font-bold text-blue-300 mt-1 uppercase tracking-widest opacity-80">{condition.replace(/_/g, ' ')}</span>
                </div>
                <motion.div
                    animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.4)]"
                >
                    {getWeatherIcon(condition)}
                </motion.div>
            </div>

            <div className="flex items-center gap-4 bg-black/20 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-blue-200">
                    <Droplets size={16} className="text-cyan-400" />
                    <span className="text-xs font-black uppercase tracking-widest">{humidity}%</span>
                </div>
                <div className="w-[1px] h-4 bg-white/10" />
                <div className="flex items-center gap-2 text-blue-200">
                    <Wind size={16} className="text-blue-400" />
                    <span className="text-xs font-black uppercase tracking-widest">{windSpeed} <span className="text-[8px] opacity-60">km/h</span></span>
                </div>
            </div>
        </div>
    );
};
