// services/db.ts
import Dexie, { Table } from 'dexie';
import { WorkspaceState, Snapshot } from '../types';

// We use a wrapper type because Dexie tables need a primary key.
// We'll use a single, constant ID for the workspace to ensure we only ever have one.
export interface WorkspaceStore {
  id: 'current';
  data: WorkspaceState;
}

export class SynthiaDB extends Dexie {
  workspaces!: Table<WorkspaceStore, 'id'>;
  snapshots!: Table<Snapshot, 'id'>;

  constructor() {
    super('synthia');
    this.version(1).stores({
      workspaces: 'id', // Primary key is 'id'
      snapshots: 'id, createdAt', // Primary key is 'id', also index 'createdAt'
    });
  }
}

export const db = new SynthiaDB();