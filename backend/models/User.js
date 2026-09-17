const db = require("../db");

const createUser = async (username, email, hashedPassword) => {
    return db.execute(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword]
    );
};

const getUserByUsername = async (username) => {
    const [rows] = await db.execute(
        "SELECT * FROM users WHERE username = ?",
        [username]
    );
    return rows[0]; // first user or undefined
};

module.exports = { createUser, getUserByUsername };
