import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

// Toolbar components
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Link as LinkIcon, List, ListOrdered, Quote, Undo, Redo, Table as TableIcon, Highlight as HighlightIcon, CheckSquare } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readonly?: boolean;
  maxLength?: number;
  minHeight?: number;
  showWordCount?: boolean;
  enableTables?: boolean;
  enableTaskLists?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  onClick, 
  active = false, 
  disabled = false, 
  children, 
  title 
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    aria-pressed={active}
    className={`
      p-2 rounded border border-border hover:bg-muted transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none
      ${active ? 'bg-accent text-accent-foreground' : 'bg-background'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {children}
  </button>
);

const ToolbarDivider: React.FC = () => (
  <div className="w-px h-6 bg-border mx-1" />
);

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  readonly = false,
  maxLength,
  minHeight = 200,
  showWordCount = true,
  enableTables = true,
  enableTaskLists = true,
  className = '',
  onFocus,
  onBlur,
}) => {
  const extensions = [
    StarterKit.configure({
      history: {
        depth: 50,
      },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 underline hover:text-blue-800',
      },
    }),
    Placeholder.configure({
      placeholder,
    }),
    Highlight.configure({
      HTMLAttributes: {
        class: 'bg-yellow-200 text-yellow-900 px-1 rounded',
      },
    }),
    Underline,
    ...(maxLength ? [CharacterCount.configure({ limit: maxLength })] : [CharacterCount]),
    ...(enableTables ? [
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-border',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border border-border',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border bg-muted p-2 font-medium',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-2',
        },
      }),
    ] : []),
    ...(enableTaskLists ? [
      TaskList.configure({
        HTMLAttributes: {
          class: 'space-y-1',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
      }),
    ] : []),
  ];

  const editor = useEditor({
    extensions,
    content: value,
    editable: !readonly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    onFocus,
    onBlur,
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none p-4 focus:outline-none ${readonly ? 'cursor-default' : 'cursor-text'}`,
        style: `min-height: ${minHeight}px;`,
        'aria-label': readonly ? 'Read-only text content' : 'Rich text editor',
        'aria-multiline': 'true',
        role: 'textbox',
        'aria-required': 'true',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const addLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div className={`border border-border rounded-md ${className}`}>
        <div className="p-4 text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  const wordCount = editor.storage.characterCount.words();
  const characterCount = editor.storage.characterCount.characters();
  const characterLimit = maxLength || 0;

  return (
    <div className={`border border-border rounded-md overflow-hidden ${className}`} role="region" aria-label="Rich text editor">
      {/* Toolbar */}
      {!readonly && (
        <div 
          className="border-b border-border bg-muted/30 p-2 flex items-center gap-1 flex-wrap"
          role="toolbar"
          aria-label="Text formatting options"
        >
          {/* Basic formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            active={editor.isActive('highlight')}
            title="Highlight"
          >
            <HighlightIcon size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            title="Inline Code"
          >
            <Code size={16} />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </ToolbarButton>

          {enableTaskLists && (
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              active={editor.isActive('taskList')}
              title="Task List"
            >
              <CheckSquare size={16} />
            </ToolbarButton>
          )}

          <ToolbarDivider />

          {/* Links and other elements */}
          <ToolbarButton
            onClick={addLink}
            active={editor.isActive('link')}
            title="Add Link"
          >
            <LinkIcon size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote size={16} />
          </ToolbarButton>

          {enableTables && (
            <ToolbarButton
              onClick={insertTable}
              title="Insert Table"
            >
              <TableIcon size={16} />
            </ToolbarButton>
          )}

          <ToolbarDivider />

          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo size={16} />
          </ToolbarButton>
        </div>
      )}

      {/* Editor content */}
      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none"
        />
      </div>

      {/* Footer with word count */}
      {(showWordCount || maxLength) && (
        <div className="border-t border-border bg-muted/10 px-4 py-2 text-xs text-muted-foreground flex justify-between items-center">
          {showWordCount && (
            <span>
              {wordCount} words • {characterCount} characters
            </span>
          )}
          {maxLength && (
            <span className={characterCount > characterLimit ? 'text-red-600' : ''}>
              {characterCount}/{characterLimit}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;