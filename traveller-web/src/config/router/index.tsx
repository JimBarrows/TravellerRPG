import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Layout components
const RootLayout = lazy(() => import('../../shared/components/templates/RootLayout'));
const AuthLayout = lazy(() => import('../../shared/components/templates/AuthLayout'));
const DashboardLayout = lazy(() => import('../../shared/components/templates/DashboardLayout'));

// Page components (lazy loaded for code splitting)
const HomePage = lazy(() => import('../../features/common/pages/HomePage'));
const LoginPage = lazy(() => import('../../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../../features/auth/pages/RegisterPage'));
const CharacterListPage = lazy(() => import('../../features/character/pages/CharacterListPage'));
const CharacterCreatePage = lazy(() => import('../../features/character/pages/CharacterCreatePage'));
const CharacterEditPage = lazy(() => import('../../features/character/pages/CharacterEditPage'));
const CharacterViewPage = lazy(() => import('../../features/character/pages/CharacterViewPage'));
const CampaignListPage = lazy(() => import('../../features/campaign/pages/CampaignListPage'));
const CampaignCreatePage = lazy(() => import('../../features/campaign/pages/CampaignCreatePage'));
const CampaignEditPage = lazy(() => import('../../features/campaign/pages/CampaignEditPage'));
const CampaignViewPage = lazy(() => import('../../features/campaign/pages/CampaignViewPage'));
const GameplaySessionPage = lazy(() => import('../../features/gameplay/pages/GameplaySessionPage'));
const NotFoundPage = lazy(() => import('../../features/common/pages/NotFoundPage'));

// Protected Route component
const ProtectedRoute = lazy(() => import('../../features/auth/components/ProtectedRoute'));

// Loading component for Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Wrapper component for Suspense
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingFallback />}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <SuspenseWrapper>
        <RootLayout />
      </SuspenseWrapper>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <HomePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'auth',
        element: (
          <SuspenseWrapper>
            <AuthLayout />
          </SuspenseWrapper>
        ),
        children: [
          {
            path: 'login',
            element: (
              <SuspenseWrapper>
                <LoginPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'register',
            element: (
              <SuspenseWrapper>
                <RegisterPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: 'dashboard',
        element: (
          <SuspenseWrapper>
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/characters" replace />,
          },
          {
            path: 'characters',
            children: [
              {
                index: true,
                element: (
                  <SuspenseWrapper>
                    <CharacterListPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'create',
                element: (
                  <SuspenseWrapper>
                    <CharacterCreatePage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: ':id',
                element: (
                  <SuspenseWrapper>
                    <CharacterViewPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: ':id/edit',
                element: (
                  <SuspenseWrapper>
                    <CharacterEditPage />
                  </SuspenseWrapper>
                ),
              },
            ],
          },
          {
            path: 'campaigns',
            children: [
              {
                index: true,
                element: (
                  <SuspenseWrapper>
                    <CampaignListPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'create',
                element: (
                  <SuspenseWrapper>
                    <CampaignCreatePage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: ':id',
                element: (
                  <SuspenseWrapper>
                    <CampaignViewPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: ':id/edit',
                element: (
                  <SuspenseWrapper>
                    <CampaignEditPage />
                  </SuspenseWrapper>
                ),
              },
            ],
          },
          {
            path: 'gameplay',
            children: [
              {
                path: 'session/:id',
                element: (
                  <SuspenseWrapper>
                    <GameplaySessionPage />
                  </SuspenseWrapper>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
  },
]);

export default router;