document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.save-btn').addEventListener('click', function () {
        const data = {
            surname: document.getElementById('surname').value,
            first_name: document.getElementById('name').value,
            last_name: document.getElementById('surname').value,
            phone_number: document.getElementById('phone').value,
        };

        fetch('/add-client/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (response.ok) {
                document.querySelector('.success-message').style.display = 'block';
            } else {
                alert("Ошибка при сохранении");
            }
        });
    });

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
