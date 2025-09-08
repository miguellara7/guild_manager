import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

// Transaction wrapper with retry logic
export async function withTransaction<T>(
  fn: (prisma: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(fn) as T;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Pagination helper
export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function paginate<T>(
  model: any,
  options: PaginationOptions,
  where?: any,
  include?: any,
  orderBy?: any
): Promise<PaginatedResult<T>> {
  const { page, limit } = options;
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    model.findMany({
      where,
      include,
      orderBy,
      skip,
      take: limit,
    }),
    model.count({ where }),
  ]);
  
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// Bulk operations
export async function bulkUpsert<T>(
  model: any,
  data: T[],
  uniqueFields: string[],
  batchSize = 100
): Promise<void> {
  const batches = [];
  for (let i = 0; i < data.length; i += batchSize) {
    batches.push(data.slice(i, i + batchSize));
  }
  
  for (const batch of batches) {
    const operations = batch.map((item: any) => {
      const where = uniqueFields.reduce((acc, field) => {
        acc[field] = item[field];
        return acc;
      }, {} as any);
      
      return model.upsert({
        where,
        update: item,
        create: item,
      });
    });
    
    await Promise.all(operations);
  }
}

// Database seeding helpers
export async function seedDatabase(): Promise<void> {
  console.log('Starting database seeding...');
  
  // Create default system settings
  await prisma.systemSettings.upsert({
    where: { key: 'maintenance_mode' },
    update: {},
    create: {
      key: 'maintenance_mode',
      value: 'false',
      description: 'Enable/disable maintenance mode',
    },
  });
  
  await prisma.systemSettings.upsert({
    where: { key: 'api_rate_limit' },
    update: {},
    create: {
      key: 'api_rate_limit',
      value: '60',
      description: 'API rate limit per minute',
    },
  });
  
  await prisma.systemSettings.upsert({
    where: { key: 'default_subscription_days' },
    update: {},
    create: {
      key: 'default_subscription_days',
      value: '30',
      description: 'Default subscription duration in days',
    },
  });
  
  console.log('Database seeding completed');
}

// Query optimization helpers
export const commonIncludes = {
  userWithGuild: {
    guild: {
      include: {
        players: true,
        alertRules: true,
      },
    },
    subscription: true,
    alertRules: true,
  },
  guildWithPlayers: {
    players: {
      include: {
        deaths: {
          take: 10,
          orderBy: { timestamp: 'desc' as const },
        },
      },
    },
    users: true,
    alertRules: true,
    parentGuild: true,
    academyGuilds: true,
  },
  playerWithDeaths: {
    deaths: {
      take: 20,
      orderBy: { timestamp: 'desc' as const },
    },
    guild: true,
  },
} as const;

// Index management
export async function createIndexes(): Promise<void> {
  // This would typically be handled by Prisma migrations
  // but we can add custom indexes here if needed
  console.log('Custom indexes would be created here if needed');
}

export default prisma;
