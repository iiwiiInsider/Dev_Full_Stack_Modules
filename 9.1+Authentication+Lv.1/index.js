import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "secrets",
  password: "ylQQFMl^mrQ8Ls3",
  port: 5432,
});
db.connect().catch((err) => {
  console.error("Failed to connect to database 'secrets':", err.code, err.message);
  console.error("Make sure the database exists. You can create it with: CREATE DATABASE secrets; then create table users.");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Set EJS as the templating engine
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Assuming a table named 'users' with columns 'email' and 'password'
    const result = await db.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id",
      [username, password]
    );
    console.log("New user id:", result.rows[0].id, "email:", username);
    // After successful registration, show the secrets page
    res.render("secrets.ejs");
  } catch (err) {
    // Handle duplicate emails or other DB errors gracefully
    if (err.code === "23505") { // unique_violation
      console.log("User already exists:", username);
      return res.status(409).send("User already exists. Please log in.");
    }
    console.error("Registration error:", err);
    res.status(500).send("Registration failed");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query("SELECT password FROM users WHERE email = $1", [username]);
    if (result.rows.length === 0) {
      // User not found
      return res.status(401).send("Invalid email or password");
    }
    const storedPassword = result.rows[0].password;
    if (storedPassword !== password) {
      return res.status(401).send("Invalid email or password");
    }
    // Successful login
    res.render("secrets.ejs");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Login failed");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
