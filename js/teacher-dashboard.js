/* ========================================
   КАБИНЕТ ПРЕПОДАВАТЕЛЯ - КЛИЕНТСКИЙ СКРИПТ
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // 🔥 Получаем данные учителя из localStorage (после входа)
    const teacherData = JSON.parse(localStorage.getItem('currentUser')) || {};

    // Новая переменная: режим работы
    let editMode = false;
    let editCourseId = null;
    
    // Приветствие
    const welcomeElement = document.getElementById('teacher-welcome');
    if (teacherData.email) {
        welcomeElement.textContent = `Добро пожаловать, ${teacherData.email}!`;
    }

    // Элементы модального окна
    const modal = document.getElementById('create-course-modal');
    const openModalBtn = document.getElementById('open-create-course');
    const closeModalBtn = document.querySelector('.close-modal');
    const createCourseForm = document.getElementById('create-course-form');
    const coursesContainer = document.getElementById('courses-container');

    // ========================================
    // ОТКРЫТЬ/ЗАКРЫТЬ МОДАЛЬНОЕ ОКНО
    // ========================================

    openModalBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
    });

    closeModalBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        // 🔥 СБРОС РЕЖИМА ПРИ ЗАКРЫТИИ
    editMode = false;
    editCourseId = null;
    document.querySelector('#create-course-modal h2').textContent = 'Создать новый курс';
    createCourseForm.querySelector('button[type="submit"]').textContent = 'Создать курс';
    createCourseForm.reset();
    });

    // Закрыть при клике вне окна
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // ========================================
    // ЗАГРУЗКА СПИСКА КУРСОВ
    // ========================================

    function loadCourses() {
        // В реальном проекте: fetch(`/api/teacher/${teacherData.id}/courses`)
        // Для демо покажем заглушку
        fetch('/api/courses')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.courses.length > 0) {
                    displayCourses(data.courses);
                } else {
                    coursesContainer.innerHTML = '<p>У вас пока нет курсов. Создайте первый!</p>';
                }
            })
            .catch(error => {
                console.error('Ошибка загрузки курсов:', error);
                coursesContainer.innerHTML = '<p>Ошибка загрузки курсов</p>';
            });
    }

    function displayCourses(courses) {
        coursesContainer.innerHTML = courses.map(course => `
            <div class="course-card">
                <h3>${escapeHtml(course.title)}</h3>
                <p>${escapeHtml(course.description || 'Описание отсутствует')}</p>
                <p class="price">${course.price > 0 ? course.price + ' ₽' : 'Бесплатно'}</p>
                <div class="actions">
                    <button class="btn-edit" onclick="editCourse(${course.id})">✏️ Редактировать</button>
                    <button class="btn-delete" onclick="deleteCourse(${course.id})">🗑️ Удалить</button>
                </div>
            </div>
        `).join('');
    }

    // Защита от XSS
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================
    // СОЗДАНИЕ КУРСА (CREATE)
    // ========================================

    // ========================================
// УНИВЕРСАЛЬНЫЙ ОБРАБОТЧИК ФОРМЫ
// ========================================

createCourseForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const courseData = {
        title: document.getElementById('course-title').value,
        description: document.getElementById('course-description').value,
        price: parseFloat(document.getElementById('course-price').value) || 0,
        teacherId: teacherData.id || 1,
        teacherName: teacherData.email || 'Преподаватель'
    };
    
    // 🔥 ПРОВЕРЯЕМ РЕЖИМ: создание или редактирование
    if (editMode && editCourseId) {
        // ✏️ РЕДАКТИРОВАНИЕ (PUT)
        fetch(`/api/courses/${editCourseId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(courseData)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('✅ Курс обновлён!');
                modal.style.display = 'none';
                createCourseForm.reset();
                loadCourses();
            } else {
                alert('❌ Ошибка: ' + (result.errors ? result.errors.join(', ') : result.message));
            }
        })
        .catch(error => {
            alert('❌ Ошибка сети: ' + error.message);
        })
        .finally(() => {
            // Сбрасываем режим редактирования
            editMode = false;
            editCourseId = null;
            document.querySelector('#create-course-modal h2').textContent = 'Создать новый курс';
            createCourseForm.querySelector('button[type="submit"]').textContent = 'Создать курс';
        });
        
    } else {
        // ➕ СОЗДАНИЕ (POST)
        fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(courseData)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('✅ Курс успешно создан!');
                modal.style.display = 'none';
                createCourseForm.reset();
                loadCourses();
            } else {
                alert('❌ Ошибка: ' + (result.errors ? result.errors.join(', ') : result.message));
            }
        })
        .catch(error => {
            alert('❌ Ошибка сети: ' + error.message);
        });
    }
});

    // ========================================
    // УДАЛЕНИЕ КУРСА (DELETE)
    // ========================================

    window.deleteCourse = function(courseId) {
        if (!confirm('Вы уверены, что хотите удалить этот курс?')) {
            return;
        }

        fetch(`/api/courses/${courseId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('✅ Курс удалён!');
                loadCourses();
            } else {
                alert('❌ Ошибка: ' + result.message);
            }
        })
        .catch(error => {
            alert('❌ Ошибка сети: ' + error.message);
        });
    };

    // ========================================
    // РЕДАКТИРОВАНИЕ КУРСА (UPDATE)
    // ========================================

    // ========================================
// РЕДАКТИРОВАНИЕ КУРСА (UPDATE)
// ========================================

// ========================================
// РЕДАКТИРОВАНИЕ КУРСА (UPDATE)
// ========================================

window.editCourse = async function(courseId) {
    try {
        // Загружаем данные курса
        const response = await fetch(`/api/courses/${courseId}`);
        const result = await response.json();
        
        if (!result.success) {
            alert('❌ Ошибка: ' + result.message);
            return;
        }
        
        const course = result.course;
        
        // 🔥 ВКЛЮЧАЕМ РЕЖИМ РЕДАКТИРОВАНИЯ
        editMode = true;
        editCourseId = courseId;
        
        // Заполняем форму данными курса
        document.getElementById('course-title').value = course.title;
        document.getElementById('course-description').value = course.description || '';
        document.getElementById('course-price').value = course.price || 0;
        
        // Меняем заголовок модального окна
        const modalTitle = document.querySelector('#create-course-modal h2');
        modalTitle.textContent = '✏️ Редактировать курс';
        
        // Меняем текст кнопки
        const submitBtn = createCourseForm.querySelector('button[type="submit"]');
        submitBtn.textContent = '💾 Сохранить изменения';
        
        // Показываем модальное окно
        modal.style.display = 'flex';
        
    } catch (error) {
        alert('❌ Ошибка загрузки курса: ' + error.message);
    }
};

    // ========================================
    // ЗАГРУЗКА ПРИ ОТКРЫТИИ СТРАНИЦЫ
    // ========================================

    loadCourses();

    console.log('✅ Кабинет преподавателя загружен');
});