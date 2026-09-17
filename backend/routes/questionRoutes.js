const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middlewares/authMiddleware");
const {
    addNewQuestion,
    fetchQuizQuestions
} = require("../controllers/questionController");

// Add a question (protected)
router.post("/addQuestion", authenticateJWT, addNewQuestion);

// Get all questions for a quiz (public/participant)
router.get("/:quizId", fetchQuizQuestions);

module.exports = router;