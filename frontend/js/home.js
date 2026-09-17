const user = JSON.parse(localStorage.getItem("user") || "null");
if (!user) {
    if (!window.location.pathname.includes("login.html")) {
        window.location.href = "pages/login.html";
    }
} else {
    const welcomeEl = document.getElementById("welcomeUser");
    if (welcomeEl) welcomeEl.textContent = `Hello, ${user.username}`;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("user");
            window.location.href = "index.html";
        });
    }
}

function createQuiz() {
    window.location.href = "pages/createQuiz.html";
}

function joinQuiz() {
    window.location.href = "pages/searchQuiz.html";
}

function viewScores() {
    window.location.href = "pages/leaderboard.html";
}

function manageAccount() {
    window.location.href = "pages/account.html";
}
