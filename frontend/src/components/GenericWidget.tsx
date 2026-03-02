import React from 'react';
import { useDashboardStore } from '../store/useStore';
import { LightWidget } from './widgets/LightWidget';
import { SwitchWidget } from './widgets/SwitchWidget';
import { AirWidget } from './widgets/AirWidget';
import { SensorWidget } from './widgets/SensorWidget';
import { MotionWidget } from './widgets/MotionWidget';

interface GenericWidgetProps {
    id: string;
    entityId: string;
    type: 'light' | 'sensor' | 'switch' | 'generic';
    isEditMode: boolean;
}

export const GenericWidget: React.FC<GenericWidgetProps> = ({ id, entityId, type: _type, isEditMode }) => {
    const { removeWidget } = useDashboardStore();

    const domain = entityId.split('.')[0];
    const onRemove = () => removeWidget(id);

    // Dispatcher logic
    if (domain === 'light') return <LightWidget id={id} entityId={entityId} onRemove={onRemove} isEditMode={isEditMode} />;
    if (domain === 'switch') return <SwitchWidget id={id} entityId={entityId} onRemove={onRemove} isEditMode={isEditMode} />;
    if (domain === 'climate') return <AirWidget id={id} entityId={entityId} onRemove={onRemove} isEditMode={isEditMode} />;
    if (domain === 'sensor') return <SensorWidget id={id} entityId={entityId} onRemove={onRemove} isEditMode={isEditMode} />;
    if (domain === 'binary_sensor' && (entityId.includes('motion') || entityId.includes('presence'))) {
        return <MotionWidget id={id} entityId={entityId} onRemove={onRemove} isEditMode={isEditMode} />;
    }

    // Fallback for generic or unknown
    return (
        <div className="h-full bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-gray-700/50 flex flex-col items-center justify-center p-4 group">
            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{domain}</span>
            <span className="text-white text-xs text-center font-bold px-4 truncate w-full">{entityId}</span>
            {isEditMode && (
                <button
                    onClick={onRemove}
                    className="mt-4 text-[10px] font-black text-gray-600 hover:text-red-400 uppercase tracking-widest transition-colors"
                >
                    Remove Widget
                </button>
            )}
        </div>
    );
};
