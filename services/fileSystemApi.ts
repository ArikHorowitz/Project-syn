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

  // --- Fragments (from the Book Matrix) ---
  // I've created fragments for the first few chapters as a template.
  const initialFragments: Fragment[] = [
    // Fragments for Chapter 1.0: Stage Setting
    { id: 'frag-1-0-1', type: 'idea', tags: ['Psychological Dynamics'], content: '<p>Tension, anticipation</p>', createdAt: now, updatedAt: now },
    { id: 'frag-1-0-2', type: 'idea', tags: ['Synthesis'], content: '<p>Premonition of rupture</p>', createdAt: now, updatedAt: now },
    { id: 'frag-1-0-3', type: 'idea', tags: ['Information Control'], content: '<p>Introduction of sacred myths</p>', createdAt: now, updatedAt: now },
    { id: 'frag-1-0-4', type: 'idea', tags: ['Human Agency'], content: '<p>Implicit invitation to choose</p>', createdAt: now, updatedAt: now },
    { id: 'frag-1-0-5', type: 'idea', tags: ['Rhetorical / Tone'], content: '<p>Direct, calm address</p>', createdAt: now, updatedAt: now },
    { id: 'frag-1-0-6', type: 'idea', tags: ['Philosophical / Epistemic'], content: '<p>What is real? How do I know?</p>', createdAt: now, updatedAt: now },

    // Fragments for Chapter 1.1: I Was There
    { id: 'frag-1-1-1', type: 'idea', tags: ['Psychological Dynamics'], content: '<p>Shock, moral rupture</p>', createdAt: now, updatedAt: now },
    { id: 'frag-1-1-2', type: 'idea', tags: ['Institutional Logic'], content: '<p>Security myth collapses</p>', createdAt: now, updatedAt: now },
    { id: 'frag-1-1-3', type: 'idea', tags: ['Narrative Power'], content: '<p>The gap between media narrative and lived reality</p>', createdAt: now, updatedAt: now },
    { id: 'frag-1-1-4', type: 'idea', tags: ['Rhetorical / Tone'], content: '<p>Plainspoken, confessional, stripped of detachment</p>', createdAt: now, updatedAt: now },
    { id: 'frag-1-1-5', type: 'idea', tags: ['Philosophical / Epistemic'], content: '<p>The seen vs. the believed</p>', createdAt: now, updatedAt: now },

    // Fragments for Chapter 1.2: How We Were Raised
    { id: 'frag-1-2-1', type: 'idea', tags: ['Psychological Dynamics'], content: '<p>Fear shaping identity</p>', createdAt: now, updatedAt: now },
    { id: 'frag-1-2-2', type: 'idea', tags: ['Institutional Logic'], content: '<p>Childhood rituals: anthem, school, holidays</p>', createdAt: now, updatedAt: now },
    { id: 'frag-1-2-3', type: 'idea', tags: ['Narrative Power'], content: '<p>Founding myths internalized</p>', createdAt: now, updatedAt: now },
    { id: 'frag-1-2-4', type: 'idea', tags: ['Information Control'], content: '<p>No authorship - inherited belief sanitized early</p>', createdAt: now, updatedAt: now },
  ];

  // --- Table of Contents (The Book Structure) ---
  const initialToc: Toc = [
    {
      id: 'part-1',
      title: 'Part I: From Statist Faith to Praxeological Awakening',
      chapters: [
        { id: 'ch-1-0', title: '1.0. Stage Setting', status: 'draft', content: '<h1>1.0. Stage Setting</h1><p>An invitation to the reader, setting the terms for a journey of awakening where the ground will shake and the myths will dissolve. What is real, and how do we know?</p>', updatedAt: now, fragmentIds: ['frag-1-0-1', 'frag-1-0-2', 'frag-1-0-3', 'frag-1-0-4', 'frag-1-0-5', 'frag-1-0-6'] },
        { id: 'ch-1-1', title: '1.1. I Was There', status: 'idea', content: '<h1>1.1. I Was There</h1><p>The rupture is personal, not theoretical. This chapter recounts the first-hand disillusionment when the state’s promises break against the rocks of lived reality.</p>', updatedAt: now, fragmentIds: ['frag-1-1-1', 'frag-1-1-2', 'frag-1-1-3', 'frag-1-1-4', 'frag-1-1-5'] },
        { id: 'ch-1-2', title: '1.2. How We Were Raised', status: 'idea', content: '<h1>1.2. How We Were Raised</h1><p>What we thought was home was a stage. An examination of the deep-seated indoctrination from childhood, where the state becomes a surrogate parent.</p>', updatedAt: now, fragmentIds: ['frag-1-2-1', 'frag-1-2-2', 'frag-1-2-3', 'frag-1-2-4'] },
        { id: 'ch-1-3', title: '1.3. It Felt Just', status: 'idea', content: '<h1>1.3. It Felt Just</h1><p>That is how deep the trap runs. A reflection on the sincerity of past belief, where obedience was not coerced but embraced as righteousness and moral alignment.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-1-4', title: '1.4. Wearing the Uniform', status: 'idea', content: '<h1>1.4. Wearing the Uniform</h1><p>To wear the uniform is to disappear. A clinical look at how ritualized obedience and role-play can subsume individual identity, turning a person into an instrument of the state.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-1-5', title: '1.5. Didn\'t Add Up', status: 'idea', content: '<h1>1.5. Didn\'t Add Up</h1><p>The myth never breaks all at once. It unravels. This chapter details the quiet gnawing of cognitive dissonance as inconsistencies in the master story begin to accumulate.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-1-6', title: '1.6. It Got Personal', status: 'idea', content: '<h1>1.6. It Got Personal</h1><p>The awakening begins in pain. The moment when the abstract violence of the state becomes intimate and personal, shattering the believer’s sanitized worldview.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-1-7', title: '1.7. No One\'s in Charge', status: 'idea', content: '<h1>1.7. No One\'s in Charge</h1><p>Worse than evil—it’s emptiness. The horrifying realization that the system is an automated, soulless machine without a driver, feeding on its own logic.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-1-8', title: '1.8. I Had to Understand', status: 'idea', content: '<h1>1.8. I Had to Understand</h1><p>This was the first true act. The pivot from victim to seeker; the conscious choice to step outside the frame and pursue knowledge, not as rebellion, but as a fundamental act of will.</p>', updatedAt: now, fragmentIds: [] },
      ],
    },
    {
      id: 'part-2',
      title: 'Part II: A Praxeological Autopsy: From Life to State',
      chapters: [
        { id: 'ch-2-1', title: '2.1. Life', status: 'idea', content: '<h1>2.1. Life</h1><p>To live is to act. This is the beginning of all structure.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-2-2', title: '2.2. Choice', status: 'idea', content: '<h1>2.2. Choice</h1><p>Every choice affirms your existence as an author of your path—or denies it.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-2-3', title: '2.3. Action', status: 'idea', content: '<h1>2.3. Action</h1><p>Action is not reaction. It is creation with intent.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-2-4', title: '2.4. Interaction', status: 'idea', content: '<h1>2.4. Interaction</h1><p>Society forms not from law, but from choice.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-2-5', title: '2.5. Coercion', status: 'idea', content: '<h1>2.5. Coercion</h1><p>When persuasion fails, power steps in. Coercion is not policy; it is war on agency.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-2-6', title: '2.6. State', status: 'idea', content: '<h1>2.6. State</h1><p>The state is coercion with a costume—legitimacy dressed as law.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-2-7', title: '2.7. War', status: 'idea', content: '<h1>2.7. War</h1><p>The exception to the state—it is its climax.</p>', updatedAt: now, fragmentIds: [] },
      ],
    },
    {
      id: 'part-3',
      title: 'Part III: Statism in the Holy Land: A Live Case Study',
      chapters: [
        { id: 'ch-3-1', title: '3.1. Myths', status: 'idea', content: '<h1>3.1. Myths</h1><p>The state feeds on story. Myth is not its tool—it is its womb.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-3-2', title: '3.2. Legitimacy', status: 'idea', content: '<h1>3.2. Legitimacy</h1><p>Legitimacy is not consent—it is performance, repeated until believed.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-3-3', title: '3.3. Institutions', status: 'idea', content: '<h1>3.3. Institutions</h1><p>When institutions mask themselves as success stories, decay becomes invisible.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-3-4', title: '3.4. The Army', status: 'idea', content: '<h1>3.4. The Army</h1><p>It\'s the moral factory of statism.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-3-5', title: '3.5. Media', status: 'idea', content: '<h1>3.5. Media</h1><p>The media no longer informs—it disciplines.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-3-6', title: '3.6. Trauma', status: 'idea', content: '<h1>3.6. Trauma</h1><p>In the name of remembrance, freedom is forgotten.</p>', updatedAt: now, fragmentIds: [] },
      ],
    },
    {
      id: 'part-4',
      title: 'Part IV: Reclaiming Agency in a Post-Statist World',
      chapters: [
        { id: 'ch-4-1', title: '4.1. Recovery', status: 'idea', content: '<h1>4.1. Recovery</h1><p>Recovery is not return—it is reckoning.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-4-2', title: '4.2. Volition', status: 'idea', content: '<h1>4.2. Volition</h1><p>Volition is not belief—it is authorship.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-4-3', title: '4.3. Clarity', status: 'idea', content: '<h1>4.3. Clarity</h1><p>Clarity is not found—it is built.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-4-4', title: '4.4. Decentralization', status: 'idea', content: '<h1>4.4. Decentralization</h1><p>Power withdrawn, trust returns.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-4-5', title: '4.5. Parallel Structures', status: 'idea', content: '<h1>4.5. Parallel Structures</h1><p>The future grows quietly beside the ruins.</p>', updatedAt: now, fragmentIds: [] },
        { id: 'ch-4-6', title: '4.6. Liberation', status: 'idea', content: '<h1>4.6. Liberation</h1><p>To be free is to be fully real—again.</p>', updatedAt: now, fragmentIds: [] },
      ],
    },
  ];

  return {
    toc: initialToc,
    fragments: initialFragments,
    uiState: {
      tabGroups: [
        {
          id: 'group-1',
          tabs: ['ch-1-0'], // Start with the first chapter open
          activeTabId: 'ch-1-0',
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