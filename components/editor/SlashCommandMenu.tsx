
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CommandItem } from './SlashCommands';

interface SlashCommandMenuProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

const SlashCommandMenu = forwardRef((props: SlashCommandMenuProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));
  
  if (props.items.length === 0) {
    return null;
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-md shadow-lg p-1 w-64 text-zinc-300">
      {props.items.map((item, index) => (
        <button
          key={item.title}
          className={`w-full flex items-center gap-3 text-left px-2 py-1.5 rounded-md ${
            index === selectedIndex ? 'bg-sky-600/50 text-white' : 'hover:bg-zinc-700'
          }`}
          onClick={() => selectItem(index)}
        >
          <div className="p-1 bg-zinc-700 rounded-sm">
            <item.icon size={18} />
          </div>
          <span className="text-sm">{item.title}</span>
        </button>
      ))}
    </div>
  );
});

export default SlashCommandMenu;
