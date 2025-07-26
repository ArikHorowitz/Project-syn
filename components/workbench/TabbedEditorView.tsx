import React from 'react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { Chapter, Fragment, TabGroup } from '../../types';
import Editor from '../editor/Editor';
import { X, FileText, Pencil } from 'lucide-react';
import WelcomeScreen from './WelcomeScreen';

type OpenTab = (Chapter & { docType: 'chapter' }) | (Fragment & { docType: 'fragment' });

interface TabbedEditorViewProps {
    tabGroup: TabGroup;
    isActiveGroup: boolean;
}

const TabbedEditorView: React.FC<TabbedEditorViewProps> = ({ tabGroup, isActiveGroup }) => {
  const { workspace, actions } = useWorkspace();

  if (!workspace) return null;

  const { toc, fragments } = workspace;
  const { id: groupId, tabs: openTabIds, activeTabId } = tabGroup;

  const openTabs: OpenTab[] = openTabIds
    .map(tabId => {
      const chapter = toc.flatMap(p => p.chapters).find(c => c.id === tabId);
      if (chapter) return { ...chapter, docType: 'chapter' };
      
      const fragment = fragments.find(f => f.id === tabId);
      if (fragment) return { ...fragment, docType: 'fragment' };

      return null;
    })
    .filter((tab): tab is OpenTab => tab !== null);

  const activeTab = activeTabId ? openTabs.find(tab => tab.id === activeTabId) : null;

  const handleTabClick = (tabId: string) => {
    actions.setActiveTab(groupId, tabId);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    actions.closeTab(tabId);
  };
  
  const getTabTitle = (tab: OpenTab) => {
    if (tab.docType === 'chapter') return tab.title;
    const tempEl = document.createElement('div');
    tempEl.innerHTML = tab.content;
    return tempEl.textContent?.substring(0, 30) || 'Untitled Fragment';
  }
  
  const handleContentChange = (newContent: string) => {
    if (!activeTab) return;
    if (activeTab.docType === 'chapter') {
        actions.updateChapterContent(activeTab.id, newContent);
    } else {
        actions.updateFragmentContent(activeTab.id, newContent);
    }
  }

  const handlePaneClick = () => {
    if (!isActiveGroup) {
        actions.setActiveGroup(groupId);
    }
  }

  return (
    <div 
        className={`h-full flex flex-col ${isActiveGroup ? 'bg-zinc-800/50' : 'bg-zinc-800/20'}`}
        onClick={handlePaneClick}
    >
      {/* Tabs Header */}
      <div className="flex-shrink-0 bg-zinc-900 flex border-b border-zinc-700 overflow-x-auto">
        {openTabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center justify-between gap-2 px-3 py-2 border-r border-zinc-700 cursor-pointer flex-shrink-0 ${tab.id === activeTabId ? (isActiveGroup ? 'bg-zinc-800' : 'bg-zinc-700/50') : 'bg-transparent text-zinc-400 hover:bg-zinc-800/40'}`}
            >
              {tab.docType === 'chapter' ? <FileText size={14} className="text-sky-400"/> : <Pencil size={14} className="text-amber-400"/>}
              <span className="text-sm truncate max-w-xs">{getTabTitle(tab)}</span>
              <button onClick={(e) => handleCloseTab(e, tab.id)} className="p-0.5 rounded-sm hover:bg-zinc-700">
                <X size={14} />
              </button>
            </div>
        ))}
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab ? (
          <Editor
            key={activeTab.id}
            content={activeTab.content}
            onChange={handleContentChange}
          />
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );
};

export default TabbedEditorView;