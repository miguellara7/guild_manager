import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import SubscriptionManager from '@/components/subscription/subscription-manager';

export const metadata: Metadata = {
  title: 'Subscription | Tibia Guild Manager',
  description: 'Manage your subscription and billing with Tibia Coins.',
};

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <SubscriptionManager userId={session.user.id} />
    </DashboardLayout>
  );
}


