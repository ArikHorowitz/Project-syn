import type { WorkspaceContextType } from '../contexts/WorkspaceContext';
import { WorkspaceState, Command, CommandCategory } from '../types';
import { FileText, Pencil, Plus, Eye, EyeOff, PanelTop, PanelTopOpen, PlusSquare, Trash2, Edit, Save, Upload, Download } from 'lucide-react';

// --- Helper Functions ---

const getFragmentPreview = (content: string) => {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = content;
    return tempEl.textContent?.substring(0, 50) || 'Untitled Fragment';
};

const triggerDownload = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const htmlToText = (html: string): string => {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = html;
    // Replace block elements with newlines for better readability
    tempEl.querySelectorAll('p, h1, h2, h3, h4, h5, h6, blockquote, pre, hr').forEach(el => {
        el.appendChild(document.createTextNode('\n'));
    });
    return tempEl.textContent || '';
};

const htmlToMarkdown = (html: string): string => {
    let markdown = html
        .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
        .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
        .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
        .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
        .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<em>(.*?)<\/em>/gi, '*$1*')
        .replace(/<blockquote>(.*?)<\/blockquote>/gi, '> $1\n\n')
        .replace(/<hr>/gi, '---\n\n')
        // Basic list support
        .replace(/<ul>/gi, '').replace(/<\/ul>/gi, '')
        .replace(/<ol>/gi, '').replace(/<\/ol>/gi, '')
        .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
        // Tidy up excessive newlines
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    return markdown;
};

// --- Command Definitions ---

