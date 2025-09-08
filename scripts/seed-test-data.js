const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando datos de prueba...');

  // 1. Crear Guild de prueba
  const testGuild = await prisma.guild.upsert({
    where: {
      name_world: {
        name: 'Test Guild',
        world: 'Antica',
      },
    },
    update: {},
    create: {
      name: 'Test Guild',
      world: 'Antica',
      type: 'FRIEND',
      isMainGuild: true,
      guildPassword: await bcrypt.hash('testguild123', 12),
      description: 'Guild de prueba para testing',
    },
  });

  console.log('✅ Guild creado:', testGuild.name);

  // 2. Crear Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { characterName: 'Super Admin' },
    update: {},
    create: {
      characterName: 'Super Admin',
      world: 'Antica',
      role: 'SUPER_ADMIN',
      passwordHash: await bcrypt.hash('testguild123', 12),
      email: 'superadmin@test.com',
      guildId: testGuild.id,
    },
  });

  console.log('✅ Super Admin creado:', superAdmin.characterName);

  // 3. Crear Guild Admin
  const guildAdmin = await prisma.user.upsert({
    where: { characterName: 'Guild Master' },
    update: {},
    create: {
      characterName: 'Guild Master',
      world: 'Antica',
      role: 'GUILD_ADMIN',
      passwordHash: await bcrypt.hash('testguild123', 12),
      email: 'guildadmin@test.com',
      guildId: testGuild.id,
    },
  });

  console.log('✅ Guild Admin creado:', guildAdmin.characterName);

  // 4. Crear Usuario Normal (Cliente)
  const normalUser = await prisma.user.upsert({
    where: { characterName: 'Test Player' },
    update: {},
    create: {
      characterName: 'Test Player',
      world: 'Antica',
      role: 'GUILD_MEMBER',
      passwordHash: await bcrypt.hash('testguild123', 12),
      email: 'player@test.com',
      guildId: testGuild.id,
    },
  });

  console.log('✅ Usuario normal creado:', normalUser.characterName);

  // 5. Crear algunos players de prueba
  const testPlayers = [
    {
      name: 'Enemy Player 1',
      world: 'Antica',
      level: 150,
      vocation: 'Elite Knight',
      type: 'EXTERNAL_ENEMY',
      isOnline: true,
    },
    {
      name: 'Guild Member 1',
      world: 'Antica',
      level: 200,
      vocation: 'Elder Druid',
      type: 'GUILD_MEMBER',
      guildId: testGuild.id,
      isOnline: false,
    },
    {
      name: 'Friend Player 1',
      world: 'Antica',
      level: 180,
      vocation: 'Royal Paladin',
      type: 'EXTERNAL_FRIEND',
      isOnline: true,
    },
  ];

  for (const player of testPlayers) {
    await prisma.player.upsert({
      where: {
        name_world: {
          name: player.name,
          world: player.world,
        },
      },
      update: {},
      create: player,
    });
  }

  console.log('✅ Players de prueba creados');

  // 6. Crear algunas muertes de prueba
  const guildMember = await prisma.player.findFirst({
    where: { name: 'Guild Member 1' },
  });

  if (guildMember) {
    await prisma.death.create({
      data: {
        playerId: guildMember.id,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        level: 199,
        killers: ['Enemy Player 1', 'Another Enemy'],
        description: 'Killed by Enemy Player 1 and Another Enemy',
        type: 'PVP',
        processed: true,
      },
    });

    await prisma.death.create({
      data: {
        playerId: guildMember.id,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día atrás
        level: 200,
        killers: ['a dragon'],
        description: 'Killed by a dragon',
        type: 'PVE',
        processed: true,
      },
    });
  }

  console.log('✅ Muertes de prueba creadas');

  // 7. Crear subscription de prueba para el guild admin
  await prisma.subscription.upsert({
    where: { userId: guildAdmin.id },
    update: {},
    create: {
      userId: guildAdmin.id,
      plan: 'BASIC',
      worldLimit: 1,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amount: 20.00,
    },
  });

  console.log('✅ Subscription de prueba creada');

  console.log('\n🎉 ¡Datos de prueba creados exitosamente!');
  console.log('\n📋 Credenciales de prueba:');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ SUPER ADMIN:                                                │');
  console.log('│ Character: Super Admin                                      │');
  console.log('│ World: Antica                                              │');
  console.log('│ Password: testguild123                                      │');
  console.log('│ Panel: http://localhost:3000/admin                         │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log('│ GUILD ADMIN (Cliente):                                      │');
  console.log('│ Character: Guild Master                                     │');
  console.log('│ World: Antica                                              │');
  console.log('│ Password: testguild123                                      │');
  console.log('│ Dashboard: http://localhost:3000/dashboard                  │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log('│ USUARIO NORMAL:                                             │');
  console.log('│ Character: Test Player                                      │');
  console.log('│ World: Antica                                              │');
  console.log('│ Password: testguild123                                      │');
  console.log('│ Dashboard: http://localhost:3000/dashboard                  │');
  console.log('└─────────────────────────────────────────────────────────────┘');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
