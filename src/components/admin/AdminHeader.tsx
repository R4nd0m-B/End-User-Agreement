'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function AdminHeader() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div />
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        Sign Out
      </Button>
    </header>
  );
}
