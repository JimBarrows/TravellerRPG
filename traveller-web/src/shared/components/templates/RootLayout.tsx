import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { initializeTheme } from '../../../config/theme';

const RootLayout = () => {
  useEffect(() => {
    // Initialize theme on app start
    const cleanup = initializeTheme();
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  );
};

export default RootLayout;