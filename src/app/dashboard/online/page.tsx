import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-simple';
import { getUserWithGuild } from '@/lib/db-utils';
import { serializeUserData } from '@/lib/serialization';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import OnlineMonitoringPage from '@/components/dashboard/pages/online-monitoring-page';

export const metadata: Metadata = {
  title: 'Online Monitoring | Tibia Guild Manager',
  description: 'Real-time monitoring of guild members and enemies online.',
};

export default async function OnlinePage() {
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
      <OnlineMonitoringPage user={serializeUserData(user)} />
    </DashboardLayout>
  );
}
