let chartCanal;
let dataLabelsVisible = true;

export function inicializarGraficoCanal(ctx) {
    chartCanal = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [],
            datasets: [{
                label: "Faturamento por Canal (R$)",
                data: [],
                backgroundColor: "#66bb6a"
            }]
        },
        options: {
            indexAxis: 'y', // Barras horizontais
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
                    align: 'right',
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
                x: {
                    beginAtZero: true,
                    grid: { display: false },
                    ticks: { callback: val => `R$ ${val}` }
                },
                y: {
                    grid: { display: false }
                }
            }
        },
        plugins: [ChartDataLabels]
    });

    return chartCanal;
}

export function atualizarGraficoCanal(chart, labels, valores) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = valores;
    chart.update();
}

export function atualizarVisibilidadeDataLabelsCanal(visible) {
    dataLabelsVisible = visible;
    if (chartCanal) chartCanal.update();
}
