import React from 'react';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance } from 'tippy.js';
import SlashCommandMenu from './SlashCommandMenu';
import { Editor, Range, Extension } from '@tiptap/core';
import {
  Heading1, Heading2, Heading3, TextQuote, Minus
} from 'lucide-react';
import { Suggestion, SuggestionOptions } from '@tiptap/suggestion';

export interface CommandItem {
  title: string;
  icon: React.ElementType;
  command: ({ editor, range }: { editor: Editor; range: Range }) => void;
}

const getCommandItems = (): CommandItem[] => [
  {
    title: 'Heading 1',
    icon: Heading1,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
    },
  },
  {
    title: 'Heading 2',
    icon: Heading2,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
    },
  },
    {
    title: 'Heading 3',
    icon: Heading3,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
    },
  },
  {
    title: 'Blockquote',
    icon: TextQuote,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: 'Divider',
    icon: Minus,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
];

type SuggestionRendererProps = {
  editor: Editor;
  clientRect?: (() => DOMRect);
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

const commandRenderer = () => {
  let component: ReactRenderer | null = null;
  let popup: Instance[] | null = null;

  return {
    onStart: (props: SuggestionRendererProps) => {
      if (props.items.length === 0) {
        return;
      }

      component = new ReactRenderer(SlashCommandMenu, {
        props: {
          items: props.items,
          command: props.command,
        },
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      });
    },

    onUpdate(props: SuggestionRendererProps) {
      if (props.items.length === 0) {
        popup?.[0].hide();
        return;
      }
      
      component?.updateProps({
          items: props.items,
          command: props.command,
      });

      if (popup) {
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      }
    },

    onKeyDown(props: { event: KeyboardEvent }) {
      if (props.event.key === 'Escape') {
        popup?.[0].hide();
        return true;
      }
      return (component?.ref as any)?.onKeyDown(props) ?? false;
    },

    onExit() {
      popup?.[0].destroy();
      component?.destroy();
      popup = null;
      component = null;
    },
  };
};

const suggestionOptions: Omit<SuggestionOptions, 'editor'> = {
  items: ({ query }) => {
    return getCommandItems()
        .filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, 10);
  },
  char: '/',
  command: ({ editor, range, props }) => {
    props.command({ editor, range });
  },
  render: commandRenderer,
};


export const SlashCommandsExtension = Extension.create({
  name: 'slash-commands-suggestion',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...suggestionOptions,
      }),
    ];
  },
});