const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const loanApplicationRoutes = require("./routes/loanApplicationRoutes");
const db = require("./models");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5000", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/loan-applications", loanApplicationRoutes);

// Test database connection
db.sequelize
  .authenticate()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
