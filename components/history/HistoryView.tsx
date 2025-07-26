import React, { useState } from 'react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { History, Trash2, CheckCircle, Plus } from 'lucide-react';

const HistoryView: React.FC = () => {
  const { snapshots, actions } = useWorkspace();
  const [snapshotName, setSnapshotName] = useState('');

  const handleCreateSnapshot = () => {
    if (snapshotName.trim()) {
      actions.createSnapshot(snapshotName.trim());
      setSnapshotName('');
    } else {
      alert('Please enter a name for the snapshot.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateSnapshot();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={snapshotName}
            onChange={e => setSnapshotName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="New snapshot name..."
            className="flex-grow bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
          />
          <button
            onClick={handleCreateSnapshot}
            className="flex items-center gap-1.5 px-3 py-1 bg-sky-600 text-white text-sm font-semibold rounded-md hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-sky-500"
          >
            <Plus size={16} />
            Create
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {snapshots.length > 0 ? (
          <div className="space-y-2">
            {snapshots.map(snapshot => (
              <div
                key={snapshot.id}
                className="group flex items-center justify-between p-2 rounded-md bg-zinc-800/50 hover:bg-zinc-800"
              >
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-zinc-200 truncate">{snapshot.name}</p>
                  <p className="text-xs text-zinc-400">
                    {new Date(snapshot.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => actions.restoreSnapshot(snapshot.id)}
                    className="p-1.5 rounded-md text-zinc-400 hover:bg-green-800 hover:text-green-300"
                    title="Restore Snapshot"
                  >
                    <History size={14} />
                  </button>
                  <button
                    onClick={() => actions.deleteSnapshot(snapshot.id)}
                    className="p-1.5 rounded-md text-zinc-400 hover:bg-red-900/50 hover:text-red-300"
                    title="Delete Snapshot"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500 text-sm">
            <CheckCircle size={24} className="mx-auto mb-2" />
            <p>No snapshots yet.</p>
            <p>Create a snapshot to save a version of your work.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
