import express from 'express';
const app = express();
const port = 3000;

app.get("/", (req, res) => {
res.send("<h1>Hello</h1>");
});

app.get("/about", (req, res) => {
res.send("<h1>about me</h1><p>My name is Kyle and I am a web developer.</p>");
});

app.get("/contact", (req, res) => {
res.send("<h1>Contact</h1><p>You can contact me at kyle@example.com.</p>");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}.`);
});
