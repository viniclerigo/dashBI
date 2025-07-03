import { inicializarGraficoFaturamento, atualizarGraficoFaturamento, atualizarVisibilidadeDataLabels } from './graficoFaturamento.js';
import { inicializarGraficoClientes, atualizarGraficoClientes, atualizarVisibilidadeDataLabelsClientes } from './graficoClientes.js';
import { inicializarGraficoCanal, atualizarGraficoCanal, atualizarVisibilidadeDataLabelsCanal } from './graficoCanal.js';

document.addEventListener("DOMContentLoaded", async () => {
    let dataLabelsVisible = true;

    const ctxFaturamento = document.getElementById("faturamento-chart").getContext("2d");
    const select = document.getElementById("granularity-select");
    const toggleBtn = document.getElementById("toggle-datalabels");
    const yearFilter = document.getElementById("year-filter");

    const vendas = await fetch("../data/vendas.json").then(res => res.json());
    const clientes = await fetch("../data/cli_master.json").then(res => res.json());

    function parseDataLocal(dateString) {
        const [ano, mes, dia] = dateString.split("T")[0].split("-").map(Number);
        return new Date(ano, mes - 1, dia);
    }

    const anos = Array.from(new Set(vendas.map(v => parseDataLocal(v.data_venda).getFullYear()))).sort();
    yearFilter.innerHTML = `<option value="todos">Todos</option>` + anos.map(ano => `<option value="${ano}">${ano}</option>`).join("");

    const anosSelecionados = new Set(["todos"]);

    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const filterContainer = document.querySelector('.filter-container');
    const selectedYearsText = document.createElement('div');
    selectedYearsText.style.marginTop = '8px';
    selectedYearsText.style.fontWeight = 'bold';
    selectedYearsText.style.color = '#444';
    filterContainer.appendChild(selectedYearsText);

    function filtrarVendas() {
        if (anosSelecionados.has("todos")) return vendas.map(v => ({
            ...v,
            data_venda: parseDataLocal(v.data_venda)
        }));
        return vendas
            .map(v => ({ ...v, data_venda: parseDataLocal(v.data_venda) }))
            .filter(v => anosSelecionados.has(v.data_venda.getFullYear()));
    }

    function filtrarClientes() {
        if (anosSelecionados.has("todos")) return clientes.map(c => ({
            ...c,
            data_cadastro: parseDataLocal(c.data_cadastro)
        }));
        return clientes
            .map(c => ({ ...c, data_cadastro: parseDataLocal(c.data_cadastro) }))
            .filter(c => anosSelecionados.has(c.data_cadastro.getFullYear()));
    }

    function agrupar(vendasFiltradas, granularidade) {
        const agrupado = {};
        vendasFiltradas.forEach(venda => {
            const data = venda.data_venda;
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
            agrupado[chave] = (agrupado[chave] || 0) + venda.total;
        });

        if (granularidade === "mes") {
            const labels = meses;
            const valores = meses.map((_, i) => (agrupado[i] || 0).toFixed(2));
            return { labels, valores };
        } else {
            return Object.entries(agrupado)
                .sort()
                .reduce((acc, [k, v]) => {
                    acc.labels.push(k);
                    acc.valores.push(v.toFixed(2));
                    return acc;
                }, { labels: [], valores: [] });
        }
    }

    const chart = inicializarGraficoFaturamento(ctxFaturamento);
    const ctxClientes = document.getElementById("clientes-chart").getContext("2d");
    const granularidadeClientesSelect = document.getElementById("granularity-clientes");
    const chartClientes = inicializarGraficoClientes(ctxClientes);

    // === GRÁFICO DE RANKING POR CANAL DE AQUISIÇÃO ===
    const ctxCanal = document.getElementById("ranking1-chart-canvas").getContext("2d");
    const chartCanal = inicializarGraficoCanal(ctxCanal);

    function atualizarTextoAnosSelecionados() {
        const selectedText = [...anosSelecionados]
            .filter(ano => ano !== "todos")
            .sort()
            .join(", ");

        if (anosSelecionados.has("todos") || selectedText === "") {
            selectedYearsText.textContent = "Todos os anos selecionados";
        } else {
            selectedYearsText.textContent = `Ano(s) selecionado(s): ${selectedText}`;
        }
    }

    function atualizarDashboard() {
        const vendasFiltradas = filtrarVendas();
        const granularidade = select.value;
        const { labels, valores } = agrupar(vendasFiltradas, granularidade);
        atualizarGraficoFaturamento(chart, labels, valores);

        const total = vendasFiltradas.reduce((acc, v) => acc + v.total, 0);
        const numeroVendas = vendasFiltradas.length;
        const ticketMedio = numeroVendas > 0 ? total / numeroVendas : 0;

        document.querySelector("#kpi-faturamento-total .kpi-value").textContent =
            `R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

        document.querySelector("#kpi-ticket-medio .kpi-value").textContent =
            `R$ ${ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

        document.querySelector("#kpi-quantidade-vendas .kpi-value").textContent =
            `${numeroVendas.toLocaleString("pt-BR")}`;

        document.querySelector("#kpi-maior-venda .kpi-value").textContent =
            `R$ ${Math.max(...vendasFiltradas.map(v => v.total)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

        const canais = {};
        vendasFiltradas.forEach(v => {
            canais[v.canal_aquisicao] = (canais[v.canal_aquisicao] || 0) + v.total;
        });

        const canalMaisVendas = Object.entries(canais).reduce((maior, atual) =>
            atual[1] > maior[1] ? atual : maior, ["", 0])[0];

        document.querySelector("#kpi-canal-aquisicao .kpi-value").textContent = canalMaisVendas || "N/A";

        // === Atualizar gráfico de canal ===
        const canaisOrdenados = Object.entries(canais).sort((a, b) => b[1] - a[1]);
        const labelsCanal = canaisOrdenados.map(([canal]) => canal);
        const valoresCanal = canaisOrdenados.map(([, valor]) => valor.toFixed(2));

        chartCanal.data.labels = labelsCanal;
        chartCanal.data.datasets[0].data = valoresCanal;
        chartCanal.update();

        const clientesFiltrados = filtrarClientes();
        const granularidadeClientes = granularidadeClientesSelect.value;
        atualizarGraficoClientes(chartClientes, clientesFiltrados, granularidadeClientes);

        atualizarTextoAnosSelecionados();
        yearFilter.options[0].textContent = "Todos";
    }

    yearFilter.addEventListener("change", e => {
        const val = e.target.value;
        if (val === "todos") {
            anosSelecionados.clear();
            anosSelecionados.add("todos");
            yearFilter.value = "todos";
        } else {
            anosSelecionados.delete("todos");
            const ano = parseInt(val);
            anosSelecionados.has(ano) ? anosSelecionados.delete(ano) : anosSelecionados.add(ano);
            yearFilter.value = "";
        }
        atualizarDashboard();
    });

    select.addEventListener("change", atualizarDashboard);
    granularidadeClientesSelect.addEventListener("change", atualizarDashboard);

    toggleBtn.addEventListener("click", () => {
        dataLabelsVisible = !dataLabelsVisible;
        window.dataLabelsVisible = dataLabelsVisible;

        atualizarVisibilidadeDataLabels(dataLabelsVisible);
        atualizarVisibilidadeDataLabelsClientes(dataLabelsVisible);
        atualizarVisibilidadeDataLabelsCanal(dataLabelsVisible);

        toggleBtn.textContent = dataLabelsVisible ? "Ocultar Valores" : "Exibir Valores";
    });

    window.dataLabelsVisible = dataLabelsVisible;

    atualizarDashboard();
});
