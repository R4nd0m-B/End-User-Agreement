import Card from '@/components/ui/Card';
import LoginForm from '@/components/admin/LoginForm';

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Administration</h1>
          <p className="text-gray-500 text-sm">Sign in to manage the platform</p>
        </div>
        <Card>
          <LoginForm />
        </Card>
      </div>
    </main>
  );
}
