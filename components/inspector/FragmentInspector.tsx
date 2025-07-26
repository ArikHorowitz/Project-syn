import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { Fragment, FragmentType } from '../../types';
import { FileText, X } from 'lucide-react';

interface FragmentInspectorProps {
  fragment: Fragment;
}

const fragmentTypes: FragmentType[] = ['note', 'quote', 'idea', 'source', 'image'];

const FragmentInspector: React.FC<FragmentInspectorProps> = ({ fragment }) => {
  const { workspace, actions } = useWorkspace();
  const allParts = workspace?.toc ?? [];
  const activeFragmentTags = workspace?.uiState.activeFragmentTags ?? [];

  const [isEditingSource, setIsEditingSource] = useState(false);
  const [sourceValue, setSourceValue] = useState(fragment.source || '');
  const [newTag, setNewTag] = useState('');
  const sourceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSourceValue(fragment.source || '');
  }, [fragment.source]);

  useEffect(() => {
    if (isEditingSource) {
      sourceInputRef.current?.focus();
    }
  }, [isEditingSource]);

  const handleMetadataUpdate = (metadata: Partial<Omit<Fragment, 'id' | 'content' | 'createdAt'>>) => {
    actions.updateFragmentMetadata(fragment.id, metadata);
  };
  
  const handleSourceBlur = () => {
    setIsEditingSource(false);
    if(sourceValue !== fragment.source) {
       handleMetadataUpdate({ source: sourceValue.trim() });
    }
  };

  const handleSourceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSourceBlur();
    if (e.key === 'Escape') {
      setIsEditingSource(false);
      setSourceValue(fragment.source || '');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          const tagToAdd = newTag.trim();
          if (tagToAdd && !fragment.tags.includes(tagToAdd)) {
              handleMetadataUpdate({ tags: [...fragment.tags, tagToAdd] });
          }
          setNewTag('');
      }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleMetadataUpdate({ tags: fragment.tags.filter(t => t !== tagToRemove) });
  }

  const backlinks = allParts.flatMap(part => 
    part.chapters
      .filter(chapter => chapter.fragmentIds.includes(fragment.id))
      .map(chapter => ({ ...chapter, partTitle: part.title }))
  );

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-base font-semibold text-zinc-300 mb-3">Metadata</h3>
        <div className="text-sm space-y-3 text-zinc-400">
          <div className="flex items-center">
            <strong className="text-zinc-500 w-20 flex-shrink-0">Type:</strong>
            <select
                value={fragment.type}
                onChange={(e) => handleMetadataUpdate({ type: e.target.value as FragmentType })}
                className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-zinc-300 w-full focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
                {fragmentTypes.map(type => (
                    <option key={type} value={type} className="capitalize">{type}</option>
                ))}
            </select>
          </div>
          <div className="flex items-center">
            <strong className="text-zinc-500 w-20 flex-shrink-0">Source:</strong>
            {isEditingSource ? (
                <input
                    ref={sourceInputRef}
                    type="text"
                    value={sourceValue}
                    onChange={e => setSourceValue(e.target.value)}
                    onBlur={handleSourceBlur}
                    onKeyDown={handleSourceKeyDown}
                    className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-zinc-300 w-full focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
            ) : (
                <span onClick={() => setIsEditingSource(true)} className="w-full cursor-text hover:bg-zinc-800 p-1 rounded-md">
                    {fragment.source || <span className="text-zinc-500 italic">N/A</span>}
                </span>
            )}
          </div>
           <div className="flex flex-col">
            <strong className="text-zinc-500 mb-2">Tags:</strong>
            <div className="flex flex-wrap gap-2">
                {fragment.tags.map(tag => (
                    <div key={tag} className={`flex items-center gap-1 text-xs rounded-full border ${activeFragmentTags.includes(tag) ? 'tag-filter-active' : 'border-zinc-700 bg-zinc-800'}`}>
                        <button onClick={() => actions.toggleFragmentTagFilter(tag)} className="px-2 py-1 hover:text-white">
                           {tag}
                        </button>
                        <button onClick={() => handleRemoveTag(tag)} className="pr-1 text-zinc-500 hover:text-white">
                            <X size={14}/>
                        </button>
                    </div>
                ))}
                 <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tag..."
                    className="bg-transparent border-b border-zinc-700 focus:border-sky-500 focus:outline-none text-zinc-300 flex-grow"
                />
            </div>
          </div>
           <p><strong className="text-zinc-500">Created:</strong> {new Date(fragment.createdAt).toLocaleString()}</p>
           <p><strong className="text-zinc-500">Updated:</strong> {new Date(fragment.updatedAt).toLocaleString()}</p>
        </div>
      </div>
       <div>
        <h3 className="text-base font-semibold text-zinc-300 mb-3">Linked In ({backlinks.length})</h3>
        {backlinks.length > 0 ? (
          <div className="space-y-2">
            {backlinks.map(chapter => (
              <div 
                key={chapter.id}
                onClick={() => actions.openChapter(chapter.id)}
                className="group flex items-center gap-2 bg-zinc-800 p-2 rounded-md cursor-pointer hover:bg-zinc-700"
              >
                <FileText size={16} className="text-sky-500 flex-shrink-0" />
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm text-zinc-300 truncate">{chapter.title}</p>
                    <p className="text-xs text-zinc-500 truncate">{chapter.partTitle}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">Not linked in any chapters.</p>
        )}
      </div>
    </div>
  );
};

export default FragmentInspector;