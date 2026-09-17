document.addEventListener("DOMContentLoaded", () => {
    const storedQuiz = localStorage.getItem("newQuiz");
    if (!storedQuiz) {
        window.location.href = "../pages/createQuiz.html";
        return;
    }

    let quizData;
    try {
        quizData = JSON.parse(storedQuiz);
    } catch {
        localStorage.removeItem("newQuiz");
        window.location.href = "../pages/createQuiz.html";
        return;
    }

    if (!quizData || !quizData.quiz_id || !quizData.name) {
        localStorage.removeItem("newQuiz");
        window.location.href = "../pages/createQuiz.html";
        return;
    }

    const quizNameTitle = document.getElementById("quizNameTitle");
    const questionForm = document.getElementById("addQuestionForm");
    const questionText = document.getElementById("questionText");
    const options = document.querySelectorAll(".option-input");
    const correctOptionRadios = document.querySelectorAll('input[name="correctOption"]');
    const questionsList = document.getElementById("questionsList");
    const questionCount = document.getElementById("questionCount");
    const finishBtn = document.getElementById("finishBtn");

    let addedQuestions = 0;
    quizNameTitle.textContent = quizData.name;

    questionForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const optionValues = Array.from(options).map(o => o.value.trim());
        const checkedRadio = document.querySelector('input[name="correctOption"]:checked');

        if (!questionText.value.trim() || optionValues.some(v => !v) || !checkedRadio) {
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const res = await fetch("/api/question/addQuestion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    quiz_id: quizData.quiz_id,
                    question_text: questionText.value.trim(),
                    options: optionValues,
                    correct_option_index: Number(checkedRadio.value)
                })
            });

            const result = await res.json();
            if (!res.ok) return;

            const li = document.createElement("li");
            li.textContent = `${addedQuestions + 1}. ${questionText.value.trim()}`;
            questionsList.appendChild(li);

            addedQuestions++;
            questionCount.textContent = addedQuestions;
            finishBtn.disabled = false;

            questionForm.reset();
            correctOptionRadios[0].checked = true;

        } catch { }
    });

    const modal = document.getElementById("finishModal");
    const closeBtn = document.querySelector(".close-button");
    const finalQuizId = document.getElementById("finalQuizId");
    const copyIdBtn = document.getElementById("copyIdBtn");

    finishBtn.addEventListener("click", () => {
        finalQuizId.textContent = quizData.quiz_id;
        modal.style.display = "flex";
    });

    closeBtn.onclick = () => modal.style.display = "none";

    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = "none";
    };

    copyIdBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(quizData.quiz_id).then(() => {
            copyIdBtn.textContent = "Copied!";
            setTimeout(() => copyIdBtn.textContent = "Copy ID", 2000);
        });
    });
});
