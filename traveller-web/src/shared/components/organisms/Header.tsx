import { Link } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';

const Header = () => {
  const { state, setTheme } = useAppContext();
  const isDarkMode = state.theme === 'dark' || 
    (state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gradient-traveller rounded"></div>
          <span className="font-display font-bold text-xl">Traveller</span>
        </Link>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* User actions */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost p-2"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* User menu */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-accent"></div>
            <span className="text-sm font-medium">User</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;