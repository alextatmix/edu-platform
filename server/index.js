/* ========================================
   СЕРВЕР EDUPLATFORM (Node.js + Express + SQLite)
   Полная версия с исправлениями и комментариями
   ======================================== */

/* ========================================
   1. ПОДКЛЮЧЕНИЕ МОДУЛЕЙ (IMPORTS)
   ======================================== */

// Express — веб-фреймворк для создания сервера
const express = require('express');

// CORS — разрешает запросы с других доменов (нужно для разработки)
const cors = require('cors');

// Body-parser — разбирает данные из тела POST-запросов (JSON и формы)
const bodyParser = require('body-parser');

// Path — помогает работать с путями к файлам (кроссплатформенно)
const path = require('path');

// Bcrypt — библиотека для хеширования паролей (безопасность!)
const bcrypt = require('bcrypt');

// Подключаем инициализацию базы данных (создаёт таблицы, экспортирует db)
const db = require('../database/init-db');

// Загружаем переменные окружения из файла .env (порт, секреты)
require('dotenv').config();


/* ========================================
   2. НАСТРОЙКИ СЕРВЕРА
   ======================================== */

// Создаём экземпляр приложения Express
const app = express();

// Порт, на котором будет работать сервер
// Берём из .env или используем 3000 по умолчанию
const PORT = process.env.PORT || 3000;


/* ========================================
   3. MIDDLEWARE (ПРОМЕЖУТОЧНЫЕ ОБРАБОТЧИКИ)
   ======================================== */

// Включаем CORS — разрешает браузеру делать запросы к нашему серверу
app.use(cors());

// Разрешаем серверу принимать JSON в теле запроса
app.use(bodyParser.json());

// Разрешаем серверу принимать данные форм (urlencoded)
app.use(bodyParser.urlencoded({ extended: true }));

// Логируем все запросы в консоль (для отладки)
app.use((req, res, next) => {
    // Формируем временную метку в русском формате
    const timestamp = new Date().toLocaleTimeString('ru-RU');
    // Выводим: [14:30:45] POST /register
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    // next() передаёт управление следующему обработчику (обязательно!)
    next();
});


/* ========================================
   4. РАЗДАЧА СТАТИЧЕСКИХ ФАЙЛОВ
   ======================================== */

// Папка html/ — главные HTML-страницы (корень сайта)
app.use(express.static(path.join(__dirname, '../html')));

// Папка css/ — файлы стилей (доступ по /css/style.css)
app.use('/css', express.static(path.join(__dirname, '../css')));

// Папка js/ — клиентские скрипты (доступ по /js/script.js)
app.use('/js', express.static(path.join(__dirname, '../js')));


/* ========================================
   5. МАРШРУТЫ — СТРАНИЦЫ (GET-запросы)
   ======================================== */

// 🏠 Главная страница
app.get('/', (req, res) => {
    // Отправляем файл index.html из папки html/
    res.sendFile(path.join(__dirname, '../html/index.html'));
});

// 📝 Страница регистрации
app.get('/register', (req, res) => {
    // Отправляем файл register.html
    res.sendFile(path.join(__dirname, '../html/register.html'));
});

// 🔐 Страница входа
app.get('/login', (req, res) => {
    // Отправляем файл login.html
    res.sendFile(path.join(__dirname, '../html/login.html'));
});


/* ========================================
   6. МАРШРУТЫ — API (POST-запросы)
   ======================================== */

