function initializeModalWindows() {
  document.querySelectorAll(".record-row").forEach((row) => {
    row.addEventListener("click", function() {
      const recordId = this.dataset.recordId;
      window.currentRecordId = recordId;
      showModal("change-record-btn");
    });
  });
  document
    .getElementById("create-record-btn")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      showModal("create-record-btn");
    });

  document.getElementById("add-client-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    showModal("add-client-btn");
  });

  document.getElementById("edit-client-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    showModal("edit-client-btn");
  });
}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  initializeModalWindows();
});

// ==============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И КОНСТАНТЫ
// ==============================================

const monthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

let currentMonth = 4,
  currentYear = 2025;
let callCurrentMonth = 4,
  callCurrentYear = 2025;

const allRows = Array.from(document.querySelectorAll(".record-row"));
const recordsPerPage = 2;
let currentPage = 1;

// ==============================================
// ОСНОВНОЙ КОД ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ==============================================

document.addEventListener("DOMContentLoaded", function () {
  initializeSortButtons();
  initializePagination();
});

// ==============================================
// ФУНКЦИИ СОРТИРОВКИ
// ==============================================

function initializeSortButtons() {
  const sortButtons = [
    { id: "sort-date", sortField: "client__created_at" },
    { id: "sort-record", sortField: "record__date" },
    { id: "sort-next-call", sortField: "date_next_call" },
  ];

  sortButtons.forEach((button) => {
    const element = document.getElementById(button.id);
    if (element) {
      element.addEventListener("click", (event) => {
        event.preventDefault();
        // Получаем текущие параметры сортировки из URL
        const url = new URL(window.location.href);
        const currentSort = url.searchParams.get('sort');
        const currentDirection = url.searchParams.get('dir') || 'asc';
        
        // Определяем новое направление сортировки
        let newDirection = 'asc';
        if (currentSort === button.sortField && currentDirection === 'asc') {
          newDirection = 'desc';
        }
        
        // Обновляем URL и перезагружаем страницу
        url.searchParams.set('sort', button.sortField);
        url.searchParams.set('dir', newDirection);
        url.searchParams.set('page', 1); // Сбрасываем на первую страницу
        window.location.href = url.toString();
      });
    }
  });
}

// Добавьте вызов функции в инициализацию
document.addEventListener("DOMContentLoaded", () => {
  initializeSortButtons();
  initializeTableRowClick(); // Инициализация кликов по строкам таблицы
});

// ==============================================
// ПАГИНАЦИЯ
// ==============================================

// ЗАМЕНЕНА НА DJANGO PAGIN


// ==============================================
// Для выходы POST запрос для жанго
// ==============================================

document.addEventListener('DOMContentLoaded', function () {
  const logoutLink = document.getElementById('logout-link');
  const logoutForm = document.getElementById('logout-form');

  if (logoutLink && logoutForm) {
    logoutLink.addEventListener('click', function (event) {
      event.preventDefault();
      logoutForm.submit();
    });
  }
});


// ==============================================
// ФИЛЬТРЫ
// ==============================================

function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  const header = section.previousElementSibling;
  header.classList.toggle("collapsed");
  section.classList.toggle("collapsed");
}

function initializeFilters() {
  document.querySelectorAll(".filter-items").forEach((section) => {
    const items = section.querySelectorAll(".filter-item");
    items.forEach((item, index) => {
      item.style.display = index < 3 ? "flex" : "none";
    });

    const button = section.nextElementSibling;
    if (button && button.classList.contains("show-all-btn")) {
      button.textContent = "Показать все";
      button.dataset.expanded = "false";
    }
  });
}

function toggleShowAll(sectionId, button) {
  const section = document.getElementById(sectionId);
  const items = section.querySelectorAll(".filter-item");
  const isExpanded = button.dataset.expanded === "true";

  items.forEach((item, index) => {
    item.style.display = isExpanded && index >= 3 ? "none" : "flex";
  });

  button.textContent = isExpanded ? "Показать все" : "Скрыть все";
  button.dataset.expanded = isExpanded ? "false" : "true";
}

