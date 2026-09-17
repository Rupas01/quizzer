document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const quizData = JSON.parse(localStorage.getItem("quizToJoin") || "null");
    const joinContainer = document.getElementById("joinContainer");

    if (!user || !quizData) {
        window.location.href = "../pages/searchQuiz.html";
        return;
    }

    
    const attemptToJoinQuiz = async (password = null) => {
        try {
            const res = await fetch("/api/quiz/joinQuiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    quizId: quizData.quiz_id || quizData.id,
                    password,
                    userId: user.id
                })
            });

            const result = await res.json();
            if (result.success) {
                localStorage.setItem("currentQuizId", quizData.quiz_id || quizData.id);
                localStorage.removeItem("quizToJoin");
                window.location.href = "../pages/quiz.html";
            } else {
                const errorEl = document.getElementById("errorMessage");
                if (errorEl) errorEl.textContent = result.message || "Failed to join quiz.";
            }
        } catch {
            const errorEl = document.getElementById("errorMessage");
            if (errorEl) errorEl.textContent = "A network error occurred. Please try again.";
        }
    };

    if (quizData.isPrivate) {
        joinContainer.innerHTML = `
            <h2>🔒 Private Quiz</h2>
            <p>This quiz is locked. Please enter the password for quiz <span class="quiz-id">${quizData.quiz_id || quizData.id}</span>.</p>
            <form id="passwordForm">
                <input type="password" id="passwordInput" class="password-input" placeholder="Enter password..." required />
                <button type="submit" class="join-button">Join Quiz</button>
                <p id="errorMessage" class="error-message"></p>
            </form>
        `;
        const passwordForm = document.getElementById("passwordForm");
        if (passwordForm) {
            passwordForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const password = document.getElementById("passwordInput").value;
                attemptToJoinQuiz(password);
            });
        }
    } else {
        joinContainer.innerHTML = `
            <h2>🌍 Public Quiz</h2>
            <p>You are about to join the public quiz <span class="quiz-id">${quizData.quiz_id || quizData.id}</span>.</p>
            <button id="confirmJoinBtn" class="join-button">Confirm & Join</button>
            <p id="errorMessage" class="error-message"></p>
        `;
        const confirmBtn = document.getElementById("confirmJoinBtn");
        if (confirmBtn) confirmBtn.addEventListener("click", () => attemptToJoinQuiz());
    }
});
