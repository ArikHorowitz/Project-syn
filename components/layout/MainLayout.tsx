import React, { useEffect } from 'react';
import ActivityBar from './ActivityBar';
import Sidebar from './Sidebar';
import MainPanel from './MainPanel';
import StatusBar from './StatusBar';
import BottomPanel from './BottomPanel';
import { useWorkspace } from '../../hooks/useWorkspace';
import RightSidebar from './RightSidebar';
import CommandPalette from '../command/CommandPalette';
import SettingsModal from '../settings/SettingsModal';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Toc } from '../../types';

const MainLayout: React.FC = () => {
  const { workspace, actions } = useWorkspace();
  const bottomPanelOpen = workspace?.uiState.bottomPanelOpen ?? false;
  const inspectorOpen = workspace?.uiState.inspectorOpen ?? false;
  const commandPaletteOpen = workspace?.uiState.commandPaletteOpen ?? false;
  const settingsOpen = workspace?.uiState.settingsOpen ?? false;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        actions.toggleCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [actions]);
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !workspace) return;
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    // Scenario 1: Linking a fragment to a chapter
    if (activeId.startsWith('fragment-drag-') && overId.startsWith('chapter-drop-')) {
        const fragmentId = activeId.replace('fragment-drag-', '');
        const chapterId = overId.replace('chapter-drop-', '');
        actions.linkFragmentToChapter(fragmentId, chapterId);
        return;
    }

    // Scenario 2: Reordering the Table of Contents
    if (active.id === over.id) return;
    
    const oldToc = workspace.toc;
    let newToc: Toc;

    const isPartDrag = activeId.startsWith('part-');

    if (isPartDrag) {
      // Reordering parts
      const activeIndex = oldToc.findIndex(p => p.id === activeId);
      const overIndex = oldToc.findIndex(p => p.id === overId);
      newToc = arrayMove(oldToc, activeIndex, overIndex);
    } else {
      // Reordering chapters
      const activePartIndex = oldToc.findIndex(p => p.chapters.some(c => c.id === activeId));
      const overPartIndex = oldToc.findIndex(p => p.chapters.some(c => c.id === overId) || p.id === overId);

      if(activePartIndex === -1 || overPartIndex === -1) return;

      const activeChapterIndex = oldToc[activePartIndex].chapters.findIndex(c => c.id === activeId);
      
      if (activePartIndex === overPartIndex) {
         // Moving within the same part
        const overChapterIndex = oldToc[overPartIndex].chapters.findIndex(c => c.id === overId);
        newToc = [...oldToc];
        newToc[activePartIndex] = {
            ...newToc[activePartIndex],
            chapters: arrayMove(newToc[activePartIndex].chapters, activeChapterIndex, overChapterIndex)
        };
      } else {
         // Moving between different parts
         const [movedChapter] = oldToc[activePartIndex].chapters.splice(activeChapterIndex, 1);
         const overChapterIndex = oldToc[overPartIndex].chapters.findIndex(c => c.id === overId);
         
         if (overChapterIndex !== -1) {
            oldToc[overPartIndex].chapters.splice(overChapterIndex, 0, movedChapter);
         } else {
            // Dropping on a part, not a chapter
             oldToc[overPartIndex].chapters.push(movedChapter);
         }
         newToc = [...oldToc];
      }
    }
    actions.updateToc(newToc);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="h-screen w-screen flex flex-col bg-zinc-900 overflow-hidden">
        {commandPaletteOpen && <CommandPalette />}
        {settingsOpen && <SettingsModal />}
        <div className="flex flex-1 min-h-0">
            <ActivityBar />
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0">
            <MainPanel />
            {bottomPanelOpen && <BottomPanel />}
            </div>
            {inspectorOpen && <RightSidebar />}
        </div>
        <StatusBar />
        </div>
    </DndContext>
  );
};

export default MainLayout;