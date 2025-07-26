
import React, { useEffect } from 'react';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { useWorkspace } from './hooks/useWorkspace';
import MainLayout from './components/layout/MainLayout';

const AppContent: React.FC = () => {
    const { workspace } = useWorkspace();

    useEffect(() => {
        if (workspace?.settings) {
            const root = document.documentElement;
            const { editor } = workspace.settings;
            root.style.setProperty('--editor-font-family', editor.fontFamily);
            root.style.setProperty('--editor-font-size', `${editor.fontSize}px`);
            root.style.setProperty('--editor-line-height', editor.lineHeight.toString());
        }
    }, [workspace?.settings]);

    return <MainLayout />;
};


const App: React.FC = () => {
  return (
    <WorkspaceProvider>
      <AppContent />
    </WorkspaceProvider>
  );
};

export default App;