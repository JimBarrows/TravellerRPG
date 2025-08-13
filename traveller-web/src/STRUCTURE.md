# Project Structure

This project follows a feature-based organization pattern for better maintainability and scalability.

## Directory Overview

```
src/
├── features/           # Feature-based modules
│   ├── auth/          # Authentication & authorization
│   ├── character/     # Character management
│   ├── campaign/      # Campaign management
│   ├── gameplay/      # Gameplay mechanics
│   └── common/        # Shared feature components
├── shared/            # Shared application code
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── contexts/      # React context providers
│   ├── types/         # Global TypeScript types
│   └── constants/     # Application constants
├── utils/             # Utility functions
│   ├── helpers/       # General helper functions
│   ├── validators/    # Form and data validation
│   └── formatters/    # Data formatting utilities
└── config/            # Configuration files
    ├── environment/   # Environment variables
    ├── theme/         # Theme configuration
    └── api/           # API configuration
```

## Feature Structure

Each feature follows a consistent structure:

```
features/{feature-name}/
├── components/        # Feature-specific UI components
├── pages/            # Feature-specific page components
├── hooks/            # Feature-specific React hooks
├── services/         # API calls and business logic
├── types/            # Feature-specific TypeScript types
├── constants/        # Feature-specific constants
└── index.ts          # Feature exports
```

## Import Guidelines

- Use absolute imports from `src/` root
- Import from feature index files when possible
- Keep imports organized by type (external, internal, relative)

## Naming Conventions

- Files: PascalCase for components, camelCase for utilities
- Directories: lowercase with hyphens
- Types: PascalCase with descriptive names
- Constants: UPPER_CASE with underscores