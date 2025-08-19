import type { CharacterNote, NoteFilter, NoteSortOptions } from '../types/characterSheet';

/**
 * Extract plain text from HTML content for search and metadata
 */
export const extractPlainText = (htmlContent: string): string => {
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Remove script and style elements
  const scripts = tempDiv.querySelectorAll('script, style');
  scripts.forEach(element => element.remove());
  
  // Get text content and clean up whitespace
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Calculate reading time in minutes based on word count
 * Uses average reading speed of 200 words per minute
 */
export const calculateReadingTime = (plainText: string): number => {
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
  return Math.ceil(words.length / 200);
};

/**
 * Count words in plain text
 */
export const countWords = (plainText: string): number => {
  return plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * Generate metadata for a note
 */
export const generateNoteMetadata = (content: string) => {
  const plainText = extractPlainText(content);
  const wordCount = countWords(plainText);
  const characterCount = content.length;
  const readTimeMinutes = calculateReadingTime(plainText);

  return {
    wordCount,
    characterCount,
    readTimeMinutes,
    lastAccessedAt: new Date().toISOString(),
  };
};

/**
 * Sanitize note title to remove HTML and limit length
 */
export const sanitizeNoteTitle = (title: string, maxLength: number = 100): string => {
  // Remove HTML tags
  const plainTitle = extractPlainText(title);
  
  // Truncate if too long
  if (plainTitle.length > maxLength) {
    return plainTitle.substring(0, maxLength - 3) + '...';
  }
  
  return plainTitle;
};

/**
 * Validate note data
 */
export const validateNoteData = (note: Partial<CharacterNote>): string[] => {
  const errors: string[] = [];

  if (!note.title?.trim()) {
    errors.push('Title is required');
  }

  if (note.title && note.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (!note.content?.trim()) {
    errors.push('Content is required');
  }

  if (note.content && note.content.length > 100000) {
    errors.push('Content must be less than 100,000 characters');
  }

  if (!note.category) {
    errors.push('Category is required');
  }

  return errors;
};

/**
 * Convert HTML content to Markdown
 */
export const htmlToMarkdown = (html: string): string => {
  // Simple HTML to Markdown conversion
  let markdown = html;

  // Headers
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n');

  // Bold and italic
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Links
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Lists
  markdown = markdown.replace(/<ul[^>]*>/gi, '');
  markdown = markdown.replace(/<\/ul>/gi, '\n');
  markdown = markdown.replace(/<ol[^>]*>/gi, '');
  markdown = markdown.replace(/<\/ol>/gi, '\n');
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');

  // Blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n');

  // Code
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '```\n$1\n```\n');

  // Line breaks and paragraphs
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '');

  // Clean up extra whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.trim();

  return markdown;
};

/**
 * Convert Markdown to HTML (basic implementation)
 */
export const markdownToHtml = (markdown: string): string => {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Line breaks
  html = html.replace(/\n/g, '<br>');

  return html;
};

/**
 * Search notes with highlighting
 */
export const searchNotes = (
  notes: CharacterNote[], 
  query: string,
  highlightMatches: boolean = false
): CharacterNote[] => {
  if (!query.trim()) {
    return notes;
  }

  const searchTerms = query.toLowerCase().split(/\s+/);
  
  return notes.filter(note => {
    const searchableText = [
      note.title,
      note.plainTextContent || extractPlainText(note.content),
      ...(note.tags || []),
      note.category,
      note.subcategory || '',
    ].join(' ').toLowerCase();

    return searchTerms.every(term => searchableText.includes(term));
  }).map(note => {
    if (!highlightMatches) {
      return note;
    }

    // Add highlighting to matches (simplified implementation)
    let highlightedContent = note.content;
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedContent = highlightedContent.replace(regex, '<mark>$1</mark>');
    });

    return {
      ...note,
      content: highlightedContent,
    };
  });
};

/**
 * Sort notes by specified criteria
 */
