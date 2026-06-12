import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      // secure should be true in production with HTTPS
    },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

// Ensure the users table has a secret column (idempotent)
async function ensureSecretColumn() {
  try {
    await db.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS secret TEXT");
  } catch (e) {
    console.error("Failed ensuring secret column:", e.message);
  }
}
ensureSecretColumn();

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/secrets", async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");
  try {
    // User object stored entirely in session (see serializeUser below)
    const email = req.user.email;
    const result = await db.query("SELECT secret FROM users WHERE email = $1", [
      email,
    ]);
    const secret = result.rows[0]?.secret || "(No secret submitted yet)";
    res.render("secrets.ejs", { secret });
  } catch (e) {
    console.error(e);
    res.render("secrets.ejs", { secret: "Error loading secret." });
  }
});

// Allow authenticated users to see submit form
app.get("/submit", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("submit.ejs");
  } else {
    res.redirect("/login");
  }
});

// Handle secret submission
app.post("/submit", async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");
  const secret = req.body.secret;
  try {
    await db.query("UPDATE users SET secret = $1 WHERE email = $2", [
      secret,
      req.user.email,
    ]);
    res.redirect("/secrets");
  } catch (e) {
    console.error("Error saving secret", e);
    res.redirect("/secrets");
  }
});

//TODO: Add a get route for the submit button
//Think about how the logic should work with authentication.

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
  })
);

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
  })
);

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      return res.redirect("/login");
    }

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.redirect("/register");
      }
      try {
        const result = await db.query(
          "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
          [email, hash]
        );
        const user = result.rows[0];
        req.login(user, (err) => {
          if (err) {
            console.error("Login after register failed:", err);
            return res.redirect("/login");
          }
          res.redirect("/secrets");
        });
      } catch (dbErr) {
        console.error(dbErr);
        res.redirect("/register");
      }
    });
  } catch (err) {
    console.log(err);
    res.redirect("/register");
  }
});

//TODO: Create the post route for submit.
//Handle the submitted data and add it to the database

passport.use(
  "local",
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        console.log(profile);
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          profile.email,
        ]);
        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [profile.email, "google"]
          );
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);
passport.serializeUser((user, cb) => {
  // Keep minimal data in session
  cb(null, { email: user.email });
});

passport.deserializeUser(async (user, cb) => {
  try {
    // Re-fetch full user (including secret) if needed
    const result = await db.query("SELECT email FROM users WHERE email = $1", [
      user.email,
    ]);
    if (result.rows.length === 0) return cb(null, false);
    cb(null, result.rows[0]);
  } catch (e) {
    cb(e);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
