import React from 'react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import TabbedEditorView from './TabbedEditorView';
import { Code, Rows, Columns, SplitSquareHorizontal, SplitSquareVertical } from 'lucide-react';

const WorkbenchView: React.FC = () => {
  const { workspace, actions } = useWorkspace();
  
  if (!workspace) return <div className="h-full flex flex-col" />;
  
  const { tabGroups, splitDirection } = workspace.uiState;
  const isSplit = tabGroups.length > 1;

  return (
    <div className="h-full flex flex-col bg-zinc-800/50">
      <div className="flex-shrink-0 bg-zinc-950/50 flex items-center justify-end p-1 border-b border-zinc-700">
        <div className="flex items-center gap-1">
          {isSplit && (
            <button
              onClick={() => actions.setSplitDirection(splitDirection === 'vertical' ? 'horizontal' : 'vertical')}
              className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-700 hover:text-white"
              aria-label={splitDirection === 'vertical' ? "Switch to Horizontal Split" : "Switch to Vertical Split"}
            >
                {splitDirection === 'vertical' ? <Rows size={16} /> : <Columns size={16} />}
            </button>
          )}
          <button
            onClick={isSplit ? actions.unsplitEditor : actions.splitEditor}
            className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-700 hover:text-white"
            aria-label={isSplit ? "Merge Panes" : "Split Editor"}
          >
            {splitDirection === 'vertical' ? <SplitSquareVertical size={16} /> : <SplitSquareHorizontal size={16} />}
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
         {tabGroups.length > 0 ? (
          <PanelGroup direction={splitDirection}>
            {tabGroups.map((group, index) => (
              <React.Fragment key={group.id}>
                <Panel>
                  <TabbedEditorView 
                    tabGroup={group} 
                    isActiveGroup={group.id === workspace.uiState.activeGroupId}
                  />
                </Panel>
                {index < tabGroups.length - 1 && (
                   <PanelResizeHandle className="w-1 bg-zinc-950/80 hover:bg-sky-500/50 transition-colors data-[resize-handle-state=drag]:bg-sky-500" />
                )}
              </React.Fragment>
            ))}
          </PanelGroup>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-zinc-400">
            <Code size={48} className="text-zinc-600 mb-4" />
            <h3 className="text-xl font-semibold text-zinc-300">Welcome to Synthia</h3>
            <p className="mt-2 text-zinc-500">Select a file from the explorer to begin writing.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkbenchView;