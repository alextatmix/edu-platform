/* ========================================
   МОДУЛЬ: COOKIE-БАННЕР (152-ФЗ)
   ======================================== */

// Ждём полной загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    
    /* ========================================
       КОНСТАНТЫ (настройки баннера)
       ======================================== */
    
    // Ключ для LocalStorage — под этим именем сохраняем согласие
    const CONSENT_KEY = 'eduplatform_cookie_consent';
    
    // Срок хранения согласия в днях (365 дней = 1 год)
    const CONSENT_DURATION_DAYS = 365;
    
    /* ========================================
       ФУНКЦИЯ: ПРОВЕРИТЬ, ЕСТЬ ЛИ СОГЛАСИЕ
       ======================================== */
    
    function hasConsent() {
        // Пытаемся получить значение из LocalStorage по ключу
        const consent = localStorage.getItem(CONSENT_KEY);
        
        // Если значение есть и равно 'true' — согласие есть
        if (consent === 'true') {
            return true;
        }
        
        // Иначе согласия нет
        return false;
    }
    
    /* ========================================
       ФУНКЦИЯ: СОХРАНИТЬ СОГЛАСИЕ
       ======================================== */
    
    function saveConsent(accepted) {
        // Сохраняем значение ('true' или 'false') в LocalStorage
        localStorage.setItem(CONSENT_KEY, accepted.toString());
        
        // Вычисляем дату истечения (для Cookie, если понадобится)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + CONSENT_DURATION_DAYS);
        
        // Создаём Cookie с датой истечения (для совместимости)
        document.cookie = `cookie_consent=${accepted}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
        
        // Выводим в консоль для отладки
        console.log('✅ Согласие сохранено:', accepted);
        console.log('📅 Истекает:', expiryDate);
    }
    
    /* ========================================
       ФУНКЦИЯ: СОЗДАТЬ HTML БАННЕРА
       ======================================== */
    
    function createBanner() {
        // Создаём новый div элемент
        const banner = document.createElement('div');
        
        // Добавляем класс для стилизации
        banner.className = 'cookie-banner';
        
        // Внутренний HTML баннера
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <p class="cookie-banner-text">
                    🍪 Мы используем файлы cookie и обрабатываем персональные данные 
                    для улучшения работы платформы. Продолжая использовать сайт, 
                    вы соглашаетесь с нашей 
                    <a href="/privacy-policy.html" target="_blank">Политикой конфиденциальности</a>.
                </p>
                <div class="cookie-banner-buttons">
                    <button id="cookie-accept" class="btn-accept">Принять</button>
                    <button id="cookie-decline" class="btn-decline">Отклонить</button>
                </div>
            </div>
        `;
        
        // Возвращаем созданный элемент
        return banner;
    }
    
    /* ========================================
       ФУНКЦИЯ: ПОКАЗАТЬ БАННЕР
       ======================================== */
    
    function showBanner() {
        // Создаём HTML баннера
        const banner = createBanner();
        
        // Добавляем баннер в конец body (чтобы был поверх всего)
        document.body.appendChild(banner);
        
        // Находим кнопки внутри баннера
        const acceptBtn = document.getElementById('cookie-accept');
        const declineBtn = document.getElementById('cookie-decline');
        
        /* --- Обработчик кнопки «Принять» --- */
        acceptBtn.addEventListener('click', function() {
            // Сохраняем согласие (true)
            saveConsent(true);
            // Скрываем баннер
            hideBanner(banner);
            // Выводим сообщение
            console.log('👍 Пользователь принял cookie');
        });
        
        /* --- Обработчик кнопки «Отклонить» --- */
        declineBtn.addEventListener('click', function() {
            // Сохраняем отказ (false)
            saveConsent(false);
            // Скрываем баннер
            hideBanner(banner);
            // Выводим сообщение
            console.log('👎 Пользователь отклонил cookie');
        });
        
        // Выводим в консоль для отладки
        console.log('🍪 Cookie-баннер показан');
    }
    
    /* ========================================
       ФУНКЦИЯ: СКРЫТЬ БАННЕР
       ======================================== */
    
    function hideBanner(banner) {
        // Добавляем класс для анимации исчезновения
        banner.classList.add('cookie-banner-hidden');
        
        // Через 300мс (после анимации) удаляем баннер из DOM
        setTimeout(function() {
            banner.remove();
        }, 300);
    }
    
    /* ========================================
       ГЛАВНАЯ ЛОГИКА: ПОКАЗАТЬ ИЛИ НЕТ?
       ======================================== */
    
    // Проверяем, есть ли уже согласие
    if (!hasConsent()) {
        // Если согласия нет — показываем баннер
        // Но с небольшой задержкой (500мс), чтобы не мешать сразу при загрузке
        setTimeout(showBanner, 500);
    } else {
        // Если согласие уже есть — ничего не делаем (баннер не показываем)
        console.log('✅ Согласие уже есть, баннер не показываем');
    }
    
    /* ========================================
       ПУБЛИЧНЫЕ ФУНКЦИИ (для использования в других файлах)
       ======================================== */
    
    // Делаем функции доступными извне (через window)
    window.CookieConsent = {
        // Проверить, есть ли согласие
        hasConsent: hasConsent,
        // Получить значение согласия
        getConsent: function() {
            return localStorage.getItem(CONSENT_KEY);
        },
        // Отозвать согласие (пользователь передумал)
        revokeConsent: function() {
            localStorage.removeItem(CONSENT_KEY);
            document.cookie = 'cookie_consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            console.log('🔄 Согласие отозвано');
            // Показываем баннер снова
            setTimeout(showBanner, 500);
        }
    };
});