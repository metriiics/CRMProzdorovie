function toggleSpecialization(roleSelectId, specializationGroupId) {
    const roleSelect = document.getElementById(roleSelectId);
    const specializationGroup = document.getElementById(specializationGroupId);

    if (roleSelect && specializationGroup) {
        specializationGroup.style.display = roleSelect.value === "3" ? "block" : "none";
        const specializationField = specializationGroup.querySelector('select');
        if (specializationField) {
            specializationField.required = roleSelect.value === "3";
        }
    }
}


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

  function setupEmployeeRowHandlers() {
    document.querySelectorAll('.employee-row').forEach(row => {
      row.addEventListener('click', () => {
        const employeeId = row.dataset.employeeId;
        if (!employeeId) return;

        fetch(`/api/v1/employee-data/?employee_id=${employeeId}`, {
          method: 'GET',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
          },
        })
        .then(response => response.json())
        .then(data => {
          console.log('Response data:', data);
          if (data && data.id) {
            fillModalFields(data);
          } else {
            alert('Ошибка загрузки данных сотрудника');
          }
        })
        .catch(err => {
          console.error('Ошибка запроса:', err);
          alert('Ошибка запроса к серверу');
        });
      });
    });
  }

  function fillModalFields(employee) {
    document.getElementById('employee-id').value = employee.id || '';
    document.getElementById('last_name').value = employee.last_name || '';
    document.getElementById('first_name').value = employee.first_name || '';
    document.getElementById('surname').value = employee.surname || '';
    document.getElementById('username').value = employee.username || '';
    document.getElementById('email').value = employee.email || '';
    document.getElementById('employee-role').value = employee.role || '';
    toggleSpecialization('employee-role', 'add-specialization-group');
    document.getElementById('add-specialization').value = employee.specialization ? employee.specialization.id : '';
  }


  // 3. Обработчики кнопок сохранения/удаления
  function setupActionButtons() {
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("save-btn")) {
        e.preventDefault();
        const data = {
            last_name: document.getElementById("employee-last_name").value,
            first_name: document.getElementById("employee-first_name").value,
            surname: document.getElementById("employee-surname").value,
            email: document.getElementById("employee-email").value,
            username: document.getElementById("employee-username").value,
            password: document.getElementById("employee-password").value,
            role: document.getElementById("employee-role").value,
            csrfmiddlewaretoken: document.querySelector('[name=csrfmiddlewaretoken]').value
          };
        // Очищаем все поля с ошибками
        ['surname', 'first_name', 'last_name', 'email', 'username', 'password', 'role', 'specialization'].forEach(field => {
          const errDiv = document.getElementById('error-' + field);
          if (errDiv) errDiv.textContent = '';
        });

        const modal = e.target.closest(".modal");
        const errorMessage = modal.querySelector(".error-message");
        const successMessage = modal.querySelector(".success-message");
        errorMessage.style.display = "none";
        errorMessage.textContent = "";

        fetch('/modal/add-employee/', {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams(data)
        })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            if (successMessage) {
              successMessage.textContent = result.message;
              successMessage.style.display = "block";
              successMessage.classList.add("show");

              if (errorMessage) {
                errorMessage.style.display = "none";
                errorMessage.textContent = "";
              }

              setTimeout(() => {
                successMessage.classList.remove("show");
                modal.style.display = "none";
                successMessage.style.display = "none";
              }, 2000);
            }
          } else {
            // Если есть ошибки, показываем их под полями или в общем блоке
            if (result.errors) {
              for (const [field, messages] of Object.entries(result.errors)) {
                const errDiv = document.getElementById('error-' + field);
                if (errDiv) {
                  errDiv.textContent = messages.join(', ');
                } else {
                  // Если поле ошибки не найдено, выводим в общий блок
                  if (errorMessage) {
                    errorMessage.innerHTML += `<div>${messages.join(', ')}</div>`;
                    errorMessage.style.display = "block";
                  } else {
                    alert(messages.join('\n'));
                  }
                }
              }
            } else {
              if (errorMessage) {
                errorMessage.textContent = "Произошла неизвестная ошибка";
                errorMessage.style.display = "block";
              } else {
                alert("Произошла неизвестная ошибка");
              }
            }
          }
        })
        .catch(error => {
          console.error("Ошибка при отправке:", error);
          if (errorMessage) {
            errorMessage.textContent = "Произошла ошибка при отправке данных. Попробуйте позже.";
            errorMessage.style.display = "block";
          } else {
            alert("Произошла ошибка при отправке данных. Попробуйте позже.");
          }
        });

        return; // чтобы дальше событие не обрабатывалось
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
    document.querySelectorAll(".close-btn").forEach(btn => {
      // Удаляем предыдущие обработчики, чтобы избежать дублирования
      btn.removeEventListener('click', closeModalHandler);
      // Добавляем новый обработчик
      btn.addEventListener('click', closeModalHandler);
    });
  }

  function closeModalHandler(e) {
    const modal = e.target.closest('.modal');
    if (modal) {
      modal.style.display = 'none';
    }
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
  // Обработчик для модального окна добавления сотрудника
  const addRoleSelect = document.getElementById("employee-role");
  if (addRoleSelect) {
      addRoleSelect.addEventListener("change", function() {
          toggleSpecialization("employee-role", "add-specialization-group");
      });
      // Инициализация при загрузке
      toggleSpecialization("employee-role", "add-specialization-group");
  }

  // Обработчик для модального окна изменения сотрудника
  const changeRoleSelect = document.getElementById("role");
  if (changeRoleSelect) {
      changeRoleSelect.addEventListener("change", function() {
          toggleSpecialization("role", "change-specialization-group");
      });
      // Инициализация при загрузке
      toggleSpecialization("role", "change-specialization-group");
  }

  // Вызываем все функции инициализации
  setupSearchHandlers();
  setupCommentHandlers();
  setupActionButtons();
  setupCloseHandler();
  setupDeleteHandlers();
  setupEmployeeRowHandlers();
}



// Экспортируем функцию для вызова извне
window.ModalHandlers = {
  init: initModalHandlers,
};
