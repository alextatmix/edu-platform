/* ========================================
   ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ SQLite
   ======================================== */

const Database = require('better-sqlite3');
const path = require('path');

// Путь к файлу базы данных
const dbPath = path.join(__dirname, 'eduplatform.db');

// Создаём подключение к базе (файл создастся автоматически)
const db = new Database(dbPath);

// Включаем поддержку внешних ключей
db.pragma('foreign_keys = ON');

/* ========================================
   СОЗДАЁМ ТАБЛИЦЫ
   ======================================== */

// Таблица пользователей
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'admin')),
        agreement INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Таблица курсов (для будущего функционала)
db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        teacherId INTEGER NOT NULL,
        price REAL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacherId) REFERENCES users(id)
    )
`);

// Таблица уроков
db.exec(`
    CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        courseId INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        orderNumber INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses(id)
    )
`);

console.log('✅ База данных инициализирована:', dbPath);
console.log('📊 Таблицы созданы: users, courses, lessons');

// Экспортируем подключение для использования в других файлах
module.exports = db;