// 📝 ОБРАБОТКА РЕГИСТРАЦИИ (POST /register)
app.post('/register', (req, res) => {
    
    // 🔥 КРИТИЧНО: Извлекаем данные из тела запроса
    // req.body содержит данные, которые отправил браузер
    const { fullName, email, password, role, agreement } = req.body;
    
    // 🔒 ВАЛИДАЦИЯ: Проверяем данные перед сохранением
    const errors = []; // Массив для сбора ошибок
    
    // Проверка имени
    if (!fullName || fullName.trim().length < 2) {
        errors.push('Имя должно содержать минимум 2 символа');
    }
    
    // Проверка email (простая регулярка)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
        errors.push('Введите корректный email');
    }
    
    // Проверка пароля
    if (!password || password.length < 8) {
        errors.push('Пароль должен содержать минимум 8 символов');
    }
    
    // Проверка роли
    if (!role || !['student', 'teacher'].includes(role)) {
        errors.push('Выберите корректную роль');
    }
    
    // Проверка согласия
    if (!agreement) {
        errors.push('Необходимо согласие с правилами');
    }
    
    // Если есть ошибки — возвращаем их клиенту и останавливаемся
    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }
    
    // 🎉 ВСЁ ХОРОШО — сохраняем пользователя в базу данных
    try {
        
        // 🔐 ХЕШИРОВАНИЕ ПАРОЛЯ (никогда не храни пароли в открытом виде!)
        const saltRounds = 10; // Чем больше — тем медленнее, но безопаснее
        const passwordHash = bcrypt.hashSync(password, saltRounds);
        
        // 📊 ПОДГОТАВЛИВАЕМ SQL-запрос с параметрами (?)
        // Prepared statements защищают от SQL-инъекций
        const stmt = db.prepare(`
            INSERT INTO users (fullName, email, passwordHash, role, agreement)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        // 📝 ВЫПОЛНЯЕМ запрос, подставляя данные вместо ?
        const result = stmt.run(
            fullName.trim(),           // Убираем лишние пробелы
            email.toLowerCase(),       // Email в нижнем регистре (уникальность)
            passwordHash,              // Захешированный пароль
            role,                      // Роль: student или teacher
            agreement ? 1 : 0          // Преобразуем boolean в 1/0 для SQLite
        );
        
        // Логируем успешную регистрацию
        console.log('✅ Новый пользователь в БД:', email, '| ID:', result.lastInsertRowid);
        
        // 🎉 ВОЗВРАЩАЕМ успешный ответ клиенту
        res.status(201).json({
            success: true,
            message: 'Регистрация успешна!',
            userId: result.lastInsertRowid,
            // Возвращаем только безопасные данные (без пароля!)
            user: {
                id: result.lastInsertRowid,
                email: email.toLowerCase(),
                role: role
            }
        });
        
    } catch (error) {
        // ⚠️ ОБРАБОТКА ОШИБОК БАЗЫ ДАННЫХ
        
        // Если ошибка из-за уникальности email (UNIQUE constraint)
        if (error.message && error.message.includes('UNIQUE')) {
            return res.status(400).json({
                success: false,
                errors: ['Пользователь с таким email уже существует']
            });
        }
        
        // Любая другая ошибка — логируем и возвращаем 500
        console.error('❌ Ошибка регистрации:', error.message);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при регистрации'
        });
    }
});
// ← ЗАКРЫВАЕТСЯ ФУНКЦИЯ app.post('/register', ...)
// ⚠️ НИКАКОГО КОДА НЕ ДОЛЖНО БЫТЬ ЗДЕСЬ!


// 🔐 ОБРАБОТКА ВХОДА (POST /login)
app.post('/login', (req, res) => {
    
    // 🔥 Извлекаем данные из запроса
    const { email, password } = req.body;
    
    // Простая валидация
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Введите email и пароль'
        });
    }
    
    try {
        // 📊 ИЩЕМ пользователя в базе по email
        // prepare() — подготовленный запрос (защита от инъекций)
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        // get() — возвращает одну запись или undefined
        const user = stmt.get(email.toLowerCase());
        
        // Если пользователь не найден
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }
        
        // 🔐 ПРОВЕРЯЕМ пароль: сравниваем введённый с хешем в БД
        // compareSync возвращает true, если пароль совпадает
        const passwordMatch = bcrypt.compareSync(password, user.passwordHash);
        
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }
        
        // ✅ Успешный вход — логируем
        console.log('✅ Пользователь вошёл:', user.email);
        
        // Возвращаем успешный ответ
        res.status(200).json({
            success: true,
            message: 'Вход выполнен успешно!',
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        // Обработка ошибок базы данных
        console.error('❌ Ошибка входа:', error.message);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при входе'
        });
    }
});
// ← ЗАКРЫВАЕТСЯ ФУНКЦИЯ app.post('/login', ...)


// 📊 СТАТУС СЕРВЕРА (проверка работы через /api/status)
app.get('/api/status', (req, res) => {
    res.json({
        status: 'ok',
        message: 'EduPlatform сервер работает!',
        timestamp: new Date().toISOString(),
        uptime: process.uptime() // Время работы сервера в секундах
    });
});


/* ========================================
   7. ОБРАБОТКА 404 (страница не найдена)
   ======================================== */

// Этот обработчик сработает, если ни один маршрут выше не подошёл
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Страница не найдена',
        path: req.url // Показываем, какой путь запрашивали
    });
});


/* ========================================
   8. ГЛОБАЛЬНАЯ ОБРАБОТКА ОШИБОК
   ======================================== */

// Этот middleware ловит необработанные ошибки в других маршрутах
app.use((err, req, res, next) => {
    // Логируем ошибку в консоль (для разработчика)
    console.error('❌ Ошибка сервера:', err.message);
    
    // Возвращаем клиенту безопасное сообщение
    res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        // В режиме разработки показываем детали ошибки
        message: process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так'
    });
});


/* ========================================
   9. ЗАПУСК СЕРВЕРА
   ======================================== */

// Запускаем сервер на указанном порту
app.listen(PORT, () => {
    // Красивое сообщение в консоль при успешном запуске
    console.log('========================================');
    console.log('🚀 EduPlatform сервер запущен!');
    console.log(`📍 Порт: http://localhost:${PORT}`);
    console.log(`📍 Регистрация: http://localhost:${PORT}/register`);
    console.log(`📍 API статус: http://localhost:${PORT}/api/status`);
    console.log('========================================');
    console.log('💡 Для остановки сервера нажми Ctrl + C');
    console.log('========================================');
});