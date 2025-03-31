const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 5000;
const prisma = new PrismaClient();

app.use(express.json()); // ใช้ JSON body parser
app.use(cors());

app.post("/api/usercreate", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });

    const { password: _, ...userWithoutPass } = user;
    res.json({ message: "User created successfully", user: userWithoutPass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.get("/api/getusers", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.json(safeUsers);
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ error: "no Users All na", details: error.message });
  }
});

app.get("/api/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, ...safeUsers } = user;
    res.json(safeUsers);
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch user", details: error.message });
  }
});

app.put("/api/userupdate/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    const dataToUpdate = { username };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: dataToUpdate,
    });

    const { password: _, ...safeUser } = updatedUser;
    res.json({ message: "User updated successfully", user: safeUser });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Failed to update user", details: error.message });
  }
});

app.delete("/api/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Failed to delete user", details: error.message });
  }
});

// app.get("/", (req, res) => {
//   res.send("Hello Word");
// });

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:${PORT}");
});
