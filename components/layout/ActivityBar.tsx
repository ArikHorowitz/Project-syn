import React from 'react';
import { Files, Search, GitMerge, Settings, Pencil, Info } from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';

const ActivityBar: React.FC = () => {
  const { workspace, actions } = useWorkspace();
  const bottomPanelOpen = workspace?.uiState.bottomPanelOpen ?? false;
  const inspectorOpen = workspace?.uiState.inspectorOpen ?? false;
  const sidebarView = workspace?.uiState.sidebarView ?? 'explorer';
  const settingsOpen = workspace?.uiState.settingsOpen ?? false;

  return (
    <div className="w-12 bg-zinc-950/70 border-r border-zinc-800 flex flex-col items-center justify-between py-4 z-10">
      <div className="flex flex-col items-center gap-6">
        <ActivityIcon 
            icon={Files} 
            label="Explorer" 
            active={sidebarView === 'explorer'} 
            onClick={() => actions.setSidebarView('explorer')}
        />
        <ActivityIcon 
            icon={Search} 
            label="Search" 
            active={sidebarView === 'search'}
            onClick={() => actions.setSidebarView('search')}
        />
        <ActivityIcon icon={Pencil} label="Fragments" active={bottomPanelOpen} onClick={actions.toggleBottomPanel} />
        <ActivityIcon icon={Info} label="Inspector" active={inspectorOpen} onClick={actions.toggleInspector} />
      </div>
      <div className="flex flex-col items-center gap-6">
         <ActivityIcon 
            icon={GitMerge} 
            label="Local History" 
            active={sidebarView === 'history'}
            onClick={() => actions.setSidebarView('history')}
         />
        <ActivityIcon icon={Settings} label="Settings" active={settingsOpen} onClick={actions.toggleSettings}/>
      </div>
    </div>
  );
};

interface ActivityIconProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const ActivityIcon: React.FC<ActivityIconProps> = ({ icon: Icon, label, active = false, onClick }) => (
  <button
    aria-label={label}
    onClick={onClick}
    className={`relative group p-2 rounded-md ${active ? 'text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
  >
    <Icon size={24} />
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 bg-sky-400 rounded-r-full" />}
    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-zinc-800 text-zinc-200 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
      {label}
    </span>
  </button>
);

export default ActivityBar;
