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
  const { type_id, note, location, photo_url } = req.body || {};

  if (!type_id) {
    return res.status(400).json({ error: "type_id is required" });
  }

  const { data, error } = await supabase
    .from("entries")
    .insert([{ type_id, note: note || "", location, photo_url }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);

  if (error) {
  console.error("Supabase error:", error);
  return res.status(500).json({ error: error.message });
}
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Bin It backend running on :${PORT}`)); 

