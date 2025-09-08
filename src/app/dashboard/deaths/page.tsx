import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-simple';
import { getUserWithGuild } from '@/lib/db-utils';
import { serializeUserData } from '@/lib/serialization';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import DeathAnalysisPage from '@/components/dashboard/pages/death-analysis-page';

export const metadata: Metadata = {
  title: 'Death Analysis | Tibia Guild Manager',
  description: 'Analyze guild member deaths and PvP statistics.',
};

export default async function DeathsPage() {
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
      <DeathAnalysisPage user={serializeUserData(user)} />
    </DashboardLayout>
  );
}
