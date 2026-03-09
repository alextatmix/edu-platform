/* ========================================
   СЕРВЕР EDUPLATFORM (Node.js + Express)
   ======================================== */

// Подключаем необходимые модули
const express = require('express');        // Веб-фреймворк
const cors = require('cors');              // Разрешение CORS-запросов
const bodyParser = require('body-parser'); // Парсинг тела запроса
const path = require('path');              // Работа с путями файлов
const fs = require('fs');                  // Работа с файловой системой

// Загружаем переменные окружения из .env файла
require('dotenv').config();

/* ========================================
   НАСТРОЙКИ СЕРВЕРА
   ======================================== */

// Создаём приложение Express
const app = express();

// Порт, на котором будет работать сервер
const PORT = process.env.PORT || 3000;

/* ========================================
   MIDDLEWARE (промежуточные обработчики)
   ======================================== */

// Разрешаем CORS (запросы с других доменов)
app.use(cors());

// Разрешаем принимать JSON в запросах
app.use(bodyParser.json());

// Разрешаем принимать данные форм (URL-encoded)
app.use(bodyParser.urlencoded({ extended: true }));

// Логируем все запросы в консоль (свой middleware)
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString('ru-RU');
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next(); // Передаём управление следующему обработчику
});

/* ========================================
   РАЗДАЧА СТАТИЧЕСКИХ ФАЙЛОВ
   ======================================== */

// Папка html/ — главные страницы
app.use(express.static(path.join(__dirname, '../html')));

// Папка css/ — стили
app.use('/css', express.static(path.join(__dirname, '../css')));

// Папка js/ — скрипты
app.use('/js', express.static(path.join(__dirname, '../js')));

/* ========================================
   МАРШРУТЫ (ROUTES) — API
   ======================================== */

// 🏠 Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/index.html'));
});

// 📝 Страница регистрации
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/register.html'));
});

// 📝 Обработка регистрации (POST)
app.post('/register', (req, res) => {
    // Получаем данные из тела запроса
    const { fullName, email, password, role, agreement } = req.body;
    
    // 🔒 ВАЛИДАЦИЯ ДАННЫХ
    const errors = [];
    
    // Проверка имени
    if (!fullName || fullName.trim().length < 2) {
        errors.push('Имя должно содержать минимум 2 символа');
    }
    
    // Проверка email
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
        errors.push('Выберите корректную роль (student или teacher)');
    }
    
    // Проверка согласия
    if (!agreement) {
        errors.push('Необходимо согласие с правилами');
    }
    
    // Если есть ошибки — возвращаем их клиенту
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }
    
    // 🎉 ВСЁ ХОРОШО — сохраняем данные (пока в файл, позже в БД)
    
    // Создаём объект пользователя
    const user = {
        id: Date.now(),              // Уникальный ID (временное решение)
        fullName: fullName.trim(),
        email: email.toLowerCase(),
        password: password,          // ⚠️ В реальном проекте — хешировать!
        role: role,
        agreement: agreement,
        createdAt: new Date().toISOString()
    };
    
    // Путь к файлу для хранения пользователей
    const usersFilePath = path.join(__dirname, '../database/users.json');
    
    // Читаем существующих пользователей (или создаём пустой массив)
    let users = [];
    if (fs.existsSync(usersFilePath)) {
        const fileContent = fs.readFileSync(usersFilePath, 'utf-8');
        users = JSON.parse(fileContent);
    }
    
    // Добавляем нового пользователя
    users.push(user);
    
    // Сохраняем обратно в файл
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
    
    // 🔐 В реальном проекте здесь было бы:
    // 1. Хеширование пароля (bcrypt)
    // 2. Сохранение в базу данных (SQLite/PostgreSQL)
    // 3. Отправка приветственного email
    // 4. Создание сессии или JWT-токена
    
    // Возвращаем успех клиенту
    res.status(201).json({
        success: true,
        message: 'Регистрация успешна!',
        userId: user.id,
        // ⚠️ Никогда не возвращай пароль в ответе!
        user: {
            id: user.id,
            email: user.email,
            role: user.role
        }
    });
    
    console.log('✅ Новый пользователь зарегистрирован:', user.email);
});

// 🔐 Страница входа (GET)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/login.html'));
});

// 🔐 Обработка входа (POST)
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // Простая валидация
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Введите email и пароль'
        });
    }

    // Читаем пользователей из файла
    const usersFilePath = path.join(__dirname, '../database/users.json');
    let users = [];
    
    if (fs.existsSync(usersFilePath)) {
        const fileContent = fs.readFileSync(usersFilePath, 'utf-8');
        users = JSON.parse(fileContent);
    }

    // Ищем пользователя (сравнение с toLowerCase для надёжности)
    const user = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
    );

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Неверный email или пароль'
        });
    }

    // ✅ Успешный вход
    res.status(200).json({
        success: true,
        message: 'Вход выполнен успешно!',
        user: {
            id: user.id,
            email: user.email,
            role: user.role
        }
    });

    console.log('✅ Пользователь вошёл:', user.email);
});

// 📊 Статус сервера (проверка работы)
app.get('/api/status', (req, res) => {
    res.json({
        status: 'ok',
        message: 'EduPlatform сервер работает!',
        timestamp: new Date().toISOString(),
        uptime: process.uptime() // Время работы сервера в секундах
    });
});

/* ========================================
   ОБРАБОТКА 404 (страница не найдена)
   ======================================== */

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Страница не найдена',
        path: req.url
    });
});

/* ========================================
   ОБРАБОТКА ОШИБОК
   ======================================== */

app.use((err, req, res, next) => {
    console.error('❌ Ошибка сервера:', err.message);
    res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так'
    });
});

// 📝 Страница входа
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/login.html'));
});

// 🔐 Обработка входа (POST)
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // Простая валидация
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Введите email и пароль'
        });
    }

    // Читаем пользователей из файла
    const usersFilePath = path.join(__dirname, '../database/users.json');
    let users = [];
    
    if (fs.existsSync(usersFilePath)) {
        const fileContent = fs.readFileSync(usersFilePath, 'utf-8');
        users = JSON.parse(fileContent);
    }

    // Ищем пользователя с таким email и паролем
    const user = users.find(u => u.email === email.toLowerCase() && u.password === password);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Неверный email или пароль'
        });
    }

    // ✅ Успешный вход
    res.status(200).json({
        success: true,
        message: 'Вход выполнен успешно!',
        user: {
            id: user.id,
            email: user.email,
            role: user.role
        }
    });

    console.log('✅ Пользователь вошёл:', user.email);
});



/* ========================================
   ЗАПУСК СЕРВЕРА
   ======================================== */

app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 EduPlatform сервер запущен!');
    console.log(`📍 Порт: http://localhost:${PORT}`);
    console.log(`📍 Регистрация: http://localhost:${PORT}/register`);
    console.log(`📍 API статус: http://localhost:${PORT}/api/status`);
    console.log('========================================');
    console.log('💡 Для остановки сервера нажми Ctrl + C');
    console.log('========================================');
});