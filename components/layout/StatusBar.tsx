import React, { useMemo } from 'react';
import { GitBranch, CheckCircle, Save, Loader } from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { SavingStatus } from '../../types';

const countWords = (htmlContent: string): number => {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = htmlContent;
    const text = tempEl.textContent || '';
    return text.trim().split(/\s+/).filter(Boolean).length;
}

const SavingIndicator: React.FC<{ status: SavingStatus }> = ({ status }) => {
  switch (status) {
    case 'saving':
      return (
        <div className="flex items-center gap-1 text-sky-400">
          <Loader size={14} className="animate-spin" />
          <span>Saving...</span>
        </div>
      );
    case 'saved':
      return (
        <div className="flex items-center gap-1 text-green-500">
          <Save size={14} />
          <span>Saved</span>
        </div>
      );
    case 'idle':
    default:
      return (
        <div className="flex items-center gap-1">
          <CheckCircle size={14} />
          <span>Ready</span>
        </div>
      );
  }
};

const StatusBar: React.FC = () => {
  const { workspace, savingStatus } = useWorkspace();
  const { uiState, toc, fragments } = workspace || {};
  
  let activeDocumentTitle = "No active document";
  let activeDocumentContent = '';
  
  if (uiState && toc && fragments) {
    const activeGroup = uiState.tabGroups.find(g => g.id === uiState.activeGroupId);
    if (activeGroup && activeGroup.activeTabId) {
      const activeId = activeGroup.activeTabId;
      const chapter = toc.flatMap(p => p.chapters).find(c => c.id === activeId);
      if (chapter) {
        activeDocumentTitle = chapter.title;
        activeDocumentContent = chapter.content;
      } else {
        const fragment = fragments.find(f => f.id === activeId);
        if (fragment) {
            const tempEl = document.createElement('div');
            tempEl.innerHTML = fragment.content;
            activeDocumentTitle = `Fragment: ${tempEl.textContent?.substring(0, 30) || 'Untitled'}...`;
            activeDocumentContent = fragment.content;
        }
      }
    }
  }

  const wordCount = useMemo(() => countWords(activeDocumentContent), [activeDocumentContent]);

  return (
    <footer className="h-6 flex-shrink-0 bg-zinc-950/80 border-t border-zinc-800 px-4 flex items-center justify-between text-xs text-zinc-400">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 hover:bg-zinc-700 px-1 rounded cursor-pointer">
            <GitBranch size={14} />
            <span>main</span>
        </div>
        <div className="truncate max-w-xs">{activeDocumentTitle}</div>
      </div>
      <div className="flex items-center gap-4">
        {activeDocumentContent && <span>{wordCount} Words</span>}
        <div>UTF-8</div>
        <div>Spaces: 2</div>
        <SavingIndicator status={savingStatus} />
      </div>
    </footer>
  );
};

export default StatusBar;