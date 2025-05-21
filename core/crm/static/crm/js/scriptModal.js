// Основная функция инициализации всех обработчиков модального окна
function initModalHandlers() {
  // 1. Обработчики для поиска с подсказками
  setupSearchHandlers();

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
              const form = modal.querySelector('form');
              const formId = form?.id;
              
              // Для клиентов
              if (input.id === 'client-search') {
                  const clientData = {
                      id: item.dataset.id,
                      last_name: item.dataset.lastName,
                      first_name: item.dataset.firstName,
                      surname: item.dataset.surname || '',
                      phone_number: item.dataset.phone,
                      fio: item.dataset.fio
                  };

                  // Заполнение для формы создания записи
                  if (formId === 'create-record-form') {
                      fillField(modal, '#client-id', clientData.id);
                      fillField(modal, '#phone_number', clientData.phone_number);
                      fillField(modal, '#client-search', clientData.fio);
                  }
                  // Заполнение для формы изменения клиента
                  else if (formId === 'change-client-form') {
                      fillField(modal, '#client-id', clientData.id);
                      fillField(modal, '#last_name', clientData.last_name);
                      fillField(modal, '#first_name', clientData.first_name);
                      fillField(modal, '#surname', clientData.surname);
                      fillField(modal, '#phone_number', clientData.phone_number);
                      fillField(modal, '#client-search', clientData.fio);
                  }
              }
              // Для врачей
              else if (input.id === 'doctor-search') {
                  const doctorData = {
                      id: item.dataset.id,
                      fio: item.dataset.fio
                  };
                  fillField(modal, '#doctor-id', doctorData.id);
                  fillField(modal, '#doctor-search', doctorData.fio);
              }
              
              input.value = item.textContent;
              suggestions.style.display = "none";
          });
      });
  }

  // Вспомогательная функция для безопасного заполнения полей
  function fillField(modal, selector, value) {
    const field = modal.querySelector(selector);
    if (field) {
      field.value = value;
      console.log(`Filled ${selector} with:`, value);
    } else {
      console.warn(`Field not found: ${selector}`);
    }
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

  function initStatusSearch() {
    const statusSearchInput = document.getElementById('client-status-search');
    const statusSuggestions = document.getElementById('status-suggestions');
    const statusHiddenInput = document.getElementById('client-status');
  
    if (!statusSearchInput || !statusSuggestions || !statusHiddenInput) {
      console.warn('Элементы для поиска статусов не найдены');
      return;
    }
  
    // Обработчик ввода текста
    statusSearchInput.addEventListener('input', debounce(handleStatusSearch, 300));
  
    // Обработчик клика по подсказке
    statusSuggestions.addEventListener('click', (e) => {
      const suggestion = e.target.closest('.suggestion-item');
      if (suggestion) {
        selectStatusSuggestion(suggestion);
      }
    });
  
    // Закрытие подсказок при клике вне элемента
    document.addEventListener('click', (e) => {
      if (!statusSearchInput.contains(e.target) && !statusSuggestions.contains(e.target)) {
        statusSuggestions.style.display = 'none';
      }
    });
  
    async function handleStatusSearch() {
      const query = statusSearchInput.value.trim();
      
      if (query.length < 2) {
        statusSuggestions.style.display = 'none';
        statusHiddenInput.value = '';
        return;
      }
  
      try {
        const response = await fetch(`/api/status-search/?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        if (data.statuses && data.statuses.length > 0) {
          renderStatusSuggestions(data.statuses);
          statusSuggestions.style.display = 'block';
        } else {
          statusSuggestions.style.display = 'none';
        }
      } catch (error) {
        console.error('Ошибка при поиске статусов:', error);
        statusSuggestions.style.display = 'none';
      }
    }
  
    function renderStatusSuggestions(statuses) {
      statusSuggestions.innerHTML = '';
      
      statuses.forEach(status => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = status.name;
        div.dataset.id = status.id;
        statusSuggestions.appendChild(div);
      });
    }
  
    function selectStatusSuggestion(suggestion) {
      statusSearchInput.value = suggestion.textContent;
      statusHiddenInput.value = suggestion.dataset.id;
      statusSuggestions.style.display = 'none';
    }
  
    function debounce(func, wait) {
      let timeout;
      return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          func.apply(context, args);
        }, wait);
      };
    }
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

  let isModalLoading = false;

  function setupChangeRecordHandlers() {
    document.removeEventListener('modal-loaded', handleModalLoaded);
    
    // Добавляем новый обработчик
    document.addEventListener('modal-loaded', handleModalLoaded);
  }

  function handleModalLoaded(e) {
    if (isModalLoading) return;
    
    if (e.detail.modalId === 'change-record-btn-modal' && window.currentRecordId) {
        isModalLoading = true;
        loadRecordData(window.currentRecordId)
            .finally(() => {
                isModalLoading = false;
            });
    }
    setupChangeRecordForm();
  }
  
    // Загрузка данных записи при открытии модального окна
  function loadRecordData(recordId) {
    fetch(`/api/record-data/?record_id=${recordId}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            fillRecordForm(data);
        })
        .catch(error => {
            console.error('Error loading record data:', error);
            showErrorMessage('Ошибка загрузки данных записи: ' + error.message);
        });
  }

  function fillRecordForm(data) {
    console.log('Filling form with data:', data);
    
    const modal = document.getElementById('change-record-btn-modal');
    if (!modal) {
        console.error('Modal "change-record-btn-modal" not found');
        return;
    }

    // Основные поля
    fillField(modal, '#record-id', data.id || '');
    fillField(modal, '#client-id', data.client?.id || '');
    
    // Клиент
    const clientName = `${data.client?.last_name || ''} ${data.client?.first_name || ''} ${data.client?.surname || ''}`.trim();
    fillField(modal, '#client-search', clientName);
    fillField(modal, '#phone_number', data.client?.phone_number || '');
    
    // Врач
    if (data.doctor) {
        fillField(modal, '#doctor-id', data.doctor.id || '');
        const doctorName = `${data.doctor.last_name || ''} ${data.doctor.first_name || ''} ${data.doctor.surname || ''}`.trim();
        fillField(modal, '#doctor-search', doctorName);
    }

    // Статус 
    if (data.status) {
        fillField(modal, '#client-status-search', data.status.name || '');
        fillField(modal, '#client-status', data.status.id || '');
    }


    // Даты
    if (data.date_recording) {
        const recordingDate = data.date_recording.includes('T') 
            ? data.date_recording.split('T')[0] 
            : data.date_recording;
        fillField(modal, '#service-date', recordingDate);
    }
    
    if (data.date_next_call) {
        const nextCallDate = data.date_next_call.includes('T')
            ? data.date_next_call.split('T')[0]
            : data.date_next_call;
        fillField(modal, '#callback-date', nextCallDate);
    }
    
    // Комментарии
    const commentsContainer = modal.querySelector('#comments-container');
    if (commentsContainer) {
        commentsContainer.innerHTML = '';
        
        if (data.comments?.length > 0) {
            data.comments.forEach(comment => {
                const commentDiv = document.createElement('div');
                commentDiv.className = 'comment';
                commentDiv.textContent = `${comment.created_at} ${comment.manager?.full_name || 'Менеджер'}: ${comment.text}`;
                commentsContainer.appendChild(commentDiv);
            });
        }
    }
    
    console.log('Form should be filled now');
  }

  // Обработчик формы изменения записи
  function setupChangeRecordForm() {
    const form = document.getElementById('change-record-form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Сохранение...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(form);
            
            // Добавляем недостающие данные из формы
            formData.append('doctor_id', document.getElementById('doctor-id').value);
            formData.append('comment', document.getElementById('comment-input').value);

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
                
                setTimeout(() => {
                    const modal = form.closest('.modal');
                    if (modal) modal.style.display = 'none';
                    if (typeof refreshRecords === 'function') refreshRecords();
                }, 1500);
            } else {
                throw new Error(data.message || 'Ошибка при изменении записи');
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

  function setupCloseHandler() {
  document.querySelectorAll(".close-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const modal = this.closest(".modal");
      if (modal) {
        modal.style.display = "none";
        
        // Очищаем все динамические данные
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
      }
    });
  });
}

  // Обработчик для кнопки "Отмена"/"Удалить клиента"
  function setupDeleteHandlers() {
    document.addEventListener("click", function(e) {
      // Обработка кнопки "Отмена"
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

      //  логика только для удаления клиента
      if (e.target.classList.contains("delete-client-link")) {
        e.preventDefault();
        const modal = e.target.closest(".modal");
        if (modal) {
          const confirmationModal = modal.querySelector(".confirmation-modal");
          if (confirmationModal) {
            confirmationModal.style.display = "flex";
          }
        }
      }

      // Обработка кнопки "Нет" в окне подтверждения
      if (e.target.classList.contains("cancel-btn")) {
        const confirmationModal = e.target.closest(".confirmation-modal");
        if (confirmationModal) {
          confirmationModal.style.display = "none";
        }
      }

      // Обработка подтверждения удаления КЛИЕНТА
      if (e.target.classList.contains("confirm-delete-client-btn")) {
        const confirmationModal = e.target.closest(".confirmation-modal");
        if (confirmationModal) {
          const mainModal = confirmationModal.closest(".modal");
          if (mainModal) {
            const form = mainModal.querySelector("form");
            if (form) {
              const formData = new FormData(form);
              formData.append('action', 'deactivate'); 
              
              fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                  'X-CSRFToken': form.querySelector('[name=csrfmiddlewaretoken]').value,
                  'X-Requested-With': 'XMLHttpRequest'
                }
              })
              .then(response => response.json())
              .then(data => {
                if (data.status === 'success') {
                  // Показываем сообщение в основном модальном окне
                  showSuccessMessage(data.message);
                  
                  // Закрываем окно подтверждения
                  confirmationModal.style.display = "none";
                  
                } else {
                  showErrorMessage(data.message || 'Ошибка при деактивации клиента');
                }
              })
              .catch(error => {
                console.error('Error:', error);
                showErrorMessage('Произошла ошибка при деактивации клиента');
              });
            }
          }
        }
      }

      // Обработка кнопки "Да" в окне подтверждения
      if (e.target.classList.contains("confirm-btn")) {
        const confirmationModal = e.target.closest(".confirmation-modal");
        if (confirmationModal) {
          confirmationModal.style.display = "none";
          const mainModal = confirmationModal.closest(".modal");
          if (mainModal) {
            mainModal.style.display = "none";
            // Очищаем форму при закрытии
            const form = mainModal.querySelector("form");
            if (form) form.reset();
          }
        }
      }
    });
  }

  function showSuccessMessage(message) {
    console.log('Attempting to show success message:', message);
    
    // 1. Находим активное модальное окно (более универсальный поиск)
    const activeModal = document.querySelector('.modal[style*="display: block"], .modal[style*="display: flex"], .modal.show');
    
    if (!activeModal) {
        console.warn('No active modal found, showing alert instead');
        return;
    }
    
    console.log('Active modal found:', activeModal);
    
    // 2. Ищем или создаем элемент для сообщения
    let successElement = activeModal.querySelector('.success-message');
    
    if (!successElement) {
        console.log('Creating new success message element');
        successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.style.display = 'block';
        successElement.style.opacity = '1';
        successElement.style.transition = 'opacity 0.5s';
        
        // Вставляем в подходящее место
        const form = activeModal.querySelector('form');
        if (form) {
            form.insertAdjacentElement('afterend', successElement);
        } else {
            activeModal.appendChild(successElement);
        }
    }
    
    successElement.textContent = message || "Данные успешно сохранены";
    successElement.style.display = 'block';
    successElement.style.opacity = '1';
    
    // 3. Плавное исчезновение
    setTimeout(() => {
        successElement.style.opacity = '0';
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 500);
    }, 3000);
    
    // 4. Прокручиваем к сообщению
    successElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function showErrorMessage(message) {
    const modal = document.querySelector('.modal[style*="display: block"], .modal[style*="display: flex"], .modal.show');
    if (!modal) {
        console.error('No modal found for error message');
        return;
    }

    let errorElement = modal.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.display = 'none';
        errorElement.style.color = 'red';
        
        const buttonContainer = modal.querySelector('.button-container');
        if (buttonContainer) {
            buttonContainer.prepend(errorElement);
        } else {
            modal.appendChild(errorElement);
        }
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.style.opacity = '1';
    
    setTimeout(() => {
        errorElement.style.opacity = '0';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 500);
    }, 5000);
  }

  function setupStatusSelect() {
    const statusSelect = document.querySelector('.status-select');
    if (!statusSelect) return;
  
    const statusSelected = document.getElementById('status-selected');
    const statusOptions = document.querySelector('.status-options');
    const statusInput = document.getElementById('client-status');
  
    // Обработчик клика по выбранному статусу
    statusSelect.addEventListener('click', function(e) {
      e.stopPropagation();
      this.classList.toggle('active');
    });
  
    // Обработчики клика по вариантам статуса
    if (statusOptions) {
      statusOptions.querySelectorAll('.status-option').forEach(option => {
        option.addEventListener('click', function(e) {
          e.stopPropagation();
          
          const value = this.dataset.value;
          const text = this.textContent;
          
          if (statusSelected) statusSelected.textContent = text;
          if (statusInput) statusInput.value = value;
          
          // Закрываем выпадающее меню
          statusSelect.classList.remove('active');
        });
      });
    }
  
    // Закрытие при клике вне элемента
    document.addEventListener('click', function(e) {
      if (!statusSelect.contains(e.target)) {
        statusSelect.classList.remove('active');
      }
    });
  
    // Закрытие при нажатии Esc
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && statusSelect.classList.contains('active')) {
        statusSelect.classList.remove('active');
      }
    });
  }

  // Вызываем все функции инициализации
  setupCommentHandlers();
  setupCloseHandler();
  setupDeleteHandlers();
  setupAddClientForm();  
  setupChangeClientForm();
  setupCreateRecordForm();
  setupChangeRecordHandlers();
  setupStatusSelect();
  initStatusSearch();
}

// Экспортируем функцию для вызова извне
window.ModalHandlers = {
  init: initModalHandlers,
};