document.addEventListener('DOMContentLoaded', () => {

    // --- General Setup & Route Protection (SAFE) ---
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user) {
        window.location.href = '../pages/login.html';
        return;
    }

    // --- Element References ---
    const updateDetailsForm = document.getElementById('updateDetailsForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const detailsMessage = document.getElementById('detailsMessage');

    const changePasswordForm = document.getElementById('changePasswordForm');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordMessage = document.getElementById('passwordMessage');

    const logoutBtn = document.getElementById('logoutBtn');

    // --- Populate existing user data ---
    if (usernameInput) usernameInput.value = user.username || '';
    if (emailInput) emailInput.value = user.email || '';

    // --- Helper function to show messages ---
    const showMessage = (element, text, isError = false) => {
        if (!element) return;
        element.textContent = text;
        element.className = `message ${isError ? 'error-message' : 'success-message'}`;
    };

    // --- Update Profile Details ---
    if (updateDetailsForm) {
        updateDetailsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showMessage(detailsMessage, '');

            const updatedUsername = usernameInput.value.trim();
            const updatedEmail = emailInput.value.trim();

            try {
                const response = await fetch('/api/user/details', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        username: updatedUsername,
                        email: updatedEmail,
                    }),
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Update failed');

                // ✅ Update localStorage safely
                const updatedUser = {
                    ...user,
                    username: result.user.username,
                    email: result.user.email
                };

                localStorage.setItem('user', JSON.stringify(updatedUser));
                showMessage(detailsMessage, result.message);

            } catch (error) {
                showMessage(detailsMessage, error.message, true);
            }
        });
    }

    // --- Change Password ---
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showMessage(passwordMessage, '');

            const currentPassword = currentPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (newPassword !== confirmPassword) {
                showMessage(passwordMessage, 'New passwords do not match.', true);
                return;
            }

            try {
                const response = await fetch('/api/user/password', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        currentPassword,
                        newPassword,
                    }),
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Password update failed');

                showMessage(passwordMessage, result.message);
                changePasswordForm.reset();

            } catch (error) {
                showMessage(passwordMessage, error.message, true);
            }
        });
    }

    // --- Logout ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.href = '../index.html';
        });
    }
});
