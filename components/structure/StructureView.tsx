import React, { useEffect } from 'react';
import { useWorkspace } from '../../hooks/useWorkspace';
import PartItem from './PartItem';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const StructureView: React.FC = () => {
  const { workspace, actions } = useWorkspace();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        actions.setRenamingId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);


  if (!workspace) return null;

  return (
    <SortableContext items={workspace.toc.map(p => p.id)} strategy={verticalListSortingStrategy}>
      <nav className="p-2 space-y-2">
        {workspace.toc.map((part) => (
          <PartItem key={part.id} part={part} />
        ))}
      </nav>
    </SortableContext>
  );
};

export default StructureView;