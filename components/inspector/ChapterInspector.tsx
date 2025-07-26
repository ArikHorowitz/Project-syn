import React from 'react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { Chapter, Fragment } from '../../types';
import { Link, Link2Off } from 'lucide-react';

interface ChapterInspectorProps {
  chapter: Chapter;
}

const ChapterInspector: React.FC<ChapterInspectorProps> = ({ chapter }) => {
  const { workspace, actions } = useWorkspace();
  const allFragments = workspace?.fragments ?? [];

  const linkedFragments = allFragments.filter(f => chapter.fragmentIds.includes(f.id));
  const unlinkedFragments = allFragments.filter(f => !chapter.fragmentIds.includes(f.id));

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-base font-semibold text-zinc-300 mb-2">Linked Fragments</h3>
        {linkedFragments.length > 0 ? (
          <div className="space-y-2">
            {linkedFragments.map(fragment => (
              <FragmentLinkItem 
                key={fragment.id} 
                fragment={fragment} 
                isLinked={true} 
                onToggle={() => actions.unlinkFragmentFromChapter(fragment.id, chapter.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">No fragments linked to this chapter.</p>
        )}
      </div>

      <div>
        <h3 className="text-base font-semibold text-zinc-300 mb-2">Available Fragments</h3>
         {unlinkedFragments.length > 0 ? (
          <div className="space-y-2">
            {unlinkedFragments.map(fragment => (
               <FragmentLinkItem 
                key={fragment.id} 
                fragment={fragment} 
                isLinked={false} 
                onToggle={() => actions.linkFragmentToChapter(fragment.id, chapter.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">All fragments are linked.</p>
        )}
      </div>
    </div>
  );
};

interface FragmentLinkItemProps {
    fragment: Fragment;
    isLinked: boolean;
    onToggle: () => void;
}

const FragmentLinkItem: React.FC<FragmentLinkItemProps> = ({ fragment, isLinked, onToggle}) => {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = fragment.content;
    const preview = tempEl.textContent || '';
    
    return (
        <div className="group flex items-center justify-between bg-zinc-800 p-2 rounded-md">
            <p className="text-sm text-zinc-400 truncate pr-2 flex-1">{preview}</p>
            <button onClick={onToggle} className="p-1 rounded-md text-zinc-500 hover:text-white">
                {isLinked ? 
                 <Link2Off size={16} className="group-hover:text-red-400"/> : 
                 <Link size={16} className="group-hover:text-sky-400"/>
                }
            </button>
        </div>
    )
}

export default ChapterInspector;
