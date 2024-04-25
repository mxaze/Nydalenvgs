const { PrismaClient, Role } = require("@prisma/client");
const express = require("express");
const app = express();
const prisma = new PrismaClient();
const cookieparser = require("cookie-parser");
const crypto = require("crypto");
const { register } = require("module");

app.use(express.json());
app.use(cookieparser());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/register.html");
});

app.use(async (req, res, next) => {
  const path = req.path;
  const token = req.cookies.token;

  if (!token) return res.redirect("/");
  const user = await prisma.users.findFirst({
    where: {
      token: token,
    },
  });
  if (!user) return res.redirect("/");

  if (adminPaths.includes(path) && !Role.ADMIN) {
    return res.redirect("/welcome");
  }

  next(); // if user is found, continue
});


async function createUser() {
  const user = await prisma.users.create({
    data: {
      firstname: "test",
      lastname: "testing",
      mail: "test@test.com",
      password: crypto.createHash("123123").update("Passord01").digest("hex"),
      role: Role.STUDENT,
    },
  });

  console.log(user.firstname + "" + "has been created");

  return user;
}

// function to create an admin
async function createAdmin() {
  const admin = await prisma.users.create({
    data: {
      firstname: "admin",
      lastname: "admin",
      mail: "admin@test.com",
      password: crypto.createHash("123123").update("Passord01").digest("hex"),
      role: Role.ADMIN,
    },
  });

  console.log(`${admin.firstname} has been created`);

  return admin;
}

// function to create a student
app.post("/login", async (req, res) => {
  const { mail, password } = req.body;

  const userData = await prisma.users.findFirst({
    where: {
      mail: mail,
      password: crypto.createHash("123123").update(password).digest("hex"),
    },
  });

  if (userData) {
    switch (userData.role === Role.ADMIN) {
      case true:
        res.cookie("token", userData.token);
        res.redirect("/admin");
        break;
      case false:
        res.cookie("token", userData.token);
        res.redirect("/welcome");
        break;
    }
  } else {
    res.redirect("/");
  }
});

const apiRoutes = {
  login: (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
  },
  register: (req, res) => {
    res.sendFile(__dirname + "/public/register.html");
  },
};


app.post("/api/registerUser", apiRoutes.register);


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
