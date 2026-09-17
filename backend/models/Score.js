const db = require("../db");

const submitScore = async (userId, quizId, score) => {
    // Look up the numeric quiz primary key if quizId is alphanumeric
    const [quizRows] = await db.execute(
        "SELECT id, quiz_id FROM quizzes WHERE quiz_id = ? OR id = ?",
        [quizId, quizId]
    );

    const targetQuizId = quizRows.length > 0 ? quizRows[0].quiz_id : quizId;

    return db.execute(
        "INSERT INTO scores (user_id, quiz_id, score) VALUES (?, ?, ?)",
        [userId, targetQuizId, score]
    );
};

const getLeaderboard = async (quizId) => {
    // Query matching both alphanumeric quiz_id and numeric quiz table id
    const [rows] = await db.execute(
        `SELECT u.username, s.score 
         FROM scores s
         JOIN users u ON s.user_id = u.id
         LEFT JOIN quizzes q ON (s.quiz_id = q.quiz_id OR s.quiz_id = CAST(q.id AS CHAR))
         WHERE s.quiz_id = ? OR q.quiz_id = ?
         ORDER BY s.score DESC
         LIMIT 10`,
        [quizId, quizId]
    );
    return rows;
};

module.exports = { submitScore, getLeaderboard };