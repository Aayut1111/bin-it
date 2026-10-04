import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://aayut1111.github.io",
    ],
  })
);
app.use(express.json({ limit: "5mb" }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get every logged action, newest first.
app.get("/api/entries", async (req, res) => {
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Log a new action.
app.post("/api/entries", async (req, res) => {
  const { type_id, note, location, photo_url, created_at } = req.body || {};

  if (!type_id) {
    return res.status(400).json({ error: "type_id is required" });
  }

  const row = { type_id, note: note || "", location, photo_url };

  // Actions logged offline are uploaded later; keep the time they really
  // happened so streaks stay correct. Ignore anything invalid or in the future.
  const when = Date.parse(created_at);
  if (!Number.isNaN(when) && when <= Date.now() + 60 * 1000) {
    row.created_at = new Date(when).toISOString();
  }

  const { data, error } = await supabase
    .from("entries")
    .insert([row])
    .select()
    .single();

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Bin It backend running on :${PORT}`));