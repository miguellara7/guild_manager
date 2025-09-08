import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import LoginForm from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Login | Tibia Guild Manager',
  description: 'Login to your guild account to access real-time player tracking and notifications.',
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  // Redirect if already logged in
  if (session) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
