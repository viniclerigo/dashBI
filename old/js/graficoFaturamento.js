let dadosOriginal = [];

// Corrige blur do canvas em telas com DPI alto
function ajustarResolucaoCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;

    // Pega o tamanho visível do canvas no layout
    const largura = canvas.clientWidth;
    const altura = canvas.clientHeight;

    // Ajusta a resolução do canvas para o tamanho visível multiplicado pela densidade da tela
    canvas.width = Math.floor(largura * ratio);
    canvas.height = Math.floor(altura * ratio);

    // Ajusta a escala do contexto para ficar nítido
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

// Atualiza gráfico por ano selecionado
function atualizarGraficoPorAno(anoSelecionado) {
    const mesesOrdem = [
        "Janeiro", "Fevereiro", "Março", "Abril",
        "Maio", "Junho", "Julho", "Agosto",
        "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const dadosFiltrados = (anoSelecionado === "todos"
        ? dadosOriginal
        : dadosOriginal.filter(d => d.ano == anoSelecionado)
    ).sort((a, b) => {
        return mesesOrdem.indexOf(a.mes) - mesesOrdem.indexOf(b.mes);
    });

    const labels = dadosFiltrados.map(d => d.mes);
    const valores = dadosFiltrados.map(d => d.valor_total);

    const canvas = document.getElementById("graficoFaturamento");
    ajustarResolucaoCanvas(canvas); // Ajuste para nitidez

    const ctx = canvas.getContext("2d");

    if (window.graficoFaturamento instanceof Chart) {
        window.graficoFaturamento.destroy();
    }

    window.graficoFaturamento = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Faturamento por Mês",
                data: valores,
                borderColor: "#3498db",
                backgroundColor: "rgba(52, 152, 219, 0.2)",
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            layout: {
                padding: {
                    right: 40  // espaço extra para data labels
                }
            },
            plugins: {
                datalabels: {
                    display: true,
                    align: 'top',
                    formatter: value => `R$ ${value.toLocaleString('pt-BR')}`,
                    font: { weight: 'bold' },
                    color: '#2c3e50'
                },
                tooltip: {
                    enabled: true
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: valor => `R$ ${valor.toLocaleString('pt-BR')}`
                    },
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
