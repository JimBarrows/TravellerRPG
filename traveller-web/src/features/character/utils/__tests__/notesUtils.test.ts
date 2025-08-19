import {
  extractPlainText,
  calculateReadingTime,
  countWords,
  generateNoteMetadata,
  sanitizeNoteTitle,
  validateNoteData,
  htmlToMarkdown,
  markdownToHtml,
  searchNotes,
  sortNotes,
  filterNotes,
  extractUniqueTags,
  createNoteTemplate,
} from '../notesUtils';
import type { CharacterNote, NoteFilter, NoteSortOptions } from '../../types/characterSheet';

// Mock DOM methods for extractPlainText
Object.defineProperty(global, 'document', {
  value: {
    createElement: jest.fn(() => ({
      innerHTML: '',
      textContent: '',
      innerText: '',
      querySelectorAll: jest.fn(() => []),
    })),
  },
});

describe('notesUtils', () => {
  describe('extractPlainText', () => {
    beforeEach(() => {
      // Mock document.createElement for each test
      const mockDiv = {
        innerHTML: '',
        textContent: '',
        innerText: '',
        querySelectorAll: jest.fn(() => []),
      };
      
      (document.createElement as jest.Mock).mockReturnValue(mockDiv);
    });

    it('extracts plain text from HTML', () => {
      const mockDiv = {
        innerHTML: '',
        textContent: 'Hello world',
        innerText: 'Hello world',
        querySelectorAll: jest.fn(() => []),
      };
      
      (document.createElement as jest.Mock).mockReturnValue(mockDiv);
      
      const result = extractPlainText('<p>Hello world</p>');
      expect(result).toBe('Hello world');
    });

    it('removes script and style tags', () => {
      const mockScript = { remove: jest.fn() };
      const mockDiv = {
        innerHTML: '',
        textContent: 'Clean content',
        innerText: 'Clean content',
        querySelectorAll: jest.fn(() => [mockScript]),
      };
      
      (document.createElement as jest.Mock).mockReturnValue(mockDiv);
      
      const result = extractPlainText('<p>Clean content</p><script>alert("bad")</script>');
      expect(mockScript.remove).toHaveBeenCalled();
      expect(result).toBe('Clean content');
    });
  });

  describe('calculateReadingTime', () => {
    it('calculates reading time correctly', () => {
      const text = 'word '.repeat(200); // 200 words
      expect(calculateReadingTime(text)).toBe(1); // 1 minute at 200 WPM
      
      const longerText = 'word '.repeat(400); // 400 words
      expect(calculateReadingTime(longerText)).toBe(2); // 2 minutes
    });

    it('rounds up reading time', () => {
      const text = 'word '.repeat(150); // 150 words
      expect(calculateReadingTime(text)).toBe(1); // Rounds up from 0.75
    });
  });

  describe('countWords', () => {
    it('counts words correctly', () => {
      expect(countWords('hello world')).toBe(2);
      expect(countWords('  hello   world  ')).toBe(2);
      expect(countWords('')).toBe(0);
      expect(countWords('single')).toBe(1);
    });

    it('filters out empty strings', () => {
      expect(countWords('word1  word2   word3')).toBe(3);
    });
  });

  describe('generateNoteMetadata', () => {
    beforeEach(() => {
      const mockDiv = {
        innerHTML: '',
        textContent: 'Test content with multiple words here',
        innerText: 'Test content with multiple words here',
        querySelectorAll: jest.fn(() => []),
      };
      
      (document.createElement as jest.Mock).mockReturnValue(mockDiv);
    });

    it('generates complete metadata', () => {
      const content = '<p>Test content with multiple words here</p>';
      const metadata = generateNoteMetadata(content);
      
      expect(metadata).toHaveProperty('wordCount');
      expect(metadata).toHaveProperty('characterCount');
      expect(metadata).toHaveProperty('readTimeMinutes');
      expect(metadata).toHaveProperty('lastAccessedAt');
      
      expect(metadata.characterCount).toBe(content.length);
      expect(typeof metadata.lastAccessedAt).toBe('string');
    });
  });

  describe('sanitizeNoteTitle', () => {
    beforeEach(() => {
      const mockDiv = {
        innerHTML: '',
        textContent: 'Clean title',
        innerText: 'Clean title',
        querySelectorAll: jest.fn(() => []),
      };
      
      (document.createElement as jest.Mock).mockReturnValue(mockDiv);
    });

    it('removes HTML tags from title', () => {
      const result = sanitizeNoteTitle('<script>alert("bad")</script>Clean title');
      expect(result).toBe('Clean title');
    });

    it('truncates long titles', () => {
      const longTitle = 'a'.repeat(150);
      const mockDiv = {
        innerHTML: '',
        textContent: longTitle,
        innerText: longTitle,
        querySelectorAll: jest.fn(() => []),
      };
      
      (document.createElement as jest.Mock).mockReturnValue(mockDiv);
      
      const result = sanitizeNoteTitle(longTitle, 50);
      expect(result.length).toBeLessThanOrEqual(50);
      expect(result).toContain('...');
    });
  });

  describe('validateNoteData', () => {
    it('validates required fields', () => {
      const validNote = {
        title: 'Test Note',
        content: '<p>Test content</p>',
        category: 'personal' as const,
      };
      
      expect(validateNoteData(validNote)).toEqual([]);
    });

    it('returns errors for missing fields', () => {
      const invalidNote = {};
      const errors = validateNoteData(invalidNote);
      
      expect(errors).toContain('Title is required');
      expect(errors).toContain('Content is required');
      expect(errors).toContain('Category is required');
    });

    it('validates field lengths', () => {
      const invalidNote = {
        title: 'a'.repeat(250),
        content: 'a'.repeat(150000),
        category: 'personal' as const,
      };
      
      const errors = validateNoteData(invalidNote);
      expect(errors).toContain('Title must be less than 200 characters');
      expect(errors).toContain('Content must be less than 100,000 characters');
    });
  });

  describe('htmlToMarkdown', () => {
    it('converts basic HTML to Markdown', () => {
      const html = '<h1>Title</h1><p>Paragraph</p><strong>Bold</strong>';
      const markdown = htmlToMarkdown(html);
      
      expect(markdown).toContain('# Title');
      expect(markdown).toContain('**Bold**');
    });

    it('converts links correctly', () => {
      const html = '<a href="https://example.com">Link text</a>';
      const markdown = htmlToMarkdown(html);
      
      expect(markdown).toBe('[Link text](https://example.com)');
    });

    it('handles lists', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const markdown = htmlToMarkdown(html);
      
      expect(markdown).toContain('- Item 1');
      expect(markdown).toContain('- Item 2');
    });
  });

  describe('markdownToHtml', () => {
    it('converts basic Markdown to HTML', () => {
      const markdown = '# Title\n**Bold text**\n*Italic text*';
      const html = markdownToHtml(markdown);
      
      expect(html).toContain('<h1>Title</h1>');
      expect(html).toContain('<strong>Bold text</strong>');
      expect(html).toContain('<em>Italic text</em>');
    });

    it('converts links correctly', () => {
      const markdown = '[Link text](https://example.com)';
      const html = markdownToHtml(markdown);
      
      expect(html).toContain('<a href="https://example.com">Link text</a>');
    });
  });

  describe('searchNotes', () => {
    const sampleNotes: CharacterNote[] = [
      {
        id: '1',
        title: 'Meeting with Captain',
        content: '<p>Important discussion about the mission</p>',
        plainTextContent: 'Important discussion about the mission',
        category: 'campaign',
        isPrivate: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        tags: ['important', 'mission'],
      },
      {
        id: '2',
        title: 'Personal Journal',
        content: '<p>My thoughts about the crew</p>',
        plainTextContent: 'My thoughts about the crew',
        category: 'personal',
        isPrivate: true,
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        tags: ['journal', 'crew'],
      },
    ];

    it('searches by title', () => {
      const results = searchNotes(sampleNotes, 'Captain');
      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('Captain');
    });

    it('searches by content', () => {
      const results = searchNotes(sampleNotes, 'mission');
      expect(results).toHaveLength(1);
      expect(results[0].content).toContain('mission');
    });

    it('searches by tags', () => {
      const results = searchNotes(sampleNotes, 'journal');
      expect(results).toHaveLength(1);
      expect(results[0].tags).toContain('journal');
    });

    it('returns all notes for empty query', () => {
      const results = searchNotes(sampleNotes, '');
      expect(results).toHaveLength(2);
    });
  });

  describe('sortNotes', () => {
    const sampleNotes: CharacterNote[] = [
      {
        id: '1',
        title: 'B Note',
        content: '<p>Content</p>',
        category: 'personal',
        isPrivate: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        metadata: { wordCount: 50 },
      },
      {
        id: '2',
        title: 'A Note',
        content: '<p>Content</p>',
        category: 'campaign',
        isPrivate: false,
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        metadata: { wordCount: 100 },
      },
    ] as CharacterNote[];

    it('sorts by title ascending', () => {
      const sortOptions: NoteSortOptions = { field: 'title', direction: 'asc' };
      const sorted = sortNotes(sampleNotes, sortOptions);
      
      expect(sorted[0].title).toBe('A Note');
      expect(sorted[1].title).toBe('B Note');
    });

    it('sorts by date descending', () => {
      const sortOptions: NoteSortOptions = { field: 'createdAt', direction: 'desc' };
      const sorted = sortNotes(sampleNotes, sortOptions);
      
      expect(sorted[0].createdAt).toBe('2023-01-02T00:00:00.000Z');
      expect(sorted[1].createdAt).toBe('2023-01-01T00:00:00.000Z');
    });

    it('sorts by word count', () => {
      const sortOptions: NoteSortOptions = { field: 'wordCount', direction: 'desc' };
      const sorted = sortNotes(sampleNotes, sortOptions);
      
      expect(sorted[0].metadata?.wordCount).toBe(100);
      expect(sorted[1].metadata?.wordCount).toBe(50);
    });
  });

  describe('filterNotes', () => {
    const sampleNotes: CharacterNote[] = [
      {
        id: '1',
        title: 'Public Note',
        content: '<p>Content</p>',
        category: 'campaign',
        isPrivate: false,
        isFavorite: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        tags: ['important'],
      },
      {
        id: '2',
        title: 'Private Note',
        content: '<p>Content</p>',
        category: 'personal',
        isPrivate: true,
        isFavorite: false,
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        tags: ['secret'],
      },
    ] as CharacterNote[];

    it('filters by category', () => {
      const filters: NoteFilter = { category: 'campaign' };
      const filtered = filterNotes(sampleNotes, filters);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('campaign');
    });

    it('filters by private status', () => {
      const filters: NoteFilter = { isPrivate: true };
      const filtered = filterNotes(sampleNotes, filters);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].isPrivate).toBe(true);
    });

    it('filters by favorite status', () => {
      const filters: NoteFilter = { isFavorite: true };
      const filtered = filterNotes(sampleNotes, filters);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].isFavorite).toBe(true);
    });

    it('filters by tags', () => {
      const filters: NoteFilter = { tags: ['important'] };
      const filtered = filterNotes(sampleNotes, filters);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].tags).toContain('important');
    });

    it('applies multiple filters', () => {
      const filters: NoteFilter = { 
        category: 'campaign', 
        isPrivate: false 
      };
      const filtered = filterNotes(sampleNotes, filters);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('campaign');
      expect(filtered[0].isPrivate).toBe(false);
    });
  });

  describe('extractUniqueTags', () => {
    const sampleNotes: CharacterNote[] = [
      {
        id: '1',
        title: 'Note 1',
        content: '<p>Content</p>',
        category: 'personal',
        isPrivate: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        tags: ['tag1', 'tag2'],
      },
      {
        id: '2',
        title: 'Note 2',
        content: '<p>Content</p>',
        category: 'personal',
        isPrivate: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        tags: ['tag2', 'tag3'],
      },
    ] as CharacterNote[];

    it('extracts unique tags', () => {
      const tags = extractUniqueTags(sampleNotes);
      
      expect(tags).toHaveLength(3);
      expect(tags).toContain('tag1');
      expect(tags).toContain('tag2');
      expect(tags).toContain('tag3');
    });

    it('sorts tags alphabetically', () => {
      const tags = extractUniqueTags(sampleNotes);
      
      expect(tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('handles notes without tags', () => {
      const notesWithoutTags: CharacterNote[] = [
        {
          id: '1',
          title: 'Note 1',
          content: '<p>Content</p>',
          category: 'personal',
          isPrivate: false,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ] as CharacterNote[];

      const tags = extractUniqueTags(notesWithoutTags);
      expect(tags).toEqual([]);
    });
  });

  describe('createNoteTemplate', () => {
    it('creates background template', () => {
      const template = createNoteTemplate('background');
      
      expect(template.title).toBe('Character Background');
      expect(template.category).toBe('background');
      expect(template.content).toContain('Background Overview');
    });

    it('creates personality template', () => {
      const template = createNoteTemplate('personality', 'traits');
      
      expect(template.title).toBe('Personality Profile');
      expect(template.category).toBe('personality');
      expect(template.subcategory).toBe('traits');
      expect(template.content).toContain('Core Traits');
    });

    it('creates default template for unknown category', () => {
      const template = createNoteTemplate('unknown-category');
      
      expect(template.title).toBe('New Note');
      expect(template.category).toBe('unknown-category');
      expect(template.content).toBe('<p>Start writing your note here...</p>');
    });

    it('includes subcategory when provided', () => {
      const template = createNoteTemplate('connections', 'allies');
      
      expect(template.subcategory).toBe('allies');
    });
  });
});