export const generateCommands = (
    workspace: WorkspaceState | null,
    actions: WorkspaceContextType['actions']
): Command[] => {
    if (!workspace) return [];

    const { uiState, toc, fragments } = workspace;
    const activeGroup = uiState.tabGroups.find(g => g.id === uiState.activeGroupId);
    const activeId = activeGroup?.activeTabId;

    const activeChapter = activeId ? toc.flatMap(p => p.chapters).find(c => c.id === activeId) : null;
    const activeFragment = activeId ? fragments.find(f => f.id === activeId) : null;
    const activePartForChapter = activeChapter ? toc.find(p => p.chapters.some(c => c.id === activeChapter.id)) : null;

    const navigationCommands: Command[] = [];
    toc.forEach(part => {
        part.chapters.forEach(chapter => {
            navigationCommands.push({
                id: `goto-chapter-${chapter.id}`,
                label: `Go to Chapter: ${chapter.title}`,
                category: 'Navigation',
                icon: FileText,
                onExecute: () => actions.openChapter(chapter.id),
            });
        });
    });

    fragments.forEach(fragment => {
        navigationCommands.push({
            id: `goto-fragment-${fragment.id}`,
            label: `Go to Fragment: ${getFragmentPreview(fragment.content)}...`,
            category: 'Navigation',
            icon: Pencil,
            onExecute: () => actions.openFragment(fragment.id),
        });
    });

    const uiCommands: Command[] = [
        {
            id: 'toggle-inspector',
            label: `UI: ${uiState.inspectorOpen ? 'Hide' : 'Show'} Inspector`,
            category: 'UI',
            icon: uiState.inspectorOpen ? EyeOff : Eye,
            onExecute: actions.toggleInspector,
        },
        {
            id: 'toggle-fragments-panel',
            label: `UI: ${uiState.bottomPanelOpen ? 'Hide' : 'Show'} Fragments Panel`,
            category: 'UI',
            icon: uiState.bottomPanelOpen ? PanelTop : PanelTopOpen,
            onExecute: actions.toggleBottomPanel,
        }
    ];

    const fragmentCommands: Command[] = [
        {
            id: 'create-fragment',
            label: 'Fragment: Create New',
            category: 'Fragments',
            icon: Plus,
            onExecute: actions.addFragment,
        },
    ];
    
    const tocCommands: Command[] = [
        {
            id: 'create-part',
            label: 'TOC: New Part',
            category: 'TOC',
            icon: PlusSquare,
            onExecute: actions.addPart,
        },
        {
            id: 'create-chapter',
            label: 'TOC: New Chapter in Current Part',
            category: 'TOC',
            icon: Plus,
            onExecute: () => {
                if(activePartForChapter) actions.addChapter(activePartForChapter.id)
            },
            disabled: !activePartForChapter,
        },
        {
            id: 'rename-item',
            label: 'TOC: Rename Active Item',
            category: 'TOC',
            icon: Edit,
            onExecute: () => {
                if(activeId) actions.setRenamingId(activeId)
            },
            disabled: !activeId || !toc.some(p => p.id === activeId || p.chapters.some(c => c.id === activeId))
        },
        {
            id: 'delete-item',
            label: 'TOC: Delete Active Item',
            category: 'TOC',
            icon: Trash2,
            onExecute: () => {
                 if(activeChapter) {
                    actions.deleteChapter(activeChapter.id);
                 } else if (activeId && toc.some(p => p.id === activeId)) {
                     actions.deletePart(activeId);
                 }
            },
            disabled: !activeId || !toc.some(p => p.id === activeId || p.chapters.some(c => c.id === activeId)),
        }
    ];

    const workspaceCommands: Command[] = [
        {
            id: 'export-workspace',
            label: 'Workspace: Export as JSON backup',
            category: 'Workspace',
            icon: Save,
            onExecute: () => {
                const dataStr = JSON.stringify(workspace, null, 2);
                triggerDownload('synthia-workspace-backup.json', dataStr, 'application/json');
            }
        },
        {
            id: 'import-workspace',
            label: 'Workspace: Import from JSON backup',
            category: 'Workspace',
            icon: Upload,
            onExecute: () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const importedState = JSON.parse(event.target?.result as string) as WorkspaceState;
                            if (importedState.toc && importedState.fragments && importedState.uiState) {
                                if (window.confirm('This will overwrite your current workspace. Are you sure?')) {
                                    actions.replaceWorkspace(importedState);
                                    alert('Workspace imported successfully!');
                                }
                            } else { throw new Error('Invalid workspace file.'); }
                        } catch (err) {
                            console.error('Failed to import workspace:', err);
                            alert('Error: Could not import workspace. The file may be invalid or corrupted.');
                        }
                    };
                    reader.readAsText(file);
                };
                input.click();
            }
        }
    ];

    const exportCommands: Command[] = [
        {
            id: 'export-active-md',
            label: 'Export: Active Document as Markdown (.md)',
            category: 'Export',
            icon: Download,
            disabled: !activeId,
            onExecute: () => {
                const doc = activeChapter || activeFragment;
                if (doc) {
                    const title = activeChapter ? activeChapter.title : getFragmentPreview(activeFragment!.content);
                    const filename = `${title.replace(/ /g, '_')}.md`;
                    const markdown = htmlToMarkdown(doc.content);
                    triggerDownload(filename, markdown, 'text/markdown');
                }
            }
        },
        {
            id: 'export-active-txt',
            label: 'Export: Active Document as Plain Text (.txt)',
            category: 'Export',
            icon: Download,
            disabled: !activeId,
            onExecute: () => {
                const doc = activeChapter || activeFragment;
                if (doc) {
                    const title = activeChapter ? activeChapter.title : getFragmentPreview(activeFragment!.content);
                    const filename = `${title.replace(/ /g, '_')}.txt`;
                    const text = htmlToText(doc.content);
                    triggerDownload(filename, text, 'text/plain');
                }
            }
        },
        {
            id: 'export-manuscript-md',
            label: 'Export: Full Manuscript as Markdown (.md)',
            category: 'Export',
            icon: Download,
            onExecute: () => {
                const content = toc.map(part => {
                    const partTitle = `# ${part.title}`;
                    const chaptersContent = part.chapters.map(ch => `## ${ch.title}\n\n${htmlToMarkdown(ch.content)}`).join('\n\n');
                    return `${partTitle}\n\n${chaptersContent}`;
                }).join('\n\n---\n\n');
                triggerDownload('manuscript.md', content, 'text/markdown');
            }
        },
        {
            id: 'export-manuscript-txt',
            label: 'Export: Full Manuscript as Plain Text (.txt)',
            category: 'Export',
            icon: Download,
            onExecute: () => {
                const content = toc.map(part => {
                    const partTitle = `PART: ${part.title}`;
                    const chaptersContent = part.chapters.map(ch => `CHAPTER: ${ch.title}\n\n${htmlToText(ch.content)}`).join('\n\n');
                    return `${partTitle}\n\n${chaptersContent}`;
                }).join('\n\n\n');
                triggerDownload('manuscript.txt', content, 'text/plain');
            }
        }
    ];

    return [...navigationCommands, ...uiCommands, ...exportCommands, ...fragmentCommands, ...tocCommands, ...workspaceCommands];
};