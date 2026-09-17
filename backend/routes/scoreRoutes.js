const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middlewares/authMiddleware");
const { submitQuizScore, fetchLeaderboard } = require("../controllers/scoreController");

router.post("/submit", authenticateJWT, submitQuizScore);
router.get("/leaderboard/:quizId", fetchLeaderboard);

module.exports = router;