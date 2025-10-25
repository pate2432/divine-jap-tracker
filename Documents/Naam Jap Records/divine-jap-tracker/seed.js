const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const ak = await prisma.user.upsert({
    where: { username: 'ak' },
    update: {},
    create: {
      username: 'ak',
      password: hashedPassword,
    },
  });

  const manna = await prisma.user.upsert({
    where: { username: 'manna' },
    update: {},
    create: {
      username: 'manna',
      password: hashedPassword,
    },
  });

  console.log('Users created:', { ak: ak.id, manna: manna.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
