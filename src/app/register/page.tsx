import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-simple';
import RegisterForm from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Register | Tibia Guild Manager',
  description: 'Create your account to start monitoring your Tibia guild.',
};

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  // Redirect if already logged in
  if (session) {
    redirect('/dashboard');
  }

  return <RegisterForm />;
}
