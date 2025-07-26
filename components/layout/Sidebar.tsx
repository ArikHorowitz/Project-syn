import React from 'react';
import StructureView from '../structure/StructureView';
import { useWorkspace } from '../../hooks/useWorkspace';
import { PlusSquare } from 'lucide-react';
import SearchView from '../search/SearchView';
import HistoryView from '../history/HistoryView';

const Sidebar: React.FC = () => {
  const { workspace, actions } = useWorkspace();
  const sidebarView = workspace?.uiState.sidebarView ?? 'explorer';

  const renderView = () => {
    switch (sidebarView) {
      case 'explorer':
        return <StructureView />;
      case 'search':
        return <SearchView />;
      case 'history':
        return <HistoryView />;
      default:
        return <StructureView />;
    }
  };
  
  const getHeaderTitle = () => {
    switch(sidebarView) {
      case 'explorer': return 'Explorer';
      case 'search': return 'Search';
      case 'history': return 'Local History';
      default: return 'Explorer';
    }
  }

  return (
    <aside className="w-64 min-w-64 bg-zinc-900/80 border-r border-zinc-800 flex flex-col">
      <div className="p-2 border-b border-zinc-800 flex items-center justify-between h-9">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          {getHeaderTitle()}
        </h2>
        {sidebarView === 'explorer' && (
          <button 
            onClick={actions.addPart}
            aria-label="New Part"
            className="p-1 rounded-md text-zinc-400 hover:bg-zinc-700 hover:text-white"
          >
            <PlusSquare size={16} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {renderView()}
      </div>
    </aside>
  );
};

export default Sidebar;
