require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    const r = await p.$queryRawUnsafe('select version() as v');
    console.log('VERSION:', r[0].v);
    const db = await p.$queryRawUnsafe('select current_database() as d');
    console.log('DB:', db[0].d);
    const n = await p.$queryRawUnsafe("select count(*)::int as c from information_schema.tables where table_schema='public'");
    console.log('PUBLIC_TABLES:', n[0].c);
  } catch (e) {
    console.error('ERR', e.message);
  } finally {
    await p.$disconnect();
  }
})();