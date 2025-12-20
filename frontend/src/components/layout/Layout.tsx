import { type ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
