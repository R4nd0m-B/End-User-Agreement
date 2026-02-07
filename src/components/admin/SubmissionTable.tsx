'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Submission } from '@/lib/types';

interface SubmissionTableProps {
  submissions: Submission[];
  total: number;
  page: number;
  pageSize: number;
  search?: string;
}

export default function SubmissionTable({ submissions, total, page, pageSize, search }: SubmissionTableProps) {
  const [searchValue, setSearchValue] = useState(search || '');
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / pageSize);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue) {
      params.set('search', searchValue);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/admin/submissions?${params.toString()}`);
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', p.toString());
    router.push(`/admin/submissions?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by name, email, or ID..."
            className="flex-1"
          />
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
        <div className="flex items-center gap-2">
          <a href="/api/export/csv" className="inline-flex">
            <Button variant="secondary" size="sm">
              Export CSV
            </Button>
          </a>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left bg-gray-50">
              <th className="px-6 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider">User ID</th>
              <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  No submissions found.
                </td>
              </tr>
            ) : (
              submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-xs text-gray-500">{sub.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3.5 text-gray-900 font-medium">{sub.full_name}</td>
                  <td className="px-4 py-3.5 text-gray-600">{sub.email}</td>
                  <td className="px-4 py-3.5 text-gray-600">{sub.phone}</td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs">{format(new Date(sub.created_at), 'MMM d, yyyy h:mm a')}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/submissions/${sub.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                      <a href={`/api/export/pdf/${sub.id}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">PDF</Button>
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} submissions
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <Button
                  key={p}
                  variant={p === page ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => goToPage(p)}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
