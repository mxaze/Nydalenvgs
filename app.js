const { PrismaClient } = require('@prisma/client');
const express = require('express');
const app = express();
const prisma = new PrismaClient();

app.get('/', (req, res) => {
  res.send('Working');
});

app.get('/', async (_, res) => {
  const allUsers = await prisma.user.findMany();
  res.json(allUsers);
});

app.post('/', async (req, res) => {
  const newUser = await prisma.user.create({ data: req.body });
  res.json(newUser);
});

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'Bent',
      email: 'Bent@gmail.com',
    },
  })
  console.log(user)
}

async function main() {
  await prisma.user.create({
    data: {
      name: 'Bent',
      email: 'Bent@prisma.io',
      posts: {
        create: { title: 'teach' },
      },
      profile: {
        create: { bio: 'I like drift' },
      },
    },
  })

  const allUsers = await prisma.user.findMany({
    include: {
      posts: true,
      profile: true,
    },
  })
  console.dir(allUsers, { depth: null })
}

main().catch((error) => {
  console.error(error);
}).finally(() => {
  prisma.$disconnect();
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});