const crypto = require("crypto");
const bcrypt = require("bcrypt");
const db = require("../db");
const { getQuizById, isUserJoined, addParticipant } = require("../models/Participant");

// Generate unique quiz ID (QZ + 6 hex chars)
const generateQuizId = () => "QZ" + crypto.randomBytes(3).toString("hex").toUpperCase();

// GET all quizzes (ordered newest first)
const getAllQuizzes = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT quiz_id, name, description, is_private, created_at 
             FROM quizzes 
             ORDER BY created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error("Fetch all quizzes error:", err);
        res.status(500).json({ message: "Failed to fetch quizzes", error: err.message });
    }
};

// Search quizzes by name or quiz_id
const searchQuizzes = async (req, res) => {
    const { query } = req.query;
    try {
        if (!query) {
            const [rows] = await db.query(
                `SELECT quiz_id, name, description, is_private 
                 FROM quizzes 
                 ORDER BY created_at DESC`
            );
            return res.json(rows);
        }

        const searchQuery = `%${query}%`;
        const [rows] = await db.query(
            `SELECT quiz_id, name, description, is_private
             FROM quizzes
             WHERE quiz_id LIKE ? OR name LIKE ?
             ORDER BY created_at DESC`,
            [searchQuery, searchQuery]
        );
        res.json(rows);
    } catch (err) {
        console.error("Search quiz error:", err);
        res.status(500).json({ message: "Failed to search quizzes", error: err.message });
    }
};

// Create a new quiz with hashed password if private
const createQuiz = async (req, res) => {
    try {
        const { creator_id, name, description, is_private, password } = req.body;

        if (!creator_id) return res.status(400).json({ message: "Creator ID is required" });
        if (!name) return res.status(400).json({ message: "Quiz name is required" });
        if (is_private && !password) {
            return res.status(400).json({ message: "Password is required for a private quiz" });
        }

        let quiz_id;
        let exists = true;
        while (exists) {
            quiz_id = generateQuizId();
            const [rows] = await db.query("SELECT id FROM quizzes WHERE quiz_id = ?", [quiz_id]);
            exists = rows.length > 0;
        }

        const hashedPassword = is_private ? await bcrypt.hash(password, 10) : null;

        await db.query(
            `INSERT INTO quizzes (quiz_id, creator_id, name, description, is_private, password)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [quiz_id, creator_id, name, description || null, is_private ? 1 : 0, hashedPassword]
        );

        res.status(201).json({
            message: "Quiz created successfully",
            quiz_id
        });
    } catch (err) {
        console.error("Create quiz error:", err);
        res.status(500).json({ message: "Failed to create quiz", error: err.message });
    }
};

// Join an existing quiz
const joinQuiz = async (req, res) => {
    try {
        const { quizId, password, userId } = req.body;
        if (!quizId || !userId) {
            return res.status(400).json({ success: false, message: "Quiz ID and user ID are required" });
        }

        const [rows] = await db.query(
            "SELECT quiz_id, name, is_private, password FROM quizzes WHERE quiz_id = ?",
            [quizId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        const quiz = rows[0];

        // Validate password for private quizzes with bcrypt
        if (quiz.is_private) {
            if (!password) {
                return res.status(401).json({ success: false, message: "Password is required" });
            }
            const match = await bcrypt.compare(password, quiz.password);
            if (!match) {
                return res.status(401).json({ success: false, message: "Incorrect password" });
            }
        }

        // Register participant if not already joined
        const [existing] = await db.query(
            "SELECT id FROM participants WHERE quiz_id = ? AND user_id = ?",
            [quizId, userId]
        );

        if (existing.length === 0) {
            await db.query(
                "INSERT INTO participants (quiz_id, user_id) VALUES (?, ?)",
                [quizId, userId]
            );
        }

        res.json({
            success: true,
            message: "Quiz joined successfully",
            quiz_id: quiz.quiz_id,
            name: quiz.name
        });
    } catch (err) {
        console.error("Join quiz error:", err);
        res.status(500).json({ success: false, message: "Failed to join quiz", error: err.message });
    }
};

module.exports = {
    getAllQuizzes,
    searchQuizzes,
    createQuiz,
    joinQuiz
};