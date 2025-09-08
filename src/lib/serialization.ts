import { UserWithRelations } from '@/types';

// Type for serialized user data with number amounts instead of Decimal
export type SerializedUserWithRelations = Omit<UserWithRelations, 'subscription'> & {
  subscription?: UserWithRelations['subscription'] extends infer S
    ? S extends { amount: any }
      ? Omit<S, 'amount'> & { amount: number | null }
      : S
    : undefined;
};

/**
 * Serialize user data to make it safe for client components
 * Converts Decimal fields to numbers to avoid serialization issues
 */
export function serializeUserData(user: UserWithRelations): SerializedUserWithRelations {
  return {
    ...user,
    subscription: user.subscription ? {
      ...user.subscription,
      amount: user.subscription.amount ? Number(user.subscription.amount) : null,
    } : undefined,
  } as SerializedUserWithRelations;
}

