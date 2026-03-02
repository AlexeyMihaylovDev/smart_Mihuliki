import React from 'react';
import { useHAStore } from '../../store/useStore';
import { Power, X, Snowflake, Flame, Droplets, Fan, Sparkles, Thermometer, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AirWidgetProps {
    id: string;
    entityId: string;
    onRemove: () => void;
    isEditMode: boolean;
}

export const AirWidget: React.FC<AirWidgetProps> = ({ id, entityId, onRemove, isEditMode }) => {
    const { entities, connection } = useHAStore();
    const entity = entities ? (entities[entityId] as any) : null;

    if (!entity) return null;

    const state = entity.state;
    // Handle different climate attribute naming schemes
    const temperature = entity.attributes.temperature ?? entity.attributes.target_temp ?? entity.attributes.target_temperature ?? 0;
    const current_temperature = entity.attributes.current_temperature ?? entity.attributes.current_temp ?? 0;
    const { min_temp = 16, max_temp = 30, friendly_name } = entity.attributes;
    const name = friendly_name || entityId;

    // Маппинг цветов и стилей для разных режимов
    const styleMap: Record<string, any> = {
        cool: { color: '#22d3ee', twText: 'text-cyan-400', twBg: 'bg-cyan-500', from: 'from-cyan-500/15', label: 'Охлаждение' },
        heat: { color: '#f97316', twText: 'text-orange-500', twBg: 'bg-orange-500', from: 'from-orange-500/15', label: 'Обогрев' },
        dry: { color: '#2dd4bf', twText: 'text-teal-400', twBg: 'bg-teal-500', from: 'from-teal-500/15', label: 'Осушение' },
        fan_only: { color: '#10b981', twText: 'text-emerald-400', twBg: 'bg-emerald-500', from: 'from-emerald-500/15', label: 'Вентиляция' },
        auto: { color: '#a855f7', twText: 'text-purple-400', twBg: 'bg-purple-500', from: 'from-purple-500/15', label: 'Авто' },
        off: { color: '#525252', twText: 'text-neutral-500', twBg: 'bg-neutral-600', from: 'from-transparent', label: 'Выключен' }
    };

    const currentStyle = styleMap[state] || styleMap.off;
    const isOn = state !== 'off';

    // Действия
    const setTemp = async (delta: number) => {
        if (!connection || !isOn) return;
        const newTemp = Math.max(min_temp, Math.min(max_temp, temperature + delta));
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
        connection.sendMessagePromise({
            type: 'call_service',
            domain: 'climate',
            service: 'set_temperature',
            service_data: { temperature: newTemp },
            target: { entity_id: entityId }
        });
    };

    const setMode = async (mode: string) => {
        if (!connection) return;
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
        connection.sendMessagePromise({
            type: 'call_service',
            domain: 'climate',
            service: 'set_hvac_mode',
            service_data: { hvac_mode: mode },
            target: { entity_id: entityId }
        });
    };

    const togglePower = () => setMode(isOn ? 'off' : 'cool'); // Включаем охлаждение по умолчанию

    // Математика для круговой шкалы SVG (270 градусов, зазор внизу)
    const radius = 78;
    const circumference = 2 * Math.PI * radius; // ~490.09
    const arcLength = (270 / 360) * circumference; // ~367.56

    const calcPercent = (val: number) => Math.max(0, Math.min(1, (val - min_temp) / (max_temp - min_temp)));

    const tempPercent = calcPercent(temperature);
    const valueLength = isOn ? tempPercent * arcLength : 0;

    // Координаты для ручек на круге
    const getCoordinates = (percent: number) => {
        const angle = 135 + (270 * percent);
        const rad = angle * (Math.PI / 180);
        return {
            x: 100 + radius * Math.cos(rad),
            y: 100 + radius * Math.sin(rad)
        };
    };

    const handlePos = getCoordinates(tempPercent);
    const currTempPos = getCoordinates(calcPercent(current_temperature));

    // Разделение целой и дробной части температуры для красивого рендера
    const tempInt = Math.floor(temperature);
    const tempFrac = (temperature % 1).toFixed(1).substring(1);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`relative flex flex-col h-full sm:col-span-2 md:col-span-1 w-full bg-neutral-900/60 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden transition-all duration-700 group border ${isOn ? `shadow-[0_8px_32px_-10px_rgba(34,211,238,0.25)] border-cyan-500/30` : 'shadow-2xl border-white/5'
                }`}
        >
            {/* Мягкое фоновое свечение */}
            <AnimatePresence>
                {isOn && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className={`absolute inset-0 bg-gradient-to-br ${currentStyle.from} via-transparent to-transparent pointer-events-none`}
                    />
                )}
            </AnimatePresence>

            {/* HEADER */}
            <div className="relative z-10 p-5 flex items-start justify-between drag-handle cursor-move">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{
                            backgroundColor: isOn ? `${currentStyle.color}25` : 'rgba(255, 255, 255, 0.05)',
                            color: isOn ? currentStyle.color : '#a3a3a3'
                        }}
                        className="p-2.5 rounded-2xl backdrop-blur-md"
                    >
                        <Thermometer size={18} />
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">Climate</span>
                        <span className="text-sm font-medium text-neutral-100 truncate max-w-[150px] leading-tight">{name}</span>
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

            {/* MAIN ARC DISPLAY */}
            <div className="relative z-10 flex-grow flex flex-col items-center justify-start -mt-2">
                <div className="relative w-[220px] h-[220px] flex items-center justify-center">
                    {/* SVG Circular Slider */}
                    <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full drop-shadow-xl">
                        {/* Фоновая серая дуга */}
                        <circle
                            cx="100" cy="100" r={radius}
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="10"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${arcLength} 1000`}
                            transform="rotate(135 100 100)"
                        />

                        {/* Заполненная цветная дуга */}
                        {isOn && (
                            <motion.circle
                                cx="100" cy="100" r={radius}
                                stroke={currentStyle.color}
                                strokeWidth="10"
                                fill="none"
                                strokeLinecap="round"
                                transform="rotate(135 100 100)"
                                initial={{ strokeDasharray: `0 1000` }}
                                animate={{ strokeDasharray: `${valueLength} 1000` }}
                                transition={{ type: "spring", stiffness: 60, damping: 15 }}
                                style={{ filter: `drop-shadow(0 0 8px ${currentStyle.color}60)` }}
                            />
                        )}

                        {/* Точка текущей (комнатной) температуры */}
                        <motion.circle
                            cx={currTempPos.x} cy={currTempPos.y} r="4"
                            fill="#9ca3af" // neutral-400
                            initial={false}
                            animate={{ cx: currTempPos.x, cy: currTempPos.y }}
                            transition={{ type: "spring", stiffness: 60, damping: 15 }}
                        />

                        {/* Ручка (handle) выбранной температуры */}
                        {isOn && (
                            <motion.circle
                                cx={handlePos.x} cy={handlePos.y} r="8"
                                fill="#fff"
                                stroke={currentStyle.color}
                                strokeWidth="3"
                                initial={false}
                                animate={{ cx: handlePos.x, cy: handlePos.y }}
                                transition={{ type: "spring", stiffness: 60, damping: 15 }}
                                style={{ filter: `drop-shadow(0 0 5px rgba(0,0,0,0.5))` }}
                            />
                        )}
                    </svg>

                    {/* Текст в центре круга */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                        <motion.span
                            animate={{ color: isOn ? '#e5e7eb' : '#737373' }}
                            className="text-xs font-semibold tracking-wide mb-1"
                        >
                            {currentStyle.label}
                        </motion.span>

                        <div className="flex items-start">
                            <span className={`text-6xl font-black tracking-tighter tabular-nums ${isOn ? 'text-white' : 'text-neutral-600'}`}>
                                {isOn ? tempInt : '--'}
                            </span>
                            {isOn && (
                                <div className="flex flex-col ml-1 mt-1">
                                    <span className="text-xl font-bold text-neutral-300 tabular-nums">{tempFrac}</span>
                                    <span className="text-lg font-medium text-neutral-500 leading-none">°C</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-2 text-neutral-400">
                            <Thermometer size={12} className="opacity-70" />
                            <span className="text-sm font-semibold tabular-nums">{current_temperature} °C</span>
                        </div>
                    </div>

                    {/* Кнопки + и - (встроены в нижний зазор круга) */}
                    <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-6">
                        <motion.button
                            whileHover={isOn ? { scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' } : {}}
                            whileTap={isOn ? { scale: 0.9 } : {}}
                            onClick={() => setTemp(-0.5)}
                            disabled={!isOn}
                            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-colors ${isOn ? 'border-white/10 text-white bg-neutral-800/50 shadow-lg' : 'border-neutral-800 text-neutral-700 bg-neutral-900/50 cursor-not-allowed'
                                }`}
                        >
                            <Minus size={22} strokeWidth={2.5} />
                        </motion.button>
                        <motion.button
                            whileHover={isOn ? { scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' } : {}}
                            whileTap={isOn ? { scale: 0.9 } : {}}
                            onClick={() => setTemp(0.5)}
                            disabled={!isOn}
                            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-colors ${isOn ? 'border-white/10 text-white bg-neutral-800/50 shadow-lg' : 'border-neutral-800 text-neutral-700 bg-neutral-900/50 cursor-not-allowed'
                                }`}
                        >
                            <Plus size={22} strokeWidth={2.5} />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* DOCK BAR (Режимы и Питание) */}
            <div className="relative z-10 mx-5 mb-5 mt-4 p-1.5 bg-neutral-950/60 border border-white/5 rounded-2xl shadow-inner flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-1 px-1">
                    {[
                        { mode: 'cool', Icon: Snowflake },
                        { mode: 'heat', Icon: Flame },
                        { mode: 'dry', Icon: Droplets },
                        { mode: 'fan_only', Icon: Fan },
                        { mode: 'auto', Icon: Sparkles },
                    ].map(({ mode, Icon }) => {
                        const isActive = state === mode;
                        const activeStyle = styleMap[mode];
                        return (
                            <button
                                key={mode}
                                onClick={() => setMode(mode)}
                                className={`relative p-2.5 rounded-xl transition-all duration-300 ${isActive ? `${activeStyle.twText}` : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId={`mode-bg-${id}`}
                                        className="absolute inset-0 rounded-xl bg-white/10 border border-white/5 shadow-sm"
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    />
                                )}
                                <span className="relative z-10">
                                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Разделитель */}
                <div className="w-[1px] h-8 bg-white/10 mx-1" />

                <button
                    onClick={togglePower}
                    className={`p-2.5 px-4 mr-1 rounded-xl transition-all duration-300 flex items-center justify-center ${isOn
                        ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-white/10 shadow-md'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        }`}
                >
                    <Power size={18} strokeWidth={2.5} className={!isOn ? 'mr-1.5' : ''} />
                    {!isOn && <span className="text-xs font-bold uppercase tracking-wider">On</span>}
                </button>
            </div>
        </motion.div>
    );
};
