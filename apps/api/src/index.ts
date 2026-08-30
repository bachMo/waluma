import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Waluma API is running" });
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

export default app;