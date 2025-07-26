import React, { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { WorkspaceState, Fragment, Toc, Part, Chapter, TabGroup, SavingStatus, SettingsState, ChapterStatus, SynthiaData, Snapshot, UiState } from '../types';
import * as fileSystemApi from '../services/fileSystemApi';
import { produce } from 'immer';

export interface WorkspaceContextType {
  workspace: WorkspaceState | null;
  snapshots: Snapshot[];
  isLoading: boolean;
  savingStatus: SavingStatus;
  actions: {
    // Tab & Group Management
    openChapter: (chapterId: string) => void;
    openFragment: (fragmentId: string) => void;
    setActiveTab: (groupId: string, tabId: string) => void;
    closeTab: (tabId: string) => void;
    splitEditor: () => void;
    unsplitEditor: () => void;
    setSplitDirection: (direction: 'horizontal' | 'vertical') => void;
    setActiveGroup: (groupId: string) => void;

    // Content Updates
    updateChapterContent: (chapterId: string, content: string) => void;
    updateFragmentContent: (fragmentId: string, content: string) => void;
    
    // Fragment Management
    addFragment: () => void;
    deleteFragment: (fragmentId: string) => void;
    updateFragmentMetadata: (fragmentId: string, metadata: Partial<Omit<Fragment, 'id' | 'content' | 'createdAt'>>) => void;
    toggleFragmentTagFilter: (tag: string) => void;
    clearFragmentTagFilters: () => void;

    // UI Management
    toggleBottomPanel: () => void;
    toggleInspector: () => void;
    toggleCommandPalette: () => void;
    setSidebarView: (view: 'explorer' | 'search' | 'history') => void;
    toggleSettings: () => void;
    updateSettings: (newSettings: Partial<SettingsState>) => void;
    
    // Linking
    linkFragmentToChapter: (fragmentId: string, chapterId: string) => void;
    unlinkFragmentFromChapter: (fragmentId: string, chapterId: string) => void;
    
    // TOC D&D and CRUD
    updateToc: (newToc: Toc) => void;
    addPart: () => void;
    addPartAndChapter: () => void;
    addChapter: (partId: string) => void;
    deletePart: (partId: string) => void;
    deleteChapter: (chapterId: string) => void;
    updateItemName: (itemId: string, newTitle: string) => void;
    setRenamingId: (itemId: string | null) => void;
    updateChapterStatus: (chapterId: string, status: ChapterStatus) => void;

    // Workspace & History
    replaceWorkspace: (newState: WorkspaceState) => void;
    createSnapshot: (name: string) => void;
    restoreSnapshot: (snapshotId: string) => void;
    deleteSnapshot: (snapshotId: string) => void;
  };
}

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
}

/**
 * Consolidates the logic for cleaning up tab groups after a tab is closed or a document is deleted.
 * Ensures the UI remains in a consistent state.
 */
const cleanupTabGroupsAndFocus = (uiState: UiState) => {
    const originalActiveGroupId = uiState.activeGroupId;

    // 1. Filter out empty tab groups, but only if there are multiple.
    // A single, empty group is valid and should show the Welcome screen.
    if (uiState.tabGroups.length > 1) {
        uiState.tabGroups = uiState.tabGroups.filter(g => g.tabs.length > 0);
    }

    // 2. If all groups were removed (or none existed), create a fresh one.
    if (uiState.tabGroups.length === 0) {
        const newGroup = { id: `group-${crypto.randomUUID()}`, tabs: [], activeTabId: null };
        uiState.tabGroups.push(newGroup);
        uiState.activeGroupId = newGroup.id;
        return; // Early exit
    }

    // 3. Ensure the activeGroupId still points to an existing group.
    const activeGroupStillExists = uiState.tabGroups.some(g => g.id === originalActiveGroupId);

    // If the active group was removed or no group is active, set the first available group as active.
    if (!activeGroupStillExists || !uiState.activeGroupId) {
        uiState.activeGroupId = uiState.tabGroups[0].id;
    }
};

const openDocumentInGroup = (group: TabGroup, docId: string) => {
    if (!group.tabs.includes(docId)) {
        group.tabs.push(docId);
    }
    group.activeTabId = docId;
};


export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const [synthiaData, setSynthiaData] = useState<SynthiaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState<SavingStatus>('idle');
  const saveTimeoutRef = useRef<number | null>(null);
  const statusTimeoutRef = useRef<number | null>(null);

  const workspace = synthiaData?.currentWorkspace ?? null;
  const snapshots = synthiaData?.snapshots ?? [];

