document.addEventListener("DOMContentLoaded", () => {
  const loginToggle = document.getElementById("loginToggle");
  const signupToggle = document.getElementById("signupToggle");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const goHomeBtn = document.getElementById("goHomeBtn");

  // Toggle forms
  if (loginToggle && signupToggle && loginForm && signupForm) {
    loginToggle.addEventListener("click", () => {
      loginForm.classList.remove("hidden");
      signupForm.classList.add("hidden");
      loginToggle.classList.add("active");
      signupToggle.classList.remove("active");
    });

    signupToggle.addEventListener("click", () => {
      signupForm.classList.remove("hidden");
      loginForm.classList.add("hidden");
      signupToggle.classList.add("active");
      loginToggle.classList.remove("active");
    });
  }

  // Back to home
  if (goHomeBtn) {
    goHomeBtn.addEventListener("click", () => {
      window.location.href = "../index.html";
    });
  }

  // Login submission
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("login-username")?.value.trim();
      const password = document.getElementById("login-password")?.value.trim();

      if (!username || !password) {
        alert("Please fill in all fields.");
        return;
      }

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "Invalid credentials");
          return;
        }

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        window.location.href = "../home.html";

      } catch (err) {
        console.error("Login error:", err);
        alert("Server connection error");
      }
    });
  }

  // Signup submission
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("signup-username")?.value.trim();
      const email = document.getElementById("signup-email")?.value.trim();
      const password = document.getElementById("signup-password")?.value.trim();

      if (!username || !email || !password) {
        alert("Fill all fields");
        return;
      }

      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "Signup failed");
          return;
        }

        alert("Account created successfully! Please login.");
        signupForm.reset();
        loginToggle?.click();

      } catch (err) {
        console.error("Signup error:", err);
        alert("Server connection error");
      }
    });
  }
});