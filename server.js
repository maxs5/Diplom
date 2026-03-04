const express = require("express");
const path = require("path");
const { connectToDatabase } = require("./db/connect");

// Register mongoose models (required by assignment)
require("./models/User");
require("./models/Account");
require("./models/Category");
require("./models/Operation");
require("./models/Budget");
require("./models/RecurringOperation");

const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const operationsRoutes = require("./routes/operationsRoutes");
const systemRoutes = require("./routes/systemRoutes");
const { spaFallback } = require("./middleware/spaFallback");

const app = express();
const PORT = process.env.PORT || 3002;
const STATIC_DIR = path.join(__dirname, "build");

app.use(express.json());
app.use(express.static(STATIC_DIR));

app.use("/", systemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/operations", operationsRoutes);

// SPA fallback for React Router (GET only)
app.get(/.*/, spaFallback(STATIC_DIR));

app.listen(PORT, () => {
  console.log(`Express server started on http://localhost:${PORT}`);
});

connectToDatabase()
  .then((connection) => {
    if (connection) {
      console.log("MongoDB connected");
    } else {
      console.log("MongoDB not configured (set MONGO_URI to enable)");
    }
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });
