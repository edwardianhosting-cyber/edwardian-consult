import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Connection retry configuration
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds

async function createPrismaClient(): Promise<PrismaClient> {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      const client = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });
      
      // Test the connection
      await client.$connect();
      console.log('✅ Database connected successfully');
      return client;
    } catch (error) {
      retries++;
      console.error(`❌ Database connection attempt ${retries}/${MAX_RETRIES} failed:`, error);
      
      if (retries === MAX_RETRIES) {
        console.error('Max retries reached. Throwing error.');
        throw error;
      }
      
      console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  throw new Error('Failed to connect to database after maximum retries');
}

// Initialize Prisma client with retry logic
let prismaInstance: PrismaClient;

async function initializePrisma(): Promise<PrismaClient> {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  
  prismaInstance = await createPrismaClient();
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
  
  return prismaInstance;
}

// Synchronous export for backward compatibility
// Note: For serverless environments, use initializePrisma() instead
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Auto-initialize with retry in production
if (process.env.NODE_ENV === 'production') {
  initializePrisma().catch(console.error);
}

// Keep-alive ping to prevent Neon auto-suspend (runs every 4 minutes)
if (process.env.NODE_ENV === 'production') {
  setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      console.error('Keep-alive ping failed:', error);
      // Attempt to reconnect
      try {
        await prisma.$disconnect();
        await prisma.$connect();
        console.log('✅ Database reconnected after keep-alive failure');
      } catch (reconnectError) {
        console.error('Failed to reconnect:', reconnectError);
      }
    }
  }, 4 * 60 * 1000); // 4 minutes (Neon suspends after 5 minutes of inactivity)
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
export { initializePrisma };
