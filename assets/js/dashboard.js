import { inicializarGraficoFaturamento, atualizarGraficoFaturamento, toggleValores } from './graficoFaturamento.js';
import { inicializarGraficoClientes, atualizarGraficoClientes } from './graficoClientes.js';

document.addEventListener("DOMContentLoaded", async () => {
    // === GRÁFICO DE FATURAMENTO ===
    const ctxFaturamento = document.getElementById("faturamento-chart").getContext("2d");
    const select = document.getElementById("granularity-select");
    const toggleBtn = document.getElementById("toggle-datalabels");
    const yearFilter = document.getElementById("year-filter");

    const vendas = await fetch("../data/vendas.json").then(res => res.json());
    const clientes = await fetch("../data/cli_master.json").then(res => res.json());

    // Parse de datas sem considerar fuso
    function parseDataLocal(dateString) {
        const [ano, mes, dia] = dateString.split("T")[0].split("-").map(Number);
        return new Date(ano, mes - 1, dia);
    }

    // Corrigir ano usando parseDataLocal
    const anos = Array.from(new Set(vendas.map(v => parseDataLocal(v.data_venda).getFullYear()))).sort();
    yearFilter.innerHTML = `<option value="todos">Todos</option>` + anos.map(ano => `<option value="${ano}">${ano}</option>`).join("");

    const anosSelecionados = new Set(["todos"]);

    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // Criação do elemento dinâmico para mostrar os anos selecionados (logo abaixo do filtro)
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
        // Faturamento
        const vendasFiltradas = filtrarVendas();
        const granularidade = select.value;
        const { labels, valores } = agrupar(vendasFiltradas, granularidade);
        atualizarGraficoFaturamento(chart, labels, valores);

        const total = vendasFiltradas.reduce((acc, v) => acc + v.total, 0);
        document.querySelector("#kpi-faturamento-total .kpi-value").textContent =
            `R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

        // Clientes
        const clientesFiltrados = filtrarClientes();
        const granularidadeClientes = granularidadeClientesSelect.value;
        atualizarGraficoClientes(chartClientes, clientesFiltrados, granularidadeClientes);

        // Atualiza o texto dos anos selecionados na DIV criada
        atualizarTextoAnosSelecionados();

        // Mantém o option 'todos' fixo
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
        const visible = toggleValores(chart);
        toggleBtn.textContent = visible ? "Ocultar Valores" : "Exibir Valores";
    });

    atualizarDashboard();
});
