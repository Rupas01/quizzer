require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const db = require("./db");

const app = express();

// 1. CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(",") 
    : ["http://localhost:5000"];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin static requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Serve static frontend assets
app.use(express.static(path.join(__dirname, "../frontend")));

// 3. Frontend Page Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../frontend/index.html")));
app.get("/home", (req, res) => res.sendFile(path.join(__dirname, "../frontend/home.html")));
app.get("/leaderboard", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/leaderboard.html")));
app.get("/createQuiz", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/createQuiz.html")));
app.get("/searchQuiz", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/searchQuiz.html")));
app.get("/account", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/account.html")));

// 4. API Routes
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const questionRoutes = require("./routes/questionRoutes");
const scoreRoutes = require("./routes/scoreRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/score", scoreRoutes);

// User Profile & Password APIs
app.put("/api/user/details", async (req, res) => {
    const { userId, username, email } = req.body;
    try {
        await db.query("UPDATE users SET username = ?, email = ? WHERE id = ?", [username, email, userId]);
        res.json({ message: "Profile updated successfully", user: { id: userId, username, email } });
    } catch (err) {
        res.status(500).json({ message: "Failed to update profile", error: err.message });
    }
});

app.put("/api/user/password", async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
    try {
        const [users] = await db.query("SELECT password FROM users WHERE id = ?", [userId]);
        if (users.length === 0) return res.status(404).json({ message: "User not found" });

        const match = await bcrypt.compare(currentPassword, users[0].password);
        if (!match) return res.status(400).json({ message: "Current password does not match" });

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, userId]);
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update password", error: err.message });
    }
});

// Health check endpoint for host orchestrators
app.get("/health", (req, res) => res.status(200).send("OK"));

// Fallback 404 for unhandled API calls
app.use("/api", (req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ message: "Internal server error" });
});

// 5. Start Server with Dynamic Port
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} on port ${PORT}`);
});

// Graceful shutdown handling
process.on("SIGTERM", () => {
    console.log("SIGTERM received, closing HTTP server...");
    server.close(() => console.log("HTTP server closed."));
});