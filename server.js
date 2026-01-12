const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;

const COUNTER_FILE = path.join(__dirname, "counter.txt");
const LOCK_FILE = path.join(__dirname, "counter.lock");

app.use(express.json());

// Simple spin-lock using filesystem
function acquireLock() {
  while (true) {
    try {
      fs.writeFileSync(LOCK_FILE, process.pid.toString(), { flag: "wx" });
      return;
    } catch {
      // Wait briefly and retry
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5);
    }
  }
}

function releaseLock() {
  fs.unlinkSync(LOCK_FILE);
}

app.post("/api/claim", (req, res) => {
  try {
    acquireLock();

    const current = parseInt(
      fs.readFileSync(COUNTER_FILE, "utf8").trim(),
      10
    );

    if (current >= 60000) {
      releaseLock();
      return res.status(400).json({ error: "No numbers left" });
    }

    const next = current + 1;

    fs.writeFileSync(COUNTER_FILE, next.toString());

    releaseLock();

    res.json({ number: next });
  } catch (err) {
    try {
      if (fs.existsSync(LOCK_FILE)) releaseLock();
    } catch {}

    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve static Next.js export
app.use(express.static(path.join(__dirname, "out")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "out/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
