      // Это в отдлельный скрипт надо будет перенести
      // Пример данных для графика
      const ctx = document.getElementById("analytics-chart").getContext("2d");
      const analyticsChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: [
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
          ],
          datasets: [
            {
              label: "Текущий период",
              data: [120, 150, 180, 200, 170, 200, 244, 135],
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
              fill: false,
            },
            {
              label: "Прошлый период",
              data: [100, 140, 160, 190, 180],
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 2,
              fill: false,
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
        },
      });