// Replace this old useEffect:
// useEffect(() => {
//   const loadedState = fileSystemApi.loadState();
//   setSynthiaData(loadedState);
//   setIsLoading(false);
// }, []);

// With this new async version:
  useEffect(() => {
    const loadData = async () => {
      const loadedState = await fileSystemApi.loadState();
      setSynthiaData(loadedState);
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (synthiaData && !isLoading) {
      setSavingStatus('saving');

      // Clear previous timeouts to debounce
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);

      saveTimeoutRef.current = window.setTimeout(() => {
        fileSystemApi.saveState(synthiaData);
        setSavingStatus('saved');
        
        statusTimeoutRef.current = window.setTimeout(() => {
          setSavingStatus('idle');
        }, 1500); // Show 'saved' for 1.5 seconds

      }, 1000); // Debounce save by 1 second
    }
  }, [synthiaData, isLoading]);

  const setWorkspace = useCallback((updater: (draft: WorkspaceState) => void) => {
    setSynthiaData(produce(draftData => {
      if (draftData) {
        updater(draftData.currentWorkspace);
      }
    }));
  }, []);

  const replaceWorkspace = useCallback((newState: WorkspaceState) => {
    setSynthiaData(produce(draftData => {
      if (draftData) {
        draftData.currentWorkspace = newState;
      }
    }));
  }, []);

  const openDocument = useCallback((docId: string) => {
    setWorkspace(draft => {
      const { uiState } = draft;
      let activeGroup = uiState.tabGroups.find(g => g.id === uiState.activeGroupId);
      
      // If there are no groups or the active one is somehow invalid, find the first one or create one.
      if (!activeGroup) {
          if (uiState.tabGroups.length === 0) {
              const newGroup: TabGroup = { id: `group-${crypto.randomUUID()}`, tabs: [], activeTabId: null };
              draft.uiState.tabGroups.push(newGroup);
              activeGroup = newGroup;
              draft.uiState.activeGroupId = newGroup.id;
          } else {
              activeGroup = uiState.tabGroups[0];
              draft.uiState.activeGroupId = activeGroup.id;
          }
      }

      openDocumentInGroup(activeGroup, docId);
    });
  }, [setWorkspace]);

  const openChapter = useCallback((chapterId: string) => openDocument(chapterId), [openDocument]);
  const openFragment = useCallback((fragmentId: string) => openDocument(fragmentId), [openDocument]);
  
  const setActiveTab = useCallback((groupId: string, tabId: string) => {
    setWorkspace(draft => {
      const group = draft.uiState.tabGroups.find(g => g.id === groupId);
      if (group) {
        group.activeTabId = tabId;
        draft.uiState.activeGroupId = groupId;
      }
    });
  }, [setWorkspace]);

  const closeTab = useCallback((tabId: string) => {
    setWorkspace(draft => {
      for (const group of draft.uiState.tabGroups) {
        const tabIndex = group.tabs.indexOf(tabId);
        if (tabIndex > -1) {
          group.tabs.splice(tabIndex, 1);
          // If the closed tab was active, set the new active tab
          if (group.activeTabId === tabId) {
            group.activeTabId = group.tabs[Math.max(0, tabIndex - 1)] || null;
          }
        }
      }
      cleanupTabGroupsAndFocus(draft.uiState);
    });
  }, [setWorkspace]);

  const updateChapterContent = useCallback((chapterId: string, content: string) => {
    setWorkspace(draft => {
      for (const part of draft.toc) {
        const chapter = part.chapters.find(c => c.id === chapterId);
        if (chapter) {
          chapter.content = content;
          chapter.updatedAt = new Date().toISOString();
          break;
        }
      }
    });
  }, [setWorkspace]);
  
  const updateFragmentContent = useCallback((fragmentId: string, content: string) => {
    setWorkspace(draft => {
        const fragment = draft.fragments.find(f => f.id === fragmentId);
        if (fragment) {
            fragment.content = content;
            fragment.updatedAt = new Date().toISOString();
        }
    });
  }, [setWorkspace]);

  const addFragment = useCallback(() => {
    setWorkspace(draft => {
        const now = new Date().toISOString();
        const newFragment: Fragment = {
            id: `frag-${crypto.randomUUID()}`,
            type: 'idea',
            tags: [],
            content: '<h2>New Fragment</h2><p>Start writing your idea...</p>',
            createdAt: now,
            updatedAt: now,
        };
        draft.fragments.unshift(newFragment);
        draft.uiState.bottomPanelOpen = true; 
    });
  }, [setWorkspace]);

  const deleteFragment = useCallback((fragmentId: string) => {
     if (!window.confirm('Are you sure you want to delete this fragment? This action cannot be undone.')) return;
    setWorkspace(draft => {
        // Close any open tabs for this fragment
        for (const group of draft.uiState.tabGroups) {
            const tabIndex = group.tabs.indexOf(fragmentId);
            if (tabIndex > -1) {
                group.tabs.splice(tabIndex, 1);
                if (group.activeTabId === fragmentId) {
                    group.activeTabId = group.tabs[Math.max(0, tabIndex - 1)] || null;
                }
            }
        }
        
        // Delete the fragment itself
        draft.fragments = draft.fragments.filter(f => f.id !== fragmentId);

        // Unlink from all chapters
        draft.toc.forEach(part => {
            part.chapters.forEach(chapter => {
                chapter.fragmentIds = chapter.fragmentIds.filter(id => id !== fragmentId);
            });
        });

        cleanupTabGroupsAndFocus(draft.uiState);
    });
  }, [setWorkspace]);
  
  const updateFragmentMetadata = useCallback((fragmentId: string, metadata: Partial<Omit<Fragment, 'id' | 'content' | 'createdAt'>>) => {
    setWorkspace(draft => {
      const fragment = draft.fragments.find(f => f.id === fragmentId);
      if (fragment) {
        Object.assign(fragment, metadata);
        fragment.updatedAt = new Date().toISOString();
      }
    });
  }, [setWorkspace]);

  const toggleBottomPanel = useCallback(() => setWorkspace(draft => { draft.uiState.bottomPanelOpen = !draft.uiState.bottomPanelOpen; }), [setWorkspace]);
  const toggleInspector = useCallback(() => setWorkspace(draft => { draft.uiState.inspectorOpen = !draft.uiState.inspectorOpen; }), [setWorkspace]);
  const toggleCommandPalette = useCallback(() => setWorkspace(draft => { draft.uiState.commandPaletteOpen = !draft.uiState.commandPaletteOpen; }), [setWorkspace]);

  const linkFragmentToChapter = useCallback((fragmentId: string, chapterId: string) => {
    setWorkspace(draft => {
        const chapter = draft.toc.flatMap(p => p.chapters).find(c => c.id === chapterId);
        if(chapter && !chapter.fragmentIds.includes(fragmentId)) {
            chapter.fragmentIds.push(fragmentId);
        }
    });
  }, [setWorkspace]);
  
  const unlinkFragmentFromChapter = useCallback((fragmentId: string, chapterId: string) => {
    setWorkspace(draft => {
        const chapter = draft.toc.flatMap(p => p.chapters).find(c => c.id === chapterId);
        if(chapter) {
            chapter.fragmentIds = chapter.fragmentIds.filter(id => id !== fragmentId);
        }
    });
  }, [setWorkspace]);
  
  const updateToc = useCallback((newToc: Toc) => setWorkspace(draft => { draft.toc = newToc; }), [setWorkspace]);

  const addPart = useCallback(() => {
    setWorkspace(draft => {
      const newPart: Part = {
        id: `part-${crypto.randomUUID()}`,
        title: 'Untitled Part',
        chapters: [],
      };
      draft.toc.push(newPart);
      draft.uiState.renamingId = newPart.id;
    });
  }, [setWorkspace]);

  const addPartAndChapter = useCallback(() => {
    setWorkspace(draft => {
        const now = new Date().toISOString();
        const newChapterId = `ch-${crypto.randomUUID()}`;
        
        const newChapter: Chapter = {
            id: newChapterId,
            title: 'Untitled Chapter',
            status: 'idea',
            content: '<h1>Untitled Chapter</h1>',
            updatedAt: now,
            fragmentIds: [],
        };

        const newPart: Part = {
            id: `part-${crypto.randomUUID()}`,
            title: 'Untitled Part',
            chapters: [newChapter],
        };
        
        draft.toc.push(newPart);
        draft.uiState.renamingId = newChapterId; // Set renaming focus on the new chapter
        
        // Also open the new chapter in the editor
        let activeGroup = draft.uiState.tabGroups.find(g => g.id === draft.uiState.activeGroupId);
        if (!activeGroup && draft.uiState.tabGroups.length > 0) activeGroup = draft.uiState.tabGroups[0];
        
        if (activeGroup) {
            openDocumentInGroup(activeGroup, newChapterId);
        } else { // Handle case with no groups at all
            const newGroup: TabGroup = { id: `group-${crypto.randomUUID()}`, tabs: [newChapterId], activeTabId: newChapterId };
            draft.uiState.tabGroups.push(newGroup);
            draft.uiState.activeGroupId = newGroup.id;
        }
    });
  }, [setWorkspace]);

  const addChapter = useCallback((partId: string) => {
    setWorkspace(draft => {
      const part = draft.toc.find(p => p.id === partId);
      if (part) {
        const now = new Date().toISOString();
        const newChapter: Chapter = {
          id: `ch-${crypto.randomUUID()}`,
          title: 'Untitled Chapter',
          status: 'idea',
          content: '<h1>Untitled Chapter</h1>',
          updatedAt: now,
          fragmentIds: [],
        };
        part.chapters.push(newChapter);
        draft.uiState.renamingId = newChapter.id;
        openDocument(newChapter.id);
      }
    });
  }, [setWorkspace]);

  const deletePart = useCallback((partId: string) => {
    if (!window.confirm('Are you sure you want to delete this part and all its chapters? This cannot be undone.')) return;
    setWorkspace(draft => {
      const partIndex = draft.toc.findIndex(p => p.id === partId);
      if (partIndex > -1) {
        const chaptersToDelete = draft.toc[partIndex].chapters;
        
        // Close all tabs for the chapters being deleted
        chaptersToDelete.forEach(chapter => {
          const chapterId = chapter.id;
          for (const group of draft.uiState.tabGroups) {
            const tabIndex = group.tabs.indexOf(chapterId);
            if (tabIndex > -1) {
              group.tabs.splice(tabIndex, 1);
              if (group.activeTabId === chapterId) {
                group.activeTabId = group.tabs[Math.max(0, tabIndex - 1)] || null;
              }
            }
          }
        });
        
        // Remove the part from the TOC
        draft.toc.splice(partIndex, 1);
        
        // Clean up tab groups and focus
        cleanupTabGroupsAndFocus(draft.uiState);
      }
    });
  }, [setWorkspace]);

  const deleteChapter = useCallback((chapterId: string) => {
    if (!window.confirm('Are you sure you want to delete this chapter? This cannot be undone.')) return;
    setWorkspace(draft => {
      // Close any open tabs for this chapter
      for (const group of draft.uiState.tabGroups) {
        const tabIndex = group.tabs.indexOf(chapterId);
        if (tabIndex > -1) {
          group.tabs.splice(tabIndex, 1);
          if (group.activeTabId === chapterId) {
            group.activeTabId = group.tabs[Math.max(0, tabIndex - 1)] || null;
          }
        }
      }

      // Remove the chapter from the TOC
      draft.toc.forEach(part => {
        part.chapters = part.chapters.filter(c => c.id !== chapterId);
      });

      cleanupTabGroupsAndFocus(draft.uiState);
    });
  }, [setWorkspace]);

  const updateItemName = useCallback((itemId: string, newTitle: string) => {
    setWorkspace(draft => {
      if (!newTitle.trim()) return;
      const part = draft.toc.find(p => p.id === itemId);
      if (part) {
        part.title = newTitle;
      } else {
        const chapter = draft.toc.flatMap(p => p.chapters).find(c => c.id === itemId);
        if (chapter) {
          chapter.title = newTitle;
          chapter.updatedAt = new Date().toISOString();
        }
      }
    });
  }, [setWorkspace]);
  
  const setRenamingId = useCallback((itemId: string | null) => setWorkspace(draft => { draft.uiState.renamingId = itemId; }), [setWorkspace]);
  const splitEditor = useCallback(() => setWorkspace(draft => { if (draft.uiState.tabGroups.length > 1) return; const newGroup: TabGroup = { id: `group-${crypto.randomUUID()}`, tabs: [], activeTabId: null }; draft.uiState.tabGroups.push(newGroup); draft.uiState.activeGroupId = newGroup.id; }), [setWorkspace]);
  const unsplitEditor = useCallback(() => setWorkspace(draft => { if (draft.uiState.tabGroups.length < 2) return; const activeGroup = draft.uiState.tabGroups.find(g => g.id === draft.uiState.activeGroupId); const inactiveGroup = draft.uiState.tabGroups.find(g => g.id !== draft.uiState.activeGroupId); if (!activeGroup || !inactiveGroup) return; inactiveGroup.tabs.forEach(tabId => { if (!activeGroup.tabs.includes(tabId)) { activeGroup.tabs.push(tabId); } }); draft.uiState.tabGroups = [activeGroup]; draft.uiState.activeGroupId = activeGroup.id; }), [setWorkspace]);
  const setSplitDirection = useCallback((direction: 'horizontal' | 'vertical') => setWorkspace(draft => { draft.uiState.splitDirection = direction; }), [setWorkspace]);
  const setActiveGroup = useCallback((groupId: string) => setWorkspace(draft => { draft.uiState.activeGroupId = groupId; }), [setWorkspace]);
  const setSidebarView = useCallback((view: 'explorer' | 'search' | 'history') => setWorkspace(draft => { draft.uiState.sidebarView = view; }), [setWorkspace]);
  const toggleSettings = useCallback(() => setWorkspace(draft => { draft.uiState.settingsOpen = !draft.uiState.settingsOpen; }), [setWorkspace]);
  const updateSettings = useCallback((newSettings: Partial<SettingsState>) => setWorkspace(draft => { if (draft.settings) { if (newSettings.editor) { draft.settings.editor = { ...draft.settings.editor, ...newSettings.editor }; } } }), [setWorkspace]);
  const updateChapterStatus = useCallback((chapterId: string, status: ChapterStatus) => setWorkspace(draft => { for (const part of draft.toc) { const chapter = part.chapters.find(c => c.id === chapterId); if (chapter) { chapter.status = status; chapter.updatedAt = new Date().toISOString(); break; } } }), [setWorkspace]);

  // Fragment Tag Filtering
  const toggleFragmentTagFilter = useCallback((tag: string) => {
    setWorkspace(draft => {
      const { uiState } = draft;
      const index = uiState.activeFragmentTags.indexOf(tag);
      if (index > -1) {
        uiState.activeFragmentTags.splice(index, 1);
      } else {
        uiState.activeFragmentTags.push(tag);
      }
    });
  }, [setWorkspace]);
  
  const clearFragmentTagFilters = useCallback(() => {
    setWorkspace(draft => {
      draft.uiState.activeFragmentTags = [];
    });
  }, [setWorkspace]);


  // --- History Actions ---
  const createSnapshot = useCallback((name: string) => {
    if (!synthiaData) return;
    const snapshot: Snapshot = {
      id: `snap-${crypto.randomUUID()}`,
      name: name || `Snapshot ${new Date().toLocaleString()}`,
      createdAt: new Date().toISOString(),
      workspaceState: JSON.parse(JSON.stringify(synthiaData.currentWorkspace)) // Deep copy
    };
    setSynthiaData(produce(draft => {
      draft?.snapshots.unshift(snapshot);
    }));
  }, [synthiaData]);

  const restoreSnapshot = useCallback((snapshotId: string) => {
    if (!synthiaData) return;
    const snapshot = synthiaData.snapshots.find(s => s.id === snapshotId);
    if (snapshot && window.confirm(`Are you sure you want to restore "${snapshot.name}"? This will overwrite your current workspace.`)) {
      setSynthiaData(produce(draft => {
        if (draft) {
          draft.currentWorkspace = JSON.parse(JSON.stringify(snapshot.workspaceState)); // Deep copy
        }
      }));
       alert('Workspace restored successfully!');
    }
  }, [synthiaData]);

  const deleteSnapshot = useCallback((snapshotId: string) => {
    if (!synthiaData) return;
     const snapshot = synthiaData.snapshots.find(s => s.id === snapshotId);
    if (snapshot && window.confirm(`Are you sure you want to permanently delete snapshot "${snapshot.name}"?`)) {
      setSynthiaData(produce(draft => {
        if (draft) {
          draft.snapshots = draft.snapshots.filter(s => s.id !== snapshotId);
        }
      }));
    }
  }, [synthiaData]);


  const actions = { 
      openChapter, openFragment, setActiveTab, closeTab, updateChapterContent, updateFragmentContent, addFragment, deleteFragment, updateFragmentMetadata, toggleBottomPanel, toggleInspector, toggleCommandPalette, linkFragmentToChapter, unlinkFragmentFromChapter, updateToc, addPart, addPartAndChapter, addChapter, deletePart, deleteChapter, updateItemName, setRenamingId, splitEditor, unsplitEditor, setSplitDirection, setActiveGroup, setSidebarView, toggleSettings, updateSettings, updateChapterStatus, replaceWorkspace, createSnapshot, restoreSnapshot, deleteSnapshot, toggleFragmentTagFilter, clearFragmentTagFilters
  };

  return (
    <WorkspaceContext.Provider value={{ workspace, snapshots, isLoading, savingStatus, actions }}>
      {!isLoading ? children : <LoadingScreen />}
    </WorkspaceContext.Provider>
  );
};

const LoadingScreen: React.FC = () => (
  <div className="flex items-center justify-center h-full bg-zinc-900">
    <div className="text-zinc-500">Loading Synthia...</div>
  </div>
);