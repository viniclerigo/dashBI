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
                datalabels: {
                    display: true,
                    anchor: 'end',
                    align: 'top',
                    formatter: v => v.toLocaleString('pt-BR'),
                    color: '#2c3e50',
                    font: { weight: 'bold' }
                },
                tooltip: {
                    enabled: true
                }
            },
            scales: {
                y: { grid: { display: false } },
                x: { grid: { display: false } }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Carrega os dados e mantém a função de atualização disponível globalmente
fetch("./data/json/vendas_mensal.json")
    .then(res => res.json())
    .then(data => {
        dadosVendas = data;
        // Inicializa com todos os anos
        atualizarGraficoVendas("todos");
    });

// Torna a função global para ser chamada pelo init.js
window.atualizarGraficoVendas = atualizarGraficoVendas;
