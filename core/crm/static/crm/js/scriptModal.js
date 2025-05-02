// Основная функция инициализации всех обработчиков модального окна
function initModalHandlers() {
  // 1. Обработчики для поиска с подсказками
  function setupSearchHandlers() {
    document.querySelectorAll(".search-container").forEach((container) => {
      const input = container.querySelector(".search-input");
      const suggestions = container.querySelector(".suggestions");
  
      if (!input || !suggestions) return;
  
      input.addEventListener("input", () => {
        const query = input.value;
        const placeholder = input.placeholder.toLowerCase();
  
        let url = "";
        if (placeholder.includes("клиент")) {
          url = `/search-client/?query=${encodeURIComponent(query)}`;
        } else if (placeholder.includes("врач")) {
          url = `/search-doctor/?query=${encodeURIComponent(query)}`;
        }
  
        if (!url) return;
  
        fetch(url)
          .then(res => res.json())
          .then(data => {
            const items = data.clients || data.doctors || [];
            suggestions.innerHTML = "";
  
            items.forEach(item => {
              const div = document.createElement("div");
              div.classList.add("suggestion-item");
              div.textContent = item.fio;
              div.dataset.phone = item.phone_number || "";
              div.dataset.fio = item.fio;
            
              // Добавьте недостающие поля:
              div.dataset.clientId = item.id;
              div.dataset.lastName = item.last_name;
              div.dataset.firstName = item.first_name;
              div.dataset.surname = item.surname || '';
            
              suggestions.appendChild(div);
            });
            
  
            suggestions.style.display = "block";
            bindSuggestionClicks(container, input, suggestions);
          });
      });
  
      input.addEventListener("focus", () => {
        suggestions.style.display = "block";
      });
  
      input.addEventListener("blur", () => {
        setTimeout(() => suggestions.style.display = "none", 200);
      });
    });
  }
  
  function bindSuggestionClicks(container, input, suggestions) {
    suggestions.querySelectorAll(".suggestion-item").forEach((item) => {
        item.addEventListener("click", () => {
            // Получаем все данные клиента из data-атрибутов
            const clientData = {
                id: item.dataset.clientId,
                last_name: item.dataset.lastName,
                first_name: item.dataset.firstName,
                surname: item.dataset.surname || '',
                phone_number: item.dataset.phone
            };
            
            // Заполняем форму данными клиента
            fillClientForm(clientData);
            
            input.value = item.dataset.fio;
            suggestions.style.display = "none";
        });
    });
  }

  function setupAddClientForm() {
    const form = document.getElementById('client-form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Показываем индикатор загрузки
        submitBtn.textContent = 'Сохранение...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': form.querySelector('[name=csrfmiddlewaretoken]').value,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                // Показываем сообщение об успехе
                showSuccessMessage(data.message);
                
                // Очищаем форму после успешного сохранения
                form.reset();
                
                // Закрываем модальное окно через 1.5 секунды
                setTimeout(() => {
                    const modal = form.closest('.modal');
                    if (modal) modal.style.display = 'none';
                }, 1500);
            } else {
                showErrorMessage(data.message || 'Ошибка при сохранении клиента');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showErrorMessage('Произошла ошибка при сохранении');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
  }

  function setupChangeClientForm() {
    const form = document.getElementById('change-client-form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Показываем индикатор загрузки
        submitBtn.textContent = 'Сохранение...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': form.querySelector('[name=csrfmiddlewaretoken]').value,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                // Показываем сообщение об успехе
                showSuccessMessage(data.message);
                
                // Закрываем модальное окно через 1.5 секунды
                setTimeout(() => {
                    const modal = form.closest('.modal');
                    if (modal) modal.style.display = 'none';
                }, 1500);
            } else {
                showErrorMessage(data.message || 'Ошибка при изменении клиента');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showErrorMessage('Произошла ошибка при сохранении');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
  }

  function fillClientForm(client) {
    console.log('Filling form with:', client);
    
    if (!client.id || isNaN(client.id)) {
        console.error('Invalid client ID:', client.id);
        return;
    }
    
    const clientIdField = document.getElementById('client-id');
    const lastNameField = document.getElementById('last_name');
    const firstNameField = document.getElementById('first_name');
    const surnameField = document.getElementById('surname');
    const phoneField = document.getElementById('phone_number');
    const searchField = document.getElementById('client-search');

    if (clientIdField) clientIdField.value = client.id;
    if (lastNameField) lastNameField.value = client.last_name || '';
    if (firstNameField) firstNameField.value = client.first_name || '';
    if (surnameField) surnameField.value = client.surname || '';
    if (phoneField) phoneField.value = client.phone_number || '';
    if (searchField) searchField.value = `${client.last_name} ${client.first_name} ${client.surname || ''}`.trim();
  }

  function showSuccessMessage(message) {
    const successElement = document.getElementById('success-message');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }
  }

  function showErrorMessage(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
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

  // 4. Обработчик закрытия модального окна
  function setupCloseHandler() {
    document.querySelector(".close-btn")?.addEventListener("click", () => {
      document.querySelector(".modal").style.display = "none";
    });
  }

  // Обработчик для кнопки "Отмена"/"Удалить клиента"
  function setupDeleteHandlers() {
    document.addEventListener("click", function (e) {
      if (e.target.classList.contains("delete-link")) {
        e.preventDefault();
        const modal = e.target.closest(".modal");
        if (modal) {
          const confirmationModal = modal.nextElementSibling;
          if (
            confirmationModal &&
            confirmationModal.classList.contains("confirmation-modal")
          ) {
            confirmationModal.style.display = "flex";
          }
        }
      }

      if (e.target.classList.contains("cancel-btn")) {
        const confirmationModal = e.target.closest(".confirmation-modal");
        if (confirmationModal) {
          confirmationModal.style.display = "none";
        }
      }

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
  setupCloseHandler();
  setupDeleteHandlers();
  setupAddClientForm();  // Добавлено для обработки формы добавления клиента
  setupChangeClientForm();
}

// Экспортируем функцию для вызова извне
window.ModalHandlers = {
  init: initModalHandlers,
};