import { WorkspaceState, Toc, Fragment, SettingsState, SynthiaData } from '../types';

const STORAGE_KEY = 'synthia-workspace-v2'; // Bump version to avoid conflicts

const defaultSettings: SettingsState = {
  editor: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    lineHeight: 1.7,
  },
};

const createInitialWorkspaceState = (): WorkspaceState => {
  const now = new Date().toISOString();
  
  const initialToc: Toc = [
    {
      id: 'part-1',
      title: 'PART I: From Statist Faith to Praxeological Awakening',
      chapters: [
        { id: 'ch-0', title: 'Zero: Stage Setting', status: 'draft', content: '<h1>Zero: Stage Setting</h1><p>This is not a story about ideology — it is a story about awakening. The ground will shake; the myths will dissolve; the reader is warned but not begged. Proceed only if you wish to act.</p>', updatedAt: now, fragmentIds: ['frag-1'] },
        { id: 'ch-1', title: '1: I Was There', status: 'idea', content: '<h1>1: I Was There</h1><p>The rupture is personal, not theoretical. When reality crashes the myth, it isn’t academic — it’s visceral. And from that wound, thought begins.</p>', updatedAt: now, fragmentIds: ['frag-2'] },
        { id: 'ch-2', title: '2: How We Were Raised', status: 'idea', content: '<h1>2: How We Were Raised</h1><p>Indoctrination is not a bug — it is the software. What we thought was home was a stage.</p>', updatedAt: now, fragmentIds: [] },
      ],
    },
     {
      id: 'part-2',
      title: 'PART II: A Praxeological Autopsy: From Life to State',
      chapters: [
        { id: 'ch-life', title: 'Life', status: 'idea', content: '<h1>Life</h1><p>To live is to act. This is the beginning of all structure — not political, but existential.</p>', updatedAt: now, fragmentIds: [] },
      ],
    },
  ];

  const initialFragments: Fragment[] = [
    {
      id: 'frag-1',
      type: 'idea',
      tags: ['awakening', 'ideology'],
      content: '<h2>The Core Idea</h2><p>This is not a story about ideology — it is a story about awakening. The ground will shake; the myths will dissolve.</p>',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'frag-2',
      type: 'quote',
      source: 'Personal Experience',
      tags: ['rupture', 'myth'],
      content: '<h2>Visceral Rupture</h2><p>The rupture is personal, not theoretical. When reality crashes the myth, it isn’t academic — it’s visceral.</p>',
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    toc: initialToc,
    fragments: initialFragments,
    uiState: {
      tabGroups: [
        {
          id: 'group-1',
          tabs: ['ch-0', 'frag-2'],
          activeTabId: 'ch-0',
        },
      ],
      activeGroupId: 'group-1',
      splitDirection: 'vertical',
      bottomPanelOpen: true,
      inspectorOpen: true,
      commandPaletteOpen: false,
      renamingId: null,
      sidebarView: 'explorer',
      settingsOpen: false,
      activeFragmentTags: [],
    },
    settings: defaultSettings,
  };
};

const createInitialSynthiaData = (): SynthiaData => {
    return {
        currentWorkspace: createInitialWorkspaceState(),
        snapshots: [],
    };
};

/**
 * Loads the entire application data from localStorage.
 * If no state is found, it initializes with default data.
 * Also handles migration from old data structure.
 * @returns The loaded or initial SynthiaData.
 */
export const loadState = (): SynthiaData => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      // Check for old data format for migration
      const oldState = localStorage.getItem('synthia-workspace');
      if (oldState) {
        console.log('Old data format found, migrating to new structure.');
        const oldWorkspaceState = JSON.parse(oldState) as WorkspaceState;
        // Ensure defaults for older versions
        if (!oldWorkspaceState.uiState.sidebarView) oldWorkspaceState.uiState.sidebarView = 'explorer';
        if (!oldWorkspaceState.settings) oldWorkspaceState.settings = defaultSettings;
        if (!oldWorkspaceState.uiState.hasOwnProperty('settingsOpen')) oldWorkspaceState.uiState.settingsOpen = false;
        if (!oldWorkspaceState.uiState.activeFragmentTags) oldWorkspaceState.uiState.activeFragmentTags = [];

        oldWorkspaceState.toc.forEach(part => {
          part.chapters.forEach(chapter => {
            if (!chapter.updatedAt) {
              chapter.updatedAt = new Date().toISOString();
            }
          })
        })

        const migratedData: SynthiaData = {
          currentWorkspace: oldWorkspaceState,
          snapshots: [],
        };
        saveState(migratedData);
        localStorage.removeItem('synthia-workspace'); // Clean up old key
        return migratedData;
      }

      console.log('No state found, initializing with default state.');
      const initialState = createInitialSynthiaData();
      saveState(initialState);
      return initialState;
    }
    
    console.log('State loaded from localStorage.');
    const loaded = JSON.parse(serializedState) as SynthiaData;
    // Perform any necessary backward compatibility checks on loaded data here
    if (!loaded.currentWorkspace.uiState.sidebarView) {
        loaded.currentWorkspace.uiState.sidebarView = 'explorer';
    }
    if ((loaded.currentWorkspace.uiState.sidebarView as any) === 'source-control') { // old value
        loaded.currentWorkspace.uiState.sidebarView = 'history';
    }
    if (!loaded.currentWorkspace.uiState.activeFragmentTags) {
        loaded.currentWorkspace.uiState.activeFragmentTags = [];
    }
    // Add updatedAt to chapters if they don't have it
    loaded.currentWorkspace.toc.forEach(part => {
      part.chapters.forEach(chapter => {
        if (!chapter.updatedAt) {
          chapter.updatedAt = new Date().toISOString();
        }
      });
    });

    return loaded;

  } catch (err) {
    console.error('Could not load state from localStorage, initializing fresh.', err);
    const initialState = createInitialSynthiaData();
    saveState(initialState);
    return initialState;
  }
};

/**
 * Saves the entire application data to localStorage.
 * @param data The SynthiaData to save.
 */
export const saveState = (data: SynthiaData): void => {
  try {
    const serializedState = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Could not save state to localStorage.', err);
  }
};