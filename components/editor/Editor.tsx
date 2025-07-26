
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SlashCommandsExtension } from './SlashCommands';
import Placeholder from '@tiptap/extension-placeholder';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
        StarterKit.configure({
            heading: {
                levels: [1, 2, 3],
            },
            horizontalRule: {
                HTMLAttributes: {
                    class: 'border-slate-700',
                },
            },
        }),
        Placeholder.configure({
            placeholder: `Type '/' for commands...`,
        }),
        SlashCommandsExtension,
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert focus:outline-none max-w-full',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && !editor.isFocused && editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false }); // Prevent re-triggering onUpdate
    }
  }, [content, editor]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
        <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;