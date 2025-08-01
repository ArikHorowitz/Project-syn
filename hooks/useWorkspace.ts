import { useContext } from 'react';
import { WorkspaceContext } from '../contexts/WorkspaceContext';

/**
 * Custom hook to access the WorkspaceContext.
 * Throws an error if used outside of a WorkspaceProvider.
 */
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};