import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { checkConnection } from "./services/supabaseService.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes
app.use("/api", uploadRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/evaluation", evaluationRoutes);

// Health check route
app.get("/api/health", async (req, res) => {
  const dbConnected = await checkConnection();
  res.json({
    status: "Backend is running",
    database: dbConnected ? "Connected ✅" : "Disconnected ❌",
    ai: "Mistral Ready ✅",
    timestamp: new Date(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`MIBRI Backend running on http://localhost:${PORT}`);
  const dbConnected = await checkConnection();
  console.log(`Database: ${dbConnected ? "Connected" : "Disconnected"}`);
  console.log(`AI Model: Mistral-7B Ready`);
  console.log(`📁 Upload Directory: ${uploadDir}`);
});

export default app;