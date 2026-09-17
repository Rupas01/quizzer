const db = require("../db");

const createQuiz = async ({ quizId, creator_id, name, description, is_private, password }) => {
    return db.execute(
        `INSERT INTO quizzes (quiz_id, creator_id, name, description, is_private, password)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [quizId, creator_id, name, description, is_private, password]
    );
};

const getQuizById = async (quizId) => {
    const [rows] = await db.execute(
        "SELECT * FROM quizzes WHERE quiz_id = ?",
        [quizId]
    );
    return rows[0];
};

const searchQuiz = async (query) => {
    const [rows] = await db.execute(
        "SELECT quiz_id, name, description, is_private FROM quizzes WHERE quiz_id = ? OR name LIKE ?",
        [query, `%${query}%`]
    );
    return rows;
};

module.exports = { createQuiz, getQuizById, searchQuiz };
