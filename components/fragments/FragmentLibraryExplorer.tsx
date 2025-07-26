import React, { useMemo } from 'react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { GripVertical, PanelTopClose, Plus, Trash2, XCircle } from 'lucide-react';
import { Fragment } from '../../types';
import { useDraggable } from '@dnd-kit/core';

const FragmentLibraryExplorer: React.FC = () => {
    const { workspace, actions } = useWorkspace();
    const fragments = workspace?.fragments ?? [];
    const activeTags = workspace?.uiState.activeFragmentTags ?? [];

    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        fragments.forEach(fragment => {
            fragment.tags.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }, [fragments]);

    const filteredFragments = useMemo(() => {
        if (activeTags.length === 0) return fragments;
        return fragments.filter(fragment => 
            activeTags.every(activeTag => fragment.tags.includes(activeTag))
        );
    }, [fragments, activeTags]);


    return (
        <div className="h-full flex flex-col text-zinc-400">
            <div className="flex items-center justify-between p-2 border-b border-zinc-800 flex-shrink-0">
                 <h3 className="font-bold text-sm uppercase">Fragment Library</h3>
                 <div className="flex items-center gap-2">
                    <button onClick={actions.addFragment} className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sm">
                        <Plus size={16}/>
                        New Fragment
                    </button>
                    <button onClick={actions.toggleBottomPanel} className="p-1 rounded-md hover:bg-zinc-700">
                        <PanelTopClose size={16}/>
                    </button>
                 </div>
            </div>
            {allTags.length > 0 && (
                <div className="p-2 border-b border-zinc-800 flex flex-wrap gap-2 items-center">
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => actions.toggleFragmentTagFilter(tag)}
                            className={`px-2 py-0.5 text-xs rounded-full border ${activeTags.includes(tag) ? 'tag-filter-active' : 'border-zinc-600 bg-zinc-700/50 hover:bg-zinc-700'}`}
                        >
                           {tag}
                        </button>
                    ))}
                    {activeTags.length > 0 && (
                        <button onClick={actions.clearFragmentTagFilters} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white">
                            <XCircle size={14} />
                            Clear
                        </button>
                    )}
                </div>
            )}
            <div className="p-2 flex-1 overflow-y-auto">
                {filteredFragments.length > 0 ? (
                    <div className="space-y-2">
                        {filteredFragments.map(fragment => (
                            <FragmentItem 
                                key={fragment.id} 
                                fragment={fragment}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-zinc-500 text-sm">
                        No fragments found.
                    </div>
                )}
            </div>
        </div>
    );
};


interface FragmentItemProps {
    fragment: Fragment;
}

const FragmentItem: React.FC<FragmentItemProps> = ({ fragment }) => {
    const { workspace, actions } = useWorkspace();
    const activeGroupId = workspace?.uiState.activeGroupId;
    const isActive = workspace?.uiState.tabGroups?.find(g => g.id === activeGroupId)?.activeTabId === fragment.id;

    const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
        id: `fragment-drag-${fragment.id}`,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 100, // Ensure it appears above other elements while dragging
        opacity: isDragging ? 0.5 : 1, 
    } : undefined;

    // Create a plain text preview
    const tempEl = document.createElement('div');
    tempEl.innerHTML = fragment.content;
    const preview = tempEl.textContent || '';


    return (
        <div ref={setNodeRef} style={style}>
            <div 
                className={`group flex items-center gap-1 rounded-md text-sm relative ${isActive ? 'bg-sky-900/40' : 'bg-zinc-800/50 hover:bg-zinc-800'}`}
            >
                {/* Drag Handle */}
                <div 
                    {...listeners} 
                    {...attributes} 
                    className="flex-shrink-0 cursor-grab p-3 self-stretch flex items-center text-zinc-500 group-hover:text-zinc-200" 
                    aria-label={`Drag fragment: ${preview.substring(0,20)}...`}
                >
                    <GripVertical size={16} />
                </div>

                {/* Clickable Content Area */}
                <div 
                    onClick={() => actions.openFragment(fragment.id)}
                    className="flex-1 cursor-pointer overflow-hidden py-3 pr-10"
                >
                    <p className="line-clamp-2 text-zinc-300">{preview}</p>
                    <div className="text-zinc-500 mt-2 flex items-center gap-2 text-xs">
                        <span>{fragment.type}</span>
                        <span className="text-zinc-600">•</span>
                        <span>{new Date(fragment.updatedAt).toLocaleDateString()}</span>
                    </div>
                </div>
                
                {/* Delete button */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        actions.deleteFragment(fragment.id);
                    }} 
                    className="absolute top-2 right-2 p-1 rounded-md text-zinc-500 opacity-0 group-hover:opacity-100 hover:bg-red-900/50 hover:text-red-300"
                >
                    <Trash2 size={14}/>
                </button>
            </div>
        </div>
    )
}

export default FragmentLibraryExplorer;