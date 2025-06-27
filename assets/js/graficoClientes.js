// graficoClientes.js

let chartClientes;
let dataLabelsVisible = true;

export function inicializarGraficoClientes(ctx) {
    chartClientes = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [],
            datasets: [{
                label: "Novos Clientes",
                data: [],
                backgroundColor: "#66bb6a"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: {
                    display: () => dataLabelsVisible,
                    color: '#000',
                    anchor: 'end',
                    align: 'top',
                    font: { weight: 'bold', size: 12 },
                    formatter: val => `${val} clientes`,
                    clamp: true,
                    animation: { duration: 0 }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.raw} clientes`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { display: false },
                    ticks: { precision: 0 }
                },
                x: { grid: { display: false } }
            }
        },
        plugins: [ChartDataLabels] // utiliza plugin global via CDN
    });

    return chartClientes;
}

export function atualizarGraficoClientes(chart, clientesFiltrados, granularidade) {
    const agrupado = {};

    clientesFiltrados.forEach(cliente => {
        const data = new Date(cliente.data_cadastro);
        let chave;

        switch (granularidade) {
            case "ano":
                chave = data.getFullYear();
                break;
            case "trimestre":
                chave = `${data.getFullYear()}-T${Math.floor(data.getMonth() / 3) + 1}`;
                break;
            case "mes":
            default:
                chave = data.getMonth();
                break;
        }

        agrupado[chave] = (agrupado[chave] || 0) + 1;
    });

    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    let labels = [];
    let valores = [];

    if (granularidade === "mes") {
        labels = meses;
        valores = meses.map((_, i) => agrupado[i] || 0);
    } else {
        const ordenado = Object.entries(agrupado).sort((a, b) => a[0].localeCompare(b[0]));
        labels = ordenado.map(e => e[0]);
        valores = ordenado.map(e => e[1]);
    }

    chart.data.labels = labels;
    chart.data.datasets[0].data = valores;
    chart.update();
}

export function toggleValoresClientes() {
    dataLabelsVisible = !dataLabelsVisible;
    if (chartClientes) chartClientes.update();
    return dataLabelsVisible;
}
