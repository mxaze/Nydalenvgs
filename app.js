const { Prisma } = require('@prisma/client');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Working');
});

app.get('/', (req, res) => {
  const allUsers = Prisma.user.findMany();
  res.json(allUsers);
});

app.post('/', (req, res) => {
  const newUser =  Prisma.user.create({ data: req.body});
  res.json(newUser);
});



app.listen(3000, () => {
  console.log('Server is running on port 3000');
});