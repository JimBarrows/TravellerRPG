import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionTimeoutWarning } from './SessionTimeoutWarning';

describe('SessionTimeoutWarning', () => {
  const mockOnExtendSession = vi.fn();
  const mockOnLogout = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    isVisible: true,
    timeRemaining: 300000, // 5 minutes
    onExtendSession: mockOnExtendSession,
    onLogout: mockOnLogout,
    onClose: mockOnClose
  };

  it('should render session timeout warning when visible', () => {
    render(<SessionTimeoutWarning {...defaultProps} />);
    
    expect(screen.getByText(/session expiring soon/i)).toBeInTheDocument();
    expect(screen.getByText(/your session will expire in/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /extend session/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout now/i })).toBeInTheDocument();
  });

  it('should not render when not visible', () => {
    render(<SessionTimeoutWarning {...defaultProps} isVisible={false} />);
    
    expect(screen.queryByText(/session expiring soon/i)).not.toBeInTheDocument();
  });

  it('should display correct time remaining', () => {
    render(<SessionTimeoutWarning {...defaultProps} timeRemaining={180000} />); // 3 minutes
    
    expect(screen.getByText(/3 minutes/i)).toBeInTheDocument();
  });

  it('should display seconds when less than a minute remains', () => {
    render(<SessionTimeoutWarning {...defaultProps} timeRemaining={30000} />); // 30 seconds
    
    expect(screen.getByText(/30 seconds/i)).toBeInTheDocument();
  });

  it('should update countdown automatically', () => {
    const { rerender } = render(<SessionTimeoutWarning {...defaultProps} timeRemaining={300000} />);
    
    expect(screen.getByText(/5 minutes/i)).toBeInTheDocument();
    
    rerender(<SessionTimeoutWarning {...defaultProps} timeRemaining={240000} />); // 4 minutes
    
    expect(screen.getByText(/4 minutes/i)).toBeInTheDocument();
  });

  it('should call onExtendSession when extend button is clicked', () => {
    render(<SessionTimeoutWarning {...defaultProps} />);
    
    const extendButton = screen.getByRole('button', { name: /extend session/i });
    fireEvent.click(extendButton);
    
    expect(mockOnExtendSession).toHaveBeenCalledTimes(1);
  });

  it('should call onLogout when logout button is clicked', () => {
    render(<SessionTimeoutWarning {...defaultProps} />);
    
    const logoutButton = screen.getByRole('button', { name: /logout now/i });
    fireEvent.click(logoutButton);
    
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close button is clicked', () => {
    render(<SessionTimeoutWarning {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show critical warning style when time is very low', () => {
    render(<SessionTimeoutWarning {...defaultProps} timeRemaining={60000} />); // 1 minute
    
    const warning = screen.getByRole('dialog');
    expect(warning).toHaveClass('critical');
  });

  it('should show warning style for moderate time remaining', () => {
    render(<SessionTimeoutWarning {...defaultProps} timeRemaining={180000} />); // 3 minutes
    
    const warning = screen.getByRole('dialog');
    expect(warning).toHaveClass('warning');
  });

  it('should handle keyboard events for accessibility', () => {
    render(<SessionTimeoutWarning {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should auto-logout when time reaches zero', async () => {
    const { rerender } = render(<SessionTimeoutWarning {...defaultProps} timeRemaining={1000} />);
    
    rerender(<SessionTimeoutWarning {...defaultProps} timeRemaining={0} />);
    
    await waitFor(() => {
      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });
  });

  it('should be accessible with proper ARIA attributes', () => {
    render(<SessionTimeoutWarning {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
    
    const title = screen.getByRole('heading', { name: /session expiring soon/i });
    expect(title).toBeInTheDocument();
  });

  it('should trap focus within the dialog', () => {
    render(<SessionTimeoutWarning {...defaultProps} />);
    
    const extendButton = screen.getByRole('button', { name: /extend session/i });
    const logoutButton = screen.getByRole('button', { name: /logout now/i });
    const closeButton = screen.getByRole('button', { name: /close/i });
    
    // Simulate tab navigation
    extendButton.focus();
    expect(document.activeElement).toBe(extendButton);
    
    fireEvent.keyDown(extendButton, { key: 'Tab' });
    expect(document.activeElement).toBe(logoutButton);
    
    fireEvent.keyDown(logoutButton, { key: 'Tab' });
    expect(document.activeElement).toBe(closeButton);
  });
});