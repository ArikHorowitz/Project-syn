import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useWorkspace } from '../../hooks/useWorkspace';
import { Chapter, ChapterStatus } from '../../types';
import { FileText, GripVertical, Trash2 } from 'lucide-react';

interface ChapterItemProps {
  chapter: Chapter;
}

const statusOptions: ChapterStatus[] = ['idea', 'draft', 'review', 'done'];
const statusText: Record<ChapterStatus, string> = {
  idea: 'Idea',
  draft: 'Draft',
  review: 'In Review',
  done: 'Done',
};

const countWords = (htmlContent: string): number => {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = htmlContent;
    const text = tempEl.textContent || '';
    return text.trim().split(/\s+/).filter(Boolean).length;
}

const ChapterItem: React.FC<ChapterItemProps> = ({ chapter }) => {
  const { workspace, actions } = useWorkspace();
  const activeGroupId = workspace?.uiState.activeGroupId;
  const isActive = workspace?.uiState.tabGroups?.find(g => g.id === activeGroupId)?.activeTabId === chapter.id;
  const isRenaming = workspace?.uiState.renamingId === chapter.id;
  const [localTitle, setLocalTitle] = useState(chapter.title);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  const wordCount = useMemo(() => countWords(chapter.content), [chapter.content]);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: chapter.id, disabled: isRenaming, resizeObserverConfig: {} });

  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `chapter-drop-${chapter.id}`,
  });

  const setNodeRef = (node: HTMLElement | null) => {
    setSortableNodeRef(node);
    setDroppableNodeRef(node);
  }

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setIsStatusMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleOpenChapter = () => {
    actions.openChapter(chapter.id);
  };
  
  const handleRename = () => {
    if (localTitle.trim()) {
      actions.updateItemName(chapter.id, localTitle);
    } else {
      setLocalTitle(chapter.title);
    }
    actions.setRenamingId(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleRename();
    if (e.key === 'Escape') {
      setLocalTitle(chapter.title);
      actions.setRenamingId(null);
    }
  };

  const handleStatusChange = (newStatus: ChapterStatus) => {
    actions.updateChapterStatus(chapter.id, newStatus);
    setIsStatusMenuOpen(false);
  };

  const itemClasses = [
    'group w-full flex items-center gap-2 rounded text-sm text-left ml-2',
    isActive && !isRenaming ? 'bg-sky-900/50 text-sky-200' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
    isOver ? 'drop-target-active' : ''
  ].join(' ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={itemClasses}
    >
      <div {...attributes} {...listeners} className="cursor-grab p-1 text-zinc-500 group-hover:text-zinc-200"
        aria-disabled={isRenaming}
        style={{ touchAction: isRenaming ? 'none' : 'auto' }}
      >
        <GripVertical size={16} />
      </div>

      <div className="flex-grow flex items-center gap-2 rounded relative min-w-0">
        <div className="relative">
          <button 
            onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
            className="flex-shrink-0"
            aria-label={`Change status for ${chapter.title}, current status: ${chapter.status}`}
          >
            <div className={`status-dot status-dot-${chapter.status}`} />
          </button>
          {isStatusMenuOpen && (
            <div ref={statusMenuRef} className="absolute top-full mt-2 left-0 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg p-1 z-20 w-32">
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-zinc-700 text-zinc-300 text-sm"
                >
                  <div className={`status-dot status-dot-${status}`} />
                  <span>{statusText[status]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <FileText size={14} className="flex-shrink-0" />
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="w-full bg-sky-900/50 text-sky-200 focus:outline-none px-1 py-0.5 rounded"
          />
        ) : (
          <button
            onClick={handleOpenChapter}
            onDoubleClick={() => actions.setRenamingId(chapter.id)}
            className="flex-1 text-left truncate"
          >
            {chapter.title}
          </button>
        )}
      </div>
      <span className="text-xs text-zinc-500 pr-1">{wordCount}</span>
      <div className={`transition-opacity ${isRenaming ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
        <button onClick={() => actions.deleteChapter(chapter.id)} className="p-1 text-zinc-500 hover:text-red-400 hover:bg-zinc-700 rounded-md">
            <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default ChapterItem;