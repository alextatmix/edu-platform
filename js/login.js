document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const emailError = document.getElementById('login-email-error');
    const passwordError = document.getElementById('login-password-error');

    // Функция показа ошибки
    function showError(element, message) {
        if (!element) return;
        element.textContent = message;
        element.style.display = 'block';
        element.style.color = '#e74c3c';
        element.style.fontSize = '14px';
        element.style.marginTop = '5px';
    }

    // Функция скрытия ошибки
    function hideError(element) {
        if (!element) return;
        element.style.display = 'none';
    }

    // Обработчик отправки формы
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        let hasErrors = false;

        // Проверяем email
        const email = emailInput.value;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showError(emailError, 'Введите корректный email');
            hasErrors = true;
        } else {
            hideError(emailError);
        }

        // Проверяем пароль
        const password = passwordInput.value;
        if (password.length < 8) {
            showError(passwordError, 'Пароль должен содержать минимум 8 символов');
            hasErrors = true;
        } else {
            hideError(passwordError);
        }

        if (hasErrors) {
            alert('Пожалуйста, исправьте ошибки!');
            return;
        }

        // Отправляем данные на сервер
        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Вход...';
        submitBtn.disabled = true;

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email.trim(),
                password: password
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'Ошибка входа');
                });
            }
            return response.json();
        })
        .then(result => {
    // ✅ Сохраняем данные пользователя в localStorage
    localStorage.setItem('currentUser', JSON.stringify(result.user));
    
    // 🎉 Показываем сообщение
    alert('✅ ' + result.message);
    
    // 🔄 Перенаправляем в зависимости от роли
    if (result.user.role === 'teacher') {
        // Преподаватель → в кабинет
        window.location.href = '/teacher-dashboard.html';
    } else {
        // Студент → на главную
        window.location.href = '/index.html';
    }
})
        .catch(error => {
            alert('❌ ' + error.message);
            showError(emailError, error.message);
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });

    console.log('✅ Скрипт входа загружен');
});