import { getSubmissions } from '@/lib/actions/submission';
import Card from '@/components/ui/Card';
import SubmissionTable from '@/components/admin/SubmissionTable';

interface SubmissionsPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminSubmissionsPage({ searchParams }: SubmissionsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const search = params.search || '';
  const pageSize = 20;

  const { submissions, total } = await getSubmissions(page, pageSize, search);

  return (
    <div>
      <Card>
        <SubmissionTable
          submissions={submissions}
          total={total}
          page={page}
          pageSize={pageSize}
          search={search}
        />
      </Card>
    </div>
  );
}
