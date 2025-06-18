document.addEventListener("DOMContentLoaded", async () => {
    const ctx = document.getElementById("faturamento-chart").getContext("2d");
    const select = document.getElementById("granularity-select");
    const toggleBtn = document.getElementById("toggle-datalabels");
    const yearFilter = document.getElementById("year-filter");

    const vendas = await fetch("data/vendas.json").then(res => res.json());

    // Extrair anos únicos das vendas
    const anos = Array.from(new Set(vendas.map(v => new Date(v.data_venda).getFullYear())))
        .sort((a, b) => a - b);

    // Popular o filtro de anos, adicionando opção "Todos"
    yearFilter.innerHTML = `<option value="todos">Todos</option>` +
        anos.map(ano => `<option value="${ano}">${ano}</option>`).join("");

    // Set para armazenar múltiplos anos selecionados
    const anosSelecionados = new Set();
    anosSelecionados.add("todos"); // Inicialmente seleciona todos

    // Função para filtrar vendas por anos selecionados
    function filtrarVendasPorAnosSelecionados() {
        if (anosSelecionados.has("todos") || anosSelecionados.size === 0) {
            return vendas;  // retorna tudo
        }
        return vendas.filter(v => {
            const anoVenda = new Date(v.data_venda).getFullYear();
            return anosSelecionados.has(anoVenda);
        });
    }

    // Atualiza KPI de faturamento total
    function atualizarKPI(vendasFiltradas) {
        const totalFaturamento = vendasFiltradas.reduce((acc, venda) => acc + venda.total, 0);
        document.querySelector("#kpi-faturamento-total .kpi-value").textContent =
            `R$ ${totalFaturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    }

    // Função agrupamento adaptada para receber vendas filtradas
    function agruparVendas(granularidade, vendasFiltradas) {
        const agrupado = {};

        vendasFiltradas.forEach(venda => {
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
                    chave = data.getMonth();
                    break;
            }

            agrupado[chave] = (agrupado[chave] || 0) + venda.total;
        });

        const meses = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];

        if (granularidade === "mes") {
            const labels = [];
            const values = [];
            for (let i = 0; i < 12; i++) {
                labels.push(meses[i]);
                values.push((agrupado[i] || 0).toFixed(2));
            }
            return { labels, values };
        } else {
            return Object.entries(agrupado)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .reduce((acc, [k, v]) => {
                    acc.labels.push(k);
                    acc.values.push(v.toFixed(2));
                    return acc;
                }, { labels: [], values: [] });
        }
    }

    let chart;
    let dataLabelsVisible = true;

    function atualizarGrafico(granularidade, vendasFiltradas) {
        const { labels, values } = agruparVendas(granularidade, vendasFiltradas);

        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Faturamento (R$)",
                    data: values,
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
                        display: dataLabelsVisible,
                        color: '#000',
                        anchor: 'end',
                        align: 'top',
                        clamp: true,
                        font: { weight: 'bold', size: 12 },
                        formatter: val => `R$ ${parseFloat(val).toLocaleString("pt-BR")}`,
                        listeners: false,
                        animation: { duration: 0 },
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
                        ticks: { callback: val => `R$ ${val}` }
                    },
                    x: { grid: { display: false } }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    // Função para atualizar texto que mostra os anos selecionados
    function atualizarTextoFiltro() {
        const container = document.querySelector(".filter-container");
        let texto;

        if (anosSelecionados.has("todos") || anosSelecionados.size === 0) {
            texto = "Anos selecionados: Todos";
        } else {
            texto = "Anos selecionados: " + Array.from(anosSelecionados).sort().join(", ");
        }

        let info = container.querySelector(".anos-selecionados-info");
        if (!info) {
            info = document.createElement("div");
            info.className = "anos-selecionados-info";
            info.style.marginTop = "5px";
            info.style.fontSize = "0.9em";
            container.appendChild(info);
        }
        info.textContent = texto;
    }

    // Função para atualizar tudo (KPIs e gráfico) com base no filtro e granularidade
    function atualizarDashboard() {
        const vendasFiltradas = filtrarVendasPorAnosSelecionados();
        const granularidade = select.value;

        atualizarKPI(vendasFiltradas);
        atualizarGrafico(granularidade, vendasFiltradas);
        atualizarTextoFiltro();
    }

    // Evento para filtro de ano simulando múltiplas seleções
    yearFilter.addEventListener("change", (e) => {
        const valor = e.target.value;

        if (valor === "todos") {
            anosSelecionados.clear();
            anosSelecionados.add("todos");
            yearFilter.value = "todos";
        } else {
            anosSelecionados.delete("todos");

            const anoNum = Number(valor);
            if (anosSelecionados.has(anoNum)) {
                anosSelecionados.delete(anoNum);
            } else {
                anosSelecionados.add(anoNum);
            }

            // Limpa a seleção para permitir re-seleção do mesmo ano
            yearFilter.value = "";
        }

        atualizarDashboard();
    });

    select.addEventListener("change", atualizarDashboard);

    toggleBtn.addEventListener("click", () => {
        dataLabelsVisible = !dataLabelsVisible;
        atualizarDashboard();

        toggleBtn.textContent = dataLabelsVisible
            ? "Ocultar Valores"
            : "Exibir Valores";
    });

    // Inicializa com todos dados
    atualizarDashboard();
});
