import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Database client
const db = new pg.Client({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "world",
  password: process.env.PGPASSWORD || "ylQQFMl^mrQ8Ls3", // fallback only
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
});

db.connect().then(() => {
  console.log("Connected to Postgres");
}).catch(err => {
  console.error("Failed to connect to Postgres:", err);
  process.exit(1);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Helper to fetch visited country codes
async function getVisitedCountryCodes() {
  const result = await db.query("SELECT country_code FROM visited_countries ORDER BY country_code ASC");
  return result.rows.map(r => r.country_code);
}

// Home page
app.get("/", async (req, res) => {
  try {
    const countries = await getVisitedCountryCodes();
    res.render("index.ejs", { countries, total: countries.length });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Add a country (fuzzy, case-insensitive contains match)
app.post("/add", async (req, res) => {
  const input = (req.body.country || "").trim();
  if (!input) {
    const countries = await getVisitedCountryCodes();
    return res.render("index.ejs", { countries, total: countries.length, error: "Please enter a country name." });
  }
  try {
    // Find country code (first match)
    const lookup = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%' LIMIT 1;",
      [input.toLowerCase()]
    );
    if (!lookup.rows.length) {
      const countries = await getVisitedCountryCodes();
      return res.render("index.ejs", { countries, total: countries.length, error: "Country name not found." });
    }
    const code = lookup.rows[0].country_code;
    try {
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [code]);
      res.redirect("/");
    } catch (insertErr) {
      // Likely duplicate
      console.warn(insertErr);
      const countries = await getVisitedCountryCodes();
      res.render("index.ejs", { countries, total: countries.length, error: "Country already added." });
    }
  } catch (err) {
    console.error(err);
    const countries = await getVisitedCountryCodes();
    res.render("index.ejs", { countries, total: countries.length, error: "Unexpected error." });
  }
});

// Graceful shutdown
function shutdown() {
  db.end().finally(() => process.exit(0));
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
