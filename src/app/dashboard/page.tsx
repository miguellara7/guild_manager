import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-simple';
import { getUserWithGuild } from '@/lib/db-utils';
import { serializeUserData } from '@/lib/serialization';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import DashboardOverview from '@/components/dashboard/dashboard-overview';
import GuildMasterDashboard from '@/components/dashboard/guild-master-dashboard';
import GuildMemberDashboard from '@/components/dashboard/guild-member-dashboard';

export const metadata: Metadata = {
  title: 'Dashboard | Tibia Guild Manager',
  description: 'Guild management dashboard with real-time statistics and monitoring.',
};

export default async function DashboardPage() {
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

  // Serialize the user data to avoid Decimal serialization issues
  const serializedUser = serializeUserData(user);

  // Show appropriate dashboard based on role
  const DashboardComponent = 
    user.role === 'GUILD_ADMIN' ? GuildMasterDashboard :
    user.role === 'GUILD_MEMBER' ? GuildMemberDashboard :
    DashboardOverview;

  return (
    <DashboardLayout>
      <DashboardComponent user={serializedUser} />
    </DashboardLayout>
  );
}
