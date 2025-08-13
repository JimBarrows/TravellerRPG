import React, { useEffect, useState, useRef } from 'react';
import './SessionTimeoutWarning.css';

/**
 * SessionTimeoutWarning Component
 * Displays a warning dialog when the user's session is about to expire
 */
export const SessionTimeoutWarning = ({
  isVisible,
  timeRemaining,
  onExtendSession,
  onLogout,
  onClose
}) => {
  const [displayTime, setDisplayTime] = useState('');
  const dialogRef = useRef(null);
  const firstButtonRef = useRef(null);

  // Format time remaining for display
  useEffect(() => {
    if (timeRemaining <= 0) {
      setDisplayTime('0 seconds');
      // Auto-logout when time reaches zero
      if (onLogout) {
        onLogout();
      }
      return;
    }

    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);

    if (minutes > 0) {
      setDisplayTime(`${minutes} minute${minutes === 1 ? '' : 's'}`);
    } else {
      setDisplayTime(`${seconds} second${seconds === 1 ? '' : 's'}`);
    }
  }, [timeRemaining, onLogout]);

  // Handle keyboard events for accessibility
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isVisible) return;

      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose]);

  // Focus management for accessibility
  useEffect(() => {
    if (isVisible && firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, [isVisible]);

  // Trap focus within the dialog
  const handleKeyDown = (event) => {
    if (event.key === 'Tab') {
      const focusableElements = dialogRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  if (!isVisible) {
    return null;
  }

  const getWarningClass = () => {
    if (timeRemaining <= 60000) { // 1 minute or less
      return 'critical';
    } else if (timeRemaining <= 180000) { // 3 minutes or less
      return 'warning';
    }
    return 'info';
  };

  return (
    <div className="session-timeout-overlay" role="dialog" aria-modal="true">
      <div 
        ref={dialogRef}
        className={`session-timeout-dialog ${getWarningClass()}`}
        onKeyDown={handleKeyDown}
        aria-labelledby="session-timeout-title"
        aria-describedby="session-timeout-description"
      >
        <div className="session-timeout-header">
          <h2 id="session-timeout-title" className="session-timeout-title">
            Session Expiring Soon
          </h2>
          <button
            type="button"
            className="session-timeout-close"
            onClick={onClose}
            aria-label="Close warning"
          >
            ×
          </button>
        </div>

        <div className="session-timeout-content">
          <div className="session-timeout-icon">
            ⚠️
          </div>
          <p id="session-timeout-description" className="session-timeout-message">
            Your session will expire in <strong>{displayTime}</strong>.
            {timeRemaining <= 60000 && (
              <span className="urgent-text"> Please take action immediately!</span>
            )}
          </p>
        </div>

        <div className="session-timeout-actions">
          <button
            ref={firstButtonRef}
            type="button"
            className="session-timeout-button primary"
            onClick={onExtendSession}
          >
            Extend Session
          </button>
          <button
            type="button"
            className="session-timeout-button secondary"
            onClick={onLogout}
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
};