import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { generateCommands } from '../../constants/commands';
import { Command as CommandIcon } from 'lucide-react';
import type { Command } from '../../types';

const CommandPalette: React.FC = () => {
  const { workspace, actions } = useWorkspace();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const allCommands = useMemo(() => generateCommands(workspace, actions), [workspace, actions]);

  const filteredCommands = useMemo(() => {
    if (!query) return allCommands;
    const lowerCaseQuery = query.toLowerCase();
    return allCommands.filter(cmd =>
      cmd.label.toLowerCase().includes(lowerCaseQuery) ||
      cmd.category.toLowerCase().includes(lowerCaseQuery)
    );
  }, [query, allCommands]);

  const groupedCommands = useMemo(() => {
    return filteredCommands.reduce((acc, cmd) => {
      (acc[cmd.category] = acc[cmd.category] || []).push(cmd);
      return acc;
    }, {} as Record<string, Command[]>);
  }, [filteredCommands]);

  const executeCommand = (command: Command) => {
    command.onExecute();
    actions.toggleCommandPalette();
  };

  useEffect(() => {
    // Reset selection when query changes
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command && !command.disabled) {
          executeCommand(command);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        actions.toggleCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, actions]);

  useEffect(() => {
    // Scroll selection into view
    const selectedElement = resultsRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20" onClick={actions.toggleCommandPalette}>
      <div
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-3 border-b border-zinc-700">
          <CommandIcon size={20} className="text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-zinc-200 placeholder-zinc-500 focus:outline-none"
          />
        </div>
        <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto p-2">
          {Object.entries(groupedCommands).map(([category, commands]) => (
            <div key={category} className="mb-2">
              <h3 className="text-xs font-semibold uppercase text-zinc-500 px-2 py-1">{category}</h3>
              {commands.map(cmd => {
                const currentIndex = filteredCommands.findIndex(c => c.id === cmd.id);
                const isDisabled = cmd.disabled ?? false;
                return (
                  <div
                    key={cmd.id}
                    data-index={currentIndex}
                    onMouseMove={() => setSelectedIndex(currentIndex)}
                    onClick={() => {
                        if (!isDisabled) executeCommand(cmd);
                    }}
                    className={`flex items-center gap-3 p-2 rounded-md text-sm ${
                      isDisabled 
                        ? 'cursor-not-allowed text-zinc-600'
                        : `cursor-pointer ${selectedIndex === currentIndex ? 'bg-sky-600/50 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`
                    }`}
                  >
                    <cmd.icon size={16} className={`flex-shrink-0 ${isDisabled ? '' : 'text-zinc-400'}`} />
                    <span>{cmd.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
          {filteredCommands.length === 0 && (
            <div className="text-center p-4 text-zinc-500">No results found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;