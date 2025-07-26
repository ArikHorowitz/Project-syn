import React, { useMemo } from 'react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { Plus, Clock, FileText, Pencil } from 'lucide-react';
import { Chapter, Fragment, Part } from '../../types'; // Import Part type

const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

const WelcomeScreen: React.FC = () => {
    const { workspace, actions } = useWorkspace();
    
    const recentItems = useMemo(() => {
        if (!workspace) return [];

        type RecentItem = (Chapter & { docType: 'chapter' }) | (Fragment & { docType: 'fragment' });

        const allItems: RecentItem[] = [
            // Added explicit types for p, c, and f
            ...workspace.toc.flatMap((p: Part) => p.chapters).map((c: Chapter) => ({...c, docType: 'chapter' as const })),
            ...workspace.fragments.map((f: Fragment) => ({...f, docType: 'fragment' as const }))
        ];

        return allItems
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5);

    }, [workspace]);

    const handleNewChapter = () => {
        const firstPartId = workspace?.toc[0]?.id;
        // If any part exists, add a chapter to the first one.
        if (firstPartId) {
            actions.addChapter(firstPartId);
        } else {
            // If no parts exist, create a new part *and* a chapter within it atomically.
            actions.addPartAndChapter();
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 text-zinc-400 select-none">
            <h1 className="text-4xl font-bold text-zinc-200">Synthia</h1>
            <p className="mt-2 text-zinc-500">Your IDE for writing.</p>

            <div className="mt-12 w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Quick Start */}
                <div className="bg-zinc-800/50 p-6 rounded-lg text-left">
                    <h3 className="text-lg font-semibold text-zinc-300 mb-4">Quick Start</h3>
                    <div className="space-y-3">
                         <button onClick={handleNewChapter} className="w-full flex items-center gap-3 p-3 rounded-md bg-zinc-700/50 hover:bg-zinc-700 transition-colors">
                            <Plus size={18} className="text-sky-400" />
                            <span className="text-zinc-300">New Chapter</span>
                        </button>
                         <button onClick={actions.addFragment} className="w-full flex items-center gap-3 p-3 rounded-md bg-zinc-700/50 hover:bg-zinc-700 transition-colors">
                            <Plus size={18} className="text-amber-400" />
                            <span className="text-zinc-300">New Fragment</span>
                        </button>
                    </div>
                </div>

                {/* Recents */}
                <div className="bg-zinc-800/50 p-6 rounded-lg text-left">
                    <h3 className="text-lg font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                        <Clock size={18} />
                        Recent
                    </h3>
                     <div className="space-y-1">
                        {recentItems.map(item => (
                            <button 
                                key={item.id}
                                onClick={() => item.docType === 'chapter' ? actions.openChapter(item.id) : actions.openFragment(item.id)}
                                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-zinc-700/80 transition-colors"
                            >
                                {item.docType === 'chapter' ? <FileText size={16} className="text-sky-400" /> : <Pencil size={16} className="text-amber-400" />}
                                <span className="flex-1 text-zinc-300 truncate text-sm">{item.docType === 'chapter' ? item.title : (item.content.replace(/<[^>]+>/g, '').substring(0,40) || 'Untitled') + '...'}</span>
                                <span className="text-xs text-zinc-500">{timeSince(new Date(item.updatedAt))}</span>
                            </button>
                        ))}
                     </div>
                </div>
            </div>

             <div className="mt-12 text-sm text-zinc-600">
                <p>Press <kbd className="px-2 py-1 bg-zinc-700 rounded-md">Cmd+K</kbd> to open the Command Palette.</p>
            </div>
        </div>
    );
};

export default WelcomeScreen;