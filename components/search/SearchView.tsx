import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { FileText, Pencil } from 'lucide-react';
import Highlight from './Highlight';

const SearchView: React.FC = () => {
  const { workspace, actions } = useWorkspace();
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query || !workspace) {
      return { chapters: [], fragments: [] };
    }

    const lowerCaseQuery = query.toLowerCase();
    const tempEl = document.createElement('div');
    
    // Search chapters
    const chapters = workspace.toc
      .flatMap(part => part.chapters.map(chapter => ({ ...chapter, partTitle: part.title })))
      .map(chapter => {
        tempEl.innerHTML = chapter.content;
        const contentText = tempEl.textContent || '';
        return {
          ...chapter,
          matches: chapter.title.toLowerCase().includes(lowerCaseQuery) || contentText.toLowerCase().includes(lowerCaseQuery)
        };
      })
      .filter(chapter => chapter.matches);

    // Search fragments
    const fragments = workspace.fragments
      .map(fragment => {
        tempEl.innerHTML = fragment.content;
        const contentText = tempEl.textContent || '';
        return {
          ...fragment,
          matches: contentText.toLowerCase().includes(lowerCaseQuery)
        };
      })
      .filter(fragment => fragment.matches);

    return { chapters, fragments };
  }, [query, workspace]);

  const handleChapterClick = (chapterId: string) => {
    actions.openChapter(chapterId);
    actions.setSidebarView('explorer');
  };

  const handleFragmentClick = (fragmentId: string) => {
    actions.openFragment(fragmentId);
    actions.setSidebarView('explorer');
  };

  const getTextContent = (html: string) => {
      const tempEl = document.createElement('div');
      tempEl.innerHTML = html;
      return tempEl.textContent || '';
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-zinc-800">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search all documents..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {query && (
          <div className="space-y-4">
            {searchResults.chapters.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase text-zinc-500 mb-2 px-1">Chapters</h3>
                <div className="space-y-1">
                  {searchResults.chapters.map(chapter => (
                    <div key={chapter.id} onClick={() => handleChapterClick(chapter.id)} className="p-2 rounded-md hover:bg-zinc-800 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-sky-500" />
                        <p className="text-sm text-zinc-300 truncate font-semibold"><Highlight text={chapter.title} highlight={query} /></p>
                      </div>
                       <p className="text-xs text-zinc-500 truncate mt-1 ml-6"><Highlight text={getTextContent(chapter.content)} highlight={query} /></p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {searchResults.fragments.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase text-zinc-500 mb-2 px-1">Fragments</h3>
                <div className="space-y-1">
                  {searchResults.fragments.map(fragment => (
                    <div key={fragment.id} onClick={() => handleFragmentClick(fragment.id)} className="p-2 rounded-md hover:bg-zinc-800 cursor-pointer">
                       <div className="flex items-center gap-2">
                        <Pencil size={14} className="text-amber-500" />
                        <p className="text-sm text-zinc-400 truncate"><Highlight text={getTextContent(fragment.content)} highlight={query} /></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {searchResults.chapters.length === 0 && searchResults.fragments.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-4">No results for "{query}"</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;
