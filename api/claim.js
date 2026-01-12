import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const filePath = path.join(process.cwd(), "data.json");

  try {
    // Read current value
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (data.current >= 60000) {
      return res.status(400).json({ error: "No numbers left" });
    }

    // Increment and persist
    data.current += 1;
    fs.writeFileSync(filePath, JSON.stringify(data));

    res.status(200).json({ number: data.current });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

