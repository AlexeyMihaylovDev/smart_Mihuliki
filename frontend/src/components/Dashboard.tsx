import React, { useState } from 'react';
import { Layout, Responsive, WidthProvider } from 'react-grid-layout';
const ResponsiveGridLayout = WidthProvider(Responsive);
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDashboardStore } from '../store/useStore';
import { GenericWidget } from './GenericWidget';
import { WidgetSelector } from './WidgetSelector';
import { Plus, Settings2, Layout as LayoutIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
    const { widgets, layout, updateLayout } = useDashboardStore();
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const onLayoutChange = (newLayout: Layout[]) => {
        updateLayout(newLayout);
    };

    return (
        <div className="w-full h-full pb-32">
            <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center space-x-2 text-gray-400">
                    <LayoutIcon size={18} />
                    <span className="text-sm font-medium">
                        {widgets.length} Widgets Active
                    </span>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition ${isEditMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                            }`}
                    >
                        <Settings2 size={16} />
                        <span>{isEditMode ? 'Done' : 'Edit Layout'}</span>
                    </button>
                    <button
                        onClick={() => setIsSelectorOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-blue-500/20"
                    >
                        <Plus size={16} />
                        <span>Add Widget</span>
                    </button>
                </div>
            </div>

            <WidgetSelector isOpen={isSelectorOpen} onClose={() => setIsSelectorOpen(false)} />

            <motion.div
                layout
                className="relative min-h-[400px]"
            >
                {widgets.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 space-y-4">
                        <div className="p-6 bg-gray-800/50 rounded-full">
                            <Plus size={48} className="opacity-20" />
                        </div>
                        <p>No widgets added yet. Click "Add Widget" to start.</p>
                    </div>
                ) : (
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={{ lg: layout }}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        rowHeight={80}
                        onLayoutChange={(_currentLayout, allLayouts) => onLayoutChange(allLayouts.lg)}
                        draggableHandle=".drag-handle"
                        isDraggable={isEditMode}
                        isResizable={isEditMode}
                        margin={[16, 16]}
                    >
                        {widgets.map((widget) => (
                            <div key={widget.id}>
                                <GenericWidget
                                    id={widget.id}
                                    entityId={widget.entityId}
                                    type={widget.type}
                                    isEditMode={isEditMode}
                                />
                                {isEditMode && (
                                    <div className="absolute -top-1 -right-1 z-10">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </ResponsiveGridLayout>
                )}
            </motion.div>
        </div>
    );
};
