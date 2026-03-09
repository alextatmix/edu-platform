/* ========================================
   КАБИНЕТ СТУДЕНТА - КЛИЕНТСКИЙ СКРИПТ
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // Получаем данные студента из localStorage
    const studentData = JSON.parse(localStorage.getItem('currentUser')) || {};
    
    // Приветствие
    const welcomeElement = document.getElementById('student-welcome');
    if (studentData.email) {
        welcomeElement.textContent = `Добро пожаловать, ${studentData.email}!`;
    }

    const myCoursesContainer = document.getElementById('my-courses-container');
    const allCoursesContainer = document.getElementById('all-courses-container');

    // ========================================
    // ЗАГРУЗКА ВСЕХ КУРСОВ
    // ========================================

    function loadAllCourses() {
        fetch('/api/courses')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayAllCourses(data.courses);
                } else {
                    allCoursesContainer.innerHTML = '<p>Ошибка загрузки курсов</p>';
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                allCoursesContainer.innerHTML = '<p>Ошибка загрузки</p>';
            });
    }

    function displayAllCourses(courses) {
        // Получаем мои курсы для сравнения
        fetch(`/api/enrollments/student/${studentData.id}`)
            .then(r => r.json())
            .then(enrolledData => {
                const enrolledIds = enrolledData.success ? enrolledData.enrollments.map(e => e.courseId) : [];
                
                if (courses.length === 0) {
                    allCoursesContainer.innerHTML = '<p>Курсов пока нет</p>';
                    return;
                }
                
                allCoursesContainer.innerHTML = courses.map(course => {
                    const isEnrolled = enrolledIds.includes(course.id);
                    return `
                        <div class="course-card">
                            <h3>${escapeHtml(course.title)}</h3>
                            <p>${escapeHtml(course.description || 'Описание отсутствует')}</p>
                            <p class="price">${course.price > 0 ? course.price + ' ₽' : 'Бесплатно'}</p>
                            <div class="actions">
                                ${isEnrolled 
                                    ? '<button class="btn-submit" disabled>✅ Записан</button>'
                                    : `<button class="btn-submit" onclick="enrollCourse(${course.id})">📝 Записаться</button>`
                                }
                            </div>
                        </div>
                    `;
                }).join('');
            });
    }

    // ========================================
    // ЗАГРУЗКА МОИХ КУРСОВ
    // ========================================

    function loadMyCourses() {
        fetch(`/api/enrollments/student/${studentData.id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.enrollments.length > 0) {
                    displayMyCourses(data.enrollments);
                } else {
                    myCoursesContainer.innerHTML = '<p>Вы пока не записаны ни на один курс</p>';
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                myCoursesContainer.innerHTML = '<p>Ошибка загрузки</p>';
            });
    }

    function displayMyCourses(enrollments) {
        myCoursesContainer.innerHTML = enrollments.map(enrollment => `
            <div class="course-card">
                <h3>${escapeHtml(enrollment.courseTitle)}</h3>
                <p>Прогресс: ${enrollment.progress}%</p>
                <p>Статус: ${getStatusText(enrollment.status)}</p>
                <div class="actions">
                    <button class="btn-submit" onclick="continueCourse(${enrollment.courseId})">▶️ Продолжить</button>
                </div>
            </div>
        `).join('');
    }

    function getStatusText(status) {
        const statuses = {
            'active': '🟢 Активен',
            'completed': '✅ Завершён',
            'dropped': '⚪ Отменён'
        };
        return statuses[status] || status;
    }

    // ========================================
    // ЗАПИСЬ НА КУРС
    // ========================================

    window.enrollCourse = function(courseId) {
        if (!confirm('Вы уверены, что хотите записаться на этот курс?')) {
            return;
        }

        fetch('/api/enrollments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: studentData.id,
                courseId: courseId
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('✅ Вы записаны на курс!');
                loadMyCourses();
                loadAllCourses();
            } else {
                alert('❌ Ошибка: ' + result.message);
            }
        })
        .catch(error => {
            alert('❌ Ошибка сети: ' + error.message);
        });
    };

    // ========================================
    // ПРОДОЛЖИТЬ КУРС
    // ========================================

    window.continueCourse = function(courseId) {
        alert('Функция просмотра курса будет добавлена в Уроке 10! (Курс ID: ' + courseId + ')');
    };

    // ========================================
    // ЗАЩИТА ОТ XSS
    // ========================================

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================
    // ЗАГРУЗКА ПРИ ОТКРЫТИИ
    // ========================================

    loadMyCourses();
    loadAllCourses();

    console.log('✅ Кабинет студента загружен');
});