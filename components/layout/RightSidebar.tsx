import React from 'react';
import InspectorView from '../inspector/InspectorView';
import { X } from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';

const RightSidebar: React.FC = () => {
  const { actions } = useWorkspace();
  return (
    <aside className="w-80 min-w-80 bg-zinc-900/80 border-l border-zinc-800 flex flex-col">
       <div className="p-2 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Inspector</h2>
         <button onClick={actions.toggleInspector} className="p-1 rounded-md hover:bg-zinc-700">
            <X size={16}/>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <InspectorView />
      </div>
    </aside>
  );
};

export default RightSidebar;
