import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Configure EJS so res.render("index.ejs", ...) works
app.set("view engine", "ejs");
app.set("views", "./views");
app.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://bored-api.appbrewery.com/random");
    const result = response.data;
    res.render("index.ejs", { data: result });
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", {
      error: error.message,
    });
  }
});

app.post("/", async (req, res) => {
  console.log(req.body);

  // Step 2: Play around with the drop downs and see what gets logged.
  try {
    const { type, participants } = req.body;

    const response = await axios.get("https://bored-api.appbrewery.com/filter", {
      params: {
        type,
        participants: parseInt(participants, 10),
      },
    });

    const activities = Array.isArray(response.data) ? response.data : [];
    if (activities.length === 0) {
      return res.render("index.ejs", { error: "No activities that match your criteria." });
    }

    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    res.render("index.ejs", { data: randomActivity });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.render("index.ejs", { error: "No activities that match your criteria." });
    }
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", { error: "Something went wrong. Please try again." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
