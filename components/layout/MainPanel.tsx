
import React from 'react';
import WorkbenchView from '../workbench/WorkbenchView';

const MainPanel: React.FC = () => {
  return (
    <main className="flex-1 bg-zinc-800/50 overflow-y-auto">
      <WorkbenchView />
    </main>
  );
};

export default MainPanel;
