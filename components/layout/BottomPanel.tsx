
import React from 'react';
import FragmentLibraryExplorer from '../fragments/FragmentLibraryExplorer';

const BottomPanel: React.FC = () => {
  return (
    <div className="h-64 flex-shrink-0 border-t border-zinc-700 bg-zinc-900">
        <FragmentLibraryExplorer />
    </div>
  );
};

export default BottomPanel;
