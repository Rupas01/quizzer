const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, getUserByUsername } = require("../models/User");
const { JWT_SECRET } = require("../middlewares/authMiddleware");

const signup = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
        return res.status(400).json({ message: "All fields required" });

    try {
        const hashed = await bcrypt.hash(password, 10);
        await createUser(username, email, hashed);
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Signup error:", err);  // Log the full error object
        res.status(500).json({ message: "Signup error", error: err.message });
    }
};


const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "All fields required" });

    try {
        const user = await getUserByUsername(username);
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({
            message: "Login successful",
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: "Login error" });
    }
};

module.exports = { signup, login };
