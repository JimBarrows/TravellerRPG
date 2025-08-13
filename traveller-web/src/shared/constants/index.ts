// Application constants
export const APP_CONFIG = {
  title: import.meta.env.VITE_APP_TITLE || 'Traveller RPG Manager',
  version: import.meta.env.VITE_APP_VERSION || '0.1.0',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
} as const;

export const API_ENDPOINTS = {
  graphql: import.meta.env.VITE_GRAPHQL_ENDPOINT || '/graphql',
} as const;

export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  CHARACTER: {
    LIST: '/characters',
    CREATE: '/characters/create',
    EDIT: '/characters/:id/edit',
    VIEW: '/characters/:id',
  },
  CAMPAIGN: {
    LIST: '/campaigns',
    CREATE: '/campaigns/create',
    EDIT: '/campaigns/:id/edit',
    VIEW: '/campaigns/:id',
  },
  GAMEPLAY: {
    SESSION: '/gameplay/session/:id',
    ENCOUNTER: '/gameplay/encounter/:id',
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'traveller_auth_token',
  USER_PREFERENCES: 'traveller_user_preferences',
  THEME: 'traveller_theme',
} as const;

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;