import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RequireAuth } from '@/components/kiosk/RequireAuth';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';

const renderWithProviders = (initialRoute = '/kiosk/protected') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={[initialRoute]}>
            <Routes>
              <Route path="/login" element={<div>Login Screen</div>} />
              <Route
                path="/kiosk/protected"
                element={
                  <RequireAuth>
                    <div>Protected Kiosk Content</div>
                  </RequireAuth>
                }
              />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('RequireAuth - Public vs Authenticated Boundary', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects unauthenticated students to /login', async () => {
    renderWithProviders('/kiosk/protected');

    // Should redirect to login screen
    expect(await screen.findByText('Login Screen')).toBeInTheDocument();
    expect(screen.queryByText('Protected Kiosk Content')).not.toBeInTheDocument();
  });

  it('renders protected content inside KioskShell when session exists', async () => {
    // Seed authenticated demo session in localStorage
    localStorage.setItem(
      'campuskart-demo-session',
      JSON.stringify({
        user: {
          id: 'demo-student-1',
          email: 'student@campuskart.local',
          user_metadata: {
            student_id: 'CK2026001',
            full_name: 'Aarav Mehta',
            campus: 'Hyderabad',
          },
        },
      })
    );

    renderWithProviders('/kiosk/protected');

    // Protected content should be visible
    expect(await screen.findByText('Protected Kiosk Content')).toBeInTheDocument();

    // Kiosk navigation shell links should be present
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getAllByText('Wallet').length).toBeGreaterThanOrEqual(1);

    // When signed in, wallet balance amount is visible in the top navbar
    expect(screen.getByTitle('Student Wallet Balance')).toBeInTheDocument();
  });

  it('hides wallet amount and shows Sign In button when student is signed out', () => {
    // Unauthenticated state: localStorage is clean
    renderWithProviders('/login');

    // Wallet amount pill should NOT be rendered in navbar
    expect(screen.queryByTitle('Student Wallet Balance')).not.toBeInTheDocument();
  });
});
