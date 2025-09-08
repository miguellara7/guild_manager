import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-simple';
import { getUserWithGuild } from '@/lib/db-utils';
import { serializeUserData } from '@/lib/serialization';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import GuildMembersPage from '@/components/dashboard/pages/guild-members-page';

export const metadata: Metadata = {
  title: 'Guild Members | Tibia Guild Manager',
  description: 'Manage and monitor your guild members.',
};

export default async function MembersPage() {
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

  // Only Guild Admin can access member management
  if (user.role !== 'GUILD_ADMIN') {
    redirect('/dashboard');
  }

  return (
    <DashboardLayout>
      <GuildMembersPage user={serializeUserData(user)} />
    </DashboardLayout>
  );
}
