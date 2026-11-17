import { type ReactNode } from 'react';
import { AppNavbar } from '@/components/navigation/AppNavbar';

export function KioskShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      <AppNavbar />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}

export default KioskShell;
