// searchQuiz.js

// ✅ Ensure user is logged in
const user = JSON.parse(localStorage.getItem("user") || "null");
if (!user) {
    alert("Please log in first.");
    window.location.href = "../pages/login.html";
}

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsContainer = document.getElementById("resultsContainer");

// ✅ Logout handler
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("user");
    alert("Logged out successfully!");
    window.location.href = "../index.html";
});

// ✅ Search handler
searchBtn?.addEventListener("click", async () => {
    const query = searchInput.value.trim();
    if (!query) {
        alert("Please enter a quiz name or ID.");
        return;
    }

    resultsContainer.innerHTML = "<p>Searching...</p>";
    searchBtn.disabled = true;

    try {
        const response = await fetch(`/api/quiz/searchQuiz?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const quizzes = await response.json();

        resultsContainer.innerHTML = "";

        if (quizzes.length === 0) {
            resultsContainer.innerHTML = "<p>No quizzes found.</p>";
            return;
        }

        quizzes.forEach((quiz) => {
            const quizCard = document.createElement("div");
            quizCard.classList.add("quiz-card");

            quizCard.innerHTML = `
                <div class="quiz-info">
                    <h3>${quiz.name}</h3>
                    <p>ID: ${quiz.quiz_id} | Type: ${quiz.is_private ? "Private 🔒" : "Public 🌍"}</p>
                </div>
                <button class="join-btn" data-id="${quiz.quiz_id}" data-private="${quiz.is_private ? 1 : 0}">Join Quiz</button>
            `;
            resultsContainer.appendChild(quizCard);
        });

    } catch (err) {
        console.error(err);
        resultsContainer.innerHTML = "<p>Error fetching quizzes. Please try again later.</p>";
    } finally {
        searchBtn.disabled = false;
    }
});

// Event delegation for all "Join" buttons
resultsContainer?.addEventListener("click", (e) => {
    if (!e.target.classList.contains("join-btn")) return;

    const button = e.target;
    const quizId = button.dataset.id;
    const isPrivate = button.dataset.private;

    localStorage.setItem('quizToJoin', JSON.stringify({
        id: quizId,
        isPrivate: isPrivate === "1"
    }));

    window.location.href = "../pages/joinQuiz.html";
});
