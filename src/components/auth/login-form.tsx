'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Sword, Users } from 'lucide-react';
import { AnimatedThemeToggle } from '@/components/ui/theme-toggle';

const loginSchema = z.object({
  characterName: z
    .string()
    .min(1, 'Character name is required')
    .max(30, 'Character name must be less than 30 characters')
    .regex(/^[A-Za-z\s]+$/, 'Character name can only contain letters and spaces'),
  world: z
    .string()
    .min(1, 'World is required')
    .max(20, 'World name must be less than 20 characters'),
  guildPassword: z
    .string()
    .min(6, 'Guild password must be at least 6 characters')
    .max(100, 'Guild password must be less than 100 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        characterName: data.characterName,
        world: data.world,
        guildPassword: data.guildPassword,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        // Refresh session and redirect
        await getSession();
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Sword className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Tibia Guild Manager
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor your guild, track enemies, and stay ahead of the game
            </p>
          </div>
          <div className="flex justify-center">
            <AnimatedThemeToggle />
          </div>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/20 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Guild Login
            </CardTitle>
            <CardDescription className="text-center">
              Enter your character details and guild password to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="characterName">Character Name</Label>
                <Input
                  id="characterName"
                  type="text"
                  placeholder="e.g., Knight Slayer"
                  disabled={isLoading}
                  {...register('characterName')}
                  className={errors.characterName ? 'border-red-500' : ''}
                />
                {errors.characterName && (
                  <p className="text-sm text-red-500">{errors.characterName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="world">World</Label>
                <Input
                  id="world"
                  type="text"
                  placeholder="e.g., Antica"
                  disabled={isLoading}
                  {...register('world')}
                  className={errors.world ? 'border-red-500' : ''}
                />
                {errors.world && (
                  <p className="text-sm text-red-500">{errors.world.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guildPassword">Guild Password</Label>
                <Input
                  id="guildPassword"
                  type="password"
                  placeholder="Enter your guild password"
                  disabled={isLoading}
                  {...register('guildPassword')}
                  className={errors.guildPassword ? 'border-red-500' : ''}
                />
                {errors.guildPassword && (
                  <p className="text-sm text-red-500">{errors.guildPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Login to Guild'
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-semibold mb-2">How it works:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Your character must be in a registered guild</li>
                  <li>• Guild admin provides the guild password</li>
                  <li>• Character existence is verified with Tibia servers</li>
                  <li>• Real-time monitoring starts immediately</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2024 Tibia Guild Manager. Built for the Tibia community.</p>
        </div>
      </div>
    </div>
  );
}
