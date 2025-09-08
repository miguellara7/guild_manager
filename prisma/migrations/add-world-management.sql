-- Add World Management for Multi-World Support

-- Create WorldSubscription table to handle multiple worlds per user
CREATE TABLE "WorldSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "userId" TEXT NOT NULL,
    "world" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxGuilds" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- Create GuildConfiguration to link guilds to user's world subscriptions
CREATE TABLE "GuildConfiguration" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "worldSubscriptionId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "type" TEXT NOT NULL CHECK ("type" IN ('MAIN', 'ALLY', 'ENEMY')) DEFAULT 'MAIN',
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("worldSubscriptionId") REFERENCES "WorldSubscription" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX "WorldSubscription_userId_world_idx" ON "WorldSubscription"("userId", "world");
CREATE INDEX "WorldSubscription_world_isActive_idx" ON "WorldSubscription"("world", "isActive");
CREATE INDEX "GuildConfiguration_worldSubscriptionId_idx" ON "GuildConfiguration"("worldSubscriptionId");
CREATE INDEX "GuildConfiguration_type_isActive_idx" ON "GuildConfiguration"("type", "isActive");

-- Add unique constraints
CREATE UNIQUE INDEX "WorldSubscription_userId_world_key" ON "WorldSubscription"("userId", "world");
CREATE UNIQUE INDEX "GuildConfiguration_worldSubscriptionId_guildId_key" ON "GuildConfiguration"("worldSubscriptionId", "guildId");


