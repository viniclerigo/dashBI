// // Arquivo de inicialização - pronto para integrar seus gráficos

// document.addEventListener("DOMContentLoaded", () => {
//     console.log("Dashboard carregado.");

//     // Você poderá usar os IDs abaixo para renderizar seus gráficos:
//     // - chart-temporal-1
//     // - chart-temporal-2
//     // - chart-ranking-1
//     // - chart-ranking-2
// });

document.addEventListener("DOMContentLoaded", async () => {
    const ctx = document.getElementById("faturamento-chart").getContext("2d");
    const select = document.getElementById("granularity-select");
    const toggleBtn = document.getElementById("toggle-datalabels");

    const vendas = await fetch("data/vendas.json").then(res => res.json());

    let chart;
    let dataLabelsVisible = true; // controle do botão

    function agruparVendas(granularidade) {
        const agrupado = {};

        vendas.forEach(venda => {
            const data = new Date(venda.data_venda);
            let chave;

            switch (granularidade) {
                case "ano":
                    chave = data.getFullYear();
                    break;
                case "trimestre":
                    const trimestre = Math.floor(data.getMonth() / 3) + 1;
                    chave = `${data.getFullYear()}-T${trimestre}`;
                    break;
                case "mes":
                default:
                    const mes = (data.getMonth() + 1).toString().padStart(2, "0");
                    chave = `${data.getFullYear()}-${mes}`;
                    break;
            }

            agrupado[chave] = (agrupado[chave] || 0) + venda.total;
        });

        return Object.entries(agrupado)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .reduce((acc, [k, v]) => {
                acc.labels.push(k);
                acc.values.push(v.toFixed(2));
                return acc;
            }, { labels: [], values: [] });
    }

    function atualizarGrafico(granularidade) {
        const { labels, values } = agruparVendas(granularidade);

        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Faturamento (R$)",
                    data: values,
                    backgroundColor: "#42a5f5"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        display: dataLabelsVisible,
                        color: '#000',
                        anchor: 'end',
                        align: 'top',
                        font: { weight: 'bold' },
                        formatter: val => `R$ ${parseFloat(val).toLocaleString("pt-BR")}`
                    },
                    tooltip: {
                        callbacks: {
                            label: context => `R$ ${Number(context.raw).toLocaleString("pt-BR")}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: val => `R$ ${val}`
                        }
                    }
                },
                plugins: [ChartDataLabels]
            },
            plugins: [ChartDataLabels]
        });
    }

    select.addEventListener("change", e => {
        atualizarGrafico(e.target.value);
    });

    toggleBtn.addEventListener("click", () => {
        dataLabelsVisible = !dataLabelsVisible;
        atualizarGrafico(select.value); // redesenha o gráfico com o novo estado

        toggleBtn.textContent = dataLabelsVisible
            ? "Ocultar Data Labels"
            : "Exibir Data Labels";
    });

    atualizarGrafico("mes");
});
