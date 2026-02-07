'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="pb-3 font-medium text-gray-500">User ID</th>
              <th className="pb-3 font-medium text-gray-500">Name</th>
              <th className="pb-3 font-medium text-gray-500">Email</th>
              <th className="pb-3 font-medium text-gray-500">Phone</th>
              <th className="pb-3 font-medium text-gray-500">Date</th>
              <th className="pb-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No submissions found.
                </td>
              </tr>
            ) : (
              submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="py-3 font-mono text-xs text-gray-600">{sub.id.slice(0, 8)}...</td>
                  <td className="py-3 text-gray-900">{sub.full_name}</td>
                  <td className="py-3 text-gray-600">{sub.email}</td>
                  <td className="py-3 text-gray-600">{sub.phone}</td>
                  <td className="py-3 text-gray-500 text-xs">{new Date(sub.created_at).toLocaleString()}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
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