let searchQuery = '';  // Храним запрос поиска в переменной

// Функция для инициализации глобального поиска
function setupGlobalSearch() {
  const input = document.getElementById("filter-search-input");
  input.addEventListener("input", function () {
    searchQuery = this.value.trim();  // Сохраняем значение поиска
  });
}

// Функция для применения фильтров
function applyFilters() {
  const url = new URL(window.location.href);

  // Если есть поисковый запрос, добавляем его в параметры URL
  if (searchQuery) {
    url.searchParams.set("search", searchQuery);
  } else {
    url.searchParams.delete("search");
  }

  // Очищаем текущие выбранные значения докторов
  url.searchParams.delete('doctor');

  // Находим все отмеченные чекбоксы врачей
  document.querySelectorAll('#doctor-options input[type="checkbox"]:checked').forEach((checkbox) => {
    const doctorName = checkbox.parentElement.textContent.trim(); // Берем текст из label
    url.searchParams.append('doctor', doctorName);
  });

  // Добавляем фильтры по дате в URL
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  const recordStartDate = document.getElementById('record-start-date').value;
  const recordEndDate = document.getElementById('record-end-date').value;
  const callStartDate = document.getElementById('call-start-date').value;
  const callEndDate = document.getElementById('call-end-date').value;

  if (startDate && endDate) {
    url.searchParams.set("start_date", startDate);
    url.searchParams.set("end_date", endDate);
  } else {
    url.searchParams.delete("start_date");
    url.searchParams.delete("end_date");
  }

  if (recordStartDate && recordEndDate) {
    url.searchParams.set("record_start_date", recordStartDate);
    url.searchParams.set("record_end_date", recordEndDate);
  } else {
    url.searchParams.delete("record_start_date");
    url.searchParams.delete("record_end_date");
  }

  if (callStartDate && callEndDate) {
    url.searchParams.set("call_start_date", callStartDate);
    url.searchParams.set("call_end_date", callEndDate);
  } else {
    url.searchParams.delete("call_start_date");
    url.searchParams.delete("call_end_date");
  }

  // Сбросить на первую страницу
  url.searchParams.set('page', 1);

  // Перезагрузка страницы с новыми фильтрами
  window.location.href = url.toString();
}

// Функция для сброса всех фильтров
function resetFilters() {
  // Снимаем все чекбоксы
  document.querySelectorAll('.filters input[type="checkbox"]').forEach((checkbox) => {
    checkbox.checked = false;
  });

  // Очищаем текстовые и календарные инпуты
  document.querySelectorAll('.filters input[type="text"], .filters input[type="date"]').forEach((input) => {
    input.value = '';
  });

  // Очищаем поисковый запрос
  searchQuery = '';

  // Очищаем фильтры в URL
  const url = new URL(window.location.href);
  url.searchParams.delete('doctor');
  url.searchParams.delete('search');
  url.searchParams.delete('page'); // обнуляем страницу тоже
  url.searchParams.delete('start_date');
  url.searchParams.delete('end_date');
  url.searchParams.delete('record_start_date');
  url.searchParams.delete('record_end_date');
  url.searchParams.delete('call_start_date');
  url.searchParams.delete('call_end_date');

  window.location.href = url.toString();
}


// Вызов всех инициализаций при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  initializeFilters();
  setupGlobalSearch();

  const url = new URL(window.location.href);
  const selectedDoctors = url.searchParams.getAll('doctor');

  // При загрузке отмечаем чекбоксы, если врач выбран в фильтре
  if (selectedDoctors.length > 0) {
    selectedDoctors.forEach((doctorName) => {
      document.querySelectorAll('#doctor-options .filter-item').forEach((item) => {
        const label = item.textContent.trim();
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (label === doctorName && checkbox) {
          checkbox.checked = true;
        }
      });
    });
  }
});


