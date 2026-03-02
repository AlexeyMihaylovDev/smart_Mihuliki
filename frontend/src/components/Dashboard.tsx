import React, { useState, useMemo } from 'react';
import { Layout, Responsive, WidthProvider } from 'react-grid-layout';
const ResponsiveGridLayout = WidthProvider(Responsive);
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDashboardStore } from '../store/useStore';
import { GenericWidget } from './GenericWidget';
import { WidgetSelector } from './WidgetSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Edit3, Check, Layout as LayoutIcon, PlusCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const {
        pages,
        activePageId,
        setActivePage,
        addPage,
        removePage,
        renamePage,
        updateLayout,
        removeWidget,
        fetchConfig
    } = useDashboardStore();

    const [isEditMode, setIsEditMode] = useState(false);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    React.useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const activePage = useMemo(() =>
        pages.find(p => p.id === activePageId) || pages[0],
        [pages, activePageId]);

    const handleLayoutChange = (_currentLayout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
        if (isEditMode && allLayouts.lg) {
            updateLayout(allLayouts.lg);
        }
    };

    const handleAddPage = () => {
        const name = prompt('Enter page name:', 'New Page');
        if (name) addPage(name);
    };

    const handleRenamePage = (id: string, oldName: string) => {
        const name = prompt('Rename page:', oldName);
        if (name) renamePage(id, name);
    };

    if (!activePage) return null;

    return (
        <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden pb-10">
            {/* Control Bar & Tabs */}
            <div className="flex flex-col border-b border-white/5 bg-black/40 backdrop-blur-3xl z-40 shadow-2xl">
                <div className="flex items-center justify-between px-8 py-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-500/20 rounded-2xl">
                                <LayoutIcon size={24} className="text-blue-400" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">Smart Dash</h1>
                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Control Center</span>
                            </div>
                        </div>

                        {/* Page Tabs */}
                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5 max-w-2xl overflow-x-auto no-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {pages.map(page => (
                                    <motion.button
                                        key={page.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={() => setActivePage(page.id)}
                                        onDoubleClick={() => isEditMode && handleRenamePage(page.id, page.name)}
                                        className={`group relative px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap overflow-visible ${activePageId === page.id
                                            ? 'text-white'
                                            : 'text-neutral-500 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="relative z-10">{page.name}</span>
                                        {isEditMode && pages.length > 1 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removePage(page.id); }}
                                                className="relative z-10 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-md text-red-400 transition-all ml-1"
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                        {activePageId === page.id && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                            <button
                                onClick={handleAddPage}
                                className="p-2.5 text-neutral-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                title="Add Page"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSelectorOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
                        >
                            <Plus size={16} />
                            Add Widget
                        </button>
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isEditMode
                                ? 'bg-emerald-500 text-neutral-900 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                : 'bg-white/5 text-neutral-400 hover:bg-white/10 border border-white/5'
                                }`}
                        >
                            {isEditMode ? <Check size={16} /> : <Edit3 size={16} />}
                            {isEditMode ? 'Done' : 'Edit'}
                        </button>
                    </div>
                </div>
            </div>

            <WidgetSelector isOpen={isSelectorOpen} onClose={() => setIsSelectorOpen(false)} />

            {/* Dashboard Content */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-8 relative no-scrollbar">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activePageId}
                        initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="min-h-full"
                    >
                        {activePage.widgets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-neutral-600 gap-4">
                                <div className="p-8 bg-white/5 rounded-[3.5rem] border border-white/5 animate-pulse">
                                    <PlusCircle size={64} strokeWidth={1} className="opacity-20" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-neutral-400 tracking-tight">Empty Workspace</p>
                                    <p className="text-sm opacity-60">This page doesn't have any widgets yet</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveGridLayout
                                className="layout"
                                layouts={{ lg: activePage.layout }}
                                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                                rowHeight={30}
                                draggableHandle=".drag-handle"
                                isDraggable={isEditMode}
                                isResizable={isEditMode}
                                onLayoutChange={handleLayoutChange}
                                margin={[20, 20]}
                            >
                                {activePage.widgets.map((widget) => (
                                    <div key={widget.id} className="relative group overflow-visible">
                                        <GenericWidget
                                            id={widget.id}
                                            entityId={widget.entityId}
                                            entityIds={widget.entityIds}
                                            title={widget.title}
                                            type={widget.type}
                                            isEditMode={isEditMode}
                                            onRemove={() => removeWidget(widget.id)}
                                        />

                                        {isEditMode && (
                                            <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none border-2 border-blue-500/0 group-hover:border-blue-500/30 rounded-[2.5rem] transition-all" />
                                        )}
                                    </div>
                                ))}
                            </ResponsiveGridLayout>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
