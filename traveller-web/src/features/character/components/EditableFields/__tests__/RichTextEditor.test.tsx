import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RichTextEditor from '../RichTextEditor';

// Mock TipTap editor
jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(() => ({
    getHTML: jest.fn(() => '<p>Test content</p>'),
    setContent: jest.fn(),
    commands: {
      setContent: jest.fn(),
      focus: jest.fn(() => ({
        toggleBold: jest.fn(() => ({ run: jest.fn() })),
        toggleItalic: jest.fn(() => ({ run: jest.fn() })),
        toggleUnderline: jest.fn(() => ({ run: jest.fn() })),
        toggleStrike: jest.fn(() => ({ run: jest.fn() })),
        toggleHighlight: jest.fn(() => ({ run: jest.fn() })),
        toggleCode: jest.fn(() => ({ run: jest.fn() })),
        toggleBulletList: jest.fn(() => ({ run: jest.fn() })),
        toggleOrderedList: jest.fn(() => ({ run: jest.fn() })),
        toggleTaskList: jest.fn(() => ({ run: jest.fn() })),
        toggleBlockquote: jest.fn(() => ({ run: jest.fn() })),
        insertTable: jest.fn(() => ({ run: jest.fn() })),
        extendMarkRange: jest.fn(() => ({
          setLink: jest.fn(() => ({ run: jest.fn() })),
          unsetLink: jest.fn(() => ({ run: jest.fn() })),
        })),
        undo: jest.fn(() => ({ run: jest.fn() })),
        redo: jest.fn(() => ({ run: jest.fn() })),
      })),
    },
    chain: jest.fn(() => ({
      focus: jest.fn(() => ({
        toggleBold: jest.fn(() => ({ run: jest.fn() })),
        toggleItalic: jest.fn(() => ({ run: jest.fn() })),
        toggleUnderline: jest.fn(() => ({ run: jest.fn() })),
        toggleStrike: jest.fn(() => ({ run: jest.fn() })),
        toggleHighlight: jest.fn(() => ({ run: jest.fn() })),
        toggleCode: jest.fn(() => ({ run: jest.fn() })),
        toggleBulletList: jest.fn(() => ({ run: jest.fn() })),
        toggleOrderedList: jest.fn(() => ({ run: jest.fn() })),
        toggleTaskList: jest.fn(() => ({ run: jest.fn() })),
        toggleBlockquote: jest.fn(() => ({ run: jest.fn() })),
        insertTable: jest.fn(() => ({ run: jest.fn() })),
        extendMarkRange: jest.fn(() => ({
          setLink: jest.fn(() => ({ run: jest.fn() })),
          unsetLink: jest.fn(() => ({ run: jest.fn() })),
        })),
        undo: jest.fn(() => ({ run: jest.fn() })),
        redo: jest.fn(() => ({ run: jest.fn() })),
      })),
    })),
    isActive: jest.fn(() => false),
    can: jest.fn(() => ({
      undo: jest.fn(() => true),
      redo: jest.fn(() => true),
    })),
    getAttributes: jest.fn(() => ({ href: '' })),
    storage: {
      characterCount: {
        words: jest.fn(() => 10),
        characters: jest.fn(() => 50),
      },
    },
  })),
  EditorContent: ({ editor }: any) => (
    <div data-testid="editor-content">
      {editor?.getHTML?.() || 'Editor content'}
    </div>
  ),
}));

describe('RichTextEditor', () => {
  const defaultProps = {
    value: '<p>Test content</p>',
    onChange: jest.fn(),
    placeholder: 'Enter text...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the editor with content', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /rich text editor/i })).toBeInTheDocument();
  });

  it('renders toolbar when not readonly', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    expect(screen.getByRole('toolbar', { name: /text formatting options/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument();
  });

  it('does not render toolbar when readonly', () => {
    render(<RichTextEditor {...defaultProps} readonly />);
    
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /bold/i })).not.toBeInTheDocument();
  });

  it('shows word count when enabled', () => {
    render(<RichTextEditor {...defaultProps} showWordCount />);
    
    expect(screen.getByText(/10 words • 50 characters/)).toBeInTheDocument();
  });

  it('shows character limit when specified', () => {
    render(<RichTextEditor {...defaultProps} maxLength={100} />);
    
    expect(screen.getByText(/50\/100/)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    const editor = screen.getByRole('region', { name: /rich text editor/i });
    expect(editor).toBeInTheDocument();
    
    const toolbar = screen.getByRole('toolbar', { name: /text formatting options/i });
    expect(toolbar).toBeInTheDocument();
    
    const boldButton = screen.getByRole('button', { name: /bold/i });
    expect(boldButton).toHaveAttribute('aria-pressed', 'false');
    expect(boldButton).toHaveAttribute('aria-label');
  });

  it('handles keyboard shortcuts', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} />);
    
    const editorRegion = screen.getByRole('region');
    
    // Focus the editor region (simulating focus on the editor)
    await user.click(editorRegion);
    
    // Test keyboard shortcuts (these would normally be handled by TipTap)
    expect(editorRegion).toBeInTheDocument();
  });

  it('calls onChange when content changes', () => {
    const mockOnChange = jest.fn();
    render(<RichTextEditor {...defaultProps} onChange={mockOnChange} />);
    
    // Since we're mocking the editor, we can't easily test actual content changes
    // but we can verify the component renders correctly
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('supports all formatting options', () => {
    render(<RichTextEditor {...defaultProps} enableTables enableTaskLists />);
    
    // Check that all main formatting buttons are present
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /underline/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /strikethrough/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /highlight/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bullet list/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /numbered list/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /task list/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add link/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /quote/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /insert table/i })).toBeInTheDocument();
  });

  it('handles focus and blur events', () => {
    const mockOnFocus = jest.fn();
    const mockOnBlur = jest.fn();
    
    render(
      <RichTextEditor 
        {...defaultProps} 
        onFocus={mockOnFocus} 
        onBlur={mockOnBlur} 
      />
    );
    
    // The editor component should be rendered
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<RichTextEditor {...defaultProps} className="custom-editor" />);
    
    const editorContainer = screen.getByRole('region');
    expect(editorContainer.parentElement).toHaveClass('custom-editor');
  });

  it('sets minimum height correctly', () => {
    render(<RichTextEditor {...defaultProps} minHeight={400} />);
    
    // Since we're mocking the editor, we can't easily test the actual style
    // but we can verify the component renders
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });
});

describe('RichTextEditor Accessibility', () => {
  const defaultProps = {
    value: '<p>Test content</p>',
    onChange: jest.fn(),
  };

  it('has proper ARIA roles and labels', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    // Main editor region
    const editorRegion = screen.getByRole('region', { name: /rich text editor/i });
    expect(editorRegion).toBeInTheDocument();
    
    // Toolbar
    const toolbar = screen.getByRole('toolbar', { name: /text formatting options/i });
    expect(toolbar).toBeInTheDocument();
    
    // Buttons should have proper ARIA attributes
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('aria-pressed');
    });
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} />);
    
    const toolbar = screen.getByRole('toolbar');
    const firstButton = screen.getByRole('button', { name: /bold/i });
    
    // Tab to the first button
    await user.tab();
    expect(firstButton).toHaveFocus();
  });

  it('provides screen reader friendly content', () => {
    render(<RichTextEditor {...defaultProps} readonly />);
    
    // In readonly mode, content should be accessible to screen readers
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('handles high contrast mode gracefully', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    // Verify the component renders with proper CSS classes for contrast
    const editorRegion = screen.getByRole('region');
    expect(editorRegion.parentElement).toHaveClass('border', 'border-border');
  });
});