import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import DashboardNav from '@/components/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('fatf_session')?.value;

  if (!token) {
    redirect('/auth');
  }

  const session = await verifySession(token);

  if (!session) {
    redirect('/auth');
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardNav email={session.email} />
      <main className="pl-64">
        <div className="max-w-6xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
