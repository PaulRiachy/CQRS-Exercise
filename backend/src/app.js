import express from "express";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/tasks", taskRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found." });
});

app.use((err, req, res, next) => {
  if (err.name === "ValidationError" || err.name === "SyntaxError") {
    return res.status(400).json({ error: err.message });
  }
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res
    .status(status)
    .json({ error: status >= 500 ? "Internal server error." : err.message });
});

export default app;
