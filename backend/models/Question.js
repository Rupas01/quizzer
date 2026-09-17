const db = require("../db");

// Add a question and its options
const addQuestion = async (
    quiz_id,
    question_text,
    options,
    correct_index
) => {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        // Insert question
        const [qRes] = await conn.execute(
            "INSERT INTO questions (quiz_id, question_text) VALUES (?, ?)",
            [quiz_id, question_text]
        );

        // Prepare options
        const values = options.map((opt, i) => [
            qRes.insertId,
            opt,
            i === correct_index ? 1 : 0
        ]);

        // Insert options
        await conn.query(
            "INSERT INTO options (question_id, option_text, is_correct) VALUES ?",
            [values]
        );

        await conn.commit();
        return true;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

// Get all questions for a quiz (STRIPPED of is_correct)
const getQuizQuestions = async (quizId) => {
    const [rows] = await db.execute(
        `
        SELECT
            q.id AS question_id,
            q.question_text,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', o.id,
                    'text', o.option_text
                )
            ) AS options
        FROM questions q
        JOIN options o ON q.id = o.question_id
        WHERE q.quiz_id = ?
        GROUP BY q.id
        ORDER BY q.id
        `,
        [quizId]
    );

    return rows;
};

module.exports = {
    addQuestion,
    getQuizQuestions
};