import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-simple';
import { getUserWithGuild } from '@/lib/db-utils';
import { serializeUserData } from '@/lib/serialization';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import GuildSettingsPage from '@/components/dashboard/pages/guild-settings-page';

export const metadata: Metadata = {
  title: 'Guild Settings | Tibia Guild Manager',
  description: 'Configure your guild worlds and tracking settings.',
};

export default async function SettingsPage() {
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

  // Only Guild Admin can access settings
  if (user.role !== 'GUILD_ADMIN') {
    redirect('/dashboard');
  }

  // Serialize the user data to avoid Decimal serialization issues
  const serializedUser = serializeUserData(user);

  return (
    <DashboardLayout>
      <GuildSettingsPage user={serializedUser} />
    </DashboardLayout>
  );
}
