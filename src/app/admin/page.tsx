import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions, checkUserPermissions } from '@/lib/auth';
import AdminDashboard from '@/components/admin/admin-dashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Tibia Guild Manager',
  description: 'Super admin dashboard for system management and payment verification.',
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Check if user has super admin permissions
  const hasPermission = await checkUserPermissions(session.user.id, 'SUPER_ADMIN');
  if (!hasPermission) {
    redirect('/dashboard');
  }

  return <AdminDashboard />;
}


