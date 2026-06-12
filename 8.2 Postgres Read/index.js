import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "ylQQFMl^mrQ8Ls3",
  port: 5432,
});

const app = express();
const port = 3000;

// Register the view engine (prevents "No engine was registered for extension .ejs" type errors)
app.set("view engine", "ejs");

let quiz = [];

async function loadData() {
  try {
    await db.connect();
    const result = await db.query("SELECT * FROM flags");
    quiz = result.rows;
    console.log(`Loaded ${quiz.length} flags.`);
    if (quiz.length === 0) {
      console.warn("Warning: flags table returned 0 rows. Quiz will not function until data is present.");
    }
    // Only start server after data is ready so first request has data.
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to load data / start server:", err);
    process.exit(1); // Let nodemon restart after showing stack.
  }
}

loadData();

let totalCorrect = 0;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  res.render("index.ejs", { question: currentQuestion });
});

// POST a new post
app.post("/submit", (req, res) => {
  const answer = (req.body.answer || "").trim();
  let isCorrect = false;
  if (currentQuestion && currentQuestion.name && currentQuestion.name.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    isCorrect = true;
  }
  nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

async function nextQuestion() {
  if (!quiz.length) {
    currentQuestion = { flag: "❓", name: "" }; // Safe placeholder
    return;
  }
  currentQuestion = quiz[Math.floor(Math.random() * quiz.length)];
}

