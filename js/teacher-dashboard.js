/* ========================================
   КАБИНЕТ ПРЕПОДАВАТЕЛЯ - КЛИЕНТСКИЙ СКРИПТ
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // 🔥 Получаем данные учителя из localStorage (после входа)
    const teacherData = JSON.parse(localStorage.getItem('currentUser')) || {};
    
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

    createCourseForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const courseData = {
            title: document.getElementById('course-title').value,
            description: document.getElementById('course-description').value,
            price: parseFloat(document.getElementById('course-price').value) || 0,
            teacherId: teacherData.id || 1, // В реальном проекте — из сессии
            teacherName: teacherData.email || 'Преподаватель'
        };

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
                loadCourses(); // Перезагрузить список
            } else {
                alert('❌ Ошибка: ' + (result.errors ? result.errors.join(', ') : result.message));
            }
        })
        .catch(error => {
            alert('❌ Ошибка сети: ' + error.message);
        });
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

    window.editCourse = function(courseId) {
        alert('Функция редактирования будет добавлена в следующем уроке!');
        // В Уроке 9 добавим полноценное редактирование
    };

    // ========================================
    // ЗАГРУЗКА ПРИ ОТКРЫТИИ СТРАНИЦЫ
    // ========================================

    loadCourses();

    console.log('✅ Кабинет преподавателя загружен');
});