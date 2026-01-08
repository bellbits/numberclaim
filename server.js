const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.post("/claim", (req, res) => {
  const file = path.join(__dirname, "data.json");

  // Read → increment → write synchronously to avoid race conditions
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  data.current += 1;
  fs.writeFileSync(file, JSON.stringify(data));

  res.json({ number: data.current });
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
