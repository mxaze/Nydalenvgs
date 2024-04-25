const { PrismaClient, Role } = require("@prisma/client");
const express = require("express");
const app = express();
const prisma = new PrismaClient();
const cookieparser = require("cookie-parser");
const crypto = require("crypto");

app.use(express.json()); 
app.use(cookieparser());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const userData = await prisma.users.findFirst({
    where: {
      email: email,
      password: sha256(password),
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

  console.log(userData.firstname + " " + "has been created");
});

app.post("/user/create", async (req, res) => {
  const { firstname, lastname, email, password, role } = req.body;

  const newUser = await prisma.users.create({
      data: {
          firstname: firstname,
          lastname: lastname,
          email: email,
          password: sha256(password),
          role: role
      }
  })

  res.redirect("/admin")
})

// function to create a student

function sha256(message) {
  return crypto.createHash("sha256").update(message).digest("hex").toString();
}

async function createAdmin() {
  const admin = await prisma.users.create({
    data: {
      firstname: "admin",
      lastname: "admin",
      email: "admin@test.com",
      password: sha256("Passord01"),
      role: Role.ADMIN,
    },
  });

  console.log(`${admin.firstname} has been created`);
}

// liste for å hente sider, bruk app.get slik som nedenfor for å hente sider
const pageroutes = {
  admin: (req, res) => {
    res.sendFile(__dirname + "/public/admin.html");
  },
  welcome: (req, res) => {
    res.sendFile(__dirname + "/public/welcome.html");
  },
  create: (req, res) => {
    res.sendFile(__dirname + "/public/admin/create.html");
  },
};

// liste (objekt) for å kjøre funksjoner, bruk apiPostRoutes slik som nedenfor for å kjøre funksjoner (post)
const apiPostRoutes = {
  addClass: async (req, res) => {
    const { grade } = req.body;

    const newClass = await prisma.class.create({
      data: {
        grade: grade,
      },
    });

    res.redirect("/admin");
  }
};
 
// henter sider med get
app.get("/admin/create", pageroutes.create);

app.post("/api/addClass", apiPostRoutes.addClass);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});