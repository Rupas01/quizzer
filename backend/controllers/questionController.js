const { addQuestion, getQuizQuestions } = require("../models/Question");

const addNewQuestion = async (req, res) => {
    const { quiz_id, question_text, options, correct_option_index } = req.body;

    if (!quiz_id || !question_text || !options)
        return res.status(400).json({ message: "Missing fields" });

    try {
        await addQuestion(quiz_id, question_text, options, correct_option_index);
        res.status(201).json({ message: "Question added" });
    } catch (err) {
        res.status(500).json({ message: "Question error" });
    }
};

const fetchQuizQuestions = async (req, res) => {
    try {
        const questions = await getQuizQuestions(req.params.quizId);
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: "Fetch questions failed" });
    }
};

module.exports = { addNewQuestion, fetchQuizQuestions };
