      // Пример данных для графика ВЫНЕСИ В ОТДЕЛЬНЫЙ ФАЙЛ ДИМААААС ( и в analytic.html ТОЖЕ ВЫНЕСИ СКРИПТ В ФАЙЛ!!!)
      const ctx = document
        .getElementById("call-analytics-chart")
        .getContext("2d");
      const callAnalyticsChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["01.05", "02.05", "03.05", "04.05", "05.05"], // Дни месяца
          datasets: [
            {
              label: "Иванов - Пропущенные звонки",
              data: [1, 2, 1, 0, 1], // Пример данных
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderWidth: 2,
              fill: true,
            },
            {
              label: "Иванов - Завершенные звонки",
              data: [5, 4, 6, 5, 7], // Пример данных
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderWidth: 2,
              fill: true,
            },
            {
              label: "Иванов - Успешные звонки",
              data: [3, 3, 4, 4, 5], // Пример данных
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderWidth: 2,
              fill: true,
            },
            {
              label: "Петров - Пропущенные звонки",
              data: [0, 1, 1, 2, 1], // Пример данных
              borderColor: "rgba(255, 159, 64, 1)",
              backgroundColor: "rgba(255, 159, 64, 0.2)",
              borderWidth: 2,
              fill: true,
            },
            {
              label: "Петров - Завершенные звонки",
              data: [6, 5, 7, 6, 8], // Пример данных
              borderColor: "rgba(153, 102, 255, 1)",
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              borderWidth: 2,
              fill: true,
            },
            {
              label: "Петров - Успешные звонки",
              data: [4, 4, 5, 5, 6], // Пример данных
              borderColor: "rgba(255, 206, 86, 1)",
              backgroundColor: "rgba(255, 206, 86, 0.2)",
              borderWidth: 2,
              fill: true,
            },
            {
              label: "Сидоров - Пропущенные звонки",
              data: [2, 1, 2, 3, 2], // Пример данных
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderWidth: 2,
              fill: true,
            },
            {
              label: "Сидоров - Завершенные звонки",
              data: [7, 6, 8, 7, 9], // Пример данных
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderWidth: 2,
              fill: true,
            },
            {
              label: "Сидоров - Успешные звонки",
              data: [5, 5, 6, 6, 7], // Пример данных
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderWidth: 2,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Дни",
              },
            },
            y: {
              title: {
                display: true,
                text: "Количество звонков",
              },
              beginAtZero: true,
            },
          },
        },
      });