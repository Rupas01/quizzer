const express = require("express");
const router = express.Router();
const {
    getAllQuizzes,
    searchQuizzes,
    createQuiz,
    joinQuiz
} = require("../controllers/quizController");

router.get("/", getAllQuizzes);
router.get("/searchQuiz", searchQuizzes);
router.post("/createQuiz", createQuiz);
router.post("/joinQuiz", joinQuiz);

module.exports = router;