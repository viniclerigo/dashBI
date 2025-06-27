// graficoFaturamento.js

let chart;
let dataLabelsVisible = true;

export function inicializarGraficoFaturamento(ctx) {
    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [],
            datasets: [{
                label: "Faturamento (R$)",
                data: [],
                backgroundColor: "#42a5f5"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 50, bottom: 10, left: 10, right: 10 } },
            hover: { mode: null },
            plugins: {
                legend: { display: false },
                datalabels: {
                    display: () => dataLabelsVisible,
                    color: '#000',
                    anchor: 'end',
                    align: 'top',
                    clamp: true,
                    font: { weight: 'bold', size: 12 },
                    formatter: val => `R$ ${parseFloat(val).toLocaleString("pt-BR")}`,
                    animation: { duration: 0 }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => `R$ ${Number(ctx.raw).toLocaleString("pt-BR")}`
                    }
                }
            },
            scales: {
                y: {
                    grid: { display: false },
                    beginAtZero: true,
                    ticks: { callback: val => `R$ ${val}` }
                },
                x: { grid: { display: false } }
            }
        },
        plugins: [ChartDataLabels]
    });

    return chart;
}

export function atualizarGraficoFaturamento(chart, labels, valores) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = valores;
    chart.update();
}

export function toggleValores(chart) {
    dataLabelsVisible = !dataLabelsVisible;
    chart.update();
    return dataLabelsVisible;
}
