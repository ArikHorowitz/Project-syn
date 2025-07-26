import React, { useState, useRef, useEffect } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Part } from '../../types';
import ChapterItem from './ChapterItem';
import { ChevronRight, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';

interface PartItemProps {
  part: Part;
}

const PartItem: React.FC<PartItemProps> = ({ part }) => {
  const { workspace, actions } = useWorkspace();
  const isRenaming = workspace?.uiState.renamingId === part.id;
  const [isOpen, setIsOpen] = useState(true);
  const [localTitle, setLocalTitle] = useState(part.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: part.id, disabled: isRenaming, resizeObserverConfig: {} });

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleRename = () => {
    if (localTitle.trim()) {
      actions.updateItemName(part.id, localTitle);
    } else {
      setLocalTitle(part.title); // revert
    }
    actions.setRenamingId(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleRename();
    if (e.key === 'Escape') {
      setLocalTitle(part.title);
      actions.setRenamingId(null);
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="group w-full flex items-center gap-1 text-left p-1 rounded hover:bg-zinc-800">
        <button {...attributes} {...listeners} className="cursor-grab p-1 text-zinc-500 hover:text-zinc-200" disabled={isRenaming}>
          <GripVertical size={16} />
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1"
          disabled={isRenaming}
        >
          <ChevronRight size={16} className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </button>
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-sky-900/50 text-sky-200 text-xs font-bold uppercase tracking-wider focus:outline-none px-1 py-0.5 rounded"
          />
        ) : (
          <span 
            onDoubleClick={() => actions.setRenamingId(part.id)}
            className="font-bold text-xs uppercase tracking-wider text-zinc-400 flex-grow cursor-pointer"
          >
            {part.title}
          </span>
        )}
        <div className={`flex items-center gap-1 transition-opacity ${isRenaming ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
            <button onClick={() => actions.addChapter(part.id)} className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md">
                <Plus size={14} />
            </button>
             <button onClick={() => actions.deletePart(part.id)} className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-md">
                <Trash2 size={14} />
            </button>
        </div>
      </div>
      {isOpen && (
        <div className="pl-4 mt-1 space-y-0.5 border-l border-zinc-800 ml-3">
            <SortableContext items={part.chapters.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {part.chapters.map((chapter) => (
                    <ChapterItem key={chapter.id} chapter={chapter} />
                ))}
            </SortableContext>
        </div>
      )}
    </div>
  );
};

export default PartItem;