import { FileText, Pencil, Plus, Eye, EyeOff, PanelTop, PanelTopOpen, PlusSquare, Trash2, Edit, Save, Upload, Download } from 'lucide-react';

// Data Models for Synthia

/**
 * Represents the status of saving the workspace.
 */
export type SavingStatus = 'idle' | 'saving' | 'saved';

/**
 * Represents the status of a chapter.
 */
export type ChapterStatus = 'draft' | 'review' | 'done' | 'idea';

/**
 * Represents a single chapter within a part of the manuscript.
 */
export interface Chapter {
  id: string; // Using string for UUIDs
  title: string;
  status: ChapterStatus;
  content: string; // HTML content from TipTap editor for the chapter
  updatedAt: string; // ISO 8601 date string
  fragmentIds: string[]; // Array of fragment IDs linked to this chapter
}

/**
 * Represents a major part or section of the manuscript.
 */
export interface Part {
  id: string; // Using string for UUIDs
  title: string;
  chapters: Chapter[];
}

/**
 * The Table of Contents, representing the entire structured manuscript.
 */
export type Toc = Part[];

/**
 * Represents the type of a fragment.
 */
export type FragmentType = 'note' | 'quote' | 'idea' | 'source' | 'image';

/**
 * Represents an atomic, unstructured piece of information (an "atom").
 */
export interface Fragment {
  id: string; // Using string for UUIDs
  type: FragmentType;
  source?: string; // e.g., URL, book title
  tags: string[];
  content: string; // HTML content from TipTap editor
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

/**
 * Represents user-configurable settings for the editor.
 */
export interface EditorSettings {
  fontFamily: string;
  fontSize: number; // in px
  lineHeight: number; // multiplier
}

/**
 * Represents all user-configurable settings.
 */
export interface SettingsState {
    editor: EditorSettings;
}


/**
 * Represents a single editor pane with its own set of tabs.
 */
export interface TabGroup {
  id: string;
  tabs: string[]; // Array of chapter or fragment ids
  activeTabId: string | null;
}

/**
 * Represents the UI state of the application.
 */
export interface UiState {
  tabGroups: TabGroup[];
  activeGroupId: string | null;
  splitDirection: 'horizontal' | 'vertical';
  bottomPanelOpen: boolean;
  inspectorOpen: boolean;
  commandPaletteOpen: boolean;
  renamingId: string | null; // ID of the part or chapter being renamed
  sidebarView: 'explorer' | 'search' | 'history';
  settingsOpen: boolean;
  activeFragmentTags: string[];
}

/**
 * Represents the entire state of the workspace.
 */
export interface WorkspaceState {
  toc: Toc;
  fragments: Fragment[];
  uiState: UiState;
  settings: SettingsState;
}

/**
 * Represents a single versioned snapshot of the workspace.
 */
export interface Snapshot {
  id: string;
  name: string;
  createdAt: string;
  workspaceState: WorkspaceState;
}

/**
 * Represents the entire data structure saved to localStorage.
 */
export interface SynthiaData {
  currentWorkspace: WorkspaceState;
  snapshots: Snapshot[];
}

// Command Palette Types
export type CommandCategory = 'Navigation' | 'UI' | 'Fragments' | 'TOC' | 'Workspace' | 'Export';

export interface Command {
    id: string;
    label: string;
    category: CommandCategory;
    icon: React.ElementType;
    onExecute: () => void;
    disabled?: boolean;
}