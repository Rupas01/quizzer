const form = document.getElementById("createQuizForm");
const isPrivate = document.getElementById("isPrivate");
const quizPassword = document.getElementById("quizPassword");
const msg = document.getElementById("quizCreatedMsg");
const logoutBtn = document.getElementById("logoutBtn");

// Handle Logout
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("newQuiz");
        localStorage.removeItem("currentQuizId");
        localStorage.removeItem("quizToJoin");
        window.location.href = "../index.html";
    });
}

isPrivate.addEventListener("change", () => {
    quizPassword.style.display = isPrivate.checked ? "block" : "none";

    if (!isPrivate.checked) {
        quizPassword.value = "";
    }
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("quizName").value.trim();
    const description = document.getElementById("quizDesc").value.trim();
    const privateQuiz = isPrivate.checked;
    const password = quizPassword.value.trim();

    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) {
        window.location.href = "../pages/login.html";
        return;
    }

    if (!user.id) {
        console.error("User ID is missing");
        return;
    }

    if (!name) {
        console.error("Quiz name is required");
        return;
    }

    if (privateQuiz && !password) {
        console.error("Password is required for a private quiz");
        return;
    }

    try {
        const res = await fetch("/api/quiz/createQuiz", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                creator_id: user.id,
                name: name,
                description: description,
                is_private: privateQuiz,
                password: privateQuiz ? password : null
            })
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Create quiz failed:", data.message);
            return;
        }

        localStorage.setItem(
            "newQuiz",
            JSON.stringify({
                quiz_id: data.quiz_id,
                name: name
            })
        );

        window.location.href = "../pages/addQuestions.html";

    } catch (err) {
        console.error("Create quiz request failed:", err);
    }
});