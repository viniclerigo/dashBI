document.addEventListener("DOMContentLoaded", async () => {
    const ctx = document.getElementById("faturamento-chart").getContext("2d");
    const ctxClientes = document.getElementById("clientes-chart").getContext("2d"); // novo gráfico
    const select = document.getElementById("granularity-select");
    const selectClientes = document.getElementById("granularity-clientes");
    const toggleBtn = document.getElementById("toggle-datalabels");
    const yearFilter = document.getElementById("year-filter");

    const vendas = await fetch("data/vendas.json").then(res => res.json());
    const clientes = await fetch("data/cli_master.json").then(res => res.json()); // nova base

    // Extrair anos únicos das vendas
    const anos = Array.from(new Set(vendas.map(v => new Date(v.data_venda).getFullYear())))
        .sort((a, b) => a - b);

    // Popular o filtro de anos, adicionando opção "Todos"
    yearFilter.innerHTML = `<option value="todos">Todos</option>` +
        anos.map(ano => `<option value="${ano}">${ano}</option>`).join("");

    const anosSelecionados = new Set();
    anosSelecionados.add("todos");

    function filtrarVendasPorAnosSelecionados() {
        if (anosSelecionados.has("todos") || anosSelecionados.size === 0) return vendas;
        return vendas.filter(v => anosSelecionados.has(new Date(v.data_venda).getFullYear()));
    }

    function atualizarKPI(vendasFiltradas) {
        const totalFaturamento = vendasFiltradas.reduce((acc, venda) => acc + venda.total, 0);
        document.querySelector("#kpi-faturamento-total .kpi-value").textContent =
            `R$ ${totalFaturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    }

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

    function agruparClientes(granularidade) {
        const agrupado = {};

        clientes.forEach(cliente => {
            const data = new Date(cliente.data_cadastro);
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

            agrupado[chave] = (agrupado[chave] || 0) + 1;
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
                values.push(agrupado[i] || 0);
            }
            return { labels, values };
        } else {
            return Object.entries(agrupado)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .reduce((acc, [k, v]) => {
                    acc.labels.push(k);
                    acc.values.push(v);
                    return acc;
                }, { labels: [], values: [] });
        }
    }

    let chart;
    let chartClientes;
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
                        formatter: val => `R$ ${parseFloat(val).toLocaleString("pt-BR")}`
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

    function atualizarGraficoClientes(granularidade) {
        const { labels, values } = agruparClientes(granularidade);

        if (chartClientes) chartClientes.destroy();

        chartClientes = new Chart(ctxClientes, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Novos Clientes",
                    data: values,
                    backgroundColor: "#66bb6a"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { top: 50, bottom: 10, left: 10, right: 10 } },
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        display: dataLabelsVisible,
                        color: '#000',
                        anchor: 'end',
                        align: 'top',
                        font: { weight: 'bold', size: 12 },
                        formatter: val => `${val} clientes`
                    }
                },
                scales: {
                    y: {
                        grid: { display: false },
                        beginAtZero: true,
                        ticks: { callback: val => `${val}` }
                    },
                    x: { grid: { display: false } }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

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

    function atualizarDashboard() {
        const vendasFiltradas = filtrarVendasPorAnosSelecionados();
        const granularidadeVendas = select.value;
        const granularidadeClientes = selectClientes.value;

        atualizarKPI(vendasFiltradas);
        atualizarGrafico(granularidadeVendas, vendasFiltradas);
        atualizarGraficoClientes(granularidadeClientes);
        atualizarTextoFiltro();
    }

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

            yearFilter.value = "";
        }

        atualizarDashboard();
    });

    select.addEventListener("change", atualizarDashboard);
    selectClientes.addEventListener("change", atualizarDashboard);

    toggleBtn.addEventListener("click", () => {
        dataLabelsVisible = !dataLabelsVisible;
        atualizarDashboard();

        toggleBtn.textContent = dataLabelsVisible
            ? "Ocultar Valores"
            : "Exibir Valores";
    });

    atualizarDashboard();
});
