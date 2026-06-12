import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

const app = express();
const port = 3000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  // NEVER hardcode secrets in production; use environment variables instead.
  secret: process.env.SESSION_SECRET || "CHANGE_THIS_DEV_SECRET",
  resave: false,
  saveUninitialized: false, // don't create empty sessions
  cookie: {
    httpOnly: true,        // mitigate XSS (client JS can't read cookie)
    secure: false,         // set to true when serving over HTTPS
    sameSite: "lax",       // CSRF protection without breaking most flows
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

app.use(passport.initialize());
app.use(passport.session());  

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "secrets",
  password: "ylQQFMl^mrQ8Ls3",
  port: 5432,
});
db.connect();

// Passport Local Strategy configuration
passport.use(new LocalStrategy(
  { usernameField: "username" }, // form field name for the email
  async (username, password, done) => {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [username]);
      if (result.rows.length === 0) {
        return done(null, false, { message: "User not found" });
      }
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  // store minimal info in session (user id)
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query("SELECT id, email FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) return done(null, false);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/secret", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets.ejs");
  } else {
    res.redirect("/login");
  }
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      return res.send("Email already exists. Try logging in.");
    }

    const hash = await bcrypt.hash(password, saltRounds);
    const insertResult = await db.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hash]
    );
    const newUser = insertResult.rows[0];

    // Log the new user in (creates session + sets cookie)
    req.login(newUser, (err) => {
      if (err) {
        console.error("Login after registration failed:", err);
        return res.status(500).send("Registration succeeded but login failed");
      }
      res.redirect("/secret");
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Registration failed");
  }
});

// Use Passport to authenticate and establish a session
app.post("/login", passport.authenticate("local", {
  successRedirect: "/secret",
  failureRedirect: "/login"
}));

app.post("/logout", (req, res, next) => {
  req.logout(function(err){
    if (err) { return next(err); }
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
