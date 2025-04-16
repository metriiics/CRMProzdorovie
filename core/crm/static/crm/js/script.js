// Обработчики для модальных окон
document.addEventListener('DOMContentLoaded', function() {
    
    const doctorSearchInput = document.getElementById('doctor-search');
    const doctorSuggestions = document.getElementById('doctor-suggestions');
    
    // Обработка ввода для поиска врачей
    doctorSearchInput.addEventListener('input', function() {
        let query = this.value;
        fetch(`/search-doctor/?query=${query}`)
            .then(response => response.json())
            .then(data => {
                // Ограничиваем вывод до 3 подсказок
                let suggestions = data.doctors
                    .slice(0, 5)
                    .map(doctor => 
                        `<div class="suggestion-item" onclick="selectDoctor('${doctor.fio}')">${doctor.fio}</div>`
                    )
                    .join('');
                doctorSuggestions.innerHTML = suggestions;

                // Показываем подсказки, если они есть
                if (suggestions) {
                    doctorSuggestions.classList.remove('hidden');
                } else {
                    doctorSuggestions.classList.add('hidden');
                }
            });
    });

    // Функция для выбора врача и вставки в поле ввода
    window.selectDoctor = function(fio) {
        doctorSearchInput.value = fio;
        doctorSuggestions.innerHTML = ''; // Очищаем список подсказок
        doctorSuggestions.classList.add('hidden'); // Скрываем подсказки
    }

    // Закрытие подсказок при клике вне поля ввода
    window.addEventListener('click', function(e) {
        if (!doctorSearchInput.contains(e.target) && !doctorSuggestions.contains(e.target)) {
            doctorSuggestions.classList.add('hidden'); // Скрываем подсказки, если клик был вне поля ввода и подсказок
        }
    });

    function loadStatuses() {
        const dropdown = document.getElementById('service-dropdown');
        dropdown.innerHTML = ''; // очищаем текущий список
    
        fetch('/api/status/')
            .then(response => response.json())
            .then(data => {
                data.statuses.forEach(status => {
                    const item = document.createElement('div');
                    item.textContent = status.status;
                    item.className = 'dropdown-item';
                    item.onclick = function () {
                        selectItem('selected-service', 'service-dropdown', status.status);
                        closeDropdown();  // Закрываем после выбора
                    };
                    dropdown.appendChild(item);
                });
            })
            .catch(error => console.error('Ошибка при загрузке статусов:', error));
    }
    
    function toggleDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        dropdown.classList.toggle('hidden');
    }
    
    // Прячем дропдаун, если клик вне него
    function handleDocumentClick(event) {
        const dropdown = document.getElementById('service-dropdown');
        const button = document.querySelector('.dropdown-btn');
    
        if (!dropdown.contains(event.target) && !button.contains(event.target)) {
            closeDropdown();
        }
    }
    
  
    
    

    // Обработка ввода для поиска клиента
    const clientSearchInput = document.getElementById('client-search');
    const clientSuggestions = document.getElementById('client-suggestions');

    clientSearchInput.addEventListener('input', function () {
    let query = this.value;
    fetch(`/search-client/?query=${query}`)
        .then(response => response.json())
        .then(data => {
            // Собираем ФИО из отдельных полей
            let suggestions = data.clients
                .slice(0, 5)
                .map(client => {
                    const fullName = `${client.last_name} ${client.first_name} ${client.surname}`;
                    return `<div class="suggestion-item" onclick="selectClient('${fullName}')">${fullName}</div>`;
                })
                .join('');
            
            clientSuggestions.innerHTML = suggestions;

            if (suggestions) {
                clientSuggestions.classList.remove('hidden');
            } else {
                clientSuggestions.classList.add('hidden');
            }
        });
    });

    // Функция для выбора клиента
    window.selectClient = function (fullName) {
        clientSearchInput.value = fullName;
        clientSuggestions.innerHTML = '';
        clientSuggestions.classList.add('hidden');
    };
    
    // Закрытие подсказок при клике вне поля ввода
    window.addEventListener('click', function(e) {
        if (!clientSearchInput.contains(e.target) && !clientSuggestions.contains(e.target)) {
            clientSuggestions.classList.add('hidden'); // Скрываем подсказки, если клик был вне поля ввода и подсказок
        }
    });


    
    // Кнопки открытия модальных окон
    const addClientBtn = document.getElementById('add-client-btn');
    const createRecordBtn = document.getElementById('create-record-btn');
  
    // Модальные окна
    const addClientModal = document.getElementById('add-client-modal');
    const createRecordModal = document.getElementById('create-record-modal');
  
    // Кнопки закрытия
    const closeButtons = document.querySelectorAll('.close-btn');
  
    // Открытие модального окна добавления клиента
    addClientBtn.addEventListener('click', function(e) {
      e.preventDefault();
      addClientModal.style.display = 'flex';
      initAddClientModal();
    });
  
    // Открытие модального окна создания записи
    createRecordBtn.addEventListener('click', function(e) {
      e.preventDefault();
      createRecordModal.style.display = 'flex';
      initCreateRecordModal();
    });
  
    // Закрытие модальных окон
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
      });
    });
  
    // Закрытие при клике вне модального окна
    window.addEventListener('click', function(e) {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });
  });
  
  // Инициализация модального окна добавления клиента
  function initAddClientModal() {
    const commentInput = document.getElementById('comment-input');
    const commentsContainer = document.querySelector('.comments-scroll');
    const saveBtn = document.querySelector('#add-client-modal .save-btn');
  
    commentInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && this.value.trim() !== '') {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const dateStr = `${day}.${month}`;
  
        const comment = document.createElement('div');
        comment.className = 'comment';
        comment.textContent = `${dateStr} ${this.value}`;
  
        commentsContainer.appendChild(comment);
        this.value = '';
        commentsContainer.scrollTop = commentsContainer.scrollHeight;
      }
    });
  
    saveBtn.addEventListener('click', function() {
      alert('Клиент добавлен!');
      document.getElementById('add-client-modal').style.display = 'none';
    });
  }
  
  function initCreateRecordModal() {
    loadStatuses(); // Загружаем список статусов
    generateCalendar(currentYear, currentMonth, 'calendar-days', 'calendar-month-year');
    generateCalendar(callCurrentYear, callCurrentMonth, 'call-calendar-days', 'call-calendar-month-year');

    // Добавляем обработчик закрытия дропдауна
    document.addEventListener('click', handleDocumentClick);
}
  
  // Глобальные переменные для календарей
  const monthNames = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
  let currentMonth = 4, currentYear = 2025;
  let callCurrentMonth = 4, callCurrentYear = 2025;
  
  function toggleCalendar(id) {
    document.querySelectorAll('.dropdown-content, .calendar').forEach(d => d.style.display = 'none');
    const cal = document.getElementById(id);
    cal.style.display = cal.style.display === 'block' ? 'none' : 'block';
    if (id === 'date-calendar') generateCalendar(currentYear, currentMonth, 'calendar-days', 'calendar-month-year');
    else generateCalendar(callCurrentYear, callCurrentMonth, 'call-calendar-days', 'call-calendar-month-year');
  }
  
  function selectItem(targetId, dropdownId, value) {
    document.getElementById(targetId).textContent = value;
    document.getElementById(dropdownId).style.display = 'none';
  }
  
  // Функции для работы с календарями
  function generateCalendar(year, month, daysId, titleId) {
    const firstDay = new Date(year, month, 1).getDay() || 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const container = document.getElementById(daysId);
    container.innerHTML = '';
    document.getElementById(titleId).textContent = `${monthNames[month]} ${year}`;
  
    ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].forEach(d => {
      const el = document.createElement('div');
      el.innerText = d;
      el.style.fontWeight = 'bold';
      container.appendChild(el);
    });
  
    for (let i = firstDay - 1; i > 0; i--) {
      const d = document.createElement('div');
      d.classList.add('other-month');
      d.innerText = new Date(year, month, -i + 1).getDate();
      container.appendChild(d);
    }
  
    for (let i = 1; i <= daysInMonth; i++) {
      const d = document.createElement('div');
      d.classList.add('calendar-day');
      d.innerText = i;
      d.onclick = () => {
        const formatted = `${String(i).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}`;
        if (daysId === 'calendar-days') {
          document.getElementById('selected-date').textContent = formatted;
          document.getElementById('date-calendar').style.display = 'none';
        } else {
          document.getElementById('selected-call-date').textContent = formatted;
          document.getElementById('call-calendar').style.display = 'none';
        }
      };
      container.appendChild(d);
    }
  }
  
  function prevMonth() {
    if (--currentMonth < 0) currentMonth = 11, currentYear--;
    generateCalendar(currentYear, currentMonth, 'calendar-days', 'calendar-month-year');
  }
  
  function nextMonth() {
    if (++currentMonth > 11) currentMonth = 0, currentYear++;
    generateCalendar(currentYear, currentMonth, 'calendar-days', 'calendar-month-year');
  }
  
  function prevCallMonth() {
    if (--callCurrentMonth < 0) callCurrentMonth = 11, callCurrentYear--;
    generateCalendar(callCurrentYear, callCurrentMonth, 'call-calendar-days', 'call-calendar-month-year');
  }
  
  function nextCallMonth() {
    if (++callCurrentMonth > 11) callCurrentMonth = 0, callCurrentYear++;
    generateCalendar(callCurrentYear, callCurrentMonth, 'call-calendar-days', 'call-calendar-month-year');
  }
  
  // Функция сохранения клиента
  function saveClient() {
    document.getElementById('success-message').style.display = 'block';
    setTimeout(function() {
      document.getElementById('success-message').style.display = 'none';
      document.getElementById('create-record-modal').style.display = 'none';
    }, 1000);
  }
  