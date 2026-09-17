document.addEventListener('DOMContentLoaded', () => {
    // Safely parse user from localStorage
    let storedUser = localStorage.getItem("user");
    if (!storedUser || storedUser === "undefined") storedUser = null;
    const user = JSON.parse(storedUser);

    // Element references
    const mainCtaBtn = document.getElementById('mainCtaBtn');
    const heroCtaBtn = document.getElementById('heroCtaBtn');
    const bottomCtaBtn = document.getElementById('bottomCtaBtn');

    // Navigation functions
    const goHome = () => window.location.href = "/home";
    const goLogin = () => window.location.href = "/pages/login.html";
    const goCreate = () => window.location.href = "/pages/createQuiz.html";
 
    if (user) {
        // User is logged in
        if (mainCtaBtn) {
            mainCtaBtn.textContent = "Go to Dashboard";
            mainCtaBtn.onclick = goHome;
        }
        if (heroCtaBtn) heroCtaBtn.onclick = goHome;
        if (bottomCtaBtn) bottomCtaBtn.onclick = goCreate;
    } else {
        // User not logged in
        if (mainCtaBtn) mainCtaBtn.onclick = goLogin;
        if (heroCtaBtn) heroCtaBtn.onclick = goLogin;
        if (bottomCtaBtn) bottomCtaBtn.onclick = goLogin;
    }
});
