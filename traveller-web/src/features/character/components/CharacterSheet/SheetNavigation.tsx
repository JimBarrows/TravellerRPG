import { useState } from 'react';
import type { SheetTab, CharacterSheetSection } from '../../types/characterSheet';
import Button from '../../../../shared/components/atoms/Button';

interface SheetNavigationProps {
  tabs: SheetTab[];
  activeTab: CharacterSheetSection;
  onTabChange: (tab: CharacterSheetSection) => void;
}

const SheetNavigation = ({ tabs, activeTab, onTabChange }: SheetNavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const activeTabData = tabs.find(tab => tab.id === activeTab);
  
  return (
    <>
      {/* Mobile dropdown navigation */}
      <div className="md:hidden">
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full justify-between"
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
          >
            <span className="flex items-center gap-2">
              {activeTabData?.icon && (
                <span className="text-sm" aria-hidden="true">
                  {getIconComponent(activeTabData.icon)}
                </span>
              )}
              {activeTabData?.label || 'Select Section'}
              {activeTabData?.badge && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                  {activeTabData.badge}
                </span>
              )}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
          
          {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50">
              <div className="py-1" role="menu" aria-orientation="vertical">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setIsMenuOpen(false);
                    }}
                    disabled={tab.disabled}
                    className={`
                      w-full px-4 py-2 text-left text-sm transition-colors
                      ${tab.id === activeTab 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      }
                      ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    role="menuitem"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {tab.icon && (
                          <span className="text-sm" aria-hidden="true">
                            {getIconComponent(tab.icon)}
                          </span>
                        )}
                        {tab.label}
                      </span>
                      {tab.badge && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Desktop tab navigation */}
      <div className="hidden md:block">
        <nav className="flex space-x-1" aria-label="Character sheet sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                relative px-4 py-2 text-sm font-medium rounded-lg transition-all
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                ${tab.id === activeTab
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              aria-current={tab.id === activeTab ? 'page' : undefined}
            >
              <span className="flex items-center gap-2">
                {tab.icon && (
                  <span className="text-sm" aria-hidden="true">
                    {getIconComponent(tab.icon)}
                  </span>
                )}
                {tab.label}
                {tab.badge && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

// Simple icon components - in a real app you'd use a proper icon library
const getIconComponent = (iconName: string) => {
  const icons: Record<string, JSX.Element> = {
    user: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    brain: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    package: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    'credit-card': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    heart: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    'file-text': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    'trending-up': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  };
  
  return icons[iconName] || icons.user;
};

export default SheetNavigation;
