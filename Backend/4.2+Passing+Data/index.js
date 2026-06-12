import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/submit", (req, res) => {
  // Normalize inputs and handle empty/whitespace-only submissions
  const fName = (req.body["fName"] || "").trim();
  const lName = (req.body["lName"] || "").trim();

  if (fName.length === 0 && lName.length === 0) {
    // No name provided; show default heading
    return res.render("index.ejs");
  }

  const numLetters = fName.length + lName.length;
  res.render("index.ejs", { numberOfLetters: numLetters });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
