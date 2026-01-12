const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

const DATA_FILE = path.join(__dirname, "data.json");

app.post("/claim", (req, res) => {
  try {
    // Read current value
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

    if (data.current >= 60000) {
      return res.status(400).json({ error: "No numbers left" });
    }

    // Increment
    data.current += 1;

    // Persist immediately
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.json({ number: data.current });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

