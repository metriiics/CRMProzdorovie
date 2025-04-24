// Основная функция инициализации всех обработчиков модального окна
function initModalHandlers() {
  // 1. Обработчики для поиска с подсказками
  function setupSearchHandlers() {
    document.querySelectorAll(".search-container").forEach((container) => {
      const input = container.querySelector(".search-input");
      const suggestions = container.querySelector(".suggestions");

      if (!input || !suggestions) return;

      input.addEventListener("focus", () => {
        suggestions.style.display = "block";
      });

      input.addEventListener("blur", () => {
        setTimeout(() => {
          suggestions.style.display = "none";
        }, 200);
      });

      suggestions.querySelectorAll(".suggestion-item").forEach((item) => {
        item.addEventListener("click", () => {
          input.value = item.textContent;
          suggestions.style.display = "none";
        });
      });
    });
  }

  // 2. Обработчики для комментариев
  function setupCommentHandlers() {
    const commentInput = document.getElementById("comment-input");
    const commentsContainer = document.querySelector(".comments-scroll");

    if (commentInput && commentsContainer) {
      commentInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter" && this.value.trim() !== "") {
          const now = new Date();
          const dateStr = `${String(now.getDate()).padStart(2, "0")}.${String(
            now.getMonth() + 1
          ).padStart(2, "0")}`;

          const comment = document.createElement("div");
          comment.className = "comment";
          comment.textContent = `${dateStr} ${this.value}`;

          commentsContainer.appendChild(comment);
          this.value = "";
          commentsContainer.scrollTop = commentsContainer.scrollHeight;
        }
      });
    }
  }

  // 3. Обработчики кнопок сохранения/удаления
  function setupActionButtons() {
    document.addEventListener("click", (e) => {
      // Обработчик для кнопки "Сохранить"
      if (e.target.classList.contains("save-btn")) {
        e.preventDefault();
        const modal = e.target.closest(".modal");
        if (modal) {
          const successMessage = modal.querySelector(".success-message");
          if (successMessage) {
            successMessage.style.display = "block";
            successMessage.classList.add("show");
            setTimeout(() => {
              successMessage.classList.remove("show");
            }, 2000);
          }
        }
      }

      // Для кнопки "Отмена" или "Удалить клиента"
      if (e.target.classList.contains("delete-link")) {
        e.preventDefault();
        const modal = e.target.closest(".modal");
        if (modal) {
          const confirmationModal = modal.querySelector(".confirmation-modal");
          if (confirmationModal) {
            confirmationModal.style.display = "flex";
          }
        }
      }

      // Для кнопки "Нет" в окне подтверждения
      if (e.target.classList.contains("cancel-btn")) {
        const confirmationModal = e.target.closest(".confirmation-modal");
        if (confirmationModal) {
          confirmationModal.style.display = "none";
        }
      }

      // Для кнопки "Да" в окне подтверждения
      if (e.target.classList.contains("confirm-btn")) {
        const confirmationModal = e.target.closest(".confirmation-modal");
        if (confirmationModal) {
          confirmationModal.style.display = "none";
          const mainModal = confirmationModal.closest(".modal");
          if (mainModal) {
            mainModal.style.display = "none";
          }
        }
      }
    });
  }

  // 4. Обработчик закрытия модального окна
  function setupCloseHandler() {
    document.querySelector(".close-btn")?.addEventListener("click", () => {
      document.querySelector(".modal").style.display = "none";
    });
  }

  // Обработчик для кнопки "Отмена"/"Удалить клиента"
  function setupDeleteHandlers() {
    document.addEventListener("click", function (e) {
      // Для кнопки "Отмена"/"Удалить клиента"
      if (e.target.classList.contains("delete-link")) {
        e.preventDefault();
        const modal = e.target.closest(".modal");
        if (modal) {
          const confirmationModal = modal.nextElementSibling; // Предполагаем, что confirmation-modal идёт сразу после modal
          if (
            confirmationModal &&
            confirmationModal.classList.contains("confirmation-modal")
          ) {
            confirmationModal.style.display = "flex";
          }
        }
      }

      // Для кнопки "Нет" в окне подтверждения
      if (e.target.classList.contains("cancel-btn")) {
        const confirmationModal = e.target.closest(".confirmation-modal");
        if (confirmationModal) {
          confirmationModal.style.display = "none";
        }
      }

      // Для кнопки "Да" в окне подтверждения
      if (e.target.classList.contains("confirm-btn")) {
        const confirmationModal = e.target.closest(".confirmation-modal");
        if (confirmationModal) {
          confirmationModal.style.display = "none";
          const mainModal = confirmationModal.previousElementSibling;
          if (mainModal && mainModal.classList.contains("modal")) {
            mainModal.style.display = "none";
          }
        }
      }
    });
  }

  // Вызываем все функции инициализации
  setupSearchHandlers();
  setupCommentHandlers();
  setupActionButtons();
  setupCloseHandler();
  setupDeleteHandlers();
}

// Экспортируем функцию для вызова извне
window.ModalHandlers = {
  init: initModalHandlers,
};
