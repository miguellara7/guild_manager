-- CreateEnum
CREATE TYPE "public"."GuildConfigType" AS ENUM ('MAIN', 'ALLY', 'ENEMY');

-- CreateTable
CREATE TABLE "public"."WorldSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "world" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxGuilds" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorldSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GuildConfiguration" (
    "id" TEXT NOT NULL,
    "worldSubscriptionId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "type" "public"."GuildConfigType" NOT NULL DEFAULT 'MAIN',
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorldSubscription_world_isActive_idx" ON "public"."WorldSubscription"("world", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "WorldSubscription_userId_world_key" ON "public"."WorldSubscription"("userId", "world");

-- CreateIndex
CREATE INDEX "GuildConfiguration_type_isActive_idx" ON "public"."GuildConfiguration"("type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "GuildConfiguration_worldSubscriptionId_guildId_key" ON "public"."GuildConfiguration"("worldSubscriptionId", "guildId");

-- AddForeignKey
ALTER TABLE "public"."WorldSubscription" ADD CONSTRAINT "WorldSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuildConfiguration" ADD CONSTRAINT "GuildConfiguration_worldSubscriptionId_fkey" FOREIGN KEY ("worldSubscriptionId") REFERENCES "public"."WorldSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuildConfiguration" ADD CONSTRAINT "GuildConfiguration_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "public"."Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
