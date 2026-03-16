import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({ children }) {
  const cookieStore = cookies();
  const token = cookieStore.get('tm_session')?.value;
  if (!token) redirect('/login');

  let user = null;
  try { user = verifyToken(token); } catch { redirect('/login'); }

  return (
    <div className="flex min-h-screen bg-void">
      <Sidebar user={user} />
      <main className="flex-1 ml-64 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