export const sortNotes = (notes: CharacterNote[], sortOptions: NoteSortOptions): CharacterNote[] => {
  return [...notes].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortOptions.field) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
        break;
      case 'category':
        aValue = a.category;
        bValue = b.category;
        break;
      case 'wordCount':
        aValue = a.metadata?.wordCount || 0;
        bValue = b.metadata?.wordCount || 0;
        break;
      default:
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
    }

    if (sortOptions.direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
};

/**
 * Filter notes by specified criteria
 */
export const filterNotes = (notes: CharacterNote[], filters: NoteFilter): CharacterNote[] => {
  return notes.filter(note => {
    // Category filter
    if (filters.category && note.category !== filters.category) {
      return false;
    }

    // Subcategory filter
    if (filters.subcategory && note.subcategory !== filters.subcategory) {
      return false;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      if (!note.tags || !filters.tags.some(tag => note.tags!.includes(tag))) {
        return false;
      }
    }

    // Private filter
    if (filters.isPrivate !== undefined && note.isPrivate !== filters.isPrivate) {
      return false;
    }

    // Favorite filter
    if (filters.isFavorite !== undefined && note.isFavorite !== filters.isFavorite) {
      return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const noteDate = new Date(note.createdAt);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      if (noteDate < startDate || noteDate > endDate) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Generate unique tags from all notes
 */
export const extractUniqueTags = (notes: CharacterNote[]): string[] => {
  const tagSet = new Set<string>();
  
  notes.forEach(note => {
    note.tags?.forEach(tag => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
};

/**
 * Create a note template for a specific category
 */
export const createNoteTemplate = (category: string, subcategory?: string): Partial<CharacterNote> => {
  const templates: Record<string, Partial<CharacterNote>> = {
    background: {
      title: 'Character Background',
      content: '<h2>Background Overview</h2><p>Brief overview of character background...</p><h3>Key Details</h3><ul><li>Detail 1</li><li>Detail 2</li></ul>',
      category: 'background' as any,
      subcategory: subcategory || 'homeworld',
    },
    personality: {
      title: 'Personality Profile',
      content: '<h2>Core Traits</h2><p>Describe main personality traits...</p><h3>Motivations</h3><p>What drives this character...</p>',
      category: 'personality' as any,
      subcategory: subcategory || 'traits',
    },
    connections: {
      title: 'New Connection',
      content: '<h2>Contact Information</h2><p><strong>Name:</strong> </p><p><strong>Relationship:</strong> </p><p><strong>How Met:</strong> </p><p><strong>Notes:</strong> </p>',
      category: 'connections' as any,
      subcategory: subcategory || 'contacts',
    },
    rivals: {
      title: 'New Rival/Enemy',
      content: '<h2>Rival Profile</h2><p><strong>Name:</strong> </p><p><strong>Relationship:</strong> </p><p><strong>Conflict Origin:</strong> </p><p><strong>Current Status:</strong> </p>',
      category: 'rivals' as any,
      subcategory: subcategory || 'rivals',
    },
    goals: {
      title: 'Personal Goal',
      content: '<h2>Goal Description</h2><p>Describe the goal...</p><h3>Steps to Achieve</h3><ul><li>Step 1</li><li>Step 2</li></ul><h3>Timeline</h3><p>Expected completion...</p>',
      category: 'goals' as any,
      subcategory: subcategory || 'short-term',
    },
    journal: {
      title: 'Journal Entry',
      content: '<h2>Session Date</h2><p><strong>Date:</strong> </p><h3>What Happened</h3><p>Events of the session...</p><h3>Character Thoughts</h3><p>How the character feels about events...</p>',
      category: 'journal' as any,
      subcategory: subcategory || 'session-notes',
    },
  };

  return templates[category] || {
    title: 'New Note',
    content: '<p>Start writing your note here...</p>',
    category: category as any,
    subcategory,
  };
};