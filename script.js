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
                    // Para mes, soma independente do ano, usa só o mês (0 a 11)
                    chave = data.getMonth(); // número do mês (0 a 11)
                    break;
            }

            agrupado[chave] = (agrupado[chave] || 0) + venda.total;
        });

        // Para labels do mês (nomes)
        const meses = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];

        // Monta o resultado dependendo da granularidade
        if (granularidade === "mes") {
            // Ordena os meses por ordem natural (0 a 11)
            const labels = [];
            const values = [];

            for (let i = 0; i < 12; i++) {
                labels.push(meses[i]);
                values.push((agrupado[i] || 0).toFixed(2));
            }

            return { labels, values };
        } else {
            // Para ano e trimestre continua igual
            return Object.entries(agrupado)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .reduce((acc, [k, v]) => {
                    acc.labels.push(k);
                    acc.values.push(v.toFixed(2));
                    return acc;
                }, { labels: [], values: [] });
        }
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
                layout: {
                    padding: {
                        top: 50,
                        bottom: 10,
                        left: 10,
                        right: 10
                    }
                },
                hover: {
                    mode: null  // desativa hover para evitar movimentação dos labels
                },
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        display: dataLabelsVisible,
                        color: '#000',
                        anchor: 'end',
                        align: 'top',
                        clamp: true,
                        font: { weight: 'bold', size: 12 },
                        formatter: val => `R$ ${parseFloat(val).toLocaleString("pt-BR")}`,
                        listeners: false,
                        animation: { duration: 0 }, // desabilita animação dos labels
                        padding: (function () {
                            const labelHeight = 14;
                            const spacing = 6;
                            let labelTops = [];

                            return function (context) {
                                const chart = context.chart;
                                const dataIndex = context.dataIndex;
                                const meta = chart.getDatasetMeta(0);
                                const bar = meta.data[dataIndex];
                                if (!bar) return 0;

                                const currentTop = bar.tooltipPosition().y;
                                let offset = 0;

                                // Reset no início
                                if (dataIndex === 0) {
                                    labelTops = [currentTop];
                                    return 0;
                                }

                                for (let i = dataIndex - 1; i >= 0; i--) {
                                    const prevTop = labelTops[i];
                                    if (prevTop === undefined) continue;

                                    const currentLabelBottom = currentTop - offset + labelHeight;
                                    const prevLabelTop = prevTop;

                                    const overlap = prevLabelTop + spacing > currentLabelBottom;

                                    if (overlap) {
                                        // Move o label atual para cima o suficiente
                                        const neededOffset = (prevLabelTop + spacing) - currentLabelBottom;
                                        offset += neededOffset;
                                    }
                                }

                                labelTops[dataIndex] = currentTop - offset;
                                return offset;
                            };
                        })()
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
                        ticks: {
                            callback: val => `R$ ${val}`
                        }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
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
