const { PrismaClient } = require('./node_modules/@prisma/client');
const p = new PrismaClient();
p.user.findMany({ select: { email: true, role: true, portalId: true, parentAccessCode: true } })
  .then(users => {
    console.log(JSON.stringify(users, null, 2));
    return p.$disconnect();
  });
