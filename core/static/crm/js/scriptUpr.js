function initializeModalWindows() {
  document.querySelectorAll(".record-row").forEach((row) => {
    row.addEventListener("click", () => {
      showModal("change-record-btn"); // Убедитесь, что здесь указан "change-record"
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

    document.getElementById("add-employee-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    showModal("add-employee-btn");
  });

  document.getElementById("edit-client-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    showModal("edit-client-btn");
  });

  document.querySelectorAll(".employee-row").forEach((row) => {
    row.addEventListener("click", () => {
      showModal("change-employee-btn"); // Убедитесь, что здесь указан "change-record"
    });
  });

  document.querySelectorAll(".record-row-show").forEach((row) => {
    row.addEventListener("click", () => {
      showModal("show-record-btn"); 
    });
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

// Добавьте вызов функции в инициализацию
document.addEventListener("DOMContentLoaded", () => {
  initializeTableRowClick(); // Инициализация кликов по строкам таблицы
});

// ==============================================
// ПАГИНАЦИЯ
// ==============================================

// замена на django


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
  const header = document.querySelector(`#${sectionId}`).previousElementSibling;
  const items = document.getElementById(sectionId);

  header.classList.toggle("collapsed");
  items.classList.toggle("collapsed");
}
function initializeFilters() {
  document.querySelectorAll(".filter-items").forEach((section) => {
    const items = section.querySelectorAll(".filter-item");
    items.forEach((item, index) => {
      // Показываем только первые 3 элемента при загрузке
      item.style.display = index < 3 ? "flex" : "none";
    });

    // Устанавливаем текст кнопки "Показать все" и начальное состояние
    const button = section.nextElementSibling;
    if (button && button.classList.contains("show-all-btn")) {
      button.textContent = "Показать все";
      button.dataset.expanded = "false"; // Устанавливаем начальное состояние
    }
  });
}
function toggleShowAll(sectionId, button) {
  const section = document.getElementById(sectionId);
  if (section) {
    const items = section.querySelectorAll(".filter-item");
    const isExpanded = button.textContent.trim() === "Скрыть все";

    items.forEach((item, index) => {
      // Показываем все элементы, если кнопка "Скрыть все"
      // Показываем только первые 3, если кнопка "Показать все"
      item.style.display = !isExpanded || index < 3 ? "flex" : "none";
    });

    // Переключаем текст кнопки
    button.textContent = isExpanded ? "Показать все" : "Скрыть все";
  }
}

function filterItems(listId, searchValue) {
  const list = document.getElementById(listId);
  const items = list.querySelectorAll('.filter-item');
  const value = searchValue.trim().toLowerCase();
  items.forEach(item => {
    if (item.textContent.toLowerCase().includes(value)) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}


// Вызов инициализации при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  initializeFilters();
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
