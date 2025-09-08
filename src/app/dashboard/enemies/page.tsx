import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-simple';
import { getUserWithGuild } from '@/lib/db-utils';
import { serializeUserData } from '@/lib/serialization';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import EnemyTrackingPage from '@/components/dashboard/pages/enemy-tracking-page';

export const metadata: Metadata = {
  title: 'Enemy Tracking | Tibia Guild Manager',
  description: 'Monitor and track enemy guilds and players.',
};

export default async function EnemiesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const user = await getUserWithGuild(session.user.id);

  if (!user) {
    redirect('/login');
  }

  // Super Admin goes to business panel
  if (user.role === 'SUPER_ADMIN') {
    redirect('/admin');
  }

  // Guild users need a guild
  if (!user.guild) {
    redirect('/setup');
  }

  return (
    <DashboardLayout>
      <EnemyTrackingPage user={serializeUserData(user)} />
    </DashboardLayout>
  );
}
