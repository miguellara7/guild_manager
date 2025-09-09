import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-simple';
import PurchaseForm from '@/components/subscription/purchase-form';

export const metadata: Metadata = {
  title: 'Purchase Subscription | Tibia Guild Manager',
  description: 'Subscribe to Tibia Guild Manager with Tibia Coins for guild monitoring.',
};

export default async function PurchasePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <PurchaseForm searchParams={searchParams} />;
}
