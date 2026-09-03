import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import praticienRoutes from "./routes/praticien.routes";
import missionRoutes from "./routes/mission.routes"
import articleRoutes from "./routes/article.routes"
import parametreRoutes from "./routes/parametre.routes"
import litigeRoutes from "./routes/litige.routes"
import statsRoutes from "./routes/stats.routes"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/praticiens", praticienRoutes);
app.use("/api/missions", missionRoutes)
app.use("/api/articles", articleRoutes)
app.use("/api/parametres", parametreRoutes)
app.use("/api/litiges", litigeRoutes)
app.use("/api/stats", statsRoutes)

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Waluma API is running" });
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

export default app;