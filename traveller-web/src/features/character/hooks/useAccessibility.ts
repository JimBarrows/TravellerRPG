import { useEffect, useCallback, useRef } from 'react';

interface UseAccessibilityOptions {
  announceChanges?: boolean;
  enableKeyboardNavigation?: boolean;
  focusTrapEnabled?: boolean;
  skipLinksEnabled?: boolean;
}

interface UseAccessibilityReturn {
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (elementId: string) => boolean;
  createFocusTrap: (containerId: string) => () => void;
  generateDescriptionId: (baseId: string) => string;
  generateErrorId: (baseId: string) => string;
}

export const useAccessibility = (
  options: UseAccessibilityOptions = {}
): UseAccessibilityReturn => {
  const {
    announceChanges = true,
    enableKeyboardNavigation = true,
    focusTrapEnabled = false,
    skipLinksEnabled = true,
  } = options;

  const announcementRef = useRef<HTMLDivElement | null>(null);
  const focusTrapRef = useRef<{
    firstFocusable: HTMLElement | null;
    lastFocusable: HTMLElement | null;
    container: HTMLElement | null;
  }>({ firstFocusable: null, lastFocusable: null, container: null });

  // Create announcement area for screen readers
  useEffect(() => {
    if (!announceChanges) return;

    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('class', 'sr-only');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(liveRegion);
    announcementRef.current = liveRegion;

    return () => {
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
      }
    };
  }, [announceChanges]);

  // Announce messages to screen readers
  const announceToScreenReader = useCallback((
    message: string, 
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    if (!announcementRef.current) return;

    // Update aria-live attribute based on priority
    announcementRef.current.setAttribute('aria-live', priority);
    
    // Clear and set new message
    announcementRef.current.textContent = '';
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = message;
      }
    }, 100);
    
    // Clear message after a delay to prepare for next announcement
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = '';
      }
    }, 5000);
  }, []);

  // Focus specific element by ID
  const focusElement = useCallback((elementId: string): boolean => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      return true;
    }
    return false;
  }, []);

  // Get all focusable elements within a container
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];
    
    return Array.from(
      container.querySelectorAll(focusableSelectors.join(','))
    ) as HTMLElement[];
  }, []);

  // Create focus trap for modals and dialogs
  const createFocusTrap = useCallback((containerId: string) => {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Focus trap container with ID "${containerId}" not found`);
      return () => {};
    }

    const focusableElements = getFocusableElements(container);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    focusTrapRef.current = {
      firstFocusable,
      lastFocusable,
      container,
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const { relatedTarget } = e;
      if (!container?.contains(relatedTarget as Node)) {
        firstFocusable?.focus();
      }
    };

    // Focus first element when trap is created
    firstFocusable?.focus();

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focusout', handleFocusOut);

    // Return cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focusout', handleFocusOut);
      focusTrapRef.current = { firstFocusable: null, lastFocusable: null, container: null };
    };
  }, [getFocusableElements]);

  // Generate unique description ID for aria-describedby
  const generateDescriptionId = useCallback((baseId: string): string => {
    return `${baseId}-description-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Generate unique error ID for aria-describedby
  const generateErrorId = useCallback((baseId: string): string => {
    return `${baseId}-error-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Enhanced keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if focus is in an input field
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.hasAttribute('contenteditable')
      );

      if (isInputFocused) return;

      switch (e.key) {
        case 'F6':
          // Cycle through main regions
          e.preventDefault();
          const regions = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]');
          let currentIndex = -1;
          
          for (let i = 0; i < regions.length; i++) {
            if (regions[i].contains(activeElement)) {
              currentIndex = i;
              break;
            }
          }
          
          const nextIndex = (currentIndex + 1) % regions.length;
          const nextRegion = regions[nextIndex] as HTMLElement;
          if (nextRegion) {
            nextRegion.focus();
            announceToScreenReader(`Navigated to ${nextRegion.getAttribute('aria-label') || nextRegion.tagName.toLowerCase()} region`);
          }
          break;

        case '?':
          // Show keyboard shortcuts help (if implemented)
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            announceToScreenReader('Keyboard shortcuts: F6 to cycle regions, Ctrl+? for help');
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardNavigation, announceToScreenReader]);

  // Add skip links
  useEffect(() => {
    if (!skipLinksEnabled) return;

    const existingSkipLinks = document.querySelector('.skip-links');
    if (existingSkipLinks) return; // Already exists

    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.className = 'skip-links';
    skipLinksContainer.style.position = 'absolute';
    skipLinksContainer.style.top = '-40px';
    skipLinksContainer.style.left = '6px';
    skipLinksContainer.style.zIndex = '100000';
    skipLinksContainer.style.background = 'white';
    skipLinksContainer.style.padding = '8px';
    skipLinksContainer.style.border = '1px solid #000';
    skipLinksContainer.style.borderRadius = '4px';
    skipLinksContainer.style.transition = 'top 0.3s';

    const skipToMain = document.createElement('a');
    skipToMain.href = '#main-content';
    skipToMain.textContent = 'Skip to main content';
    skipToMain.style.marginRight = '10px';
    skipToMain.style.color = '#000';
    skipToMain.addEventListener('focus', () => {
      skipLinksContainer.style.top = '6px';
    });
    skipToMain.addEventListener('blur', () => {
      skipLinksContainer.style.top = '-40px';
    });

    const skipToNav = document.createElement('a');
    skipToNav.href = '#navigation';
    skipToNav.textContent = 'Skip to navigation';
    skipToNav.style.color = '#000';
    skipToNav.addEventListener('focus', () => {
      skipLinksContainer.style.top = '6px';
    });
    skipToNav.addEventListener('blur', () => {
      skipLinksContainer.style.top = '-40px';
    });

    skipLinksContainer.appendChild(skipToMain);
    skipLinksContainer.appendChild(skipToNav);
    document.body.insertBefore(skipLinksContainer, document.body.firstChild);

    return () => {
      const skipLinks = document.querySelector('.skip-links');
      if (skipLinks) {
        document.body.removeChild(skipLinks);
      }
    };
  }, [skipLinksEnabled]);

  return {
    announceToScreenReader,
    focusElement,
    createFocusTrap,
    generateDescriptionId,
    generateErrorId,
  };
};