import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth2"; // Correct import of Google OAuth2 Strategy
import session from "express-session";
import env from "dotenv";

// Load environment variables ASAP
env.config();

const app = express();
let PORT = parseInt(process.env.PORT, 10) || 3000; // Preferred port
// Basic required ENV validation
const requiredEnv = [
  'SESSION_SECRET',
  'PG_USER','PG_HOST','PG_DATABASE','PG_PASSWORD','PG_PORT',
  'GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET'
];
const missing = requiredEnv.filter(k => !process.env[k]);
if (missing.length) {
  console.error('Missing required environment variables:', missing.join(', '));
  console.error('Create/update your .env file before starting the server.');
  process.exit(1);
}
// View engine
app.set("view engine", "ejs");
app.set("views", "views");
const saltRounds = 10;

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
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

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  const { error } = req.query;
  res.render("login.ejs", { error });
});

app.get("/register", (req, res) => {
  const { error } = req.query;
  res.render("register.ejs", { error });
});

app.get("/logout", (req, res, next) => {
  // include next so any passport errors propagate correctly
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/secrets", (req, res) => {
  console.log(req.user);
  if (req.isAuthenticated()) {
    res.render("secrets.ejs");
  } else {
    res.redirect("/login");
  }
});

// Google OAuth routes
app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login?error=Google%20authentication%20failed",
  }),
  (req, res) => {
    res.redirect("/secrets");
  }
);

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return res.redirect("/login?error=" + encodeURIComponent("Server error"));
    if (!user) {
      const msg = (info && info.message) || "Invalid credentials";
      return res.redirect("/login?error=" + encodeURIComponent(msg));
    }
    req.logIn(user, (err2) => {
      if (err2) return res.redirect("/login?error=" + encodeURIComponent("Login failed"));
      return res.redirect("/secrets");
    });
  })(req, res, next);
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      return res.redirect("/login?error=" + encodeURIComponent("Account already exists. Please login."));
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
          return res.redirect("/register?error=" + encodeURIComponent("Password hashing failed"));
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          req.login(user, (err2) => {
            if (err2) {
              return res.redirect("/login?error=" + encodeURIComponent("Auto login failed. Please login manually."));
            }
            return res.redirect("/secrets");
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
    return res.redirect("/register?error=" + encodeURIComponent("Registration failed"));
  }
});

passport.use(
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
            //Error with password check
            console.error("Error comparing passwords:", err);
            return cb(null, false, { message: "Password check failed" });
          } else {
            if (valid) {
              //Passed password check
              return cb(null, user, { message: "Login successful" });
            } else {
              //Did not pass password check
              return cb(null, false, { message: "Incorrect password" });
            }
          }
        });
      } else {
        return cb(null, false, { message: "User not found" });
      }
    } catch (err) {
      console.log(err);
      return cb(err);
    }
  })
);

// Helper to create or fetch a Google user with hashed placeholder password
async function findOrCreateGoogleUser({ email, googleId }) {
  // try by google_id first if column exists
  try {
    // Attempt select by google_id column (if it exists). If the column doesn't exist this will error and fall back.
    let userByGoogleId;
    try {
      userByGoogleId = await db.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
    } catch (e) {
      // likely column missing, ignore
    }
    if (userByGoogleId && userByGoogleId.rows.length > 0) {
      return userByGoogleId.rows[0];
    }

    // Look by email
    const byEmail = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (byEmail.rows.length > 0) {
      const existing = byEmail.rows[0];
      // If google_id column exists and not set, update it
      if (!existing.google_id) {
        try {
          await db.query("UPDATE users SET google_id = $1 WHERE email = $2", [googleId, email]);
        } catch (e) {
          // ignore if column absent
        }
      }
      return existing;
    }
    // Need to create user. Generate a random hashed password placeholder so password column remains secure.
    const randomSecret = googleId + Date.now().toString();
    const hashed = await bcrypt.hash(randomSecret, saltRounds);
    let insert;
    try {
      insert = await db.query(
        "INSERT INTO users (email, password, google_id) VALUES ($1, $2, $3) RETURNING *",
        [email, hashed, googleId]
      );
    } catch (e) {
      // Fallback if google_id column doesn't exist
      if (/(column|relation).*google_id/i.test(e.message)) {
        insert = await db.query(
          "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
          [email, hashed]
        );
      } else {
        throw e;
      }
    }
    return insert.rows[0];
  } catch (err) {
    throw err;
  }
}

// Google OAuth strategy: create user with hashed placeholder password and google_id linkage
let computedCallback = process.env.GOOGLE_CALLBACK_URL || `http://localhost:${PORT}/auth/google/callback`;
function registerGoogleStrategy(){
  if (!process.env.GOOGLE_CALLBACK_URL) {
    console.log(`Using Google callback URL: ${computedCallback}`);
    console.log('Ensure this exact URL is in Google Cloud Console Authorized redirect URIs.');
  }
  passport.use('google', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: computedCallback,
  userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
  passReqToCallback: false
}, async (accessToken, refreshToken, profile, cb) => {
  try {
    // More robust email extraction
    const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || profile.email;
    if (!email) {
      return cb(new Error('No email found in Google profile'));
    }
    const user = await findOrCreateGoogleUser({
      email: email.toLowerCase(),
      googleId: profile.id
    });
    return cb(null, user);
  } catch (err) {
    console.error('Error in Google Strategy:', err);
    return cb(err);
  }
}));
}
registerGoogleStrategy();

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

// Try to start server, if port busy increment and update callback (when not explicitly set)
function attemptStart(p){
  const server = app.listen(p, ()=>{
    PORT = p;
    console.log(`Server running on port ${p}`);
    if(!process.env.GOOGLE_CALLBACK_URL){
      const newCallback = `http://localhost:${p}/auth/google/callback`;
      if(newCallback !== computedCallback){
        console.warn(`Port changed. Updating Google callback URL to ${newCallback}`);
        computedCallback = newCallback;
        registerGoogleStrategy();
      }
      console.warn('Remember to add this callback URL in Google console or set GOOGLE_CALLBACK_URL in .env for stability.');
    }
  });
  server.on('error', (err)=>{
    if(err.code === 'EADDRINUSE'){
      console.warn(`Port ${p} in use. Trying ${p+1}...`);
      attemptStart(p+1);
    } else {
      console.error('Server start error:', err);
    }
  });
}
attemptStart(PORT);
