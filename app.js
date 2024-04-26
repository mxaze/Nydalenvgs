const { PrismaClient, Role } = require("@prisma/client");
const express = require("express");
const app = express();
const prisma = new PrismaClient();
const cookieparser = require("cookie-parser");
const crypto = require("crypto");
const { create } = require("domain");

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

  if (userData) {
    console.log(userData.firstname + " " + "has been created");
    
  }
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
      },
   personalinfo: {
    create: {
      firstname: "test",
      lastname: "User",
      address: "User street",
      phone: "95003302",
    },
  },
  computer: {
    create:{
      age: "user age",
      computermodel: "User model",
    },
    }
  })
  console.log(user.username + " has been created");

  return user;
})





async function createAdmin() {
  const admin = await prisma.users.create({
    data: {
      firstname: "admin",
      lastname: "admin",
      email: "admin@test.com",
      password: sha256("Passord01"),
      role: Role.ADMIN,
    },
   personalinfo: {
    create: {
      firstname: "test",
      lastname: "User",
      address: "User street",
      phone: "95003302",
    },
  },
  computer: {
    create:{
      age: "user age",
      computermodel: "User model",
    },
    }
  })
  console.log(`${admin.firstname} has been created`);
}


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
  edit: (req, res) => {
    res.sendFile(__dirname + "/public/admin/edit.html");
  },
  editByID: (req, res) => {
    res.sendFile(__dirname + "/public/admin/id.html");
  }
};

// liste (objekt) for å kjøre funksjoner
const apiPostRoutes = {
  addClass: async (req, res) => {
    const { grade } = req.body;

    const newClass = await prisma.class.create({
      data: {
        grade: grade,
      },
    });

    res.redirect("/admin");
  },
  getUsers: async (req, res) => {
    const users = await prisma.users.findMany();

    res.json(users);
  },
  getUserByID: async (req, res) => {
    const { id } = req.params;

    const user = await prisma.users.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    res.json(user);
  },
  deleteUser: async (req, res) => {
    const { id } = req.params;

    const user = await prisma.users.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.redirect("/admin");
  },
  updateUser: async (req, res) => {
    const { id, firstname, lastname, email, role } = req.body;

    const user = await prisma.users.update({
      where: {
        id: parseInt(id),
      },
      data: {
        firstname: firstname,
        lastname: lastname,
        email: email,
        role: role,
      },
    });

    res.redirect("/admin");
  }
};


function sha256(message) {
  return crypto.createHash("sha256").update(message).digest("hex").toString();
}
 
// henter sider med get
app.get("/admin/create", pageroutes.create);
app.get("/admin/edit", pageroutes.edit);
app.get("/api/getUsers", apiPostRoutes.getUsers);
app.get("/admin/edit/:id", pageroutes.editByID);
app.get("/api/getUser/:id", apiPostRoutes.getUserByID);

app.post("/api/addClass", apiPostRoutes.addClass);
app.post("/api/deleteUser/:id", apiPostRoutes.deleteUser);
app.post("/api/updateUser", apiPostRoutes.updateUser);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});