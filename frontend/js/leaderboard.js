document.addEventListener('DOMContentLoaded', () => {
    const quizSelectionView = document.getElementById('quizSelectionView');
    const quizLeaderboardView = document.getElementById('quizLeaderboardView');

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const quizListContainer = document.getElementById('quizListContainer');
    const loadingMessage = document.getElementById('loadingMessage');

    const leaderboardQuizName = document.getElementById('leaderboardQuizName');
    const leaderboardList = document.getElementById('leaderboardList');
    const backToSelectionBtn = document.getElementById('backToSelectionBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Handle Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('newQuiz');
            localStorage.removeItem('currentQuizId');
            localStorage.removeItem('quizToJoin');
            window.location.href = '../index.html';
        });
    }

    // Helper to get auth header if available
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const displayQuizzes = (quizzes) => {
        quizListContainer.innerHTML = '';
        const list = Array.isArray(quizzes) ? quizzes : (quizzes.quizzes || quizzes.data || []);

        if (!list || list.length === 0) {
            quizListContainer.innerHTML = '<p>No quizzes found.</p>';
            return;
        }

        list.forEach(quiz => {
            const quizItem = document.createElement('div');
            quizItem.className = 'quiz-item';
            
            const quizId = quiz.quiz_id || quiz.id || quiz._id;
            const quizTitle = quiz.name || quiz.title || 'Untitled Quiz';

            quizItem.textContent = `${quizTitle} (ID: ${quizId})`;
            quizItem.dataset.quizId = quizId;
            quizItem.dataset.quizName = quizTitle;
            quizListContainer.appendChild(quizItem);
        });
    };

    const loadAllQuizzes = async () => {
        try {
            if (loadingMessage) loadingMessage.textContent = 'Loading quizzes...';
            const res = await fetch('/api/quiz', {
                headers: { ...getAuthHeaders() }
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            displayQuizzes(data);
            if (loadingMessage) loadingMessage.textContent = '';
        } catch (err) {
            console.error('Failed to load quizzes:', err);
            if (loadingMessage) loadingMessage.textContent = 'Failed to load quizzes.';
            quizListContainer.innerHTML = '<p>Error loading quizzes from server.</p>';
        }
    };

    searchBtn.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if (!query) return loadAllQuizzes();
        try {
            const res = await fetch(`/api/quiz/searchQuiz?query=${encodeURIComponent(query)}`, {
                headers: { ...getAuthHeaders() }
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            displayQuizzes(data);
        } catch (err) {
            console.error('Error searching quizzes:', err);
            quizListContainer.innerHTML = '<p>Error searching for quizzes.</p>';
        }
    });

    const showLeaderboardForQuiz = async (quizId, quizName) => {
        quizSelectionView.style.display = 'none';
        quizLeaderboardView.style.display = 'block';

        leaderboardQuizName.textContent = quizName;
        leaderboardList.innerHTML = '<p>Loading ranks...</p>';

        try {
            const res = await fetch(`/api/score/leaderboard/${encodeURIComponent(quizId)}`, {
                headers: { ...getAuthHeaders() }
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            
            leaderboardList.innerHTML = '';
            const rankList = Array.isArray(data) ? data : (data.leaderboard || data.data || []);

            if (!rankList || rankList.length === 0) {
                leaderboardList.innerHTML = '<p>No scores submitted for this quiz yet. Be the first!</p>';
                return;
            }

            rankList.forEach((user, index) => {
                const li = document.createElement('li');
                let rank = index + 1;
                if (index === 0) rank = '🥇';
                if (index === 1) rank = '🥈';
                if (index === 2) rank = '🥉';

                const username = user.username || user.name || (user.userId && (user.userId.username || user.userId.name)) || 'Anonymous';
                const score = user.score !== undefined ? user.score : 0;

                li.innerHTML = `<span class="rank">${rank}</span>
                                <span class="username">${username}</span>
                                <span class="score">${score} pts</span>`;
                leaderboardList.appendChild(li);
            });
        } catch (err) {
            console.error('Failed to load leaderboard:', err);
            leaderboardList.innerHTML = '<p>Could not fetch leaderboard data.</p>';
        }
    };

    quizListContainer.addEventListener('click', (e) => {
        const quizItem = e.target.closest('.quiz-item');
        if (quizItem && quizItem.dataset.quizId) {
            showLeaderboardForQuiz(quizItem.dataset.quizId, quizItem.dataset.quizName);
        }
    });

    backToSelectionBtn.addEventListener('click', () => {
        quizLeaderboardView.style.display = 'none';
        quizSelectionView.style.display = 'block';
    });

    loadAllQuizzes();
});