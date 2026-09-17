const db = require("../db");
const { submitScore, getLeaderboard } = require("../models/Score");

const submitQuizScore = async (req, res) => {
    const userId = req.user.id;
    const { quizId, answers } = req.body;

    if (!quizId || !Array.isArray(answers)) {
        return res.status(400).json({ message: "Invalid payload. quizId and answers array are required." });
    }

    try {
        let calculatedScore = 0;

        if (answers.length > 0) {
            // Count how many submitted option IDs are marked is_correct = 1
            const [rows] = await db.query(
                "SELECT COUNT(*) as correctCount FROM options WHERE id IN (?) AND is_correct = 1",
                [answers]
            );
            calculatedScore = rows[0].correctCount || 0;
        }

        await submitScore(userId, quizId, calculatedScore);

        res.status(201).json({
            message: "Score submitted and verified successfully",
            score: calculatedScore
        });
    } catch (err) {
        console.error("Submit score error:", err);
        res.status(500).json({ message: "Submit score error", error: err.message });
    }
};

const fetchLeaderboard = async (req, res) => {
    try {
        const leaderboard = await getLeaderboard(req.params.quizId);
        res.json(leaderboard || []);
    } catch (err) {
        console.error("Fetch leaderboard SQL error:", err);
        res.status(500).json({ message: "Leaderboard fetch error", error: err.message });
    }
};

module.exports = { submitQuizScore, fetchLeaderboard };