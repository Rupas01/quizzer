const db = require("../db");

const isUserJoined = async (quizId, userId) => {
    const [rows] = await db.execute(
        "SELECT * FROM participants WHERE quiz_id = ? AND user_id = ?",
        [quizId, userId]
    );
    return rows.length > 0;
};

const addParticipant = async (quizId, userId) => {
    return db.execute(
        "INSERT INTO participants (quiz_id, user_id) VALUES (?, ?)",
        [quizId, userId]
    );
};

module.exports = { isUserJoined, addParticipant };
