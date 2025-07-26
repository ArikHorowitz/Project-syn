import React from 'react';
import { useWorkspace } from '../../hooks/useWorkspace';
import ChapterInspector from './ChapterInspector';
import FragmentInspector from './FragmentInspector';

const InspectorView: React.FC = () => {
  const { workspace } = useWorkspace();
  
  if (!workspace) {
    return <div className="p-4 text-sm text-zinc-500">Loading...</div>;
  }
  
  const { uiState, toc, fragments } = workspace;
  
  const activeGroup = uiState.tabGroups.find(g => g.id === uiState.activeGroupId);
  const activeId = activeGroup?.activeTabId;

  if (!activeId) {
    return <div className="p-4 text-sm text-zinc-500">No active document.</div>;
  }

  // Determine if active item is a chapter or fragment
  const allChapters = toc.flatMap(p => p.chapters);
  const activeChapter = allChapters.find(c => c.id === activeId);

  if (activeChapter) {
    return <ChapterInspector chapter={activeChapter} />;
  }
  
  const activeFragment = fragments.find(f => f.id === activeId);

  if (activeFragment) {
    return <FragmentInspector fragment={activeFragment} />;
  }

  return <div className="p-4 text-sm text-zinc-500">Select a document to inspect.</div>;
};

export default InspectorView;