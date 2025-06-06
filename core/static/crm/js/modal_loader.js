const modalMap = {
  "create-record-btn": "/modal/create-record/",
  "add-client-btn": "/modal/add-client/",
  "edit-client-btn": "/modal/change-client/",
  "change-record-btn": "/modal/change-record/",
  "add-employee-btn": "/modal/add-employee/",
  "change-employee-btn": "/modal/edit-employee/",
  "show-record-btn": "/modal/show-record/"
};

const loadedModals = {};

async function loadModal(modalId) {
  const modalPath = modalMap[modalId];
  if (!modalPath) return false;

  if (loadedModals[modalId]) return true;

  try {
    const response = await fetch(modalPath);
    if (!response.ok) throw new Error(`Failed to load: ${response.status}`);

    const modalHTML = await response.text();
    const container = document.createElement("div");
    container.innerHTML = modalHTML;
    const modal = container.firstElementChild;

    modal.id = `${modalId}-modal`;
    document.body.appendChild(modal);
    loadedModals[modalId] = true;

    return true;
  } catch (error) {
    console.error("Modal load error:", error);
    return false;
  }
}

function showModal(modalId) {
  // Закрываем все открытые модальные окна и очищаем их
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.style.display = "none";
    const form = modal.querySelector("form");
    if (form) form.reset();

    // Очищаем поисковые подсказки
    modal.querySelectorAll(".suggestions").forEach(s => {
      s.innerHTML = '';
      s.style.display = 'none';
    });

    // Очищаем поля поиска
    modal.querySelectorAll(".search-input").forEach(i => {
      i.value = '';
    });
  });

  // Показываем overlay
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.style.display = 'block';
  }

  loadModal(modalId).then((success) => {
    if (!success) return;

    const modal = document.getElementById(`${modalId}-modal`);
    if (!modal) return;

    modal.style.display = "flex";

    // Инициализируем обработчики для этой конкретной модалки
    if (window.ModalHandlers) {
      ModalHandlers.init();
    }

    // Триггерим кастомное событие о загрузке модалки
    const event = new CustomEvent('modal-loaded', {
      detail: { modalId: `${modalId}-modal` }
    });
    document.dispatchEvent(event);

    // Обработчик закрытия
    const closeBtn = modal.querySelector(".close-btn");
    if (closeBtn && !closeBtn._listenerAdded) {
      closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
        if (overlay) overlay.style.display = 'none';
        // Очищаем форму при закрытии
        const form = modal.querySelector("form");
        if (form) form.reset();
      });
      closeBtn._listenerAdded = true;
    }
  }).catch((error) => {
    console.error("Error showing modal:", error);
  });
}

window.ModalLoader = { showModal, loadModal };
