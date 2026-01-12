const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const COUNTER_FILE = path.join(__dirname, "counter.txt");
const LOCK_FILE = path.join(__dirname, "counter.lock");

function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}

function acquireLock() {
  while (true) {
    try {
      fs.writeFileSync(LOCK_FILE, process.pid.toString(), { flag: "wx" });
      return;
    } catch {
      sleep(5);
    }
  }
}

function releaseLock() {
  if (fs.existsSync(LOCK_FILE)) {
    fs.unlinkSync(LOCK_FILE);
  }
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/claim") {
    try {
      acquireLock();

      const current = parseInt(
        fs.readFileSync(COUNTER_FILE, "utf8").trim(),
        10
      );

      if (current >= 60000) {
        releaseLock();
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "No numbers left" }));
      }

      const next = current + 1;
      fs.writeFileSync(COUNTER_FILE, next.toString());

      releaseLock();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ number: next }));
    } catch (err) {
      releaseLock();
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Server error" }));
    }
    return;
  }

  // Default route
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Visit /claim to get a number");
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
