let dadosVendas = [];

function atualizarGraficoVendas(anoSelecionado) {
    const mesesOrdem = [
        "Janeiro", "Fevereiro", "Março", "Abril",
        "Maio", "Junho", "Julho", "Agosto",
        "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const dadosFiltrados = (anoSelecionado === "todos"
        ? dadosVendas
        : dadosVendas.filter(d => d.ano == anoSelecionado)
    ).sort((a, b) => mesesOrdem.indexOf(a.mes) - mesesOrdem.indexOf(b.mes));

    const labels = dadosFiltrados.map(d => d.mes);
    const valores = dadosFiltrados.map(d => d.quantidade);

    const ctx = document.getElementById("graficoVendas").getContext("2d");
    if (window.graficoVendas instanceof Chart) {
        window.graficoVendas.destroy();
    }

    window.graficoVendas = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Vendas por Mês",
                data: valores,
                backgroundColor: "#2ecc71"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    enabled: true
                }
            }
        }
    });
}

fetch("./data/json/vendas_mensal.json")
    .then(res => res.json())
    .then(data => {
        dadosVendas = data;
        atualizarGraficoVendas("todos");
    });
