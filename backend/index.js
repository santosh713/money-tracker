const express = require("express");
const cors = require("cors");
const { uploadOrUpdateJSON, readJSON } = require("./drive");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const FILE_NAME = "money-data.json";
const FOLDER_ID = process.env.GOOGLE_FOLDER_ID;

app.use(cors());
app.use(express.json());

// Get all transactions
app.get("/api/transactions", async (req, res) => {
  try {
    const data = await readJSON(FILE_NAME, FOLDER_ID);
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to read transactions." });
  }
});

// Add new transaction
app.post("/api/transactions", async (req, res) => {
  try {
    const existing = await readJSON(FILE_NAME, FOLDER_ID);
    const updated = [...existing, req.body];
    await uploadOrUpdateJSON(FILE_NAME, updated, FOLDER_ID);
    res.json({ message: "Transaction added." });
  } catch (err) {
    res.status(500).json({ error: "Failed to save transaction." });
  }
});

// Delete by index
app.delete("/api/transactions/:index", async (req, res) => {
  try {
    const existing = await readJSON(FILE_NAME, FOLDER_ID);
    const updated = existing.filter((_, i) => i !== Number(req.params.index));
    await uploadOrUpdateJSON(FILE_NAME, updated, FOLDER_ID);
    res.json({ message: "Deleted." });
  } catch (err) {
    res.status(500).json({ error: "Delete failed." });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
