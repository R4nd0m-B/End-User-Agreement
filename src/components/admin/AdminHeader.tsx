'use client';

import { useRouter, usePathname } from 'next/navigation';
import Button from '@/components/ui/Button';

const pageTitles: Record<string, { title: string; description: string }> = {
  '/admin': { title: 'Dashboard', description: 'Overview and quick stats' },
  '/admin/submissions': { title: 'Submissions', description: 'Manage form submissions' },
  '/admin/agreement': { title: 'Agreement', description: 'Edit the ethical use agreement' },
  '/admin/fields': { title: 'Form Fields', description: 'Configure custom form fields' },
  '/admin/branding': { title: 'Branding', description: 'Customize appearance and branding' },
  '/admin/settings': { title: 'Settings', description: 'Access keys and admin password' },
};

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const pageInfo = pageTitles[pathname] || { title: 'Admin', description: '' };

  // Handle submission detail pages
  const isSubmissionDetail = pathname.startsWith('/admin/submissions/') && pathname !== '/admin/submissions';

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-sm font-semibold text-gray-900">
          {isSubmissionDetail ? 'Submission Detail' : pageInfo.title}
        </h1>
        <p className="text-xs text-gray-500">
          {isSubmissionDetail ? 'View submission details' : pageInfo.description}
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign Out
      </Button>
    </header>
  );
}
