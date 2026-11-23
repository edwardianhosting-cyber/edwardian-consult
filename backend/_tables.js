require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const p = new PrismaClient();
(async () => {
  try {
    const tables = await p.$queryRawUnsafe(`select tablename from pg_tables where schemaname='public' order by tablename`);
    fs.writeFileSync('C:\\edpg\\tables.txt', tables.map(t => t.tablename).join('\n') + '\n');
    console.log('TABLES:', tables.length);
  } catch (e) {
    console.error('ERR', e.message);
  } finally { await p.$disconnect(); }
})();