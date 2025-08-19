import type { NoteCategoryDefinition, NotesConfiguration } from '../types/characterSheet';

// Default note categories for Traveller RPG
export const DEFAULT_NOTE_CATEGORIES: NoteCategoryDefinition[] = [
  {
    id: 'background',
    name: 'Background',
    description: 'Character history, homeworld, family, and early life',
    color: '#3B82F6', // blue
    icon: '📚',
    subcategories: [
      { id: 'homeworld', name: 'Homeworld', description: 'Planet of origin and early environment' },
      { id: 'family', name: 'Family', description: 'Family background and relationships' },
      { id: 'education', name: 'Education', description: 'Schooling and early training' },
      { id: 'career', name: 'Career History', description: 'Professional background and service' },
    ],
  },
  {
    id: 'personality',
    name: 'Personality',
    description: 'Character traits, motivations, quirks, and behavior patterns',
    color: '#8B5CF6', // purple
    icon: '🎭',
    subcategories: [
      { id: 'traits', name: 'Traits', description: 'Core personality traits and characteristics' },
      { id: 'motivations', name: 'Motivations', description: 'What drives the character' },
      { id: 'fears', name: 'Fears & Phobias', description: 'What the character fears or avoids' },
      { id: 'habits', name: 'Habits & Quirks', description: 'Behavioral patterns and peculiarities' },
    ],
  },
  {
    id: 'connections',
    name: 'Connections',
    description: 'Allies, contacts, friends, and positive relationships',
    color: '#10B981', // green
    icon: '🤝',
    subcategories: [
      { id: 'allies', name: 'Allies', description: 'Trusted allies and supporters' },
      { id: 'contacts', name: 'Contacts', description: 'Useful contacts and acquaintances' },
      { id: 'mentors', name: 'Mentors', description: 'Teachers and guides' },
      { id: 'family-friends', name: 'Family & Friends', description: 'Close personal relationships' },
    ],
  },
  {
    id: 'rivals',
    name: 'Rivals & Enemies',
    description: 'Antagonists, rivals, enemies, and negative relationships',
    color: '#EF4444', // red
    icon: '⚔️',
    subcategories: [
      { id: 'enemies', name: 'Enemies', description: 'Active enemies and threats' },
      { id: 'rivals', name: 'Rivals', description: 'Competitive relationships' },
      { id: 'grudges', name: 'Grudges', description: 'Unresolved conflicts' },
      { id: 'debts', name: 'Debts & Obligations', description: 'Outstanding debts and obligations' },
    ],
  },
  {
    id: 'goals',
    name: 'Goals & Motivations',
    description: 'Personal objectives, ambitions, and long-term plans',
    color: '#F59E0B', // amber
    icon: '🎯',
    subcategories: [
      { id: 'short-term', name: 'Short-term Goals', description: 'Immediate objectives' },
      { id: 'long-term', name: 'Long-term Goals', description: 'Life ambitions and dreams' },
      { id: 'secrets', name: 'Secrets', description: 'Hidden information and mysteries' },
      { id: 'bucket-list', name: 'Bucket List', description: 'Things to do before death' },
    ],
  },
  {
    id: 'campaign',
    name: 'Campaign',
    description: 'Current campaign events, missions, and ongoing storylines',
    color: '#8B5CF6', // violet
    icon: '🎬',
    subcategories: [
      { id: 'current-mission', name: 'Current Mission', description: 'Active mission details' },
      { id: 'locations', name: 'Locations', description: 'Important places visited' },
      { id: 'npcs', name: 'NPCs', description: 'Non-player characters encountered' },
      { id: 'plot-threads', name: 'Plot Threads', description: 'Ongoing storylines' },
    ],
  },
  {
    id: 'journal',
    name: 'Journal',
    description: 'Session notes, personal reflections, and character development',
    color: '#6B7280', // gray
    icon: '📔',
    subcategories: [
      { id: 'session-notes', name: 'Session Notes', description: 'What happened each session' },
      { id: 'reflections', name: 'Reflections', description: 'Character thoughts and feelings' },
      { id: 'lessons', name: 'Lessons Learned', description: 'What the character has learned' },
      { id: 'growth', name: 'Character Growth', description: 'How the character has changed' },
    ],
  },
  {
    id: 'personal',
    name: 'Personal',
    description: 'Private thoughts, player notes, and out-of-character information',
    color: '#EC4899', // pink
    icon: '🔒',
    subcategories: [
      { id: 'player-notes', name: 'Player Notes', description: 'Out-of-character notes' },
      { id: 'ideas', name: 'Ideas', description: 'Character development ideas' },
      { id: 'reminders', name: 'Reminders', description: 'Things to remember' },
      { id: 'mechanics', name: 'Mechanics', description: 'Game mechanic notes' },
    ],
  },
];

// Default configuration
export const DEFAULT_NOTES_CONFIG: NotesConfiguration = {
  categories: DEFAULT_NOTE_CATEGORIES,
  defaultCategory: DEFAULT_NOTE_CATEGORIES[0], // Background
  enableTags: true,
  enablePrivateNotes: true,
  enableMarkdownExport: true,
  autoSaveInterval: 2000, // 2 seconds
  maxNoteLength: 50000, // 50k characters
};

// Helper functions
export const getCategoryById = (id: string): NoteCategoryDefinition | undefined => {
  return DEFAULT_NOTE_CATEGORIES.find(category => category.id === id);
};

export const getCategoryColor = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.color || '#6B7280';
};

export const getCategoryIcon = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.icon || '📝';
};

export const getSubcategoryOptions = (categoryId: string) => {
  const category = getCategoryById(categoryId);
  return category?.subcategories || [];
};

// Common tags for auto-completion
export const COMMON_TAGS = [
  'important',
  'urgent',
  'secret',
  'public',
  'reference',
  'todo',
  'completed',
  'in-progress',
  'archived',
  'favorite',
  'combat',
  'social',
  'investigation',
  'travel',
  'shopping',
  'equipment',
  'skills',
  'reputation',
  'law-level',
  'psionics',
  'alien',
  'technology',
  'imperial',
  'noble',
  'military',
  'merchant',
  'scout',
  'navy',
  'marines',
  'agent',
  'rogue',
  'drifter',
  'entertainer',
  'citizen',
  'scholar',
];