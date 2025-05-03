// Основная функция инициализации всех обработчиков модального окна
function initModalHandlers() {
  // 1. Обработчики для поиска с подсказками
  function setupSearchHandlers() {
    document.querySelectorAll(".search-container").forEach((container) => {
      const input = container.querySelector(".search-input");
      const suggestions = container.querySelector(".suggestions");
  
      if (!input || !suggestions) return;
  
      input.addEventListener("input", () => {
        const query = input.value.trim();
        const placeholder = input.placeholder.toLowerCase();
  
        let url = "";
        if (placeholder.includes("клиент")) {
          url = `/search-client/?query=${encodeURIComponent(query)}`;
        } else if (placeholder.includes("врач")) {
          url = `/search-doctor/?query=${encodeURIComponent(query)}`;
        } else if (placeholder.includes("услуг")) {
          url = `/search-service/?query=${encodeURIComponent(query)}`;
        }
  
        if (!url || query.length < 2) {
          suggestions.style.display = "none";
          return;
        }
  
        fetch(url)
          .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
          })
          .then(data => {
            console.log('Search results:', data);
            const items = data.clients || data.doctors || data.services || [];
            suggestions.innerHTML = "";
  
            items.forEach(item => {
              const div = document.createElement("div");
              div.classList.add("suggestion-item");
              div.textContent = item.fio || item.name || `${item.last_name} ${item.first_name} ${item.surname || ''}`.trim();
              
              // Общие атрибуты
              div.dataset.id = item.id;
              div.dataset.fio = div.textContent;
              
              // Для клиентов
              if (data.clients) {
                div.dataset.phone = item.phone_number || '';
                div.dataset.lastName = item.last_name;
                div.dataset.firstName = item.first_name;
                div.dataset.surname = item.surname || '';
              }
              // Для врачей
              else if (data.doctors) {
                div.dataset.lastName = item.last_name;
                div.dataset.firstName = item.first_name;
                div.dataset.surname = item.surname || '';
              }
              // Для услуг
              else if (data.services) {
                div.dataset.name = item.name;
                div.dataset.price = item.price || '';
              }
              
              suggestions.appendChild(div);
            });
            
            suggestions.style.display = items.length ? "block" : "none";
            bindSuggestionClicks(container, input, suggestions);
          })
          .catch(error => {
            console.error('Error fetching search results:', error);
            suggestions.style.display = "none";
          });
      });
  
      input.addEventListener("focus", () => {
        if (suggestions.innerHTML !== "") {
          suggestions.style.display = "block";
        }
      });
  
      input.addEventListener("blur", () => {
        setTimeout(() => suggestions.style.display = "none", 200);
      });
    });
  }
  
  function bindSuggestionClicks(container, input, suggestions) {
    suggestions.querySelectorAll(".suggestion-item").forEach((item) => {
      item.addEventListener("click", () => {
        const modal = container.closest('.modal');
        const placeholder = input.placeholder.toLowerCase();
        
        // Для клиентов
        if (placeholder.includes("клиент")) {
          const clientData = {
            id: item.dataset.id,
            last_name: item.dataset.lastName,
            first_name: item.dataset.firstName,
            surname: item.dataset.surname || '',
            phone_number: item.dataset.phone,
            fio: item.dataset.fio
          };
          
          if (modal.id === 'create-record-modal') {
            fillCreateRecordForm(clientData);
          } else {
            fillClientForm(clientData);
          }
        }
        // Для врачей
        else if (placeholder.includes("врач")) {
          const doctorData = {
            id: item.dataset.id,
            last_name: item.dataset.lastName,
            first_name: item.dataset.firstName,
            surname: item.dataset.surname || '',
            fio: item.dataset.fio
          };
          
          fillDoctorForm(doctorData);
        }
        // Для услуг
        else if (placeholder.includes("услуг")) {
          const serviceData = {
            id: item.dataset.id,
            name: item.dataset.name,
            price: item.dataset.price,
            fio: item.dataset.fio
          };
          
          fillServiceForm(serviceData);
        }
        
        input.value = item.dataset.fio;
        suggestions.style.display = "none";
      });
    });
  }

  function fillCreateRecordForm(client) {
    console.log('Filling create record form with:', client);
    
    const clientIdField = document.getElementById('client-id');
    const phoneField = document.getElementById('phone');
    const clientSearchField = document.getElementById('client-search');

    if (clientIdField) clientIdField.value = client.id;
    if (phoneField) phoneField.value = client.phone_number || '';
    if (clientSearchField) clientSearchField.value = client.fio;
  }

  function fillDoctorForm(doctor) {
    console.log('Filling doctor form with:', doctor);
    
    const doctorIdField = document.getElementById('doctor-id');
    const doctorSearchField = document.getElementById('doctor-search');

    if (doctorIdField) doctorIdField.value = doctor.id;
    if (doctorSearchField) doctorSearchField.value = doctor.fio;
  }

  function fillServiceForm(service) {
    console.log('Filling service form with:', service);
    
    const serviceIdField = document.getElementById('service-id');
    const serviceSearchField = document.getElementById('service-search');
    const priceField = document.getElementById('payment-amount');

    if (serviceIdField) serviceIdField.value = service.id;
    if (serviceSearchField) serviceSearchField.value = service.fio;
    if (priceField && service.price) priceField.value = service.price;
  }

  function fillClientForm(client) {
    console.log('Filling client form with:', client);
    
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
    if (searchField) searchField.value = client.fio;
  }

  function setupAddClientForm() {
    const form = document.getElementById('client-form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
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
          showSuccessMessage(data.message);
          form.reset();
          
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

  function setupCreateRecordForm() {
    const form = document.getElementById('create-record-form');
    if (!form) return;
  
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      submitBtn.textContent = 'Сохранение...';
      submitBtn.disabled = true;
  
      try {
        // Собираем данные формы
        const formData = new FormData(form);
        
        // Добавляем дополнительные проверки
        if (!formData.get('client_id')) {
          throw new Error('Не выбран клиент');
        }
        if (!formData.get('doctor_id')) {
          throw new Error('Не выбран врач');
        }
        if (!formData.get('service_date')) {
          throw new Error('Не указана дата услуги');
        }
  
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'X-CSRFToken': form.querySelector('[name=csrfmiddlewaretoken]').value,
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
  
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Ошибка сервера');
        }
        
        if (data.status === 'success') {
          showSuccessMessage(data.message);
          form.reset();
          
          setTimeout(() => {
            const modal = form.closest('.modal');
            if (modal) modal.style.display = 'none';
            if (typeof refreshRecords === 'function') refreshRecords();
          }, 1500);
        } else {
          throw new Error(data.message || 'Ошибка при создании записи');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        showErrorMessage(error.message);
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
          showSuccessMessage(data.message);
          
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

  // Обработчики для комментариев
  function setupCommentHandlers() {
    const commentInput = document.getElementById("comment-input");
    const commentsContainer = document.querySelector(".comments-scroll");

    if (commentInput && commentsContainer) {
      commentInput.addEventListener("keypress", function(e) {
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

  // Обработчик закрытия модального окна
  function setupCloseHandler() {
    document.querySelectorAll(".close-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.closest(".modal").style.display = "none";
      });
    });
  }

  // Обработчик для кнопки "Отмена"/"Удалить клиента"
  function setupDeleteHandlers() {
    document.addEventListener("click", function(e) {
      if (e.target.classList.contains("delete-link")) {
        e.preventDefault();
        const modal = e.target.closest(".modal");
        if (modal) {
          const confirmationModal = modal.nextElementSibling;
          if (confirmationModal && confirmationModal.classList.contains("confirmation-modal")) {
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
  setupAddClientForm();  
  setupChangeClientForm();
  setupCreateRecordForm();
}

// Экспортируем функцию для вызова извне
window.ModalHandlers = {
  init: initModalHandlers,
};