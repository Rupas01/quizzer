document.addEventListener('DOMContentLoaded', () => {
    const questionTextEl = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const questionCounterEl = document.getElementById('question-counter');
    const nextBtn = document.getElementById('next-btn');

    let currentQuestionIndex = 0;
    let questions = [];
    const selectedAnswers = []; // Stores option IDs selected by user
    let currentSelectedOptionId = null;

    const quizId = localStorage.getItem('currentQuizId');

    if (!quizId) {
        questionTextEl.textContent = "Error: Quiz ID not found. Please go back and join a quiz again.";
        return;
    }

    const fetchQuiz = async () => {
        try {
            const response = await fetch(`/api/question/${quizId}`);
            if (!response.ok) throw new Error('Failed to load quiz questions.');

            questions = await response.json();

            if (questions.length > 0) {
                loadQuestion();
            } else {
                questionTextEl.textContent = "This quiz has no questions yet.";
            }
        } catch (error) {
            console.error(error);
            questionTextEl.textContent = `Error: ${error.message}`;
        }
    };

    const loadQuestion = () => {
        currentSelectedOptionId = null;
        nextBtn.disabled = true;

        const currentQuestion = questions[currentQuestionIndex];
        questionTextEl.textContent = currentQuestion.question_text;
        questionCounterEl.textContent = `${currentQuestionIndex + 1} / ${questions.length}`;
        optionsContainer.innerHTML = '';

        currentQuestion.options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('option-btn');
            button.textContent = option.text;
            button.dataset.optionId = option.id;

            button.addEventListener('click', () => {
                optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
                    btn.style.borderColor = 'var(--border-color)';
                    btn.style.backgroundColor = '#fdfdfd';
                    btn.style.color = 'var(--text-color)';
                });

                button.style.borderColor = 'var(--primary-color)';
                button.style.backgroundColor = 'var(--background-color)';
                button.style.color = 'var(--primary-color)';

                currentSelectedOptionId = option.id;
                nextBtn.disabled = false;
            });

            optionsContainer.appendChild(button);
        });
    };

    nextBtn.addEventListener('click', () => {
        if (currentSelectedOptionId !== null) {
            selectedAnswers.push(currentSelectedOptionId);
        }

        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            showResults();
        }
    });

    const showResults = async () => {
        const token = localStorage.getItem("token");
        const quizContainer = document.querySelector('.quiz-container');
        quizContainer.innerHTML = `<div class="quiz-header" style="text-align:center;"><h2>Submitting and calculating score...</h2></div>`;

        try {
            const response = await fetch("/api/score/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    quizId: quizId,
                    answers: selectedAnswers
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to submit score");

            quizContainer.innerHTML = `
                <div class="quiz-header" style="text-align:center;">
                    <h1>🎉 Quiz Complete! 🎉</h1>
                    <p style="font-size: 1.5rem; margin-top: 20px;">
                        Your final score is:
                        <strong style="color: var(--primary-color);">
                            ${data.score} out of ${questions.length}
                        </strong>
                    </p>
                    <a href="/home"
                       style="
                           display:inline-block;
                           margin-top:30px;
                           padding:15px 30px;
                           background-color:var(--primary-color);
                           color:white;
                           text-decoration:none;
                           border-radius:10px;
                       ">
                        Play Again
                    </a>
                </div>
            `;
        } catch (error) {
            console.error("Failed to submit score:", error);
            quizContainer.innerHTML = `<div class="quiz-header" style="text-align:center;"><p style="color: red;">Error: ${error.message}</p></div>`;
        }
    };

    fetchQuiz();
});