/* ========================================
   ЖДЁМ ЗАГРУЗКИ СТРАНИЦЫ
   ======================================== */

// Когда весь HTML загрузился, выполняем код
document.addEventListener('DOMContentLoaded', function() {
    
    /* ========================================
       НАХОДИМ ЭЛЕМЕНТЫ НА СТРАНИЦЕ
       ======================================== */

       // Получаем форму по классу
    const form = document.querySelector('.register-form');

    // Получаем поля ввода по их id
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const fullNameInput = document.getElementById('fullName');

    // Получаем элементы для сообщений об ошибках
    const passwordError = document.getElementById('password-error');
    const emailError = document.getElementById('email-error');

    // Кнопка "показать пароль" (если есть)
    const togglePasswordBtn = document.getElementById('toggle-password');

    /* ========================================
       ФУНКЦИЯ: ПРОВЕРКА НАДЁЖНОСТИ ПАРОЛЯ
       ======================================== */

       function checkPasswordStrength(password) {
        // Переменная для подсчёта «силы» пароля
        let strength = 0;

        // Если длина >= 8 символов — +1 балл
        if (password.length >= 8) {
            strength++;
        }

        // Если есть цифры — +1 балл
        if (/\d/.test(password)) {
            strength++;
        }

        // Если есть заглавные буквы — +1 балл
        if (/[A-Z]/.test(password)) {
            strength++;
        }

        // Если есть специальные символы — +1 балл
        if (/[!@#$%^&*]/.test(password)) {
            strength++;
        }

        // Возвращаем результат (0-4 балла)
        return strength;
    }

    /* ========================================
       ФУНКЦИЯ: ПОКАЗАТЬ СООБЩЕНИЕ ОБ ОШИБКЕ
       ======================================== */

       function showError(element, message) {
        // Устанавливаем текст ошибки
        element.textContent = message;
        // Показываем элемент (меняем стиль)
        element.style.display = 'block';
        // Добавляем красный цвет
        element.style.color = '#e74c3c';
        // Добавляем отступ сверху
        element.style.marginTop = '5px';
        // Добавляем размер шрифта
        element.style.fontSize = '14px';
    }

    /* ========================================
       ФУНКЦИЯ: СКРЫТЬ СООБЩЕНИЕ ОБ ОШИБКЕ
       ======================================== */

       function hideError(element) {
        // Скрываем элемент
        element.style.display = 'none';
    }

    /* ========================================
       СОБЫТИЕ: ВВОД ПАРОЛЯ (в реальном времени)
       ======================================== */

       passwordInput.addEventListener('input', function() {
        // Получаем текущее значение пароля
        const password = passwordInput.value;
        
        // Если поле пустое — скрываем ошибку и выходим
        if (password === '') {
            hideError(passwordError);
            return;
        }

        // Проверяем надёжность пароля
        const strength = checkPasswordStrength(password);
        
        // Если пароль слабый (меньше 3 баллов)
        if (strength < 3) {
            showError(passwordError, 'Пароль слишком слабый. Добавьте цифры, заглавные буквы и спецсимволы!');
            passwordInput.style.borderColor = '#e74c3c';
        } else {
            hideError(passwordError);
            passwordInput.style.borderColor = '#27ae60'; // Зелёная рамка
        }
    });

    /* ========================================
       СОБЫТИЕ: ВВОД EMAIL (проверка формата)
       ======================================== */
    
    emailInput.addEventListener('blur', function() {
        // Получаем текущее значение email
        const email = emailInput.value;
        
        // Если поле пустое — выходим
        if (email === '') {
            return;
        }

        // Регулярное выражение для проверки email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // Если email не соответствует паттерну
        if (!emailPattern.test(email)) {
            showError(emailError, 'Введите корректный email (например, name@example.com)');
            emailInput.style.borderColor = '#e74c3c';
        } else {
            hideError(emailError);
            emailInput.style.borderColor = '#27ae60';
        }
    });

    /* ========================================
       СОБЫТИЕ: КЛИК НА «ПОКАЗАТЬ ПАРОЛЬ»
       ======================================== */

       if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            // Проверяем текущий тип поля
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            // Меняем тип поля
            passwordInput.setAttribute('type', type);
            // Меняем текст кнопки
            togglePasswordBtn.textContent = type === 'password' ? '👁️ Показать' : '🙈 Скрыть';
        });
    }

    /* ========================================
       СОБЫТИЕ: ОТПРАВКА ФОРМЫ
       ======================================== */

       form.addEventListener('submit', function(event) {
        // Отменяем стандартную отправку формы (иначе страница перезагрузится)
        event.preventDefault();

        // Переменная для отслеживания ошибок
        let hasErrors = false;

        // Проверяем имя
        if (fullNameInput.value.trim() === '') {
            showError(fullNameInput, 'Введите ваше имя');
            hasErrors = true;
        }

        // Проверяем email
        const email = emailInput.value;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showError(emailError, 'Введите корректный email');
            hasErrors = true;
        }

         // Проверяем пароль
        const password = passwordInput.value;
        if (password.length < 8) {
            showError(passwordError, 'Пароль должен содержать минимум 8 символов');
            hasErrors = true;
        }

         // Если есть ошибки — не отправляем форму
        if (hasErrors) {
            alert('Пожалуйста, исправьте ошибки в форме!');
            return;
        }

         // Если всё хорошо — показываем сообщение об успехе
        alert('Форма успешно заполнена! Данные готовы к отправке на сервер.');
        
        // В реальном проекте здесь был бы код отправки данных на сервер
        // Например: fetch('/register', { method: 'POST', body: ... })
        
        // Очищаем форму
        form.reset();
    });

    /* ========================================
       ВЫВОД В КОНСОЛЬ (ДЛЯ ОТЛАДКИ)
       ======================================== */
    
    console.log('✅ Скрипт регистрации загружен и работает!');
    console.log('📝 Форма найдена:', form);
});