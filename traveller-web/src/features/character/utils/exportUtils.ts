import type { CharacterNote } from '../types/characterSheet';
import { htmlToMarkdown, extractPlainText } from './notesUtils';

export interface ExportOptions {
  format: 'json' | 'markdown' | 'html' | 'pdf';
  includePrivateNotes?: boolean;
  includeMetadata?: boolean;
  groupByCategory?: boolean;
  sortBy?: 'title' | 'date' | 'category';
  dateRange?: {
    start: string;
    end: string;
  };
  categories?: string[];
  tags?: string[];
}

export interface ImportResult {
  success: boolean;
  notes: CharacterNote[];
  errors: string[];
  warnings: string[];
  skipped: number;
  imported: number;
}

/**
 * Export notes to JSON format
 */
export const exportToJSON = (
  notes: CharacterNote[], 
  options: ExportOptions
): string => {
  const filteredNotes = filterNotesForExport(notes, options);
  const exportData = {
    exportedAt: new Date().toISOString(),
    format: 'json',
    version: '1.0',
    options,
    notes: options.includeMetadata 
      ? filteredNotes 
      : filteredNotes.map(({ metadata, ...note }) => note),
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Export notes to Markdown format
 */
export const exportToMarkdown = (
  notes: CharacterNote[], 
  options: ExportOptions
): string => {
  const filteredNotes = filterNotesForExport(notes, options);
  const sortedNotes = sortNotesForExport(filteredNotes, options.sortBy || 'date');
  
  let markdown = `# Character Notes Export\n\n`;
  markdown += `**Exported:** ${new Date().toLocaleDateString()}\n`;
  markdown += `**Total Notes:** ${sortedNotes.length}\n\n`;

  if (options.groupByCategory) {
    // Group by category
    const notesByCategory = sortedNotes.reduce((acc, note) => {
      const category = note.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(note);
      return acc;
    }, {} as Record<string, CharacterNote[]>);

    Object.entries(notesByCategory).forEach(([category, categoryNotes]) => {
      markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
      
      categoryNotes.forEach(note => {
        markdown += formatNoteAsMarkdown(note, options);
        markdown += '\n---\n\n';
      });
    });
  } else {
    // Sequential export
    sortedNotes.forEach(note => {
      markdown += formatNoteAsMarkdown(note, options);
      markdown += '\n---\n\n';
    });
  }

  return markdown;
};

/**
 * Export notes to HTML format
 */
export const exportToHTML = (
  notes: CharacterNote[], 
  options: ExportOptions
): string => {
  const filteredNotes = filterNotesForExport(notes, options);
  const sortedNotes = sortNotesForExport(filteredNotes, options.sortBy || 'date');

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Character Notes Export</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }
        .note {
            margin-bottom: 2rem;
            padding: 1.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: #f8fafc;
        }
        .note-header {
            display: flex;
            justify-content: between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }
        .note-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
        }
        .note-meta {
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 1rem;
        }
        .note-content {
            prose: true;
        }
        .note-tags {
            margin-top: 1rem;
        }
        .tag {
            display: inline-block;
            background: #e2e8f0;
            color: #374151;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            margin-right: 0.5rem;
        }
        .category-header {
            color: #1f2937;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 0.5rem;
            margin-bottom: 1.5rem;
            margin-top: 2rem;
        }
        .private-note {
            border-left: 4px solid #ef4444;
        }
        .favorite-note {
            border-left: 4px solid #f59e0b;
        }
        @media print {
            body { padding: 1rem; }
            .note { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <header>
        <h1>Character Notes Export</h1>
        <p><strong>Exported:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Total Notes:</strong> ${sortedNotes.length}</p>
    </header>
    
    <main>`;

  if (options.groupByCategory) {
    // Group by category
    const notesByCategory = sortedNotes.reduce((acc, note) => {
      const category = note.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(note);
      return acc;
    }, {} as Record<string, CharacterNote[]>);

    Object.entries(notesByCategory).forEach(([category, categoryNotes]) => {
      html += `<h2 class="category-header">${category.charAt(0).toUpperCase() + category.slice(1)}</h2>\n`;
      
      categoryNotes.forEach(note => {
        html += formatNoteAsHTML(note, options);
      });
    });
  } else {
    // Sequential export
    sortedNotes.forEach(note => {
      html += formatNoteAsHTML(note, options);
    });
  }

  html += `
    </main>
</body>
</html>`;

  return html;
};

/**
 * Import notes from JSON
 */
export const importFromJSON = (
  jsonData: string,
  existingNotes: CharacterNote[] = []
): ImportResult => {
  const result: ImportResult = {
    success: false,
    notes: [],
    errors: [],
    warnings: [],
    skipped: 0,
    imported: 0,
  };

  try {
    const data = JSON.parse(jsonData);
    
    if (!data.notes || !Array.isArray(data.notes)) {
      result.errors.push('Invalid JSON format: notes array not found');
      return result;
    }

    const existingIds = new Set(existingNotes.map(note => note.id));
    
    data.notes.forEach((noteData: any, index: number) => {
      try {
        // Validate required fields
        if (!noteData.title || !noteData.content) {
          result.warnings.push(`Note ${index + 1}: Missing required fields (title or content)`);
          result.skipped++;
          return;
        }

        // Check for duplicates
        if (noteData.id && existingIds.has(noteData.id)) {
          result.warnings.push(`Note ${index + 1}: Duplicate ID found, skipping`);
          result.skipped++;
          return;
        }

        // Create note with required fields
        const note: CharacterNote = {
          id: noteData.id || crypto.randomUUID(),
          title: noteData.title,
          content: noteData.content,
          plainTextContent: noteData.plainTextContent || extractPlainText(noteData.content),
          category: noteData.category || 'personal',
          subcategory: noteData.subcategory,
          isPrivate: noteData.isPrivate || false,
          isFavorite: noteData.isFavorite || false,
          createdAt: noteData.createdAt || new Date().toISOString(),
          updatedAt: noteData.updatedAt || new Date().toISOString(),
          tags: noteData.tags || [],
          color: noteData.color,
          metadata: noteData.metadata,
          relations: noteData.relations,
        };

        result.notes.push(note);
        result.imported++;
      } catch (error) {
        result.errors.push(`Note ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        result.skipped++;
      }
    });

    result.success = result.imported > 0;
  } catch (error) {
    result.errors.push(`JSON parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

/**
 * Import notes from Markdown
 */
export const importFromMarkdown = (
  markdownData: string,
  existingNotes: CharacterNote[] = []
): ImportResult => {
  const result: ImportResult = {
    success: false,
    notes: [],
    errors: [],
    warnings: [],
    skipped: 0,
    imported: 0,
  };

  try {
    // Simple markdown parsing - split by horizontal rules or double newlines
    const sections = markdownData.split(/\n---\n|\n\n##\s+/).filter(section => section.trim());
    
    sections.forEach((section, index) => {
      try {
        const lines = section.split('\n');
        let title = '';
        let content = '';
        let category = 'personal';
        let tags: string[] = [];
        let isPrivate = false;
        
        // Extract title (first # header)
        const titleMatch = lines.find(line => line.startsWith('# '));
        if (titleMatch) {
          title = titleMatch.replace('# ', '').trim();
        } else {
          result.warnings.push(`Section ${index + 1}: No title found, using default`);
          title = `Imported Note ${index + 1}`;
        }

        // Extract metadata and content
        let contentStartIndex = 0;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          if (line.startsWith('**Category:**')) {
            category = line.replace('**Category:**', '').trim().toLowerCase();
          } else if (line.startsWith('**Tags:**')) {
            const tagText = line.replace('**Tags:**', '').trim();
            tags = tagText.split(/\s+/).filter(tag => tag.startsWith('#')).map(tag => tag.slice(1));
          } else if (line.includes('**Private Note**')) {
            isPrivate = true;
          } else if (line.trim() === '---' || line.trim() === '') {
            contentStartIndex = i + 1;
            break;
          }
        }

        // Get content
        content = lines.slice(contentStartIndex).join('\n').trim();
        
        if (!content) {
          result.warnings.push(`Section ${index + 1}: No content found`);
          result.skipped++;
          return;
        }

        const note: CharacterNote = {
          id: crypto.randomUUID(),
          title,
          content: content.replace(/\n/g, '<br>'), // Simple newline to HTML conversion
          plainTextContent: content,
          category: category as any,
          isPrivate,
          isFavorite: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags,
        };

        result.notes.push(note);
        result.imported++;
      } catch (error) {
        result.errors.push(`Section ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        result.skipped++;
      }
    });

    result.success = result.imported > 0;
  } catch (error) {
    result.errors.push(`Markdown parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

// Helper functions

function filterNotesForExport(notes: CharacterNote[], options: ExportOptions): CharacterNote[] {
  return notes.filter(note => {
    // Filter private notes
    if (!options.includePrivateNotes && note.isPrivate) {
      return false;
    }

    // Filter by date range
    if (options.dateRange) {
      const noteDate = new Date(note.createdAt);
      const startDate = new Date(options.dateRange.start);
      const endDate = new Date(options.dateRange.end);
      
      if (noteDate < startDate || noteDate > endDate) {
        return false;
      }
    }

    // Filter by categories
    if (options.categories && options.categories.length > 0) {
      if (!options.categories.includes(note.category)) {
        return false;
      }
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      if (!note.tags || !options.tags.some(tag => note.tags!.includes(tag))) {
        return false;
      }
    }

    return true;
  });
}

function sortNotesForExport(notes: CharacterNote[], sortBy: string): CharacterNote[] {
  return [...notes].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'date':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
}

function formatNoteAsMarkdown(note: CharacterNote, options: ExportOptions): string {
  let markdown = `# ${note.title}\n\n`;
  
  if (options.includeMetadata) {
    markdown += `**Category:** ${note.category}`;
    if (note.subcategory) {
      markdown += ` > ${note.subcategory}`;
    }
    markdown += '\n';
    
    markdown += `**Created:** ${new Date(note.createdAt).toLocaleDateString()}\n`;
    
    if (note.tags && note.tags.length > 0) {
      markdown += `**Tags:** ${note.tags.map(tag => `#${tag}`).join(' ')}\n`;
    }
    
    if (note.isPrivate) {
      markdown += '**Private Note**\n';
    }
    
    if (note.isFavorite) {
      markdown += '**⭐ Favorite**\n';
    }
    
    markdown += '\n';
  }
  
  // Convert HTML content to Markdown
  markdown += htmlToMarkdown(note.content);
  
  return markdown;
}

function formatNoteAsHTML(note: CharacterNote, options: ExportOptions): string {
  const cssClasses = [
    'note',
    note.isPrivate ? 'private-note' : '',
    note.isFavorite ? 'favorite-note' : '',
  ].filter(Boolean).join(' ');

  let html = `<article class="${cssClasses}">\n`;
  html += `  <div class="note-header">\n`;
  html += `    <h3 class="note-title">${escapeHtml(note.title)}</h3>\n`;
  html += `  </div>\n`;
  
  if (options.includeMetadata) {
    html += `  <div class="note-meta">\n`;
    html += `    <strong>Category:</strong> ${note.category}`;
    if (note.subcategory) {
      html += ` > ${note.subcategory}`;
    }
    html += ` | <strong>Created:</strong> ${new Date(note.createdAt).toLocaleDateString()}`;
    
    if (note.isPrivate) {
      html += ' | <span style="color: #ef4444;">Private</span>';
    }
    
    if (note.isFavorite) {
      html += ' | <span style="color: #f59e0b;">⭐ Favorite</span>';
    }
    
    html += `\n  </div>\n`;
  }
  
  html += `  <div class="note-content">\n    ${note.content}\n  </div>\n`;
  
  if (note.tags && note.tags.length > 0) {
    html += `  <div class="note-tags">\n`;
    note.tags.forEach(tag => {
      html += `    <span class="tag">#${escapeHtml(tag)}</span>\n`;
    });
    html += `  </div>\n`;
  }
  
  html += `</article>\n\n`;
  
  return html;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}