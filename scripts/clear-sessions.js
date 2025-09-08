const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearSessions() {
  console.log('🧹 Limpiando sesiones...');
  
  try {
    // Eliminar todas las sesiones existentes
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`✅ Eliminadas ${deletedSessions.count} sesiones`);
    
    // Eliminar todas las cuentas (para limpiar tokens)
    const deletedAccounts = await prisma.account.deleteMany({});
    console.log(`✅ Eliminadas ${deletedAccounts.count} cuentas`);
    
    // Eliminar tokens de verificación
    const deletedTokens = await prisma.verificationToken.deleteMany({});
    console.log(`✅ Eliminados ${deletedTokens.count} tokens`);
    
    console.log('✅ Sesiones limpiadas exitosamente');
    console.log('💡 Ahora puedes hacer login desde cero');
    
  } catch (error) {
    console.error('❌ Error limpiando sesiones:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearSessions();
