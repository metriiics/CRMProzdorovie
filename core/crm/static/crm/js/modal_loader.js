const modalMap = {
  "create-record-btn": "/modal/create-record/",
  "add-client-btn": "/modal/add-client/",
  "edit-client-btn": "/modal/change-client/",
  "change-record-btn": "/modal/change-record/",
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

// В modal_loader.js, внутри функции showModal:
function showModal(modalId) {
  // Закрываем все открытые модальные окна
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.style.display = "none";
  });

  loadModal(modalId).then(() => {
    const modal = document.getElementById(`${modalId}-modal`);
    if (modal) {
      modal.style.display = "flex";

      // Инициализируем обработчики
      if (window.ModalHandlers) {
        ModalHandlers.init();
      }

      // Обработчик закрытия
      const closeBtn = modal.querySelector(".close-btn");
      if (closeBtn && !closeBtn._listenerAdded) {
        closeBtn.addEventListener(
          "click",
          () => (modal.style.display = "none")
        );
        closeBtn._listenerAdded = true;
      }
    }
  });
}

window.ModalLoader = { showModal, loadModal };