// ==============================================
// РАБОТА С КАЛЕНДАРЯМИ
// ==============================================

function toggleDropdown(id) {
  document
    .querySelectorAll(".dropdown-content, .calendar")
    .forEach((d) => (d.style.display = "none"));

  const dropdown = document.getElementById(id);
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

function toggleCalendar(id) {
  document
    .querySelectorAll(".dropdown-content, .calendar")
    .forEach((d) => (d.style.display = "none"));

  const cal = document.getElementById(id);
  cal.style.display = cal.style.display === "block" ? "none" : "block";

  if (id === "date-calendar") {
    generateCalendar(
      currentYear,
      currentMonth,
      "calendar-days",
      "calendar-month-year"
    );
  } else {
    generateCalendar(
      callCurrentYear,
      callCurrentMonth,
      "call-calendar-days",
      "call-calendar-month-year"
    );
  }
}

function selectItem(targetId, dropdownId, value) {
  document.getElementById(targetId).textContent = value;
  document.getElementById(dropdownId).style.display = "none";
}

function generateCalendar(year, month, daysId, titleId) {
  const firstDay = new Date(year, month, 1).getDay() || 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const container = document.getElementById(daysId);

  container.innerHTML = "";
  document.getElementById(titleId).textContent = `${monthNames[month]} ${year}`;

  // Добавляем дни недели
  ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].forEach((day) => {
    const el = document.createElement("div");
    el.innerText = day;
    el.style.fontWeight = "bold";
    container.appendChild(el);
  });

  // Добавляем дни предыдущего месяца
  for (let i = firstDay - 1; i > 0; i--) {
    const d = document.createElement("div");
    d.classList.add("other-month");
    d.innerText = new Date(year, month, -i + 1).getDate();
    container.appendChild(d);
  }

  // Добавляем дни текущего месяца
  for (let i = 1; i <= daysInMonth; i++) {
    const d = document.createElement("div");
    d.classList.add("calendar-day");
    d.innerText = i;
    d.onclick = () => selectCalendarDate(i, month, year, daysId);
    container.appendChild(d);
  }
}

function selectCalendarDate(day, month, year, daysId) {
  const formatted = `${String(day).padStart(2, "0")}.${String(
    month + 1
  ).padStart(2, "0")}.${year}`;

  if (daysId === "calendar-days") {
    document.getElementById("selected-date").textContent = formatted;
    document.getElementById("date-calendar").style.display = "none";
  } else {
    document.getElementById("selected-call-date").textContent = formatted;
    document.getElementById("call-calendar").style.display = "none";
  }
}

function prevMonth() {
  if (--currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateCalendar(
    currentYear,
    currentMonth,
    "calendar-days",
    "calendar-month-year"
  );
}

function nextMonth() {
  if (++currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  generateCalendar(
    currentYear,
    currentMonth,
    "calendar-days",
    "calendar-month-year"
  );
}

function prevCallMonth() {
  if (--callCurrentMonth < 0) {
    callCurrentMonth = 11;
    callCurrentYear--;
  }
  generateCalendar(
    callCurrentYear,
    callCurrentMonth,
    "call-calendar-days",
    "call-calendar-month-year"
  );
}

function nextCallMonth() {
  if (++callCurrentMonth > 11) {
    callCurrentMonth = 0;
    callCurrentYear++;
  }
  generateCalendar(
    callCurrentYear,
    callCurrentMonth,
    "call-calendar-days",
    "call-calendar-month-year"
  );
}

// ==============================================
// ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ
// ==============================================

function saveClient() {
  document.getElementById("success-message").style.display = "block";
  setTimeout(function () {
    document.getElementById("success-message").style.display = "none";
    document.getElementById("create-record-modal").style.display = "none";
  }, 1000);
}
